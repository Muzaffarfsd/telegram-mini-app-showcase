import React from 'react';

// Иконка - Магазин ОДЕЖДЫ (сумка для покупок)
export const ClothingIcon = () => (
  <svg width="100" height="100" viewBox="0 0 120 120" className="animated-clothing-icon" style={{display: 'block'}}>
    <defs>
      <linearGradient id="bagGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="rgba(255,255,255,1)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0.85)" />
      </linearGradient>
    </defs>
    
    <style>{`
      @keyframes bagSwing {
        0%, 100% { transform: rotate(-2deg); }
        50% { transform: rotate(2deg); }
      }
      @keyframes badgePulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }
      @keyframes sparkle {
        0%, 100% { opacity: 0.4; transform: scale(0.8); }
        50% { opacity: 1; transform: scale(1.2); }
      }
      .bag { animation: bagSwing 3s ease-in-out infinite; transform-origin: 60px 35px; }
      .badge { animation: badgePulse 2s ease-in-out infinite; }
      .sparkle { animation: sparkle 2s ease-in-out infinite; }
    `}</style>
    
    {/* Сумка для покупок */}
    <g className="bag">
      {/* Основа сумки */}
      <path d="M 35 45 L 30 85 C 30 88, 33 90, 36 90 L 84 90 C 87 90, 90 88, 90 85 L 85 45 Z" 
            fill="url(#bagGradient)" 
            stroke="rgba(255,255,255,0.5)" 
            strokeWidth="1.5" />
      
      {/* Верхний край сумки */}
      <rect x="30" y="42" width="60" height="5" rx="1" fill="rgba(255,255,255,0.9)" stroke="rgba(255,255,255,0.6)" strokeWidth="0.8" />
      
      {/* Ручки */}
      <path d="M 45 45 Q 45 30, 52 28 Q 60 27, 60 35" 
            stroke="rgba(255,255,255,0.95)" 
            strokeWidth="3" 
            fill="none" 
            strokeLinecap="round" />
      <path d="M 75 45 Q 75 30, 68 28 Q 60 27, 60 35" 
            stroke="rgba(255,255,255,0.95)" 
            strokeWidth="3" 
            fill="none" 
            strokeLinecap="round" />
      
      {/* Декор на сумке */}
      <circle cx="60" cy="65" r="10" fill="rgba(77, 208, 225, 0.3)" stroke="rgba(77, 208, 225, 0.6)" strokeWidth="1.5" />
      <path d="M 54 65 L 58 69 L 66 61" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      
      {/* Складки на сумке */}
      <line x1="42" y1="50" x2="40" y2="82" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
      <line x1="78" y1="50" x2="80" y2="82" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
    </g>
    
    {/* Значок скидки */}
    <g className="badge">
      <circle cx="85" cy="50" r="12" fill="rgba(239, 83, 80, 0.95)" stroke="white" strokeWidth="1.5" />
      <text x="85" y="54" fontSize="10" fontWeight="bold" fill="white" textAnchor="middle">-50%</text>
    </g>
    
    {/* Звездочки */}
    <g className="sparkle" style={{animationDelay: '0s'}}>
      <path d="M 20 50 l 2 5 l 5 2 l -5 2 l -2 5 l -2 -5 l -5 -2 l 5 -2 Z" fill="white" opacity="0.9" />
    </g>
    <g className="sparkle" style={{animationDelay: '0.6s'}}>
      <path d="M 100 70 l 1.5 4 l 4 1.5 l -4 1.5 l -1.5 4 l -1.5 -4 l -4 -1.5 l 4 -1.5 Z" fill="white" opacity="0.85" />
    </g>
  </svg>
);

// Иконка - ЭЛЕКТРОНИКА (ноутбук)
export const ElectronicsIcon = () => (
  <svg width="100" height="100" viewBox="0 0 120 120" className="animated-electronics-icon" style={{display: 'block'}}>

    <defs>
      <linearGradient id="laptopGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0.8)" />
      </linearGradient>
      <linearGradient id="screenGlow" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="rgba(16, 185, 129, 0.5)" />
        <stop offset="100%" stopColor="rgba(16, 185, 129, 0.2)" />
      </linearGradient>
    </defs>
    
    <style>{`
      @keyframes screenFlicker {
        0%, 100% { opacity: 0.4; }
        50% { opacity: 1; }
      }
      @keyframes typingDots {
        0%, 100% { opacity: 0.3; }
        50% { opacity: 1; }
      }
      @keyframes powerPulse {
        0%, 100% { opacity: 0.5; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.2); }
      }
      .screen-content { animation: screenFlicker 3s ease-in-out infinite; }
      .typing { animation: typingDots 1.5s ease-in-out infinite; }
      .power-light { animation: powerPulse 2s ease-in-out infinite; }
    `}</style>
    
    {/* Экран ноутбука */}
    <rect x="25" y="20" width="70" height="50" rx="3" fill="url(#laptopGradient)" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
    <rect x="28" y="23" width="64" height="44" rx="2" fill="url(#screenGlow)" className="screen-content" />
    
    {/* Контент на экране - код/интерфейс */}
    <g opacity="0.8">
      <rect x="33" y="28" width="16" height="3" rx="1.5" fill="rgba(255,255,255,0.5)" />
      <rect x="33" y="34" width="24" height="3" rx="1.5" fill="rgba(255,255,255,0.4)" />
      <rect x="33" y="40" width="20" height="3" rx="1.5" fill="rgba(255,255,255,0.5)" />
      <rect x="33" y="46" width="28" height="3" rx="1.5" fill="rgba(255,255,255,0.4)" />
      
      {/* Иконки приложений */}
      <rect x="65" y="28" width="10" height="10" rx="2" fill="rgba(255,255,255,0.4)" />
      <rect x="78" y="28" width="10" height="10" rx="2" fill="rgba(255,255,255,0.35)" />
      <rect x="65" y="41" width="10" height="10" rx="2" fill="rgba(255,255,255,0.4)" />
      <rect x="78" y="41" width="10" height="10" rx="2" fill="rgba(255,255,255,0.35)" />
    </g>
    
    {/* Камера */}
    <circle cx="60" cy="24" r="1.5" fill="rgba(16, 185, 129, 0.6)" />
    
    {/* База ноутбука */}
    <path d="M 20 72 L 25 72 L 30 70 L 90 70 L 95 72 L 100 72 L 95 78 L 25 78 Z" 
          fill="url(#laptopGradient)" 
          stroke="rgba(255,255,255,0.5)" 
          strokeWidth="1" />
    
    {/* Клавиатура */}
    <g opacity="0.6">
      {[0, 1, 2, 3, 4].map((row) => (
        <g key={row}>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((col) => (
            <rect 
              key={`${row}-${col}`}
              x={35 + col * 5.5} 
              y={73 + row * 1} 
              width="4" 
              height="0.8" 
              rx="0.3"
              fill="rgba(255,255,255,0.3)" 
            />
          ))}
        </g>
      ))}
    </g>
    
    {/* Тачпад */}
    <rect x="52" y="74" width="16" height="10" rx="1" fill="rgba(255,255,255,0.2)" />
    
    {/* Индикатор питания */}
    <circle cx="38" cy="76" r="1.5" fill="rgba(16, 185, 129, 0.8)" className="power-light" />
    
    {/* Печатающиеся точки */}
    <g className="typing" style={{animationDelay: '0s'}}>
      <circle cx="35" cy="52" r="1" fill="rgba(255,255,255,0.6)" />
    </g>
    <g className="typing" style={{animationDelay: '0.3s'}}>
      <circle cx="40" cy="52" r="1" fill="rgba(255,255,255,0.6)" />
    </g>
    <g className="typing" style={{animationDelay: '0.6s'}}>
      <circle cx="45" cy="52" r="1" fill="rgba(255,255,255,0.6)" />
    </g>
  </svg>
);

// Иконка - САЛОН КРАСОТЫ (зеркало с косметикой)
export const BeautyIcon = () => (
  <svg width="100" height="100" viewBox="0 0 120 120" className="animated-beauty-icon" style={{display: 'block'}}>
    <defs>
      <radialGradient id="mirrorGradient">
        <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0.7)" />
      </radialGradient>
      <filter id="mirrorShine">
        <feGaussianBlur stdDeviation="2"/>
        <feMerge>
          <feMergeNode/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    <style>{`
      @keyframes mirrorShine {
        0%, 100% { opacity: 0.3; transform: translateX(-10px); }
        50% { opacity: 0.8; transform: translateX(10px); }
      }
      @keyframes lipstickTwist {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-3px); }
      }
      @keyframes brushRotate {
        0%, 100% { transform: rotate(-5deg); }
        50% { transform: rotate(5deg); }
      }
      @keyframes sparkle {
        0%, 100% { opacity: 0.4; transform: scale(0.8); }
        50% { opacity: 1; transform: scale(1.2); }
      }
      .shine { animation: mirrorShine 3s ease-in-out infinite; }
      .lipstick { animation: lipstickTwist 2s ease-in-out infinite; }
      .brush { animation: brushRotate 3s ease-in-out infinite; transform-origin: 25px 55px; }
      .sparkle { animation: sparkle 2s ease-in-out infinite; }
    `}</style>
    
    {/* Зеркало */}
    <ellipse cx="60" cy="50" rx="32" ry="38" fill="url(#mirrorGradient)" filter="url(#mirrorShine)" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" />
    <ellipse cx="60" cy="50" rx="28" ry="34" fill="rgba(77, 208, 225, 0.15)" />
    
    {/* Блеск на зеркале */}
    <ellipse cx="50" cy="35" rx="15" ry="20" fill="rgba(255,255,255,0.4)" className="shine" />
    
    {/* Ножка зеркала */}
    <rect x="57" y="85" width="6" height="8" rx="1" fill="rgba(255,255,255,0.85)" />
    <ellipse cx="60" cy="85" rx="8" ry="3" fill="rgba(255,255,255,0.8)" />
    
    {/* Помада слева */}
    <g className="lipstick">
      <rect x="20" y="65" width="8" height="18" rx="1" fill="rgba(239, 83, 80, 0.9)" stroke="rgba(255,255,255,0.6)" strokeWidth="0.8" />
      <rect x="21" y="62" width="6" height="4" rx="1" fill="rgba(239, 83, 80, 1)" />
      <ellipse cx="24" cy="62" rx="3" ry="1.5" fill="rgba(255,100,100,1)" />
    </g>
    
    {/* Кисточка справа */}
    <g className="brush">
      <rect x="23" y="50" width="4" height="22" rx="0.5" fill="rgba(255,255,255,0.85)" />
      <ellipse cx="25" cy="50" rx="4" ry="6" fill="rgba(255,255,255,0.7)" />
      <path d="M 21 48 Q 25 44, 29 48" fill="rgba(255,255,255,0.6)" />
    </g>
    
    {/* Тени для век */}
    <g transform="translate(88, 60)">
      <rect x="0" y="0" width="14" height="10" rx="2" fill="rgba(255,255,255,0.8)" stroke="rgba(255,255,255,0.6)" strokeWidth="0.8" />
      <rect x="2" y="2" width="4" height="6" rx="1" fill="rgba(239, 83, 80, 0.5)" />
      <rect x="7" y="2" width="4" height="6" rx="1" fill="rgba(77, 208, 225, 0.5)" />
      <line x1="6" y1="2" x2="6" y2="8" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
    </g>
    
    {/* Блестки вокруг */}
    <g className="sparkle" style={{animationDelay: '0s'}}>
      <path d="M 35 25 l 2 5 l 5 2 l -5 2 l -2 5 l -2 -5 l -5 -2 l 5 -2 Z" fill="white" opacity="0.9" />
    </g>
    <g className="sparkle" style={{animationDelay: '0.6s'}}>
      <path d="M 85 30 l 2 5 l 5 2 l -5 2 l -2 5 l -2 -5 l -5 -2 l 5 -2 Z" fill="white" opacity="0.85" />
    </g>
    <g className="sparkle" style={{animationDelay: '1.2s'}}>
      <path d="M 75 70 l 1.5 4 l 4 1.5 l -4 1.5 l -1.5 4 l -1.5 -4 l -4 -1.5 l 4 -1.5 Z" fill="white" opacity="0.8" />
    </g>
    <g className="sparkle" style={{animationDelay: '1.8s'}}>
      <path d="M 40 75 l 1.5 4 l 4 1.5 l -4 1.5 l -1.5 4 l -1.5 -4 l -4 -1.5 l 4 -1.5 Z" fill="white" opacity="0.8" />
    </g>
  </svg>
);

// Иконка - РЕСТОРАН (клош с паром)
export const RestaurantIcon = () => (
  <svg width="100" height="100" viewBox="0 0 120 120" className="animated-restaurant-icon" style={{display: 'block'}}>
    <defs>
      <linearGradient id="cloche Gradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="rgba(255,255,255,1)" />
        <stop offset="50%" stopColor="rgba(255,255,255,0.9)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0.75)" />
      </linearGradient>
      <radialGradient id="plateGlow">
        <stop offset="0%" stopColor="rgba(16, 185, 129, 0.3)" />
        <stop offset="100%" stopColor="rgba(16, 185, 129, 0.1)" />
      </radialGradient>
    </defs>
    
    <style>{`
      @keyframes steamFloat {
        0% { opacity: 0.8; transform: translateY(0) scale(0.9); }
        100% { opacity: 0; transform: translateY(-30px) scale(1.4); }
      }
      @keyframes clocheFloat {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-4px); }
      }
      @keyframes shine {
        0%, 100% { opacity: 0.2; }
        50% { opacity: 0.6; }
      }
      .steam { animation: steamFloat 2.5s ease-out infinite; }
      .cloche { animation: clocheFloat 3s ease-in-out infinite; }
      .shine-effect { animation: shine 3s ease-in-out infinite; }
    `}</style>
    
    {/* Основание - тарелка */}
    <ellipse cx="60" cy="75" rx="42" ry="8" fill="rgba(255,255,255,0.9)" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
    <ellipse cx="60" cy="75" rx="38" ry="6" fill="url(#plateGlow)" />
    
    {/* Клош (крышка) */}
    <g className="cloche">
      <path d="M 30 70 Q 30 35, 60 25 Q 90 35, 90 70 Z" 
            fill="url(#clocheGradient)" 
            stroke="rgba(255,255,255,0.6)" 
            strokeWidth="1.5" />
      
      {/* Блеск на клоше */}
      <ellipse cx="50" cy="45" rx="12" ry="18" fill="rgba(255,255,255,0.3)" className="shine-effect" />
      
      {/* Ручка клоша */}
      <ellipse cx="60" cy="25" rx="5" ry="3" fill="rgba(255,255,255,0.95)" stroke="rgba(255,255,255,0.7)" strokeWidth="0.8" />
      <rect x="58" y="22" width="4" height="5" rx="1" fill="rgba(255,255,255,0.9)" />
      <circle cx="60" cy="22" r="2.5" fill="rgba(77, 208, 225, 0.4)" />
    </g>
    
    {/* Пар, выходящий сверху */}
    <g className="steam" style={{animationDelay: '0s'}}>
      <path d="M 52 20 Q 50 12, 52 4" stroke="rgba(255,255,255,0.9)" strokeWidth="3" fill="none" strokeLinecap="round" />
    </g>
    <g className="steam" style={{animationDelay: '0.5s'}}>
      <path d="M 60 18 Q 58 10, 60 2" stroke="rgba(255,255,255,0.9)" strokeWidth="3" fill="none" strokeLinecap="round" />
    </g>
    <g className="steam" style={{animationDelay: '1s'}}>
      <path d="M 68 20 Q 70 12, 68 4" stroke="rgba(255,255,255,0.9)" strokeWidth="3" fill="none" strokeLinecap="round" />
    </g>
    <g className="steam" style={{animationDelay: '1.5s'}}>
      <path d="M 56 19 Q 54 11, 56 3" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </g>
    <g className="steam" style={{animationDelay: '2s'}}>
      <path d="M 64 19 Q 66 11, 64 3" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </g>
    
    {/* Декоративные звездочки свежести */}
    <g className="shine-effect" style={{animationDelay: '0s'}}>
      <path d="M 25 50 l 1.5 4 l 4 1.5 l -4 1.5 l -1.5 4 l -1.5 -4 l -4 -1.5 l 4 -1.5 Z" fill="white" opacity="0.8" />
    </g>
    <g className="shine-effect" style={{animationDelay: '0.8s'}}>
      <path d="M 95 45 l 1.5 4 l 4 1.5 l -4 1.5 l -1.5 4 l -1.5 -4 l -4 -1.5 l 4 -1.5 Z" fill="white" opacity="0.8" />
    </g>
  </svg>
);

// Иконка - ФИТНЕС (сердце с пульсом)
export const FitnessIcon = () => (
  <svg width="100" height="100" viewBox="0 0 120 120" className="animated-fitness-icon" style={{display: 'block'}}>
    <defs>
      <linearGradient id="heartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="rgba(239, 83, 80, 1)" />
        <stop offset="100%" stopColor="rgba(239, 83, 80, 0.7)" />
      </linearGradient>
      <filter id="heartGlow">
        <feGaussianBlur stdDeviation="3"/>
        <feMerge>
          <feMergeNode/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    <style>{`
      @keyframes heartBeat {
        0%, 100% { transform: scale(1); }
        10% { transform: scale(1.15); }
        20% { transform: scale(1); }
        30% { transform: scale(1.1); }
        40%, 100% { transform: scale(1); }
      }
      @keyframes pulseWave {
        0% { opacity: 0; transform: translateX(-60px); }
        50% { opacity: 1; }
        100% { opacity: 0; transform: translateX(60px); }
      }
      @keyframes rateNumber {
        0%, 100% { opacity: 0.6; }
        50% { opacity: 1; }
      }
      .heart-main { animation: heartBeat 1.5s ease-in-out infinite; }
      .pulse-line { animation: pulseWave 2s ease-in-out infinite; }
      .bpm { animation: rateNumber 1.5s ease-in-out infinite; }
    `}</style>
    
    {/* Большое сердце */}
    <g className="heart-main">
      <path d="M 60 35 C 60 27, 52 20, 45 20 C 35 20, 30 27, 30 35 C 30 48, 60 70, 60 70 C 60 70, 90 48, 90 35 C 90 27, 85 20, 75 20 C 68 20, 60 27, 60 35 Z" 
            fill="url(#heartGrad)" 
            filter="url(#heartGlow)"
            stroke="rgba(255,255,255,0.8)" 
            strokeWidth="2" />
      
      {/* Блеск на сердце */}
      <ellipse cx="50" cy="32" rx="8" ry="12" fill="rgba(255,255,255,0.3)" />
    </g>
    
    {/* Линия пульса */}
    <g>
      <path d="M 15 55 L 35 55 L 40 48 L 45 62 L 50 45 L 55 55 L 105 55" 
            stroke="rgba(255,255,255,0.9)" 
            strokeWidth="2.5" 
            fill="none" 
            strokeLinecap="round" 
            strokeLinejoin="round" />
    </g>
    
    {/* Анимированная волна пульса */}
    <g className="pulse-line">
      <path d="M 0 55 L 20 55 L 25 48 L 30 62 L 35 45 L 40 55 L 60 55" 
            stroke="rgba(77, 208, 225, 0.8)" 
            strokeWidth="3" 
            fill="none" 
            strokeLinecap="round" 
            strokeLinejoin="round" />
    </g>
    
    {/* BPM индикатор */}
    <g className="bpm">
      <text x="60" y="90" fontSize="16" fontWeight="bold" fill="white" textAnchor="middle" opacity="0.9">
        120
      </text>
      <text x="60" y="102" fontSize="10" fill="rgba(255,255,255,0.7)" textAnchor="middle">
        BPM
      </text>
    </g>
    
    {/* Точки пульса */}
    <circle cx="40" cy="48" r="2.5" fill="rgba(77, 208, 225, 0.9)">
      <animate attributeName="r" values="2.5;3.5;2.5" dur="1.5s" repeatCount="indefinite" />
    </circle>
    <circle cx="45" cy="62" r="2.5" fill="rgba(77, 208, 225, 0.9)">
      <animate attributeName="r" values="2.5;3.5;2.5" dur="1.5s" begin="0.2s" repeatCount="indefinite" />
    </circle>
    <circle cx="50" cy="45" r="2.5" fill="rgba(77, 208, 225, 0.9)">
      <animate attributeName="r" values="2.5;3.5;2.5" dur="1.5s" begin="0.4s" repeatCount="indefinite" />
    </circle>
  </svg>
);

// Иконка - АВТОСЕРВИС (машина)
export const CarServiceIcon = () => (
  <svg width="100" height="100" viewBox="0 0 120 120" className="animated-carservice-icon" style={{display: 'block'}}>
    <defs>
      <linearGradient id="carGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="rgba(255,255,255,1)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0.8)" />
      </linearGradient>
      <radialGradient id="wheelGradient">
        <stop offset="0%" stopColor="rgba(100,100,100,0.8)" />
        <stop offset="100%" stopColor="rgba(150,150,150,0.6)" />
      </radialGradient>
    </defs>
    
    <style>{`
      @keyframes carFloat {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-5px); }
      }
      @keyframes wheelSpin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes wrenchFloat {
        0%, 100% { transform: translateY(0) rotate(-15deg); }
        50% { transform: translateY(-3px) rotate(-12deg); }
      }
      @keyframes sparkAnimate {
        0%, 100% { opacity: 0.3; }
        50% { opacity: 1; }
      }
      .car-body { animation: carFloat 3s ease-in-out infinite; }
      .wheel { animation: wheelSpin 2s linear infinite; }
      .wrench { animation: wrenchFloat 2s ease-in-out infinite; }
      .spark { animation: sparkAnimate 1.5s ease-in-out infinite; }
    `}</style>
    
    {/* Корпус машины */}
    <g className="car-body">
      {/* Крыша и кабина */}
      <path d="M 35 45 L 40 35 L 70 35 L 75 45 Z" 
            fill="url(#carGradient)" 
            stroke="rgba(255,255,255,0.6)" 
            strokeWidth="1.5" />
      
      {/* Кузов */}
      <rect x="25" y="45" width="60" height="18" rx="3" 
            fill="url(#carGradient)" 
            stroke="rgba(255,255,255,0.6)" 
            strokeWidth="1.5" />
      
      {/* Окна */}
      <path d="M 42 37 L 45 40 L 52 40 L 52 37 Z" fill="rgba(77, 208, 225, 0.4)" />
      <path d="M 58 37 L 58 40 L 65 40 L 68 37 Z" fill="rgba(77, 208, 225, 0.4)" />
      
      {/* Фары */}
      <circle cx="28" cy="48" r="2.5" fill="rgba(255, 255, 200, 0.8)" />
      <circle cx="82" cy="48" r="2.5" fill="rgba(255, 255, 200, 0.8)" />
      
      {/* Решетка радиатора */}
      <rect x="78" y="50" width="6" height="8" rx="1" fill="rgba(150,150,150,0.5)" />
      <line x1="79" y1="52" x2="79" y2="56" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
      <line x1="81" y1="52" x2="81" y2="56" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
      <line x1="83" y1="52" x2="83" y2="56" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
      
      {/* Дверные ручки */}
      <rect x="48" y="52" width="4" height="2" rx="0.5" fill="rgba(200,200,200,0.7)" />
      <rect x="58" y="52" width="4" height="2" rx="0.5" fill="rgba(200,200,200,0.7)" />
    </g>
    
    {/* Колеса */}
    <g>
      {/* Заднее колесо */}
      <g className="wheel" style={{transformOrigin: '38px 63px'}}>
        <circle cx="38" cy="63" r="8" fill="url(#wheelGradient)" stroke="rgba(100,100,100,0.8)" strokeWidth="1.5" />
        <circle cx="38" cy="63" r="4" fill="rgba(150,150,150,0.7)" />
        <line x1="38" y1="55" x2="38" y2="71" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
        <line x1="30" y1="63" x2="46" y2="63" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
      </g>
      
      {/* Переднее колесо */}
      <g className="wheel" style={{transformOrigin: '72px 63px'}}>
        <circle cx="72" cy="63" r="8" fill="url(#wheelGradient)" stroke="rgba(100,100,100,0.8)" strokeWidth="1.5" />
        <circle cx="72" cy="63" r="4" fill="rgba(150,150,150,0.7)" />
        <line x1="72" y1="55" x2="72" y2="71" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
        <line x1="64" y1="63" x2="80" y2="63" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
      </g>
    </g>
    
    {/* Гаечный ключ */}
    <g className="wrench" style={{transformOrigin: '92px 30px'}}>
      <rect x="88" y="25" width="20" height="5" rx="1.5" 
            fill="rgba(255,255,255,0.9)" 
            stroke="rgba(255,255,255,0.7)" 
            strokeWidth="0.8" />
      <circle cx="88" cy="27.5" r="4" 
              fill="none" 
              stroke="rgba(255,255,255,0.9)" 
              strokeWidth="2" />
      <circle cx="88" cy="27.5" r="2.5" fill="rgba(77, 208, 225, 0.4)" />
    </g>
    
    {/* Искры ремонта */}
    <g className="spark" style={{animationDelay: '0s'}}>
      <circle cx="95" cy="40" r="2" fill="rgba(255, 179, 0, 0.8)" />
      <circle cx="95" cy="40" r="3.5" fill="rgba(255, 179, 0, 0.3)" />
    </g>
    <g className="spark" style={{animationDelay: '0.4s'}}>
      <circle cx="100" cy="35" r="1.5" fill="rgba(255, 179, 0, 0.7)" />
      <circle cx="100" cy="35" r="3" fill="rgba(255, 179, 0, 0.2)" />
    </g>
    <g className="spark" style={{animationDelay: '0.8s'}}>
      <circle cx="105" cy="32" r="1.8" fill="rgba(255, 179, 0, 0.75)" />
    </g>
  </svg>
);
