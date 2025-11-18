/**
 * Accessibility utilities for WCAG 2.1 AA compliance
 */

// Focus Management
export class FocusTrap {
  private focusableElements: HTMLElement[] = [];
  private firstFocusable: HTMLElement | null = null;
  private lastFocusable: HTMLElement | null = null;
  private previousFocusedElement: HTMLElement | null = null;

  constructor(private container: HTMLElement) {
    this.updateFocusableElements();
  }

  private updateFocusableElements() {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled]):not([type="hidden"])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(',');

    const elements = Array.from(
      this.container.querySelectorAll<HTMLElement>(focusableSelectors)
    );

    this.focusableElements = elements.filter(
      el => !el.hasAttribute('disabled') && el.offsetParent !== null
    );

    this.firstFocusable = this.focusableElements[0] || null;
    this.lastFocusable = this.focusableElements[this.focusableElements.length - 1] || null;
  }

  activate() {
    this.previousFocusedElement = document.activeElement as HTMLElement;
    this.updateFocusableElements();
    this.firstFocusable?.focus();

    this.container.addEventListener('keydown', this.handleKeyDown);
  }

  deactivate() {
    this.container.removeEventListener('keydown', this.handleKeyDown);
    this.previousFocusedElement?.focus();
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;

    if (event.shiftKey) {
      if (document.activeElement === this.firstFocusable) {
        event.preventDefault();
        this.lastFocusable?.focus();
      }
    } else {
      if (document.activeElement === this.lastFocusable) {
        event.preventDefault();
        this.firstFocusable?.focus();
      }
    }
  };
}

// Keyboard Navigation Helper
export class KeyboardNavigation {
  static isNavigationKey(key: string): boolean {
    return ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter', 'Space'].includes(key);
  }

  static handleListNavigation(
    event: KeyboardEvent,
    items: HTMLElement[],
    currentIndex: number,
    options: {
      orientation?: 'vertical' | 'horizontal';
      onSelect?: (index: number) => void;
      loop?: boolean;
    } = {}
  ): number {
    const { orientation = 'vertical', onSelect, loop = true } = options;
    let newIndex = currentIndex;

    const nextKey = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight';
    const prevKey = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft';

    switch (event.key) {
      case nextKey:
        event.preventDefault();
        newIndex = currentIndex + 1;
        if (newIndex >= items.length) {
          newIndex = loop ? 0 : items.length - 1;
        }
        break;

      case prevKey:
        event.preventDefault();
        newIndex = currentIndex - 1;
        if (newIndex < 0) {
          newIndex = loop ? items.length - 1 : 0;
        }
        break;

      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;

      case 'End':
        event.preventDefault();
        newIndex = items.length - 1;
        break;

      case 'Enter':
      case ' ':
        event.preventDefault();
        onSelect?.(currentIndex);
        return currentIndex;
    }

    if (newIndex !== currentIndex && items[newIndex]) {
      items[newIndex].focus();
    }

    return newIndex;
  }
}

// Screen Reader Announcements
export class Announcer {
  private static instance: Announcer;
  private liveRegion: HTMLElement;

  private constructor() {
    this.liveRegion = this.createLiveRegion();
  }

  static getInstance(): Announcer {
    if (!Announcer.instance) {
      Announcer.instance = new Announcer();
    }
    return Announcer.instance;
  }

  private createLiveRegion(): HTMLElement {
    const region = document.createElement('div');
    region.setAttribute('role', 'status');
    region.setAttribute('aria-live', 'polite');
    region.setAttribute('aria-atomic', 'true');
    region.className = 'sr-only';
    
    // Visually hidden but accessible to screen readers
    region.style.cssText = `
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border-width: 0;
    `;
    
    document.body.appendChild(region);
    return region;
  }

  announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
    this.liveRegion.setAttribute('aria-live', priority);
    
    // Clear previous message
    this.liveRegion.textContent = '';
    
    // Set new message with small delay to ensure screen readers pick it up
    setTimeout(() => {
      this.liveRegion.textContent = message;
    }, 100);

    // Clear after announcement
    setTimeout(() => {
      this.liveRegion.textContent = '';
    }, 3000);
  }
}

// ARIA Helpers
export const aria = {
  setExpanded(element: HTMLElement, expanded: boolean) {
    element.setAttribute('aria-expanded', String(expanded));
  },

  setHidden(element: HTMLElement, hidden: boolean) {
    element.setAttribute('aria-hidden', String(hidden));
    if (hidden) {
      element.setAttribute('tabindex', '-1');
    } else {
      element.removeAttribute('tabindex');
    }
  },

  setPressed(element: HTMLElement, pressed: boolean) {
    element.setAttribute('aria-pressed', String(pressed));
  },

  setChecked(element: HTMLElement, checked: boolean | 'mixed') {
    element.setAttribute('aria-checked', String(checked));
  },

  setDisabled(element: HTMLElement, disabled: boolean) {
    element.setAttribute('aria-disabled', String(disabled));
    if (disabled) {
      element.setAttribute('tabindex', '-1');
    } else {
      element.removeAttribute('tabindex');
    }
  },

  setLabel(element: HTMLElement, label: string) {
    element.setAttribute('aria-label', label);
  },

  setLabelledBy(element: HTMLElement, id: string) {
    element.setAttribute('aria-labelledby', id);
  },

  setDescribedBy(element: HTMLElement, id: string) {
    element.setAttribute('aria-describedby', id);
  },

  setCurrent(element: HTMLElement, current: boolean | 'page' | 'step' | 'location' | 'date' | 'time') {
    if (current === false) {
      element.removeAttribute('aria-current');
    } else {
      element.setAttribute('aria-current', String(current === true ? 'true' : current));
    }
  }
};

// Contrast Ratio Calculator
export function getContrastRatio(foreground: string, background: string): number {
  const getLuminance = (color: string): number => {
    const rgb = color.match(/\d+/g)?.map(Number) || [0, 0, 0];
    const [r, g, b] = rgb.map(val => {
      const sRGB = val / 255;
      return sRGB <= 0.03928
        ? sRGB / 12.92
        : Math.pow((sRGB + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

export function meetsWCAGAA(contrastRatio: number, isLargeText: boolean = false): boolean {
  return isLargeText ? contrastRatio >= 3 : contrastRatio >= 4.5;
}

export function meetsWCAGAAA(contrastRatio: number, isLargeText: boolean = false): boolean {
  return isLargeText ? contrastRatio >= 4.5 : contrastRatio >= 7;
}

// Skip to Content Link Component Data
export const skipToContentProps = {
  href: '#main-content',
  className: 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-6 focus:py-3 focus:bg-emerald-500 focus:text-white focus:rounded-xl focus:font-semibold',
  children: 'Перейти к основному содержимому'
};
