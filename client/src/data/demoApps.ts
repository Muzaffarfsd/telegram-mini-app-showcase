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
    id: 'clothing-store',
    title: 'Radiance',
    description: 'Магазин модной одежды и аксессуаров',
    category: 'Электронная коммерция',
    image: '/attached_assets/4659a0f48988f601b98b2cec6406c739_1762127566273.jpg',
    creator: 'WEB4TG',
    likes: '12.3k',
    badge: 'Premium',
    badgeColor: 'bg-black',
    home: {
      hero: {
        title: 'Digital Fashion',
        subtitle: 'Sharp design. Strong brands. Clear meaning.',
        image: '/attached_assets/4659a0f48988f601b98b2cec6406c739_1762127566273.jpg',
        bgClass: 'bg-black'
      },
      banners: [
        {
          title: 'Digital Collection',
          subtitle: 'Radiance.Family',
          image: '/attached_assets/4659a0f48988f601b98b2cec6406c739_1762127566273.jpg',
          bgClass: 'bg-black'
        },
        {
          title: 'Premium Design',
          subtitle: 'Beautiful & meaningful',
          bgClass: 'bg-gradient-to-r from-gray-900 to-black'
        }
      ],
      services: [
        { id: 'catalog', title: 'Каталог', priceText: 'Просмотр товаров', iconName: 'grid' },
        { id: 'favorites', title: 'Избранное', priceText: 'Сохраненные товары', iconName: 'heart' },
        { id: 'cart', title: 'Корзина', priceText: 'Мои покупки', iconName: 'shopping-cart' },
        { id: 'profile', title: 'Профиль', priceText: 'Личный кабинет', iconName: 'user' }
      ]
    }
  },
  {
    id: 'electronics',
    title: 'TechMart',
    description: 'Магазин электроники и техники',
    category: 'Электронная коммерция',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&auto=format,compress&fit=crop&w=400&h=300&q=80&dpr=2',
    creator: 'WEB4TG',
    likes: '11.8k',
    badge: 'Хит продаж',
    badgeColor: 'bg-blue-500',
    home: {
      hero: {
        title: 'Добро пожаловать в TechMart',
        subtitle: 'Лучшие технологии по доступным ценам',
        image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&auto=format,compress&fit=crop&w=400&h=300&q=80&dpr=2',
        bgClass: 'bg-gradient-to-r from-blue-500 to-cyan-600'
      },
      banners: [
        {
          title: 'iPhone 16 Pro',
          subtitle: 'Новинка уже в продаже',
          image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400&auto=format,compress&q=80&dpr=2',
          bgClass: 'bg-gradient-to-r from-gray-800 to-gray-900'
        },
        {
          title: 'Черная пятница',
          subtitle: 'Скидки до 70% на всё',
          bgClass: 'bg-gradient-to-r from-red-500 to-orange-600'
        }
      ],
      services: [
        { id: 'catalog', title: 'Каталог', priceText: 'Все товары', iconName: 'smartphone' },
        { id: 'compare', title: 'Сравнение', priceText: 'Сравнить товары', iconName: 'bar-chart' },
        { id: 'cart', title: 'Корзина', priceText: 'Мои покупки', iconName: 'shopping-cart' },
        { id: 'profile', title: 'Профиль', priceText: 'Личный кабинет', iconName: 'user' }
      ]
    }
  },
  {
    id: 'beauty',
    title: 'GlowSpa',
    description: 'Салон красоты и SPA-услуги',
    category: 'Красота и здоровье',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?ixlib=rb-4.0.3&auto=format,compress&fit=crop&w=400&h=300&q=80&dpr=2',
    creator: 'WEB4TG',
    likes: '9.7k',
    badge: 'Премиум',
    badgeColor: 'bg-pink-500',
    home: {
      hero: {
        title: 'Добро пожаловать в GlowSpa',
        subtitle: 'Откройте секрет вашей красоты',
        image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?ixlib=rb-4.0.3&auto=format,compress&fit=crop&w=400&h=300&q=80&dpr=2',
        bgClass: 'bg-gradient-to-r from-pink-500 to-rose-600'
      },
      banners: [
        {
          title: 'Новые процедуры',
          subtitle: 'Anti-age терапия',
          image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&auto=format,compress&q=80&dpr=2',
          bgClass: 'bg-gradient-to-r from-purple-500 to-indigo-600'
        },
        {
          title: 'Акция месяца',
          subtitle: 'Скидка 30% на все услуги',
          bgClass: 'bg-gradient-to-r from-emerald-500 to-teal-600'
        }
      ],
      services: [
        { id: 'services', title: 'Услуги', priceText: 'Все процедуры', iconName: 'sparkles' },
        { id: 'booking', title: 'Запись', priceText: 'Онлайн бронирование', iconName: 'calendar' },
        { id: 'loyalty', title: 'Программа лояльности', priceText: 'Накопительные скидки', iconName: 'gift' },
        { id: 'profile', title: 'Профиль', priceText: 'Личный кабинет', iconName: 'user' }
      ]
    }
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
  {
    id: 'luxury-watches',
    title: 'TimeElite',
    description: 'Магазин элитных часов',
    category: 'Электронная коммерция',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format,compress&fit=crop&w=400&h=300&q=80&dpr=2',
    creator: 'WEB4TG',
    likes: '15.2k',
    badge: 'Люкс',
    badgeColor: 'bg-yellow-600',
    home: {
      hero: {
        title: 'Добро пожаловать в TimeElite',
        subtitle: 'Эксклюзивные часы для истинных ценителей',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format,compress&fit=crop&w=400&h=300&q=80&dpr=2',
        bgClass: 'bg-gradient-to-r from-yellow-600 to-amber-700'
      },
      banners: [
        {
          title: 'Новинка',
          subtitle: 'Коллекция Rolex 2025',
          image: 'https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?w=400&auto=format,compress&q=80&dpr=2',
          bgClass: 'bg-gradient-to-r from-blue-500 to-indigo-600'
        },
        {
          title: 'Эксклюзив',
          subtitle: 'Лимитированные серии',
          bgClass: 'bg-gradient-to-r from-purple-500 to-pink-600'
        }
      ],
      services: [
        { id: 'catalog', title: 'Каталог', priceText: 'Все часы', iconName: 'watch' },
        { id: 'brands', title: 'Бренды', priceText: 'Rolex, Omega, Cartier', iconName: 'star' },
        { id: 'cart', title: 'Корзина', priceText: 'Мои покупки', iconName: 'shopping-cart' },
        { id: 'profile', title: 'Профиль', priceText: 'Личный кабинет', iconName: 'user' }
      ]
    }
  },
  {
    id: 'sneaker-store',
    title: 'SneakerVault',
    description: 'Магазин кроссовок',
    category: 'Электронная коммерция',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format,compress&fit=crop&w=400&h=300&q=80&dpr=2',
    creator: 'WEB4TG',
    likes: '18.9k',
    badge: 'Streetwear',
    badgeColor: 'bg-red-500',
    home: {
      hero: {
        title: 'Добро пожаловать в SneakerVault',
        subtitle: 'Редкие дропы и эксклюзивные коллаборации',
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format,compress&fit=crop&w=400&h=300&q=80&dpr=2',
        bgClass: 'bg-gradient-to-r from-red-500 to-orange-600'
      },
      banners: [
        {
          title: 'Jordan Retro',
          subtitle: 'Новый релиз уже в продаже',
          image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400&auto=format,compress&q=80&dpr=2',
          bgClass: 'bg-gradient-to-r from-black to-gray-800'
        },
        {
          title: 'Предзаказ',
          subtitle: 'Yeezy Boost 350 V3',
          bgClass: 'bg-gradient-to-r from-purple-500 to-pink-600'
        }
      ],
      services: [
        { id: 'catalog', title: 'Каталог', priceText: 'Все кроссовки', iconName: 'zap' },
        { id: 'drops', title: 'Дропы', priceText: 'Новые релизы', iconName: 'lightning' },
        { id: 'cart', title: 'Корзина', priceText: 'Мои покупки', iconName: 'shopping-cart' },
        { id: 'profile', title: 'Профиль', priceText: 'Личный кабинет', iconName: 'user' }
      ]
    }
  },
  {
    id: 'luxury-perfume',
    title: 'FragranceRoyale',
    description: 'Магазин премиальной парфюмерии',
    category: 'Электронная коммерция',
    image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59d75?ixlib=rb-4.0.3&auto=format,compress&fit=crop&w=400&h=300&q=80&dpr=2',
    creator: 'WEB4TG',
    likes: '11.7k',
    badge: 'Премиум',
    badgeColor: 'bg-purple-500',
    home: {
      hero: {
        title: 'Добро пожаловать в FragranceRoyale',
        subtitle: 'Откройте для себя последние ароматы премиум класса',
        image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59d75?ixlib=rb-4.0.3&auto=format,compress&fit=crop&w=400&h=300&q=80&dpr=2',
        bgClass: 'bg-gradient-to-r from-purple-500 to-pink-600'
      },
      banners: [
        {
          title: 'Новая коллекция',
          subtitle: 'Весна-Лето 2025',
          image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=400&auto=format,compress&fit=crop&q=80&dpr=2',
          bgClass: 'bg-gradient-to-r from-pink-500 to-rose-600'
        },
        {
          title: 'Скидки до 50%',
          subtitle: 'На избранные ароматы',
          image: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&auto=format,compress&fit=crop&q=80&dpr=2',
          bgClass: 'bg-gradient-to-r from-orange-500 to-red-600'
        }
      ],
      services: [
        { id: 'catalog', title: 'Каталог', priceText: 'Просмотр ароматов', iconName: 'grid' },
        { id: 'favorites', title: 'Избранное', priceText: 'Сохраненные ароматы', iconName: 'heart' },
        { id: 'cart', title: 'Корзина', priceText: 'Мои покупки', iconName: 'shopping-cart' },
        { id: 'profile', title: 'Профиль', priceText: 'Личный кабинет', iconName: 'user' }
      ]
    }
  },
  
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
  
  // Premium Design Collection - New Apps
  {
    id: 'oxyz-nft',
    title: 'OXYZ',
    description: 'Футуристическая NFT платформа с красными акцентами',
    category: 'NFT & Крипто',
    image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=300&fit=crop&q=80',
    creator: 'WEB4TG',
    likes: '45.2k',
    badge: 'NFT',
    badgeColor: 'bg-red-600',
    home: {
      hero: {
        title: 'OXYZ NFT',
        subtitle: 'The Future of Digital Art',
        image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&h=600&fit=crop&q=90',
        bgClass: 'bg-black'
      },
      services: [
        { id: 'catalog', title: 'Explore', priceText: 'NFT Collection', iconName: 'grid' },
        { id: 'cart', title: 'Wallet', priceText: 'Your Assets', iconName: 'wallet' },
        { id: 'profile', title: 'Settings', priceText: 'Account', iconName: 'settings' }
      ]
    }
  },
  {
    id: 'emily-carter-ai',
    title: 'Emily Carter AI',
    description: 'AI-ассистент с минималистичным современным дизайном',
    category: 'AI & Технологии',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop&q=80',
    creator: 'WEB4TG',
    likes: '67.8k',
    badge: 'AI',
    badgeColor: 'bg-emerald-600',
    home: {
      hero: {
        title: 'Emily Carter',
        subtitle: 'Your AI Assistant',
        image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop&q=90',
        bgClass: 'bg-white'
      },
      services: [
        { id: 'catalog', title: 'Chat', priceText: 'Start talking', iconName: 'message-square' },
        { id: 'cart', title: 'History', priceText: 'Past chats', iconName: 'clock' },
        { id: 'profile', title: 'Profile', priceText: 'Settings', iconName: 'user' }
      ]
    }
  },
];
