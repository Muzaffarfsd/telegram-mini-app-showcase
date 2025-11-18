import { useState } from "react";
import { 
  Heart, 
  Star, 
  X, 
  Watch,
  Award,
  TrendingUp
} from "lucide-react";
import { OptimizedImage } from "../OptimizedImage";
import { useImagePreloader } from "../../hooks/useImagePreloader";
import { ConfirmDrawer } from "../ui/modern-drawer";

interface TimeEliteProps {
  activeTab: 'home' | 'catalog' | 'cart' | 'profile';
}

const products = [
  { id: 1, name: 'Rolex Submariner', brand: 'Rolex', price: 12500, image: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format,compress&fm=webp&q=75&w=400', description: 'Легендарные дайверские часы с водонепроницаемостью 300м', category: 'Rolex', inStock: 3, rating: 4.9, movement: 'Автоматический', waterResistance: '300м', material: 'Сталь 904L', diameter: '40мм' },
  { id: 2, name: 'Patek Philippe Calatrava', brand: 'Patek Philippe', price: 28500, image: 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?auto=format,compress&fm=webp&q=75&w=400', description: 'Элегантные часы с вечным дизайном и филигранной отделкой', category: 'Patek', inStock: 2, rating: 4.95, movement: 'Механический', waterResistance: '30м', material: 'Белое золото', diameter: '39мм' },
  { id: 3, name: 'Omega Speedmaster', brand: 'Omega', price: 6500, image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format,compress&fm=webp&q=75&w=400', description: 'Легендарные часы астронавтов, первые на Луне', category: 'Omega', inStock: 5, rating: 4.8, movement: 'Механический', waterResistance: '50м', material: 'Сталь', diameter: '42мм' },
  { id: 4, name: 'Cartier Santos', brand: 'Cartier', price: 8500, image: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format,compress&fm=webp&q=75&w=400', description: 'Первые наручные часы в истории с квадратным корпусом', category: 'Cartier', inStock: 4, rating: 4.7, movement: 'Автоматический', waterResistance: '100м', material: 'Сталь', diameter: '39.8мм' },
  { id: 5, name: 'Audemars Piguet Royal Oak', brand: 'Audemars Piguet', price: 35000, image: 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?auto=format,compress&fm=webp&q=75&w=400', description: 'Икона часового дизайна с восьмиугольным безелем', category: 'Люкс', inStock: 2, rating: 4.92, movement: 'Автоматический', waterResistance: '50м', material: 'Сталь', diameter: '41мм' },
  { id: 6, name: 'Rolex Datejust', brand: 'Rolex', price: 9800, image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format,compress&fm=webp&q=75&w=400', description: 'Классические часы с датой и циклопом', category: 'Rolex', inStock: 6, rating: 4.85, movement: 'Автоматический', waterResistance: '100м', material: 'Сталь и золото', diameter: '41мм' },
  { id: 7, name: 'Jaeger-LeCoultre Reverso', brand: 'Jaeger-LeCoultre', price: 18000, image: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format,compress&fm=webp&q=75&w=400', description: 'Уникальный переворачивающийся корпус Art Deco', category: 'Люкс', inStock: 3, rating: 4.85, movement: 'Механический', waterResistance: '30м', material: 'Розовое золото', diameter: '26мм x 42мм' },
  { id: 8, name: 'Vacheron Constantin Patrimony', brand: 'Vacheron Constantin', price: 32000, image: 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?auto=format,compress&fm=webp&q=75&w=400', description: 'Воплощение утонченности и классического стиля', category: 'Люкс', inStock: 1, rating: 4.9, movement: 'Механический', waterResistance: '30м', material: 'Розовое золото', diameter: '40мм' },
  { id: 9, name: 'Omega Seamaster', brand: 'Omega', price: 5200, image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format,compress&fm=webp&q=75&w=400', description: 'Дайверские часы Джеймса Бонда', category: 'Omega', inStock: 7, rating: 4.75, movement: 'Автоматический', waterResistance: '300м', material: 'Сталь', diameter: '42мм' },
  { id: 10, name: 'Cartier Tank', brand: 'Cartier', price: 7200, image: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format,compress&fm=webp&q=75&w=400', description: 'Прямоугольные часы, вдохновленные танком', category: 'Cartier', inStock: 5, rating: 4.8, movement: 'Кварцевый', waterResistance: '30м', material: 'Желтое золото', diameter: '29.5 x 22мм' },
  { id: 11, name: 'Rolex GMT-Master II', brand: 'Rolex', price: 14200, image: 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?auto=format,compress&fm=webp&q=75&w=400', description: 'Часы для путешественников с двумя часовыми поясами', category: 'Rolex', inStock: 4, rating: 4.88, movement: 'Автоматический', waterResistance: '100м', material: 'Сталь и золото', diameter: '40мм' },
  { id: 12, name: 'Patek Philippe Nautilus', brand: 'Patek Philippe', price: 42000, image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format,compress&fm=webp&q=75&w=400', description: 'Спортивно-элегантные часы с иллюминаторным дизайном', category: 'Patek', inStock: 1, rating: 4.98, movement: 'Автоматический', waterResistance: '120м', material: 'Сталь', diameter: '40мм' },
  { id: 13, name: 'A. Lange & Söhne Lange 1', brand: 'A. Lange & Söhne', price: 38000, image: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format,compress&fm=webp&q=75&w=400', description: 'Немецкое часовое совершенство с большой датой', category: 'Люкс', inStock: 2, rating: 4.95, movement: 'Механический', waterResistance: '30м', material: 'Розовое золото', diameter: '38.5мм' },
  { id: 14, name: 'Omega Constellation', brand: 'Omega', price: 4800, image: 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?auto=format,compress&fm=webp&q=75&w=400', description: 'Элегантные часы со звездным символом', category: 'Omega', inStock: 8, rating: 4.65, movement: 'Автоматический', waterResistance: '50м', material: 'Сталь и золото', diameter: '38мм' },
  { id: 15, name: 'Cartier Ballon Bleu', brand: 'Cartier', price: 9500, image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format,compress&fm=webp&q=75&w=400', description: 'Часы с сапфировой короной и выпуклым стеклом', category: 'Cartier', inStock: 6, rating: 4.72, movement: 'Автоматический', waterResistance: '30м', material: 'Сталь', diameter: '42мм' },
  { id: 16, name: 'Rolex Daytona', brand: 'Rolex', price: 18500, image: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format,compress&fm=webp&q=75&w=400', description: 'Хронограф для гоночных трасс', category: 'Rolex', inStock: 2, rating: 4.93, movement: 'Автоматический', waterResistance: '100м', material: 'Сталь', diameter: '40мм' },
  { id: 17, name: 'Patek Philippe Aquanaut', brand: 'Patek Philippe', price: 25000, image: 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?auto=format,compress&fm=webp&q=75&w=400', description: 'Спортивно-шикарные часы с каучуковым ремешком', category: 'Patek', inStock: 3, rating: 4.87, movement: 'Автоматический', waterResistance: '120м', material: 'Сталь', diameter: '40мм' },
  { id: 18, name: 'Zenith El Primero', brand: 'Zenith', price: 7200, image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format,compress&fm=webp&q=75&w=400', description: 'Первый автоматический хронограф высокой частоты', category: 'Хронографы', inStock: 5, rating: 4.8, movement: 'Автоматический', waterResistance: '100м', material: 'Сталь', diameter: '42мм' },
  { id: 19, name: 'Tudor Black Bay', brand: 'Tudor', price: 3500, image: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format,compress&fm=webp&q=75&w=400', description: 'Винтажно-вдохновленные дайверские часы', category: 'Спорт', inStock: 10, rating: 4.6, movement: 'Автоматический', waterResistance: '200м', material: 'Сталь', diameter: '41мм' },
  { id: 20, name: 'IWC Pilot\'s Watch', brand: 'IWC', price: 4200, image: 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?auto=format,compress&fm=webp&q=75&w=400', description: 'Классические часы пилотов с большой заводной головкой', category: 'Авиация', inStock: 6, rating: 4.6, movement: 'Автоматический', waterResistance: '60м', material: 'Сталь', diameter: '43мм' }
];

const categories = ['Все', 'Rolex', 'Omega', 'Cartier', 'Patek', 'Люкс', 'Спорт'];

export default function TimeElite({ activeTab }: TimeEliteProps) {
  const [selectedProduct, setSelectedProduct] = useState<typeof products[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [favorites, setFavorites] = useState<number[]>([1, 4, 11]);

  // Preload first 6 product images for instant visibility
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

  const filteredProducts = selectedCategory === 'Все' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  // HOME TAB - Ultra Minimalist 2025
  const renderHomeTab = () => (
    <div className="min-h-screen bg-white font-montserrat pb-24">
      <div className="max-w-md mx-auto px-4 py-8 space-y-8">
        {/* Minimalist Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-600 to-amber-700 rounded-3xl mx-auto flex items-center justify-center shadow-lg">
            <Watch className="w-10 h-10 text-white" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">TimeElite</h1>
            <p className="text-sm text-gray-500">Коллекция премиум часов</p>
          </div>
        </div>

        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-yellow-600 to-amber-700 rounded-3xl p-8 text-white overflow-hidden">
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

        {/* Categories Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Бренды</h2>
            <TrendingUp className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div 
              className="group bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedCategory('Rolex')}
              data-testid="category-rolex"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-center font-semibold text-gray-900 mb-1">Rolex</h3>
              <p className="text-center text-sm text-gray-500">18 моделей</p>
            </div>

            <div 
              className="group bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedCategory('Omega')}
              data-testid="category-omega"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-center font-semibold text-gray-900 mb-1">Omega</h3>
              <p className="text-center text-sm text-gray-500">12 моделей</p>
            </div>

            <div 
              className="group bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedCategory('Cartier')}
              data-testid="category-cartier"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-center font-semibold text-gray-900 mb-1">Cartier</h3>
              <p className="text-center text-sm text-gray-500">8 моделей</p>
            </div>

            <div 
              className="group bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedCategory('Patek')}
              data-testid="category-patek"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Watch className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-center font-semibold text-gray-900 mb-1">Patek Philippe</h3>
              <p className="text-center text-sm text-gray-500">6 моделей</p>
            </div>
          </div>
        </div>

        {/* Popular Items */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Популярное</h2>
          <div className="grid grid-cols-2 gap-4">
            {products.slice(0, 6).map(product => (
              <div 
                key={product.id}
                className="group bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100"
                onClick={() => openProductModal(product)}
                data-testid={`product-card-${product.id}`}
              >
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <OptimizedImage 
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    priority={product.id <= 4}
                  />
                  <button 
                    className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(product.id);
                    }}
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
                    <p className="text-lg font-bold text-gray-900">${product.price.toLocaleString()}</p>
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

  // CATALOG TAB - Modern Grid with Sticky Pills
  const renderCatalogTab = () => (
    <div className="min-h-screen bg-gray-50 font-montserrat pb-24">
      {/* Sticky Category Pills */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 py-4 px-4">
        <div className="max-w-md mx-auto">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 font-medium text-sm ${
                  selectedCategory === cat 
                    ? 'bg-gradient-to-r from-yellow-600 to-amber-700 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                data-testid={`filter-${cat.toLowerCase()}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="mb-4">
          <p className="text-sm text-gray-600">Найдено {filteredProducts.length} часов</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {filteredProducts.map(product => (
            <div 
              key={product.id}
              className="group bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
              onClick={() => openProductModal(product)}
              data-testid={`product-${product.id}`}
            >
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                <OptimizedImage 
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  priority={product.id <= 4}
                />
                <button 
                  className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(product.id);
                  }}
                  data-testid={`favorite-${product.id}`}
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
                  <p className="text-lg font-bold text-gray-900">${product.price.toLocaleString()}</p>
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

  // CART TAB
  const renderCartTab = () => (
    <div className="min-h-screen bg-gray-50 font-montserrat pb-24">
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Корзина</h1>
        <div className="text-center py-16">
          <Watch className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Корзина пуста</p>
        </div>
      </div>
    </div>
  );

  // PROFILE TAB
  const renderProfileTab = () => (
    <div className="min-h-screen bg-gray-50 font-montserrat pb-24">
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Профиль</h1>
        <div className="bg-white rounded-2xl p-6">
          <p className="text-gray-600">Профиль пользователя</p>
        </div>
      </div>
    </div>
  );

  // PRODUCT DETAIL MODAL
  const renderProductModal = () => {
    if (!selectedProduct) return null;

    return (
      <div 
        className={`fixed inset-0 z-50 bg-white transition-all duration-300 ${
          isModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ overflowY: 'auto' }}
      >
        <div className="max-w-md mx-auto">
          {/* Close Button */}
          <button 
            onClick={closeProductModal}
            className="fixed top-4 right-4 z-10 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
            data-testid="button-close-modal"
          >
            <X className="w-6 h-6 text-gray-900" />
          </button>

          {/* Product Image */}
          <div className="relative aspect-square overflow-hidden bg-gray-100">
            <OptimizedImage 
              src={selectedProduct.image}
              alt={selectedProduct.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Product Info */}
          <div className="p-6 space-y-6">
            {/* Brand Badge */}
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-yellow-600 to-amber-700 text-white rounded-full text-sm font-semibold">
              {selectedProduct.brand}
            </div>

            {/* Title & Price */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">{selectedProduct.name}</h1>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold text-amber-600">${selectedProduct.price.toLocaleString()}</p>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-lg font-semibold text-gray-900">{selectedProduct.rating}</span>
                  <span className="text-gray-500">(128)</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-700 leading-relaxed">{selectedProduct.description}</p>

            {/* Specifications */}
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

            {/* Stock */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-600 font-medium">В наличии {selectedProduct.inStock} шт</span>
            </div>

            {/* Add to Cart Button */}
            <ConfirmDrawer
              trigger={
                <button 
                  className="w-full py-4 bg-gradient-to-r from-yellow-600 to-amber-700 text-white rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300"
                  data-testid="button-add-to-cart"
                >
                  Добавить в корзину
                </button>
              }
              title="Добавить в корзину?"
              description={`${selectedProduct.name} — ${new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(selectedProduct.price)}`}
              confirmText="Добавить"
              cancelText="Отмена"
              variant="default"
              onConfirm={() => setSelectedProduct(null)}
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
