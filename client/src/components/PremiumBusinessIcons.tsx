import { motion } from '@/utils/LazyMotionProvider';

// Профессиональные анимированные SVG иконки для каждого бизнеса

// 1. Магазин одежды
export const ClothingStoreIcon = () => (
  <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
    <motion.g
      animate={{ 
        y: [0, -3, 0],
        rotate: [0, 2, 0, -2, 0]
      }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Вешалка */}
      <motion.path
        d="M30 25 L50 15 L70 25"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
      />
      {/* Платье */}
      <motion.path
        d="M35 30 L35 75 L45 80 L55 80 L65 75 L65 30 Z"
        fill="url(#clothingGrad)"
        stroke="white"
        strokeWidth="2"
        animate={{ opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      {/* Пояс */}
      <rect x="33" y="50" width="34" height="3" fill="white" opacity="0.6" rx="1.5"/>
    </motion.g>
    <defs>
      <linearGradient id="clothingGrad" x1="35" y1="30" x2="65" y2="80">
        <stop offset="0%" stopColor="#E0F7FA" />
        <stop offset="100%" stopColor="#80DEEA" />
      </linearGradient>
    </defs>
  </svg>
);

// 2. Электроника
export const ElectronicsIcon = () => (
  <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
    <motion.g
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      {/* Смартфон */}
      <rect x="30" y="20" width="40" height="60" rx="4" fill="url(#phoneGrad)" stroke="white" strokeWidth="2.5"/>
      {/* Экран */}
      <motion.rect 
        x="34" y="28" width="32" height="44" rx="2" 
        fill="white" 
        opacity="0.9"
        animate={{ opacity: [0.7, 0.9, 0.7] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      {/* Кнопка */}
      <circle cx="50" cy="75" r="2.5" fill="white" opacity="0.8"/>
      {/* Волны сигнала */}
      {[0, 1, 2].map((i) => (
        <motion.path
          key={i}
          d={`M ${75 + i * 5} ${35 - i * 5} Q ${80 + i * 5} ${40 - i * 5} ${75 + i * 5} ${45 - i * 5}`}
          stroke="white"
          strokeWidth="2"
          fill="none"
          opacity="0.6"
          animate={{ opacity: [0, 0.8, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
        />
      ))}
    </motion.g>
    <defs>
      <linearGradient id="phoneGrad" x1="30" y1="20" x2="70" y2="80">
        <stop offset="0%" stopColor="#1E3A8A" />
        <stop offset="100%" stopColor="#3B82F6" />
      </linearGradient>
    </defs>
  </svg>
);

// 3. Салон красоты
export const BeautyIcon = () => (
  <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
    {/* Помада */}
    <motion.g
      animate={{ rotate: [0, 5, 0, -5, 0] }}
      transition={{ duration: 3, repeat: Infinity }}
      style={{ originX: '50%', originY: '50%' }}
    >
      <rect x="42" y="60" width="16" height="25" rx="2" fill="url(#lipstickGrad)" stroke="white" strokeWidth="2"/>
      <motion.path
        d="M42 60 L46 45 L54 45 L58 60"
        fill="#E91E63"
        stroke="white"
        strokeWidth="2"
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    </motion.g>
    {/* Сияние */}
    {[0, 1, 2, 3].map((i) => (
      <motion.circle
        key={i}
        cx={35 + i * 10}
        cy={25 + (i % 2) * 8}
        r="2"
        fill="white"
        opacity="0.8"
        animate={{ 
          scale: [0, 1.5, 0],
          opacity: [0, 0.8, 0]
        }}
        transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
      />
    ))}
    <defs>
      <linearGradient id="lipstickGrad" x1="42" y1="60" x2="58" y2="85">
        <stop offset="0%" stopColor="#F06292" />
        <stop offset="100%" stopColor="#EC407A" />
      </linearGradient>
    </defs>
  </svg>
);

// 4. Ресторан
export const RestaurantIcon = () => (
  <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
    <motion.g
      animate={{ rotate: [0, 3, 0, -3, 0] }}
      transition={{ duration: 4, repeat: Infinity }}
      style={{ originX: '50%', originY: '60%' }}
    >
      {/* Крышка */}
      <motion.ellipse
        cx="50" cy="35" rx="25" ry="8"
        fill="url(#clocheGrad)"
        stroke="white"
        strokeWidth="2.5"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      {/* Купол */}
      <path
        d="M25 35 Q25 20 50 20 Q75 20 75 35"
        fill="url(#clocheGrad)"
        stroke="white"
        strokeWidth="2.5"
        opacity="0.9"
      />
      {/* Ручка */}
      <circle cx="50" cy="18" r="3" fill="white" opacity="0.9"/>
      {/* Блюдо */}
      <ellipse cx="50" cy="70" rx="30" ry="5" fill="white" opacity="0.3" stroke="white" strokeWidth="2"/>
    </motion.g>
    {/* Пар */}
    {[0, 1, 2].map((i) => (
      <motion.path
        key={i}
        d={`M ${45 + i * 5} 30 Q ${47 + i * 5} 20 ${45 + i * 5} 10`}
        stroke="white"
        strokeWidth="2"
        fill="none"
        opacity="0.5"
        animate={{ 
          y: [-5, -15],
          opacity: [0.5, 0]
        }}
        transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
      />
    ))}
    <defs>
      <linearGradient id="clocheGrad" x1="25" y1="20" x2="75" y2="35">
        <stop offset="0%" stopColor="#FFEB3B" />
        <stop offset="100%" stopColor="#FFC107" />
      </linearGradient>
    </defs>
  </svg>
);

// 5. Кофейня
export const CoffeeIcon = () => (
  <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
    <motion.g
      animate={{ y: [0, -2, 0] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      {/* Чашка */}
      <path
        d="M30 40 L35 70 Q35 75 40 75 L60 75 Q65 75 65 70 L70 40 Z"
        fill="url(#coffeeGrad)"
        stroke="white"
        strokeWidth="2.5"
      />
      {/* Ручка */}
      <path
        d="M70 45 Q80 45 80 55 Q80 65 70 65"
        stroke="white"
        strokeWidth="2.5"
        fill="none"
      />
      {/* Кофе */}
      <motion.ellipse
        cx="50" cy="42" rx="18" ry="4"
        fill="#6D4C41"
        opacity="0.8"
        animate={{ opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    </motion.g>
    {/* Пар */}
    {[0, 1, 2].map((i) => (
      <motion.path
        key={i}
        d={`M ${42 + i * 8} 35 Q ${44 + i * 8} 25 ${42 + i * 8} 15`}
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
        animate={{ 
          y: [-3, -10],
          opacity: [0.7, 0]
        }}
        transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
      />
    ))}
    <defs>
      <linearGradient id="coffeeGrad" x1="30" y1="40" x2="70" y2="75">
        <stop offset="0%" stopColor="#D7CCC8" />
        <stop offset="100%" stopColor="#A1887F" />
      </linearGradient>
    </defs>
  </svg>
);

// 6. Премиум часы
export const WatchIcon = () => (
  <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
    <motion.g
      animate={{ rotate: 360 }}
      transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      style={{ originX: '50%', originY: '50%' }}
    >
      {/* Циферблат */}
      <circle cx="50" cy="50" r="25" fill="url(#watchGrad)" stroke="white" strokeWidth="3"/>
      {/* Метки */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => (
        <line
          key={i}
          x1="50"
          y1="28"
          x2="50"
          y2="32"
          stroke="white"
          strokeWidth={i % 3 === 0 ? "2.5" : "1.5"}
          transform={`rotate(${angle} 50 50)`}
          opacity="0.9"
        />
      ))}
    </motion.g>
    {/* Стрелка часовая */}
    <motion.line
      x1="50" y1="50" x2="50" y2="38"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      animate={{ rotate: [0, 360] }}
      transition={{ duration: 43200, repeat: Infinity, ease: "linear" }}
      style={{ originX: '50%', originY: '50%' }}
    />
    {/* Стрелка минутная */}
    <motion.line
      x1="50" y1="50" x2="50" y2="32"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      animate={{ rotate: [0, 360] }}
      transition={{ duration: 3600, repeat: Infinity, ease: "linear" }}
      style={{ originX: '50%', originY: '50%' }}
    />
    {/* Центр */}
    <circle cx="50" cy="50" r="3" fill="white"/>
    <defs>
      <radialGradient id="watchGrad">
        <stop offset="0%" stopColor="#424242" />
        <stop offset="100%" stopColor="#212121" />
      </radialGradient>
    </defs>
  </svg>
);

// 7. Дизайн интерьера (AR)
export const InteriorDesignIcon = () => (
  <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
    <motion.g
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 3, repeat: Infinity }}
    >
      {/* 3D Куб */}
      <path d="M50 25 L70 35 L70 55 L50 65 L30 55 L30 35 Z" fill="url(#cubeGrad1)" stroke="white" strokeWidth="2"/>
      <path d="M50 25 L50 45 L70 55 L70 35 Z" fill="url(#cubeGrad2)" stroke="white" strokeWidth="2"/>
      <path d="M50 25 L30 35 L30 55 L50 45 Z" fill="url(#cubeGrad3)" stroke="white" strokeWidth="2"/>
      {/* AR маркеры */}
      {[[25, 25], [75, 25], [25, 75], [75, 75]].map(([x, y], i) => (
        <motion.g key={i}>
          <rect x={x - 3} y={y - 3} width="6" height="6" fill="none" stroke="white" strokeWidth="1.5"/>
          <motion.circle
            cx={x} cy={y} r="1.5"
            fill="#00E5FF"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
          />
        </motion.g>
      ))}
    </motion.g>
    <defs>
      <linearGradient id="cubeGrad1" x1="30" y1="35" x2="70" y2="55">
        <stop offset="0%" stopColor="#FFE082" />
        <stop offset="100%" stopColor="#FFB300" />
      </linearGradient>
      <linearGradient id="cubeGrad2" x1="50" y1="25" x2="70" y2="55">
        <stop offset="0%" stopColor="#FFCA28" />
        <stop offset="100%" stopColor="#FF8F00" />
      </linearGradient>
      <linearGradient id="cubeGrad3" x1="30" y1="35" x2="50" y2="55">
        <stop offset="0%" stopColor="#FFF59D" />
        <stop offset="100%" stopColor="#FFCA28" />
      </linearGradient>
    </defs>
  </svg>
);

// 8. Магазин кроссовок
export const SneakerIcon = () => (
  <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
    <motion.g
      animate={{ 
        x: [0, 3, 0],
        rotate: [0, -2, 0]
      }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      {/* Кроссовок */}
      <path
        d="M20 55 L25 45 L35 40 L50 38 L65 40 L75 45 L80 55 L75 65 L25 65 Z"
        fill="url(#sneakerGrad)"
        stroke="white"
        strokeWidth="2.5"
      />
      {/* Подошва */}
      <path d="M25 65 L75 65 L78 70 L22 70 Z" fill="white" opacity="0.9" stroke="white" strokeWidth="2"/>
      {/* Логотип */}
      <motion.path
        d="M40 50 L45 48 L50 50 L55 48 L60 50"
        stroke="white"
        strokeWidth="2"
        fill="none"
        animate={{ pathLength: [0, 1, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      {/* Шнурки */}
      {[0, 1, 2].map((i) => (
        <line
          key={i}
          x1={35 + i * 10} y1="45"
          x2={40 + i * 10} y2="42"
          stroke="white"
          strokeWidth="1.5"
          opacity="0.8"
        />
      ))}
    </motion.g>
    {/* Скорость */}
    {[0, 1, 2].map((i) => (
      <motion.line
        key={i}
        x1={15 - i * 5} y1={50 + i * 3}
        x2={20 - i * 5} y2={50 + i * 3}
        stroke="white"
        strokeWidth="2"
        opacity="0.6"
        animate={{ x: [0, -10], opacity: [0.6, 0] }}
        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
      />
    ))}
    <defs>
      <linearGradient id="sneakerGrad" x1="20" y1="38" x2="80" y2="65">
        <stop offset="0%" stopColor="#EF5350" />
        <stop offset="100%" stopColor="#E53935" />
      </linearGradient>
    </defs>
  </svg>
);

// 9. Ювелирный бутик
export const JewelryIcon = () => (
  <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
    <motion.g
      animate={{ rotate: [0, 5, -5, 0] }}
      transition={{ duration: 4, repeat: Infinity }}
      style={{ originX: '50%', originY: '50%' }}
    >
      {/* Бриллиант */}
      <path d="M50 20 L70 40 L50 75 L30 40 Z" fill="url(#diamondGrad)" stroke="white" strokeWidth="2.5"/>
      <path d="M30 40 L50 40 L70 40" stroke="white" strokeWidth="2" opacity="0.7"/>
      <path d="M50 20 L50 75" stroke="white" strokeWidth="2" opacity="0.7"/>
      <path d="M40 30 L60 30" stroke="white" strokeWidth="1.5" opacity="0.5"/>
    </motion.g>
    {/* Блики */}
    {[0, 1, 2, 3, 4].map((i) => (
      <motion.circle
        key={i}
        cx={40 + i * 5}
        cy={25 + (i % 2) * 10}
        r="2"
        fill="white"
        opacity="0.9"
        animate={{ 
          scale: [0, 1.5, 0],
          opacity: [0, 1, 0]
        }}
        transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
      />
    ))}
    <defs>
      <linearGradient id="diamondGrad" x1="30" y1="20" x2="70" y2="75">
        <stop offset="0%" stopColor="#E1F5FE" />
        <stop offset="50%" stopColor="#81D4FA" />
        <stop offset="100%" stopColor="#29B6F6" />
      </linearGradient>
    </defs>
  </svg>
);

// 10. Виниловый магазин
export const VinylIcon = () => (
  <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
    <motion.g
      animate={{ rotate: 360 }}
      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      style={{ originX: '50%', originY: '50%' }}
    >
      {/* Пластинка */}
      <circle cx="50" cy="50" r="28" fill="url(#vinylGrad)" stroke="white" strokeWidth="2.5"/>
      {/* Канавки */}
      {[22, 18, 14, 10].map((r, i) => (
        <circle
          key={i}
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="white"
          strokeWidth="0.5"
          opacity="0.4"
        />
      ))}
      {/* Центр */}
      <circle cx="50" cy="50" r="8" fill="#424242" stroke="white" strokeWidth="2"/>
      <circle cx="50" cy="50" r="3" fill="white"/>
    </motion.g>
    {/* Нота */}
    <motion.g
      animate={{ y: [0, -5, 0], opacity: [0.7, 1, 0.7] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <circle cx="75" cy="30" r="4" fill="white"/>
      <rect x="78" y="20" width="2" height="14" fill="white"/>
    </motion.g>
    <defs>
      <radialGradient id="vinylGrad">
        <stop offset="0%" stopColor="#212121" />
        <stop offset="100%" stopColor="#000000" />
      </radialGradient>
    </defs>
  </svg>
);

// 11. Крафтовый маркет
export const ArtisanIcon = () => (
  <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
    <motion.g animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }}>
      {/* Молоток */}
      <rect x="35" y="50" width="8" height="30" rx="2" fill="#8D6E63" stroke="white" strokeWidth="2"/>
      <rect x="28" y="42" width="22" height="12" rx="2" fill="#6D4C41" stroke="white" strokeWidth="2"/>
      {/* Искры */}
      {[0, 1, 2].map((i) => (
        <motion.circle key={i} cx={50 + i * 10} cy={35 - i * 5} r="2" fill="#FFD54F"
          animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }} />
      ))}
    </motion.g>
    <defs>
      <linearGradient id="hammerGrad" x1="28" y1="42" x2="50" y2="80">
        <stop offset="0%" stopColor="#A1887F" /><stop offset="100%" stopColor="#795548" />
      </linearGradient>
    </defs>
  </svg>
);

// 12. Чайный клуб
export const TeaIcon = () => (
  <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
    <motion.g animate={{ y: [0, -2, 0] }} transition={{ duration: 3, repeat: Infinity }}>
      {/* Чайник */}
      <ellipse cx="50" cy="65" rx="20" ry="8" fill="#4CAF50" opacity="0.3"/>
      <path d="M35 50 L35 65 Q35 70 40 70 L60 70 Q65 70 65 65 L65 50 Q65 45 60 45 L40 45 Q35 45 35 50 Z" fill="url(#teapotGrad)" stroke="white" strokeWidth="2.5"/>
      {/* Носик */}
      <path d="M65 55 L75 50" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Крышка */}
      <ellipse cx="50" cy="45" rx="12" ry="4" fill="#388E3C" stroke="white" strokeWidth="2"/>
      <circle cx="50" cy="42" r="2" fill="white"/>
      {/* Пар */}
      {[0, 1].map((i) => (
        <motion.path key={i} d={`M ${45 + i * 10} 40 Q ${47 + i * 10} 30 ${45 + i * 10} 20`} stroke="white" strokeWidth="2" fill="none" opacity="0.6"
          animate={{ y: [-3, -10], opacity: [0.6, 0] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }} />
      ))}
    </motion.g>
    <defs>
      <linearGradient id="teapotGrad" x1="35" y1="45" x2="65" y2="70">
        <stop offset="0%" stopColor="#66BB6A" /><stop offset="100%" stopColor="#43A047" />
      </linearGradient>
    </defs>
  </svg>
);

// 13. Магазин гаджетов
export const GadgetIcon = () => (
  <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
    <motion.g animate={{ rotateY: [0, 180, 360] }} transition={{ duration: 4, repeat: Infinity }} style={{ transformOrigin: 'center' }}>
      {/* Умные часы */}
      <rect x="35" y="35" width="30" height="35" rx="8" fill="url(#gadgetGrad)" stroke="white" strokeWidth="2.5"/>
      <motion.rect x="39" y="40" width="22" height="15" rx="2" fill="white" opacity="0.8" animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2, repeat: Infinity }}/>
      {/* Пульс */}
      <motion.path d="M42 48 L45 45 L48 51 L51 45 L54 48" stroke="#4CAF50" strokeWidth="2" fill="none" strokeLinecap="round"
        animate={{ pathLength: [0, 1], opacity: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity }} />
    </motion.g>
    <defs>
      <linearGradient id="gadgetGrad" x1="35" y1="35" x2="65" y2="70">
        <stop offset="0%" stopColor="#424242" /><stop offset="100%" stopColor="#212121" />
      </linearGradient>
    </defs>
  </svg>
);

// 14. Фитнес клуб
export const FitnessIcon = () => (
  <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
    <motion.g animate={{ rotate: [0, 45, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ originX: '50%', originY: '50%' }}>
      {/* Гантель */}
      <circle cx="30" cy="50" r="8" fill="url(#dumbbellGrad)" stroke="white" strokeWidth="2.5"/>
      <rect x="36" y="47" width="28" height="6" rx="3" fill="#424242" stroke="white" strokeWidth="2"/>
      <circle cx="70" cy="50" r="8" fill="url(#dumbbellGrad)" stroke="white" strokeWidth="2.5"/>
      {/* Блики */}
      <circle cx="32" cy="48" r="2" fill="white" opacity="0.7"/>
      <circle cx="72" cy="48" r="2" fill="white" opacity="0.7"/>
    </motion.g>
    <defs>
      <radialGradient id="dumbbellGrad">
        <stop offset="0%" stopColor="#78909C" /><stop offset="100%" stopColor="#455A64" />
      </radialGradient>
    </defs>
  </svg>
);

// 15. Студия йоги
export const YogaIcon = () => (
  <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
    <motion.g animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity }}>
      {/* Человек в позе лотоса */}
      <circle cx="50" cy="30" r="8" fill="url(#yogaGrad)" stroke="white" strokeWidth="2"/>
      <path d="M50 38 L50 55" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M50 45 L35 50 L30 60" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M50 45 L65 50 L70 60" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M50 55 L40 65 L30 70" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M50 55 L60 65 L70 70" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Аура */}
      {[0, 1, 2].map((i) => (
        <motion.circle key={i} cx="50" cy="30" r={15 + i * 8} stroke="#9C27B0" strokeWidth="1.5" fill="none" opacity="0.4"
          animate={{ scale: [1, 1.3], opacity: [0.4, 0] }} transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }} />
      ))}
    </motion.g>
    <defs>
      <linearGradient id="yogaGrad">
        <stop offset="0%" stopColor="#CE93D8" /><stop offset="100%" stopColor="#AB47BC" />
      </linearGradient>
    </defs>
  </svg>
);

// 16. Автосервис
export const CarServiceIcon = () => (
  <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
    <motion.g animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity }}>
      {/* Гаечный ключ */}
      <path d="M60 30 L70 20 L75 25 L65 35 L60 40 L50 50 L35 65 L30 60 L45 45 Z" fill="url(#wrenchGrad)" stroke="white" strokeWidth="2.5"/>
      <circle cx="72" cy="23" r="3" fill="white" opacity="0.8"/>
      {/* Искры */}
      {[0, 1, 2].map((i) => (
        <motion.line key={i} x1={35 - i * 3} y1={65 + i * 3} x2={30 - i * 3} y2={70 + i * 3} stroke="#FF9800" strokeWidth="2" strokeLinecap="round"
          animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }} />
      ))}
    </motion.g>
    <defs>
      <linearGradient id="wrenchGrad" x1="30" y1="20" x2="75" y2="65">
        <stop offset="0%" stopColor="#90A4AE" /><stop offset="100%" stopColor="#607D8B" />
      </linearGradient>
    </defs>
  </svg>
);

// 17. Агентство недвижимости (VR)
export const RealEstateIcon = () => (
  <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
    <motion.g animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 3, repeat: Infinity }}>
      {/* Дом */}
      <path d="M50 25 L75 45 L75 70 L25 70 L25 45 Z" fill="url(#houseGrad)" stroke="white" strokeWidth="2.5"/>
      <rect x="42" y="52" width="16" height="18" fill="#3E2723" stroke="white" strokeWidth="2"/>
      <rect x="30" y="48" width="10" height="10" fill="#81C784" stroke="white" strokeWidth="1.5"/>
      <rect x="60" y="48" width="10" height="10" fill="#81C784" stroke="white" strokeWidth="1.5"/>
      {/* VR маркеры */}
      {[[20, 35], [80, 35], [50, 75]].map(([x, y], i) => (
        <motion.circle key={i} cx={x} cy={y} r="3" fill="#00BCD4" stroke="white" strokeWidth="1.5"
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }} />
      ))}
    </motion.g>
    <defs>
      <linearGradient id="houseGrad" x1="25" y1="25" x2="75" y2="70">
        <stop offset="0%" stopColor="#FFCCBC" /><stop offset="100%" stopColor="#FF8A65" />
      </linearGradient>
    </defs>
  </svg>
);

// 18-28 (оставшиеся иконки)
export const TravelIcon = () => (
  <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
    <motion.g animate={{ x: [0, 10, 0], y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity }}>
      <path d="M30 50 L50 30 L70 50 L60 50 L60 70 L40 70 L40 50 Z" fill="url(#planeGrad)" stroke="white" strokeWidth="2.5"/>
      <circle cx="50" cy="40" r="5" fill="white" opacity="0.8"/>
    </motion.g>
    <defs><linearGradient id="planeGrad"><stop offset="0%" stopColor="#42A5F5"/><stop offset="100%" stopColor="#1E88E5"/></linearGradient></defs>
  </svg>
);

export const EducationIcon = () => (
  <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
    <motion.g animate={{ rotateY: [0, 180, 360] }} transition={{ duration: 5, repeat: Infinity }}>
      <path d="M30 40 L50 30 L70 40 L70 60 L50 70 L30 60 Z" fill="url(#bookGrad)" stroke="white" strokeWidth="2.5"/>
      <line x1="50" y1="30" x2="50" y2="70" stroke="white" strokeWidth="2"/>
    </motion.g>
    <defs><linearGradient id="bookGrad"><stop offset="0%" stopColor="#7E57C2"/><stop offset="100%" stopColor="#5E35B1"/></linearGradient></defs>
  </svg>
);

export const PetShopIcon = () => (
  <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
    <motion.g animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ originX: '50%', originY: '65%' }}>
      <ellipse cx="50" cy="55" rx="18" ry="22" fill="url(#pawGrad)" stroke="white" strokeWidth="2.5"/>
      {[[38, 40], [50, 35], [62, 40]].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx="6" ry="8" fill="url(#pawGrad)" stroke="white" strokeWidth="2"/>
      ))}
    </motion.g>
    <defs><linearGradient id="pawGrad"><stop offset="0%" stopColor="#FF7043"/><stop offset="100%" stopColor="#F4511E"/></linearGradient></defs>
  </svg>
);

export const BookstoreIcon = () => (
  <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
    <motion.g animate={{ y: [0, -2, 0] }} transition={{ duration: 2, repeat: Infinity }}>
      {[0, 1, 2].map((i) => (
        <rect key={i} x={32 + i * 12} y={35 - i * 3} width="10" height="40" rx="1" fill={`url(#book${i}Grad)`} stroke="white" strokeWidth="2"/>
      ))}
    </motion.g>
    <defs>
      <linearGradient id="book0Grad"><stop offset="0%" stopColor="#EF5350"/><stop offset="100%" stopColor="#E53935"/></linearGradient>
      <linearGradient id="book1Grad"><stop offset="0%" stopColor="#66BB6A"/><stop offset="100%" stopColor="#43A047"/></linearGradient>
      <linearGradient id="book2Grad"><stop offset="0%" stopColor="#42A5F5"/><stop offset="100%" stopColor="#1E88E5"/></linearGradient>
    </defs>
  </svg>
);

export const FlowerIcon = () => (
  <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
    <motion.g animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity }}>
      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <ellipse key={angle} cx="50" cy="35" rx="8" ry="14" fill="url(#petalGrad)" stroke="white" strokeWidth="1.5" transform={`rotate(${angle} 50 50)`}/>
      ))}
      <circle cx="50" cy="50" r="8" fill="#FDD835" stroke="white" strokeWidth="2"/>
      <rect x="48" y="50" width="4" height="30" rx="2" fill="#4CAF50" stroke="white" strokeWidth="1.5"/>
    </motion.g>
    <defs><linearGradient id="petalGrad"><stop offset="0%" stopColor="#F48FB1"/><stop offset="100%" stopColor="#EC407A"/></linearGradient></defs>
  </svg>
);

export const PerfumeIcon = () => (
  <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
    <motion.g animate={{ y: [0, -2, 0] }} transition={{ duration: 2, repeat: Infinity }}>
      <rect x="40" y="30" width="20" height="8" rx="2" fill="url(#capGrad)" stroke="white" strokeWidth="2"/>
      <rect x="38" y="38" width="24" height="35" rx="3" fill="url(#bottleGrad)" stroke="white" strokeWidth="2.5"/>
      <rect x="42" y="45" width="16" height="3" fill="white" opacity="0.6"/>
      {/* Спрей */}
      {[0, 1, 2].map((i) => (
        <motion.circle key={i} cx={35 - i * 3} cy={25 - i * 5} r="1.5" fill="#D1C4E9" opacity="0.7"
          animate={{ y: [-5, -15], opacity: [0.7, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }} />
      ))}
    </motion.g>
    <defs>
      <linearGradient id="bottleGrad"><stop offset="0%" stopColor="#CE93D8"/><stop offset="100%" stopColor="#AB47BC"/></linearGradient>
      <linearGradient id="capGrad"><stop offset="0%" stopColor="#FFD54F"/><stop offset="100%" stopColor="#FFC107"/></linearGradient>
    </defs>
  </svg>
);

export const GamingIcon = () => (
  <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
    <motion.g animate={{ rotate: [0, 3, -3, 0] }} transition={{ duration: 2, repeat: Infinity }}>
      <path d="M30 45 Q30 35 40 35 L60 35 Q70 35 70 45 L70 60 Q70 70 60 70 L40 70 Q30 70 30 60 Z" fill="url(#controllerGrad)" stroke="white" strokeWidth="2.5"/>
      <circle cx="42" cy="52" r="5" stroke="white" strokeWidth="2" fill="none"/>
      <circle cx="58" cy="50" r="3" fill="#4CAF50" stroke="white" strokeWidth="1.5"/>
      <circle cx="63" cy="55" r="3" fill="#F44336" stroke="white" strokeWidth="1.5"/>
    </motion.g>
    <defs><linearGradient id="controllerGrad"><stop offset="0%" stopColor="#424242"/><stop offset="100%" stopColor="#212121"/></linearGradient></defs>
  </svg>
);

export const MedicalIcon = () => (
  <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
    <motion.g animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
      <rect x="35" y="45" width="30" height="10" rx="2" fill="url(#crossGrad)" stroke="white" strokeWidth="2.5"/>
      <rect x="45" y="35" width="10" height="30" rx="2" fill="url(#crossGrad)" stroke="white" strokeWidth="2.5"/>
      {/* Пульс */}
      <motion.circle cx="50" cy="50" r="20" stroke="#4CAF50" strokeWidth="2" fill="none" opacity="0.5"
        animate={{ scale: [1, 1.3], opacity: [0.5, 0] }} transition={{ duration: 2, repeat: Infinity }} />
    </motion.g>
    <defs><linearGradient id="crossGrad"><stop offset="0%" stopColor="#EF5350"/><stop offset="100%" stopColor="#E53935"/></linearGradient></defs>
  </svg>
);

export const CarRentalIcon = () => (
  <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
    <motion.g animate={{ x: [0, 5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
      <path d="M25 55 L30 45 L40 45 L45 40 L55 40 L60 45 L70 45 L75 55 L75 65 L25 65 Z" fill="url(#carGrad)" stroke="white" strokeWidth="2.5"/>
      <circle cx="35" cy="65" r="5" fill="#424242" stroke="white" strokeWidth="2"/>
      <circle cx="65" cy="65" r="5" fill="#424242" stroke="white" strokeWidth="2"/>
      <rect x="42" y="47" width="7" height="6" fill="white" opacity="0.7"/>
      <rect x="51" y="47" width="7" height="6" fill="white" opacity="0.7"/>
    </motion.g>
    <defs><linearGradient id="carGrad"><stop offset="0%" stopColor="#42A5F5"/><stop offset="100%" stopColor="#1E88E5"/></linearGradient></defs>
  </svg>
);

export const LegalIcon = () => (
  <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
    <motion.g animate={{ rotateY: [0, 15, 0] }} transition={{ duration: 3, repeat: Infinity }}>
      <path d="M30 30 L70 30 L70 75 L30 75 Z" fill="url(#docGrad)" stroke="white" strokeWidth="2.5"/>
      {[42, 50, 58, 66].map((y, i) => (
        <line key={i} x1="35" y1={y} x2="65" y2={y} stroke="white" strokeWidth="2" opacity="0.7"/>
      ))}
      <circle cx="58" cy="72" r="8" fill="#FDD835" stroke="white" strokeWidth="2"/>
    </motion.g>
    <defs><linearGradient id="docGrad"><stop offset="0%" stopColor="#FFEB3B"/><stop offset="100%" stopColor="#FBC02D"/></linearGradient></defs>
  </svg>
);

export const getBusinessIcon = (appId: string) => {
  const icons: Record<string, JSX.Element> = {
    'clothing-store': <ClothingStoreIcon />,
    'electronics': <ElectronicsIcon />,
    'beauty': <BeautyIcon />,
    'restaurant': <RestaurantIcon />,
    'coffee': <CoffeeIcon />,
    'luxury-watches': <WatchIcon />,
    'home-decor': <InteriorDesignIcon />,
    'sneaker-store': <SneakerIcon />,
    'premium-tea': <TeaIcon />,
    'tech-gadgets': <GadgetIcon />,
    'fitness-club': <FitnessIcon />,
    'yoga-studio': <YogaIcon />,
    'car-service': <CarServiceIcon />,
    'online-education': <EducationIcon />,
    'pet-shop': <PetShopIcon />,
    'bookstore': <BookstoreIcon />,
    'flower-delivery': <FlowerIcon />,
    'luxury-perfume': <PerfumeIcon />,
    'gaming-gear': <GamingIcon />,
    'medical': <MedicalIcon />,
    'car-rental': <CarRentalIcon />,
  };
  
  return icons[appId] || <ClothingStoreIcon />;
};
