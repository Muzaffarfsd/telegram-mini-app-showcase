export * from './motion';
export * from './typography';
export * from './glassmorphism';
export * from './themes';

export { DesignTokens } from '../design-tokens';

import { MotionPresets, TransitionPresets, AnimationVariants, PageTransitions, GesturePresets } from './motion';
import { Typography, TypographyClasses } from './typography';
import { Glassmorphism, GlassPresets, GlassClasses } from './glassmorphism';
import { DemoThemes, getTheme, getThemeCSS } from './themes';
import { DesignTokens } from '../design-tokens';

export const DesignSystem = {
  tokens: DesignTokens,
  motion: {
    presets: MotionPresets,
    transitions: TransitionPresets,
    variants: AnimationVariants,
    pages: PageTransitions,
    gestures: GesturePresets,
  },
  typography: Typography,
  typographyClasses: TypographyClasses,
  glass: Glassmorphism,
  glassPresets: GlassPresets,
  glassClasses: GlassClasses,
  themes: DemoThemes,
  getTheme,
  getThemeCSS,
} as const;

export default DesignSystem;
