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
    image: '/muraka-fashion/jacket-patchwork-product.webp',
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
    id: 'stray-store',
    title: 'STRAY',
    description: 'Минималистичный стритвир-магазин: одежда, обувь, аксессуары',
    category: 'Электронная коммерция',
    image: 'https://d8j0ntlcm91z4.cloudfront.net/user_3F02JzQ7VwcjzsSuotlPzYO9aEk/hf_20260619_122532_b28cb4c9-8ff7-4a54-b736-b1c89f1b22b7.jpeg',
    creator: 'WEB4TG',
    likes: '15.1k',
    badge: 'Новинка',
    badgeColor: 'bg-black',
  },
  {
    id: 'tech-nova',
    title: 'NOVA',
    description: 'Магазин премиальной электроники: смартфоны, ноутбуки, планшеты',
    category: 'Электронная коммерция',
    image: 'https://d8j0ntlcm91z4.cloudfront.net/user_39EkWaVwA7CfpRMWZth7HiaC1oQ/hf_20260523_171258_791a20a6-9c96-4e85-bec2-e4813052ec93_min.webp',
    creator: 'WEB4TG',
    likes: '14.2k',
    badge: 'Новинка',
    badgeColor: 'bg-black',
  },
  {
    id: 'streetwear-vanta',
    title: 'VANTA',
    description: 'Премиальный стритвир-бутик: кроссовки, куртки, худи',
    category: 'Электронная коммерция',
    image: 'https://d8j0ntlcm91z4.cloudfront.net/user_39EkWaVwA7CfpRMWZth7HiaC1oQ/hf_20260523_154829_2fbfd789-76fb-419f-9591-cb69d3d85f4f_min.webp',
    creator: 'WEB4TG',
    likes: '11.4k',
    badge: 'Новинка',
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
  {
    id: 'restaurant',
    title: 'DeluxeDine',
    description: 'Ресторан с доставкой',
    category: 'Еда и рестораны',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format,compress&fit=crop&w=400&h=300&q=80&dpr=2',
    creator: 'WEB4TG',
    likes: '8.9k',
    badge: 'Мишлен',
    badgeColor: 'bg-yellow-500',
    home: {
      hero: {
        title: 'Добро пожаловать в DeluxeDine',
        subtitle: 'Незабываемые вкусы высокой кухни',
        image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format,compress&fit=crop&w=400&h=300&q=80&dpr=2',
        bgClass: 'bg-gradient-to-r from-yellow-500 to-orange-600'
      },
      banners: [
        {
          title: 'Сезонное меню',
          subtitle: 'Блюда от шеф-повара',
          image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&auto=format,compress&q=80&dpr=2',
          bgClass: 'bg-gradient-to-r from-emerald-500 to-teal-600'
        },
        {
          title: 'Бесплатная доставка',
          subtitle: 'При заказе от 2000₽',
          bgClass: 'bg-gradient-to-r from-blue-500 to-indigo-600'
        }
      ],
      services: [
        { id: 'menu', title: 'Меню', priceText: 'Наши блюда', iconName: 'utensils' },
        { id: 'reservations', title: 'Бронирование', priceText: 'Забронировать стол', iconName: 'calendar' },
        { id: 'delivery', title: 'Доставка', priceText: 'Заказать на дом', iconName: 'truck' },
        { id: 'profile', title: 'Профиль', priceText: 'Личный кабинет', iconName: 'user' }
      ]
    }
  },
  // НОВЫЕ E-COMMERCE ПРИЛОЖЕНИЯ
  
  // Futuristic Fashion Collection - 4 Premium Designs
  {
    id: 'futuristic-fashion-1',
    title: 'Rascal®',
    description: 'Футуристический магазин waterproof jacket',
    category: 'Электронная коммерция',
    image: '/attached_assets/stock_images/futuristic_techwear__e958e42c.jpg',
    creator: 'WEB4TG',
    likes: '24.1k',
    badge: 'Футуристика',
    badgeColor: 'bg-gradient-to-r from-green-600 to-emerald-700'
  },
  {
    id: 'futuristic-fashion-2',
    title: 'STORE',
    description: 'Минималистичный черный магазин',
    category: 'Электронная коммерция',
    image: '/attached_assets/stock_images/cyberpunk_fashion_ho_8df162c4.jpg',
    creator: 'WEB4TG',
    likes: '22.8k',
    badge: 'Минимализм',
    badgeColor: 'bg-black'
  },
  {
    id: 'futuristic-fashion-3',
    title: 'lab. SURVIVALIST',
    description: 'Черно-белый минималистичный магазин',
    category: 'Электронная коммерция',
    image: '/attached_assets/stock_images/futuristic_fashion_m_331bf630.jpg',
    creator: 'WEB4TG',
    likes: '26.5k',
    badge: 'Премиум',
    badgeColor: 'bg-gray-900'
  },
  {
    id: 'futuristic-fashion-4',
    title: 'Nike ACG',
    description: 'Карточный дизайн с 3D эффектами',
    category: 'Электронная коммерция',
    image: '/attached_assets/stock_images/futuristic_fashion_m_4203db1e.jpg',
    creator: 'WEB4TG',
    likes: '28.3k',
    badge: 'Интерактив',
    badgeColor: 'bg-gradient-to-r from-gray-800 to-black'
  },
  
  // Premium Lifestyle Collection
];
