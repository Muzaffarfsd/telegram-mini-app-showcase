export const Glassmorphism = {
  blur: {
    none: '0',
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '40px',
    '3xl': '64px',
  },
  
  background: {
    light: {
      subtle: 'rgba(255, 255, 255, 0.05)',
      light: 'rgba(255, 255, 255, 0.1)',
      medium: 'rgba(255, 255, 255, 0.15)',
      strong: 'rgba(255, 255, 255, 0.2)',
      solid: 'rgba(255, 255, 255, 0.3)',
    },
    dark: {
      subtle: 'rgba(0, 0, 0, 0.1)',
      light: 'rgba(0, 0, 0, 0.2)',
      medium: 'rgba(0, 0, 0, 0.3)',
      strong: 'rgba(0, 0, 0, 0.4)',
      solid: 'rgba(0, 0, 0, 0.6)',
    },
    accent: {
      emerald: 'rgba(16, 185, 129, 0.1)',
      blue: 'rgba(59, 130, 246, 0.1)',
      purple: 'rgba(139, 92, 246, 0.1)',
      rose: 'rgba(244, 63, 94, 0.1)',
      amber: 'rgba(245, 158, 11, 0.1)',
      cyan: 'rgba(6, 182, 212, 0.1)',
    },
  },
  
  border: {
    light: {
      subtle: 'rgba(255, 255, 255, 0.05)',
      light: 'rgba(255, 255, 255, 0.1)',
      medium: 'rgba(255, 255, 255, 0.15)',
      strong: 'rgba(255, 255, 255, 0.2)',
    },
    dark: {
      subtle: 'rgba(0, 0, 0, 0.05)',
      light: 'rgba(0, 0, 0, 0.1)',
      medium: 'rgba(0, 0, 0, 0.15)',
      strong: 'rgba(0, 0, 0, 0.2)',
    },
  },
  
  shadow: {
    subtle: '0 4px 16px rgba(0, 0, 0, 0.05)',
    light: '0 8px 32px rgba(0, 0, 0, 0.08)',
    medium: '0 12px 48px rgba(0, 0, 0, 0.12)',
    strong: '0 16px 64px rgba(0, 0, 0, 0.16)',
    glow: {
      emerald: '0 0 40px rgba(16, 185, 129, 0.2)',
      blue: '0 0 40px rgba(59, 130, 246, 0.2)',
      purple: '0 0 40px rgba(139, 92, 246, 0.2)',
      rose: '0 0 40px rgba(244, 63, 94, 0.2)',
      amber: '0 0 40px rgba(245, 158, 11, 0.2)',
      white: '0 0 40px rgba(255, 255, 255, 0.15)',
    },
  },
} as const;

export const GlassPresets = {
  card: {
    background: Glassmorphism.background.light.light,
    backdropFilter: `blur(${Glassmorphism.blur.lg})`,
    border: `1px solid ${Glassmorphism.border.light.light}`,
    boxShadow: Glassmorphism.shadow.light,
  },
  
  cardDark: {
    background: Glassmorphism.background.dark.medium,
    backdropFilter: `blur(${Glassmorphism.blur.lg})`,
    border: `1px solid ${Glassmorphism.border.light.subtle}`,
    boxShadow: Glassmorphism.shadow.medium,
  },
  
  header: {
    background: Glassmorphism.background.dark.light,
    backdropFilter: `blur(${Glassmorphism.blur.xl})`,
    borderBottom: `1px solid ${Glassmorphism.border.light.subtle}`,
  },
  
  nav: {
    background: Glassmorphism.background.dark.medium,
    backdropFilter: `blur(${Glassmorphism.blur['2xl']})`,
    border: `1px solid ${Glassmorphism.border.light.light}`,
    boxShadow: Glassmorphism.shadow.medium,
  },
  
  modal: {
    background: Glassmorphism.background.dark.strong,
    backdropFilter: `blur(${Glassmorphism.blur['2xl']})`,
    border: `1px solid ${Glassmorphism.border.light.light}`,
    boxShadow: Glassmorphism.shadow.strong,
  },
  
  pill: {
    background: Glassmorphism.background.light.light,
    backdropFilter: `blur(${Glassmorphism.blur.md})`,
    border: `1px solid ${Glassmorphism.border.light.subtle}`,
  },
  
  input: {
    background: Glassmorphism.background.dark.light,
    backdropFilter: `blur(${Glassmorphism.blur.sm})`,
    border: `1px solid ${Glassmorphism.border.light.light}`,
  },
  
  button: {
    background: Glassmorphism.background.light.medium,
    backdropFilter: `blur(${Glassmorphism.blur.md})`,
    border: `1px solid ${Glassmorphism.border.light.light}`,
  },
  
  overlay: {
    background: Glassmorphism.background.dark.solid,
    backdropFilter: `blur(${Glassmorphism.blur['3xl']})`,
  },
  
  floating: {
    background: Glassmorphism.background.dark.medium,
    backdropFilter: `blur(${Glassmorphism.blur.xl})`,
    border: `1px solid ${Glassmorphism.border.light.light}`,
    boxShadow: `${Glassmorphism.shadow.medium}, inset 0 1px 0 ${Glassmorphism.border.light.subtle}`,
  },
} as const;

export const GlassClasses = {
  card: 'bg-white/10 backdrop-blur-lg border border-white/10 shadow-lg',
  cardDark: 'bg-black/30 backdrop-blur-lg border border-white/5 shadow-xl',
  header: 'bg-black/20 backdrop-blur-xl border-b border-white/5',
  nav: 'bg-black/30 backdrop-blur-2xl border border-white/10 shadow-xl',
  modal: 'bg-black/40 backdrop-blur-2xl border border-white/10 shadow-2xl',
  pill: 'bg-white/10 backdrop-blur-md border border-white/5',
  input: 'bg-black/20 backdrop-blur-sm border border-white/10',
  button: 'bg-white/15 backdrop-blur-md border border-white/10',
  overlay: 'bg-black/60 backdrop-blur-3xl',
  floating: 'bg-black/30 backdrop-blur-xl border border-white/10 shadow-xl',
  subtle: 'bg-white/5 backdrop-blur-sm border border-white/5',
  strong: 'bg-black/50 backdrop-blur-2xl border border-white/15',
} as const;

export const createGlassStyle = (
  blur: keyof typeof Glassmorphism.blur = 'lg',
  bgOpacity: 'subtle' | 'light' | 'medium' | 'strong' | 'solid' = 'light',
  variant: 'light' | 'dark' = 'light'
) => ({
  background: Glassmorphism.background[variant][bgOpacity],
  backdropFilter: `blur(${Glassmorphism.blur[blur]})`,
  WebkitBackdropFilter: `blur(${Glassmorphism.blur[blur]})`,
  border: `1px solid ${Glassmorphism.border[variant].light}`,
});

export type GlassPreset = keyof typeof GlassPresets;
export type BlurLevel = keyof typeof Glassmorphism.blur;
