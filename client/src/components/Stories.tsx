import { memo, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Plus, Eye, Share2, Heart, Flame, HandMetal, Sparkles, Rocket } from 'lucide-react';
import { useHaptic } from '@/hooks/useHaptic';
import { useLanguage } from '@/contexts/LanguageContext';
import { CreateStoryModal } from './CreateStoryModal';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export interface Story {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  video?: string;
  demoId: string;
  color?: string;
  viewCount?: number;
  likesCount?: number;
  fireCount?: number;
  clapCount?: number;
  heartEyesCount?: number;
  rocketCount?: number;
  hashtags?: string[];
  location?: string;
  linkedDemoId?: string;
}

const reactionConfig = [
  { type: 'like', icon: Heart, label: 'Like', color: 'text-pink-500', bgColor: 'bg-pink-500/20' },
  { type: 'fire', icon: Flame, label: 'Fire', color: 'text-orange-500', bgColor: 'bg-orange-500/20' },
  { type: 'clap', icon: HandMetal, label: 'Clap', color: 'text-yellow-500', bgColor: 'bg-yellow-500/20' },
  { type: 'heart_eyes', icon: Sparkles, label: 'Love', color: 'text-purple-500', bgColor: 'bg-purple-500/20' },
  { type: 'rocket', icon: Rocket, label: 'Rocket', color: 'text-blue-500', bgColor: 'bg-blue-500/20' },
] as const;

interface ReactionCounts {
  like: number;
  fire: number;
  clap: number;
  heart_eyes: number;
  rocket: number;
}

const StoryReactions = memo(({ storyId }: { storyId: string }) => {
  const haptic = useHaptic();
  const queryClient = useQueryClient();
  const [animatingReaction, setAnimatingReaction] = useState<string | null>(null);

  const { data: reactionData, isLoading, isError } = useQuery<{ counts: ReactionCounts; userReactions: string[] }>({
    queryKey: [`/api/user-stories/${storyId}/reactions`],
    staleTime: 30000,
  });

  const queryKey = `/api/user-stories/${storyId}/reactions`;
  
  const reactionMutation = useMutation({
    mutationFn: async (reactionType: string) => {
      const res = await apiRequest('POST', `/api/user-stories/${storyId}/reactions`, { reactionType });
      return res.json();
    },
    onMutate: async (reactionType) => {
      await queryClient.cancelQueries({ queryKey: [queryKey] });
      
      const prev = queryClient.getQueryData<{ counts: ReactionCounts; userReactions: string[] }>([queryKey]);
      
      if (prev) {
        const isRemoving = prev.userReactions.includes(reactionType);
        queryClient.setQueryData([queryKey], {
          counts: {
            ...prev.counts,
            [reactionType]: Math.max(0, prev.counts[reactionType as keyof ReactionCounts] + (isRemoving ? -1 : 1)),
          },
          userReactions: isRemoving 
            ? prev.userReactions.filter(r => r !== reactionType)
            : [...prev.userReactions, reactionType],
        });
      }
      return { prev };
    },
    onError: (_, __, context) => {
      if (context?.prev) {
        queryClient.setQueryData([queryKey], context.prev);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
  });

  const handleReaction = useCallback((type: string) => {
    haptic.medium();
    setAnimatingReaction(type);
    reactionMutation.mutate(type);
    setTimeout(() => setAnimatingReaction(null), 300);
  }, [haptic, reactionMutation]);

  const userReactions = reactionData?.userReactions || [];
  const counts = reactionData?.counts || { like: 0, fire: 0, clap: 0, heart_eyes: 0, rocket: 0 };

  if (isLoading) {
    return (
      <div className="flex items-center gap-1.5">
        {reactionConfig.map(({ type }) => (
          <div key={type} className="w-10 h-8 rounded-full bg-white/10 animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError) {
    return null;
  }

  return (
    <div className="flex items-center gap-1.5" data-testid="story-reactions-container">
      {reactionConfig.map(({ type, icon: Icon, color, bgColor }) => {
        const isActive = userReactions.includes(type);
        const isAnimating = animatingReaction === type;
        const count = counts[type as keyof ReactionCounts] || 0;
        
        return (
          <button
            key={type}
            data-testid={`button-reaction-${type}`}
            onClick={(e) => { e.stopPropagation(); handleReaction(type); }}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full transition-all duration-200 ${
              isActive ? bgColor : 'bg-white/10'
            } ${isAnimating ? 'scale-110' : 'scale-100'} active:scale-90`}
          >
            <Icon className={`w-4 h-4 transition-colors ${isActive ? color : 'text-white/70'}`} fill={isActive ? 'currentColor' : 'none'} />
            {count > 0 && <span className={`text-xs font-medium ${isActive ? color : 'text-white/70'}`} data-testid={`text-reaction-count-${type}`}>{count}</span>}
          </button>
        );
      })}
    </div>
  );
});
StoryReactions.displayName = 'StoryReactions';

interface StoriesProps {
  stories: Story[];
  onOpenDemo: (demoId: string) => void;
}

const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

const StoryAvatar = memo(({ story, onClick }: { story: Story; onClick: () => void }) => {
  return (
    <button
      data-testid={`button-story-avatar-${story.id}`}
      onClick={onClick}
      className="flex-shrink-0 flex flex-col items-center gap-2 group cursor-pointer touch-manipulation"
    >
      <div className="relative p-[3px] rounded-full bg-gradient-to-tr from-system-blue via-system-purple to-system-pink active:scale-90 transition-transform duration-150 will-change-transform">
        <div className="w-16 h-16 rounded-full border-2 border-background overflow-hidden bg-surface-elevated">
          <img 
            src={story.image} 
            alt={story.title} 
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
      <span 
        className="text-[11px] text-label-secondary font-semibold max-w-[72px] truncate"
        style={{ fontFamily: 'Montserrat, sans-serif' }}
      >
        {story.title}
      </span>
    </button>
  );
});
StoryAvatar.displayName = 'StoryAvatar';

const AddStoryButton = memo(({ onClick }: { onClick: () => void }) => {
  const { language } = useLanguage();
  const haptic = useHaptic();
  
  return (
    <button
      data-testid="button-add-story"
      onClick={() => {
        haptic.medium();
        onClick();
      }}
      className="flex-shrink-0 flex flex-col items-center gap-2 group cursor-pointer touch-manipulation"
    >
      <div className="relative p-[3px] rounded-full bg-gradient-to-tr from-system-blue/30 via-system-purple/30 to-system-pink/30 active:scale-90 transition-transform duration-150 will-change-transform">
        <div className="w-16 h-16 rounded-full border-2 border-dashed border-separator bg-fill-tertiary/50 flex items-center justify-center">
          <Plus className="w-6 h-6 text-label-secondary" />
        </div>
      </div>
      <span 
        className="text-[11px] text-label-secondary font-semibold"
        style={{ fontFamily: 'Montserrat, sans-serif' }}
      >
        {language === 'ru' ? 'Создать' : 'Create'}
      </span>
    </button>
  );
});
AddStoryButton.displayName = 'AddStoryButton';

const ProgressBar = memo(({ 
  isActive, 
  isCompleted, 
  duration,
  isPaused 
}: { 
  isActive: boolean; 
  isCompleted: boolean; 
  duration: number;
  isPaused: boolean;
}) => {
  const progressRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!progressRef.current) return;
    
    if (isActive && !isPaused) {
      progressRef.current.style.transition = `width ${duration}ms linear`;
      progressRef.current.style.width = '100%';
    } else if (isCompleted) {
      progressRef.current.style.transition = 'none';
      progressRef.current.style.width = '100%';
    } else {
      progressRef.current.style.transition = 'none';
      progressRef.current.style.width = '0%';
    }
  }, [isActive, isCompleted, duration, isPaused]);
  
  return (
    <div className="h-0.5 flex-1 bg-white/20 rounded-full overflow-hidden">
      <div 
        ref={progressRef}
        className="h-full bg-white rounded-full will-change-[width]"
        style={{ width: isCompleted ? '100%' : '0%' }}
      />
    </div>
  );
});
ProgressBar.displayName = 'ProgressBar';

const StoryViewer = memo(({ 
  story, 
  stories,
  activeIndex,
  onClose, 
  onNext, 
  onPrev,
  onOpenDemo,
  isPaused,
  setIsPaused
}: { 
  story: Story;
  stories: Story[];
  activeIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onOpenDemo: (demoId: string) => void;
  isPaused: boolean;
  setIsPaused: (v: boolean) => void;
}) => {
  const duration = story.video ? 10000 : 5000;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (isPaused) return;
    
    timerRef.current = setTimeout(() => {
      onNext();
    }, duration);
    
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [activeIndex, isPaused, duration, onNext]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [activeIndex]);

  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartY.current;
    
    if (deltaY > 0) {
      setIsDragging(true);
      setDragY(deltaY);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    const velocity = dragY / ((Date.now() - touchStartTime.current) / 1000);
    
    if (dragY > 100 || velocity > 400) {
      setIsClosing(true);
      setDragY(window.innerHeight);
      setTimeout(onClose, 200);
    } else {
      setDragY(0);
    }
    setIsDragging(false);
  }, [dragY, onClose]);

  const bgOpacity = Math.max(0.3, 1 - dragY / 300);
  const scale = Math.max(0.9, 1 - dragY / 1500);
  const translateY = isVisible && !isClosing ? dragY : (isClosing ? window.innerHeight : window.innerHeight);

  return (
    <div
      className="fixed inset-0 z-[1000] bg-black flex items-center justify-center"
      style={{ 
        opacity: isVisible ? bgOpacity : 0,
        transition: isDragging ? 'none' : 'opacity 150ms ease-out'
      }}
    >
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative w-full h-[100dvh] max-w-md bg-black overflow-hidden"
        style={{ 
          transform: `translateY(${isVisible ? translateY : window.innerHeight}px) scale(${isDragging ? scale : 1})`,
          transition: isDragging ? 'none' : 'transform 200ms cubic-bezier(0.32, 0.72, 0, 1)',
          borderRadius: isDragging ? 24 : 0
        }}
      >
        <div className="absolute inset-0">
          {story.video ? (
            <video
              ref={videoRef}
              src={story.video}
              poster={story.image}
              autoPlay
              muted
              playsInline
              preload="auto"
              className="w-full h-full object-cover"
              onEnded={onNext}
            />
          ) : (
            <img 
              src={story.image} 
              alt="" 
              className="w-full h-full object-cover"
              loading="eager"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70 pointer-events-none" />
        </div>

        <div className="absolute top-3 left-3 right-3 z-30 flex gap-1">
          {stories.map((_, i) => (
            <ProgressBar 
              key={i}
              isActive={i === activeIndex}
              isCompleted={i < activeIndex}
              duration={duration}
              isPaused={isPaused}
            />
          ))}
        </div>

        <div className="absolute top-12 left-3 right-3 z-30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full border border-white/30 overflow-hidden">
              <img src={story.image} alt="" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">{story.title}</h3>
              <p className="text-white/50 text-[10px] uppercase tracking-wider">{story.subtitle}</p>
            </div>
          </div>
          <button 
            data-testid="button-close-story"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white active:scale-90 transition-transform"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div 
          className="absolute inset-0 z-20 flex pointer-events-none"
          onPointerDown={() => setIsPaused(true)}
          onPointerUp={() => setIsPaused(false)}
          onPointerLeave={() => setIsPaused(false)}
        >
          <div 
            className="w-[30%] pointer-events-auto" 
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          />
          <div 
            className="flex-1 pointer-events-auto" 
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          />
        </div>

        <div className="absolute bottom-8 left-3 right-3 z-30 space-y-3">
          <div className="flex items-center justify-between">
            <StoryReactions storyId={story.id} />
            <div className="flex items-center gap-2">
              {story.viewCount !== undefined && (
                <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/10 text-white/70 text-xs">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{story.viewCount}</span>
                </div>
              )}
              <button 
                data-testid="button-share-story"
                onClick={(e) => {
                  e.stopPropagation();
                  const shareText = `${story.title} - ${story.subtitle}`;
                  const shareUrl = window.location.href;
                  const tg = window.Telegram?.WebApp;
                  
                  // Haptic feedback first
                  tg?.HapticFeedback?.impactOccurred?.('light');
                  
                  // Method 1: Telegram openTelegramLink (works in real TG)
                  if (tg?.openTelegramLink) {
                    const shareLink = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
                    tg.openTelegramLink(shareLink);
                    return;
                  }
                  
                  // Method 2: Web Share API
                  if (navigator.share) {
                    navigator.share({ title: story.title, text: shareText, url: shareUrl }).catch(() => {});
                    return;
                  }
                  
                  // Method 3: Open in new tab (fallback for test env)
                  const shareLink = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
                  window.open(shareLink, '_blank');
                }}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/70 active:scale-90 transition-transform"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
          <button
            data-testid="button-try-demo"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
              onOpenDemo(story.demoId);
            }}
            className="w-full h-12 rounded-xl bg-white text-black font-semibold flex items-center justify-center gap-2 active:scale-[0.97] transition-transform will-change-transform"
          >
            <span className="text-sm">Попробовать демо</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
});
StoryViewer.displayName = 'StoryViewer';

export const Stories = memo(function Stories({ stories, onOpenDemo }: StoriesProps) {
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const haptic = useHaptic();

  const activeStory = activeStoryIndex !== null ? stories[activeStoryIndex] : null;

  const handleOpen = useCallback((index: number) => {
    haptic.medium();
    
    const preloadMedia = (s: Story) => {
      if (s.video) {
        const video = document.createElement('video');
        video.preload = 'auto';
        video.src = s.video;
      } else {
        const img = new Image();
        img.src = s.image;
      }
    };
    
    preloadMedia(stories[index]);
    if (stories[index + 1]) preloadMedia(stories[index + 1]);
    if (stories[index - 1]) preloadMedia(stories[index - 1]);
    
    setActiveStoryIndex(index);
    setIsPaused(false);
  }, [haptic, stories]);

  const handleClose = useCallback(() => {
    haptic.light();
    setActiveStoryIndex(null);
    setIsPaused(false);
  }, [haptic]);

  const nextStory = useCallback(() => {
    if (activeStoryIndex === null) return;
    if (activeStoryIndex < stories.length - 1) {
      setActiveStoryIndex(activeStoryIndex + 1);
      setIsPaused(false);
    } else {
      handleClose();
    }
  }, [activeStoryIndex, stories.length, handleClose]);

  const prevStory = useCallback(() => {
    if (activeStoryIndex === null) return;
    if (activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1);
      setIsPaused(false);
    }
  }, [activeStoryIndex]);

  return (
    <div className="mb-10">
      <div className="flex gap-4 overflow-x-auto pb-4 px-1 no-scrollbar mask-fade-right">
        <AddStoryButton onClick={() => setIsCreateModalOpen(true)} />
        {stories.map((story, index) => (
          <StoryAvatar 
            key={story.id} 
            story={story} 
            onClick={() => handleOpen(index)} 
          />
        ))}
      </div>
      
      <CreateStoryModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />

      <AnimatePresence mode="wait">
        {activeStoryIndex !== null && activeStory && (
          <StoryViewer
            key={activeStoryIndex}
            story={activeStory}
            stories={stories}
            activeIndex={activeStoryIndex}
            onClose={handleClose}
            onNext={nextStory}
            onPrev={prevStory}
            onOpenDemo={onOpenDemo}
            isPaused={isPaused}
            setIsPaused={setIsPaused}
          />
        )}
      </AnimatePresence>
    </div>
  );
});
Stories.displayName = 'Stories';
