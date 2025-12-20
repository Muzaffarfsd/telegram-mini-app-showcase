import { useEffect, useRef, useCallback } from 'react';
import {
  EXPERIMENTS,
  ExperimentName,
  Variant,
  getVariant,
  trackExposure,
  trackConversion as trackConversionEvent,
} from '@/lib/abTesting';

interface UseABTestResult {
  variant: Variant;
  isVariantA: boolean;
  isVariantB: boolean;
  trackConversion: () => void;
}

export function useABTest(experiment: ExperimentName): UseABTestResult {
  const variant = getVariant(experiment);
  const hasTrackedExposure = useRef(false);

  useEffect(() => {
    if (!hasTrackedExposure.current) {
      trackExposure(experiment, variant);
      hasTrackedExposure.current = true;
    }
  }, [experiment, variant]);

  const trackConversion = useCallback(() => {
    trackConversionEvent(experiment, variant);
  }, [experiment, variant]);

  return {
    variant,
    isVariantA: variant === 'A',
    isVariantB: variant === 'B',
    trackConversion,
  };
}

export { EXPERIMENTS };
export type { ExperimentName, Variant };
