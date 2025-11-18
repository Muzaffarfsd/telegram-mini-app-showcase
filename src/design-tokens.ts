export const DesignTokens = {
  spacing: {
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
    '3xl': '32px',
    '4xl': '40px',
    '5xl': '48px',
    '6xl': '56px',
  },
  
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  
  lineHeight: {
    tight: 1.2,
    snug: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  shadow: {
    sm: '0 2px 8px rgba(0, 0, 0, 0.08)',
    md: '0 4px 16px rgba(0, 0, 0, 0.12)',
    lg: '0 8px 32px rgba(0, 0, 0, 0.16)',
    xl: '0 16px 48px rgba(0, 0, 0, 0.20)',
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
  },
  
  transition: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '350ms cubic-bezier(0.4, 0, 0.2, 1)',
    spring: '400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  
  easing: {
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
    emeraldApple: '#30d158',
    blueApple: '#0a84ff',
  },
  
  spring: {
    default: {
      stiffness: 300,
      damping: 25,
      mass: 0.5,
    },
    bouncy: {
      stiffness: 400,
      damping: 20,
      mass: 0.5,
    },
    gentle: {
      stiffness: 200,
      damping: 30,
      mass: 0.5,
    },
  },
} as const;

export type DesignTokens = typeof DesignTokens;
