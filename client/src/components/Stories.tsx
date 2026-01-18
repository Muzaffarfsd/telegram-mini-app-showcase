import { memo, useState, useEffect, useCallback, useRef } from 'react';
import { m, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
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

const StoryAvatar = memo(({ story, index, onClick }: { story: Story; index: number; onClick: () => void }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const mouseX = useSpring(x, { stiffness: 500, damping: 30 });
  const mouseY = useSpring(y, { stiffness: 500, damping: 30 });
  
  const rotateX = useTransform(mouseY, [-30, 30], [15, -15]);
  const rotateY = useTransform(mouseX, [-30, 30], [-15, 15]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <m.div
      style={{ rotateX, rotateY, perspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="flex-shrink-0 flex flex-col items-center gap-2 group cursor-pointer"
      onClick={onClick}
    >
      <div className="relative p-[3px] rounded-full bg-gradient-to-tr from-system-blue via-system-purple to-system-pink group-active:scale-90 transition-transform duration-200 shadow-lg shadow-system-blue/10">
        <div className="w-16 h-16 rounded-full border-2 border-background overflow-hidden bg-surface-elevated relative">
          <m.img 
            src={story.image} 
            alt={story.title} 
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
        </div>
      </div>
      <span 
        className="text-[11px] text-label-secondary font-semibold max-w-[72px] truncate transition-colors group-hover:text-system-blue"
        style={{ fontFamily: 'Montserrat, sans-serif' }}
      >
        {story.title}
      </span>
    </m.div>
  );
});
StoryAvatar.displayName = 'StoryAvatar';

export const Stories = memo(function Stories({ stories, onOpenDemo }: StoriesProps) {
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const haptic = useHaptic();
  const videoRef = useRef<HTMLVideoElement>(null);

  const activeStory = activeStoryIndex !== null ? stories[activeStoryIndex] : null;

  const handleOpen = (index: number) => {
    haptic.medium();
    // Intelligent prefetching for next/prev stories
    const nextIdx = (index + 1) % stories.length;
    const prevIdx = (index - 1 + stories.length) % stories.length;
    [stories[index], stories[nextIdx], stories[prevIdx]].forEach(s => {
      if (s.video) {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = s.video;
        document.head.appendChild(link);
      }
    });

    setActiveStoryIndex(index);
    setProgress(0);
  };

  const handleClose = useCallback(() => {
    haptic.light();
    setActiveStoryIndex(null);
    setProgress(0);
    setIsPaused(false);
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
    if (activeStoryIndex === null || isPaused) return;

    const duration = activeStory?.video ? 10000 : 5000; 
    const interval = 30;
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
  }, [activeStoryIndex, nextStory, isPaused, activeStory?.video]);

  const handleDragEnd = (e: any, info: any) => {
    if (info.offset.y > 100) {
      handleClose();
    }
  };

  return (
    <div className="mb-10">
      <div className="flex gap-5 overflow-x-auto pb-4 px-1 no-scrollbar mask-fade-right">
        {stories.map((story, index) => (
          <StoryAvatar 
            key={story.id} 
            story={story} 
            index={index} 
            onClick={() => handleOpen(index)} 
          />
        ))}
      </div>

      <AnimatePresence>
        {activeStoryIndex !== null && activeStory && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-2xl flex items-center justify-center"
          >
            <m.div
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.7}
              onDragEnd={handleDragEnd}
              initial={{ y: "100%", borderRadius: 0 }}
              animate={{ y: 0, borderRadius: "24px" }}
              exit={{ y: "100%", borderRadius: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full h-[100dvh] sm:h-[85vh] max-w-md bg-surface overflow-hidden shadow-2xl touch-none"
            >
              {/* Intelligent Background Blur */}
              <div 
                className="absolute inset-0 opacity-40 scale-110 blur-3xl saturate-200 pointer-events-none"
                style={{ 
                  backgroundImage: `url(${activeStory.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />

              {/* Progress Bars */}
              <div className="absolute top-4 left-4 right-4 z-30 flex gap-1.5">
                {stories.map((_, i) => (
                  <div key={i} className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden backdrop-blur-md">
                    <m.div
                      className="h-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
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
              <div className="absolute top-8 left-4 right-4 z-30 flex items-center justify-between">
                <m.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full border-2 border-white/20 p-[2px]">
                    <img src={activeStory.image} alt="" className="w-full h-full rounded-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm tracking-tight">{activeStory.title}</h3>
                    <p className="text-white/60 text-[10px] uppercase tracking-widest">{activeStory.subtitle}</p>
                  </div>
                </m.div>
                <button 
                  onClick={handleClose}
                  className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center text-white border border-white/10 active:scale-90 transition-transform"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Main Content Container */}
              <div 
                className="absolute inset-0 flex items-center justify-center"
                onPointerDown={() => setIsPaused(true)}
                onPointerUp={() => setIsPaused(false)}
              >
                <AnimatePresence mode="wait">
                  <m.div
                    key={activeStory.id}
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full h-full relative"
                  >
                    {activeStory.video ? (
                      <video
                        ref={videoRef}
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
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
                  </m.div>
                </AnimatePresence>
              </div>

              {/* Interaction Zones */}
              <div className="absolute inset-0 z-20 flex">
                <div className="w-[30%] cursor-pointer" onClick={(e) => { e.stopPropagation(); prevStory(); }} />
                <div className="flex-1 cursor-pointer" onClick={(e) => { e.stopPropagation(); nextStory(); }} />
              </div>

              {/* Footer CTA */}
              <div className="absolute bottom-10 left-4 right-4 z-30">
                <m.button
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClose();
                    onOpenDemo(activeStory.demoId);
                  }}
                  className="w-full h-14 rounded-2xl bg-white text-black font-bold flex items-center justify-center gap-3 active:scale-[0.96] transition-all shadow-2xl shadow-white/10"
                >
                  <span className="text-sm">Попробовать демо</span>
                  <div className="w-6 h-6 rounded-full bg-black/5 flex items-center justify-center">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </m.button>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
});
Stories.displayName = 'Stories';
