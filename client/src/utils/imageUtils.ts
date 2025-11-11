// Универсальные fallback изображения для разных категорий
const FALLBACK_IMAGES = {
  // Общий fallback
  default: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
  
  // Специфические fallback для категорий
  banking: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
  beauty: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
  bookstore: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
  carwash: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
  clothing: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
  coffee: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
  courses: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
  electronics: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
  fitness: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
  florist: 'https://images.unsplash.com/photo-1487070183336-b8eb9220e21a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
  hotel: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
  pharmacy: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
  realty: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
  restaurant: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
  taxi: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400'
};

/**
 * Создает обработчик ошибок для изображений с fallback
 * @param category - категория приложения для выбора подходящего fallback
 * @returns обработчик ошибки изображения
 */
export const createImageErrorHandler = (category: keyof typeof FALLBACK_IMAGES = 'default') => {
  return (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget;
    const fallbackImage = FALLBACK_IMAGES[category] || FALLBACK_IMAGES.default;
    
    // Избегаем бесконечного цикла ошибок
    if (target.src !== fallbackImage) {
      target.src = fallbackImage;
    }
  };
};

/**
 * Создает обработчик ошибок для изображений товаров/услуг с дополнительными fallback
 * @param category - категория для выбора fallback
 * @param productType - тип товара/услуги (опционально)
 * @returns обработчик ошибки изображения
 */
export const createProductImageErrorHandler = (
  category: keyof typeof FALLBACK_IMAGES = 'default',
  productType?: string
) => {
  return (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget;
    let fallbackImage = FALLBACK_IMAGES[category] || FALLBACK_IMAGES.default;
    
    // Специальные fallback для типов товаров
    if (productType) {
      const productFallbacks = {
        food: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
        drink: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
        book: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
        tech: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
        service: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400'
      };
      
      fallbackImage = productFallbacks[productType as keyof typeof productFallbacks] || fallbackImage;
    }
    
    // Избегаем бесконечного цикла ошибок
    if (target.src !== fallbackImage) {
      target.src = fallbackImage;
    }
  };
};

/**
 * Валидирует и нормализует URL изображения
 * @param imageUrl - URL изображения
 * @param category - категория для fallback
 * @returns валидный URL изображения
 */
export const validateImageUrl = (
  imageUrl: string | undefined | null,
  category: keyof typeof FALLBACK_IMAGES = 'default'
): string => {
  if (!imageUrl || imageUrl.trim() === '') {
    return FALLBACK_IMAGES[category] || FALLBACK_IMAGES.default;
  }
  
  // Проверяем, что URL выглядит валидным
  try {
    new URL(imageUrl);
    return imageUrl;
  } catch {
    return FALLBACK_IMAGES[category] || FALLBACK_IMAGES.default;
  }
};

export { FALLBACK_IMAGES };

// ==================== PERFORMANCE OPTIMIZATION UTILITIES ====================

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpg' | 'png' | 'auto';
  blur?: number;
  dpr?: number; // Device pixel ratio
}

// Optimize Unsplash images with query parameters
export const optimizeUnsplashImage = (
  url: string, 
  options: ImageOptimizationOptions = {}
): string => {
  if (!url.includes('images.unsplash.com')) {
    return url;
  }

  const {
    width = 400,
    height,
    quality = 80,
    format = 'auto',
    blur,
    dpr = 2
  } = options;

  const urlObj = new URL(url);
  
  // Add optimization parameters
  urlObj.searchParams.set('auto', 'format,compress');
  urlObj.searchParams.set('q', quality.toString());
  urlObj.searchParams.set('w', width.toString());
  
  if (height) {
    urlObj.searchParams.set('h', height.toString());
    urlObj.searchParams.set('fit', 'crop');
  }
  
  if (format !== 'auto') {
    urlObj.searchParams.set('fm', format);
  }
  
  if (blur) {
    urlObj.searchParams.set('blur', blur.toString());
  }
  
  urlObj.searchParams.set('dpr', dpr.toString());
  
  return urlObj.toString();
};

// Generate responsive image sources
export const generateResponsiveImages = (
  baseUrl: string,
  sizes: number[] = [320, 640, 960, 1280]
): Array<{ src: string; width: number; media?: string }> => {
  return sizes.map((size, index) => ({
    src: optimizeUnsplashImage(baseUrl, { width: size, quality: 85 }),
    width: size,
    media: index === sizes.length - 1 ? undefined : `(max-width: ${size}px)`
  }));
};

// Create optimized placeholder for lazy loading
export const createOptimizedPlaceholder = (width: number = 400, height: number = 300): string => {
  const svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="${width}" height="${height}" fill="#f3f4f6"/><circle cx="${width/2}" cy="${height/2}" r="20" fill="#d1d5db"/></svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

// Blur placeholder for smooth transitions
export const createBlurPlaceholder = (originalUrl: string): string => {
  if (originalUrl.includes('images.unsplash.com')) {
    return optimizeUnsplashImage(originalUrl, { 
      width: 40, 
      height: 30, 
      quality: 20,
      blur: 5 
    });
  }
  return createOptimizedPlaceholder(40, 30);
};

// Responsive breakpoints for mobile optimization
export const RESPONSIVE_BREAKPOINTS = {
  mobile: 320,
  tablet: 768,
  desktop: 1024,
  large: 1280
} as const;

export type BreakpointKey = keyof typeof RESPONSIVE_BREAKPOINTS;

// Get image for specific breakpoint with mobile optimization
export const getResponsiveImage = (
  baseUrl: string,
  breakpoint: BreakpointKey,
  options: Omit<ImageOptimizationOptions, 'width'> = {}
): string => {
  return optimizeUnsplashImage(baseUrl, {
    ...options,
    width: RESPONSIVE_BREAKPOINTS[breakpoint],
    quality: breakpoint === 'mobile' ? 75 : 85 // Lower quality for mobile
  });
};

// Preload critical images for better performance
export const preloadCriticalImages = (urls: string[]): void => {
  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = optimizeUnsplashImage(url, { width: 400, quality: 80 });
    document.head.appendChild(link);
  });
};