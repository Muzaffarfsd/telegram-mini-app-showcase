import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { DemoTheme, DemoThemes, getTheme, getThemeCSS } from '@/design-system/themes';

interface DemoThemeContextValue {
  theme: DemoTheme;
  themeId: string;
  cssVars: Record<string, string>;
}

const DemoThemeContext = createContext<DemoThemeContextValue | null>(null);

interface DemoThemeProviderProps {
  themeId: keyof typeof DemoThemes | string;
  children: ReactNode;
}

export function DemoThemeProvider({ themeId, children }: DemoThemeProviderProps) {
  const value = useMemo(() => {
    const theme = getTheme(themeId);
    const cssVars = getThemeCSS(theme);
    return { theme, themeId, cssVars };
  }, [themeId]);

  return (
    <DemoThemeContext.Provider value={value}>
      <div style={value.cssVars as React.CSSProperties} className="contents">
        {children}
      </div>
    </DemoThemeContext.Provider>
  );
}

export function useDemoTheme() {
  const context = useContext(DemoThemeContext);
  if (!context) {
    return {
      theme: DemoThemes.premiumFashion,
      themeId: 'premiumFashion',
      cssVars: getThemeCSS(DemoThemes.premiumFashion),
    };
  }
  return context;
}

export function useThemeColors() {
  const { theme } = useDemoTheme();
  return theme.colors;
}

export function useThemeFonts() {
  const { theme } = useDemoTheme();
  return theme.fonts;
}

export function useThemeStyle() {
  const { theme } = useDemoTheme();
  return theme.style;
}

export { DemoThemeContext };
