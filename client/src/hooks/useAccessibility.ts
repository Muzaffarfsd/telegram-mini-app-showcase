import { useEffect, useCallback, useRef } from 'react';

interface AccessibilityOptions {
  enableKeyboardNav?: boolean;
  enableFocusManagement?: boolean;
  enableScreenReader?: boolean;
  skipToContentId?: string;
}

export const useAccessibility = (options: AccessibilityOptions = {}) => {
  const {
    enableKeyboardNav = true,
    enableFocusManagement = true,
    enableScreenReader = true,
    skipToContentId = 'main-content'
  } = options;
  
  const focusableElementsRef = useRef<HTMLElement[]>([]);
  
  // Focus management
  const trapFocus = useCallback((container: HTMLElement) => {
    if (!enableFocusManagement) return;
    
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    
    focusableElementsRef.current = Array.from(focusableElements);
    
    const firstElement = focusableElementsRef.current[0];
    const lastElement = focusableElementsRef.current[focusableElementsRef.current.length - 1];
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };
    
    container.addEventListener('keydown', handleTabKey);
    
    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [enableFocusManagement]);
  
  // Keyboard navigation
  useEffect(() => {
    if (!enableKeyboardNav) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC to close modals/dropdowns
      if (e.key === 'Escape') {
        const event = new CustomEvent('accessibility:escape');
        document.dispatchEvent(event);
      }
      
      // Arrow keys for navigation
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        const event = new CustomEvent('accessibility:arrow', { detail: { key: e.key } });
        document.dispatchEvent(event);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboardNav]);
  
  // Skip to content link
  useEffect(() => {
    if (!skipToContentId) return;
    
    const skipLink = document.createElement('a');
    skipLink.href = `#${skipToContentId}`;
    skipLink.className = 'skip-to-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.style.cssText = `
      position: absolute;
      left: -9999px;
      z-index: 999;
      padding: 1rem;
      background: var(--emerald-500);
      color: white;
      text-decoration: none;
      border-radius: 0.5rem;
    `;
    
    skipLink.addEventListener('focus', () => {
      skipLink.style.left = '1rem';
      skipLink.style.top = '1rem';
    });
    
    skipLink.addEventListener('blur', () => {
      skipLink.style.left = '-9999px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    return () => {
      skipLink.remove();
    };
  }, [skipToContentId]);
  
  // Announce to screen readers
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!enableScreenReader) return;
    
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      announcement.remove();
    }, 1000);
  }, [enableScreenReader]);
  
  return {
    trapFocus,
    announce
  };
};

// Screen reader only text utility
export const srOnly = {
  position: 'absolute' as const,
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap' as const,
  borderWidth: 0
};
