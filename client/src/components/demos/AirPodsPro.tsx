import { useState, memo } from "react";
import { m } from "framer-motion";
import { ChevronRight, ShoppingCart, Heart, Star, Check, ChevronLeft, Package, Headphones, Volume2, Battery, Bluetooth, Settings } from "lucide-react";

interface AirPodsProProps {
  activeTab: 'home' | 'catalog' | 'cart' | 'profile';
}

interface Product {
  id: number;
  name: string;
  generation: string;
  price: number;
  image: string;
  features: string[];
  inStock: boolean;
}

const products: Product[] = [
  {
    id: 1,
    name: "AirPods Pro",
    generation: "2nd Generation",
    price: 200,
    image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&h=800&fit=crop&q=90",
    features: ["Active Noise Cancellation", "Adaptive Transparency", "Personalized Spatial Audio"],
    inStock: true
  },
  {
    id: 2,
    name: "AirPods Pro",
    generation: "1st Generation",
    price: 150,
    image: "https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=800&h=800&fit=crop&q=90",
    features: ["Active Noise Cancellation", "Transparency Mode", "Sweat Resistant"],
    inStock: true
  }
];

function AirPodsPro({ activeTab }: AirPodsProProps) {
  const [selectedGeneration, setSelectedGeneration] = useState<'1st' | '2nd'>('2nd');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  const currentProduct = selectedGeneration === '2nd' ? products[0] : products[1];

  const addToCart = (product: Product) => {
    setCart([...cart, product]);
  };

  const toggleFavorite = (id: number) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
  };

  // ========================================
  // HOME PAGE - Onboarding/Hero screen (Light mode)
  // ========================================
  if (activeTab === 'home') {
    return (
      <div 
        className="min-h-screen text-[#1A1A1A] overflow-auto pb-24"
        style={{ background: 'linear-gradient(180deg, #E8E8ED 0%, #D4D4DC 100%)' }}
      >
        <div className="demo-nav-safe px-6">
          {/* Apple Logo */}
          <div className="flex justify-center mb-8">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
          </div>

          {/* Product Image */}
          <m.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative flex justify-center mb-10"
          >
            <img
              src="https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=600&h=600&fit=crop&q=95"
              alt="AirPods Pro"
              className="w-[280px] h-[280px] object-contain"
              style={{ filter: 'drop-shadow(0 40px 60px rgba(0,0,0,0.15))' }}
            />
          </m.div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-[32px] font-bold mb-2">Airpods Pro</h1>
            <h2 className="text-[32px] font-bold text-gray-600">2nd Generation</h2>
          </div>

          {/* Description */}
          <p className="text-center text-gray-500 text-[14px] leading-relaxed mb-10 px-4">
            AirPods Pro have been reengineered for even richer audio experiences. Next-level Active Noise Cancellation and Adaptive Transparency reduce more external noise.
          </p>

          {/* Get Started Button */}
          <button 
            onClick={() => setSelectedProduct(currentProduct)}
            className="w-full py-4 rounded-full bg-[#1A1A1A] text-white font-semibold text-[15px] flex items-center justify-center gap-3"
            data-testid="button-get-started"
          >
            Get Started
            <div className="flex items-center gap-1">
              <ChevronRight className="w-4 h-4" />
              <ChevronRight className="w-4 h-4 -ml-2 opacity-50" />
            </div>
          </button>
        </div>
      </div>
    );
  }

  // ========================================
  // CATALOG PAGE - Product Details (Light mode card style)
  // ========================================
  if (activeTab === 'catalog') {
    return (
      <div 
        className="min-h-screen text-[#1A1A1A] overflow-auto pb-24"
        style={{ background: 'linear-gradient(180deg, #F5F5F7 0%, #E8E8ED 100%)' }}
      >
        <div className="demo-nav-safe px-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <span className="font-semibold text-[15px]">Airpods Pro</span>
            </div>
          </div>

          {/* Greeting */}
          <div className="mb-6">
            <h1 className="text-[26px] font-bold">Hello, Shyed!</h1>
            <p className="text-gray-400 text-[14px]">Welcome back!</p>
          </div>

          {/* Product Card */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[28px] p-6 shadow-lg mb-6"
          >
            <p className="text-gray-400 text-[12px] mb-2">Apple Official</p>
            <h2 className="text-[24px] font-bold mb-1">Airpods Pro</h2>
            <p className="text-[24px] font-bold text-gray-500 mb-6">2nd Generation</p>

            {/* Product Image */}
            <div className="flex justify-center mb-6">
              <img
                src="https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=400&fit=crop&q=95"
                alt="AirPods Pro"
                className="w-[180px] h-[180px] object-contain"
              />
            </div>

            {/* Tagline */}
            <p className="text-center text-[18px] font-bold mb-1">100%</p>
            <p className="text-center text-gray-500 text-[14px] mb-6">Rebuilt from the sound up.</p>

            {/* Price and Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-gray-400" />
                <span className="font-bold text-[18px]">${currentProduct.price}</span>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center"
                  onClick={() => toggleFavorite(currentProduct.id)}
                  data-testid="button-favorite"
                >
                  <Heart className={`w-5 h-5 ${favorites.has(currentProduct.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                </button>
                <button 
                  className="w-11 h-11 rounded-full bg-gray-900 flex items-center justify-center"
                  onClick={() => addToCart(currentProduct)}
                  data-testid="button-add-cart"
                >
                  <ShoppingCart className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </m.div>

          {/* Generation Toggle */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setSelectedGeneration('1st')}
              className={`flex-1 py-3 rounded-full font-semibold text-[14px] ${
                selectedGeneration === '1st' 
                  ? 'bg-[#1A1A1A] text-white' 
                  : 'bg-gray-100 text-gray-600'
              }`}
              data-testid="button-gen-1"
            >
              1st Gene
            </button>
            <button
              onClick={() => setSelectedGeneration('2nd')}
              className={`flex-1 py-3 rounded-full font-semibold text-[14px] ${
                selectedGeneration === '2nd' 
                  ? 'bg-[#1A1A1A] text-white' 
                  : 'bg-gray-100 text-gray-600'
              }`}
              data-testid="button-gen-2"
            >
              2nd Gene
            </button>
            <button className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center">
              <Heart className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Feature Icons */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { icon: Volume2, label: 'Sound' },
              { icon: Settings, label: 'Settings' },
              { icon: Battery, label: 'Battery' },
              { icon: Bluetooth, label: 'Connect' }
            ].map((item, idx) => (
              <button
                key={idx}
                className={`aspect-square rounded-2xl flex items-center justify-center ${
                  idx === 0 ? 'bg-[#1A1A1A]' : 'bg-gray-100'
                }`}
              >
                <item.icon className={`w-6 h-6 ${idx === 0 ? 'text-white' : 'text-gray-600'}`} />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ========================================
  // CART PAGE - Buy Now (Dark mode)
  // ========================================
  if (activeTab === 'cart') {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white overflow-auto pb-24">
        <div className="demo-nav-safe px-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <span className="text-gray-400 text-[12px]">Apple Official</span>
            <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </button>
          </div>

          {/* Title */}
          <h1 className="text-[32px] font-bold mb-1">Airpods Pro</h1>
          <h2 className="text-[32px] font-bold text-gray-500 mb-8">2nd Generation</h2>

          {/* Product Image */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-8"
          >
            <img
              src="https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=600&h=600&fit=crop&q=95"
              alt="AirPods Pro"
              className="w-[260px] h-[260px] object-contain"
              style={{ filter: 'drop-shadow(0 20px 40px rgba(255,255,255,0.1))' }}
            />
          </m.div>

          {/* Tagline */}
          <div className="text-center mb-8">
            <p className="text-[24px] font-bold mb-1">100%</p>
            <p className="text-gray-400 text-[15px]">Rebuilt from the sound up.</p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 mb-6">
            <button 
              className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center"
              onClick={() => toggleFavorite(1)}
            >
              <Heart className={`w-5 h-5 ${favorites.has(1) ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
            <button 
              onClick={() => addToCart(currentProduct)}
              className="flex-1 py-4 rounded-full bg-white text-black font-semibold text-[15px]"
              data-testid="button-buy-now"
            >
              Buy Now
            </button>
          </div>

          {/* Cart Items */}
          {cart.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-[18px] font-bold mb-4">In Your Cart</h3>
              {cart.map((item, idx) => (
                <div 
                  key={idx}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white/5"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-contain"
                  />
                  <div className="flex-1">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-gray-400 text-[13px]">{item.generation}</p>
                  </div>
                  <p className="font-bold">${item.price}</p>
                </div>
              ))}
              
              <div className="pt-4 border-t border-white/10 mt-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400">Total</span>
                  <span className="text-[24px] font-bold">
                    ${cart.reduce((sum, item) => sum + item.price, 0)}
                  </span>
                </div>
                <button 
                  className="w-full py-4 rounded-full bg-white text-black font-semibold text-[15px]"
                  data-testid="button-checkout"
                >
                  Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ========================================
  // PROFILE PAGE
  // ========================================
  if (activeTab === 'profile') {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white overflow-auto pb-24">
        <div className="demo-nav-safe px-5">
          {/* Apple ID Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
              <span className="text-[28px] font-bold">S</span>
            </div>
            <h2 className="text-[22px] font-bold">Shyed</h2>
            <p className="text-gray-400 text-[13px]">Apple ID</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white/5 rounded-2xl p-4 text-center">
              <p className="text-[24px] font-bold">{cart.length}</p>
              <p className="text-gray-400 text-[12px]">In Cart</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 text-center">
              <p className="text-[24px] font-bold">{favorites.size}</p>
              <p className="text-gray-400 text-[12px]">Wishlist</p>
            </div>
          </div>

          {/* Menu */}
          <div className="space-y-3">
            {[
              { icon: Package, label: 'Orders' },
              { icon: Heart, label: 'Wishlist' },
              { icon: Headphones, label: 'Support' },
              { icon: Settings, label: 'Settings' }
            ].map((item, idx) => (
              <button
                key={idx}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5"
              >
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="font-medium text-[15px] flex-1 text-left">{item.label}</span>
                <ChevronRight className="w-5 h-5 text-gray-500" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default memo(AirPodsPro);
