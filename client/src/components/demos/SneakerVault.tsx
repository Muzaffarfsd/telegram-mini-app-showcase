import { useState, useEffect, memo } from "react";
import { scrollToTop } from "@/hooks/useScrollToTop";
import { m, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, X, ChevronLeft, Filter, Star, Package, CreditCard, MapPin, Settings, LogOut, User, Sparkles, TrendingUp, Zap, Search, Menu, Home, Grid, Tag, Plus, Minus } from "lucide-react";
import { OptimizedImage } from "../OptimizedImage";
import { ConfirmDrawer } from "../ui/modern-drawer";
import { usePersistentCart } from "@/hooks/usePersistentCart";
import { usePersistentFavorites } from "@/hooks/usePersistentFavorites";
import { usePersistentOrders } from "@/hooks/usePersistentOrders";
import { useToast } from "@/hooks/use-toast";
import { EmptyState, LazyImage, UrgencyIndicator, TrustBadges, DemoThemeProvider } from "@/components/shared";
import { CheckoutDrawer } from "@/components/shared/CheckoutDrawer";
import DemoSidebar, { useDemoSidebar } from "./DemoSidebar";
import greenNikeImage from "@assets/загруженное-_4__1761733573240.jpg";
import blueNikeImage from "@assets/загруженное-_3__1761733577054.jpg";
import whiteJordanImage from "@assets/загруженное-_2__1761733579316.jpg";
import tealJordanImage from "@assets/NIKE-AIR-JORDAN-V2-e-V3-_designer_designergrafico-_design-_nikeair-_airjordan-_socialmedia-_natural-_1761733582395.jpg";
import airForce1LowImage from "@assets/air_force_1_low.jpg";
import travisScottJordanImage from "@assets/travis_scott_jordan.jpg";
import yeezyBoost350V2Image from "@assets/yeezy_boost_350_v2.jpg";
import nikeAirMax90Image from "@assets/nike_air_max_90.jpg";

const sneakerVideo = "/videos/ae01958370d099047455d799eba60389_1762352751328.mp4";

const STORE_KEY = 'sneakervault-store';

interface SneakerVaultProps {
  activeTab: 'home' | 'catalog' | 'cart' | 'profile';
  onTabChange?: (tab: string) => void;
}

interface Sneaker {
  id: number;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  hoverImage: string;
  description: string;
  sizes: string[];
  brand: string;
  category: string;
  gender: 'Men' | 'Woman' | 'Unisex';
  inStock: number;
  rating: number;
  isNew?: boolean;
  isTrending?: boolean;
  colorway: string;
  technology: string;
  material: string;
  releaseYear: number;
  sizeGuide: string;
}

const sneakers: Sneaker[] = [
  { 
    id: 1, 
    name: 'Daisy Dream Dunk', 
    price: 18900, 
    oldPrice: 22900,
    image: greenNikeImage, 
    hoverImage: greenNikeImage,
    description: 'Классические кроссовки Nike Dunk, вернувшиеся из архивов 1985 года в эксклюзивной расцветке с цветочным принтом Daisy Dream. Верх из премиальной замши с перфорацией для вентиляции и культовой цветовой блокировкой Green/Beige. Мягкий пенный воротник обнимает лодыжку для поддержки без давления, а технология Nike Air обеспечивает амортизацию на весь день. Лимитированный релиз для ценителей стритвира и коллекционеров редких силуэтов.', 
    sizes: ['7', '8', '9', '10', '11', '12'], 
    brand: 'Nike',
    category: 'Лайфстайл', 
    gender: 'Unisex',
    inStock: 8, 
    rating: 5.0, 
    isNew: true,
    isTrending: true,
    colorway: 'Green/Beige',
    technology: 'Nike Air',
    material: 'Премиальная замша',
    releaseYear: 2024,
    sizeGuide: 'Соответствует размеру'
  },
  { 
    id: 2, 
    name: 'Sky Water Dunk', 
    price: 17900, 
    oldPrice: 21900,
    image: blueNikeImage, 
    hoverImage: blueNikeImage,
    description: 'Культовый силуэт Nike Dunk в небесно-голубой расцветке Sky Water, ставший легендой скейтбординга и стритвира. Верх из натуральной кожи премиального качества с усиленными накладками для долговечности и стиля. Технология Zoom Air в стельке обеспечивает мгновенный отклик и невесомую амортизацию при каждом шаге. Подошва cupsole гарантирует идеальное сцепление на любых поверхностях от скейтпарка до городских улиц.', 
    sizes: ['7', '8', '9', '10', '11', '12'], 
    brand: 'Nike',
    category: 'Лайфстайл', 
    gender: 'Unisex',
    inStock: 12, 
    rating: 4.9, 
    isNew: true,
    isTrending: true,
    colorway: 'Sky Blue',
    technology: 'Zoom Air',
    material: 'Натуральная кожа',
    releaseYear: 2024,
    sizeGuide: 'Соответствует размеру'
  },
  { 
    id: 3, 
    name: 'Forest Air Jordan 1', 
    price: 25900, 
    oldPrice: 29900,
    image: whiteJordanImage, 
    hoverImage: whiteJordanImage,
    description: 'Легендарные баскетбольные кроссовки Air Jordan 1, ставшие иконой стритвира с момента дебюта в 1985 году на ногах Майкла Джордана. Верх из премиальной кожи с классическим силуэтом high-top и эксклюзивной расцветкой Forest White/Silver. Подошва Air-Sole обеспечивает отзывчивую амортизацию и максимальный комфорт на каждом шаге. Лимитированный ретро-релиз с оригинальной конструкцией и аутентичными материалами для истинных коллекционеров.', 
    sizes: ['7', '8', '9', '10', '11', '12'], 
    brand: 'Jordan',
    category: 'Баскетбол', 
    gender: 'Men',
    inStock: 6, 
    rating: 5.0, 
    isNew: true,
    isTrending: true,
    colorway: 'White/Silver',
    technology: 'Air-Sole',
    material: 'Премиальная кожа',
    releaseYear: 2024,
    sizeGuide: 'Маломерит на 0.5 размера'
  },
  { 
    id: 4, 
    name: 'Butterfly Jordan 1', 
    price: 26900, 
    oldPrice: 31900,
    image: tealJordanImage, 
    hoverImage: tealJordanImage,
    description: 'Эксклюзивная модель Air Jordan 1, созданная как дань уважения наследию Майкла Джордана в уникальной расцветке Butterfly Teal/Black. Верх из премиального нубука с контрастными деталями и культовым силуэтом, изменившим историю баскетбола. Технология Encapsulated Air обеспечивает идеальную амортизацию и поддержку при интенсивных нагрузках. Редчайший релиз для коллекционеров, сочетающий аутентичный дизайн 1985 года с современными материалами.', 
    sizes: ['7', '8', '9', '10', '11', '12'], 
    brand: 'Jordan',
    category: 'Баскетбол', 
    gender: 'Men',
    inStock: 5, 
    rating: 5.0, 
    isNew: true,
    isTrending: true,
    colorway: 'Teal/Black',
    technology: 'Encapsulated Air',
    material: 'Премиальный нубук',
    releaseYear: 2024,
    sizeGuide: 'Маломерит на 0.5 размера'
  },
  { 
    id: 5, 
    name: 'Air Max 90 Essential', 
    price: 15900, 
    image: nikeAirMax90Image, 
    hoverImage: nikeAirMax90Image,
    description: 'Революционные кроссовки Nike Air Max 90, ставшие первыми в истории с видимой воздушной подушкой Max Air в пятке. Классический дизайн 1990 года от Тинкера Хэтфилда в культовой расцветке White/Red, определившей эстетику целого десятилетия. Комбинированный верх из текстиля и синтетических материалов обеспечивает легкость и воздухопроницаемость. Технология Max Air дарит невесомую походку и непревзойденный комфорт при длительной носке.', 
    sizes: ['7', '8', '9', '10', '11', '12'], 
    brand: 'Nike',
    category: 'Беговые', 
    gender: 'Unisex',
    inStock: 15, 
    rating: 4.8, 
    isTrending: true,
    colorway: 'White/Red',
    technology: 'Max Air',
    material: 'Текстиль и синтетика',
    releaseYear: 2024,
    sizeGuide: 'Соответствует размеру'
  },
  { 
    id: 6, 
    name: 'Yeezy Boost 350 V2', 
    price: 32900, 
    image: yeezyBoost350V2Image, 
    hoverImage: yeezyBoost350V2Image,
    description: 'Коллекционный грааль современного стритвира — легендарная модель Yeezy Boost 350 V2, созданная в коллаборации Kanye West и Adidas. Верх из инновационного материала Primeknit обеспечивает идеальную посадку и воздухопроницаемость, адаптируясь к форме стопы. Культовая расцветка Zebra с контрастными полосами стала символом эксклюзивности и статуса в мире кроссовок. Подошва Boost возвращает энергию при каждом шаге, обеспечивая непревзойденный комфорт весь день.', 
    sizes: ['7', '8', '9', '10', '11'], 
    brand: 'Adidas',
    category: 'Лайфстайл', 
    gender: 'Unisex',
    inStock: 4, 
    rating: 4.7, 
    isNew: true,
    colorway: 'Zebra',
    technology: 'Boost',
    material: 'Primeknit',
    releaseYear: 2024,
    sizeGuide: 'Маломерит на 0.5 размера'
  },
  { 
    id: 7, 
    name: 'Air Force 1 Low', 
    price: 13900, 
    image: airForce1LowImage, 
    hoverImage: airForce1LowImage,
    description: 'Бессмертная икона Nike Air Force 1, ставшая самыми продаваемыми кроссовками в истории с момента дебюта в 1982 году. Верх из премиальной кожи в классической расцветке All White обеспечивает чистый минималистичный стиль для любого образа. Революционная технология Air-Sole дарит легкость каждому шагу и непревзойденную амортизацию на весь день. Культовый силуэт, который определил стиль хип-хоп культуры и продолжает вдохновлять новые поколения.', 
    sizes: ['7', '8', '9', '10', '11', '12'], 
    brand: 'Nike',
    category: 'Баскетбол', 
    gender: 'Unisex',
    inStock: 20, 
    rating: 4.9, 
    colorway: 'All White',
    technology: 'Air-Sole',
    material: 'Премиальная кожа',
    releaseYear: 2024,
    sizeGuide: 'Большемерит на 0.5 размера'
  },
  { 
    id: 8, 
    name: 'Travis Scott x Jordan', 
    price: 89900, 
    image: travisScottJordanImage, 
    hoverImage: travisScottJordanImage,
    description: 'Редчайший и самый желанный релиз десятилетия — эксклюзивная коллаборация Travis Scott x Air Jordan 1 с культовым обратным Swoosh. Верх из премиальной замши в расцветке Brown/Black с уникальными деталями, созданными лично Трэвисом Скоттом. Скрытый карман на щиколотке и особая шнуровка делают каждую пару произведением искусства для истинных коллекционеров. Технология Air-Sole обеспечивает комфорт легенды, а лимитированный тираж гарантирует эксклюзивность и инвестиционную ценность.', 
    sizes: ['8', '9', '10', '11'], 
    brand: 'Jordan',
    category: 'Коллаб', 
    gender: 'Men',
    inStock: 2, 
    rating: 5.0, 
    isNew: true,
    colorway: 'Brown/Black',
    technology: 'Air-Sole',
    material: 'Премиальная замша',
    releaseYear: 2024,
    sizeGuide: 'Соответствует размеру'
  },
];

const categories = ['Все', 'Лайфстайл', 'Баскетбол', 'Беговые', 'Коллаб'];
const genderFilters = ['All', 'Men', 'Woman', 'Unisex'];

function SneakerVault({ activeTab, onTabChange }: SneakerVaultProps) {
  const [selectedSneaker, setSelectedSneaker] = useState<Sneaker | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
  const [selectedGender, setSelectedGender] = useState<string>('All');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  
  const { toast } = useToast();
  const sidebar = useDemoSidebar();

  const { 
    cartItems: cart, 
    addToCart: addToCartHook, 
    removeFromCart, 
    updateQuantity,
    clearCart, 
    totalAmount: cartTotal,
    totalItems: cartCount 
  } = usePersistentCart({ storageKey: `${STORE_KEY}_cart` });
  
  const { 
    toggleFavorite: toggleFavoriteHook, 
    isFavorite,
    favoritesCount 
  } = usePersistentFavorites({ storageKey: `${STORE_KEY}_favorites` });
  
  const { 
    orders, 
    createOrder,
    ordersCount 
  } = usePersistentOrders({ storageKey: `${STORE_KEY}_orders` });

  const sidebarMenuItems = [
    { icon: <Home className="w-5 h-5" />, label: 'Главная', active: activeTab === 'home' },
    { icon: <Grid className="w-5 h-5" />, label: 'Каталог', active: activeTab === 'catalog' },
    { icon: <Heart className="w-5 h-5" />, label: 'Избранное', badge: favoritesCount > 0 ? String(favoritesCount) : undefined },
    { icon: <ShoppingBag className="w-5 h-5" />, label: 'Корзина', badge: cartCount > 0 ? String(cartCount) : undefined, badgeColor: 'var(--theme-primary)' },
    { icon: <Tag className="w-5 h-5" />, label: 'Акции', badge: 'NEW', badgeColor: '#EF4444' },
    { icon: <User className="w-5 h-5" />, label: 'Профиль', active: activeTab === 'profile' },
    { icon: <Settings className="w-5 h-5" />, label: 'Настройки' },
  ];

  useEffect(() => {
    scrollToTop();
    if (activeTab !== 'catalog') {
      setSelectedSneaker(null);
    }
    if (activeTab !== 'home') {
      setSelectedGender('All');
    }
  }, [activeTab]);

  const filteredSneakers = sneakers.filter(s => {
    const categoryMatch = selectedCategory === 'Все' || s.category === selectedCategory;
    
    if (activeTab === 'home') {
      const genderMatch = selectedGender === 'All' || s.gender === selectedGender;
      return categoryMatch && genderMatch;
    }
    
    return categoryMatch;
  });

  const handleToggleFavorite = (sneakerId: number) => {
    toggleFavoriteHook(String(sneakerId));
    const isNowFavorite = !isFavorite(String(sneakerId));
    toast({
      title: isNowFavorite ? 'Добавлено в избранное' : 'Удалено из избранного',
      duration: 1500,
    });
  };

  const openSneaker = (sneaker: Sneaker) => {
    scrollToTop();
    onTabChange?.('catalog');
    setSelectedSneaker(sneaker);
    setSelectedSize(sneaker.sizes[0]);
  };

  const addToCart = () => {
    if (!selectedSneaker) return;
    
    addToCartHook({
      id: String(selectedSneaker.id),
      name: selectedSneaker.name,
      price: selectedSneaker.price,
      image: selectedSneaker.image,
      size: selectedSize,
      color: selectedSneaker.colorway
    });
    
    toast({
      title: 'Добавлено в корзину',
      description: `${selectedSneaker.name} • ${selectedSneaker.brand} • Размер ${selectedSize}`,
      duration: 2000,
    });
    
    setSelectedSneaker(null);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleCheckout = (orderId: string) => {
    const orderItems = cart.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      size: item.size,
      color: item.color
    }));
    
    createOrder(orderItems, cartTotal, {
      address: 'Москва',
      phone: '+7 (999) 555-77-88'
    });
    
    clearCart();
    setIsCheckoutOpen(false);
    
    toast({
      title: 'Заказ оформлен!',
      description: `Номер заказа: ${orderId}`,
      duration: 3000,
    });
  };

  if (activeTab === 'catalog' && selectedSneaker) {
    return (
      <div className="min-h-screen bg-[var(--theme-background)] text-white pb-24 smooth-scroll-page">
        <div className="absolute top-0 left-0 right-0 z-10 demo-nav-safe flex items-center justify-between">
          <button 
            onClick={() => setSelectedSneaker(null)}
            className="w-11 h-11 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/20"
            aria-label="Назад"
            data-testid="button-back"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleFavorite(selectedSneaker.id);
            }}
            className="w-11 h-11 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/20"
            aria-label={isFavorite(String(selectedSneaker.id)) ? 'Удалить из избранного' : 'Добавить в избранное'}
            data-testid={`button-favorite-${selectedSneaker.id}`}
          >
            <Heart 
              className={`w-5 h-5 ${isFavorite(String(selectedSneaker.id)) ? 'fill-white text-white' : 'text-white'}`}
            />
          </button>
        </div>

        <div className="relative h-[60vh]">
          <LazyImage
            src={selectedSneaker.hoverImage}
            alt={selectedSneaker.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="bg-black/90 backdrop-blur-xl rounded-t-3xl p-6 space-y-6 pb-32">
          <div className="text-center">
            <p className="text-sm text-white/60 mb-2">{selectedSneaker.brand}</p>
            <h2 className="text-2xl font-bold mb-2">{selectedSneaker.name}</h2>
            <div className="flex items-center justify-center gap-3">
              <p className="text-3xl font-bold">{formatPrice(selectedSneaker.price)}</p>
              {selectedSneaker.oldPrice && (
                <p className="text-xl text-white/50 line-through">{formatPrice(selectedSneaker.oldPrice)}</p>
              )}
            </div>
          </div>

          <p className="text-sm text-white/80 text-center">{selectedSneaker.description}</p>

          <div>
            <p className="text-sm mb-3 text-white/80 text-center">Выберите размер (US):</p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {selectedSneaker.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-12 h-12 rounded-full font-semibold transition-all ${
                    selectedSize === size
                      ? 'bg-[var(--theme-primary)] text-black'
                      : 'bg-black/40 text-white hover:bg-black/60 border border-white/20'
                  }`}
                  aria-label={`Размер ${size}`}
                  aria-pressed={selectedSize === size}
                  data-testid={`button-size-${size}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <ConfirmDrawer
            trigger={
              <button
                className="w-full bg-[var(--theme-primary)] text-black font-bold py-4 rounded-full hover:bg-[var(--theme-accent)] transition-all min-h-[48px]"
                data-testid="button-buy-now"
              >
                Добавить в корзину
              </button>
            }
            title="Добавить в корзину?"
            description={`${selectedSneaker.name} • ${selectedSneaker.brand} • Размер ${selectedSize}`}
            confirmText="Добавить"
            cancelText="Отмена"
            variant="default"
            onConfirm={addToCart}
          />
        </div>
      </div>
    );
  }

  if (activeTab === 'home') {
    return (
      <div className="min-h-screen bg-[var(--theme-background)] text-white pb-24 smooth-scroll-page">
        <DemoSidebar
          isOpen={sidebar.isOpen}
          onClose={sidebar.close}
          onOpen={sidebar.open}
          menuItems={sidebarMenuItems}
          title="SNEAKER"
          subtitle="VAULT"
          accentColor="var(--theme-primary)"
          bgColor="var(--theme-background)"
        />
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-6 scroll-fade-in">
            <button 
              onClick={sidebar.open} 
              aria-label="Открыть меню" 
              className="w-11 h-11 flex items-center justify-center"
              data-testid="button-menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3">
              <button 
                aria-label="Корзина" 
                className="w-11 h-11 flex items-center justify-center"
                data-testid="button-view-cart"
              >
                <ShoppingBag className="w-6 h-6" />
              </button>
              <button 
                aria-label="Избранное" 
                className="w-11 h-11 flex items-center justify-center"
                data-testid="button-view-favorites"
              >
                <Heart className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="mb-6 scroll-fade-in">
            <h1 className="text-4xl font-black mb-1 tracking-tight">
              SNEAKER<br/>
              VAULT
            </h1>
          </div>

          <div className="flex items-center gap-4 mb-6 scroll-fade-in">
            <button 
              className="p-2 bg-[var(--theme-primary)] rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Главная"
              data-testid="button-view-home"
            >
              <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
              </svg>
            </button>
            {genderFilters.map((gender) => (
              <button
                key={gender}
                onClick={() => setSelectedGender(gender)}
                aria-pressed={selectedGender === gender}
                className={`text-sm font-medium transition-all relative min-h-[44px] px-2 ${
                  selectedGender === gender
                    ? 'text-white font-bold'
                    : 'text-white/40'
                }`}
                data-testid={`button-filter-${gender.toLowerCase()}`}
              >
                {gender}
                {selectedGender === gender && (
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[var(--theme-primary)] rounded-full"></div>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 bg-black/40 backdrop-blur-xl rounded-full px-4 py-3 flex items-center gap-2 border border-white/20 min-h-[48px]">
              <Search className="w-5 h-5 text-white/50" />
              <input
                type="text"
                placeholder="Поиск кроссовок..."
                className="bg-transparent text-white placeholder:text-white/50 outline-none flex-1 text-sm"
                aria-label="Поиск кроссовок"
                data-testid="input-search"
              />
            </div>
          </div>
        </div>

        <div className="relative mb-6 mx-6 rounded-3xl overflow-hidden scroll-fade-in" style={{ height: '500px' }}>
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            data-testid="video-hero-banner-sneaker"
          >
            <source src={sneakerVideo} type="video/mp4" />
          </video>
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <m.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-5xl font-black mb-3 tracking-tight leading-tight">
                LIMITED<br/>
                EDITION
              </h2>
              <p className="text-lg text-white/80 mb-6" style={{ letterSpacing: '0.1em' }}>
                Эксклюзивные релизы 2025
              </p>
              <button 
                className="px-8 py-4 rounded-full font-bold text-black transition-all hover:scale-105 min-h-[48px]"
                style={{
                  background: 'var(--theme-primary)',
                  boxShadow: '0 0 30px var(--theme-primary-glow, rgba(205, 255, 56, 0.4))'
                }}
                data-testid="button-hero-shop-sneakers"
              >
                Смотреть коллекцию
              </button>
            </m.div>
          </div>
        </div>

        <div className="px-6 space-y-4">
          {filteredSneakers.slice(0, 3).map((sneaker, idx) => (
            <m.div
              key={sneaker.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => openSneaker(sneaker)}
              className={`relative cursor-pointer group rounded-3xl overflow-hidden ${idx === 0 ? 'scroll-fade-in' : ''}`}
              style={{ height: idx === 0 ? '400px' : '320px' }}
              data-testid={`featured-sneaker-${sneaker.id}`}
            >
              <div className="absolute inset-0">
                <LazyImage
                  src={sneaker.image}
                  alt={sneaker.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <div className="px-3 py-1 bg-black/60 backdrop-blur-xl rounded-full border border-white/20">
                  <span className="text-xs font-semibold text-white">
                    {sneaker.isNew ? 'New' : sneaker.category}
                  </span>
                </div>
                {sneaker.inStock < 10 && (
                  <UrgencyIndicator 
                    type="stock"
                    value={sneaker.inStock}
                    variant="badge"
                  />
                )}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleFavorite(sneaker.id);
                }}
                className="absolute top-4 right-4 w-11 h-11 rounded-full bg-black/60 backdrop-blur-xl flex items-center justify-center border border-white/20"
                aria-label={isFavorite(String(sneaker.id)) ? 'Удалить из избранного' : 'Добавить в избранное'}
                data-testid={`button-favorite-${sneaker.id}`}
              >
                <Heart 
                  className={`w-5 h-5 ${isFavorite(String(sneaker.id)) ? 'fill-white text-white' : 'text-white'}`}
                />
              </button>

              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-end justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-white/70 mb-1">{sneaker.brand}</p>
                    <h3 className="text-2xl font-bold mb-2 leading-tight">
                      {sneaker.name}
                    </h3>
                    <p className="text-sm text-white/80 mb-4">{sneaker.colorway}</p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openSneaker(sneaker);
                    }}
                    className="w-14 h-14 rounded-full bg-[var(--theme-primary)] flex items-center justify-center hover:bg-[var(--theme-accent)] transition-all hover:scale-110"
                    aria-label={`Добавить ${sneaker.name} в корзину`}
                    data-testid={`button-add-to-cart-${sneaker.id}`}
                  >
                    <ShoppingBag className="w-6 h-6 text-black" />
                  </button>
                </div>

                <div className="mt-3">
                  <p className="text-lg font-bold">{formatPrice(sneaker.price)}</p>
                </div>
              </div>
            </m.div>
          ))}
        </div>

        <div className="h-8"></div>
      </div>
    );
  }

  if (activeTab === 'catalog') {
    return (
      <div className="min-h-screen bg-[var(--theme-background)] text-white pb-24 smooth-scroll-page">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6 scroll-fade-in">
            <h1 className="text-2xl font-bold">Каталог</h1>
            <div className="flex items-center gap-3">
              <button 
                className="w-11 h-11 flex items-center justify-center" 
                aria-label="Поиск"
                data-testid="button-view-search"
              >
                <Search className="w-6 h-6" />
              </button>
              <button 
                className="w-11 h-11 flex items-center justify-center" 
                aria-label="Фильтры"
                data-testid="button-view-filter"
              >
                <Filter className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all min-h-[44px] ${
                  selectedCategory === cat
                    ? 'bg-[var(--theme-primary)] text-black'
                    : 'bg-black/40 text-white/70 hover:bg-black/60 border border-white/20'
                }`}
                aria-pressed={selectedCategory === cat}
                data-testid={`button-filter-${cat.toLowerCase()}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {filteredSneakers.map((sneaker, index) => (
              <m.div
                key={sneaker.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => openSneaker(sneaker)}
                className={`relative cursor-pointer ${index < 4 ? '' : `scroll-fade-in-delay-${Math.min((index - 4) % 3 + 1, 3)}`}`}
                data-testid={`sneaker-card-${sneaker.id}`}
              >
                <div className="relative aspect-[3/4] rounded-3xl overflow-hidden mb-3 bg-black/40 border border-white/10">
                  <LazyImage
                    src={sneaker.image}
                    alt={sneaker.name}
                    className="w-full h-full object-cover"
                  />
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(sneaker.id);
                    }}
                    className="absolute top-2 right-2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-xl flex items-center justify-center border border-white/20"
                    aria-label={isFavorite(String(sneaker.id)) ? 'Удалить из избранного' : 'Добавить в избранное'}
                    data-testid={`button-favorite-${sneaker.id}`}
                  >
                    <Heart 
                      className={`w-4 h-4 ${isFavorite(String(sneaker.id)) ? 'fill-white text-white' : 'text-white'}`}
                    />
                  </button>

                  {sneaker.isNew && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-[var(--theme-primary)] text-black text-xs font-bold rounded-full">
                      NEW
                    </div>
                  )}
                  {sneaker.inStock < 10 && (
                    <div className="absolute top-2 left-2" style={{ marginTop: sneaker.isNew ? '32px' : '0' }}>
                      <UrgencyIndicator 
                        type="stock"
                        value={sneaker.inStock}
                        variant="badge"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-xs text-white/60 mb-1">{sneaker.brand}</p>
                  <p className="text-sm font-semibold mb-1 truncate">{sneaker.name}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-base font-bold">{formatPrice(sneaker.price)}</p>
                    {sneaker.oldPrice && (
                      <p className="text-xs text-white/40 line-through">{formatPrice(sneaker.oldPrice)}</p>
                    )}
                  </div>
                </div>
              </m.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'cart') {
    return (
      <div className="min-h-screen bg-[var(--theme-background)] text-white pb-32 smooth-scroll-page">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Корзина</h1>

          {cart.length === 0 ? (
            <EmptyState
              type="cart"
              title="Корзина пуста"
              description="Добавьте кроссовки из каталога, чтобы оформить заказ"
              actionLabel="Перейти в каталог"
              onAction={() => onTabChange?.('catalog')}
            />
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={`${item.id}-${item.size}`}
                  className="bg-black/40 backdrop-blur-xl rounded-2xl p-4 flex gap-4 border border-white/10"
                  data-testid={`cart-item-${item.id}`}
                >
                  <LazyImage
                    src={item.image || ''}
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{item.name}</h3>
                    <p className="text-sm text-white/60 mb-2">
                      Размер: {item.size}
                    </p>
                    <p className="text-lg font-bold">{formatPrice(item.price)}</p>
                    
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1, item.size, item.color)}
                        className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
                        aria-label="Уменьшить количество"
                        data-testid={`button-decrease-${item.id}`}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-lg font-semibold min-w-[24px] text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.size, item.color)}
                        className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
                        aria-label="Увеличить количество"
                        data-testid={`button-increase-${item.id}`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id, item.size, item.color)}
                    className="w-10 h-10 flex items-center justify-center"
                    aria-label="Удалить из корзины"
                    data-testid={`button-remove-${item.id}`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}

              <div className="fixed bottom-24 left-0 right-0 p-6 bg-[var(--theme-background)] border-t border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold">Итого:</span>
                  <span className="text-2xl font-bold">{formatPrice(cartTotal)}</span>
                </div>
                <TrustBadges variant="compact" className="mb-4" />
                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full bg-[var(--theme-primary)] text-black font-bold py-4 rounded-full hover:bg-[var(--theme-accent)] transition-all min-h-[48px]"
                  data-testid="button-checkout"
                >
                  Оформить заказ
                </button>
              </div>
            </div>
          )}
        </div>

        <CheckoutDrawer
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          items={cart.map(item => ({
            id: Number(item.id),
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            image: item.image
          }))}
          total={cartTotal}
          currency="₽"
          onOrderComplete={handleCheckout}
          storeName="SneakerVault"
        />
      </div>
    );
  }

  if (activeTab === 'profile') {
    return (
      <div className="min-h-screen bg-[var(--theme-background)] text-white pb-24 smooth-scroll-page">
        <div className="p-6 bg-black/80 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-accent)] rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-black" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Дмитрий Смирнов</h2>
              <p className="text-sm text-white/70">+7 (999) 555-77-88</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-black/40 backdrop-blur-xl rounded-xl border border-white/20">
              <p className="text-sm text-white/70 mb-1">Заказы</p>
              <p className="text-2xl font-bold">{ordersCount}</p>
            </div>
            <div className="p-4 bg-black/40 backdrop-blur-xl rounded-xl border border-white/20">
              <p className="text-sm text-white/70 mb-1">Избранное</p>
              <p className="text-2xl font-bold">{favoritesCount}</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="scroll-fade-in">
            <h3 className="text-lg font-bold mb-4">Мои заказы</h3>
            {ordersCount === 0 ? (
              <EmptyState
                type="orders"
                title="Нет заказов"
                description="Ваши заказы будут отображаться здесь после оформления"
              />
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div key={order.id} className="bg-black/40 backdrop-blur-xl rounded-xl p-4 border border-white/10" data-testid={`order-${order.id}`}>
                    <div className="flex justify-between gap-2 mb-2">
                      <span className="text-white/80">Заказ #{order.id.slice(-6)}</span>
                      <span className="text-white/60">{new Date(order.createdAt).toLocaleDateString('ru-RU')}</span>
                    </div>
                    <div className="flex justify-between gap-2 mb-2">
                      <span className="text-white/60">{order.items.length} товаров</span>
                      <span className="font-bold" style={{ color: 'var(--theme-primary)' }}>{formatPrice(order.total)}</span>
                    </div>
                    <div className="mt-2">
                      <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">
                        {order.status === 'pending' ? 'Ожидает' : order.status === 'confirmed' ? 'Подтвержден' : order.status === 'processing' ? 'В обработке' : order.status === 'shipped' ? 'Отправлен' : 'Доставлен'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <button 
              className="w-full p-4 bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 flex items-center justify-between hover-elevate active-elevate-2 min-h-[56px]" 
              aria-label="Избранное"
              data-testid="button-favorites"
            >
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-white/70" />
                <span className="font-medium">Избранное</span>
              </div>
              <ChevronLeft className="w-5 h-5 rotate-180 text-white/50" />
            </button>

            <button 
              className="w-full p-4 bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 flex items-center justify-between hover-elevate active-elevate-2 min-h-[56px]" 
              aria-label="Способы оплаты"
              data-testid="button-payment"
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-white/70" />
                <span className="font-medium">Способы оплаты</span>
              </div>
              <ChevronLeft className="w-5 h-5 rotate-180 text-white/50" />
            </button>

            <button 
              className="w-full p-4 bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 flex items-center justify-between hover-elevate active-elevate-2 min-h-[56px]" 
              aria-label="Адреса доставки"
              data-testid="button-address"
            >
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-white/70" />
                <span className="font-medium">Адреса доставки</span>
              </div>
              <ChevronLeft className="w-5 h-5 rotate-180 text-white/50" />
            </button>

            <button 
              className="w-full p-4 bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 flex items-center justify-between hover-elevate active-elevate-2 min-h-[56px]" 
              aria-label="Настройки"
              data-testid="button-settings"
            >
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-white/70" />
                <span className="font-medium">Настройки</span>
              </div>
              <ChevronLeft className="w-5 h-5 rotate-180 text-white/50" />
            </button>

            <button 
              className="w-full p-4 bg-red-500/10 backdrop-blur-xl rounded-xl border border-red-500/20 flex items-center justify-between hover-elevate active-elevate-2 mt-4 min-h-[56px]" 
              aria-label="Выйти"
              data-testid="button-logout"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-5 h-5 text-red-400" />
                <span className="font-medium text-red-400">Выйти</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function SneakerVaultWithTheme(props: SneakerVaultProps) {
  return (
    <DemoThemeProvider themeId="sneakerVault">
      <SneakerVault {...props} />
    </DemoThemeProvider>
  );
}

export default memo(SneakerVaultWithTheme);
