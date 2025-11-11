import { useState, useEffect, memo } from "react";
import { motion } from "framer-motion";
import { 
  Coffee as CoffeeIcon, 
  Heart, 
  Star, 
  X,
  Clock,
  ChevronLeft,
  ShoppingCart,
  User,
  MapPin,
  Sparkles,
  Gift,
  TrendingUp
} from "lucide-react";

interface CoffeeProps {
  activeTab: 'home' | 'catalog' | 'cart' | 'profile';
}

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  rating: number;
  beans: string;
  strength: number;
  isNew?: boolean;
  isPopular?: boolean;
}

const products: Product[] = [
  { id: 1, name: 'Эспрессо', price: 250, image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=800&h=1200&fit=crop&q=90', description: 'Классический итальянский эспрессо', category: 'Кофе', rating: 4.9, beans: 'Арабика 100%', strength: 5, isPopular: true },
  { id: 2, name: 'Капучино', price: 320, image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800&h=1200&fit=crop&q=90', description: 'Нежный капучино с молочной пенкой', category: 'Кофе', rating: 4.8, beans: 'Арабика 100%', strength: 3, isPopular: true },
  { id: 3, name: 'Латте', price: 330, image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&h=1200&fit=crop&q=90', description: 'Мягкий латте с красивым латте-артом', category: 'Кофе', rating: 4.7, beans: 'Арабика 100%', strength: 2, isNew: true },
  { id: 4, name: 'Флэт Уайт', price: 340, image: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=800&h=1200&fit=crop&q=90', description: 'Австралийский флэт уайт премиум класса', category: 'Кофе', rating: 4.9, beans: 'Арабика Эфиопия', strength: 4, isPopular: true },
  { id: 5, name: 'Раф Кофе', price: 350, image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=800&h=1200&fit=crop&q=90', description: 'Авторский раф с ванилью и сливками', category: 'Кофе', rating: 5.0, beans: 'Арабика Бразилия', strength: 2, isNew: true, isPopular: true },
  { id: 6, name: 'Американо', price: 230, image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=1200&fit=crop&q=90', description: 'Крепкий американо для энергии', category: 'Кофе', rating: 4.6, beans: 'Арабика/Робуста', strength: 4 },
  { id: 7, name: 'Холодный Брю', price: 380, image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=800&h=1200&fit=crop&q=90', description: 'Освежающий холодный кофе', category: 'Холодный кофе', rating: 4.8, beans: 'Арабика Колумбия', strength: 3, isNew: true },
  { id: 8, name: 'Фраппучино', price: 390, image: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&h=1200&fit=crop&q=90', description: 'Кофейный коктейль со льдом', category: 'Холодный кофе', rating: 4.7, beans: 'Арабика', strength: 2 },
  { id: 9, name: 'Чизкейк', price: 420, image: 'https://images.unsplash.com/photo-1533134486753-c833f0ed4866?w=800&h=1200&fit=crop&q=90', description: 'Нежный чизкейк Нью-Йорк', category: 'Десерты', rating: 5.0, beans: '-', strength: 0, isPopular: true },
  { id: 10, name: 'Тирамису', price: 450, image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&h=1200&fit=crop&q=90', description: 'Классический итальянский тирамису', category: 'Десерты', rating: 4.9, beans: '-', strength: 0, isPopular: true },
  { id: 11, name: 'Круассан', price: 180, image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&h=1200&fit=crop&q=90', description: 'Свежий французский круассан', category: 'Выпечка', rating: 4.8, beans: '-', strength: 0 },
  { id: 12, name: 'Маффин', price: 200, image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=800&h=1200&fit=crop&q=90', description: 'Шоколадный маффин с черникой', category: 'Выпечка', rating: 4.7, beans: '-', strength: 0, isNew: true },
];

const categories = ['Все', 'Кофе', 'Холодный кофе', 'Десерты', 'Выпечка'];

const collections = [
  {
    id: 1,
    title: 'Хиты сезона',
    subtitle: 'Самые популярные',
    image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=1200&h=800&fit=crop&q=90',
    gradient: 'from-amber-600/30 to-orange-600/30',
    accentColor: '#D97706',
    products: [1, 2, 5]
  },
  {
    id: 2,
    title: 'Холодные напитки',
    subtitle: 'Освежающие',
    image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=1200&h=800&fit=crop&q=90',
    gradient: 'from-cyan-600/30 to-blue-600/30',
    accentColor: '#06B6D4',
    products: [7, 8]
  },
  {
    id: 3,
    title: 'Кофе и десерт',
    subtitle: 'Идеальная пара',
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=1200&h=800&fit=crop&q=90',
    gradient: 'from-rose-600/30 to-pink-600/30',
    accentColor: '#E11D48',
    products: [9, 10]
  },
];

export default memo(function Coffee({ activeTab }: CoffeeProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [loyaltyPoints, setLoyaltyPoints] = useState(127);

  useEffect(() => {
    if (activeTab !== 'catalog') {
      setSelectedProduct(null);
    }
  }, [activeTab]);

  const filteredProducts = products.filter(p => 
    selectedCategory === 'Все' || p.category === selectedCategory
  );

  const toggleFavorite = (productId: number) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId);
    } else {
      newFavorites.add(productId);
    }
    setFavorites(newFavorites);
  };

  const addToCart = (product: Product, size: string = 'M') => {
    const existingItem = orderItems.find(item => item.id === product.id && item.size === size);
    if (existingItem) {
      setOrderItems(orderItems.map(item => 
        item.id === product.id && item.size === size 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setOrderItems([...orderItems, {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image,
        size
      }]);
    }
    
    setLoyaltyPoints(prev => prev + 5);
    setSelectedProduct(null);
  };

  const removeFromCart = (itemId: number, size: string) => {
    setOrderItems(orderItems.filter(item => !(item.id === itemId && item.size === size)));
  };

  const updateQuantity = (itemId: number, size: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(itemId, size);
    } else {
      setOrderItems(orderItems.map(item =>
        item.id === itemId && item.size === size
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = Math.floor(loyaltyPoints / 10) * 50;
  const finalAmount = Math.max(0, totalAmount - discount);

  if (activeTab === 'home') {
    return (
      <div className="h-full overflow-y-auto">
        <div className="relative h-[280px] bg-gradient-to-br from-amber-600/20 via-orange-500/20 to-yellow-600/20">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&h=800&fit=crop&q=90')] bg-cover bg-center opacity-30" />
          <div className="absolute inset-0 backdrop-blur-xl bg-gradient-to-t from-black/60 to-transparent" />
          
          <div className="relative h-full flex flex-col justify-end p-6 pb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500/20 backdrop-blur-xl rounded-xl border border-amber-400/30">
                  <CoffeeIcon className="w-6 h-6 text-amber-300" />
                </div>
                <h1 className="text-3xl font-bold text-white">CoffeeCraft</h1>
              </div>
              <p className="text-white/80">Искусство кофе в каждой чашке</p>
              
              <div className="flex items-center gap-3 pt-2">
                <div className="px-4 py-2 bg-amber-500/20 backdrop-blur-xl rounded-full border border-amber-400/30">
                  <p className="text-amber-200 text-sm font-medium flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    {loyaltyPoints} кофейных зерен
                  </p>
                </div>
                <div className="px-4 py-2 bg-green-500/20 backdrop-blur-xl rounded-full border border-green-400/30">
                  <p className="text-green-200 text-sm font-medium">
                    Скидка {discount}₽
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="p-4 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Коллекции</h2>
              <TrendingUp className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="grid gap-3">
              {collections.map((collection) => (
                <motion.div
                  key={collection.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative h-32 rounded-2xl overflow-hidden hover-elevate active-elevate-2 cursor-pointer"
                >
                  <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${collection.image})` }} />
                  <div className="absolute inset-0 backdrop-blur-xl bg-gradient-to-r from-black/60 to-transparent" />
                  <div className={`absolute inset-0 bg-gradient-to-r ${collection.gradient}`} />
                  
                  <div className="relative h-full p-5 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{collection.title}</h3>
                      <p className="text-white/80 text-sm">{collection.subtitle}</p>
                    </div>
                    <div className="flex gap-2">
                      {products.filter(p => collection.products.includes(p.id)).slice(0, 3).map(product => (
                        <div key={product.id} className="w-12 h-12 rounded-lg overflow-hidden border-2 border-white/30">
                          <img src={product.image} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Популярное</h2>
              <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {products.filter(p => p.isPopular).map((product) => (
                <motion.div
                  key={product.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedProduct(product)}
                  className="bg-card/50 backdrop-blur-xl rounded-2xl overflow-hidden border border-border/50 hover-elevate active-elevate-2 cursor-pointer"
                  data-testid={`card-product-${product.id}`}
                >
                  <div className="relative aspect-[3/4]">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(product.id);
                      }}
                      className="absolute top-2 right-2 p-2 bg-black/50 backdrop-blur-xl rounded-full border border-white/20"
                      data-testid={`button-favorite-${product.id}`}
                    >
                      <Heart className={`w-4 h-4 ${favorites.has(product.id) ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                    </button>
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium mb-1 line-clamp-1">{product.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold">{product.price.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                        <span className="text-sm font-medium">{product.rating}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'catalog') {
    if (selectedProduct) {
      return (
        <div className="h-full flex flex-col bg-background">
          <div className="relative">
            <div className="aspect-[3/4] relative">
              <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 left-4 p-2 bg-black/50 backdrop-blur-xl rounded-full border border-white/20"
                data-testid="button-back"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={() => toggleFavorite(selectedProduct.id)}
                className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-xl rounded-full border border-white/20"
                data-testid={`button-favorite-detail-${selectedProduct.id}`}
              >
                <Heart className={`w-6 h-6 ${favorites.has(selectedProduct.id) ? 'fill-red-500 text-red-500' : 'text-white'}`} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-2xl font-bold">{selectedProduct.name}</h1>
                <div className="flex items-center gap-1 px-3 py-1 bg-amber-500/10 rounded-full">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span className="font-bold text-amber-600">{selectedProduct.rating}</span>
                </div>
              </div>
              <p className="text-muted-foreground">{selectedProduct.description}</p>
            </div>

            {selectedProduct.category !== 'Десерты' && selectedProduct.category !== 'Выпечка' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-card/50 backdrop-blur-xl rounded-xl border border-border/50">
                  <p className="text-sm text-muted-foreground mb-1">Зерна</p>
                  <p className="font-medium">{selectedProduct.beans}</p>
                </div>
                <div className="p-4 bg-card/50 backdrop-blur-xl rounded-xl border border-border/50">
                  <p className="text-sm text-muted-foreground mb-1">Крепость</p>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-2 w-full rounded-full ${
                          i < selectedProduct.strength ? 'bg-amber-500' : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 backdrop-blur-xl rounded-xl border border-amber-400/30">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="w-5 h-5 text-amber-600" />
                <p className="font-semibold text-amber-900 dark:text-amber-100">Программа лояльности</p>
              </div>
              <p className="text-sm text-amber-800 dark:text-amber-200">
                +5 кофейных зерен за покупку • 10 зерен = 50₽ скидка
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Цена</p>
                <p className="text-3xl font-bold">{selectedProduct.price.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}</p>
              </div>
              <button
                onClick={() => addToCart(selectedProduct, 'M')}
                className="px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold rounded-2xl hover-elevate active-elevate-2 flex items-center gap-2"
                data-testid="button-add-to-cart"
              >
                <ShoppingCart className="w-5 h-5" />
                В корзину
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="h-full overflow-y-auto">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border/50 p-4">
          <h1 className="text-2xl font-bold mb-4">Меню</h1>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? 'bg-amber-600 text-white'
                    : 'bg-card/50 backdrop-blur-xl border border-border/50 hover-elevate'
                }`}
                data-testid={`button-category-${category}`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 grid grid-cols-2 gap-3">
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedProduct(product)}
              className="bg-card/50 backdrop-blur-xl rounded-2xl overflow-hidden border border-border/50 hover-elevate active-elevate-2 cursor-pointer"
              data-testid={`card-catalog-product-${product.id}`}
            >
              <div className="relative aspect-[3/4]">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                {product.isNew && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-green-500/90 backdrop-blur-xl rounded-full border border-green-400/50">
                    <span className="text-xs font-bold text-white">Новинка</span>
                  </div>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(product.id);
                  }}
                  className="absolute top-2 right-2 p-2 bg-black/50 backdrop-blur-xl rounded-full border border-white/20"
                  data-testid={`button-favorite-catalog-${product.id}`}
                >
                  <Heart className={`w-4 h-4 ${favorites.has(product.id) ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                </button>
              </div>
              <div className="p-3">
                <h3 className="font-medium mb-1 line-clamp-1">{product.name}</h3>
                <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">{product.price.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <span className="text-sm font-medium">{product.rating}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (activeTab === 'cart') {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-border/50">
          <h1 className="text-2xl font-bold">Корзина</h1>
        </div>

        {orderItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mb-4">
              <ShoppingCart className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Корзина пуста</h3>
            <p className="text-muted-foreground">Добавьте товары из меню</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {orderItems.map((item) => {
                const product = products.find(p => p.id === item.id);
                return (
                  <motion.div
                    key={`${item.id}-${item.size}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="bg-card/50 backdrop-blur-xl rounded-2xl border border-border/50 p-4 flex gap-4"
                    data-testid={`cart-item-${item.id}`}
                  >
                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{item.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{product?.category}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold">{(item.price * item.quantity).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                            className="w-8 h-8 bg-muted rounded-full flex items-center justify-center hover-elevate active-elevate-2"
                            data-testid={`button-decrease-${item.id}`}
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-semibold" data-testid={`text-quantity-${item.id}`}>{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                            className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center hover-elevate active-elevate-2"
                            data-testid={`button-increase-${item.id}`}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id, item.size)}
                      className="self-start p-2 hover-elevate active-elevate-2 rounded-full"
                      data-testid={`button-remove-${item.id}`}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </motion.div>
                );
              })}

              {discount > 0 && (
                <div className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-xl rounded-2xl border border-green-400/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-green-900 dark:text-green-100">Скидка по программе</span>
                    </div>
                    <span className="font-bold text-green-600">-{discount}₽</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-card/80 backdrop-blur-xl border-t border-border/50">
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Товары ({orderItems.reduce((sum, item) => sum + item.quantity, 0)})</span>
                  <span className="font-medium">{totalAmount.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Скидка</span>
                    <span className="font-medium text-green-600">-{discount}₽</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-border/50">
                  <span>Итого</span>
                  <span data-testid="text-total">{finalAmount.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}</span>
                </div>
              </div>
              <button
                className="w-full py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold rounded-2xl hover-elevate active-elevate-2"
                data-testid="button-checkout"
              >
                Оформить заказ
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  if (activeTab === 'profile') {
    return (
      <div className="h-full overflow-y-auto">
        <div className="p-6 bg-card/80 backdrop-blur-xl border-b border-border/50">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-600 to-orange-600 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Иван Петров</h2>
              <p className="text-sm text-muted-foreground">+7 (999) 123-45-67</p>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 backdrop-blur-xl rounded-2xl border border-amber-400/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-amber-600 dark:text-amber-500" />
                <span className="font-semibold text-lg">Кофейные зерна</span>
              </div>
              <span className="text-3xl font-bold text-amber-600">{loyaltyPoints}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">До следующей скидки</span>
              <span className="font-medium">{10 - (loyaltyPoints % 10)} зерен</span>
            </div>
            <div className="mt-3 h-2 bg-amber-900/20 dark:bg-amber-900/40 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all"
                style={{ width: `${((loyaltyPoints % 10) / 10) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="p-4 space-y-2">
          <button className="w-full p-4 bg-card/50 backdrop-blur-xl rounded-xl border border-border/50 flex items-center justify-between hover-elevate active-elevate-2" data-testid="button-orders">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">История заказов</span>
            </div>
            <ChevronLeft className="w-5 h-5 rotate-180 text-muted-foreground" />
          </button>

          <button className="w-full p-4 bg-card/50 backdrop-blur-xl rounded-xl border border-border/50 flex items-center justify-between hover-elevate active-elevate-2" data-testid="button-addresses">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">Адреса доставки</span>
            </div>
            <ChevronLeft className="w-5 h-5 rotate-180 text-muted-foreground" />
          </button>

          <button className="w-full p-4 bg-card/50 backdrop-blur-xl rounded-xl border border-border/50 flex items-center justify-between hover-elevate active-elevate-2" data-testid="button-loyalty">
            <div className="flex items-center gap-3">
              <Gift className="w-5 h-5 text-amber-600" />
              <span className="font-medium">Программа лояльности</span>
            </div>
            <ChevronLeft className="w-5 h-5 rotate-180 text-muted-foreground" />
          </button>
        </div>
      </div>
    );
  }

  return null;
});
