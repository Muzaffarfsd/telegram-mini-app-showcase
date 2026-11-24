import type { CSSProperties } from 'react';

// Coordinates on a 264 × 352 proof of each existing cover. The box measures
// the original handset. Foreground points keep products that cross its bezel.
type Point = [number, number];
interface Scene {
  handset: [number, number, number, number];
  foreground?: Point[];
}
const scenes: Record<string, Scene> = {
  'muraka-fashion': { handset: [66, 27, 136, 298], foreground: [[45, 277], [70, 292], [82, 303], [101, 311], [108, 320], [102, 346], [33, 348]] },
  'women-fashion': { handset: [61, 21, 138, 303], foreground: [[41, 327], [98, 322], [132, 320], [155, 314], [171, 306], [189, 300], [202, 286], [247, 264], [260, 351], [34, 351]] },
  'nike-sneakers': { handset: [56, 24, 136, 289], foreground: [[98, 321], [112, 310], [135, 302], [151, 293], [165, 278], [175, 269], [185, 247], [197, 233], [200, 217], [236, 219], [259, 294], [258, 348], [93, 348]] },
  'apple-store': { handset: [65, 13, 146, 320], foreground: [[176, 302], [179, 284], [181, 272], [188, 263], [207, 257], [219, 219], [257, 207], [263, 346], [179, 347]] },
  'lumi-studio': { handset: [63, 26, 136, 295], foreground: [[37, 318], [75, 317], [98, 316], [128, 310], [153, 306], [173, 310], [188, 314], [205, 299], [254, 281], [260, 351], [33, 351]] },
  'opt-market': { handset: [62, 15, 139, 306], foreground: [[169, 287], [183, 279], [184, 271], [192, 260], [203, 256], [208, 224], [225, 220], [263, 247], [259, 345], [170, 345], [181, 315], [181, 299]] },
  'jewelry-store': { handset: [56, 8, 151, 330], foreground: [[132, 239], [142, 235], [153, 234], [159, 238], [160, 246], [176, 246], [193, 244], [214, 238], [251, 221], [263, 222], [261, 242], [217, 258], [238, 275], [238, 307], [207, 308], [205, 259], [160, 264], [160, 270], [141, 271], [141, 263], [134, 263]] },
  'medical-center': { handset: [60, 12, 141, 309], foreground: [[10, 284], [48, 281], [65, 284], [76, 290], [77, 304], [66, 315], [74, 328], [70, 343], [6, 347]] },
  'china-buyer': { handset: [38, 25, 140, 305], foreground: [[102, 328], [136, 318], [149, 310], [158, 296], [168, 274], [174, 242], [184, 215], [206, 186], [254, 147], [264, 350], [93, 350]] },
  'skincare-aura': { handset: [62, 26, 136, 297], foreground: [[111, 324], [143, 316], [159, 312], [174, 304], [191, 291], [209, 277], [240, 251], [259, 243], [260, 350], [104, 350]] },
};

function registerScene({ handset: [x, y, width, height] }: Scene): CSSProperties {
  // Match the upright phone in the flower composition, before its 2° tilt.
  const scaleX = 152 / width;
  const scaleY = 310 / height;
  return {
    left: `${(62 - x * scaleX) / 264 * 100}%`,
    top: `${(17 - y * scaleY) / 352 * 100}%`,
    width: `${scaleX * 100}%`,
    height: `${scaleY * 100}%`,
  };
}

export function ShowcaseArtwork({ id, first }: { id: string; first: boolean }) {
  const cover = `/showcase/covers/${id}.webp?v=2`;
  const loading = first ? 'eager' : 'lazy';
  const photo = scenes[id];
  if (!photo) return <span className="ps-art" aria-hidden="true">
    <img className="ps-original" src={cover} alt="" loading={loading} decoding="async" draggable={false} />
  </span>;

  const placement = registerScene(photo);
  const outline = photo.foreground?.map(([x, y]) => `${x / 264 * 100}% ${y / 352 * 100}%`).join(', ');
  return <span className="ps-art" aria-hidden="true">
    <span className="ps-scene">
      <img className="ps-props" style={placement} src={cover} alt="" loading={loading} decoding="async" draggable={false} />
      <span className="ps-device">
        <span className="ps-glass">
          <img className="ps-screen" src={`/showcase/screens/${id}.webp`} alt="" loading={loading} decoding="async" draggable={false} />
        </span>
      </span>
      {outline && <img className="ps-props" style={{ ...placement, clipPath: `polygon(${outline})` }}
        src={cover} alt="" loading={loading} decoding="async" draggable={false} />}
    </span>
  </span>;
}
