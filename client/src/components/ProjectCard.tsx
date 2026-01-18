import { ArrowRight, Star, Heart } from "lucide-react";
import { useHaptic } from "@/hooks/useHaptic";
import { useRef } from "react";
import { m, useMotionValue, useMotionTemplate } from "framer-motion";

interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  image: string;
  likes: string;
  badge?: boolean;
  onClick: () => void;
}

export default function ProjectCard({ 
  id, 
  title, 
  description, 
  category, 
  image, 
  likes, 
  badge, 
  onClick 
}: ProjectCardProps) {
  const haptic = useHaptic();
  const cardRef = useRef<HTMLButtonElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleClick = () => {
    haptic.light();
    onClick();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <button
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className="group relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 hover:border-system-blue/30 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-system-blue/20 shadow-sm hover:shadow-lg w-full"
      onClick={handleClick}
      data-testid={`card-demo-${id}`}
      aria-label={`Open ${title} demo - ${description}`}
    >
      {/* Spotlight Effect */}
      <m.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(36, 129, 204, 0.15),
              transparent 80%
            )
          `,
        }}
      />
      <div className="flex items-center p-4 space-x-4">
        {/* Project Image */}
        <div className="relative flex-shrink-0">
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-system-blue/10 to-system-purple/10">
            <img 
              src={image} 
              alt={title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              loading="lazy"
            />
          </div>
          {badge && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-system-blue rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">!</span>
            </div>
          )}
        </div>
        
        {/* Project Info */}
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center justify-between mb-1">
            <h4 className="ios-body font-semibold text-label truncate" data-testid={`text-demo-title-${id}`}>
              {title}
            </h4>
            <div className="flex items-center space-x-1 ml-2">
              <Star className="w-3 h-3 text-system-yellow fill-current" />
              <span className="ios-caption2 font-medium text-label">4.9</span>
            </div>
          </div>
          
          <p className="ios-caption1 text-system-blue font-medium mb-2">
            {category}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <Heart className="w-3 h-3 text-system-red fill-current" />
                <span className="ios-caption2 font-medium text-secondary-label" data-testid={`text-likes-${id}`}>
                  {likes}
                </span>
              </div>
              <span className="ios-caption2 text-secondary-label">•</span>
              <span className="ios-caption2 text-secondary-label">Демо доступно</span>
            </div>
            
            <div className="flex items-center text-system-blue group-hover:translate-x-1 transition-transform">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}