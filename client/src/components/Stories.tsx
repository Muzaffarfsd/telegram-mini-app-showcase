import { memo, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Plus } from 'lucide-react';
import { useHaptic } from '@/hooks/useHaptic';
import { useLanguage } from '@/contexts/LanguageContext';
import { CreateStoryModal } from './CreateStoryModal';

export interface Story {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  video?: string;
  demoId: string;
  color?: string;
}

interface StoriesProps {
  stories: Story[];
  onOpenDemo: (demoId: string) => void;
}

const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

const StoryAvatar = memo(({ story, onClick }: { story: Story; onClick: () => void }) => {
  return (
    <button
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

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.y > 80 || info.velocity.y > 500) {
      onClose();
    }
  };

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-[1000] bg-black flex items-center justify-center"
    >
      <m.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.3}
        onDragEnd={handleDragEnd}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'tween', duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
        className="relative w-full h-[100dvh] max-w-md bg-black overflow-hidden touch-pan-y will-change-transform"
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

        <div className="absolute top-7 left-3 right-3 z-30 flex items-center justify-between">
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
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white active:scale-90 transition-transform"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div 
          className="absolute inset-0 z-20 flex"
          onPointerDown={() => setIsPaused(true)}
          onPointerUp={() => setIsPaused(false)}
          onPointerLeave={() => setIsPaused(false)}
        >
          <div className="w-[30%]" onClick={(e) => { e.stopPropagation(); onPrev(); }} />
          <div className="flex-1" onClick={(e) => { e.stopPropagation(); onNext(); }} />
        </div>

        <div className="absolute bottom-8 left-3 right-3 z-30">
          <button
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
      </m.div>
    </m.div>
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
