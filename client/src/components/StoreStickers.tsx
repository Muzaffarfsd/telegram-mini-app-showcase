import type { ReactNode } from 'react';

// Original die-cut emblems for each showcase category. Each is a distinct mark,
// with a substantial white edge like the stickers in the supplied reference.
const artwork: Record<string, ReactNode> = {
  'flower-store': (
    <g transform="rotate(-8 50 50)" strokeLinejoin="round" strokeLinecap="round">
      <path d="M50 54V77" stroke="#fff" strokeWidth="12" />
      <path d="M49 64C32 61 21 49 23 37C36 37 47 47 49 64Z" fill="#e74e4d" stroke="#fff" strokeWidth="5" />
      <path d="M51 64C68 61 79 49 77 37C64 37 53 47 51 64Z" fill="#f28d52" stroke="#fff" strokeWidth="5" />
      <path d="M50 59C39 47 38 31 50 22C62 31 61 47 50 59Z" fill="#a52e48" stroke="#fff" strokeWidth="5" />
      <path d="M50 57V77" stroke="#257c62" strokeWidth="7" />
    </g>
  ),
  'apple-store': (
    <g transform="rotate(7 50 50)" strokeLinejoin="round">
      <path d="M16 23L48 12 82 25 75 39 86 47 69 81 37 87 14 70 22 54 12 44Z" fill="#fff" stroke="#fff" strokeWidth="7" />
      <path d="M16 23L48 12 82 25 69 43 37 54 12 44Z" fill="#151515" />
      <path d="M22 54L46 46 75 39 86 47 69 81 37 87 14 70Z" fill="#292929" />
      <path d="M24 31L48 23 69 30 63 37 41 45 20 39Z" fill="#d8d9d8" />
      <path d="M35 60L67 50 77 52 63 72 41 77 27 68Z" fill="#818887" />
    </g>
  ),
  'muraka-fashion': (
    <g transform="rotate(-7 50 50)" strokeLinejoin="round">
      <path d="M13 27L31 13 49 27 67 13 87 27 80 72 65 86 49 70 34 86 18 72Z" fill="#fff" stroke="#fff" strokeWidth="7" />
      <path d="M13 27L31 13 49 27 38 40 34 76 18 72Z" fill="#171717" />
      <path d="M49 27L67 13 87 27 80 72 65 76 60 40Z" fill="#171717" />
      <path d="M31 13L49 27 67 13 60 40 49 53 38 40Z" fill="#ac9a98" />
      <path d="M38 40L49 53 60 40 65 76 49 70 34 76Z" fill="#722f38" />
    </g>
  ),
  'nike-sneakers': (
    <g transform="rotate(-9 50 50)" strokeLinejoin="round">
      <path d="M9 58L22 38 51 40 73 17 86 24 76 45 91 53 81 73 56 78 47 70 23 79Z" fill="#fff" stroke="#fff" strokeWidth="7" />
      <path d="M11 57L24 39 50 41 73 18 85 25 68 51 43 59Z" fill="#141414" />
      <path d="M24 63L43 59 69 50 89 54 80 70 57 76 48 66 25 76Z" fill="#ee4d3a" />
      <path d="M22 54L48 47 64 34 58 46 43 55Z" fill="#fff" />
    </g>
  ),
  'lumi-studio': (
    <g transform="rotate(8 50 50)" strokeLinejoin="round">
      <path d="M51 9L61 33 86 20 73 45 91 54 67 61 77 85 51 72 26 87 34 61 9 53 28 44 15 19 40 33Z" fill="#fff" stroke="#fff" strokeWidth="7" />
      <path d="M51 11L59 38 78 23 65 47 88 54 62 59 75 82 51 68 51 52Z" fill="#bd4c82" />
      <path d="M51 11V52L27 43 17 21 41 37Z" fill="#f0a4b2" />
      <path d="M51 52V68L27 84 38 59 12 53 37 47Z" fill="#292431" />
    </g>
  ),
  'china-buyer': (
    <g transform="rotate(-8 50 50)" strokeLinejoin="round">
      <path d="M18 14H61L87 37 75 49 88 61 62 86H19L11 65 25 50 11 35Z" fill="#fff" stroke="#fff" strokeWidth="7" />
      <path d="M18 14H61L87 37 63 49 48 35H16Z" fill="#d83932" />
      <path d="M16 35H48L63 49 48 63H16L27 49Z" fill="#9e252a" />
      <path d="M16 63H48L63 49 88 61 62 86H19Z" fill="#ef6550" />
      <path d="M50 24L61 28 67 35 55 38 46 33Z" fill="#f4c85c" />
    </g>
  ),
  'medical-center': (
    <g transform="rotate(7 50 50)" strokeLinejoin="round">
      <path d="M22 17C34 8 45 13 50 24C55 13 67 8 79 17C92 28 83 43 71 50C83 58 92 72 79 83C67 92 55 87 50 76C45 87 34 92 22 83C8 72 17 58 29 50C17 43 8 28 22 17Z" fill="#fff" stroke="#fff" strokeWidth="7" />
      <path d="M23 21C34 12 44 20 50 35C56 20 66 12 77 21C87 29 78 40 65 47L50 57 35 47C22 40 13 29 23 21Z" fill="#247a6d" />
      <path d="M23 79C34 88 44 80 50 65C56 80 66 88 77 79C87 71 78 60 65 53L50 43 35 53C22 60 13 71 23 79Z" fill="#5db49f" />
      <path d="M35 50L50 41 65 50 50 59Z" fill="#0d514a" />
    </g>
  ),
  'opt-market': (
    <g transform="rotate(-7 50 50)" strokeLinejoin="round">
      <path d="M12 30L39 13 60 24 74 16 89 27 73 43 89 52 71 70 57 64 38 83 11 67 27 49 11 40Z" fill="#fff" stroke="#fff" strokeWidth="6" />
      <path d="M12 30L39 13 60 24 33 42Z" fill="#3688ed" />
      <path d="M33 42L60 24 74 16 89 27 62 49 48 54Z" fill="#0955c4" />
      <path d="M11 67L33 47 48 54 38 72 27 77Z" fill="#1269d7" />
      <path d="M38 72L62 49 89 52 71 70 57 64 38 83Z" fill="#03429e" />
    </g>
  ),
  'women-fashion': (
    <g transform="rotate(8 50 50)" strokeLinejoin="round">
      <path d="M19 13L49 30 78 13 88 27 68 50 87 73 76 87 49 69 21 87 12 73 31 50 12 27Z" fill="#fff" stroke="#fff" strokeWidth="7" />
      <path d="M19 13L49 30 41 44 12 27Z" fill="#191619" />
      <path d="M78 13L88 27 57 56 42 46Z" fill="#bd405b" />
      <path d="M31 50L45 60 21 87 12 73Z" fill="#bd405b" />
      <path d="M49 55L68 50 87 73 76 87 49 69Z" fill="#191619" />
      <path d="M40 45L49 30 68 50 57 56Z" fill="#6b293b" />
    </g>
  ),
  'skincare-aura': (
    <g transform="rotate(-8 50 50)" strokeLinejoin="round">
      <path d="M50 10C30 10 13 27 13 49C13 68 24 83 42 88L50 72 58 88C76 83 87 68 87 49C87 27 70 10 50 10Z" fill="#fff" stroke="#fff" strokeWidth="7" />
      <path d="M50 12C29 12 14 28 14 49C14 65 23 79 39 85L45 69C35 66 30 58 30 49C30 37 39 28 50 28Z" fill="#177b79" />
      <path d="M50 12C71 12 86 28 86 49C86 65 77 79 61 85L55 69C65 66 70 58 70 49C70 37 61 28 50 28Z" fill="#78c6b6" />
      <path d="M50 35L61 49 50 65 39 49Z" fill="#f2b99c" />
    </g>
  ),
};

export function StoreStickers({ id, className }: { id: string; className?: string }) {
  return <svg className={className} viewBox="0 0 100 100" fill="none" aria-hidden="true" focusable="false">{artwork[id] ?? artwork['opt-market']}</svg>;
}

