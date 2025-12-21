import { memo } from 'react';

interface GradientMeshProps {
  className?: string;
  variant?: 'hero' | 'subtle' | 'vibrant';
  animated?: boolean;
}

export const GradientMesh = memo(function GradientMesh({
  className = '',
  variant = 'hero',
  animated = true,
}: GradientMeshProps) {
  const variants = {
    hero: {
      colors: ['#7928CA', '#FF0080', '#0070F3', '#00DFD8'],
      opacity: 0.4,
    },
    subtle: {
      colors: ['#4F46E5', '#7C3AED', '#2563EB', '#0EA5E9'],
      opacity: 0.25,
    },
    vibrant: {
      colors: ['#F97316', '#EF4444', '#EC4899', '#8B5CF6'],
      opacity: 0.5,
    },
  };

  const config = variants[variant];

  return (
    <div 
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <svg
        className="absolute w-full h-full"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <filter id="mesh-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="80" />
          </filter>
          <filter id="mesh-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" result="noise" />
            <feColorMatrix type="saturate" values="0" />
            <feBlend in="SourceGraphic" in2="noise" mode="soft-light" />
          </filter>
        </defs>
        
        <g filter="url(#mesh-blur)" style={{ opacity: config.opacity }}>
          <ellipse
            cx="200"
            cy="300"
            rx="350"
            ry="300"
            fill={config.colors[0]}
            className={animated ? 'animate-mesh-float-1' : ''}
          />
          <ellipse
            cx="800"
            cy="200"
            rx="300"
            ry="350"
            fill={config.colors[1]}
            className={animated ? 'animate-mesh-float-2' : ''}
          />
          <ellipse
            cx="500"
            cy="700"
            rx="400"
            ry="300"
            fill={config.colors[2]}
            className={animated ? 'animate-mesh-float-3' : ''}
          />
          <ellipse
            cx="900"
            cy="800"
            rx="300"
            ry="250"
            fill={config.colors[3]}
            className={animated ? 'animate-mesh-float-4' : ''}
          />
        </g>
      </svg>
      
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />
    </div>
  );
});
