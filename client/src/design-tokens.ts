export const DesignTokens = {
  spacing: {
    px: '1px',
    '0': '0',
    '0.5': '2px',
    '1': '4px',
    '1.5': '6px',
    '2': '8px',
    '2.5': '10px',
    '3': '12px',
    '3.5': '14px',
    '4': '16px',
    '5': '20px',
    '6': '24px',
    '7': '28px',
    '8': '32px',
    '9': '36px',
    '10': '40px',
    '11': '44px',
    '12': '48px',
    '14': '56px',
    '16': '64px',
    '20': '80px',
    '24': '96px',
    '28': '112px',
    '32': '128px',
    xs: '8px',
    sm: '16px',
    md: '24px',
    lg: '32px',
    xl: '48px',
    '2xl': '64px',
    '3xl': '96px',
  },
  
  radius: {
    none: '0',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
    '3xl': '32px',
    full: '9999px',
  },
  
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px',
    '6xl': '60px',
    '7xl': '72px',
    '8xl': '96px',
    '9xl': '128px',
  },
  
  fontWeight: {
    thin: 100,
    extralight: 200,
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
  
  lineHeight: {
    none: 1,
    tight: 1.2,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
  
  shadow: {
    none: 'none',
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
    apple: `
      0 2px 8px rgba(0, 0, 0, 0.04),
      0 4px 16px rgba(0, 0, 0, 0.08),
      0 8px 32px rgba(0, 0, 0, 0.06)
    `,
    appleHover: `
      0 4px 12px rgba(0, 0, 0, 0.06),
      0 8px 24px rgba(0, 0, 0, 0.10),
      0 16px 48px rgba(0, 0, 0, 0.08)
    `,
    premium: `
      0 4px 12px rgba(16, 185, 129, 0.15),
      0 8px 24px rgba(16, 185, 129, 0.10),
      0 16px 48px rgba(0, 0, 0, 0.08)
    `,
    glow: {
      emerald: '0 0 30px rgba(16, 185, 129, 0.3)',
      blue: '0 0 30px rgba(59, 130, 246, 0.3)',
      purple: '0 0 30px rgba(139, 92, 246, 0.3)',
      pink: '0 0 30px rgba(236, 72, 153, 0.3)',
      orange: '0 0 30px rgba(249, 115, 22, 0.3)',
      gold: '0 0 30px rgba(201, 169, 98, 0.3)',
    },
  },
  
  transition: {
    none: 'none',
    all: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '350ms cubic-bezier(0.4, 0, 0.2, 1)',
    slower: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
    spring: '400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
    bounce: '500ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  
  easing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    apple: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    appleIn: 'cubic-bezier(0.42, 0, 1, 1)',
    appleOut: 'cubic-bezier(0, 0, 0.58, 1)',
    appleInOut: 'cubic-bezier(0.42, 0, 0.58, 1)',
    springBounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    springSmooth: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  
  colors: {
    black: '#1d1d1f',
    white: '#f5f5f7',
    textPrimary: 'rgba(255, 255, 255, 0.92)',
    textSecondary: 'rgba(255, 255, 255, 0.70)',
    textTertiary: 'rgba(255, 255, 255, 0.45)',
    textQuaternary: 'rgba(255, 255, 255, 0.25)',
    textInverse: 'rgba(0, 0, 0, 0.87)',
    textInverseSecondary: 'rgba(0, 0, 0, 0.60)',
    emeraldApple: '#30d158',
    blueApple: '#0a84ff',
    purpleApple: '#bf5af2',
    pinkApple: '#ff375f',
    orangeApple: '#ff9f0a',
    yellowApple: '#ffd60a',
    tealApple: '#64d2ff',
    indigoApple: '#5e5ce6',
  },
  
  opacity: {
    '0': '0',
    '5': '0.05',
    '10': '0.1',
    '20': '0.2',
    '25': '0.25',
    '30': '0.3',
    '40': '0.4',
    '50': '0.5',
    '60': '0.6',
    '70': '0.7',
    '75': '0.75',
    '80': '0.8',
    '90': '0.9',
    '95': '0.95',
    '100': '1',
  },
  
  blur: {
    none: '0',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
    '3xl': '40px',
    '4xl': '64px',
  },
  
  zIndex: {
    auto: 'auto',
    '0': '0',
    '10': '10',
    '20': '20',
    '30': '30',
    '40': '40',
    '50': '50',
    dropdown: '100',
    sticky: '200',
    fixed: '300',
    modalBackdrop: '400',
    modal: '500',
    popover: '600',
    tooltip: '700',
    toast: '800',
    max: '9999',
  },
  
  spring: {
    default: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 25,
      mass: 0.5,
    },
    bouncy: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 20,
      mass: 0.5,
    },
    gentle: {
      type: 'spring' as const,
      stiffness: 200,
      damping: 30,
      mass: 0.5,
    },
    snappy: {
      type: 'spring' as const,
      stiffness: 500,
      damping: 30,
      mass: 0.3,
    },
    slow: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 20,
      mass: 1,
    },
  },
  
  breakpoints: {
    xs: '375px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  tapTarget: {
    min: '44px',
    recommended: '48px',
    comfortable: '56px',
  },
} as const;

export type DesignTokens = typeof DesignTokens;

export const getToken = <
  K extends keyof typeof DesignTokens,
  V extends keyof (typeof DesignTokens)[K]
>(
  category: K,
  key: V
): (typeof DesignTokens)[K][V] => {
  return DesignTokens[category][key];
};
