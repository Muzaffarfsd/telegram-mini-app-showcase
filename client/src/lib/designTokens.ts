export const SYNE = '"Syne", system-ui, sans-serif';
export const INSTRUMENT = '"Instrument Serif", Georgia, serif';
export const INTER = '"Inter", -apple-system, system-ui, sans-serif';
export const EMERALD = '#34d399';
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
