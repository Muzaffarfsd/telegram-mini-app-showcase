import { useState } from "react";
import { 
  Flower, 
  Heart, 
  Star, 
  MapPin, 
  Clock,
  Plus,
  Minus,
  X,
  ChevronRight,
  Gift,
  Truck,
  Calendar
} from "lucide-react";
import { OptimizedImage } from "../OptimizedImage";
import { useImagePreloader } from "../../hooks/useImagePreloader";

interface FloristProps {
  activeTab: 'home' | 'catalog' | 'cart' | 'profile';
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

const flowers = [
  { id: 1, name: 'Букет из красных роз', price: 45, image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Классический букет из 15 красных роз премиум качества', category: 'Розы', occasion: 'Романтика', size: 'Средний', freshness: '7 дней', rating: 4.9, inStock: 12 },
  { id: 2, name: 'Белые пионы', price: 38, image: 'https://images.unsplash.com/photo-1463320726281-696a485928c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Нежный букет из белых пионов для особых моментов', category: 'Пионы', occasion: 'Свадьба', size: 'Большой', freshness: '5 дней', rating: 4.8, inStock: 8 },
  { id: 3, name: 'Микс из тюльпанов', price: 32, image: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Яркий весенний букет из разноцветных тюльпанов', category: 'Тюльпаны', occasion: 'Весна', size: 'Средний', freshness: '4 дня', rating: 4.7, inStock: 15 },
  { id: 4, name: 'Орхидея в горшке', price: 55, image: 'https://images.unsplash.com/photo-1583624719088-e7ee3b0ad466?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Элегантная орхидея фаленопсис в декоративном горшке', category: 'Горшечные', occasion: 'Подарок', size: 'Маленький', freshness: '30 дней', rating: 4.8, inStock: 6 },
  { id: 5, name: 'Букет невесты', price: 85, image: 'https://images.unsplash.com/photo-1594736797933-d0d4bce9b91a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Изысканный свадебный букет из белых роз и эустомы', category: 'Свадебные', occasion: 'Свадьба', size: 'Большой', freshness: '8 дней', rating: 4.9, inStock: 4 },
  { id: 6, name: 'Хризантемы осенние', price: 28, image: 'https://images.unsplash.com/photo-1571043733612-39d1e4d57447?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Яркие осенние хризантемы в теплых оттенках', category: 'Хризантемы', occasion: 'Осень', size: 'Средний', freshness: '10 дней', rating: 4.5, inStock: 20 },
  { id: 7, name: 'Лилии белые', price: 42, image: 'https://images.unsplash.com/photo-1574159103905-55b657e045cf?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Ароматные белые лилии с утонченным ароматом', category: 'Лилии', occasion: 'Траур', size: 'Большой', freshness: '6 дней', rating: 4.6, inStock: 10 },
  { id: 8, name: 'Полевые цветы', price: 25, image: 'https://images.unsplash.com/photo-1586136867486-b9da8c85c8c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Романтичный букет из полевых цветов и зелени', category: 'Полевые', occasion: 'Романтика', size: 'Маленький', freshness: '3 дня', rating: 4.4, inStock: 25 },
  { id: 9, name: 'Гортензия синяя', price: 48, image: 'https://images.unsplash.com/photo-1463320898994-e8e8ac0e3534?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Пышная синяя гортензия в элегантном оформлении', category: 'Гортензии', occasion: 'Подарок', size: 'Большой', freshness: '8 дней', rating: 4.7, inStock: 7 },
  { id: 10, name: 'Подсолнухи', price: 35, image: 'https://images.unsplash.com/photo-1597848212624-e6bf2c8b4d8a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Солнечные подсолнухи для поднятия настроения', category: 'Подсолнухи', occasion: 'Радость', size: 'Большой', freshness: '5 дней', rating: 4.6, inStock: 18 },
  { id: 11, name: 'Композиция в коробке', price: 65, image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Стильная композиция из роз и эвкалипта в шляпной коробке', category: 'Композиции', occasion: 'VIP подарок', size: 'Средний', freshness: '7 дней', rating: 4.8, inStock: 9 },
  { id: 12, name: 'Эустома разноцветная', price: 40, image: 'https://images.unsplash.com/photo-1492552264149-86a37d023ceb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Нежная эустома в пастельных тонах', category: 'Эустома', occasion: 'Нежность', size: 'Средний', freshness: '6 дней', rating: 4.5, inStock: 14 },
  { id: 13, name: 'Каллы элегантные', price: 52, image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2ac1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Изысканные белые каллы для торжественных событий', category: 'Каллы', occasion: 'Торжество', size: 'Большой', freshness: '7 дней', rating: 4.7, inStock: 6 },
  { id: 14, name: 'Герберы яркие', price: 30, image: 'https://images.unsplash.com/photo-1516205651411-aef33a44f7c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Радостные герберы в ярких летних цветах', category: 'Герберы', occasion: 'Радость', size: 'Средний', freshness: '5 дней', rating: 4.4, inStock: 22 },
  { id: 15, name: 'Фрезии ароматные', price: 36, image: 'https://images.unsplash.com/photo-1511713847398-1b5e9c03035e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Ароматные фрезии с утонченным запахом', category: 'Фрезии', occasion: 'Романтика', size: 'Маленький', freshness: '4 дня', rating: 4.6, inStock: 16 },
  { id: 16, name: 'Антуриум красный', price: 58, image: 'https://images.unsplash.com/photo-1463320726281-696a485928c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Экзотический красный антуриум для особого случая', category: 'Экзотические', occasion: 'VIP подарок', size: 'Средний', freshness: '10 дней', rating: 4.8, inStock: 5 },
  { id: 17, name: 'Букет "Весенний бриз"', price: 44, image: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Свежий букет из нарциссов, тюльпанов и зелени', category: 'Сезонные', occasion: 'Весна', size: 'Большой', freshness: '5 дней', rating: 4.5, inStock: 11 },
  { id: 18, name: 'Протея экзотическая', price: 72, image: 'https://images.unsplash.com/photo-1583624719088-e7ee3b0ad466?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Редкая экзотическая протея из Южной Африки', category: 'Экзотические', occasion: 'Коллекционирование', size: 'Маленький', freshness: '14 дней', rating: 4.9, inStock: 3 },
  { id: 19, name: 'Сухоцветы винтаж', price: 38, image: 'https://images.unsplash.com/photo-1586136867486-b9da8c85c8c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Стильная композиция из сухоцветов в винтажном стиле', category: 'Сухоцветы', occasion: 'Декор', size: 'Средний', freshness: '365 дней', rating: 4.3, inStock: 13 },
  { id: 20, name: 'Букет "Радужный"', price: 50, image: 'https://images.unsplash.com/photo-1597848212624-e6bf2c8b4d8a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Многоцветный букет из разных видов цветов для яркого настроения', category: 'Микс', occasion: 'Радость', size: 'Большой', freshness: '6 дней', rating: 4.7, inStock: 8 }
];

const categories = ['Все', 'Розы', 'Тюльпаны', 'Пионы', 'Лилии', 'Свадебные', 'Горшечные', 'Экзотические', 'Сухоцветы', 'Композиции'];

const occasions = ['Все', 'Романтика', 'Свадьба', 'Подарок', 'VIP подарок', 'Весна', 'Радость', 'Торжество', 'Декор'];

const initialCartItems: CartItem[] = [
  { id: 1, name: 'Букет из красных роз', price: 45, quantity: 1, image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60' },
  { id: 11, name: 'Композиция в коробке', price: 65, quantity: 1, image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60' },
];

export default function Florist({ activeTab }: FloristProps) {
  const [selectedFlower, setSelectedFlower] = useState<typeof flowers[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems);
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [selectedOccasion, setSelectedOccasion] = useState('Все');
  const [favorites, setFavorites] = useState<number[]>([1, 5, 11, 18]);

  const openFlowerModal = (flower: typeof flowers[0]) => {
    setSelectedFlower(flower);
    setIsModalOpen(true);
  };

  const closeFlowerModal = () => {
    setIsModalOpen(false);
    setSelectedFlower(null);
  };

  const updateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCartItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (itemId: number) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const toggleFavorite = (flowerId: number) => {
    setFavorites(prev => 
      prev.includes(flowerId) 
        ? prev.filter(id => id !== flowerId)
        : [...prev, flowerId]
    );
  };

  const filteredFlowers = flowers.filter(flower => {
    const matchesCategory = selectedCategory === 'Все' || flower.category === selectedCategory;
    const matchesOccasion = selectedOccasion === 'Все' || flower.occasion === selectedOccasion;
    
    return matchesCategory && matchesOccasion;
  });

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Preload first 6 product images for instant visibility
  useImagePreloader({
    images: flowers.slice(0, 6).map(item => item.image),
    priority: true
  });


  const renderHomeTab = () => (
    <div className="max-w-md mx-auto px-4 space-y-6">
      {/* Заголовок */}
      <div className="text-center">
        <h1 className="ios-title font-bold mb-2">Цветочный Рай</h1>
        <p className="ios-subheadline text-secondary-label">Свежие цветы каждый день 🌸</p>
      </div>

      {/* Быстрая доставка */}
      <div className="ios-card p-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="ios-headline font-semibold">Доставка за 2 часа</h3>
            <p className="ios-body">Свежие цветы прямо к вашей двери</p>
          </div>
          <Truck className="w-8 h-8" />
        </div>
      </div>

      {/* Популярные категории */}
      <div>
        <h2 className="ios-title font-semibold mb-4">Популярные букеты</h2>
        <div className="grid grid-cols-2 gap-3">
          {flowers.slice(0, 4).map((flower) => (
            <div 
              key={flower.id} 
              className="ios-card p-3 cursor-pointer"
              onClick={() => openFlowerModal(flower)}
            >
              <OptimizedImage src={flower.image} alt={flower.name} className="w-full h-32 object-cover rounded-lg mb-2" />
              <h4 className="ios-footnote font-semibold line-clamp-2">{flower.name}</h4>
              <p className="ios-caption2 text-secondary-label mb-2">{flower.category}</p>
              <div className="flex items-center justify-between">
                <span className="ios-caption font-bold text-system-green">${flower.price}</span>
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="ios-caption2">{flower.rating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Случаи для букетов */}
      <div>
        <h2 className="ios-title font-semibold mb-4">Букеты по случаю</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { name: 'Романтика', icon: '💕', color: 'bg-pink-500' },
            { name: 'Свадьба', icon: '💒', color: 'bg-purple-500' },
            { name: 'VIP подарок', icon: '👑', color: 'bg-yellow-500' },
            { name: 'Радость', icon: '🌈', color: 'bg-orange-500' },
            { name: 'Торжество', icon: '🎉', color: 'bg-blue-500' },
            { name: 'Декор', icon: '🏠', color: 'bg-green-500' }
          ].map((occasion) => (
            <div 
              key={occasion.name} 
              className="ios-card p-3 text-center cursor-pointer"
              onClick={() => setSelectedOccasion(occasion.name)}
            >
              <div className={`w-10 h-10 ${occasion.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
                <span className="text-lg">{occasion.icon}</span>
              </div>
              <span className="ios-caption2 font-medium">{occasion.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Информация о магазине */}
      <div className="ios-card p-4">
        <h3 className="ios-headline font-semibold mb-3">Почему выбирают нас</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Flower className="w-4 h-4 text-system-green" />
            <span className="ios-body">Свежие цветы каждое утро</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-system-green" />
            <span className="ios-body">Доставка 24/7 по городу</span>
          </div>
          <div className="flex items-center space-x-2">
            <Gift className="w-4 h-4 text-system-green" />
            <span className="ios-body">Красивая упаковка в подарок</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCatalogTab = () => (
    <div className="bg-white min-h-screen">
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        <h1 className="ios-title font-bold">Каталог цветов</h1>
      
      {/* Фильтры */}
      <div className="space-y-3">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full whitespace-nowrap ios-footnote font-medium ${
                selectedCategory === category
                  ? 'bg-system-green text-white'
                  : 'bg-quaternary-system-fill text-label'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {occasions.map((occasion) => (
            <button
              key={occasion}
              onClick={() => setSelectedOccasion(occasion)}
              className={`px-3 py-1 rounded-full whitespace-nowrap ios-caption2 font-medium ${
                selectedOccasion === occasion
                  ? 'bg-system-emerald text-white'
                  : 'bg-fill text-secondary-label'
              }`}
            >
              {occasion}
            </button>
          ))}
        </div>
      </div>

      {/* Список букетов */}
      <div className="space-y-3">
        {filteredFlowers.map((flower) => (
          <div 
            key={flower.id} 
            className="ios-card p-4 cursor-pointer"
            onClick={() => openFlowerModal(flower)}
          >
            <div className="flex items-center space-x-3">
              <OptimizedImage src={flower.image} alt={flower.name} className="w-20 h-20 object-cover rounded-lg" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="ios-body font-semibold line-clamp-1">{flower.name}</h4>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(flower.id);
                    }}
                    className="p-1"
                  >
                    <Heart 
                      className={`w-4 h-4 ${
                        favorites.includes(flower.id) 
                          ? 'fill-red-500 text-red-500' 
                          : 'text-secondary-label'
                      }`} 
                    />
                  </button>
                </div>
                <p className="ios-footnote text-secondary-label mb-2 line-clamp-2">{flower.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="ios-caption2 px-2 py-1 bg-quaternary-system-fill rounded">{flower.category}</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="ios-caption2">{flower.rating}</span>
                    </div>
                    <span className="ios-caption2 text-secondary-label">{flower.freshness}</span>
                  </div>
                  <span className="ios-body font-bold text-system-green">${flower.price}</span>
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
    <div className="max-w-md mx-auto px-4 py-6 space-y-4">
      <h1 className="ios-title font-bold">Корзина</h1>
      
      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <Flower className="w-16 h-16 text-quaternary-label mx-auto mb-4" />
          <p className="ios-body text-secondary-label">Корзина пуста</p>
          <p className="ios-footnote text-tertiary-label">Добавьте букеты из каталога</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {cartItems.map((item) => (
              <div key={item.id} className="ios-card p-4">
                <div className="flex items-center space-x-3">
                  <OptimizedImage src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                  <div className="flex-1">
                    <h4 className="ios-body font-semibold">{item.name}</h4>
                    <p className="ios-footnote text-secondary-label">${item.price} за букет</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-full bg-quaternary-system-fill flex items-center justify-center"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="ios-body font-semibold w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full bg-system-green text-white flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="ios-body font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="ios-footnote text-system-red"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Время доставки */}
          <div className="ios-card p-4 bg-system-green/5 border border-system-green/20">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-4 h-4 text-system-green" />
              <span className="ios-body font-semibold text-system-green">Быстрая доставка</span>
            </div>
            <p className="ios-footnote text-secondary-label">
              Заказ будет доставлен в течение 2 часов
            </p>
          </div>

          <div className="ios-card p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="ios-body">Подытог:</span>
              <span className="ios-body font-semibold">${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="ios-body">Доставка:</span>
              <span className="ios-body font-semibold">$8.00</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="ios-body">Упаковка:</span>
              <span className="ios-body font-semibold text-system-green">Бесплатно</span>
            </div>
            <hr className="border-separator" />
            <div className="flex justify-between items-center">
              <span className="ios-headline font-bold">Итого:</span>
              <span className="ios-headline font-bold text-system-green">${(cartTotal + 8).toFixed(2)}</span>
            </div>
            
            <button className="w-full bg-system-green text-white ios-body font-semibold py-3 rounded-xl flex items-center justify-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Выбрать время доставки</span>
            </button>
          </div>
        </>
      )}
    </div>
  );

  const renderProfileTab = () => (
    <div className="max-w-md mx-auto px-4 py-6 space-y-4">
      <h1 className="ios-title font-bold">Профиль флориста</h1>
      
      <div className="ios-card p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-16 h-16 bg-system-green rounded-full flex items-center justify-center">
            <span className="ios-title font-bold text-white">ЦР</span>
          </div>
          <div>
            <h3 className="ios-headline font-semibold">Цветочный VIP</h3>
            <p className="ios-body text-secondary-label">Постоянный покупатель</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="ios-title font-bold text-system-green">47</p>
            <p className="ios-footnote text-secondary-label">Заказов</p>
          </div>
          <div className="text-center">
            <p className="ios-title font-bold text-system-purple">12%</p>
            <p className="ios-footnote text-secondary-label">Скидка</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="ios-headline font-semibold">Избранные букеты</h2>
        {flowers.filter(flower => favorites.includes(flower.id)).map((flower) => (
          <div key={flower.id} className="ios-card p-3 flex items-center space-x-3">
            <OptimizedImage src={flower.image} alt={flower.name} className="w-20 h-20 object-cover rounded-lg" />
            <div className="flex-1">
              <h4 className="ios-body font-semibold line-clamp-1">{flower.name}</h4>
              <p className="ios-footnote text-secondary-label">${flower.price} • {flower.category}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-tertiary-label" />
          </div>
        ))}
      </div>

      <div className="ios-card p-4">
        <h3 className="ios-headline font-semibold mb-3">История заказов</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="ios-body">Последний заказ:</span>
            <span className="ios-body font-medium">16 дек 2024</span>
          </div>
          <div className="flex justify-between">
            <span className="ios-body">Любимые цветы:</span>
            <span className="ios-body font-medium">Розы</span>
          </div>
          <div className="flex justify-between">
            <span className="ios-body">Потрачено всего:</span>
            <span className="ios-body font-medium text-system-green">$2,340</span>
          </div>
        </div>
      </div>

      <div className="ios-card p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
        <div className="flex items-center space-x-2 mb-2">
          <Gift className="w-5 h-5 text-system-green" />
          <span className="ios-body font-semibold text-system-green">Программа лояльности</span>
        </div>
        <p className="ios-footnote text-secondary-label mb-2">
          До следующей скидки осталось всего 3 заказа
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-system-green h-2 rounded-full" style={{ width: '70%' }}></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-system-background smooth-scroll-page" data-scroll="demo-florist">
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'home' && renderHomeTab()}
        {activeTab === 'catalog' && renderCatalogTab()}
        {activeTab === 'cart' && renderCartTab()}
        {activeTab === 'profile' && renderProfileTab()}
      </div>

      {/* Модальное окно */}
      {isModalOpen && selectedFlower && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-system-background max-w-md mx-auto w-full rounded-t-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <h3 className="ios-title font-bold line-clamp-2">{selectedFlower.name}</h3>
              <button onClick={closeFlowerModal}>
                <X className="w-6 h-6 text-secondary-label" />
              </button>
            </div>
            
            <OptimizedImage src={selectedFlower.image} alt={selectedFlower.name} className="w-full h-48 object-cover rounded-xl" />
            
            <div className="space-y-3">
              <p className="ios-body text-secondary-label">{selectedFlower.description}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="ios-card p-3">
                  <p className="ios-caption2 text-secondary-label">Размер</p>
                  <p className="ios-body font-semibold">{selectedFlower.size}</p>
                </div>
                <div className="ios-card p-3">
                  <p className="ios-caption2 text-secondary-label">Свежесть</p>
                  <p className="ios-body font-semibold">{selectedFlower.freshness}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="px-3 py-1 rounded-full ios-caption2 font-semibold bg-quaternary-system-fill text-label">
                  {selectedFlower.category}
                </span>
                <span className="px-3 py-1 rounded-full ios-caption2 font-semibold bg-system-green/10 text-system-green">
                  {selectedFlower.occasion}
                </span>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="ios-footnote">{selectedFlower.rating}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="ios-title font-bold text-system-green">${selectedFlower.price}</span>
                <span className="ios-footnote text-secondary-label">
                  В наличии: {selectedFlower.inStock} букетов
                </span>
              </div>
              
              <button className="w-full bg-system-green text-white ios-body font-semibold py-3 rounded-xl">
                В корзину
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}