// Only add an ID after both the image and its jewelry have been visually checked
// against the corresponding Tiffany reference. Story assets are separate from
// the product gallery and must not silently reuse its images.
export const reviewedJewelryStoryImages: Readonly<Record<string, readonly ('story' | 'story-detail')[]>> = {
  'tiffany-67796772': ['story', 'story-detail'],
  'tiffany-75765487': ['story', 'story-detail'],
  'tiffany-75766165': ['story'],
  'tiffany-75959761': ['story', 'story-detail'],
  'tiffany-75959869': ['story', 'story-detail'],
  'tiffany-75959923': ['story', 'story-detail'],
  'tiffany-75981333': ['story'],
  'tiffany-75981481': ['story'],
  'tiffany-76073902': ['story', 'story-detail'],
  'tiffany-76073929': ['story', 'story-detail'],
  'tiffany-76141231': ['story', 'story-detail'],
  'tiffany-76152535': ['story', 'story-detail'],
  'tiffany-76261512': ['story'],
  'tiffany-76261881': ['story', 'story-detail'],
  'tiffany-76363854': ['story', 'story-detail'],
  'tiffany-76394164': ['story'],
  'tiffany-76394490': ['story', 'story-detail'],
  'tiffany-76394512': ['story', 'story-detail'],
  'tiffany-76394555': ['story-detail'],
  'tiffany-76394571': ['story', 'story-detail'],
};

// New independently generated detail views, checked against the actual SKU.
// Keeping them separate makes it possible to discard inaccurate variants safely.
const reviewedReplacementImages: Readonly<Record<string, readonly ('story' | 'story-detail')[]>> = {
  'tiffany-67796772': ['story', 'story-detail'],
  'tiffany-75765487': ['story-detail'],
  'tiffany-75959761': ['story-detail'],
  'tiffany-75959869': ['story'],
  'tiffany-75959923': ['story-detail'],
  'tiffany-76073902': ['story-detail'],
  'tiffany-76073929': ['story-detail'],
  'tiffany-76152535': ['story-detail'],
  'tiffany-76261512': ['story'],
  'tiffany-76261881': ['story'],
  'tiffany-76363854': ['story', 'story-detail'],
  'tiffany-76394164': ['story'],
  'tiffany-76394490': ['story'],
  'tiffany-76394555': ['story-detail'],
  'tiffany-76394571': ['story-detail'],
};

// Versioned replacements retain the earlier candidates for comparison.
const reviewedVersionedImages: Readonly<Record<string, Partial<Record<'story' | 'story-detail', string>>>> = {
  'tiffany-75766165': { 'story-detail': '75766165-story-detail-v2.png' },
  'tiffany-75981333': { 'story-detail': '75981333-story-detail-v2.png' },
  'tiffany-75981481': { 'story-detail': '75981481-story-detail-v2.png' },
  'tiffany-76261512': { 'story-detail': '76261512-story-detail-v2.png' },
  'tiffany-76394164': { 'story-detail': '76394164-story-detail-v2.png' },
  'tiffany-76394555': { story: '76394555-story-v2.png' },
};

export function jewelryStoryImage(id: string, view: 'story' | 'story-detail'): string | undefined {
  const imageId = id.replace(/^tiffany-/, '');
  const versionedImage = reviewedVersionedImages[id]?.[view];
  if (versionedImage) return `/jewelry/tiffany-story-replacements/${versionedImage}`;
  if (reviewedReplacementImages[id]?.includes(view)) {
    return `/jewelry/tiffany-story-replacements/${imageId}-${view}.png`;
  }
  if (!reviewedJewelryStoryImages[id]?.includes(view)) return undefined;
  return `/jewelry/tiffany-stories/${imageId}-${view}.png`;
}
