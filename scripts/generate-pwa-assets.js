import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, '../client/public');
const ICONS_DIR = path.join(OUTPUT_DIR, 'icons');
const SPLASH_DIR = path.join(OUTPUT_DIR, 'splash');

const BRAND_COLOR = '#10B981';
const BG_COLOR = '#000000';

const ICON_SIZES = [72, 96, 128, 144, 152, 180, 192, 384, 512];

const SPLASH_SCREENS = [
  { name: 'splash-1290x2796', width: 1290, height: 2796 },
  { name: 'splash-1179x2556', width: 1179, height: 2556 },
  { name: 'splash-1170x2532', width: 1170, height: 2532 },
  { name: 'splash-1284x2778', width: 1284, height: 2778 },
  { name: 'splash-750x1334', width: 750, height: 1334 },
  { name: 'splash-828x1792', width: 828, height: 1792 },
  { name: 'splash-2048x2732', width: 2048, height: 2732 },
  { name: 'splash-1668x2388', width: 1668, height: 2388 },
  { name: 'splash-1640x2360', width: 1640, height: 2360 },
  { name: 'splash-1536x2048', width: 1536, height: 2048 },
];

async function createBaseIcon(size) {
  const padding = Math.floor(size * 0.15);
  const iconSize = size - (padding * 2);
  const starSize = Math.floor(iconSize * 0.5);
  const cornerRadius = Math.floor(size * 0.22);
  
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${BRAND_COLOR}"/>
          <stop offset="100%" style="stop-color:#059669"/>
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" rx="${cornerRadius}" fill="url(#bg)"/>
      <g transform="translate(${size/2}, ${size/2 - size*0.05})">
        <path d="M0 ${-starSize*0.45} L${starSize*0.12} ${-starSize*0.12} L${starSize*0.45} ${-starSize*0.06} L${starSize*0.2} ${starSize*0.15} L${starSize*0.28} ${starSize*0.45} L0 ${starSize*0.28} L${-starSize*0.28} ${starSize*0.45} L${-starSize*0.2} ${starSize*0.15} L${-starSize*0.45} ${-starSize*0.06} L${-starSize*0.12} ${-starSize*0.12} Z" fill="white"/>
      </g>
      <text x="${size/2}" y="${size*0.88}" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="${size*0.12}" font-weight="700" fill="white">W4TG</text>
    </svg>
  `;
  
  return sharp(Buffer.from(svg)).png();
}

async function createMaskableIcon(size) {
  const safeZone = Math.floor(size * 0.1);
  const innerSize = size - (safeZone * 2);
  const starSize = Math.floor(innerSize * 0.35);
  
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${BRAND_COLOR}"/>
          <stop offset="100%" style="stop-color:#059669"/>
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#bg)"/>
      <g transform="translate(${size/2}, ${size/2 - size*0.05})">
        <path d="M0 ${-starSize*0.45} L${starSize*0.12} ${-starSize*0.12} L${starSize*0.45} ${-starSize*0.06} L${starSize*0.2} ${starSize*0.15} L${starSize*0.28} ${starSize*0.45} L0 ${starSize*0.28} L${-starSize*0.28} ${starSize*0.45} L${-starSize*0.2} ${starSize*0.15} L${-starSize*0.45} ${-starSize*0.06} L${-starSize*0.12} ${-starSize*0.12} Z" fill="white"/>
      </g>
      <text x="${size/2}" y="${size*0.75}" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="${size*0.1}" font-weight="700" fill="white">W4TG</text>
    </svg>
  `;
  
  return sharp(Buffer.from(svg)).png();
}

async function createSplashScreen(width, height) {
  const logoSize = Math.min(width, height) * 0.25;
  const starSize = logoSize * 0.5;
  
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#000000"/>
          <stop offset="50%" style="stop-color:#0a0a0a"/>
          <stop offset="100%" style="stop-color:#111111"/>
        </linearGradient>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${BRAND_COLOR}"/>
          <stop offset="100%" style="stop-color:#059669"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#bgGrad)"/>
      <g transform="translate(${width/2}, ${height/2 - logoSize*0.3})">
        <circle cx="0" cy="0" r="${logoSize*0.6}" fill="url(#logoGrad)" opacity="0.15"/>
        <path d="M0 ${-starSize*0.5} L${starSize*0.13} ${-starSize*0.13} L${starSize*0.5} ${-starSize*0.07} L${starSize*0.22} ${starSize*0.16} L${starSize*0.31} ${starSize*0.5} L0 ${starSize*0.31} L${-starSize*0.31} ${starSize*0.5} L${-starSize*0.22} ${starSize*0.16} L${-starSize*0.5} ${-starSize*0.07} L${-starSize*0.13} ${-starSize*0.13} Z" fill="${BRAND_COLOR}"/>
      </g>
      <text x="${width/2}" y="${height/2 + logoSize*0.5}" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="${logoSize*0.25}" font-weight="700" fill="white">WEB4TG</text>
      <text x="${width/2}" y="${height/2 + logoSize*0.75}" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="${logoSize*0.12}" fill="#888888">Telegram Mini Apps</text>
    </svg>
  `;
  
  return sharp(Buffer.from(svg)).png();
}

async function generateAssets() {
  console.log('Generating PWA assets...\n');
  
  fs.mkdirSync(ICONS_DIR, { recursive: true });
  fs.mkdirSync(SPLASH_DIR, { recursive: true });
  
  console.log('Generating icons...');
  for (const size of ICON_SIZES) {
    const icon = await createBaseIcon(size);
    const filename = `icon-${size}x${size}.png`;
    await icon.toFile(path.join(ICONS_DIR, filename));
    console.log(`  Created ${filename}`);
  }
  
  console.log('\nGenerating maskable icons...');
  for (const size of [192, 512]) {
    const icon = await createMaskableIcon(size);
    const filename = `maskable-${size}x${size}.png`;
    await icon.toFile(path.join(ICONS_DIR, filename));
    console.log(`  Created ${filename}`);
  }
  
  console.log('\nGenerating favicons...');
  const favicon32 = await createBaseIcon(32);
  await favicon32.toFile(path.join(ICONS_DIR, 'favicon-32x32.png'));
  console.log('  Created favicon-32x32.png');
  
  const favicon16 = await createBaseIcon(16);
  await favicon16.toFile(path.join(ICONS_DIR, 'favicon-16x16.png'));
  console.log('  Created favicon-16x16.png');
  
  const appleTouchIcon = await createBaseIcon(180);
  await appleTouchIcon.toFile(path.join(ICONS_DIR, 'apple-touch-icon.png'));
  console.log('  Created apple-touch-icon.png');
  
  console.log('\nGenerating splash screens...');
  for (const { name, width, height } of SPLASH_SCREENS) {
    const splash = await createSplashScreen(width, height);
    const filename = `${name}.png`;
    await splash.toFile(path.join(SPLASH_DIR, filename));
    console.log(`  Created ${filename}`);
  }
  
  console.log('\nGenerating OG image (1200x630)...');
  const ogImage = await createSplashScreen(1200, 630);
  await ogImage.toFile(path.join(OUTPUT_DIR, 'og-image.png'));
  console.log('  Created og-image.png');
  
  console.log('\nGenerating Twitter image (1200x600)...');
  const twitterImage = await createSplashScreen(1200, 600);
  await twitterImage.toFile(path.join(OUTPUT_DIR, 'twitter-image.png'));
  console.log('  Created twitter-image.png');
  
  console.log('\nAll PWA assets generated successfully!');
}

generateAssets().catch(console.error);
