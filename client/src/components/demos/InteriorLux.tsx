import { useState } from "react";
import { 
  Heart, 
  Star, 
  X, 
  Home,
  Sofa,
  TrendingUp
} from "lucide-react";
import { OptimizedImage } from "../OptimizedImage";
import { useImagePreloader } from "../../hooks/useImagePreloader";
import { ConfirmDrawer } from "../ui/modern-drawer";

interface InteriorLuxProps {
  activeTab: 'home' | 'catalog' | 'cart' | 'profile';
}

const products = [
  { id: 1, name: 'Диван Scandi', price: 2500, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format,compress&fm=webp&q=75&w=400', description: 'Элегантный диван в скандинавском стиле с мягкой обивкой', category: 'Гостиная', inStock: 5, rating: 4.8, brand: 'Nordic Home', material: 'Ткань, дерево', dimensions: '220x90x80 см' },
  { id: 2, name: 'Стол Oak Dining', price: 1800, image: 'https://images.unsplash.com/photo-1549497538-303791108f95?auto=format,compress&fm=webp&q=75&w=400', description: 'Обеденный стол из массива дуба с натуральной отделкой', category: 'Кухня', inStock: 8, rating: 4.9, brand: 'WoodCraft', material: 'Массив дуба', dimensions: '180x90x75 см' },
  { id: 3, name: 'Кресло Vintage', price: 850, image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format,compress&fm=webp&q=75&w=400', description: 'Винтажное кресло с бархатной обивкой и деревянными ножками', category: 'Гостиная', inStock: 12, rating: 4.7, brand: 'Retro Style', material: 'Бархат, дерево', dimensions: '80x75x85 см' },
  { id: 4, name: 'Кровать King Size', price: 2800, image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format,compress&fm=webp&q=75&w=400', description: 'Роскошная кровать с мягким изголовьем и ортопедическим основанием', category: 'Спальня', inStock: 6, rating: 4.9, brand: 'DreamBeds', material: 'Экокожа, дерево', dimensions: '200x200x120 см' },
  { id: 5, name: 'Комод Chester', price: 950, image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format,compress&fm=webp&q=75&w=400', description: 'Комод в английском стиле с латунными ручками', category: 'Спальня', inStock: 10, rating: 4.7, brand: 'ClassicFurniture', material: 'Массив ясеня', dimensions: '120x40x80 см' },
  { id: 6, name: 'Ковер Persian', price: 680, image: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format,compress&fm=webp&q=75&w=400', description: 'Персидский ковер ручной работы с традиционным орнаментом', category: 'Декор', inStock: 15, rating: 4.5, brand: 'Orient Rugs', material: 'Шерсть', dimensions: '200x300 см' },
  { id: 7, name: 'Люстра Crystal', price: 1500, image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format,compress&fm=webp&q=75&w=400', description: 'Хрустальная люстра в классическом стиле', category: 'Декор', inStock: 4, rating: 4.8, brand: 'CrystalLight', material: 'Хрусталь, металл', dimensions: '80x80x100 см' },
  { id: 8, name: 'Столик Coffee', price: 650, image: 'https://images.unsplash.com/photo-1551298370-9d3d53740c72?auto=format,compress&fm=webp&q=75&w=400', description: 'Журнальный столик со стеклянной столешницей', category: 'Гостиная', inStock: 9, rating: 4.6, brand: 'GlassWorks', material: 'Стекло, металл', dimensions: '120x60x45 см' },
  { id: 9, name: 'Шкаф Wardrobe Pro', price: 3200, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format,compress&fm=webp&q=75&w=400', description: 'Вместительный шкаф с зеркальными дверями', category: 'Спальня', inStock: 3, rating: 4.8, brand: 'StoragePlus', material: 'ЛДСП, зеркало', dimensions: '200x60x240 см' },
  { id: 10, name: 'Картина Abstract', price: 350, image: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format,compress&fm=webp&q=75&w=400', description: 'Абстрактная картина маслом в современном стиле', category: 'Декор', inStock: 20, rating: 4.2, brand: 'ArtGallery', material: 'Холст, масло', dimensions: '60x80 см' },
  { id: 11, name: 'Стеллаж Industrial', price: 1200, image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format,compress&fm=webp&q=75&w=400', description: 'Стеллаж в индустриальном стиле с полками из дерева', category: 'Гостиная', inStock: 7, rating: 4.6, brand: 'MetalWorks', material: 'Металл, дерево', dimensions: '180x40x200 см' },
  { id: 12, name: 'Барный стул Loft', price: 280, image: 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format,compress&fm=webp&q=75&w=400', description: 'Барный стул в стиле лофт с регулируемой высотой', category: 'Кухня', inStock: 18, rating: 4.4, brand: 'UrbanStyle', material: 'Металл, экокожа', dimensions: '45x45x85 см' },
  { id: 13, name: 'Тумба TV Stand', price: 750, image: 'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format,compress&fm=webp&q=75&w=400', description: 'Современная тумба под телевизор с ящиками', category: 'Гостиная', inStock: 11, rating: 4.5, brand: 'MediaFurniture', material: 'МДФ, стекло', dimensions: '160x40x50 см' },
  { id: 14, name: 'Зеркало Gold Frame', price: 320, image: 'https://images.unsplash.com/photo-1618220924273-338d82d6a886?auto=format,compress&fm=webp&q=75&w=400', description: 'Зеркало в золотой раме барокко', category: 'Декор', inStock: 14, rating: 4.4, brand: 'DecorArt', material: 'Дерево, позолота', dimensions: '80x120 см' },
  { id: 15, name: 'Пуф Ottoman', price: 280, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format,compress&fm=webp&q=75&w=400', description: 'Круглый пуф с местом для хранения', category: 'Гостиная', inStock: 16, rating: 4.3, brand: 'ComfortSeating', material: 'Ткань, поролон', dimensions: '60x60x40 см' },
  { id: 16, name: 'Обеденный стул Nordic', price: 180, image: 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format,compress&fm=webp&q=75&w=400', description: 'Скандинавский обеденный стул из массива бука', category: 'Кухня', inStock: 24, rating: 4.6, brand: 'Nordic Home', material: 'Массив бука, ткань', dimensions: '45x50x80 см' },
  { id: 17, name: 'Подушки Velvet Set', price: 120, image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format,compress&fm=webp&q=75&w=400', description: 'Набор бархатных подушек (4 шт)', category: 'Декор', inStock: 30, rating: 4.5, brand: 'SoftDecor', material: 'Бархат', dimensions: '45x45 см' },
  { id: 18, name: 'Торшер Modern Arc', price: 450, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format,compress&fm=webp&q=75&w=400', description: 'Современный торшер с мраморным основанием', category: 'Декор', inStock: 8, rating: 4.6, brand: 'LightDesign', material: 'Мрамор, металл', dimensions: '40x40x180 см' },
  { id: 19, name: 'Кухонный остров', price: 2200, image: 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format,compress&fm=webp&q=75&w=400', description: 'Кухонный остров с мраморной столешницей', category: 'Кухня', inStock: 4, rating: 4.9, brand: 'KitchenPro', material: 'Дерево, мрамор', dimensions: '180x90x90 см' },
  { id: 20, name: 'Прикроватная тумба', price: 380, image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format,compress&fm=webp&q=75&w=400', description: 'Прикроватная тумба с выдвижными ящиками', category: 'Спальня', inStock: 13, rating: 4.5, brand: 'DreamBeds', material: 'МДФ', dimensions: '50x40x60 см' }
];

const categories = ['Все', 'Гостиная', 'Спальня', 'Кухня', 'Декор'];

export default function InteriorLux({ activeTab }: InteriorLuxProps) {
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
    <div className="min-h-screen bg-white font-montserrat pb-24 smooth-scroll-page">
      <div className="max-w-md mx-auto px-4 py-8 space-y-8">
        {/* Minimalist Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl mx-auto flex items-center justify-center shadow-lg">
            <Home className="w-10 h-10 text-white" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">InteriorLux</h1>
            <p className="text-sm text-gray-500">Дизайнерская мебель и декор</p>
          </div>
        </div>

        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-3">Коллекция 2025</h2>
            <p className="text-white/90 mb-4">Создайте дом своей мечты с нашей мебелью</p>
            <button 
              onClick={() => setSelectedCategory('Гостиная')}
              className="px-6 py-3 bg-white text-emerald-600 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
              data-testid="button-view-collection"
            >
              Смотреть каталог
            </button>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Категории</h2>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div 
              className="group bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedCategory('Гостиная')}
              data-testid="category-living"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Sofa className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-center font-semibold text-gray-900 mb-1">Гостиная</h3>
              <p className="text-center text-sm text-gray-500">42 товара</p>
            </div>

            <div 
              className="group bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedCategory('Спальня')}
              data-testid="category-bedroom"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-center font-semibold text-gray-900 mb-1">Спальня</h3>
              <p className="text-center text-sm text-gray-500">28 товаров</p>
            </div>

            <div 
              className="group bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedCategory('Кухня')}
              data-testid="category-kitchen"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Home className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-center font-semibold text-gray-900 mb-1">Кухня</h3>
              <p className="text-center text-sm text-gray-500">18 товаров</p>
            </div>

            <div 
              className="group bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedCategory('Декор')}
              data-testid="category-decor"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-center font-semibold text-gray-900 mb-1">Декор</h3>
              <p className="text-center text-sm text-gray-500">34 товара</p>
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
                  <div className="text-xs font-medium text-emerald-600 mb-1">{product.category}</div>
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
    <div className="min-h-screen bg-gray-50 font-montserrat pb-24 smooth-scroll-page">
      {/* Sticky Category Pills */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 py-5 px-4">
        <div className="max-w-md mx-auto">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 font-medium text-sm ${
                  selectedCategory === cat 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg' 
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
          <p className="text-sm text-gray-600">Найдено {filteredProducts.length} товаров</p>
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
                <div className="text-xs font-medium text-emerald-600 mb-1">{product.category}</div>
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
    <div className="min-h-screen bg-gray-50 font-montserrat pb-24 smooth-scroll-page">
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Корзина</h1>
        <div className="text-center py-16">
          <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Корзина пуста</p>
        </div>
      </div>
    </div>
  );

  // PROFILE TAB
  const renderProfileTab = () => (
    <div className="min-h-screen bg-gray-50 font-montserrat pb-24 smooth-scroll-page">
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
        className={`fixed inset-0 z-50 bg-white transition-all duration-300 smooth-scroll-page ${
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
            {/* Category Badge */}
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full text-sm font-semibold">
              {selectedProduct.category}
            </div>

            {/* Title & Price */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">{selectedProduct.name}</h1>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold text-emerald-600">${selectedProduct.price.toLocaleString()}</p>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-lg font-semibold text-gray-900">{selectedProduct.rating}</span>
                  <span className="text-gray-500">(87)</span>
                </div>
              </div>
            </div>

            {/* Brand */}
            <div className="text-sm text-gray-600">
              от <span className="font-semibold text-gray-900">{selectedProduct.brand}</span>
            </div>

            {/* Description */}
            <p className="text-gray-700 leading-relaxed">{selectedProduct.description}</p>

            {/* Specifications */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Характеристики</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">Размеры</p>
                  <p className="font-semibold text-gray-900">{selectedProduct.dimensions}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">Материал</p>
                  <p className="font-semibold text-gray-900">{selectedProduct.material}</p>
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
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300"
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
