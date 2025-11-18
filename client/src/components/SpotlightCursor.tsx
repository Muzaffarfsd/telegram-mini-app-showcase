import { useState, useEffect } from 'react';

/**
 * SpotlightCursor - эффект свечения за курсором (2025 тренд)
 * Только для desktop устройств
 */
export const SpotlightCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // Проверка на desktop (наличие hover)
    const checkDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    setIsDesktop(checkDesktop);

    if (!checkDesktop) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Не рендерить на мобильных устройствах
  if (!isDesktop) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
      style={{
        background: `radial-gradient(600px at ${position.x}px ${position.y}px, rgba(0, 217, 255, 0.15), transparent 80%)`
      }}
      data-testid="spotlight-cursor"
    />
  );
};
