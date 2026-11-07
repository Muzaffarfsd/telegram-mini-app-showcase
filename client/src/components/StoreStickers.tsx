import type { ReactNode } from 'react';

// Original die-cut symbols: bold silhouettes stay legible at folder scale.
const artwork: Record<string, ReactNode> = {
  'flower-store': (
    <g transform="rotate(-8 50 50)" strokeLinejoin="round">
      <path d="M50 51C38 47 30 37 31 25C32 15 42 12 50 20C58 12 68 15 69 25C70 37 62 47 50 51ZM50 51C39 54 25 52 19 43C14 35 20 27 30 30C31 40 39 48 50 51ZM50 51C61 54 75 52 81 43C86 35 80 27 70 30C69 40 61 48 50 51ZM50 51V78" fill="#e64947" stroke="#fff" strokeWidth="8" strokeLinecap="round" />
      <path d="M50 51C38 47 30 37 31 25C32 15 42 12 50 20Z" fill="#f66e5d" />
      <path d="M50 51C62 47 70 37 69 25C68 15 58 12 50 20Z" fill="#d83f50" />
      <path d="M50 51C39 54 25 52 19 43C14 35 20 27 30 30C31 40 39 48 50 51Z" fill="#f3a441" />
      <path d="M50 51C61 54 75 52 81 43C86 35 80 27 70 30C69 40 61 48 50 51Z" fill="#e95b4c" />
      <path d="M50 51V78" fill="none" stroke="#1c7558" strokeWidth="7" strokeLinecap="round" />
    </g>
  ),
  'apple-store': (
    <g transform="rotate(7 50 50)" fill="#131313" stroke="#fff" strokeWidth="7" strokeLinejoin="round">
      <path d="M51 25C47 16 51 8 63 7C64 17 59 23 51 25Z" />
      <path d="M50 32C44 32 40 26 32 27C20 28 15 40 18 53C20 66 30 80 37 81C43 81 45 77 51 77C57 77 59 81 65 81C72 81 79 70 82 62C72 58 70 46 80 40C75 28 65 25 58 28C55 29 52 32 50 32Z" />
    </g>
  ),
  'muraka-fashion': (
    <g transform="rotate(-8 50 50)" strokeLinejoin="round">
      <path d="M28 19L40 14C42 22 58 22 60 14L72 19 87 31 77 45 70 40 70 81H30V40L23 45 13 31Z" fill="#171717" stroke="#fff" strokeWidth="7" />
      <path d="M40 15C42 22 58 22 60 15L65 18C63 29 37 29 35 18Z" fill="#c1a7a2" />
      <path d="M30 69H70V81H30Z" fill="#b85e53" />
    </g>
  ),
  'nike-sneakers': (
    <g transform="rotate(-9 50 50)" strokeLinejoin="round">
      <path d="M13 51C20 50 25 44 29 30L41 25 51 40C58 45 68 49 80 52C86 54 89 59 88 69L85 75C67 80 35 81 14 75C10 74 10 59 13 51Z" fill="#141414" stroke="#fff" strokeWidth="7" />
      <path d="M16 65C37 70 65 71 85 64L85 70C67 76 35 76 15 71Z" fill="#ef513e" />
      <path d="M33 35L41 32 50 43 64 49 49 53 30 46Z" fill="#fff" />
    </g>
  ),
  'lumi-studio': (
    <g transform="rotate(10 50 50)" strokeLinejoin="round">
      <path d="M22 17L52 43 77 16 84 23 58 50 84 76 77 83 51 57 24 84 17 77 44 50 16 24Z" fill="#1d1c1d" stroke="#fff" strokeWidth="7" />
      <path d="M22 17L52 43 45 50 16 24Z" fill="#d75a78" />
      <circle cx="51" cy="50" r="5" fill="#f4ca61" />
    </g>
  ),
  'china-buyer': (
    <g transform="rotate(-8 50 50)" strokeLinejoin="round">
      <path d="M10 53L39 49 57 15C60 10 65 10 66 15L62 45 81 42C87 41 90 43 90 47C90 51 86 53 81 55L62 60 65 77 59 81 48 63 31 68 25 78 20 79 22 65 11 60Z" fill="#da483a" stroke="#fff" strokeWidth="7" />
      <path d="M23 54L41 51 56 21 54 53 78 48 58 57 58 69 51 59 31 65Z" fill="#f17a55" />
    </g>
  ),
  'medical-center': (
    <g transform="rotate(7 50 50)" strokeLinejoin="round">
      <path d="M37 13H63V36H86V63H63V86H37V63H14V36H37Z" fill="#1d7c69" stroke="#fff" strokeWidth="7" />
      <path d="M22 50H38L43 40 51 61 57 48H78" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  ),
  'opt-market': (
    <g transform="rotate(-7 50 50)" strokeLinejoin="round">
      <path d="M50 9L88 28V70L50 90 12 70V28Z" fill="#1762d7" stroke="#fff" strokeWidth="7" />
      <path d="M50 9L88 28 50 47 12 28Z" fill="#62a3ff" />
      <path d="M50 47L88 28V70L50 90Z" fill="#0046b4" />
      <path d="M50 47L12 28M50 47L88 28M50 47V87" fill="none" stroke="#fff" strokeWidth="4" />
    </g>
  ),
  'women-fashion': (
    <g transform="rotate(7 50 50)" strokeLinejoin="round">
      <path d="M37 14L49 24 62 14 73 25 64 35 62 44 79 82H21L38 44 35 35 27 25Z" fill="#171717" stroke="#fff" strokeWidth="7" />
      <path d="M38 44L62 44 79 82H57Z" fill="#a7374f" />
      <path d="M49 24L62 14 73 25 64 35 62 44H50Z" fill="#323133" />
      <path d="M38 44H62" fill="none" stroke="#fff" strokeWidth="3.5" />
    </g>
  ),
  'skincare-aura': (
    <g transform="rotate(-8 50 50)" strokeLinejoin="round">
      <path d="M50 10C42 23 22 41 22 58C22 74 34 85 50 85C66 85 78 74 78 58C78 41 58 23 50 10Z" fill="#216c73" stroke="#fff" strokeWidth="7" />
      <path d="M50 28C45 39 35 48 35 59C35 68 41 74 50 75C59 75 65 68 65 59C65 48 55 38 50 28Z" fill="#64c8be" />
      <path d="M36 59C36 52 40 46 44 41" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
    </g>
  ),
};

export function StoreStickers({ id, className }: { id: string; className?: string }) {
  return <svg className={className} viewBox="0 0 100 100" fill="none" aria-hidden="true" focusable="false">{artwork[id] ?? artwork['opt-market']}</svg>;
}


