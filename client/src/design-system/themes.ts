export type DemoTheme = {
  id: string;
  name: string;
  colors: {
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    accent: string;
    accentForeground: string;
    background: string;
    foreground: string;
    muted: string;
    mutedForeground: string;
    card: string;
    cardForeground: string;
    border: string;
    ring: string;
    gradient?: {
      from: string;
      via?: string;
      to: string;
    };
  };
  fonts: {
    heading: string;
    body: string;
  };
  style: {
    borderRadius: string;
    glassIntensity: 'subtle' | 'light' | 'medium' | 'strong';
    shadowStyle: 'flat' | 'soft' | 'elevated' | 'dramatic';
    animation: 'minimal' | 'smooth' | 'playful' | 'dramatic';
  };
};

export const DemoThemes: Record<string, DemoTheme> = {
  premiumFashion: {
    id: 'premiumFashion',
    name: 'Premium Fashion',
    colors: {
      primary: '#10b981',
      primaryForeground: '#ffffff',
      secondary: '#1e293b',
      secondaryForeground: '#f8fafc',
      accent: '#14b8a6',
      accentForeground: '#ffffff',
      background: '#0a0a0b',
      foreground: '#f8fafc',
      muted: '#1e293b',
      mutedForeground: '#94a3b8',
      card: '#111113',
      cardForeground: '#f8fafc',
      border: 'rgba(255, 255, 255, 0.08)',
      ring: '#10b981',
      gradient: {
        from: '#10b981',
        via: '#14b8a6',
        to: '#0ea5e9',
      },
    },
    fonts: {
      heading: '"Inter", system-ui, sans-serif',
      body: '"Inter", system-ui, sans-serif',
    },
    style: {
      borderRadius: '12px',
      glassIntensity: 'medium',
      shadowStyle: 'soft',
      animation: 'smooth',
    },
  },

  sneakerVault: {
    id: 'sneakerVault',
    name: 'Sneaker Vault',
    colors: {
      primary: '#f97316',
      primaryForeground: '#000000',
      secondary: '#18181b',
      secondaryForeground: '#fafafa',
      accent: '#fb923c',
      accentForeground: '#000000',
      background: '#09090b',
      foreground: '#fafafa',
      muted: '#27272a',
      mutedForeground: '#a1a1aa',
      card: '#18181b',
      cardForeground: '#fafafa',
      border: 'rgba(255, 255, 255, 0.06)',
      ring: '#f97316',
      gradient: {
        from: '#f97316',
        to: '#ea580c',
      },
    },
    fonts: {
      heading: '"Montserrat", system-ui, sans-serif',
      body: '"Inter", system-ui, sans-serif',
    },
    style: {
      borderRadius: '8px',
      glassIntensity: 'light',
      shadowStyle: 'elevated',
      animation: 'playful',
    },
  },

  fragranceRoyale: {
    id: 'fragranceRoyale',
    name: 'Fragrance Royale',
    colors: {
      primary: '#c4a052',
      primaryForeground: '#000000',
      secondary: '#1c1917',
      secondaryForeground: '#fafaf9',
      accent: '#d4af37',
      accentForeground: '#000000',
      background: '#0c0a09',
      foreground: '#fafaf9',
      muted: '#292524',
      mutedForeground: '#a8a29e',
      card: '#1c1917',
      cardForeground: '#fafaf9',
      border: 'rgba(196, 160, 82, 0.15)',
      ring: '#c4a052',
      gradient: {
        from: '#c4a052',
        via: '#d4af37',
        to: '#b8860b',
      },
    },
    fonts: {
      heading: '"Playfair Display", Georgia, serif',
      body: '"Cormorant Garamond", serif',
    },
    style: {
      borderRadius: '4px',
      glassIntensity: 'subtle',
      shadowStyle: 'dramatic',
      animation: 'smooth',
    },
  },

  timeElite: {
    id: 'timeElite',
    name: 'Time Elite',
    colors: {
      primary: '#c9a962',
      primaryForeground: '#000000',
      secondary: '#171717',
      secondaryForeground: '#fafafa',
      accent: '#d4af37',
      accentForeground: '#000000',
      background: '#0a0a0a',
      foreground: '#fafafa',
      muted: '#262626',
      mutedForeground: '#a3a3a3',
      card: '#171717',
      cardForeground: '#fafafa',
      border: 'rgba(201, 169, 98, 0.12)',
      ring: '#c9a962',
      gradient: {
        from: '#c9a962',
        to: '#8b7355',
      },
    },
    fonts: {
      heading: '"Playfair Display", Georgia, serif',
      body: '"Inter", system-ui, sans-serif',
    },
    style: {
      borderRadius: '2px',
      glassIntensity: 'subtle',
      shadowStyle: 'dramatic',
      animation: 'minimal',
    },
  },

  electronics: {
    id: 'electronics',
    name: 'Electronics',
    colors: {
      primary: '#3b82f6',
      primaryForeground: '#ffffff',
      secondary: '#1e293b',
      secondaryForeground: '#f1f5f9',
      accent: '#0ea5e9',
      accentForeground: '#ffffff',
      background: '#0f172a',
      foreground: '#f1f5f9',
      muted: '#1e293b',
      mutedForeground: '#94a3b8',
      card: '#1e293b',
      cardForeground: '#f1f5f9',
      border: 'rgba(59, 130, 246, 0.1)',
      ring: '#3b82f6',
      gradient: {
        from: '#3b82f6',
        via: '#6366f1',
        to: '#8b5cf6',
      },
    },
    fonts: {
      heading: '"Inter", system-ui, sans-serif',
      body: '"Inter", system-ui, sans-serif',
    },
    style: {
      borderRadius: '12px',
      glassIntensity: 'medium',
      shadowStyle: 'soft',
      animation: 'smooth',
    },
  },

  beauty: {
    id: 'beauty',
    name: 'Beauty',
    colors: {
      primary: '#ec4899',
      primaryForeground: '#ffffff',
      secondary: '#1f1f1f',
      secondaryForeground: '#fafafa',
      accent: '#f472b6',
      accentForeground: '#ffffff',
      background: '#0a0a0a',
      foreground: '#fafafa',
      muted: '#262626',
      mutedForeground: '#a3a3a3',
      card: '#171717',
      cardForeground: '#fafafa',
      border: 'rgba(236, 72, 153, 0.1)',
      ring: '#ec4899',
      gradient: {
        from: '#ec4899',
        via: '#f472b6',
        to: '#fb7185',
      },
    },
    fonts: {
      heading: '"Cormorant Garamond", serif',
      body: '"Inter", system-ui, sans-serif',
    },
    style: {
      borderRadius: '16px',
      glassIntensity: 'light',
      shadowStyle: 'soft',
      animation: 'smooth',
    },
  },

  restaurant: {
    id: 'restaurant',
    name: 'Restaurant',
    colors: {
      primary: '#ef4444',
      primaryForeground: '#ffffff',
      secondary: '#1c1917',
      secondaryForeground: '#fafaf9',
      accent: '#f97316',
      accentForeground: '#ffffff',
      background: '#0c0a09',
      foreground: '#fafaf9',
      muted: '#292524',
      mutedForeground: '#a8a29e',
      card: '#1c1917',
      cardForeground: '#fafaf9',
      border: 'rgba(239, 68, 68, 0.1)',
      ring: '#ef4444',
      gradient: {
        from: '#ef4444',
        to: '#dc2626',
      },
    },
    fonts: {
      heading: '"Playfair Display", Georgia, serif',
      body: '"Inter", system-ui, sans-serif',
    },
    style: {
      borderRadius: '8px',
      glassIntensity: 'medium',
      shadowStyle: 'elevated',
      animation: 'smooth',
    },
  },

  nikeACG: {
    id: 'nikeACG',
    name: 'Nike ACG',
    colors: {
      primary: '#22c55e',
      primaryForeground: '#000000',
      secondary: '#14532d',
      secondaryForeground: '#f0fdf4',
      accent: '#4ade80',
      accentForeground: '#000000',
      background: '#052e16',
      foreground: '#f0fdf4',
      muted: '#14532d',
      mutedForeground: '#86efac',
      card: '#14532d',
      cardForeground: '#f0fdf4',
      border: 'rgba(34, 197, 94, 0.15)',
      ring: '#22c55e',
      gradient: {
        from: '#22c55e',
        to: '#16a34a',
      },
    },
    fonts: {
      heading: '"Montserrat", system-ui, sans-serif',
      body: '"Inter", system-ui, sans-serif',
    },
    style: {
      borderRadius: '4px',
      glassIntensity: 'light',
      shadowStyle: 'flat',
      animation: 'minimal',
    },
  },

  oxyzNFT: {
    id: 'oxyzNFT',
    name: 'Oxyz NFT',
    colors: {
      primary: '#8b5cf6',
      primaryForeground: '#ffffff',
      secondary: '#1e1b4b',
      secondaryForeground: '#f5f3ff',
      accent: '#a78bfa',
      accentForeground: '#000000',
      background: '#0c0a1d',
      foreground: '#f5f3ff',
      muted: '#1e1b4b',
      mutedForeground: '#a5b4fc',
      card: '#1e1b4b',
      cardForeground: '#f5f3ff',
      border: 'rgba(139, 92, 246, 0.15)',
      ring: '#8b5cf6',
      gradient: {
        from: '#8b5cf6',
        via: '#a78bfa',
        to: '#c4b5fd',
      },
    },
    fonts: {
      heading: '"Orbitron", system-ui, sans-serif',
      body: '"Inter", system-ui, sans-serif',
    },
    style: {
      borderRadius: '16px',
      glassIntensity: 'strong',
      shadowStyle: 'dramatic',
      animation: 'playful',
    },
  },

  rascalStore: {
    id: 'rascalStore',
    name: 'Rascal Store',
    colors: {
      primary: '#fbbf24',
      primaryForeground: '#000000',
      secondary: '#1c1917',
      secondaryForeground: '#fafaf9',
      accent: '#f59e0b',
      accentForeground: '#000000',
      background: '#0c0a09',
      foreground: '#fafaf9',
      muted: '#292524',
      mutedForeground: '#a8a29e',
      card: '#1c1917',
      cardForeground: '#fafaf9',
      border: 'rgba(251, 191, 36, 0.1)',
      ring: '#fbbf24',
      gradient: {
        from: '#fbbf24',
        to: '#f59e0b',
      },
    },
    fonts: {
      heading: '"Press Start 2P", cursive',
      body: '"Inter", system-ui, sans-serif',
    },
    style: {
      borderRadius: '0px',
      glassIntensity: 'light',
      shadowStyle: 'flat',
      animation: 'playful',
    },
  },

  storeBlack: {
    id: 'storeBlack',
    name: 'Store Black',
    colors: {
      primary: '#ffffff',
      primaryForeground: '#000000',
      secondary: '#171717',
      secondaryForeground: '#fafafa',
      accent: '#e5e5e5',
      accentForeground: '#000000',
      background: '#000000',
      foreground: '#fafafa',
      muted: '#262626',
      mutedForeground: '#a3a3a3',
      card: '#0a0a0a',
      cardForeground: '#fafafa',
      border: 'rgba(255, 255, 255, 0.08)',
      ring: '#ffffff',
    },
    fonts: {
      heading: '"Inter", system-ui, sans-serif',
      body: '"Inter", system-ui, sans-serif',
    },
    style: {
      borderRadius: '0px',
      glassIntensity: 'subtle',
      shadowStyle: 'flat',
      animation: 'minimal',
    },
  },

  labSurvivalist: {
    id: 'labSurvivalist',
    name: 'Lab Survivalist',
    colors: {
      primary: '#84cc16',
      primaryForeground: '#000000',
      secondary: '#1a2e05',
      secondaryForeground: '#ecfccb',
      accent: '#a3e635',
      accentForeground: '#000000',
      background: '#0f1a02',
      foreground: '#ecfccb',
      muted: '#1a2e05',
      mutedForeground: '#bef264',
      card: '#1a2e05',
      cardForeground: '#ecfccb',
      border: 'rgba(132, 204, 22, 0.15)',
      ring: '#84cc16',
      gradient: {
        from: '#84cc16',
        to: '#65a30d',
      },
    },
    fonts: {
      heading: '"Montserrat", system-ui, sans-serif',
      body: '"Inter", system-ui, sans-serif',
    },
    style: {
      borderRadius: '4px',
      glassIntensity: 'light',
      shadowStyle: 'flat',
      animation: 'minimal',
    },
  },

  emilyCarterAI: {
    id: 'emilyCarterAI',
    name: 'Emily Carter AI',
    colors: {
      primary: '#06b6d4',
      primaryForeground: '#000000',
      secondary: '#164e63',
      secondaryForeground: '#ecfeff',
      accent: '#22d3ee',
      accentForeground: '#000000',
      background: '#042f2e',
      foreground: '#ecfeff',
      muted: '#164e63',
      mutedForeground: '#67e8f9',
      card: '#164e63',
      cardForeground: '#ecfeff',
      border: 'rgba(6, 182, 212, 0.15)',
      ring: '#06b6d4',
      gradient: {
        from: '#06b6d4',
        via: '#0891b2',
        to: '#0e7490',
      },
    },
    fonts: {
      heading: '"Inter", system-ui, sans-serif',
      body: '"Inter", system-ui, sans-serif',
    },
    style: {
      borderRadius: '12px',
      glassIntensity: 'medium',
      shadowStyle: 'soft',
      animation: 'smooth',
    },
  },
} as const;

export const getTheme = (themeId: string): DemoTheme => {
  return DemoThemes[themeId] || DemoThemes.premiumFashion;
};

export const getThemeCSS = (theme: DemoTheme): Record<string, string> => ({
  '--theme-primary': theme.colors.primary,
  '--theme-primary-foreground': theme.colors.primaryForeground,
  '--theme-secondary': theme.colors.secondary,
  '--theme-secondary-foreground': theme.colors.secondaryForeground,
  '--theme-accent': theme.colors.accent,
  '--theme-accent-foreground': theme.colors.accentForeground,
  '--theme-background': theme.colors.background,
  '--theme-foreground': theme.colors.foreground,
  '--theme-muted': theme.colors.muted,
  '--theme-muted-foreground': theme.colors.mutedForeground,
  '--theme-card': theme.colors.card,
  '--theme-card-foreground': theme.colors.cardForeground,
  '--theme-border': theme.colors.border,
  '--theme-ring': theme.colors.ring,
  '--theme-radius': theme.style.borderRadius,
  '--theme-font-heading': theme.fonts.heading,
  '--theme-font-body': theme.fonts.body,
});

export type ThemeId = keyof typeof DemoThemes;
