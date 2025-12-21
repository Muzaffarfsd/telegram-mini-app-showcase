// ============================================================================
// EXPERIMENTS — A/B/N Тестирование с взвешенным распределением
// ============================================================================

import WebApp from '@twa-dev/sdk';
import { analytics } from './analytics';

// === ТИПЫ ===
export interface Experiment {
  id: string;
  name: string;
  description?: string;
  variants: string[];
  weights: number[];  // Сумма должна = 1
  active: boolean;
}

export interface ExperimentAssignment {
  experimentId: string;
  variant: string;
  assignedAt: number;
}

// === КОНФИГУРАЦИЯ ЭКСПЕРИМЕНТОВ ===
export const EXPERIMENTS: Experiment[] = [
  {
    id: 'homepage_cta',
    name: 'Кнопка на главной',
    description: 'Тестируем разные CTA на главной странице',
    variants: ['control', 'variant_a', 'variant_b'],
    weights: [0.34, 0.33, 0.33],
    active: true,
  },
  {
    id: 'onboarding_steps',
    name: 'Количество шагов онбординга',
    description: 'Сравниваем 5 шагов vs 3 шага',
    variants: ['5_steps', '3_steps'],
    weights: [0.5, 0.5],
    active: true,
  },
  {
    id: 'demo_card_layout',
    name: 'Дизайн карточек демо',
    description: 'Grid vs List layout',
    variants: ['grid', 'list'],
    weights: [0.5, 0.5],
    active: false,
  },
  {
    id: 'referral_reward',
    name: 'Размер реферального бонуса',
    description: 'Тестируем разные размеры бонуса',
    variants: ['50_coins', '100_coins', '150_coins'],
    weights: [0.33, 0.34, 0.33],
    active: false,
  },
];

// === ДЕТЕРМИНИРОВАННЫЙ HASH ===
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function getUserBucket(userId: string, experimentId: string): number {
  return hashString(`${userId}:${experimentId}`) % 100;
}

function assignVariantByBucket(experiment: Experiment, bucket: number): string {
  let cumulative = 0;
  for (let i = 0; i < experiment.variants.length; i++) {
    cumulative += experiment.weights[i] * 100;
    if (bucket < cumulative) {
      return experiment.variants[i];
    }
  }
  return experiment.variants[0];
}

// === STORAGE ===
const STORAGE_KEY = 'experiments_assignments';

function getAssignments(): Record<string, ExperimentAssignment> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveAssignment(assignment: ExperimentAssignment): void {
  try {
    const assignments = getAssignments();
    assignments[assignment.experimentId] = assignment;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
  } catch {
    // localStorage not available
  }
}

// === USER ID ===
function getUserId(): string {
  try {
    if (WebApp?.initDataUnsafe?.user?.id) {
      return String(WebApp.initDataUnsafe.user.id);
    }
  } catch {
    // Not in Telegram
  }
  
  let anonId = localStorage.getItem('anonymous_experiment_id');
  if (!anonId) {
    anonId = `anon-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    localStorage.setItem('anonymous_experiment_id', anonId);
  }
  return anonId;
}

// === ГЛАВНЫЕ ФУНКЦИИ ===
export function getExperiment(experimentId: string): Experiment | null {
  return EXPERIMENTS.find(e => e.id === experimentId) || null;
}

export function getVariant(experimentId: string): string | null {
  const experiment = getExperiment(experimentId);
  
  if (!experiment || !experiment.active) {
    return null;
  }
  
  const assignments = getAssignments();
  const existing = assignments[experimentId];
  
  if (existing) {
    return existing.variant;
  }
  
  const userId = getUserId();
  const bucket = getUserBucket(userId, experimentId);
  const variant = assignVariantByBucket(experiment, bucket);
  
  saveAssignment({
    experimentId,
    variant,
    assignedAt: Date.now(),
  });
  
  analytics.track('experiment', 'assign', experimentId, undefined, {
    variant,
    bucket,
    userId: userId.startsWith('anon-') ? 'anonymous' : userId,
  });
  
  return variant;
}

export function trackExposure(experimentId: string): void {
  const variant = getVariant(experimentId);
  if (variant) {
    analytics.track('experiment', 'exposure', experimentId, undefined, { variant });
  }
}

export function trackConversion(experimentId: string, conversionType?: string): void {
  const variant = getVariant(experimentId);
  if (variant) {
    analytics.track('experiment', 'conversion', experimentId, undefined, {
      variant,
      conversionType: conversionType || 'default',
    });
  }
}

// === REACT HOOK ===
import { useState, useEffect, useCallback, useRef } from 'react';

interface UseExperimentResult {
  variant: string | null;
  isLoading: boolean;
  isActive: boolean;
  trackConversion: (conversionType?: string) => void;
}

export function useExperiment(experimentId: string): UseExperimentResult {
  const [variant, setVariant] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasTrackedExposure = useRef(false);
  
  const experiment = getExperiment(experimentId);
  const isActive = experiment?.active ?? false;

  useEffect(() => {
    const v = getVariant(experimentId);
    setVariant(v);
    setIsLoading(false);
    
    if (v && !hasTrackedExposure.current) {
      trackExposure(experimentId);
      hasTrackedExposure.current = true;
    }
  }, [experimentId]);

  const handleConversion = useCallback((conversionType?: string) => {
    trackConversion(experimentId, conversionType);
  }, [experimentId]);

  return {
    variant,
    isLoading,
    isActive,
    trackConversion: handleConversion,
  };
}

// === УТИЛИТЫ ===
export function getActiveExperiments(): Experiment[] {
  return EXPERIMENTS.filter(e => e.active);
}

export function getAllAssignments(): Record<string, ExperimentAssignment> {
  return getAssignments();
}

export function clearAssignments(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('anonymous_experiment_id');
  } catch {
    // ignore
  }
}

// === FEATURE FLAGS (упрощённый A/B) ===
export function isFeatureEnabled(featureId: string): boolean {
  const variant = getVariant(featureId);
  return variant !== null && variant !== 'control' && variant !== 'off';
}
