export interface Banner {
  title: string;
  subtitle?: string;
  image?: string;
  bgClass?: string;
}

export interface Service {
  id: string;
  title: string;
  priceText?: string;
  iconName?: string;
  image?: string;
}

export interface DemoAppHome {
  hero: {
    title?: string;
    subtitle?: string;
    image?: string;
    bgClass?: string;
  };
  banners?: Banner[];
  services?: Service[];
}

export interface DemoApp {
  id: string;
  title: string;
  description: string;
  category: string;
  image: string;
  creator: string;
  likes: string;
  badge?: string;
  badgeColor?: string;
  home?: DemoAppHome;
}

// Топ-10 самых популярных приложений по лайкам
export const demoApps: DemoApp[] = [
  {
    id: 'flower-store',
    title: 'Цветочный магазин',
    description: 'Букеты и цветочные композиции для любого повода',
    category: 'Электронная коммерция',
    image: '/flower-store/hero.webp',
    creator: 'WEB4TG',
    likes: '0',
    badge: 'Демо',
    badgeColor: 'bg-black',
  },
  {
    id: 'china-buyer',
    title: 'Бюро поиска — байер из Китая',
    description: 'Поиск товаров, выкуп и сопровождение заказа из Китая',
    category: 'Электронная коммерция',
    image: '/china-buyer/hero.webp',
    creator: 'WEB4TG',
    likes: '0',
    badge: 'Демо',
    badgeColor: 'bg-black',
  },
  {
    id: 'medical-center',
    title: 'Частный медицинский центр',
    description: 'Специалисты, услуги и удобная запись на приём',
    category: 'Здоровье',
    image: '/medical-center/hero.webp',
    creator: 'WEB4TG',
    likes: '0',
    badge: 'Демо',
    badgeColor: 'bg-black',
  },
  {
    id: 'lumi-studio',
    title: 'LUMI — студия красоты',
    description: 'Услуги, мастера и удобная запись в студию красоты',
    category: 'Красота и услуги',
    image: '/lumi/generated/lumi-v4-hero.webp',
    creator: 'WEB4TG',
    likes: '0',
    badge: 'Демо',
    badgeColor: 'bg-black',
  },
  {
    id: 'opt-market',
    title: 'ПАРТИЯ — оптовые закупки',
    description: 'Каталог поставщика, персональные цены и быстрые заказы для бизнеса',
    category: 'Электронная коммерция',
    image: '/b2b/generated/hero-real-v1.webp',
    creator: 'WEB4TG',
    likes: '0',
    badge: 'Демо',
    badgeColor: 'bg-black',
  },
  {
    id: 'apple-store',
    title: 'Техника Apple',
    description: 'Демо магазина техники Apple с каталогом и корзиной',
    category: 'Электронная коммерция',
    image: '/apple-store/hero.webp',
    creator: 'WEB4TG',
    likes: '0',
    badge: 'Демо',
    badgeColor: 'bg-black',
  },
  {
    id: 'muraka-fashion',
    title: 'Магазин одежды',
    description: 'Демо магазина одежды и кроссовок',
    category: 'Электронная коммерция',
    image: '/muraka-fashion/transparent-v2/jacket-patchwork-product.webp',
    creator: 'WEB4TG',
    likes: '0',
    badge: 'Демо',
    badgeColor: 'bg-black',
  },
  {
    id: 'women-fashion',
    title: 'MIRA — женская одежда',
    description: 'Женская одежда: коллекция, образы, избранное и демо-заказ',
    category: 'Электронная коммерция',
    image: '/women-fashion/hero.webp',
    creator: 'WEB4TG',
    likes: '0',
    badge: 'Демо',
    badgeColor: 'bg-black',
  },
  {
    id: 'nike-sneakers',
    title: 'КРОССОВКИ NIKE',
    description: 'Демо магазина Nike с каталогом и корзиной',
    category: 'Электронная коммерция',
    image: '/royal-step/jordan-banner.webp',
    creator: 'WEB4TG',
    likes: '0',
    badge: 'Демо',
    badgeColor: 'bg-black',
  },
  {
    id: 'skincare-aura',
    title: 'Aura',
    description: 'Премиальный магазин косметики и ухода за кожей',
    category: 'Электронная коммерция',
    image: 'https://d8j0ntlcm91z4.cloudfront.net/user_39EkWaVwA7CfpRMWZth7HiaC1oQ/hf_20260523_125334_678cadf8-6a6e-4f16-941b-ce41570fee6b_min.webp',
    creator: 'WEB4TG',
    likes: '9.8k',
    badge: 'Новинка',
    badgeColor: 'bg-black',
  },
  // НОВЫЕ E-COMMERCE ПРИЛОЖЕНИЯ
  
  // Futuristic Fashion Collection - 4 Premium Designs
  
  // Premium Lifestyle Collection
];
