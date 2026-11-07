import type { ReactNode } from "react";

/** Original die-cut marks for the showcase folders. Each mark is drawn as vectors. */
const artwork: Record<string, ReactNode> = {
  "flower-store": (
    <g transform="rotate(-8 50 50)">
      <path d="M49 83 C46 66 48 51 51 39 M49 68 C39 65 35 59 33 54 C42 54 47 58 49 64 M49 61 C58 58 62 52 64 47 C56 48 51 52 49 57" fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M49 83 C46 66 48 51 51 39 M49 68 C39 65 35 59 33 54 C42 54 47 58 49 64 M49 61 C58 58 62 52 64 47 C56 48 51 52 49 57" fill="none" stroke="#315d48" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M50 18 C55 9 66 14 65 24 C75 20 81 30 74 37 C83 42 77 53 68 50 C67 60 55 62 50 54 C44 62 33 58 33 49 C23 52 18 41 27 36 C20 29 26 20 36 24 C35 14 45 10 50 18Z" fill="#d95e4b" stroke="#fff" strokeWidth="6" strokeLinejoin="round" />
      <circle cx="50" cy="37" r="8" fill="#f7d6a3" />
      <path d="M45 34l3 2m5-4l2 3m-8 5l2 2m5-3l2 1" stroke="#b66039" strokeWidth="1.8" strokeLinecap="round" />
    </g>
  ),
  "apple-store": (
    <g transform="rotate(9 50 50)">
      <rect x="28" y="9" width="44" height="78" rx="11" fill="#333a40" stroke="#fff" strokeWidth="7" />
      <rect x="32" y="13" width="36" height="70" rx="8" fill="#aab9bb" />
      <path d="M36 17h28v38C56 47 47 48 36 55Z" fill="#e5d6c6" />
      <path d="M36 57c10-9 20-8 28 0v21H36Z" fill="#7d9497" />
      <rect x="43" y="16" width="14" height="4" rx="2" fill="#30383c" />
      <path d="M75 66l3 5 6 1-4 4 1 6-6-3-5 3 1-6-4-4 6-1Z" fill="#f1c973" stroke="#fff" strokeWidth="4" strokeLinejoin="round" />
    </g>
  ),
  "muraka-fashion": (
    <g transform="rotate(-7 50 50)">
      <path d="M17 22L35 16 50 43 65 16 83 22 88 78 69 82 67 49 50 74 33 49 31 82 12 78Z" fill="#241d20" stroke="#fff" strokeWidth="7" strokeLinejoin="round" />
      <path d="M19 25l12-4 19 34 19-34 12 4" fill="none" stroke="#d1a6a0" strokeWidth="2" />
      <path d="M28 72l2-22m42 22l-2-22" stroke="#777075" strokeWidth="2" strokeLinecap="round" />
    </g>
  ),
  "nike-sneakers": (
    <g transform="rotate(-11 50 50)">
      <path d="M16 55c7-2 10-8 13-19l9-4 9 11c8 5 16 8 28 10 8 1 12 6 12 14v5c-13 8-55 8-72 2-5-2-5-13 1-19Z" fill="#e7e4dd" stroke="#fff" strokeWidth="7" strokeLinejoin="round" />
      <path d="M15 67c20 5 50 6 71-1v6c-18 7-53 8-71 2Z" fill="#26292a" />
      <path d="M28 38l11-4 9 11 15 6-19 7-17-7Z" fill="#e4704c" />
      <path d="M37 39l8 3m-10 2l9 3m-11 2l9 3" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M52 57c8 0 14-2 21-4-4 5-10 9-22 9Z" fill="#2c3335" />
      <path d="M20 73c16 3 42 4 60 0" fill="none" stroke="#959899" strokeWidth="1.5" />
    </g>
  ),
  "lumi-studio": (
    <g transform="rotate(8 50 50)">
      <path d="M21 21c14 0 18 12 30 25l28 29-6 7-29-28C32 42 20 37 21 21Z" fill="#d4aaa0" stroke="#fff" strokeWidth="6" strokeLinejoin="round" />
      <path d="M78 20C64 20 60 32 48 45L20 74l6 7 29-28C67 41 79 36 78 20Z" fill="#25282b" stroke="#fff" strokeWidth="6" strokeLinejoin="round" />
      <circle cx="50" cy="49" r="4.5" fill="#f2d6b0" stroke="#fff" strokeWidth="2" />
      <path d="M78 13l2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" fill="#e6ba63" stroke="#fff" strokeWidth="3" strokeLinejoin="round" />
      <path d="M21 23l20 21M78 22L58 43" stroke="#f6ece8" strokeWidth="2" strokeLinecap="round" />
    </g>
  ),
  "china-buyer": (
    <g transform="rotate(-8 50 50)">
      {/* A product tag, inspected through a loupe, with a small air-route mark. */}
      <path d="M18 19h41l23 25-35 37-29-28Z" fill="#c84c3c" stroke="#fff" strokeWidth="7" strokeLinejoin="round" />
      <path d="M24 25h31l19 20-27 28-23-23Z" fill="#db6551" />
      <circle cx="34" cy="34" r="5" fill="#f6e9d7" />
      <path d="M50 61l6-9-11-5 3-3 13 3 7-9c2-2 5 0 3 3l-7 9 5 12-3 3-7-10-7 8-1 6-3 2Z" fill="#fff4e5" />
      <circle cx="40" cy="52" r="16" fill="#f0e9df" fillOpacity=".25" stroke="#fff" strokeWidth="8" />
      <path d="M51 63l13 13" stroke="#fff" strokeWidth="11" strokeLinecap="round" />
      <circle cx="40" cy="52" r="16" fill="none" stroke="#283636" strokeWidth="4" />
      <path d="M51 63l13 13" stroke="#283636" strokeWidth="5" strokeLinecap="round" />
      <path d="M31 49c1-4 4-7 8-8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </g>
  ),
  "medical-center": (
    <g transform="rotate(8 50 50)">
      <path d="M39 14h22v23h23v23H61v24H39V60H16V37h23Z" fill="#456d67" stroke="#fff" strokeWidth="7" strokeLinejoin="round" />
      <path d="M27 49h12l5-10 8 21 5-11h16" fill="none" stroke="#e4eee8" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="75" cy="74" r="11" fill="#e4b9a6" stroke="#fff" strokeWidth="4" />
      <path d="M71 74h8m-4-4v8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
    </g>
  ),
  "opt-market": (
    <g transform="rotate(-6 50 50)">
      <path d="M15 29l35-14 35 14v41L50 85 15 70Z" fill="#d3b387" stroke="#fff" strokeWidth="7" strokeLinejoin="round" />
      <path d="M15 29l35 15 35-15M50 44v41" fill="none" stroke="#79634e" strokeWidth="2" />
      <path d="M33 22l35 15-9 4-35-15Z" fill="#eee2cc" />
      <path d="M22 47l18 7v15l-18-7Z" fill="#f6f1e9" />
      <path d="M26 52l10 4m-10 0l7 3m-7 1l9 3" stroke="#776b5e" strokeWidth="1.5" />
      <path d="M66 57v15m-5-10l5-5 5 5" fill="none" stroke="#6c5b49" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  ),
  "women-fashion": (
    <g transform="rotate(7 50 50)">
      <path d="M34 15l8 4c2 5 5 7 8 7s6-2 8-7l8-4 10 14-9 7-4-5-3 13 14 37H26l14-37-3-13-4 5-9-7Z" fill="#ac554b" stroke="#fff" strokeWidth="7" strokeLinejoin="round" />
      <path d="M42 19c1 6 4 10 8 10s7-4 8-10M40 44h20M50 46v30" fill="none" stroke="#f0c7b8" strokeWidth="2" />
      <path d="M31 77h38" stroke="#843e39" strokeWidth="2" />
    </g>
  ),
  "skincare-aura": (
    <g transform="rotate(-9 50 50)">
      <path d="M36 12h28v13H36Z" fill="#3e4b41" stroke="#fff" strokeWidth="6" strokeLinejoin="round" />
      <path d="M31 24h38v11c0 5 5 7 5 13v29c0 6-4 10-10 10H36c-6 0-10-4-10-10V48c0-6 5-8 5-13Z" fill="#e4d9c5" stroke="#fff" strokeWidth="7" strokeLinejoin="round" />
      <path d="M30 46h40v27H30Z" fill="#a6b49a" />
      <path d="M50 50c-3 5-6 8-6 11a6 6 0 0012 0c0-3-3-6-6-11Z" fill="#f5eee0" />
      <path d="M38 78h24" stroke="#b4a48d" strokeWidth="2" strokeLinecap="round" />
    </g>
  ),
};

export function StoreStickers({ id, className }: { id: string; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" aria-hidden="true" focusable="false">
      {artwork[id] ?? artwork["opt-market"]}
    </svg>
  );
}

