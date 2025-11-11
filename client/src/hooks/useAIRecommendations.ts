import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface UserProfile {
  interests: string[];
  businessType?: string;
  browsingHistory: string[];
  interactions: {
    appId: string;
    action: 'view' | 'click' | 'favorite';
    timestamp: number;
  }[];
}

interface AIRecommendation {
  appId: string;
  score: number;
  reason: string;
}

export interface AIRecommendations {
  personalizedApps: AIRecommendation[];
  suggestedFeatures: string[];
  searchSuggestions: string[];
  loading: boolean;
}

export function useAIRecommendations(): AIRecommendations {
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const stored = localStorage.getItem('ai_user_profile');
      return stored ? JSON.parse(stored) : {
        interests: [],
        browsingHistory: [],
        interactions: []
      };
    } catch {
      return {
        interests: [],
        browsingHistory: [],
        interactions: []
      };
    }
  });

  // Listen for profile updates
  useEffect(() => {
    const handleProfileUpdate = () => {
      try {
        const stored = localStorage.getItem('ai_user_profile');
        if (stored) {
          setUserProfile(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Failed to load AI profile:', error);
      }
    };

    window.addEventListener('ai_profile_update', handleProfileUpdate);
    window.addEventListener('storage', handleProfileUpdate);

    return () => {
      window.removeEventListener('ai_profile_update', handleProfileUpdate);
      window.removeEventListener('storage', handleProfileUpdate);
    };
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['/api/ai/recommendations', userProfile],
    enabled: false, // Client-side only for now
  });

  // Client-side AI recommendation algorithm
  const generateRecommendations = (): AIRecommendation[] => {
    const { interactions, browsingHistory, interests } = userProfile;
    
    // Simple scoring algorithm based on user behavior
    const appScores = new Map<string, number>();
    
    // Score based on interactions
    interactions.forEach(({ appId, action }) => {
      const currentScore = appScores.get(appId) || 0;
      const actionWeight = action === 'favorite' ? 3 : action === 'click' ? 2 : 1;
      appScores.set(appId, currentScore + actionWeight);
    });
    
    // Score based on browsing history
    browsingHistory.forEach((appId) => {
      const currentScore = appScores.get(appId) || 0;
      appScores.set(appId, currentScore + 1);
    });
    
    // Convert to array and sort by score
    const recommendations = Array.from(appScores.entries())
      .map(([appId, score]) => ({
        appId,
        score,
        reason: score > 5 ? 'Часто просматриваете' : 'Может вам понравиться'
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    
    return recommendations;
  };

  const generateSearchSuggestions = (): string[] => {
    const { interests, browsingHistory } = userProfile;
    
    // Combine interests and recent history for suggestions
    const suggestions = new Set<string>();
    
    interests.forEach(interest => suggestions.add(interest));
    
    // Add category-based suggestions
    if (browsingHistory.some(id => id.includes('restaurant'))) {
      suggestions.add('ресторан');
      suggestions.add('доставка еды');
    }
    if (browsingHistory.some(id => id.includes('fitness'))) {
      suggestions.add('фитнес');
      suggestions.add('тренировки');
    }
    if (browsingHistory.some(id => id.includes('store'))) {
      suggestions.add('магазин');
      suggestions.add('одежда');
    }
    
    return Array.from(suggestions).slice(0, 5);
  };

  return {
    personalizedApps: generateRecommendations(),
    suggestedFeatures: ['Персонализация', 'AI помощник', 'Умный поиск'],
    searchSuggestions: generateSearchSuggestions(),
    loading: isLoading
  };
}

// Hook to track user interactions
export function useTrackInteraction() {
  return (appId: string, action: 'view' | 'click' | 'favorite') => {
    try {
      const stored = localStorage.getItem('ai_user_profile');
      const profile: UserProfile = stored ? JSON.parse(stored) : {
        interests: [],
        browsingHistory: [],
        interactions: []
      };
      
      // Add interaction
      profile.interactions.push({
        appId,
        action,
        timestamp: Date.now()
      });
      
      // Update browsing history
      if (!profile.browsingHistory.includes(appId)) {
        profile.browsingHistory.push(appId);
      }
      
      // Keep only last 50 interactions
      if (profile.interactions.length > 50) {
        profile.interactions = profile.interactions.slice(-50);
      }
      
      // Keep only last 20 items in history
      if (profile.browsingHistory.length > 20) {
        profile.browsingHistory = profile.browsingHistory.slice(-20);
      }
      
      localStorage.setItem('ai_user_profile', JSON.stringify(profile));
      
      // Emit custom event to trigger re-renders
      window.dispatchEvent(new CustomEvent('ai_profile_update'));
    } catch (error) {
      console.error('Failed to track interaction:', error);
    }
  };
}
