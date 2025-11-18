import { useState, useRef, useEffect, type ReactNode } from 'react';
import { m } from 'framer-motion';

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

/**
 * MagneticButton - кнопка с магнитным эффектом (2025 тренд)
 * Кнопка "притягивается" к курсору при наведении
 * Только для desktop устройств
 */
export const MagneticButton = ({ children, className = '', onClick }: MagneticButtonProps) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Проверка на desktop
    const checkDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    setIsDesktop(checkDesktop);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isDesktop || !buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Смещение курсора относительно центра кнопки
    const deltaX = (e.clientX - centerX) * 0.3; // Коэффициент притяжения
    const deltaY = (e.clientY - centerY) * 0.3;

    setPosition({ x: deltaX, y: deltaY });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <m.button
      ref={buttonRef}
      className={`magnetic-button ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      animate={{
        x: position.x,
        y: position.y,
        scale: isHovered ? 1.05 : 1
      }}
      transition={{
        type: 'spring',
        stiffness: 150,
        damping: 15,
        mass: 0.1
      }}
      data-testid="magnetic-button"
    >
      {children}
    </m.button>
  );
};
