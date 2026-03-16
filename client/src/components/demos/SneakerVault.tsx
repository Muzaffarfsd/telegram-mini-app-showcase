import { useState, useEffect, useRef, memo } from "react";
import { scrollToTop } from "@/hooks/useScrollToTop";
import { m, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, X, ChevronLeft, Filter, Star, Package, CreditCard, MapPin, Settings, LogOut, User, Sparkles, TrendingUp, Zap, Search, Menu, Home, Grid, Tag, Plus, Minus, Truck, Shield } from "lucide-react";
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

const mockSneakerReviews = [
  {
    author: 'Максим Р.',
    initials: 'МР',
    rating: 5,
    date: '8 февр. 2026',
    text: 'Потрясающее качество материалов и посадка идеальная. Носил неделю каждый день — амортизация на высоте, ноги не устают даже после долгих прогулок. Упаковка премиальная, доставка быстрая. Однозначно стоят своих денег, буду заказывать ещё.',
    verified: true,
  },
  {
    author: 'Алексей В.',
    initials: 'АВ',
    rating: 5,
    date: '21 янв. 2026',
    text: 'Заказывал как подарок, но теперь хочу себе такие же. Дизайн — огонь, все друзья спрашивают где брал. Кожа мягкая, подошва пружинит. На стопе сидят как влитые. Это уровень, который сложно найти в обычных магазинах.',
    verified: true,
  },
  {
    author: 'Екатерина Д.',
    initials: 'ЕД',
    rating: 4,
    date: '5 дек. 2025',
    text: 'Отличные кроссовки для повседневной носки. Немного маломерят — советую брать на полразмера больше. Качество пошива безупречное, швы ровные, материалы приятные на ощупь. Через месяц носки выглядят как новые. Буду брать вторую пару в другом цвете.',
    verified: true,
  },
];

function SneakerVault({ activeTab, onTabChange }: SneakerVaultProps) {
  const [selectedSneaker, setSelectedSneaker] = useState<Sneaker | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
  const [selectedGender, setSelectedGender] = useState<string>('All');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [productExiting, setProductExiting] = useState(false);
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const [activeProductTab, setActiveProductTab] = useState<'sneaker' | 'tech' | 'reviews'>('sneaker');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [showCatalogSearch, setShowCatalogSearch] = useState(false);

  const productScrollRef = useRef<HTMLDivElement>(null);
  const heroImageRef = useRef<HTMLDivElement>(null);
  
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

  const productPageVariants = {
    initial: { opacity: 0, y: 28, scale: 0.985 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 40, scale: 0.975 },
  };

  const contentStagger = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.055, delayChildren: 0.15 },
    },
  };

  const contentItem = {
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
  };

  const sidebarMenuItems = [
    { icon: <Home className="w-5 h-5" />, label: 'Главная', active: activeTab === 'home' },
    { icon: <Grid className="w-5 h-5" />, label: 'Каталог', active: activeTab === 'catalog' },
    { icon: <Heart className="w-5 h-5" />, label: 'Избранное', badge: favoritesCount > 0 ? String(favoritesCount) : undefined },
    { icon: <ShoppingBag className="w-5 h-5" />, label: 'Корзина', badge: cartCount > 0 ? String(cartCount) : undefined, badgeColor: 'var(--theme-primary)' },
    { icon: <Tag className="w-5 h-5" />, label: 'Акции', badge: 'NEW', badgeColor: '#EF4444' },
    { icon: <User className="w-5 h-5" />, label: 'Профиль', active: activeTab === 'profile' },
    { icon: <Settings className="w-5 h-5" />, label: 'Настройки' },
  ];

  const handleProductBack = () => {
    setProductExiting(true);
    setTimeout(() => {
      setProductExiting(false);
      setSelectedSneaker(null);
    }, 340);
  };

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
    if (activeTab === 'catalog') {
      const q = catalogSearch.trim().toLowerCase();
      const searchMatch = q === '' || s.name.toLowerCase().includes(q) || s.brand.toLowerCase().includes(q);
      return categoryMatch && searchMatch;
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
    setActiveProductTab('sneaker');
    if (heroImageRef.current) heroImageRef.current.style.transform = '';
    if (productScrollRef.current) productScrollRef.current.scrollTop = 0;
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
      description: `${selectedSneaker.name} · ${selectedSneaker.brand} · US ${selectedSize}`,
      duration: 2000,
    });
    
    handleProductBack();
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
    const accentColor = '#f97316';
    const bgColor = '#09090b';
    const discountPct = selectedSneaker.oldPrice
      ? Math.round((1 - selectedSneaker.price / selectedSneaker.oldPrice) * 100)
      : 0;

    return (
      <m.div
        className="h-screen text-white overflow-hidden relative flex flex-col"
        style={{ backgroundColor: bgColor }}
        variants={productPageVariants}
        initial="initial"
        animate={productExiting ? 'exit' : 'animate'}
        transition={{
          duration: productExiting ? 0.32 : 0.35,
          ease: productExiting ? [0.32, 0, 0.67, 0] : [0.22, 1, 0.36, 1],
        }}
      >
        <AnimatePresence>
          {showStickyHeader && (
            <m.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
              className="fixed top-0 left-0 right-0 z-[100]"
              style={{
                paddingTop: 'max(12px, env(safe-area-inset-top))',
                paddingBottom: '12px',
                paddingLeft: '16px',
                paddingRight: '16px',
              }}
            >
              <div
                className="flex items-center justify-between gap-3 px-3 py-2 rounded-[20px]"
                style={{
                  background: `linear-gradient(145deg, ${accentColor}30 0%, rgba(20,20,20,0.85) 100%)`,
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: `0.5px solid ${accentColor}40`,
                  boxShadow: `0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 ${accentColor}20`,
                }}
              >
                <button
                  onClick={handleProductBack}
                  className="w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-transform"
                  style={{ background: 'rgba(255,255,255,0.12)' }}
                  data-testid="button-sticky-back"
                >
                  <ChevronLeft className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.9)' }} strokeWidth={2.5} />
                </button>
                <div className="flex-1 min-w-0 text-center">
                  <p style={{
                    fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em',
                    textTransform: 'uppercase', color: accentColor,
                    fontFamily: "'Montserrat', system-ui, sans-serif",
                    marginBottom: '1px',
                  }}>
                    {selectedSneaker.brand}
                  </p>
                  <p style={{
                    fontSize: '15px', fontWeight: 700,
                    color: 'rgba(255,255,255,0.95)', letterSpacing: '-0.01em',
                    fontFamily: "'Montserrat', system-ui, sans-serif",
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {selectedSneaker.name}
                  </p>
                </div>
                <button
                  onClick={() => onTabChange?.('cart')}
                  className="w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-transform relative"
                  style={{ background: 'rgba(255,255,255,0.12)' }}
                  data-testid="button-sticky-cart"
                >
                  <ShoppingBag className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.9)' }} />
                  {cartCount > 0 && (
                    <span
                      className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold"
                      style={{ background: accentColor, color: '#000' }}
                    >
                      {cartCount}
                    </span>
                  )}
                </button>
              </div>
            </m.div>
          )}
        </AnimatePresence>

        <div
          ref={productScrollRef}
          className="flex-1 overflow-y-auto scrollbar-hide"
          style={{ paddingBottom: '220px' }}
          onScroll={(e) => {
            const st = e.currentTarget.scrollTop;
            setShowStickyHeader(st > 300);
            if (heroImageRef.current) {
              heroImageRef.current.style.transform = `translateY(${st * 0.32}px)`;
            }
          }}
        >

        <div className="relative" style={{ height: '70vh', minHeight: '420px' }}>
          <div className="absolute inset-0 overflow-hidden">
            <m.div
              ref={heroImageRef}
              className="w-full h-full"
              style={{ willChange: 'transform' }}
              initial={{ scale: 1.06, filter: 'brightness(0.72)' }}
              animate={productExiting
                ? { scale: 1.04, filter: 'brightness(0.55)' }
                : { scale: 1, filter: 'brightness(1)' }}
              transition={{ duration: productExiting ? 0.32 : 0.65, ease: [0.32, 0.72, 0, 1] }}
            >
              <LazyImage
                src={selectedSneaker.hoverImage}
                alt={selectedSneaker.name}
                className="w-full h-full object-cover"
              />
            </m.div>
          </div>

          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 40%, ${bgColor}F0 100%)`,
            }}
          />

          <div
            className="absolute left-0 right-0 z-50 flex items-center justify-between px-4"
            style={{ top: 'calc(max(12px, env(safe-area-inset-top)) + 6px)' }}
          >
            <button
              onClick={handleProductBack}
              className="w-11 h-11 rounded-[14px] flex items-center justify-center active:scale-95 transition-all duration-200"
              style={{
                background: 'linear-gradient(145deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.2) 100%)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '0.5px solid rgba(255,255,255,0.5)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              }}
              data-testid="button-back"
            >
              <ChevronLeft className="w-6 h-6" style={{ color: 'rgba(0,0,0,0.8)' }} strokeWidth={2.5} />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); handleToggleFavorite(selectedSneaker.id); }}
              className="w-11 h-11 rounded-[14px] flex items-center justify-center active:scale-95 transition-all duration-200"
              style={{
                background: isFavorite(String(selectedSneaker.id))
                  ? 'linear-gradient(145deg, rgba(255,59,48,0.35) 0%, rgba(255,59,48,0.15) 100%)'
                  : 'linear-gradient(145deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.2) 100%)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: isFavorite(String(selectedSneaker.id))
                  ? '0.5px solid rgba(255,59,48,0.5)'
                  : '0.5px solid rgba(255,255,255,0.5)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              }}
              data-testid={`button-favorite-${selectedSneaker.id}`}
            >
              <Heart
                className="w-5 h-5"
                style={{ color: isFavorite(String(selectedSneaker.id)) ? '#FF3B30' : 'rgba(0,0,0,0.75)' }}
                fill={isFavorite(String(selectedSneaker.id)) ? '#FF3B30' : 'none'}
                strokeWidth={2}
              />
            </button>
          </div>

          <div className="absolute bottom-6 left-6 flex items-center gap-2 flex-wrap">
            {selectedSneaker.isNew && (
              <div
                className="flex items-center px-3 py-1.5 rounded-full"
                style={{
                  background: accentColor,
                  boxShadow: `0 4px 12px ${accentColor}55`,
                }}
              >
                <span style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.18em', color: '#000', textTransform: 'uppercase', fontFamily: "'Montserrat', system-ui, sans-serif" }}>
                  NEW · FW'26
                </span>
              </div>
            )}
            {selectedSneaker.inStock <= 10 && (
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(239,68,68,0.18)', border: '0.5px solid rgba(239,68,68,0.4)' }}
              >
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#EF4444', display: 'inline-block', animation: 'pulse 1.5s ease-in-out infinite' }} />
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#EF4444', letterSpacing: '0.05em', fontFamily: "'Inter', system-ui, sans-serif" }}>
                  Осталось {selectedSneaker.inStock} шт.
                </span>
              </div>
            )}
          </div>
        </div>

          <m.div
            className="relative"
            style={{ marginTop: '-28px' }}
            variants={contentStagger}
            initial="hidden"
            animate={productExiting ? 'hidden' : 'visible'}
          >
            <div
              className="relative rounded-t-[28px]"
              style={{
                padding: '28px 20px 32px',
                display: 'flex',
                flexDirection: 'column',
                gap: '26px',
                background: `linear-gradient(180deg, ${bgColor}EE 0%, #07070A 110px, #07070A 100%)`,
                borderTop: `0.5px solid ${accentColor}30`,
              }}
            >

              <m.div variants={contentItem}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <p style={{
                    fontSize: '10px', fontWeight: 700, letterSpacing: '0.32em',
                    textTransform: 'uppercase', color: accentColor,
                    fontFamily: "'Montserrat', system-ui, sans-serif",
                  }}>
                    {selectedSneaker.brand}
                    <span style={{ color: 'rgba(255,255,255,0.3)', marginLeft: '8px' }}>· {selectedSneaker.releaseYear}</span>
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} style={{ width: '10px', height: '10px' }}
                        fill={s <= Math.round(selectedSneaker.rating) ? 'rgba(255,255,255,0.85)' : 'transparent'}
                        stroke={s <= Math.round(selectedSneaker.rating) ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.2)'}
                      />
                    ))}
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginLeft: '4px' }}>
                      {selectedSneaker.rating}
                    </span>
                  </div>
                </div>

                <h2 style={{
                  fontSize: '34px', fontWeight: 800,
                  letterSpacing: '-0.02em', lineHeight: 1.1,
                  color: 'rgba(255,255,255,0.97)', marginBottom: '14px',
                  fontFamily: "'Montserrat', system-ui, sans-serif",
                }}>
                  {selectedSneaker.name}
                </h2>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                  <p style={{
                    fontSize: '30px', fontWeight: 800, letterSpacing: '-0.03em',
                    fontVariantNumeric: 'tabular-nums', fontFamily: "'Inter', system-ui, sans-serif",
                    color: 'rgba(255,255,255,0.97)', lineHeight: 1,
                  }}>
                    {formatPrice(selectedSneaker.price)}
                  </p>
                  {selectedSneaker.oldPrice && (
                    <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.35)', textDecoration: 'line-through', fontFamily: "'Inter', system-ui, sans-serif" }}>
                      {formatPrice(selectedSneaker.oldPrice)}
                    </p>
                  )}
                  {discountPct > 0 && (
                    <div
                      className="inline-flex items-center px-2.5 py-1 rounded-full"
                      style={{
                        background: `${accentColor}22`,
                        color: accentColor,
                        border: `0.5px solid ${accentColor}50`,
                        fontSize: '10px', fontWeight: 800, letterSpacing: '0.08em',
                        fontFamily: "'Inter', system-ui, sans-serif",
                      }}
                    >
                      −{discountPct}%
                    </div>
                  )}
                </div>
              </m.div>

              <m.div variants={contentItem}>
                <p style={{
                  fontSize: '13px',
                  lineHeight: 1.65,
                  color: 'rgba(255,255,255,0.55)',
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontWeight: 400,
                  letterSpacing: '0.01em',
                  borderLeft: `2px solid ${accentColor}55`,
                  paddingLeft: '12px',
                }}>
                  {selectedSneaker.description}
                </p>
              </m.div>

              <m.div variants={contentItem}>
                <p style={{
                  fontSize: '9px', fontWeight: 700, letterSpacing: '0.28em',
                  textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)',
                  marginBottom: '12px', fontFamily: "'Inter', system-ui, sans-serif",
                }}>
                  Размер (US)
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {selectedSneaker.sizes.map((size) => {
                    const isSelected = selectedSize === size;
                    return (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className="active:scale-95 transition-all duration-200"
                        style={{
                          width: '48px', height: '48px', borderRadius: '50%',
                          fontSize: '14px', fontWeight: 700,
                          fontFamily: "'Inter', system-ui, sans-serif",
                          color: isSelected ? '#000' : 'rgba(255,255,255,0.75)',
                          background: isSelected ? accentColor : 'rgba(255,255,255,0.06)',
                          border: isSelected ? `0.5px solid ${accentColor}` : '0.5px solid rgba(255,255,255,0.15)',
                          boxShadow: isSelected ? `0 4px 16px ${accentColor}40` : 'none',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                        aria-label={`Размер ${size}`}
                        aria-pressed={isSelected}
                        data-testid={`button-size-${size}`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '10px', fontFamily: "'Inter', system-ui, sans-serif" }}>
                  {selectedSneaker.sizeGuide}
                </p>
              </m.div>

              <m.div variants={contentItem} style={{ borderBottom: '0.5px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex' }} role="tablist">
                  {[
                    { key: 'sneaker', label: 'Кроссовка' },
                    { key: 'tech', label: 'Технологии' },
                    { key: 'reviews', label: `Отзывы (${mockSneakerReviews.length})` },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveProductTab(tab.key as typeof activeProductTab)}
                      className="flex-1 transition-all duration-200 relative"
                      style={{
                        padding: '12px 4px 13px',
                        fontSize: '11px',
                        fontWeight: activeProductTab === tab.key ? 700 : 500,
                        color: activeProductTab === tab.key ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.4)',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        fontFamily: "'Inter', system-ui, sans-serif",
                        background: 'transparent',
                      }}
                      role="tab"
                      aria-selected={activeProductTab === tab.key}
                      data-testid={`tab-${tab.key}`}
                    >
                      {tab.label}
                      {activeProductTab === tab.key && (
                        <m.div
                          layoutId="tab-underline-sneakervault"
                          style={{
                            position: 'absolute', bottom: '-0.5px', left: 0, right: 0,
                            height: '1.5px', background: accentColor, borderRadius: '2px',
                          }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </m.div>

              <div>
                <AnimatePresence mode="wait">
                {activeProductTab === 'sneaker' && (
                <m.div key="sneaker" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      {[
                        { label: 'Расцветка', value: selectedSneaker.colorway },
                        { label: 'Технология', value: selectedSneaker.technology },
                        { label: 'Материал', value: selectedSneaker.material },
                        { label: 'Год выпуска', value: String(selectedSneaker.releaseYear) },
                      ].map((card) => (
                        <div key={card.label} style={{
                          padding: '14px 16px', borderRadius: '14px',
                          background: 'rgba(255,255,255,0.04)',
                          border: '0.5px solid rgba(255,255,255,0.08)',
                        }}>
                          <p style={{ fontSize: '8px', fontWeight: 700, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '6px', fontFamily: "'Inter', system-ui, sans-serif" }}>
                            {card.label}
                          </p>
                          <p style={{ fontSize: '14px', fontWeight: 700, color: 'rgba(255,255,255,0.88)', fontFamily: "'Inter', system-ui, sans-serif", lineHeight: 1.3 }}>
                            {card.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div style={{ padding: '14px 16px', borderRadius: '14px', background: `linear-gradient(135deg, ${accentColor}08 0%, rgba(255,255,255,0.02) 100%)`, border: `0.5px solid ${accentColor}20` }}>
                      <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: accentColor, marginBottom: '8px', fontFamily: "'Inter', system-ui, sans-serif" }}>
                        Подбор размера
                      </p>
                      <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'rgba(255,255,255,0.6)', fontFamily: "'Inter', system-ui, sans-serif" }}>
                        {selectedSneaker.sizeGuide}. Рекомендуем примерить в магазине или сверить с таблицей размеров на сайте бренда.
                      </p>
                    </div>

                  </div>
                </m.div>
                )}

                {activeProductTab === 'tech' && (
                <m.div key="tech" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                    <div style={{ padding: '18px 20px', borderRadius: '16px', background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <Zap style={{ width: '14px', height: '14px', color: accentColor }} />
                        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: accentColor, fontFamily: "'Montserrat', system-ui, sans-serif" }}>
                          Технология {selectedSneaker.technology}
                        </p>
                      </div>
                      <p style={{ fontSize: '13px', lineHeight: 1.65, color: 'rgba(255,255,255,0.6)', fontFamily: "'Inter', system-ui, sans-serif" }}>
                        Фирменная технология амортизации обеспечивает максимальный комфорт и отзывчивость при каждом шаге. Воздушная подушка распределяет нагрузку равномерно по всей стопе, снижая усталость при длительной носке.
                      </p>
                    </div>

                    <div style={{ padding: '18px 20px', borderRadius: '16px', background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
                      <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '12px', fontFamily: "'Inter', system-ui, sans-serif" }}>
                        Материал верха
                      </p>
                      <p style={{ fontSize: '16px', fontWeight: 700, color: 'rgba(255,255,255,0.9)', fontFamily: "'Montserrat', system-ui, sans-serif", marginBottom: '8px' }}>
                        {selectedSneaker.material}
                      </p>
                      <p style={{ fontSize: '13px', lineHeight: 1.65, color: 'rgba(255,255,255,0.5)', fontFamily: "'Inter', system-ui, sans-serif" }}>
                        Высококачественные материалы обеспечивают долговечность, воздухопроницаемость и премиальный внешний вид. Усиленные швы и дополнительная прострочка в зонах повышенной нагрузки.
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      {[
                        { label: 'Подошва', value: 'Резина', sub: 'Износостойкая' },
                        { label: 'Вес', value: '~350г', sub: 'Лёгкие' },
                        { label: 'Сцепление', value: 'Высокое', sub: 'Multi-surface' },
                      ].map((item) => (
                        <div key={item.label} style={{ flex: 1, padding: '14px 10px', borderRadius: '14px', background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                          <p style={{ fontSize: '8px', fontWeight: 700, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '6px', fontFamily: "'Inter', system-ui, sans-serif" }}>
                            {item.label}
                          </p>
                          <p style={{ fontSize: '15px', fontWeight: 800, color: 'rgba(255,255,255,0.88)', fontFamily: "'Inter', system-ui, sans-serif", lineHeight: 1, marginBottom: '4px' }}>
                            {item.value}
                          </p>
                          <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', fontFamily: "'Inter', system-ui, sans-serif" }}>
                            {item.sub}
                          </p>
                        </div>
                      ))}
                    </div>

                  </div>
                </m.div>
                )}

                {activeProductTab === 'reviews' && (
                <m.div key="reviews" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ display: 'flex' }}>
                          {[1,2,3,4,5].map((s) => (
                            <Star key={s} className="w-4 h-4"
                              fill={s <= Math.round(selectedSneaker.rating) ? 'rgba(255,255,255,0.95)' : 'transparent'}
                              stroke={s <= Math.round(selectedSneaker.rating) ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.25)'}
                            />
                          ))}
                        </div>
                        <span style={{ fontSize: '16px', fontWeight: 700, color: 'rgba(255,255,255,0.95)', fontFamily: "'Inter', system-ui, sans-serif" }}>{selectedSneaker.rating}</span>
                      </div>
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontFamily: "'Inter', system-ui, sans-serif" }}>{mockSneakerReviews.length} отзывов</span>
                    </div>

                    {mockSneakerReviews.map((review, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '16px', borderRadius: '16px',
                          background: 'rgba(255,255,255,0.04)',
                          border: '0.5px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '50%',
                            background: `linear-gradient(135deg, ${accentColor}60 0%, ${accentColor}30 100%)`,
                            border: `0.5px solid ${accentColor}40`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          }}>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: accentColor, fontFamily: "'Inter', system-ui, sans-serif" }}>{review.initials}</span>
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                              <p style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.9)', fontFamily: "'Inter', system-ui, sans-serif" }}>{review.author}</p>
                              {review.verified && (
                                <span style={{ fontSize: '9px', fontWeight: 700, color: accentColor, letterSpacing: '0.1em', fontFamily: "'Inter', system-ui, sans-serif" }}>✓ ВЕРИФИЦИРОВАН</span>
                              )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <div style={{ display: 'flex', gap: '1px' }}>
                                {[1,2,3,4,5].map((s) => (
                                  <Star key={s} style={{ width: '10px', height: '10px' }}
                                    fill={s <= review.rating ? 'rgba(255,255,255,0.8)' : 'transparent'}
                                    stroke={s <= review.rating ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.2)'}
                                  />
                                ))}
                              </div>
                              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', fontFamily: "'Inter', system-ui, sans-serif" }}>{review.date}</span>
                            </div>
                          </div>
                        </div>
                        <p style={{ fontSize: '13px', lineHeight: 1.65, color: 'rgba(255,255,255,0.65)', fontFamily: "'Inter', system-ui, sans-serif" }}>{review.text}</p>
                      </div>
                    ))}
                  </div>
                </m.div>
                )}
                </AnimatePresence>
              </div>

              <m.div variants={contentItem} style={{ marginTop: '6px' }}>
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', marginBottom: '20px' }} />
                <div style={{
                  display: 'flex', alignItems: 'stretch',
                  borderRadius: '16px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '0.5px solid rgba(255,255,255,0.08)',
                  overflow: 'hidden',
                }}>
                  {[
                    { icon: <Truck style={{ width: '15px', height: '15px', color: accentColor }} strokeWidth={1.5} />, label: 'Доставка', sub: '2-4 дня' },
                    { icon: <Shield style={{ width: '15px', height: '15px', color: accentColor }} strokeWidth={1.5} />, label: 'Оригинал', sub: 'Гарантия' },
                    { icon: <Zap style={{ width: '15px', height: '15px', color: accentColor }} strokeWidth={1.5} />, label: 'Возврат', sub: '14 дней' },
                  ].map((item, i) => (
                    <div key={i} style={{
                      flex: 1,
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      padding: '14px 8px', gap: '5px',
                      borderRight: i < 2 ? '0.5px solid rgba(255,255,255,0.07)' : 'none',
                    }}>
                      {item.icon}
                      <p style={{
                        fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em',
                        color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase',
                        fontFamily: "'Inter', system-ui, sans-serif", lineHeight: 1,
                      }}>
                        {item.label}
                      </p>
                      <p style={{
                        fontSize: '9px', color: 'rgba(255,255,255,0.35)',
                        fontFamily: "'Inter', system-ui, sans-serif",
                      }}>
                        {item.sub}
                      </p>
                    </div>
                  ))}
                </div>
              </m.div>

              {(() => {
                const recommended = sneakers
                  .filter(s => s.id !== selectedSneaker.id)
                  .sort((a, b) => {
                    const sameCat = (a.category === selectedSneaker.category ? 1 : 0) - (b.category === selectedSneaker.category ? 1 : 0);
                    return -sameCat;
                  })
                  .slice(0, 6);
                if (recommended.length === 0) return null;
                return (
                  <m.div variants={contentItem} style={{ marginTop: '6px' }}>
                    <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', flex: 1 }} />
                      <p style={{
                        fontSize: '9px', fontWeight: 700, letterSpacing: '0.25em',
                        textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)',
                        fontFamily: "'Inter', system-ui, sans-serif", whiteSpace: 'nowrap',
                      }}>
                        Вам также понравится
                      </p>
                      <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', flex: 1 }} />
                    </div>

                    <div
                      style={{
                        display: 'flex', gap: '12px',
                        overflowX: 'auto', paddingBottom: '4px',
                      }}
                      className="scrollbar-hide"
                    >
                      {recommended.map((s) => (
                        <div
                          key={s.id}
                          onClick={() => {
                            setSelectedSneaker(s);
                            setSelectedSize(s.sizes[0]);
                            setActiveProductTab('sneaker');
                            setTimeout(() => productScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 50);
                          }}
                          className="cursor-pointer active:scale-95 transition-all duration-200"
                          style={{ width: '120px', flexShrink: 0 }}
                          data-testid={`recommended-sneaker-${s.id}`}
                        >
                          <div style={{
                            width: '120px', height: '140px', borderRadius: '14px',
                            overflow: 'hidden', marginBottom: '8px', position: 'relative',
                            background: 'rgba(255,255,255,0.05)',
                          }}>
                            <LazyImage
                              src={s.image}
                              alt={s.name}
                              className="w-full h-full object-cover"
                            />
                            {s.isNew && (
                              <div style={{
                                position: 'absolute', top: '6px', left: '6px',
                                padding: '2px 7px', borderRadius: '6px',
                                fontSize: '8px', fontWeight: 800, letterSpacing: '0.1em',
                                background: accentColor, color: '#000',
                                fontFamily: "'Inter', system-ui, sans-serif",
                              }}>
                                NEW
                              </div>
                            )}
                            <div style={{
                              position: 'absolute', bottom: 0, left: 0, right: 0, height: '40px',
                              background: 'linear-gradient(0deg, rgba(0,0,0,0.6) 0%, transparent 100%)',
                            }} />
                          </div>
                          <p style={{
                            fontSize: '9px', fontWeight: 700, letterSpacing: '0.18em',
                            color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase',
                            fontFamily: "'Inter', system-ui, sans-serif",
                            marginBottom: '3px',
                          }}>
                            {s.brand}
                          </p>
                          <p style={{
                            fontSize: '13px', fontWeight: 700,
                            color: 'rgba(255,255,255,0.88)', lineHeight: 1.25,
                            fontFamily: "'Montserrat', system-ui, sans-serif",
                            marginBottom: '4px',
                            display: '-webkit-box',
                            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          } as React.CSSProperties}>
                            {s.name}
                          </p>
                          <p style={{
                            fontSize: '12px', fontWeight: 700,
                            color: 'rgba(255,255,255,0.6)',
                            fontFamily: "'Inter', system-ui, sans-serif",
                          }}>
                            {formatPrice(s.price)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </m.div>
                );
              })()}

            </div>
          </m.div>
        </div>

        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 60,
          padding: '16px 20px calc(16px + env(safe-area-inset-bottom, 0px))',
          background: `linear-gradient(0deg, ${bgColor} 60%, transparent 100%)`,
        }}>
          <ConfirmDrawer
            trigger={
              <button
                className="w-full flex items-center justify-center gap-3 active:scale-[0.98] transition-all duration-200"
                style={{
                  height: '56px',
                  borderRadius: '18px',
                  background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}BB 100%)`,
                  boxShadow: `0 8px 32px ${accentColor}40`,
                  border: 'none',
                }}
                data-testid="button-buy-now"
              >
                <ShoppingBag style={{ width: '20px', height: '20px', color: '#000' }} strokeWidth={2} />
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#000', letterSpacing: '-0.01em', fontFamily: "'Inter', system-ui, sans-serif" }}>
                  В корзину
                </span>
                <div style={{ width: '1px', height: '18px', background: 'rgba(0,0,0,0.2)', margin: '0 4px' }} />
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#000', fontVariantNumeric: 'tabular-nums', fontFamily: "'Inter', system-ui, sans-serif" }}>
                  {formatPrice(selectedSneaker.price)}
                </span>
              </button>
            }
            title="Добавить в корзину?"
            description={`${selectedSneaker.name} · ${selectedSneaker.brand} · US ${selectedSize}`}
            confirmText="Добавить"
            cancelText="Отмена"
            variant="default"
            onConfirm={addToCart}
          />
        </div>
      </m.div>
    );
  }

  if (activeTab === 'home') {
    const accentColor = '#f97316';
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

        <div className="px-5 pt-5 pb-4">
          <div className="flex items-center justify-between">
            <button
              onClick={sidebar.open}
              className="w-10 h-10 flex items-center justify-center rounded-full"
              style={{ background: 'rgba(255,255,255,0.06)' }}
              aria-label="Открыть меню"
              data-testid="button-menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="text-center">
              <div className="text-[19px] font-black tracking-[0.22em] leading-none" style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}>
                SNEAKER
              </div>
              <div className="text-[19px] font-black tracking-[0.22em] leading-none" style={{ fontFamily: "'Montserrat', system-ui, sans-serif", color: accentColor }}>
                VAULT
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                aria-label="Корзина"
                className="w-10 h-10 flex items-center justify-center rounded-full relative"
                style={{ background: 'rgba(255,255,255,0.06)' }}
                data-testid="button-view-cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] rounded-full flex items-center justify-center text-[9px] font-bold" style={{ background: accentColor, color: '#000' }}>
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="px-5 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 rounded-2xl px-4 py-3 flex items-center gap-2 min-h-[44px]"
              style={{ background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.1)' }}>
              <Search className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.35)' }} />
              <input
                type="text"
                placeholder="Поиск кроссовок..."
                className="bg-transparent text-white placeholder:text-white/40 outline-none flex-1 text-sm"
                style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
                aria-label="Поиск кроссовок"
                data-testid="input-search"
              />
            </div>
          </div>
        </div>

        <div className="px-5 mb-4">
          <div className="flex gap-1" role="tablist">
            {genderFilters.map((gender) => {
              const labels: Record<string, string> = { All: 'Все', Men: 'Мужские', Woman: 'Женские', Unisex: 'Унисекс' };
              const active = selectedGender === gender;
              return (
                <button
                  key={gender}
                  onClick={() => setSelectedGender(gender)}
                  aria-pressed={active}
                  className="flex-1 transition-all duration-200 relative"
                  style={{
                    padding: '10px 4px',
                    fontSize: '11px',
                    fontWeight: active ? 700 : 500,
                    color: active ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.4)',
                    letterSpacing: '0.06em',
                    fontFamily: "'Inter', system-ui, sans-serif",
                    textTransform: 'uppercase',
                    background: 'transparent',
                  }}
                  data-testid={`button-filter-${gender.toLowerCase()}`}
                >
                  {labels[gender]}
                  {active && (
                    <m.div
                      layoutId="gender-underline-sneakervault"
                      style={{
                        position: 'absolute', bottom: 0, left: '15%', right: '15%',
                        height: '2px', background: accentColor, borderRadius: '2px',
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="overflow-hidden mb-5" style={{ height: '32px' }}>
          <m.div
            animate={{ x: [0, -600] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
            className="flex items-center gap-6 whitespace-nowrap"
            style={{ width: 'fit-content' }}
          >
            {['SNEAKER VAULT', '✦', 'LIMITED DROP', '✦', 'EXCLUSIVE RELEASE', '✦', 'AUTHENTICATED', '✦', 'SNEAKER VAULT', '✦', 'LIMITED DROP', '✦', 'EXCLUSIVE RELEASE', '✦', 'AUTHENTICATED', '✦'].map((text, i) => (
              <span key={i} style={{
                fontSize: '10px', fontWeight: 800, letterSpacing: '0.3em',
                color: text === '✦' ? accentColor : 'rgba(255,255,255,0.15)',
                fontFamily: "'Montserrat', system-ui, sans-serif",
              }}>
                {text}
              </span>
            ))}
          </m.div>
        </div>

        <div className="relative mx-4 rounded-[26px] overflow-hidden" style={{ height: '410px' }}>
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
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.05) 32%, rgba(0,0,0,0.65) 68%, rgba(0,0,0,0.93) 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.18) 0%, transparent 55%)' }} />

          <div className="absolute top-4 left-4">
            <span className="text-[9px] font-bold tracking-[0.35em] uppercase px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(16px)', color: 'rgba(255,255,255,0.75)', border: '0.5px solid rgba(255,255,255,0.18)' }}>
              FW&apos;26
            </span>
          </div>

          <div className="absolute top-4 right-4 text-right">
            <p className="text-[9px] font-bold tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>VOL.I</p>
            <p className="text-[9px] font-bold tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.2)' }}>№001</p>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6">
            <m.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <div style={{ lineHeight: 0.9, marginBottom: '10px' }}>
                <div style={{ fontSize: '50px', fontWeight: 900, letterSpacing: '-0.04em', color: '#fff', display: 'block', fontFamily: "'Montserrat', system-ui, sans-serif" }}>
                  LIMITED
                </div>
                <div style={{ fontSize: '50px', fontWeight: 200, letterSpacing: '0.02em', color: 'rgba(255,255,255,0.55)', display: 'block', fontFamily: "'Montserrat', system-ui, sans-serif" }}>
                  EDITION
                </div>
              </div>
              <div className="flex items-center gap-4 mt-5">
                <button
                  onClick={() => onTabChange?.('catalog')}
                  className="px-5 py-2.5 rounded-full text-[13px] font-black text-black transition-all active:scale-95"
                  style={{ background: accentColor, letterSpacing: '-0.01em', fontFamily: "'Inter', system-ui, sans-serif" }}
                  data-testid="button-hero-shop-sneakers"
                >
                  Смотреть →
                </button>
                <p className="text-[10px] tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: "'Inter', system-ui, sans-serif" }}>
                  Эксклюзивные релизы 2026
                </p>
              </div>
            </m.div>
          </div>
        </div>

        <div className="px-4 mt-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <div>
              <p className="text-[8px] font-semibold tracking-[0.35em] uppercase text-center mb-0.5"
                style={{ color: 'rgba(255,255,255,0.3)', fontFamily: "'Inter', system-ui, sans-serif" }}>
                Хит сезона
              </p>
              <h2 className="leading-none text-center"
                style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '-0.02em', fontFamily: "'Montserrat', system-ui, sans-serif" }}>
                Drop of the Season
              </h2>
            </div>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
          </div>

          {(() => {
            const featured = sneakers.find(s => s.isTrending && s.isNew) ?? sneakers[0];
            return (
              <m.div
                whileTap={{ scale: 0.985 }}
                onClick={() => openSneaker(featured)}
                className="relative cursor-pointer rounded-[22px] overflow-hidden"
                style={{ height: '300px' }}
                data-testid={`featured-sneaker-${featured.id}`}
              >
                <img src={featured.image} alt={featured.name} className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.85) 100%)' }} />

                <div className="absolute top-3.5 left-3.5">
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold"
                    style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(10px)', border: '0.5px solid rgba(255,255,255,0.15)', color: accentColor, fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    {featured.category}
                  </span>
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); handleToggleFavorite(featured.id); }}
                  className="absolute top-3.5 right-3.5 w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition-all"
                  style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)', border: '0.5px solid rgba(255,255,255,0.2)' }}
                  data-testid={`button-favorite-${featured.id}`}
                >
                  <Heart className={`w-4 h-4 ${isFavorite(String(featured.id)) ? 'fill-white text-white' : 'text-white'}`} />
                </button>

                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="flex items-end justify-between">
                    <div>
                      <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', fontFamily: "'Inter', system-ui, sans-serif", marginBottom: '4px' }}>
                        {featured.brand}
                      </p>
                      <p style={{ fontSize: '24px', fontWeight: 800, lineHeight: 1.1, color: '#fff', fontFamily: "'Montserrat', system-ui, sans-serif", letterSpacing: '-0.02em' }}>
                        {featured.name}
                      </p>
                      <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginTop: '4px', fontFamily: "'Inter', system-ui, sans-serif" }}>
                        {featured.colorway} · {featured.technology}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <p style={{ fontSize: '20px', fontWeight: 800, fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: '-0.03em' }}>
                        {formatPrice(featured.price)}
                      </p>
                      {featured.oldPrice && (
                        <p style={{ fontSize: '12px', textDecoration: 'line-through', color: 'rgba(255,255,255,0.35)', fontFamily: "'Inter', system-ui, sans-serif" }}>
                          {formatPrice(featured.oldPrice)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </m.div>
            );
          })()}
        </div>

        <div className="mt-10 px-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p style={{
                fontSize: '9px', fontWeight: 700, letterSpacing: '0.28em',
                color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase',
                fontFamily: "'Inter', system-ui, sans-serif", marginBottom: '4px',
              }}>
                Новые поступления
              </p>
              <h3 style={{
                fontSize: '22px', fontWeight: 800,
                color: 'rgba(255,255,255,0.92)',
                fontFamily: "'Montserrat', system-ui, sans-serif",
                letterSpacing: '-0.02em',
              }}>
                Just Dropped
              </h3>
            </div>
            <button
              onClick={() => onTabChange?.('catalog')}
              style={{
                fontSize: '11px', color: accentColor, fontWeight: 600,
                letterSpacing: '0.05em', fontFamily: "'Inter', system-ui, sans-serif",
              }}
            >
              Все →
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {filteredSneakers.filter(s => s.isNew || s.isTrending).slice(0, 6).map((sneaker) => (
              <div
                key={sneaker.id}
                onClick={() => openSneaker(sneaker)}
                className="cursor-pointer active:scale-[0.97] transition-all duration-200"
                data-testid={`featured-sneaker-${sneaker.id}`}
              >
                <div style={{
                  height: '200px', borderRadius: '16px', overflow: 'hidden',
                  position: 'relative', marginBottom: '10px',
                  background: 'rgba(255,255,255,0.05)',
                }}>
                  <LazyImage src={sneaker.image} alt={sneaker.name} className="w-full h-full object-cover" />
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(0deg, rgba(0,0,0,0.65) 0%, transparent 60%)',
                  }} />
                  <div style={{ position: 'absolute', bottom: '10px', left: '10px', right: '10px' }}>
                    <p style={{
                      fontSize: '8px', fontWeight: 700, letterSpacing: '0.2em',
                      color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase',
                      fontFamily: "'Inter', system-ui, sans-serif", marginBottom: '2px',
                    }}>
                      {sneaker.brand}
                    </p>
                    <p style={{
                      fontSize: '14px', fontWeight: 700,
                      color: '#fff', lineHeight: 1.15,
                      fontFamily: "'Montserrat', system-ui, sans-serif",
                      letterSpacing: '-0.01em',
                    }}>
                      {sneaker.name}
                    </p>
                  </div>
                  {sneaker.isNew && (
                    <div style={{
                      position: 'absolute', top: '8px', left: '8px',
                      padding: '3px 8px', borderRadius: '7px',
                      fontSize: '8px', fontWeight: 800, letterSpacing: '0.1em',
                      background: accentColor, color: '#000',
                      fontFamily: "'Inter', system-ui, sans-serif",
                    }}>
                      NEW
                    </div>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleToggleFavorite(sneaker.id); }}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)' }}
                    data-testid={`button-favorite-${sneaker.id}`}
                  >
                    <Heart className={`w-4 h-4 ${isFavorite(String(sneaker.id)) ? 'fill-white text-white' : 'text-white'}`} />
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <p style={{
                    fontSize: '15px', fontWeight: 800, letterSpacing: '-0.02em',
                    color: 'rgba(255,255,255,0.92)',
                    fontFamily: "'Inter', system-ui, sans-serif",
                  }}>
                    {formatPrice(sneaker.price)}
                  </p>
                  {sneaker.oldPrice && (
                    <p style={{
                      fontSize: '11px', color: 'rgba(255,255,255,0.3)',
                      textDecoration: 'line-through',
                      fontFamily: "'Inter', system-ui, sans-serif",
                    }}>
                      {formatPrice(sneaker.oldPrice)}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ display: 'flex', gap: '1.5px' }}>
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} style={{ width: '9px', height: '9px' }}
                        fill={s <= Math.round(sneaker.rating) ? accentColor : 'transparent'}
                        stroke={s <= Math.round(sneaker.rating) ? accentColor : 'rgba(255,255,255,0.2)'}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 600 }}>
                    {sneaker.rating}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="h-8" />
      </div>
    );
  }

  if (activeTab === 'catalog') {
    const accentCat = '#f97316';
    return (
      <div className="min-h-screen bg-[var(--theme-background)] text-white pb-24 smooth-scroll-page">
        <div className="px-5 pt-5 pb-3">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[9px] font-semibold tracking-[0.3em] uppercase mb-0.5"
                style={{ color: 'rgba(255,255,255,0.35)', fontFamily: "'Inter', system-ui, sans-serif" }}>
                SNEAKER VAULT
              </p>
              <h1 className="leading-none" style={{
                fontSize: '30px', fontWeight: 900, letterSpacing: '-0.02em',
                fontFamily: "'Montserrat', system-ui, sans-serif",
              }}>
                Каталог
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setShowCatalogSearch(s => !s); if (showCatalogSearch) setCatalogSearch(''); }}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95"
                style={{
                  background: showCatalogSearch ? accentCat : 'rgba(255,255,255,0.07)',
                  border: showCatalogSearch ? 'none' : '0.5px solid rgba(255,255,255,0.1)',
                }}
                aria-label="Поиск"
                data-testid="button-view-search"
              >
                <Search className="w-4 h-4" style={{ color: showCatalogSearch ? '#000' : 'rgba(255,255,255,0.7)' }} />
              </button>
              <button
                onClick={() => setSelectedCategory(selectedCategory === 'Все' ? categories[1] || 'Все' : 'Все')}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95"
                style={{
                  background: selectedCategory !== 'Все' ? accentCat : 'rgba(255,255,255,0.07)',
                  border: selectedCategory !== 'Все' ? 'none' : '0.5px solid rgba(255,255,255,0.1)',
                }}
                aria-label="Фильтры"
                data-testid="button-view-filter"
              >
                <Filter className="w-4 h-4" style={{ color: selectedCategory !== 'Все' ? '#000' : 'rgba(255,255,255,0.7)' }} />
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showCatalogSearch && (
              <m.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 44, marginBottom: 12 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                style={{ overflow: 'hidden' }}
              >
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.35)' }} />
                  <input
                    autoFocus
                    value={catalogSearch}
                    onChange={e => setCatalogSearch(e.target.value)}
                    placeholder="Поиск по названию или бренду…"
                    className="w-full h-11 rounded-2xl pl-10 pr-4 text-[13px] outline-none"
                    style={{
                      background: 'rgba(255,255,255,0.07)',
                      border: '0.5px solid rgba(255,255,255,0.12)',
                      color: 'rgba(255,255,255,0.9)',
                      fontFamily: "'Inter', system-ui, sans-serif",
                    }}
                  />
                </div>
              </m.div>
            )}
          </AnimatePresence>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className="flex-shrink-0 transition-all active:scale-95"
                  style={{
                    padding: '8px 16px', borderRadius: '20px',
                    fontSize: '11px', fontWeight: active ? 700 : 500,
                    letterSpacing: '0.04em', fontFamily: "'Inter', system-ui, sans-serif",
                    background: active ? accentCat : 'rgba(255,255,255,0.06)',
                    color: active ? '#000' : 'rgba(255,255,255,0.6)',
                    border: active ? 'none' : '0.5px solid rgba(255,255,255,0.1)',
                  }}
                  aria-pressed={active}
                  data-testid={`button-filter-${cat.toLowerCase()}`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <p className="mt-3 text-[11px]" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: "'Inter', system-ui, sans-serif" }}>
            {filteredSneakers.length} {filteredSneakers.length === 1 ? 'модель' : filteredSneakers.length < 5 ? 'модели' : 'моделей'}
          </p>
        </div>

        <div className="px-4 space-y-3 pb-2">
          {(() => {
            const rows: React.ReactNode[] = [];
            let i = 0;
            let groupIdx = 0;
            while (i < filteredSneakers.length) {
              const featured = filteredSneakers[i];
              const discountFeatured = featured.oldPrice ? Math.round((1 - featured.price / featured.oldPrice) * 100) : 0;
              rows.push(
                <m.div
                  key={`featured-${featured.id}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: groupIdx * 0.1 }}
                  whileTap={{ scale: 0.985 }}
                  onClick={() => openSneaker(featured)}
                  className="relative cursor-pointer rounded-[20px] overflow-hidden"
                  style={{ height: '280px' }}
                  data-testid={`sneaker-card-${featured.id}`}
                >
                  <LazyImage src={featured.image} alt={featured.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                  <div className="absolute top-3.5 left-3.5 flex gap-1.5">
                    {featured.isNew && (
                      <span className="px-2 py-1 text-[9px] font-black rounded-full tracking-[0.08em] uppercase text-black"
                        style={{ background: accentCat }}>NEW</span>
                    )}
                  </div>

                  <div className="absolute top-3.5 right-3.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleToggleFavorite(featured.id); }}
                      aria-label="Избранное"
                      className="w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition-all"
                      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)', border: '0.5px solid rgba(255,255,255,0.2)' }}
                      data-testid={`button-favorite-catalog-${featured.id}`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isFavorite(String(featured.id)) ? 'fill-white' : ''} text-white`} />
                    </button>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-end justify-between">
                      <div className="flex-1 mr-3">
                        <p className="text-[9px] font-semibold tracking-[0.25em] uppercase mb-1" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: "'Inter', system-ui, sans-serif" }}>
                          {featured.brand}
                        </p>
                        <p style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.01em', fontFamily: "'Montserrat', system-ui, sans-serif", lineHeight: 1.15 }}>
                          {featured.name}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-base font-bold" style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', fontFamily: "'Inter', system-ui, sans-serif" }}>
                          {formatPrice(featured.price)}
                        </p>
                        {featured.oldPrice && (
                          <p className="text-[10px] line-through" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: "'Inter', system-ui, sans-serif" }}>
                            {formatPrice(featured.oldPrice)}
                          </p>
                        )}
                        {discountFeatured > 0 && (
                          <span className="inline-block text-[9px] font-black text-black mt-1 px-1.5 py-0.5 rounded-md" style={{ background: accentCat, fontFamily: "'Inter', system-ui, sans-serif" }}>
                            −{discountFeatured}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </m.div>
              );
              i++;

              const pair = filteredSneakers.slice(i, i + 2);
              if (pair.length > 0) {
                rows.push(
                  <div key={`pair-${groupIdx}`} className="grid grid-cols-2 gap-3">
                    {pair.map((sneaker, colIdx) => {
                      const discountPair = sneaker.oldPrice ? Math.round((1 - sneaker.price / sneaker.oldPrice) * 100) : 0;
                      return (
                        <m.div
                          key={sneaker.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: groupIdx * 0.1 + 0.04 + colIdx * 0.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => openSneaker(sneaker)}
                          className="cursor-pointer"
                          data-testid={`sneaker-card-${sneaker.id}`}
                        >
                          <div className="relative rounded-[18px] overflow-hidden mb-2.5"
                            style={{ height: colIdx === 0 ? '210px' : '178px' }}>
                            <LazyImage src={sneaker.image} alt={sneaker.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

                            <div className="absolute top-2 right-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleToggleFavorite(sneaker.id); }}
                                aria-label="Избранное"
                                className="w-8 h-8 rounded-full flex items-center justify-center active:scale-95 transition-all"
                                style={{ background: 'rgba(0,0,0,0.38)', backdropFilter: 'blur(10px)', border: '0.5px solid rgba(255,255,255,0.18)' }}
                                data-testid={`button-favorite-catalog-${sneaker.id}`}
                              >
                                <Heart className={`w-3 h-3 ${isFavorite(String(sneaker.id)) ? 'fill-white' : ''} text-white`} />
                              </button>
                            </div>

                            {sneaker.isNew && (
                              <div className="absolute top-2 left-2">
                                <span className="px-2 py-1 text-[9px] font-black rounded-full tracking-[0.08em] uppercase text-black"
                                  style={{ background: accentCat }}>NEW</span>
                              </div>
                            )}

                            {discountPair > 0 && (
                              <div className="absolute bottom-2 left-2">
                                <span className="px-1.5 py-0.5 text-[9px] font-black rounded-md text-black"
                                  style={{ background: accentCat, fontFamily: "'Inter', system-ui, sans-serif" }}>
                                  −{discountPair}%
                                </span>
                              </div>
                            )}
                          </div>

                          <div>
                            <p className="text-[8px] font-semibold tracking-[0.22em] uppercase mb-0.5 truncate"
                              style={{ color: 'rgba(255,255,255,0.38)', fontFamily: "'Inter', system-ui, sans-serif" }}>
                              {sneaker.brand}
                            </p>
                            <p style={{ fontSize: '13px', fontWeight: 700, lineHeight: 1.2, marginBottom: '4px', fontFamily: "'Montserrat', system-ui, sans-serif", color: 'rgba(255,255,255,0.9)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' } as React.CSSProperties}>
                              {sneaker.name}
                            </p>
                            <div className="flex items-baseline gap-1.5 mb-1">
                              <span className="text-[13px] font-bold" style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em', fontFamily: "'Inter', system-ui, sans-serif" }}>
                                {formatPrice(sneaker.price)}
                              </span>
                              {sneaker.oldPrice && (
                                <span className="text-[10px] line-through" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: "'Inter', system-ui, sans-serif" }}>
                                  {formatPrice(sneaker.oldPrice)}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <div key={star} className="w-1.5 h-1.5 rounded-full"
                                  style={{ background: star <= Math.round(sneaker.rating) ? accentCat : 'rgba(255,255,255,0.15)' }} />
                              ))}
                            </div>
                          </div>
                        </m.div>
                      );
                    })}
                  </div>
                );
                i += pair.length;
              }
              groupIdx++;
            }
            return rows;
          })()}
        </div>

        {filteredSneakers.length === 0 && (
          <m.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
            className="flex flex-col items-center justify-center py-20 px-8 text-center"
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
              style={{ background: 'rgba(249,115,22,0.1)', border: '0.5px solid rgba(249,115,22,0.25)' }}>
              <Search className="w-6 h-6" style={{ color: accentCat }} />
            </div>
            <p style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '-0.02em', fontFamily: "'Montserrat', system-ui, sans-serif", marginBottom: '8px', color: 'rgba(255,255,255,0.85)' }}>
              Ничего не найдено
            </p>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.38)', fontFamily: "'Inter', system-ui, sans-serif", lineHeight: 1.6, marginBottom: '20px' }}>
              {catalogSearch ? `По запросу «${catalogSearch}» моделей не найдено` : 'Попробуйте изменить фильтры'}
            </p>
            <button
              onClick={() => { setSelectedCategory('Все'); setCatalogSearch(''); setShowCatalogSearch(false); }}
              className="px-6 py-2.5 rounded-full text-[12px] font-bold tracking-[0.05em] transition-all active:scale-95"
              style={{ background: accentCat, color: '#000', fontFamily: "'Inter', system-ui, sans-serif" }}
            >
              Сбросить фильтры
            </button>
          </m.div>
        )}
      </div>
    );
  }

  if (activeTab === 'cart') {
    const accentColor = '#f97316';
    return (
      <div className="min-h-screen bg-[var(--theme-background)] text-white pb-52 smooth-scroll-page">
        <div className="px-5 pt-6 pb-5" style={{ borderBottom: '0.5px solid rgba(255,255,255,0.07)' }}>
          <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.32em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '4px', fontFamily: "'Inter', system-ui, sans-serif" }}>
            SNEAKER VAULT
          </p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 900, lineHeight: 1, fontFamily: "'Montserrat', system-ui, sans-serif", letterSpacing: '-0.02em' }}>
              Корзина
            </h1>
            {cartCount > 0 && (
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.38)', fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 400 }}>
                — {cartCount} {cartCount === 1 ? 'пара' : cartCount < 5 ? 'пары' : 'пар'}
              </span>
            )}
          </div>
        </div>

        <div className="px-5 pt-4">
          {cart.length === 0 ? (
            <EmptyState
              type="cart"
              title="Корзина пуста"
              description="Добавьте кроссовки из каталога, чтобы оформить заказ"
              actionLabel="Перейти в каталог"
              onAction={() => onTabChange?.('catalog')}
            />
          ) : (
            <>
              <div className="space-y-3">
                {cart.map((item) => (
                  <m.div
                    key={`${item.id}-${item.size}`}
                    layout
                    style={{
                      display: 'flex', gap: '14px', padding: '16px',
                      borderRadius: '20px', background: 'rgba(255,255,255,0.04)',
                      border: '0.5px solid rgba(255,255,255,0.08)',
                    }}
                    data-testid={`cart-item-${item.id}`}
                  >
                    <div style={{ width: '80px', height: '80px', borderRadius: '14px', overflow: 'hidden', flexShrink: 0, background: 'rgba(255,255,255,0.05)' }}>
                      <LazyImage src={item.image || ''} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', fontFamily: "'Inter', system-ui, sans-serif", marginBottom: '3px' }}>
                        {sneakers.find(s => String(s.id) === item.id)?.brand ?? 'SNEAKER'}
                      </p>
                      <p style={{ fontSize: '15px', fontWeight: 700, color: 'rgba(255,255,255,0.92)', fontFamily: "'Montserrat', system-ui, sans-serif", marginBottom: '4px', letterSpacing: '-0.01em' }}>
                        {item.name}
                      </p>
                      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: "'Inter', system-ui, sans-serif", marginBottom: '10px' }}>
                        {item.color} · US {item.size}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <p style={{ fontSize: '16px', fontWeight: 800, fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                          {formatPrice(item.price * item.quantity)}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', borderRadius: '20px', background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.1)', padding: '2px' }}>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1, item.size, item.color)}
                            className="w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-all"
                            style={{ background: 'rgba(255,255,255,0.08)' }}
                            aria-label="Уменьшить количество"
                            data-testid={`button-decrease-${item.id}`}
                          >
                            <Minus className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.7)' }} />
                          </button>
                          <span style={{ minWidth: '28px', textAlign: 'center', fontSize: '14px', fontWeight: 700, fontFamily: "'Inter', system-ui, sans-serif" }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1, item.size, item.color)}
                            className="w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-all"
                            style={{ background: 'rgba(255,255,255,0.08)' }}
                            aria-label="Увеличить количество"
                            data-testid={`button-increase-${item.id}`}
                          >
                            <Plus className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.7)' }} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id, item.size, item.color)}
                      className="w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-all self-start"
                      style={{ background: 'rgba(255,255,255,0.06)', flexShrink: 0, marginTop: '2px' }}
                      aria-label="Удалить из корзины"
                      data-testid={`button-remove-${item.id}`}
                    >
                      <X className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.4)' }} />
                    </button>
                  </m.div>
                ))}
              </div>

              <div style={{ marginTop: '20px', padding: '20px', borderRadius: '20px', background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontFamily: "'Inter', system-ui, sans-serif" }}>Подитог</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, fontFamily: "'Inter', system-ui, sans-serif" }}>{formatPrice(cartTotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontFamily: "'Inter', system-ui, sans-serif" }}>Доставка</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#34D399', fontFamily: "'Inter', system-ui, sans-serif" }}>Бесплатно</span>
                </div>
                <div style={{ height: '0.5px', background: 'rgba(255,255,255,0.08)', marginBottom: '14px' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '15px', fontWeight: 700, fontFamily: "'Inter', system-ui, sans-serif" }}>Итого</span>
                  <span style={{ fontSize: '18px', fontWeight: 800, fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: '-0.02em' }}>{formatPrice(cartTotal)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {cart.length > 0 && (
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
            padding: '16px 20px calc(16px + env(safe-area-inset-bottom, 0px))',
            background: 'linear-gradient(0deg, var(--theme-background) 60%, transparent 100%)',
          }}>
            <button
              onClick={() => setIsCheckoutOpen(true)}
              className="w-full rounded-[18px] font-black transition-all active:scale-[0.97]"
              style={{
                background: `linear-gradient(135deg, ${accentColor} 0%, #ea580c 100%)`,
                color: '#000', fontSize: '15px', fontFamily: "'Inter', system-ui, sans-serif",
                letterSpacing: '-0.01em', padding: '16px 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                boxShadow: `0 8px 32px ${accentColor}40`,
              }}
              data-testid="button-checkout"
            >
              <span>Оформить заказ</span>
              <span style={{ opacity: 0.55 }}>·</span>
              <span>{formatPrice(cartTotal)}</span>
            </button>
          </div>
        )}

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
    const accentColor = '#f97316';
    const totalSpent = orders.reduce((acc, o) => acc + o.total, 0);
    const tier = totalSpent >= 50000 ? 'VAULT PLATINUM' : totalSpent >= 20000 ? 'VAULT GOLD' : 'VAULT MEMBER';
    const tierColor = totalSpent >= 50000 ? '#E8E8E8' : accentColor;
    const statusLabel: Record<string, string> = { pending: 'Обработка', confirmed: 'Подтверждён', processing: 'В пути', shipped: 'Доставляется', delivered: 'Доставлен' };
    const statusColor: Record<string, string> = { pending: 'rgba(255,255,255,0.35)', confirmed: '#60A5FA', processing: '#F97316', shipped: '#F59E0B', delivered: '#34D399' };

    return (
      <div className="min-h-screen bg-[var(--theme-background)] text-white pb-24 smooth-scroll-page">

        <div style={{ position: 'relative', overflow: 'hidden', padding: '36px 20px 28px' }}>
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${accentColor}07 0%, transparent 55%), linear-gradient(225deg, ${accentColor}04 0%, transparent 50%)` }} />
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '0.5px', background: `linear-gradient(90deg, transparent, ${accentColor}40, transparent)` }} />

          <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', gap: '16px', marginBottom: '24px' }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%',
                background: `linear-gradient(135deg, ${accentColor} 0%, #ea580c 100%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 0 0 3px ${accentColor}33, 0 0 0 6px ${accentColor}11`,
              }}>
                <span style={{ fontSize: '22px', fontWeight: 800, color: '#000', fontFamily: "'Montserrat', system-ui, sans-serif", letterSpacing: '-0.03em' }}>ДС</span>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em', fontFamily: "'Montserrat', system-ui, sans-serif", marginBottom: '2px' }}>
                Дмитрий Смирнов
              </h2>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontFamily: "'Inter', system-ui, sans-serif", marginBottom: '10px' }}>
                +7 (999) 555-77-88
              </p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '20px', background: `${tierColor}15`, border: `0.5px solid ${tierColor}35` }}>
                <Sparkles style={{ width: '9px', height: '9px', color: tierColor }} />
                <span style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.22em', color: tierColor, fontFamily: "'Inter', system-ui, sans-serif", textTransform: 'uppercase' }}>
                  {tier}
                </span>
              </div>
            </div>
          </div>

          <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            {[
              { label: 'Заказы', value: String(ordersCount) },
              { label: 'Избранное', value: String(favoritesCount) },
              { label: 'Потрачено', value: totalSpent > 0 ? `${Math.round(totalSpent / 1000)}К` : '0' },
            ].map((stat) => (
              <div key={stat.label} style={{ padding: '14px 10px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                <p style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.03em', fontFamily: "'Inter', system-ui, sans-serif", color: accentColor, lineHeight: 1, marginBottom: '5px' }}>
                  {stat.value}
                </p>
                <p style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', fontFamily: "'Inter', system-ui, sans-serif" }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ height: '0.5px', background: 'rgba(255,255,255,0.07)', margin: '0 20px' }} />

        {orders.length > 0 && (
          <div style={{ padding: '20px 20px 4px' }}>
            <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '12px', fontFamily: "'Inter', system-ui, sans-serif" }}>
              Последние заказы
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {orders.slice(0, 3).map((order) => {
                const st = order.status ?? 'delivered';
                return (
                  <div key={order.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '16px', background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.07)' }} data-testid={`order-${order.id}`}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${accentColor}15`, border: `0.5px solid ${accentColor}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Package style={{ width: '18px', height: '18px', color: accentColor }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '13px', fontWeight: 600, fontFamily: "'Inter', system-ui, sans-serif", color: 'rgba(255,255,255,0.9)', marginBottom: '2px' }}>
                        № {order.id.slice(-6).toUpperCase()}
                      </p>
                      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: "'Inter', system-ui, sans-serif" }}>
                        {order.items.length} {order.items.length === 1 ? 'товар' : order.items.length < 5 ? 'товара' : 'товаров'} · {formatPrice(order.total)}
                      </p>
                    </div>
                    <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 9px', borderRadius: '20px', background: `${statusColor[st]}18`, color: statusColor[st], fontFamily: "'Inter', system-ui, sans-serif", flexShrink: 0 }}>
                      {statusLabel[st] ?? 'Доставлен'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ padding: orders.length > 0 ? '12px 20px 0' : '20px 20px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { icon: <Heart style={{ width: '18px', height: '18px' }} />, label: 'Избранное', badge: favoritesCount > 0 ? String(favoritesCount) : undefined, testId: 'button-favorites' },
            { icon: <MapPin style={{ width: '18px', height: '18px' }} />, label: 'Адреса доставки', testId: 'button-address' },
            { icon: <Package style={{ width: '18px', height: '18px' }} />, label: 'Мои заказы', badge: ordersCount > 0 ? String(ordersCount) : undefined, testId: 'button-orders' },
            { icon: <CreditCard style={{ width: '18px', height: '18px' }} />, label: 'Способы оплаты', testId: 'button-payment' },
            { icon: <Settings style={{ width: '18px', height: '18px' }} />, label: 'Настройки', testId: 'button-settings' },
          ].map((item) => (
            <button
              key={item.label}
              className="w-full transition-all active:scale-[0.98]"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '18px', background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.07)' }}
              aria-label={item.label}
              data-testid={item.testId}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)' }}>
                  {item.icon}
                </div>
                <span style={{ fontSize: '15px', fontWeight: 500, color: 'rgba(255,255,255,0.88)', fontFamily: "'Inter', system-ui, sans-serif" }}>
                  {item.label}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {item.badge && (
                  <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '20px', background: `${accentColor}15`, color: accentColor, fontFamily: "'Inter', system-ui, sans-serif" }}>
                    {item.badge}
                  </span>
                )}
                <ChevronLeft style={{ width: '16px', height: '16px', color: 'rgba(255,255,255,0.2)', transform: 'rotate(180deg)' }} />
              </div>
            </button>
          ))}

          <button
            className="w-full transition-all active:scale-[0.98]"
            style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', borderRadius: '18px', background: 'rgba(239,68,68,0.06)', border: '0.5px solid rgba(239,68,68,0.15)' }}
            data-testid="button-logout"
          >
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LogOut style={{ width: '18px', height: '18px', color: 'rgba(239,68,68,0.8)' }} />
            </div>
            <span style={{ fontSize: '15px', fontWeight: 600, color: 'rgba(239,68,68,0.85)', fontFamily: "'Inter', system-ui, sans-serif" }}>
              Выйти из аккаунта
            </span>
          </button>
        </div>

        <div style={{ height: '20px' }} />
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
