export const Typography = {
  scale: {
    display: {
      '2xl': { fontSize: '4.5rem', lineHeight: 1.1, letterSpacing: '-0.02em', fontWeight: 800 },
      xl: { fontSize: '3.75rem', lineHeight: 1.1, letterSpacing: '-0.02em', fontWeight: 700 },
      lg: { fontSize: '3rem', lineHeight: 1.15, letterSpacing: '-0.02em', fontWeight: 700 },
      md: { fontSize: '2.25rem', lineHeight: 1.2, letterSpacing: '-0.01em', fontWeight: 700 },
      sm: { fontSize: '1.875rem', lineHeight: 1.25, letterSpacing: '-0.01em', fontWeight: 600 },
    },
    heading: {
      h1: { fontSize: '2rem', lineHeight: 1.25, letterSpacing: '-0.01em', fontWeight: 700 },
      h2: { fontSize: '1.5rem', lineHeight: 1.3, letterSpacing: '-0.01em', fontWeight: 600 },
      h3: { fontSize: '1.25rem', lineHeight: 1.35, letterSpacing: '0', fontWeight: 600 },
      h4: { fontSize: '1.125rem', lineHeight: 1.4, letterSpacing: '0', fontWeight: 600 },
      h5: { fontSize: '1rem', lineHeight: 1.5, letterSpacing: '0', fontWeight: 600 },
      h6: { fontSize: '0.875rem', lineHeight: 1.5, letterSpacing: '0.01em', fontWeight: 600 },
    },
    body: {
      xl: { fontSize: '1.25rem', lineHeight: 1.6, letterSpacing: '0', fontWeight: 400 },
      lg: { fontSize: '1.125rem', lineHeight: 1.6, letterSpacing: '0', fontWeight: 400 },
      md: { fontSize: '1rem', lineHeight: 1.6, letterSpacing: '0', fontWeight: 400 },
      sm: { fontSize: '0.875rem', lineHeight: 1.5, letterSpacing: '0', fontWeight: 400 },
      xs: { fontSize: '0.75rem', lineHeight: 1.5, letterSpacing: '0.01em', fontWeight: 400 },
    },
    label: {
      lg: { fontSize: '0.875rem', lineHeight: 1.4, letterSpacing: '0.02em', fontWeight: 500 },
      md: { fontSize: '0.75rem', lineHeight: 1.4, letterSpacing: '0.02em', fontWeight: 500 },
      sm: { fontSize: '0.625rem', lineHeight: 1.4, letterSpacing: '0.04em', fontWeight: 500 },
    },
    caption: {
      md: { fontSize: '0.75rem', lineHeight: 1.4, letterSpacing: '0', fontWeight: 400 },
      sm: { fontSize: '0.625rem', lineHeight: 1.4, letterSpacing: '0.01em', fontWeight: 400 },
    },
  },
  
  fontFamily: {
    sans: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    heading: 'Inter, system-ui, sans-serif',
    luxury: '"Playfair Display", Georgia, serif',
    elegant: '"Cormorant Garamond", Garamond, serif',
    modern: '"Montserrat", system-ui, sans-serif',
    tech: '"Orbitron", system-ui, sans-serif',
    retro: '"Press Start 2P", cursive',
    mono: '"JetBrains Mono", "Fira Code", monospace',
  },
  
  weight: {
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
} as const;

export const TypographyClasses = {
  display: {
    '2xl': 'text-7xl font-extrabold tracking-tight leading-none',
    xl: 'text-6xl font-bold tracking-tight leading-none',
    lg: 'text-5xl font-bold tracking-tight leading-tight',
    md: 'text-4xl font-bold tracking-tight leading-tight',
    sm: 'text-3xl font-semibold tracking-tight leading-snug',
  },
  heading: {
    h1: 'text-3xl font-bold tracking-tight leading-tight',
    h2: 'text-2xl font-semibold tracking-tight leading-snug',
    h3: 'text-xl font-semibold leading-snug',
    h4: 'text-lg font-semibold leading-normal',
    h5: 'text-base font-semibold leading-normal',
    h6: 'text-sm font-semibold tracking-wide leading-normal',
  },
  body: {
    xl: 'text-xl leading-relaxed',
    lg: 'text-lg leading-relaxed',
    md: 'text-base leading-relaxed',
    sm: 'text-sm leading-normal',
    xs: 'text-xs leading-normal tracking-wide',
  },
  label: {
    lg: 'text-sm font-medium tracking-wide leading-snug',
    md: 'text-xs font-medium tracking-wide leading-snug',
    sm: 'text-[10px] font-medium tracking-wider leading-snug uppercase',
  },
  caption: {
    md: 'text-xs leading-snug',
    sm: 'text-[10px] leading-snug tracking-wide',
  },
} as const;

export const createTypographyStyle = (
  category: keyof typeof Typography.scale,
  size: string
) => {
  const scale = Typography.scale[category] as Record<string, {
    fontSize: string;
    lineHeight: number;
    letterSpacing: string;
    fontWeight: number;
  }>;
  
  if (!scale[size]) return {};
  
  return {
    fontSize: scale[size].fontSize,
    lineHeight: scale[size].lineHeight,
    letterSpacing: scale[size].letterSpacing,
    fontWeight: scale[size].fontWeight,
  };
};

export type TypographyScale = typeof Typography.scale;
export type FontFamily = keyof typeof Typography.fontFamily;
export type FontWeight = keyof typeof Typography.weight;
