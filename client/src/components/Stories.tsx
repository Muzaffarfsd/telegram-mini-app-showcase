import { memo, useState, useEffect, useCallback } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { useHaptic } from '@/hooks/useHaptic';

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

export const Stories = memo(function Stories({ stories, onOpenDemo }: StoriesProps) {
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const haptic = useHaptic();

  const activeStory = activeStoryIndex !== null ? stories[activeStoryIndex] : null;

  const handleOpen = (index: number) => {
    haptic.medium();
    setActiveStoryIndex(index);
    setProgress(0);
  };

  const handleClose = useCallback(() => {
    haptic.light();
    setActiveStoryIndex(null);
    setProgress(0);
  }, [haptic]);

  const nextStory = useCallback(() => {
    if (activeStoryIndex === null) return;
    if (activeStoryIndex < stories.length - 1) {
      setActiveStoryIndex(activeStoryIndex + 1);
      setProgress(0);
    } else {
      handleClose();
    }
  }, [activeStoryIndex, stories.length, handleClose]);

  const prevStory = useCallback(() => {
    if (activeStoryIndex === null) return;
    if (activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1);
      setProgress(0);
    }
  }, [activeStoryIndex]);

  useEffect(() => {
    if (activeStoryIndex === null) return;

    const duration = 5000; // 5 seconds per story
    const interval = 50;
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextStory();
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [activeStoryIndex, nextStory]);

  return (
    <div className="mb-10 overflow-hidden">
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
        {stories.map((story, index) => (
          <button
            key={story.id}
            onClick={() => handleOpen(index)}
            className="flex-shrink-0 flex flex-col items-center gap-2 group"
          >
            <div className="relative p-[2px] rounded-full bg-gradient-to-tr from-system-blue to-system-purple group-active:scale-95 transition-transform">
              <div className="w-16 h-16 rounded-full border-2 border-background overflow-hidden bg-surface-elevated">
                <img src={story.image} alt={story.title} className="w-full h-full object-cover" />
              </div>
            </div>
            <span className="text-[11px] text-label-secondary font-medium max-w-[70px] truncate">
              {story.title}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {activeStoryIndex !== null && activeStory && (
          <m.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[1000] bg-black flex items-center justify-center p-0 sm:p-4"
          >
            <div className="relative w-full h-full max-w-md bg-surface overflow-hidden sm:rounded-3xl shadow-2xl">
              {/* Progress Bars */}
              <div className="absolute top-4 left-4 right-4 z-20 flex gap-1">
                {stories.map((_, i) => (
                  <div key={i} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                    <m.div
                      className="h-full bg-white"
                      initial={{ width: i < activeStoryIndex ? "100%" : "0%" }}
                      animate={{ 
                        width: i === activeStoryIndex ? `${progress}%` : (i < activeStoryIndex ? "100%" : "0%") 
                      }}
                      transition={{ duration: 0.1, ease: "linear" }}
                    />
                  </div>
                ))}
              </div>

              {/* Header */}
              <div className="absolute top-8 left-4 right-4 z-20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border border-white/20 overflow-hidden">
                    <img src={activeStory.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm">{activeStory.title}</h3>
                    <p className="text-white/60 text-xs">{activeStory.subtitle}</p>
                  </div>
                </div>
                <button 
                  onClick={handleClose}
                  className="w-8 h-8 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="absolute inset-0">
                {activeStory.video ? (
                  <video
                    src={activeStory.video}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                    onEnded={nextStory}
                  />
                ) : (
                  <img src={activeStory.image} alt="" className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
              </div>

              {/* Navigation Zones */}
              <div className="absolute inset-0 z-10 flex">
                <div className="flex-1 cursor-pointer" onClick={prevStory} />
                <div className="flex-1 cursor-pointer" onClick={nextStory} />
              </div>

              {/* Footer CTA */}
              <div className="absolute bottom-10 left-4 right-4 z-20">
                <button
                  onClick={() => {
                    handleClose();
                    onOpenDemo(activeStory.demoId);
                  }}
                  className="w-full h-14 rounded-2xl bg-white text-black font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                >
                  Открыть приложение
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
});
