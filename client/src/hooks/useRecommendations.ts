import { useState, useEffect, useCallback } from 'react';

interface UserBehavior {
  viewedDemos: string[];
  categoryPreferences: Record<string, number>;
  lastVisit: number;
  sessionCount: number;
}

interface RecommendationScore {
  id: string;
  score: number;
  reasons: string[];
}

const BEHAVIOR_KEY = 'web4tg_user_behavior';

// AI-powered recommendation algorithm
function calculateRecommendationScore(
  demo: any,
  behavior: UserBehavior
): RecommendationScore {
  let score = 0;
  const reasons: string[] = [];

  // 1. Category preference (40% weight)
  const categoryScore = behavior.categoryPreferences[demo.category] || 0;
  score += categoryScore * 0.4;
  if (categoryScore > 2) {
    reasons.push(`You frequently browse ${demo.category}`);
  }

  // 2. Recency bias - boost newer demos (20% weight)
  const demoIndex = parseInt(demo.id.split('-')[1] || '0');
  const recencyScore = Math.max(0, 30 - demoIndex) / 30;
  score += recencyScore * 0.2;

  // 3. Diversity bonus - recommend unviewed categories (20% weight)
  const isNewCategory = !behavior.viewedDemos.some(viewedId => {
    const viewedCategory = viewedId.split('-')[0];
    return viewedCategory === demo.category.toLowerCase().split(' ')[0];
  });
  if (isNewCategory) {
    score += 0.2;
    reasons.push('New category for you to explore');
  }

  // 4. Popularity boost for new users (10% weight)
  if (behavior.sessionCount < 3) {
    const popularDemos = ['clothing-store', 'electronics', 'beauty', 'fitness'];
    if (popularDemos.includes(demo.id)) {
      score += 0.1;
      reasons.push('Popular choice');
    }
  }

  // 5. Time-based patterns (10% weight)
  const now = Date.now();
  const hoursSinceLastVisit = (now - behavior.lastVisit) / (1000 * 60 * 60);
  if (hoursSinceLastVisit > 24) {
    score += 0.1;
    reasons.push('Recommended based on your return');
  }

  return {
    id: demo.id,
    score: Math.min(score, 1),
    reasons
  };
}

export function useRecommendations(demoApps: any[]) {
  const [behavior, setBehavior] = useState<UserBehavior>(() => {
    const stored = localStorage.getItem(BEHAVIOR_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      viewedDemos: [],
      categoryPreferences: {},
      lastVisit: Date.now(),
      sessionCount: 1
    };
  });

  const [recommendations, setRecommendations] = useState<RecommendationScore[]>([]);

  // Track demo view (stable reference)
  const trackDemoView = useCallback((demoId: string, category: string) => {
    // Update localStorage directly to avoid triggering re-renders
    const stored = localStorage.getItem(BEHAVIOR_KEY);
    if (stored) {
      const current = JSON.parse(stored);
      const newBehavior = {
        ...current,
        viewedDemos: [...new Set([...current.viewedDemos, demoId])],
        categoryPreferences: {
          ...current.categoryPreferences,
          [category]: (current.categoryPreferences[category] || 0) + 1
        },
        lastVisit: Date.now()
      };
      localStorage.setItem(BEHAVIOR_KEY, JSON.stringify(newBehavior));
      // Only update state after localStorage is updated
      setBehavior(newBehavior);
    }
  }, []);

  // Update session count on mount (only once)
  useEffect(() => {
    const updateSession = () => {
      const stored = localStorage.getItem(BEHAVIOR_KEY);
      if (stored) {
        const current = JSON.parse(stored);
        const newBehavior = {
          ...current,
          sessionCount: current.sessionCount + 1,
          lastVisit: Date.now()
        };
        localStorage.setItem(BEHAVIOR_KEY, JSON.stringify(newBehavior));
      }
    };
    updateSession();
  }, []);

  // Calculate recommendations
  useEffect(() => {
    if (!demoApps || demoApps.length === 0) return;

    const scored = demoApps
      .map(demo => calculateRecommendationScore(demo, behavior))
      .sort((a, b) => b.score - a.score);

    setRecommendations(scored);
  }, [demoApps, behavior]);

  // Get top N recommendations
  const getTopRecommendations = useCallback((count: number = 6) => {
    return recommendations.slice(0, count);
  }, [recommendations]);

  // Get personalized greeting
  const getPersonalizedGreeting = useCallback(() => {
    const { sessionCount, categoryPreferences } = behavior;
    
    if (sessionCount === 1) {
      return "Welcome! Explore our demo apps";
    }
    
    if (sessionCount < 5) {
      return "Welcome back! Continue exploring";
    }

    const topCategory = Object.entries(categoryPreferences)
      .sort(([, a], [, b]) => b - a)[0]?.[0];

    if (topCategory) {
      return `We found more ${topCategory} apps for you`;
    }

    return "Your personalized recommendations";
  }, [behavior]);

  return {
    recommendations,
    trackDemoView,
    getTopRecommendations,
    getPersonalizedGreeting,
    behavior
  };
}
