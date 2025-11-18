import React from 'react';

export const BronzeMedal = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bronze" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#CD7F32', stopOpacity: 1 }} />
        <stop offset="50%" style={{ stopColor: '#E8A87C', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#8B5A2B', stopOpacity: 1 }} />
      </linearGradient>
      <filter id="shadow">
        <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3"/>
      </filter>
    </defs>
    <circle cx="32" cy="32" r="28" fill="url(#bronze)" filter="url(#shadow)" />
    <circle cx="32" cy="32" r="24" fill="none" stroke="#FFF" strokeWidth="1" opacity="0.3" />
    <text x="32" y="40" fontSize="24" fontWeight="bold" fill="#FFF" textAnchor="middle" fontFamily="Arial, sans-serif">3</text>
  </svg>
);

export const SilverMedal = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="silver" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#C0C0C0', stopOpacity: 1 }} />
        <stop offset="50%" style={{ stopColor: '#E8E8E8', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#A8A8A8', stopOpacity: 1 }} />
      </linearGradient>
      <filter id="shadowSilver">
        <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.4"/>
      </filter>
    </defs>
    <circle cx="32" cy="32" r="28" fill="url(#silver)" filter="url(#shadowSilver)" />
    <circle cx="32" cy="32" r="24" fill="none" stroke="#FFF" strokeWidth="1" opacity="0.5" />
    <text x="32" y="40" fontSize="24" fontWeight="bold" fill="#444" textAnchor="middle" fontFamily="Arial, sans-serif">2</text>
  </svg>
);

export const GoldMedal = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#FFD700', stopOpacity: 1 }} />
        <stop offset="50%" style={{ stopColor: '#FFF4A3', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#DAA520', stopOpacity: 1 }} />
      </linearGradient>
      <filter id="shadowGold">
        <feDropShadow dx="0" dy="3" stdDeviation="4" floodOpacity="0.5"/>
      </filter>
    </defs>
    <circle cx="32" cy="32" r="28" fill="url(#gold)" filter="url(#shadowGold)" />
    <circle cx="32" cy="32" r="24" fill="none" stroke="#FFF" strokeWidth="1.5" opacity="0.6" />
    <text x="32" y="40" fontSize="24" fontWeight="bold" fill="#8B6914" textAnchor="middle" fontFamily="Arial, sans-serif">1</text>
  </svg>
);

export const PlatinumMedal = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="platinum" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#E5E4E2', stopOpacity: 1 }} />
        <stop offset="25%" style={{ stopColor: '#B0E0E6', stopOpacity: 1 }} />
        <stop offset="50%" style={{ stopColor: '#E0E0E0', stopOpacity: 1 }} />
        <stop offset="75%" style={{ stopColor: '#87CEEB', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#D3D3D3', stopOpacity: 1 }} />
      </linearGradient>
      <filter id="shadowPlatinum">
        <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.6"/>
      </filter>
      <radialGradient id="shine">
        <stop offset="0%" style={{ stopColor: '#FFF', stopOpacity: 0.8 }} />
        <stop offset="100%" style={{ stopColor: '#FFF', stopOpacity: 0 }} />
      </radialGradient>
    </defs>
    <circle cx="32" cy="32" r="28" fill="url(#platinum)" filter="url(#shadowPlatinum)" />
    <circle cx="32" cy="32" r="24" fill="none" stroke="#FFF" strokeWidth="2" opacity="0.7" />
    <circle cx="28" cy="24" r="6" fill="url(#shine)" opacity="0.5" />
    <path d="M 32 20 L 34 26 L 40 26 L 35 30 L 37 36 L 32 32 L 27 36 L 29 30 L 24 26 L 30 26 Z" fill="#FFF" opacity="0.8" />
  </svg>
);

export const ShieldIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#059669', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <path d="M32 8 L52 16 L52 32 C52 44 42 54 32 56 C22 54 12 44 12 32 L12 16 Z" fill="url(#shieldGrad)" stroke="#FFF" strokeWidth="2"/>
    <path d="M28 32 L30 34 L36 28" stroke="#FFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
);

export const CrownIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="crownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#FFD700', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#FFA500', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <path d="M8 44 L16 24 L24 32 L32 16 L40 32 L48 24 L56 44 Z" fill="url(#crownGrad)" stroke="#FFF" strokeWidth="2"/>
    <rect x="8" y="44" width="48" height="8" rx="2" fill="url(#crownGrad)" stroke="#FFF" strokeWidth="2"/>
    <circle cx="16" cy="24" r="3" fill="#FFF"/>
    <circle cx="32" cy="16" r="3" fill="#FFF"/>
    <circle cx="48" cy="24" r="3" fill="#FFF"/>
  </svg>
);

export const DiamondIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="diamondGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#60A5FA', stopOpacity: 1 }} />
        <stop offset="50%" style={{ stopColor: '#93C5FD', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#3B82F6', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <path d="M32 8 L48 24 L32 56 L16 24 Z" fill="url(#diamondGrad)" stroke="#FFF" strokeWidth="2"/>
    <path d="M16 24 L48 24 L32 8 Z" fill="#FFF" opacity="0.3"/>
    <line x1="32" y1="8" x2="32" y2="56" stroke="#FFF" strokeWidth="1" opacity="0.4"/>
  </svg>
);

export const LightningIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="lightningGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#FBBF24', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#F59E0B', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <path d="M36 8 L20 32 L28 32 L24 56 L44 28 L36 28 Z" fill="url(#lightningGrad)" stroke="#FFF" strokeWidth="2" strokeLinejoin="round"/>
  </svg>
);

export const StarBurstIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#A78BFA', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#8B5CF6', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <path d="M32 4 L36 24 L56 20 L40 32 L56 44 L36 40 L32 60 L28 40 L8 44 L24 32 L8 20 L28 24 Z" fill="url(#starGrad)" stroke="#FFF" strokeWidth="2"/>
    <circle cx="32" cy="32" r="8" fill="#FFF" opacity="0.5"/>
  </svg>
);

export const TrophyStarIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="trophyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#EC4899', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#DB2777', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <path d="M20 12 L20 24 C20 32 24 36 32 36 C40 36 44 32 44 24 L44 12 Z" fill="url(#trophyGrad)" stroke="#FFF" strokeWidth="2"/>
    <path d="M16 12 L12 12 C12 16 14 20 18 22" stroke="#FFF" strokeWidth="2" fill="none"/>
    <path d="M48 12 L52 12 C52 16 50 20 46 22" stroke="#FFF" strokeWidth="2" fill="none"/>
    <rect x="28" y="36" width="8" height="12" fill="url(#trophyGrad)" stroke="#FFF" strokeWidth="2"/>
    <rect x="22" y="48" width="20" height="6" rx="2" fill="url(#trophyGrad)" stroke="#FFF" strokeWidth="2"/>
    <path d="M32 16 L34 22 L40 22 L35 26 L37 32 L32 28 L27 32 L29 26 L24 22 L30 22 Z" fill="#FFF"/>
  </svg>
);

export const RocketIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="rocketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#06B6D4', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#0891B2', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <path d="M32 8 C32 8 44 12 44 28 L44 44 L38 50 L32 56 L26 50 L20 44 L20 28 C20 12 32 8 32 8 Z" fill="url(#rocketGrad)" stroke="#FFF" strokeWidth="2"/>
    <circle cx="32" cy="28" r="6" fill="#FFF" opacity="0.6"/>
    <path d="M26 50 L20 56 L16 52 L22 46" fill="#F59E0B" stroke="#FFF" strokeWidth="1.5"/>
    <path d="M38 50 L44 56 L48 52 L42 46" fill="#F59E0B" stroke="#FFF" strokeWidth="1.5"/>
    <ellipse cx="32" cy="56" rx="10" ry="4" fill="#F59E0B" opacity="0.5"/>
  </svg>
);

export const GemIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="gemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#10B981', stopOpacity: 1 }} />
        <stop offset="50%" style={{ stopColor: '#34D399', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#059669', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <path d="M24 14 L40 14 L52 26 L32 54 L12 26 Z" fill="url(#gemGrad)" stroke="#FFF" strokeWidth="2"/>
    <path d="M24 14 L32 26 L40 14" stroke="#FFF" strokeWidth="1.5" fill="none"/>
    <path d="M12 26 L32 26 L52 26" stroke="#FFF" strokeWidth="1.5"/>
    <line x1="32" y1="26" x2="32" y2="54" stroke="#FFF" strokeWidth="1.5"/>
  </svg>
);
