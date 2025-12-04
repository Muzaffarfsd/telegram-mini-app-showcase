import { useState } from "react";
import { 
  Heart, 
  Star, 
  X, 
  Watch,
  Award,
  TrendingUp,
  Package,
  User,
  CreditCard,
  MapPin,
  Settings,
  LogOut,
  ChevronLeft,
  Search
} from "lucide-react";
import { OptimizedImage } from "../OptimizedImage";
import { useImagePreloader } from "../../hooks/useImagePreloader";
import { ConfirmDrawer } from "../ui/modern-drawer";
import { useFilter } from "@/hooks/useFilter";
import { Skeleton } from "@/components/ui/skeleton";

interface TimeEliteProps {
  activeTab: 'home' | 'catalog' | 'cart' | 'profile';
}

interface CartItem {
  id: number;
  name: string;
  brand: string;
  price: number;
  image: string;
  quantity: number;
}

interface Order {
  id: number;
  items: CartItem[];
  total: number;
  date: string;
  status: 'processing' | 'shipped' | 'delivered';
}

const products = [
  { id: 1, name: 'Rolex Submariner', brand: 'Rolex', price: 1125000, image: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format,compress&fm=webp&q=75&w=400', description: 'Легендарные дайверские часы с водонепроницаемостью 300м', category: 'Rolex', inStock: 3, rating: 4.9, movement: 'Автоматический', waterResistance: '300м', material: 'Сталь 904L', diameter: '40мм' },
  { id: 2, name: 'Patek Philippe Calatrava', brand: 'Patek Philippe', price: 2565000, image: 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?auto=format,compress&fm=webp&q=75&w=400', description: 'Элегантные часы с вечным дизайном и филигранной отделкой', category: 'Patek', inStock: 2, rating: 4.95, movement: 'Механический', waterResistance: '30м', material: 'Белое золото', diameter: '39мм' },
  { id: 3, name: 'Omega Speedmaster', brand: 'Omega', price: 585000, image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format,compress&fm=webp&q=75&w=400', description: 'Легендарные часы астронавтов, первые на Луне', category: 'Omega', inStock: 5, rating: 4.8, movement: 'Механический', waterResistance: '50м', material: 'Сталь', diameter: '42мм' },
  { id: 4, name: 'Cartier Santos', brand: 'Cartier', price: 765000, image: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format,compress&fm=webp&q=75&w=400', description: 'Первые наручные часы в истории с квадратным корпусом', category: 'Cartier', inStock: 4, rating: 4.7, movement: 'Автоматический', waterResistance: '100м', material: 'Сталь', diameter: '39.8мм' },
  { id: 5, name: 'Audemars Piguet Royal Oak', brand: 'Audemars Piguet', price: 3150000, image: 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?auto=format,compress&fm=webp&q=75&w=400', description: 'Икона часового дизайна с восьмиугольным безелем', category: 'Люкс', inStock: 2, rating: 4.92, movement: 'Автоматический', waterResistance: '50м', material: 'Сталь', diameter: '41мм' },
  { id: 6, name: 'Rolex Datejust', brand: 'Rolex', price: 882000, image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format,compress&fm=webp&q=75&w=400', description: 'Классические часы с датой и циклопом', category: 'Rolex', inStock: 6, rating: 4.85, movement: 'Автоматический', waterResistance: '100м', material: 'Сталь и золото', diameter: '41мм' },
  { id: 7, name: 'Jaeger-LeCoultre Reverso', brand: 'Jaeger-LeCoultre', price: 1620000, image: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format,compress&fm=webp&q=75&w=400', description: 'Уникальный переворачивающийся корпус Art Deco', category: 'Люкс', inStock: 3, rating: 4.85, movement: 'Механический', waterResistance: '30м', material: 'Розовое золото', diameter: '26мм x 42мм' },
  { id: 8, name: 'Vacheron Constantin Patrimony', brand: 'Vacheron Constantin', price: 2880000, image: 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?auto=format,compress&fm=webp&q=75&w=400', description: 'Воплощение утонченности и классического стиля', category: 'Люкс', inStock: 1, rating: 4.9, movement: 'Механический', waterResistance: '30м', material: 'Розовое золото', diameter: '40мм' },
  { id: 9, name: 'Omega Seamaster', brand: 'Omega', price: 468000, image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format,compress&fm=webp&q=75&w=400', description: 'Дайверские часы Джеймса Бонда', category: 'Omega', inStock: 7, rating: 4.75, movement: 'Автоматический', waterResistance: '300м', material: 'Сталь', diameter: '42мм' },
  { id: 10, name: 'Cartier Tank', brand: 'Cartier', price: 648000, image: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format,compress&fm=webp&q=75&w=400', description: 'Прямоугольные часы, вдохновленные танком', category: 'Cartier', inStock: 5, rating: 4.8, movement: 'Кварцевый', waterResistance: '30м', material: 'Желтое золото', diameter: '29.5 x 22мм' },
  { id: 11, name: 'Rolex GMT-Master II', brand: 'Rolex', price: 1278000, image: 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?auto=format,compress&fm=webp&q=75&w=400', description: 'Часы для путешественников с двумя часовыми поясами', category: 'Rolex', inStock: 4, rating: 4.88, movement: 'Автоматический', waterResistance: '100м', material: 'Сталь и золото', diameter: '40мм' },
  { id: 12, name: 'Patek Philippe Nautilus', brand: 'Patek Philippe', price: 3780000, image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format,compress&fm=webp&q=75&w=400', description: 'Спортивно-элегантные часы с иллюминаторным дизайном', category: 'Patek', inStock: 1, rating: 4.98, movement: 'Автоматический', waterResistance: '120м', material: 'Сталь', diameter: '40мм' },
  { id: 13, name: 'A. Lange & Söhne Lange 1', brand: 'A. Lange & Söhne', price: 3420000, image: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format,compress&fm=webp&q=75&w=400', description: 'Немецкое часовое совершенство с большой датой', category: 'Люкс', inStock: 2, rating: 4.95, movement: 'Механический', waterResistance: '30м', material: 'Розовое золото', diameter: '38.5мм' },
  { id: 14, name: 'Omega Constellation', brand: 'Omega', price: 432000, image: 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?auto=format,compress&fm=webp&q=75&w=400', description: 'Элегантные часы со звездным символом', category: 'Omega', inStock: 8, rating: 4.65, movement: 'Автоматический', waterResistance: '50м', material: 'Сталь и золото', diameter: '38мм' },
  { id: 15, name: 'Cartier Ballon Bleu', brand: 'Cartier', price: 855000, image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format,compress&fm=webp&q=75&w=400', description: 'Часы с сапфировой короной и выпуклым стеклом', category: 'Cartier', inStock: 6, rating: 4.72, movement: 'Автоматический', waterResistance: '30м', material: 'Сталь', diameter: '42мм' },
  { id: 16, name: 'Rolex Daytona', brand: 'Rolex', price: 1665000, image: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format,compress&fm=webp&q=75&w=400', description: 'Хронограф для гоночных трасс', category: 'Rolex', inStock: 2, rating: 4.93, movement: 'Автоматический', waterResistance: '100м', material: 'Сталь', diameter: '40мм' },
  { id: 17, name: 'Patek Philippe Aquanaut', brand: 'Patek Philippe', price: 2250000, image: 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?auto=format,compress&fm=webp&q=75&w=400', description: 'Спортивно-шикарные часы с каучуковым ремешком', category: 'Patek', inStock: 3, rating: 4.87, movement: 'Автоматический', waterResistance: '120м', material: 'Сталь', diameter: '40мм' },
  { id: 18, name: 'Zenith El Primero', brand: 'Zenith', price: 648000, image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format,compress&fm=webp&q=75&w=400', description: 'Первый автоматический хронограф высокой частоты', category: 'Хронографы', inStock: 5, rating: 4.8, movement: 'Автоматический', waterResistance: '100м', material: 'Сталь', diameter: '42мм' },
  { id: 19, name: 'Tudor Black Bay', brand: 'Tudor', price: 315000, image: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format,compress&fm=webp&q=75&w=400', description: 'Винтажно-вдохновленные дайверские часы', category: 'Спорт', inStock: 10, rating: 4.6, movement: 'Автоматический', waterResistance: '200м', material: 'Сталь', diameter: '41мм' },
  { id: 20, name: 'IWC Pilot\'s Watch', brand: 'IWC', price: 378000, image: 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?auto=format,compress&fm=webp&q=75&w=400', description: 'Классические часы пилотов с большой заводной головкой', category: 'Авиация', inStock: 6, rating: 4.6, movement: 'Автоматический', waterResistance: '60м', material: 'Сталь', diameter: '43мм' }
];

const categories = ['Все', 'Rolex', 'Omega', 'Cartier', 'Patek', 'Люкс', 'Спорт'];

export default function TimeElite({ activeTab }: TimeEliteProps) {
  const [selectedProduct, setSelectedProduct] = useState<typeof products[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [favorites, setFavorites] = useState<number[]>([1, 4, 11]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  const { filteredItems, searchQuery, handleSearch } = useFilter({
    items: products,
    searchFields: ['name', 'description', 'category', 'brand'],
  });

  const handleImageLoad = (id: number) => {
    setLoadedImages(prev => new Set([...Array.from(prev), id]));
  };

  useImagePreloader({
    images: products.slice(0, 6).map(p => p.image),
    priority: true
  });

  const openProductModal = (product: typeof products[0]) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeProductModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedProduct(null), 300);
  };

  const toggleFavorite = (productId: number) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const addToCart = (product: typeof products[0]) => {
    const cartItem: CartItem = {
      id: Date.now(),
      name: product.name,
      brand: product.brand,
      price: product.price,
      image: product.image,
      quantity: 1
    };
    setCart([...cart, cartItem]);
    closeProductModal();
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    const newOrder: Order = {
      id: Date.now(),
      items: [...cart],
      total: cartTotal,
      date: new Date().toLocaleDateString('ru-RU'),
      status: 'processing'
    };
    
    setOrders([newOrder, ...orders]);
    setCart([]);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const filteredProducts = selectedCategory === 'Все' 
    ? (searchQuery ? filteredItems : products)
    : (searchQuery ? filteredItems : products).filter(p => p.category === selectedCategory);

  const renderHomeTab = () => (
    <div className="min-h-screen bg-white font-montserrat pb-24">
      <div className="max-w-md mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-4 scroll-fade-in">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-600 to-amber-700 rounded-3xl mx-auto flex items-center justify-center shadow-lg">
            <Watch className="w-10 h-10 text-white" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">TimeElite</h1>
            <p className="text-sm text-gray-500">Коллекция премиум часов</p>
          </div>
        </div>

        <div className="flex items-center gap-3 scroll-fade-in">
          <div className="flex-1 bg-gray-100 rounded-full px-4 py-3 flex items-center gap-2">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Поиск часов..."
              className="bg-transparent text-gray-900 placeholder:text-gray-400 outline-none flex-1 text-sm"
              data-testid="input-search"
            />
          </div>
        </div>

        <div className="relative bg-gradient-to-br from-yellow-600 to-amber-700 rounded-3xl p-8 text-white overflow-hidden scroll-fade-in">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-3">Swiss Luxury 2025</h2>
            <p className="text-white/90 mb-4">Эксклюзивные модели от ведущих мануфактур</p>
            <button 
              onClick={() => setSelectedCategory('Rolex')}
              className="px-6 py-3 bg-white text-amber-700 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
              data-testid="button-view-collection"
            >
              Смотреть коллекцию
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between scroll-fade-in">
            <h2 className="text-2xl font-bold text-gray-900">Бренды</h2>
            <TrendingUp className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div 
              className="group bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer scroll-fade-in"
              onClick={() => setSelectedCategory('Rolex')}
              data-testid="button-filter-rolex"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-center font-semibold text-gray-900 mb-1">Rolex</h3>
              <p className="text-center text-sm text-gray-500">18 моделей</p>
            </div>

            <div 
              className="group bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer scroll-fade-in"
              onClick={() => setSelectedCategory('Omega')}
              data-testid="button-filter-omega"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-center font-semibold text-gray-900 mb-1">Omega</h3>
              <p className="text-center text-sm text-gray-500">12 моделей</p>
            </div>

            <div 
              className="group bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer scroll-fade-in"
              onClick={() => setSelectedCategory('Cartier')}
              data-testid="button-filter-cartier"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-center font-semibold text-gray-900 mb-1">Cartier</h3>
              <p className="text-center text-sm text-gray-500">8 моделей</p>
            </div>

            <div 
              className="group bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer scroll-fade-in"
              onClick={() => setSelectedCategory('Patek')}
              data-testid="button-filter-patek"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Watch className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-center font-semibold text-gray-900 mb-1">Patek Philippe</h3>
              <p className="text-center text-sm text-gray-500">6 моделей</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 scroll-fade-in">Популярное</h2>
          <div className="grid grid-cols-2 gap-4">
            {filteredProducts.slice(0, 6).map((product, index) => (
              <div 
                key={product.id}
                className={`group bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 ${index < 4 ? 'scroll-fade-in' : `scroll-fade-in-delay-${Math.min(index - 3, 2)}`}`}
                onClick={() => openProductModal(product)}
                data-testid={`product-card-${product.id}`}
              >
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  {!loadedImages.has(product.id) && (
                    <Skeleton className="absolute inset-0 rounded-lg" />
                  )}
                  <OptimizedImage 
                    src={product.image}
                    alt={product.name}
                    className={`w-full h-full object-cover group-hover:scale-110 transition-all duration-500 ${
                      loadedImages.has(product.id) ? 'opacity-100' : 'opacity-0'
                    }`}
                    priority={product.id <= 4}
                    onLoad={() => handleImageLoad(product.id)}
                  />
                  <button 
                    className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(product.id);
                    }}
                    aria-label="Избранное"
                    data-testid={`button-favorite-${product.id}`}
                  >
                    <Heart 
                      className={`w-5 h-5 ${favorites.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
                      strokeWidth={2}
                    />
                  </button>
                </div>
                <div className="p-4 space-y-2">
                  <div className="text-xs font-medium text-amber-600 mb-1">{product.brand}</div>
                  <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</p>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs text-gray-600">{product.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCatalogTab = () => (
    <div className="min-h-screen bg-gray-50 font-montserrat pb-24">
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 py-5 px-4">
        <div className="max-w-md mx-auto space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-100 rounded-full px-4 py-3 flex items-center gap-2">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Поиск часов..."
                className="bg-transparent text-gray-900 placeholder:text-gray-400 outline-none flex-1 text-sm"
                data-testid="input-search-catalog"
              />
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 font-medium text-sm ${
                  selectedCategory === cat 
                    ? 'bg-gradient-to-r from-yellow-600 to-amber-700 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                data-testid={`button-filter-${cat.toLowerCase()}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        <div className="mb-4">
          <p className="text-sm text-gray-600">Найдено {filteredProducts.length} часов</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {filteredProducts.map((product, index) => (
            <div 
              key={product.id}
              className={`group bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer ${index < 4 ? '' : `scroll-fade-in-delay-${Math.min((index - 4) % 4 + 1, 3)}`}`}
              onClick={() => openProductModal(product)}
              data-testid={`product-${product.id}`}
            >
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                {!loadedImages.has(product.id) && (
                  <Skeleton className="absolute inset-0 rounded-lg" />
                )}
                <OptimizedImage 
                  src={product.image}
                  alt={product.name}
                  className={`w-full h-full object-cover group-hover:scale-110 transition-all duration-500 ${
                    loadedImages.has(product.id) ? 'opacity-100' : 'opacity-0'
                  }`}
                  priority={product.id <= 4}
                  onLoad={() => handleImageLoad(product.id)}
                />
                <button 
                  className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(product.id);
                  }}
                  aria-label="Избранное"
                  data-testid={`button-favorite-${product.id}`}
                >
                  <Heart 
                    className={`w-5 h-5 ${favorites.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                    strokeWidth={2}
                  />
                </button>
              </div>
              <div className="p-4 space-y-2">
                <div className="text-xs font-medium text-amber-600 mb-1">{product.brand}</div>
                <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm">{product.name}</h3>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-gray-600">{product.rating}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCartTab = () => (
    <div className="min-h-screen bg-gray-50 font-montserrat pb-24">
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 scroll-fade-in">Корзина</h1>
        
        {cart.length === 0 ? (
          <div className="text-center py-16">
            <Watch className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Корзина пуста</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {cart.map((item, index) => (
                <div 
                  key={item.id} 
                  className={`bg-white rounded-2xl p-4 flex gap-4 shadow-sm scroll-fade-in-delay-${Math.min(index + 1, 5)}`}
                  data-testid={`cart-item-${item.id}`}
                >
                  <OptimizedImage 
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-xs text-amber-600 font-medium mb-1">{item.brand}</p>
                    <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                    <p className="text-lg font-bold text-gray-900">{formatPrice(item.price)}</p>
                  </div>
                  <button
                    onClick={() => setCart(cart.filter(i => i.id !== item.id))}
                    className="w-8 h-8 flex items-center justify-center"
                    aria-label="Удалить"
                    data-testid={`button-remove-${item.id}`}
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              ))}
            </div>

            <div className="fixed bottom-24 left-0 right-0 p-4 bg-white border-t border-gray-200">
              <div className="max-w-md mx-auto">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold text-gray-900">Итого:</span>
                  <span className="text-2xl font-bold text-amber-600">{formatPrice(cartTotal)}</span>
                </div>
                <ConfirmDrawer
                  trigger={
                    <button
                      className="w-full py-4 bg-gradient-to-r from-yellow-600 to-amber-700 text-white rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300"
                      data-testid="button-checkout"
                    >
                      Оформить заказ
                    </button>
                  }
                  title="Оформить заказ?"
                  description={`${cart.length} товаров на сумму ${formatPrice(cartTotal)}`}
                  confirmText="Подтвердить"
                  cancelText="Отмена"
                  variant="default"
                  onConfirm={handleCheckout}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  const renderProfileTab = () => (
    <div className="min-h-screen bg-gray-50 font-montserrat pb-24">
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        <div className="bg-white rounded-2xl p-6 scroll-fade-in">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-600 to-amber-700 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Александр Иванов</h2>
              <p className="text-sm text-gray-500">+7 (999) 123-45-67</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">Заказы</p>
              <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">Избранное</p>
              <p className="text-2xl font-bold text-gray-900">{favorites.length}</p>
            </div>
          </div>
        </div>

        <div className="scroll-fade-in-delay-1">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Мои заказы</h3>
          {orders.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-2xl">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">У вас пока нет заказов</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-2xl p-4" data-testid={`order-${order.id}`}>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-900 font-medium">Заказ #{order.id.toString().slice(-6)}</span>
                    <span className="text-gray-500">{order.date}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">{order.items.length} товаров</span>
                    <span className="font-bold text-amber-600">{formatPrice(order.total)}</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full">
                      {order.status === 'processing' ? 'В обработке' : order.status === 'shipped' ? 'Отправлен' : 'Доставлен'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2 scroll-fade-in-delay-2">
          <button className="w-full p-4 bg-white rounded-2xl flex items-center justify-between" aria-label="Избранное" data-testid="button-favorites">
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-gray-900">Избранное</span>
            </div>
            <ChevronLeft className="w-5 h-5 rotate-180 text-gray-400" />
          </button>

          <button className="w-full p-4 bg-white rounded-2xl flex items-center justify-between" aria-label="Способы оплаты" data-testid="button-payment">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-gray-900">Способы оплаты</span>
            </div>
            <ChevronLeft className="w-5 h-5 rotate-180 text-gray-400" />
          </button>

          <button className="w-full p-4 bg-white rounded-2xl flex items-center justify-between" aria-label="Адреса доставки" data-testid="button-address">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-gray-900">Адреса доставки</span>
            </div>
            <ChevronLeft className="w-5 h-5 rotate-180 text-gray-400" />
          </button>

          <button className="w-full p-4 bg-white rounded-2xl flex items-center justify-between" aria-label="Настройки" data-testid="button-settings">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-gray-900">Настройки</span>
            </div>
            <ChevronLeft className="w-5 h-5 rotate-180 text-gray-400" />
          </button>

          <button className="w-full p-4 bg-red-50 rounded-2xl flex items-center justify-between mt-4" aria-label="Выйти" data-testid="button-logout">
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5 text-red-500" />
              <span className="font-medium text-red-500">Выйти</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  const renderProductModal = () => {
    if (!selectedProduct) return null;

    return (
      <div 
        className={`fixed inset-0 z-50 bg-white transition-all duration-300 smooth-scroll-page ${
          isModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ overflowY: 'auto' }}
      >
        <div className="max-w-md mx-auto">
          <button 
            onClick={closeProductModal}
            className="fixed top-4 right-4 z-10 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
            aria-label="Закрыть"
            data-testid="button-back"
          >
            <X className="w-6 h-6 text-gray-900" />
          </button>

          <div className="relative aspect-square overflow-hidden bg-gray-100">
            {!loadedImages.has(selectedProduct.id + 100) && (
              <Skeleton className="absolute inset-0" />
            )}
            <OptimizedImage 
              src={selectedProduct.image}
              alt={selectedProduct.name}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                loadedImages.has(selectedProduct.id + 100) ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => handleImageLoad(selectedProduct.id + 100)}
            />
          </div>

          <div className="p-6 space-y-6">
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-yellow-600 to-amber-700 text-white rounded-full text-sm font-semibold">
              {selectedProduct.brand}
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">{selectedProduct.name}</h1>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold text-amber-600">{formatPrice(selectedProduct.price)}</p>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-lg font-semibold text-gray-900">{selectedProduct.rating}</span>
                  <span className="text-gray-500">(128)</span>
                </div>
              </div>
            </div>

            <p className="text-gray-700 leading-relaxed">{selectedProduct.description}</p>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Характеристики</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">Механизм</p>
                  <p className="font-semibold text-gray-900">{selectedProduct.movement}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">Водонепроницаемость</p>
                  <p className="font-semibold text-gray-900">{selectedProduct.waterResistance}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">Материал</p>
                  <p className="font-semibold text-gray-900">{selectedProduct.material}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">Диаметр</p>
                  <p className="font-semibold text-gray-900">{selectedProduct.diameter}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-600 font-medium">В наличии {selectedProduct.inStock} шт</span>
            </div>

            <ConfirmDrawer
              trigger={
                <button 
                  className="w-full py-4 bg-gradient-to-r from-yellow-600 to-amber-700 text-white rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300"
                  data-testid={`button-add-to-cart-${selectedProduct.id}`}
                >
                  Добавить в корзину
                </button>
              }
              title="Добавить в корзину?"
              description={`${selectedProduct.name} — ${formatPrice(selectedProduct.price)}`}
              confirmText="Добавить"
              cancelText="Отмена"
              variant="default"
              onConfirm={() => addToCart(selectedProduct)}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {activeTab === 'home' && renderHomeTab()}
      {activeTab === 'catalog' && renderCatalogTab()}
      {activeTab === 'cart' && renderCartTab()}
      {activeTab === 'profile' && renderProfileTab()}
      {renderProductModal()}
    </>
  );
}
