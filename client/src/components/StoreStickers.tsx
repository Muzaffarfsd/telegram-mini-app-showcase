import type { CSSProperties, ReactNode } from 'react';

// Each is an original, die-cut typographic sticker, drawn for its category.
const artwork: Record<string, ReactNode> = {
  'flower-store': (
    <g className="folder__sticker-art" style={{ '--sticker-angle': '-9deg' } as CSSProperties}>
      <path d="M60 8C67 3 75 9 77 15C85 11 93 17 92 25C101 26 105 34 100 41C107 47 104 56 96 59C98 67 91 74 83 72C80 81 70 82 64 77C57 83 47 81 44 74C35 77 28 71 29 63C20 61 17 52 22 45C15 39 19 30 27 28C25 20 32 13 40 15C44 7 53 4 60 8Z" fill="#c5ed70" stroke="#fff" strokeWidth="3" />
      <text x="60" y="52" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="900" letterSpacing="-1.3" fill="#161616">ЦВЕТ</text>
    </g>
  ),
  'apple-store': (
    <g className="folder__sticker-art" style={{ '--sticker-angle': '7deg' } as CSSProperties}>
      <path d="M13 38C17 22 27 14 40 17C47 19 47 26 55 24C61 22 63 14 72 17C89 15 103 23 108 36C113 48 104 59 92 61C84 63 81 58 74 60C65 64 61 69 53 64C46 60 42 58 34 60C21 62 9 53 13 38Z" fill="#8c35d5" stroke="#fff" strokeWidth="3" strokeLinejoin="round" />
      <text x="60" y="48" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="21" fontWeight="800" letterSpacing="-1" fill="#fff">tech</text>
    </g>
  ),
  'muraka-fashion': (
    <g className="folder__sticker-art" style={{ '--sticker-angle': '-8deg' } as CSSProperties}>
      <text x="60" y="56" textAnchor="middle" fontFamily="Arial Black, Arial, sans-serif" fontSize="25" fontWeight="900" letterSpacing="-1.7" fill="#151515" stroke="#fff" strokeWidth="7.5" strokeLinejoin="round" paintOrder="stroke fill">#style</text>
    </g>
  ),
  'nike-sneakers': (
    <g className="folder__sticker-art" style={{ '--sticker-angle': '-10deg' } as CSSProperties}>
      <path d="M12 32C18 24 28 22 37 26L48 20C58 17 63 24 70 25L83 21C95 23 103 29 109 39L99 47L105 54C99 65 91 68 79 64L66 69L53 63L39 67C27 67 17 63 11 56L16 47Z" fill="#ed403e" stroke="#fff" strokeWidth="3" />
      <text x="60" y="52" textAnchor="middle" fontFamily="Arial Black, Arial, sans-serif" fontSize="24" fontWeight="900" letterSpacing="-1" fill="#fff">ШАГ</text>
    </g>
  ),
  'lumi-studio': (
    <g className="folder__sticker-art" style={{ '--sticker-angle': '8deg' } as CSSProperties}>
      <path d="M17 43C12 34 18 24 27 25C28 15 40 11 47 18C53 9 64 11 68 19C76 13 87 17 87 26C98 24 104 34 100 43C108 50 102 61 93 61C91 71 79 75 72 68C65 77 54 74 51 67C42 74 31 69 32 60C21 62 14 53 17 43Z" fill="#9eddf3" stroke="#fff" strokeWidth="3" strokeLinejoin="round" />
      <text x="60" y="50" textAnchor="middle" fontFamily="Arial Black, Arial, sans-serif" fontSize="19" fontWeight="900" letterSpacing="-1.2" fill="#151515">БЛЕСК</text>
    </g>
  ),
  'china-buyer': (
    <g className="folder__sticker-art" style={{ '--sticker-angle': '-7deg' } as CSSProperties}>
      <path d="M15 25L34 21L39 15L54 20L72 14L79 20L98 18L96 28L108 37L102 44L108 53L96 59L97 68L80 65L70 72L56 67L42 73L34 66L18 68L20 58L12 49L18 42Z" fill="#ff9556" stroke="#fff" strokeWidth="3" strokeLinejoin="round" />
      <text x="60" y="51" textAnchor="middle" fontFamily="Arial Black, Arial, sans-serif" fontSize="21" fontWeight="900" letterSpacing="-1.2" fill="#421d1a">CHINA</text>
    </g>
  ),
  'medical-center': (
    <g className="folder__sticker-art" style={{ '--sticker-angle': '8deg' } as CSSProperties}>
      <path d="M60 74L26 47C15 38 20 22 31 19C41 16 52 21 60 31C68 21 79 16 89 19C100 22 105 38 94 47Z" fill="#e84442" stroke="#fff" strokeWidth="3.5" strokeLinejoin="round" />
    </g>
  ),
  'opt-market': (
    <g className="folder__sticker-art" style={{ '--sticker-angle': '-8deg' } as CSSProperties}>
      <path d="M19 22L36 22L43 15L57 20L69 14L79 20L99 21L97 31L106 41L100 48L105 58L94 63L94 69L77 66L66 73L55 67L42 72L35 65L17 64L20 54L12 45L20 37Z" fill="#f7d84c" stroke="#fff" strokeWidth="3" strokeLinejoin="round" />
      <text x="60" y="52" textAnchor="middle" fontFamily="Arial Black, Arial, sans-serif" fontSize="25" fontWeight="900" letterSpacing="-1" fill="#181818">ОПТ</text>
    </g>
  ),
  'women-fashion': (
    <g className="folder__sticker-art" style={{ '--sticker-angle': '7deg' } as CSSProperties}>
      <text x="60" y="57" textAnchor="middle" fontFamily="Arial Black, Arial, sans-serif" fontSize="29" fontWeight="900" letterSpacing="-2" fill="#171717" stroke="#fff" strokeWidth="7.5" strokeLinejoin="round" paintOrder="stroke fill">look!</text>
    </g>
  ),
  'skincare-aura': (
    <g className="folder__sticker-art" style={{ '--sticker-angle': '-9deg' } as CSSProperties}>
      <path d="M16 39C19 26 29 21 40 24C46 15 55 16 61 23C69 16 79 17 84 24C97 22 105 30 104 41C111 50 105 60 94 61C89 70 78 71 71 65C64 72 54 70 49 64C40 71 29 67 28 60C17 60 12 51 16 39Z" fill="#e45d95" stroke="#fff" strokeWidth="3" />
      <text x="60" y="51" textAnchor="middle" fontFamily="Arial Black, Arial, sans-serif" fontSize="23" fontWeight="900" letterSpacing="-1.2" fill="#fff">УХОД</text>
    </g>
  ),
};

// Balance narrow word cutouts against the wider coloured shapes without changing their artwork.
const opticalScales: Record<string, number> = {
  'flower-store': 0.94,
  'muraka-fashion': 1.18,
  'medical-center': 1.04,
  'women-fashion': 1.2,
};

export function StoreStickers({ id, className }: { id: string; className?: string }) {
  const scale = opticalScales[id] ?? 1;
  return (
    <svg className={className} viewBox="0 0 120 90" fill="none" aria-hidden="true" focusable="false">
      <g className="folder__sticker-scale" style={{ '--sticker-scale': scale } as CSSProperties}>
        {artwork[id] ?? artwork['opt-market']}
      </g>
    </svg>
  );
}

