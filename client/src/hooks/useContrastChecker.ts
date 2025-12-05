import { useMemo, useCallback } from 'react';

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface ContrastResult {
  ratio: number;
  aa: boolean;
  aaa: boolean;
  aaLarge: boolean;
  aaaLarge: boolean;
  level: 'AAA' | 'AA' | 'AA Large' | 'Fail';
}

const hexToRgb = (hex: string): RGB | null => {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  
  if (!result) return null;
  
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
};

const rgbStringToRgb = (rgb: string): RGB | null => {
  const result = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(rgb);
  if (!result) return null;
  
  return {
    r: parseInt(result[1], 10),
    g: parseInt(result[2], 10),
    b: parseInt(result[3], 10),
  };
};

const hslToRgb = (h: number, s: number, l: number): RGB => {
  s /= 100;
  l /= 100;
  
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  
  let r = 0, g = 0, b = 0;
  
  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else if (h >= 300 && h < 360) {
    r = c; g = 0; b = x;
  }
  
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
};

const hslStringToRgb = (hsl: string): RGB | null => {
  const result = /hsla?\((\d+),\s*(\d+)%?,\s*(\d+)%?/.exec(hsl);
  if (!result) return null;
  
  return hslToRgb(
    parseInt(result[1], 10),
    parseInt(result[2], 10),
    parseInt(result[3], 10)
  );
};

const parseColor = (color: string): RGB | null => {
  if (color.startsWith('#')) {
    return hexToRgb(color);
  } else if (color.startsWith('rgb')) {
    return rgbStringToRgb(color);
  } else if (color.startsWith('hsl')) {
    return hslStringToRgb(color);
  }
  return null;
};

const getLuminance = (rgb: RGB): number => {
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((v) => {
    const normalized = v / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const getContrastRatio = (luminance1: number, luminance2: number): number => {
  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);
  return (lighter + 0.05) / (darker + 0.05);
};

export const useContrastChecker = () => {
  const checkContrast = useCallback((foreground: string, background: string): ContrastResult | null => {
    const fgRgb = parseColor(foreground);
    const bgRgb = parseColor(background);
    
    if (!fgRgb || !bgRgb) return null;
    
    const fgLuminance = getLuminance(fgRgb);
    const bgLuminance = getLuminance(bgRgb);
    const ratio = getContrastRatio(fgLuminance, bgLuminance);
    
    const aa = ratio >= 4.5;
    const aaa = ratio >= 7;
    const aaLarge = ratio >= 3;
    const aaaLarge = ratio >= 4.5;
    
    let level: ContrastResult['level'] = 'Fail';
    if (aaa) level = 'AAA';
    else if (aa) level = 'AA';
    else if (aaLarge) level = 'AA Large';
    
    return {
      ratio: Math.round(ratio * 100) / 100,
      aa,
      aaa,
      aaLarge,
      aaaLarge,
      level,
    };
  }, []);

  const suggestAccessibleColor = useCallback((
    background: string,
    targetRatio: number = 4.5
  ): string => {
    const bgRgb = parseColor(background);
    if (!bgRgb) return '#000000';
    
    const bgLuminance = getLuminance(bgRgb);
    
    const blackLuminance = 0;
    const whiteLuminance = 1;
    
    const blackContrast = getContrastRatio(blackLuminance, bgLuminance);
    const whiteContrast = getContrastRatio(whiteLuminance, bgLuminance);
    
    if (blackContrast >= targetRatio) return '#000000';
    if (whiteContrast >= targetRatio) return '#ffffff';
    
    return blackContrast > whiteContrast ? '#000000' : '#ffffff';
  }, []);

  const getContrastLevel = useCallback((foreground: string, background: string): string => {
    const result = checkContrast(foreground, background);
    return result?.level || 'Unknown';
  }, [checkContrast]);

  const meetsAA = useCallback((foreground: string, background: string): boolean => {
    const result = checkContrast(foreground, background);
    return result?.aa || false;
  }, [checkContrast]);

  const meetsAAA = useCallback((foreground: string, background: string): boolean => {
    const result = checkContrast(foreground, background);
    return result?.aaa || false;
  }, [checkContrast]);

  return {
    checkContrast,
    suggestAccessibleColor,
    getContrastLevel,
    meetsAA,
    meetsAAA,
  };
};

export const useAccessibleTextColor = (backgroundColor: string) => {
  const { suggestAccessibleColor } = useContrastChecker();
  
  return useMemo(() => {
    return suggestAccessibleColor(backgroundColor);
  }, [backgroundColor, suggestAccessibleColor]);
};

export const useContrastRatio = (foreground: string, background: string) => {
  const { checkContrast } = useContrastChecker();
  
  return useMemo(() => {
    return checkContrast(foreground, background);
  }, [foreground, background, checkContrast]);
};
