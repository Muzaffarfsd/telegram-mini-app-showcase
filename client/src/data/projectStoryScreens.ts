export type ProjectStoryScreen = { src: string; src3x?: string; caption: [string, string]; language: 'ru' | 'en' };
/** Each image is a captured screen of the corresponding project. */
const secondScreens: Record<string, [string, string]> = {
  'apple-store': ['Каталог iPhone', 'iPhone catalog'],
  'china-buyer': ['Образцы', 'Samples'],
  'flower-store': ['Каталог цветов', 'Flower catalog'],
  'furniture-studio': ['Каталог мебели', 'Furniture catalog'],
  'jewelry-store': ['Каталог украшений', 'Jewelry catalog'],
  'lumi-studio': ['Услуги', 'Services'],
  'medical-center': ['Врачи', 'Doctors'],
  'muraka-fashion': ['Каталог', 'Catalog'],
  'nike-sneakers': ['Карточка кроссовок', 'Sneaker details'],
  'opt-market': ['Каталог товаров', 'Product catalog'],
  'skincare-aura': ['Подбор ухода', 'Skincare finder'],
  'takt-coffee': ['Каталог напитков', 'Drink menu'],
  'women-fashion': ['Каталог', 'Catalog'],
};
export const projectStoryScreens: Record<string, ProjectStoryScreen[]> = Object.fromEntries(
  Object.entries(secondScreens).map(([id, caption]) => [id, [
    { src: `/project-stories/${id}/1.webp`, caption: ['Главная', 'Home'], language: 'ru' },
    { src: `/project-stories/${id}/2.webp`, caption, language: 'ru' },
  ]]),
);
projectStoryScreens['muraka-fashion'].push({ src: '/project-stories/muraka-fashion/3.webp', caption: ['Карточка товара', 'Product details'], language: 'ru' });
projectStoryScreens['women-fashion'].push({ src: '/project-stories/women-fashion/3.webp', caption: ['Карточка товара', 'Product details'], language: 'ru' });
projectStoryScreens['takt-coffee'].push({ src: '/project-stories/takt-coffee/3.webp', caption: ['Настройка напитка', 'Customize a drink'], language: 'ru' });
projectStoryScreens['nike-sneakers'].push({ src: '/project-stories/nike-sneakers/3.webp', caption: ['Каталог кроссовок', 'Sneaker catalog'], language: 'ru' });
projectStoryScreens['apple-store'].push({ src: '/project-stories/apple-store/3.webp', caption: ['Карточка iPhone', 'iPhone details'], language: 'ru' });
projectStoryScreens['furniture-studio'].push({ src: '/project-stories/furniture-studio/3.webp', caption: ['Карточка мебели', 'Furniture details'], language: 'ru' });
projectStoryScreens['flower-store'].push({ src: '/project-stories/flower-store/3.webp', caption: ['Карточка букета', 'Bouquet details'], language: 'ru' });
projectStoryScreens['lumi-studio'].push({ src: '/project-stories/lumi-studio/3.webp', caption: ['Запись', 'Booking'], language: 'ru' });
projectStoryScreens['opt-market'].push({ src: '/project-stories/opt-market/3.webp', caption: ['Карточка товара', 'Product details'], language: 'ru' });
projectStoryScreens['jewelry-store'].push({ src: '/project-stories/jewelry-store/3.webp', caption: ['Карточка украшения', 'Jewelry details'], language: 'ru' });
projectStoryScreens['medical-center'].push({ src: '/project-stories/medical-center/3.webp', caption: ['Запись на приём', 'Book an appointment'], language: 'ru' });
projectStoryScreens['china-buyer'].push({ src: '/project-stories/china-buyer/3.webp', caption: ['Запрос по ссылке', 'Request by link'], language: 'ru' });
projectStoryScreens['skincare-aura'].push({ src: '/project-stories/skincare-aura/3.webp', caption: ['Каталог косметики', 'Beauty catalog'], language: 'ru' });
for (const id of ['takt-coffee', 'furniture-studio', 'china-buyer']) {
  projectStoryScreens[id].push(
    { src: `/project-stories/${id}/1-en.webp`, caption: ['Главная', 'Home'], language: 'en' },
    { src: `/project-stories/${id}/2-en.webp`, caption: secondScreens[id], language: 'en' },
    { src: `/project-stories/${id}/3-en.webp`, caption: projectStoryScreens[id].find(screen => screen.src.endsWith('/3.webp'))!.caption, language: 'en' },
  );
}

// The original 1× captures may already be cached on the user's device.
for (const screens of Object.values(projectStoryScreens)) {
  for (const screen of screens) {
    screen.src3x = screen.src.replace(/\.webp$/, '-3x.webp') + '?v=20261128-3x';
    screen.src += '?v=20261127-hd';
  }
}
