interface CultSymbolProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  glowing?: boolean;
  className?: string;
}

const sizes = {
  sm: { width: 32, height: 32 },
  md: { width: 48, height: 48 },
  lg: { width: 64, height: 64 },
  xl: { width: 96, height: 96 },
};

export function CultSymbol({ size = 'md', animated = true, glowing = true, className = '' }: CultSymbolProps) {
  const { width, height } = sizes[size];
  
  return (
    <div
      className={`relative animate-in fade-in zoom-in duration-500 ${className}`}
    >
      {glowing && (
        <div
          className="absolute inset-0 blur-xl"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)',
            transform: 'scale(1.5)',
          }}
        />
      )}
      
      <svg
        width={width}
        height={height}
        viewBox="0 0 100 100"
        fill="none"
        className={`relative z-10 ${animated ? 'animate-spin-slow' : ''}`}
      >
        <defs>
          <linearGradient id="cultGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A78BFA" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
          <linearGradient id="cultGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="50%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <circle cx="50" cy="50" r="48" stroke="url(#cultGradient)" strokeWidth="1" fill="none" opacity="0.3" />
        <circle cx="50" cy="50" r="42" stroke="url(#cultGradient)" strokeWidth="0.5" fill="none" opacity="0.2" />
        
        <g filter="url(#glow)">
          <path
            d="M50 10 L56 30 L78 30 L60 44 L68 66 L50 52 L32 66 L40 44 L22 30 L44 30 Z"
            fill="none"
            stroke="url(#cultGradient)"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </g>
        
        <circle cx="50" cy="50" r="8" fill="url(#cultGradient)" />
        <circle cx="50" cy="50" r="4" fill="#FAFAFA" opacity="0.9" />
        
        <g opacity="0.6">
          <line x1="50" y1="20" x2="50" y2="10" stroke="url(#cultGradient)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="50" y1="90" x2="50" y2="80" stroke="url(#cultGradient)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="10" y1="50" x2="20" y2="50" stroke="url(#cultGradient)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="80" y1="50" x2="90" y2="50" stroke="url(#cultGradient)" strokeWidth="1.5" strokeLinecap="round" />
        </g>
        
        <text
          x="50"
          y="95"
          textAnchor="middle"
          fill="url(#cultGradient)"
          fontSize="6"
          fontWeight="700"
          letterSpacing="0.5"
          fontFamily="Inter, sans-serif"
        >
          W4TG
        </text>
      </svg>
    </div>
  );
}

export function ExclusiveBadge({ type = 'founding' }: { type?: 'founding' | 'elite' | 'insider' }) {
  const badges = {
    founding: {
      label: 'FOUNDING MEMBER',
      gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
    },
    elite: {
      label: 'ELITE ACCESS',
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
      icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    },
    insider: {
      label: 'INNER CIRCLE',
      gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    },
  };
  
  const badge = badges[type];
  
  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full animate-in fade-in slide-in-from-bottom-2 duration-300"
      style={{
        background: badge.gradient,
        boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
      }}
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d={badge.icon} />
      </svg>
      <span className="text-[9px] font-bold tracking-[0.1em] text-white">{badge.label}</span>
    </div>
  );
}

export function ScarcityIndicator({ spotsLeft = 3, totalSpots = 10 }: { spotsLeft?: number; totalSpots?: number }) {
  const percentage = ((totalSpots - spotsLeft) / totalSpots) * 100;
  const isUrgent = spotsLeft <= 3;
  
  return (
    <div
      className="relative rounded-2xl p-4 overflow-hidden animate-in fade-in zoom-in-95 duration-300"
      style={{
        background: isUrgent 
          ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(185, 28, 28, 0.1) 100%)'
          : 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(124, 58, 237, 0.1) 100%)',
        border: `1px solid ${isUrgent ? 'rgba(239, 68, 68, 0.3)' : 'rgba(139, 92, 246, 0.3)'}`,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: isUrgent ? '#EF4444' : '#8B5CF6' }}
          />
          <span className="text-xs font-bold tracking-wide" style={{ color: isUrgent ? '#EF4444' : '#A78BFA' }}>
            ОСТАЛОСЬ МЕСТ: {spotsLeft}
          </span>
        </div>
        <span className="text-[10px] font-medium text-white/50">из {totalSpots}</span>
      </div>
      
      <div className="relative h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${percentage}%`,
            background: isUrgent 
              ? 'linear-gradient(90deg, #EF4444 0%, #DC2626 100%)'
              : 'linear-gradient(90deg, #8B5CF6 0%, #7C3AED 100%)',
          }}
        />
        <div
          className="absolute top-0 h-full w-1/3 animate-shimmer"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }}
        />
      </div>
      
      {isUrgent && (
        <p className="mt-2 text-[10px] text-red-400/80 font-medium">
          Следующий набор через 30 дней
        </p>
      )}
    </div>
  );
}

export function WaitlistCounter({ count = 47 }: { count?: number }) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-2 rounded-full animate-in fade-in duration-300"
      style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <div className="flex -space-x-2">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="w-6 h-6 rounded-full border-2 border-black flex items-center justify-center text-[8px] font-bold"
            style={{
              background: ['#8B5CF6', '#F59E0B', '#10B981', '#3B82F6'][i],
              zIndex: 4 - i,
            }}
          >
            {String.fromCharCode(65 + i)}
          </div>
        ))}
      </div>
      <div>
        <span className="text-white text-xs font-bold">+{count}</span>
        <span className="text-white/50 text-[10px] ml-1">в очереди</span>
      </div>
    </div>
  );
}

export default CultSymbol;
