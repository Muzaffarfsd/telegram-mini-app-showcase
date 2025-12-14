import { useState, useEffect, memo } from "react";
import { scrollToTop } from "@/hooks/useScrollToTop";
import { m, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, X, ChevronLeft, Filter, Star, Package, CreditCard, MapPin, Settings, LogOut, User, Sparkles, TrendingUp, Zap, Search, Menu, Flower2, Crown, Droplets, Home, Grid, Tag, Plus, Minus } from "lucide-react";
import { OptimizedImage } from "../OptimizedImage";
import { ConfirmDrawer } from "../ui/modern-drawer";
import { usePersistentCart } from "@/hooks/usePersistentCart";
import { usePersistentFavorites } from "@/hooks/usePersistentFavorites";
import { usePersistentOrders } from "@/hooks/usePersistentOrders";
import { useToast } from "@/hooks/use-toast";
import { EmptyState } from "@/components/shared/EmptyState";
import { CheckoutDrawer } from "@/components/shared/CheckoutDrawer";
import { LazyImage, UrgencyIndicator, TrustBadges, DemoThemeProvider } from "@/components/shared";
import DemoSidebar, { useDemoSidebar } from "./DemoSidebar";
import tomFordBlackOrchidImage from "@assets/tom_ford_black_orchid.jpg";
import creedAventusImage from "@assets/creed_aventus.jpg";
import chanelNo5Image from "@assets/chanel_no5.jpg";
import lelaboSantal33Image from "@assets/lelabo_santal33.jpg";
import baccaratRouge540Image from "@assets/baccarat_rouge_540.jpg";
import tomfordOudWoodImage from "@assets/tomford_oud_wood.jpg";
import diorSauvageImage from "@assets/dior_sauvage.jpg";
import chanelCocoMademoiselleImage from "@assets/chanel_coco_mademoiselle.jpg";

const STORE_KEY = 'fragranceroyale-store';

interface FragranceRoyaleProps {
  activeTab: 'home' | 'catalog' | 'cart' | 'profile';
  onTabChange?: (tab: string) => void;
}

interface Perfume {
  id: number;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  hoverImage: string;
  description: string;
  topNotes: string;
  heartNotes: string;
  baseNotes: string;
  longevity: string;
  sillage: 'intimate' | 'moderate' | 'powerful';
  volumes: string[];
  concentrations: string[];
  concentrationColors: string[];
  category: string;
  gender: 'Men' | 'Woman' | 'Unisex';
  inStock: number;
  rating: number;
  brand: string;
  isNew?: boolean;
  isTrending?: boolean;
}

const perfumes: Perfume[] = [
  { 
    id: 1, 
    name: 'Black Orchid', 
    price: 29500, 
    oldPrice: 35000,
    image: tomFordBlackOrchidImage, 
    hoverImage: tomFordBlackOrchidImage,
    description: 'Загадочная и провокационная композиция, ставшая культовым ароматом современной парфюмерии. Редкая чёрная орхидея из тропических лесов Амазонии переплетается с терпким трюфелем и чёрной смородиной в дерзком открытии. Сердце раскрывается бархатистыми лепестками жасмина и иланг-иланга на фоне чувственного пачули. Шлейф из тёмного шоколада, ванили и сандала создает незабываемое впечатление роскоши и тайны.',
    topNotes: 'Чёрная смородина, трюфель, бергамот',
    heartNotes: 'Чёрная орхидея, жасмин, иланг-иланг',
    baseNotes: 'Пачули, ваниль, сандал, тёмный шоколад',
    longevity: '8-12 часов',
    sillage: 'powerful',
    volumes: ['50ml', '100ml'], 
    concentrations: ['Eau de Parfum', 'Intense'], 
    concentrationColors: ['#9333EA', '#7E22CE'],
    category: 'Oriental', 
    gender: 'Unisex',
    inStock: 15, 
    rating: 5.0, 
    brand: 'TOM FORD',
    isNew: true,
    isTrending: true
  },
  { 
    id: 2, 
    name: 'Aventus', 
    price: 44500, 
    oldPrice: 52000,
    image: creedAventusImage, 
    hoverImage: creedAventusImage,
    description: 'Легендарный аромат успеха, вдохновлённый историческими победителями — от Наполеона до современных бизнес-лидеров. Взрывное открытие из дымного ананаса, калабрийского бергамота и спелого яблока создает ощущение триумфа и уверенности. Сердце из берёзового дёгтя, пачули и марокканского жасмина добавляет благородную глубину. Мощная база из дубового мха, мускуса и амбры формирует шлейф, который безошибочно узнают в любой точке мира.',
    topNotes: 'Ананас, бергамот, чёрная смородина, яблоко',
    heartNotes: 'Берёзовый дёготь, пачули, жасмин, роза',
    baseNotes: 'Дубовый мох, амбра, ваниль, мускус',
    longevity: '12+ часов',
    sillage: 'powerful',
    volumes: ['50ml', '100ml', '250ml'], 
    concentrations: ['Eau de Parfum', 'Cologne'], 
    concentrationColors: ['#9333EA', '#C084FC'],
    category: 'Fresh', 
    gender: 'Men',
    inStock: 8, 
    rating: 4.9, 
    brand: 'CREED',
    isNew: true,
    isTrending: true
  },
  { 
    id: 3, 
    name: 'No. 5', 
    price: 18500, 
    oldPrice: 24000,
    image: chanelNo5Image, 
    hoverImage: chanelNo5Image,
    description: 'Легендарный аромат, созданный Эрнестом Бо в 1921 году и ставший символом вечной женственности и элегантности. Букет из 80 ингредиентов открывается искристыми нотами альдегидов, нероли и бергамота, переходя в роскошное сердце из майской розы и жасмина из Грасса. База из сандала, ветивера и ванили создает шлейф, который помнят десятилетиями. Культовый флакон с минималистичным дизайном стал иконой парфюмерного искусства XX века.',
    topNotes: 'Альдегиды, нероли, иланг-иланг, лимон',
    heartNotes: 'Майская роза, жасмин, ландыш, ирис',
    baseNotes: 'Сандал, ветивер, ваниль, амбра',
    longevity: '8-12 часов',
    sillage: 'moderate',
    volumes: ['50ml', '100ml'], 
    concentrations: ['Eau de Parfum', 'Parfum'], 
    concentrationColors: ['#DB2777', '#BE185D'],
    category: 'Floral', 
    gender: 'Woman',
    inStock: 5, 
    rating: 5.0, 
    brand: 'CHANEL',
    isNew: true,
    isTrending: true
  },
  { 
    id: 4, 
    name: 'Santal 33', 
    price: 38500, 
    oldPrice: 45000,
    image: lelaboSantal33Image, 
    hoverImage: lelaboSantal33Image,
    description: 'Культовый аромат нью-йоркской нишевой парфюмерии, ставший символом современного минимализма и городского шика. Австралийский сандал высочайшего качества сплетается с дымными аккордами кедра и обожжённого папируса. Нотки кожи и амбры создают ощущение вечера у потухшего костра на берегу океана. Изящная композиция, которую мгновенно узнают ценители по всему миру.',
    topNotes: 'Кардамон, ирис, фиалка',
    heartNotes: 'Австралийский сандал, папирус, кедр',
    baseNotes: 'Кожа, амбра, мускус',
    longevity: '8-12 часов',
    sillage: 'moderate',
    volumes: ['50ml', '100ml'], 
    concentrations: ['Eau de Parfum'], 
    concentrationColors: ['#78716C'],
    category: 'Woody', 
    gender: 'Unisex',
    inStock: 8, 
    rating: 4.9, 
    brand: 'LE LABO',
    isNew: true,
    isTrending: true
  },
  { 
    id: 5, 
    name: 'Baccarat Rouge 540', 
    price: 34000, 
    image: baccaratRouge540Image, 
    hoverImage: baccaratRouge540Image,
    description: 'Парфюмерная алхимия, рождённая в сотрудничестве с легендарной хрустальной мануфактурой Baccarat. Драгоценный шафран и египетский жасмин открывают композицию сияющими гранями, подобно преломлённому свету в хрустале. Амбровое дерево и кедр создают обволакивающее тепло, переходящее в чувственную базу из амбры и кашмерана. Аромат-украшение, оставляющий за собой шлейф восхищённых взглядов.',
    topNotes: 'Шафран, жасмин',
    heartNotes: 'Амбровое дерево, кедр',
    baseNotes: 'Амбра, фир-бальзам, кашмеран',
    longevity: '12+ часов',
    sillage: 'powerful',
    volumes: ['70ml', '200ml'], 
    concentrations: ['Extrait', 'Eau de Parfum'], 
    concentrationColors: ['#DC2626', '#EF4444'],
    category: 'Amber', 
    gender: 'Unisex',
    inStock: 10, 
    rating: 5.0, 
    brand: 'MAISON FRANCIS',
    isTrending: true
  },
  { 
    id: 6, 
    name: 'Oud Wood', 
    price: 43000, 
    image: tomfordOudWoodImage, 
    hoverImage: tomfordOudWoodImage,
    description: 'Роскошная древесно-восточная композиция, воплощающая магию редкого уда из камбоджийских лесов. Экзотические специи кардамона и сычуаньского перца переплетаются с благородным сандалом и бразильским палисандром. Дымные аккорды ветивера и тонки создают глубокую чувственную базу с янтарным сиянием. Аромат силы и утончённости для истинных ценителей нишевой парфюмерии и редких ингредиентов.',
    topNotes: 'Палисандр, кардамон, сычуаньский перец',
    heartNotes: 'Агаровый уд, сандал',
    baseNotes: 'Тонка, ветивер, амбра',
    longevity: '12+ часов',
    sillage: 'powerful',
    volumes: ['50ml', '100ml'], 
    concentrations: ['Eau de Parfum', 'Intense'], 
    concentrationColors: ['#78350F', '#92400E'],
    category: 'Oriental', 
    gender: 'Unisex',
    inStock: 6, 
    rating: 4.8, 
    brand: 'TOM FORD' 
  },
  { 
    id: 7, 
    name: 'Sauvage', 
    price: 14500, 
    image: diorSauvageImage, 
    hoverImage: diorSauvageImage,
    description: 'Аромат первобытной свободы, вдохновлённый бескрайними пустынными ландшафтами под звёздным небом. Искристый калабрийский бергамот и жгучий сычуаньский перец создают мгновенное притяжение. Сердце из лаванды и герани добавляет благородную свежесть средиземноморских полей. Революционная молекула амброксан в базе формирует невероятно стойкий и притягательный шлейф современного мужчины.',
    topNotes: 'Калабрийский бергамот, перец',
    heartNotes: 'Сычуаньский перец, лаванда, герань',
    baseNotes: 'Амброксан, кедр, лабданум',
    longevity: '8-12 часов',
    sillage: 'powerful',
    volumes: ['60ml', '100ml', '200ml'], 
    concentrations: ['Eau de Toilette', 'Parfum'], 
    concentrationColors: ['#3B82F6', '#1D4ED8'],
    category: 'Fresh', 
    gender: 'Men',
    inStock: 12, 
    rating: 4.9, 
    brand: 'DIOR',
    isNew: true
  },
  { 
    id: 8, 
    name: 'Coco Mademoiselle', 
    price: 16500, 
    image: chanelCocoMademoiselleImage, 
    hoverImage: chanelCocoMademoiselleImage,
    description: 'Дерзкий и непредсказуемый аромат для современной женщины, сочетающей элегантность с бунтарским духом. Искрящийся сицилийский апельсин и бергамот переплетаются с сочным личи в игривом открытии. Сердце из турецкой розы и жасмина создает романтичную чувственность с лёгким флиртом. База из пачули, ветивера и белого мускуса оставляет незабываемый шлейф уверенности и соблазна.',
    topNotes: 'Сицилийский апельсин, бергамот, грейпфрут',
    heartNotes: 'Турецкая роза, жасмин, личи',
    baseNotes: 'Пачули, ветивер, белый мускус, ваниль',
    longevity: '8-12 часов',
    sillage: 'moderate',
    volumes: ['50ml', '100ml'], 
    concentrations: ['Eau de Parfum', 'Intense'], 
    concentrationColors: ['#F472B6', '#EC4899'],
    category: 'Floral', 
    gender: 'Woman',
    inStock: 4, 
    rating: 5.0, 
    brand: 'CHANEL' 
  },
];

const categories = ['Все', 'Fresh', 'Oriental', 'Floral', 'Woody', 'Amber'];
const genderFilters = ['All', 'Men', 'Woman', 'Unisex'];

function FragranceRoyale({ activeTab, onTabChange }: FragranceRoyaleProps) {
  const [selectedPerfume, setSelectedPerfume] = useState<Perfume | null>(null);
  const [selectedVolume, setSelectedVolume] = useState<string>('');
  const [selectedConcentration, setSelectedConcentration] = useState<string>('');
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
    { icon: <ShoppingBag className="w-5 h-5" />, label: 'Корзина', badge: cartCount > 0 ? String(cartCount) : undefined, badgeColor: '#C9B037' },
    { icon: <Tag className="w-5 h-5" />, label: 'Акции', badge: 'NEW', badgeColor: '#EF4444' },
    { icon: <User className="w-5 h-5" />, label: 'Профиль', active: activeTab === 'profile' },
    { icon: <Settings className="w-5 h-5" />, label: 'Настройки' },
  ];

  useEffect(() => {
    scrollToTop();
    if (activeTab !== 'catalog') {
      setSelectedPerfume(null);
    }
    if (activeTab !== 'home') {
      setSelectedGender('All');
    }
  }, [activeTab]);

  const filteredPerfumes = perfumes.filter(p => {
    const categoryMatch = selectedCategory === 'Все' || p.category === selectedCategory;
    
    if (activeTab === 'home') {
      const genderMatch = selectedGender === 'All' || p.gender === selectedGender;
      return categoryMatch && genderMatch;
    }
    
    return categoryMatch;
  });

  const handleToggleFavorite = (perfumeId: number) => {
    toggleFavoriteHook(String(perfumeId));
    const isNowFavorite = !isFavorite(String(perfumeId));
    toast({
      title: isNowFavorite ? 'Добавлено в избранное' : 'Удалено из избранного',
      duration: 1500,
    });
  };

  const openPerfume = (perfume: Perfume) => {
    scrollToTop();
    onTabChange?.('catalog');
    setSelectedPerfume(perfume);
    setSelectedVolume(perfume.volumes[0]);
    setSelectedConcentration(perfume.concentrations[0]);
  };

  const addToCart = () => {
    if (!selectedPerfume) return;
    
    addToCartHook({
      id: String(selectedPerfume.id),
      name: selectedPerfume.name,
      price: selectedPerfume.price,
      image: selectedPerfume.image,
      size: selectedVolume,
      color: selectedConcentration
    });
    
    toast({
      title: 'Добавлено в корзину',
      description: `${selectedPerfume.name} • ${selectedConcentration} • ${selectedVolume}`,
      duration: 2000,
    });
    
    setSelectedPerfume(null);
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
      phone: '+7 (999) 888-77-66'
    });
    
    clearCart();
    setIsCheckoutOpen(false);
    
    toast({
      title: 'Заказ оформлен!',
      description: `Номер заказа: ${orderId}`,
      duration: 3000,
    });
  };

  if (activeTab === 'catalog' && selectedPerfume) {
    const bgColor = selectedPerfume.concentrationColors[selectedPerfume.concentrations.indexOf(selectedConcentration)] || '#9333EA';
    
    return (
      <div className="min-h-screen text-white pb-24 smooth-scroll-page" style={{ backgroundColor: bgColor }}>
        <div className="absolute top-0 left-0 right-0 z-10 demo-nav-safe flex items-center justify-between">
          <button 
            onClick={() => setSelectedPerfume(null)}
            className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center"
            aria-label="Назад"
            data-testid="button-back"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleFavorite(selectedPerfume.id);
            }}
            className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center"
            aria-label={isFavorite(String(selectedPerfume.id)) ? 'Удалить из избранного' : 'Добавить в избранное'}
            data-testid={`button-favorite-${selectedPerfume.id}`}
          >
            <Heart 
              className={`w-5 h-5 ${isFavorite(String(selectedPerfume.id)) ? 'fill-white text-white' : 'text-white'}`}
            />
          </button>
        </div>

        <div className="relative h-[60vh]">
          <LazyImage
            src={selectedPerfume.hoverImage}
            alt={selectedPerfume.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-t-3xl p-6 space-y-6 pb-32">
          <div className="text-center">
            <p className="text-sm text-white/70 mb-2">{selectedPerfume.brand}</p>
            <h2 className="text-2xl font-bold mb-2">{selectedPerfume.name}</h2>
            <div className="flex items-center justify-center gap-3">
              <p className="text-3xl font-bold">{formatPrice(selectedPerfume.price)}</p>
              {selectedPerfume.oldPrice && (
                <p className="text-xl text-white/50 line-through">{formatPrice(selectedPerfume.oldPrice)}</p>
              )}
            </div>
          </div>

          <p className="text-sm text-white/80 text-center">{selectedPerfume.description}</p>

          <div>
            <p className="text-sm mb-3 text-white/80 text-center">Выберите концентрацию:</p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {selectedPerfume.concentrations.map((concentration, idx) => (
                <button
                  key={concentration}
                  onClick={() => setSelectedConcentration(concentration)}
                  className={`px-4 py-2 rounded-full border-2 transition-all text-sm min-h-[44px] ${
                    selectedConcentration === concentration
                      ? 'border-white scale-105'
                      : 'border-white/30'
                  }`}
                  aria-label={concentration}
                  aria-pressed={selectedConcentration === concentration}
                  data-testid={`button-concentration-${concentration}`}
                >
                  {concentration}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm mb-3 text-white/80 text-center">Выберите объем:</p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {selectedPerfume.volumes.map((volume) => (
                <button
                  key={volume}
                  onClick={() => setSelectedVolume(volume)}
                  className={`w-16 h-12 rounded-full font-semibold transition-all text-sm min-h-[44px] ${
                    selectedVolume === volume
                      ? 'bg-[var(--theme-primary)] text-black'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                  aria-label={`Объем ${volume}`}
                  aria-pressed={selectedVolume === volume}
                  data-testid={`button-volume-${volume}`}
                >
                  {volume}
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
            description={`${selectedPerfume.name} • ${selectedConcentration} • ${selectedVolume}`}
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
          title="FRAGRANCE"
          subtitle="ROYALE"
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
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-6 h-6 text-[#C9B037]" />
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white">
              LUXURY
            </h1>
            <h1 className="text-4xl font-black tracking-tight text-white">
              FRAGRANCE
            </h1>
          </div>

          <div className="flex items-center gap-4 mb-6 scroll-fade-in">
            <button 
              className="p-2 bg-white rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center"
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
                className={`text-sm font-medium transition-colors min-h-[44px] px-2 ${
                  selectedGender === gender
                    ? 'text-white'
                    : 'text-white/40'
                }`}
                aria-pressed={selectedGender === gender}
                data-testid={`button-filter-${gender.toLowerCase()}`}
              >
                {gender}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 bg-white/5 rounded-full px-4 py-3 flex items-center gap-2 border border-white/10 min-h-[48px]">
              <Search className="w-5 h-5 text-white/50" />
              <input
                type="text"
                placeholder="Поиск ароматов..."
                className="bg-transparent text-white placeholder:text-white/50 outline-none flex-1 text-sm"
                aria-label="Поиск ароматов"
                data-testid="input-search"
              />
            </div>
          </div>
        </div>

        <div className="relative mb-6 mx-6 rounded-3xl overflow-hidden scroll-fade-in" style={{ height: '500px' }}>
          <video
            src="/videos/luxury_fragrance.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
          
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <m.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Crown className="w-7 h-7 text-[#C9B037]" />
              </div>
              <h2 className="text-5xl font-black tracking-tight leading-tight text-white">
                НОВАЯ
              </h2>
              <h2 className="text-5xl font-black mb-3 tracking-tight leading-tight text-white">
                КОЛЛЕКЦИЯ
              </h2>
              <p className="text-base text-white/70 mb-6 flex items-center gap-2" style={{ letterSpacing: '0.05em' }}>
                <Droplets className="w-4 h-4 text-[#C9B037]" />
                Эксклюзивные ароматы 2025
              </p>
              <button 
                className="px-8 py-4 rounded-full font-bold text-black transition-all hover:scale-105 bg-[var(--theme-primary)] min-h-[48px]"
                data-testid="button-hero-shop-now"
              >
                Смотреть коллекцию
              </button>
            </m.div>
          </div>
        </div>

        <div className="px-6 space-y-4">
          {filteredPerfumes.slice(0, 3).map((perfume, idx) => (
            <m.div
              key={perfume.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => openPerfume(perfume)}
              className={`relative cursor-pointer group rounded-3xl overflow-hidden ${idx === 0 ? 'scroll-fade-in' : ''}`}
              style={{ height: idx === 0 ? '400px' : '320px' }}
              data-testid={`featured-perfume-${perfume.id}`}
            >
              <div className="absolute inset-0">
                <LazyImage
                  src={perfume.image}
                  alt={perfume.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

              <div className="absolute top-4 left-4">
                <div className="px-3 py-1 bg-black/50 backdrop-blur-md rounded-full border border-white/10">
                  <span className="text-xs font-semibold text-white/90">
                    {perfume.brand}
                  </span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleFavorite(perfume.id);
                }}
                className="absolute top-4 right-4 w-11 h-11 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10"
                aria-label={isFavorite(String(perfume.id)) ? 'Удалить из избранного' : 'Добавить в избранное'}
                data-testid={`button-favorite-${perfume.id}`}
              >
                <Heart 
                  className={`w-5 h-5 ${isFavorite(String(perfume.id)) ? 'fill-white text-white' : 'text-white'}`}
                />
              </button>

              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-end justify-between">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2 leading-tight">
                      {perfume.name}
                    </h3>
                    <p className="text-sm text-white/70 mb-4 flex items-center gap-1">
                      <Droplets className="w-4 h-4 text-[#C9B037]" />
                      {perfume.category}
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openPerfume(perfume);
                    }}
                    className="w-14 h-14 rounded-full bg-[#C9B037] flex items-center justify-center transition-all hover:scale-110"
                    aria-label={`Добавить ${perfume.name} в корзину`}
                    data-testid={`button-add-to-cart-${perfume.id}`}
                  >
                    <ShoppingBag className="w-6 h-6 text-black" />
                  </button>
                </div>

                <div className="mt-3">
                  <p className="text-lg font-bold text-white">{formatPrice(perfume.price)}</p>
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
                    : 'bg-white/10 text-white/70 hover:bg-white/15'
                }`}
                aria-pressed={selectedCategory === cat}
                data-testid={`button-filter-${cat.toLowerCase()}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {filteredPerfumes.map((perfume, index) => (
              <m.div
                key={perfume.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => openPerfume(perfume)}
                className={`relative cursor-pointer ${index < 4 ? '' : `scroll-fade-in-delay-${Math.min((index - 4) % 3 + 1, 3)}`}`}
                data-testid={`perfume-card-${perfume.id}`}
              >
                <div className="relative aspect-[3/4] rounded-3xl overflow-hidden mb-3 bg-white/5">
                  <LazyImage
                    src={perfume.image}
                    alt={perfume.name}
                    className="w-full h-full object-cover"
                  />
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(perfume.id);
                    }}
                    className="absolute top-2 right-2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-xl flex items-center justify-center"
                    aria-label={isFavorite(String(perfume.id)) ? 'Удалить из избранного' : 'Добавить в избранное'}
                    data-testid={`button-favorite-${perfume.id}`}
                  >
                    <Heart 
                      className={`w-4 h-4 ${isFavorite(String(perfume.id)) ? 'fill-white text-white' : 'text-white'}`}
                    />
                  </button>

                  {perfume.isNew && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-[#C9B037] text-black text-xs font-bold rounded-full">
                      NEW
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-xs text-white/50 mb-1">{perfume.brand}</p>
                  <p className="text-sm font-semibold mb-1 truncate">{perfume.name}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-base font-bold">{formatPrice(perfume.price)}</p>
                    {perfume.oldPrice && (
                      <p className="text-xs text-white/40 line-through">{formatPrice(perfume.oldPrice)}</p>
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
      <div className="min-h-screen bg-[#0A0A0A] text-white pb-32 smooth-scroll-page">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Корзина</h1>

          {cart.length === 0 ? (
            <EmptyState
              type="cart"
              title="Корзина пуста"
              description="Добавьте ароматы из каталога, чтобы оформить заказ"
              actionLabel="Перейти в каталог"
              onAction={() => onTabChange?.('catalog')}
            />
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={`${item.id}-${item.size}-${item.color}`}
                  className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 flex gap-4"
                  data-testid={`cart-item-${item.id}`}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover"
                    loading="lazy"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{item.name}</h3>
                    <p className="text-sm text-white/60 mb-2">
                      {item.color} • {item.size}
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

              <div className="fixed bottom-24 left-0 right-0 p-6 bg-[#0A0A0A] border-t border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold">Итого:</span>
                  <span className="text-2xl font-bold">{formatPrice(cartTotal)}</span>
                </div>
                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full bg-[#C9B037] text-black font-bold py-4 rounded-full hover:bg-[#B8A033] transition-all min-h-[48px]"
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
          storeName="FragranceRoyale"
        />
      </div>
    );
  }

  if (activeTab === 'profile') {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white pb-24 smooth-scroll-page">
        <div className="p-6 bg-white/5 border-b border-white/10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-[#C9B037] rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-black" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Анна Смирнова</h2>
              <p className="text-sm text-muted-foreground">+7 (999) 888-77-66</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20">
              <p className="text-sm text-white/70 mb-1">Заказы</p>
              <p className="text-2xl font-bold">{ordersCount}</p>
            </div>
            <div className="p-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20">
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
                  <div key={order.id} className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10" data-testid={`order-${order.id}`}>
                    <div className="flex justify-between gap-2 mb-2">
                      <span className="text-white/80">Заказ #{order.id.slice(-6)}</span>
                      <span className="text-white/60">{new Date(order.createdAt).toLocaleDateString('ru-RU')}</span>
                    </div>
                    <div className="flex justify-between gap-2 mb-2">
                      <span className="text-white/60">{order.items.length} товаров</span>
                      <span className="font-bold text-[#C9B037]">{formatPrice(order.total)}</span>
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
              className="w-full p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 flex items-center justify-between hover-elevate active-elevate-2 min-h-[56px]" 
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
              className="w-full p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 flex items-center justify-between hover-elevate active-elevate-2 min-h-[56px]" 
              aria-label="Адреса доставки"
              data-testid="button-addresses"
            >
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-white/70" />
                <span className="font-medium">Адреса доставки</span>
              </div>
              <ChevronLeft className="w-5 h-5 rotate-180 text-white/50" />
            </button>

            <button 
              className="w-full p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 flex items-center justify-between hover-elevate active-elevate-2 min-h-[56px]" 
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
              className="w-full p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 flex items-center justify-between hover-elevate active-elevate-2 min-h-[56px]" 
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

function FragranceRoyaleWithTheme(props: FragranceRoyaleProps) {
  return (
    <DemoThemeProvider themeId="fragranceRoyale">
      <FragranceRoyale {...props} />
    </DemoThemeProvider>
  );
}

export default memo(FragranceRoyaleWithTheme);
