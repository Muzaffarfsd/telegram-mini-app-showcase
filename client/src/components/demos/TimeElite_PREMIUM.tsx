import { useState, useEffect } from "react";
import { scrollToTop } from "@/hooks/useScrollToTop";
import { Heart, Star, X, Sparkles, Crown, Award } from "lucide-react";
import { OptimizedImage } from "../OptimizedImage";
import { useImagePreloader } from "../../hooks/useImagePreloader";

interface TimeEliteProps {
  activeTab: 'home' | 'catalog' | 'cart' | 'profile';
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

const products = [
  { id: 1, name: 'Rolex Submariner', price: 12500, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format,compress&fm=webp&q=75&w=800', description: 'Легендарные швейцарские часы для дайвинга с автоматическим механизмом', brand: 'Rolex', category: 'Дайверские', movement: 'Automatic', waterResist: '300m', material: 'Нержавеющая сталь 904L', diameter: '41mm', inStock: 3, rating: 5.0 },
  { id: 2, name: 'Omega Speedmaster', price: 8900, image: 'https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?auto=format,compress&fm=webp&q=75&w=800', description: 'Легендарные лунные часы NASA с хронографом', brand: 'Omega', category: 'Хронографы', movement: 'Manual', waterResist: '50m', material: 'Нержавеющая сталь', diameter: '42mm', inStock: 5, rating: 4.9 },
  { id: 3, name: 'Patek Philippe Nautilus', price: 45000, image: 'https://images.unsplash.com/photo-1587836374062-d60746f9f518?auto=format,compress&fm=webp&q=75&w=800', description: 'Эксклюзивные спортивно-элегантные часы из коллекции Nautilus', brand: 'Patek Philippe', category: 'Классические', movement: 'Automatic', waterResist: '120m', material: 'Платина', diameter: '40mm', inStock: 1, rating: 5.0 },
  { id: 4, name: 'Audemars Piguet Royal Oak', price: 38000, image: 'https://images.unsplash.com/photo-1611078031785-f8ab1d3ed0dc?auto=format,compress&fm=webp&q=75&w=800', description: 'Икон��ческие часы с восьмиугольным безелем', brand: 'Audemars Piguet', category: 'Классические', movement: 'Automatic', waterResist: '50m', material: 'Розовое золото', diameter: '41mm', inStock: 2, rating: 5.0 },
  { id: 5, name: 'Cartier Santos', price: 7200, image: 'https://images.unsplash.com/photo-1622434641406-a158123450f9?auto=format,compress&fm=webp&q=75&w=800', description: 'Элегантные часы с квадратным корпусом и римскими цифрами', brand: 'Cartier', category: 'Классические', movement: 'Automatic', waterResist: '100m', material: 'Сталь и золото', diameter: '39mm', inStock: 4, rating: 4.8 },
  { id: 6, name: 'TAG Heuer Carrera', price: 5500, image: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format,compress&fm=webp&q=75&w=800', description: 'Спортивный хронограф вдохновленный автогонками', brand: 'TAG Heuer', category: 'Хронографы', movement: 'Automatic', waterResist: '100m', material: 'Нержавеющая сталь', diameter: '43mm', inStock: 6, rating: 4.7 },
];

const categories = ['Все', 'Rolex', 'Omega', 'Patek Philippe', 'Cartier', 'Audemars Piguet'];

export default function TimeElite({ activeTab }: TimeEliteProps) {
  const [selectedProduct, setSelectedProduct] = useState<typeof products[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [favorites, setFavorites] = useState<number[]>([1, 3]);

  useImagePreloader({
    images: products.slice(0, 6).map(p => p.image),
    priority: true
  });

  useEffect(() => {
    scrollToTop();
  }, [activeTab]);

  const openProductModal = (product: typeof products[0]) => {
    scrollToTop();
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeProductModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedProduct(null), 300);
  };

  const addToCart = () => {
    if (!selectedProduct) return;
    const newItem: CartItem = {
      id: selectedProduct.id,
      name: selectedProduct.name,
      price: selectedProduct.price,
      quantity: 1,
      image: selectedProduct.image
    };
    setCartItems(prev => [...prev, newItem]);
    closeProductModal();
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
    : products.filter(p => p.brand === selectedCategory);

  // PREMIUM HOME PAGE
  const renderHomeTab = () => (
    <div className="min-h-screen bg-black font-montserrat pb-24 overflow-hidden">
      {/* Premium Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-amber-900/20 via-black to-yellow-900/20 pointer-events-none"></div>
      
      <div className="relative max-w-md mx-auto">
        {/* Luxury Header */}
        <div className="text-center px-6 pt-12 pb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 rounded-full mb-6 shadow-2xl shadow-yellow-500/50">
            <Crown className="w-12 h-12 text-black" strokeWidth={2.5} />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-200 via-amber-100 to-yellow-200 bg-clip-text text-transparent mb-3 tracking-tight">
            TimeElite
          </h1>
          <p className="text-amber-200/80 text-sm font-semibold">Luxury Swiss Timepieces</p>
        </div>

        {/* Hero Section - Large Image */}
        <div className="px-6 mb-12">
          <div className="relative rounded-3xl overflow-hidden group cursor-pointer" onClick={() => openProductModal(products[0])}>
            <div className="aspect-[4/5] bg-gradient-to-br from-gray-900 to-black">
              <OptimizedImage 
                src={products[0].image}
                alt={products[0].name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                priority
              />
            </div>
            {/* Glass Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent">
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-5 h-5 text-yellow-400" />
                  <span className="text-yellow-400 text-xs font-bold">Featured Collection</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">{products[0].name}</h2>
                <p className="text-amber-100/80 mb-4">{products[0].description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-yellow-400">${products[0].price.toLocaleString()}</span>
                  <button className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-black rounded-full font-bold hover:shadow-2xl hover:shadow-yellow-500/50 transition-all duration-300">
                    Explore
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Brands */}
        <div className="px-6 mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Exclusive Brands</h2>
          <div className="grid grid-cols-2 gap-4">
            {['Rolex', 'Patek Philippe', 'Omega', 'Cartier'].map((brand) => (
              <button
                key={brand}
                onClick={() => setSelectedCategory(brand)}
                className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 hover:bg-white/10 hover:border-yellow-500/50 transition-all duration-300"
                data-testid={`brand-${brand.toLowerCase().replace(' ', '-')}`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <Sparkles className="w-8 h-8 text-yellow-400 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="text-white font-bold mb-1">{brand}</h3>
                  <p className="text-amber-200/60 text-xs">Swiss Excellence</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Luxury Collection */}
        <div className="px-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Luxury Collection</h2>
            <Crown className="w-6 h-6 text-yellow-400" />
          </div>
          <div className="space-y-6">
            {products.slice(0, 3).map(product => (
              <div 
                key={product.id}
                onClick={() => openProductModal(product)}
                className="group relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 hover:border-yellow-500/50 transition-all duration-300 cursor-pointer"
                data-testid={`product-card-${product.id}`}
              >
                <div className="flex gap-6 p-6">
                  <div className="w-32 h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-black flex-shrink-0">
                    <OptimizedImage 
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      priority={product.id <= 3}
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded-full">{product.brand}</span>
                        {product.inStock <= 3 && (
                          <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded-full">Limited</span>
                        )}
                      </div>
                      <h3 className="text-white font-bold text-lg mb-2">{product.name}</h3>
                      <div className="flex items-center gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-yellow-400">${product.price.toLocaleString()}</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(product.id);
                        }}
                        className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                      >
                        <Heart className={`w-5 h-5 ${favorites.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                      </button>
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

  // PREMIUM CATALOG
  const renderCatalogTab = () => (
    <div className="min-h-screen bg-black font-montserrat pb-24">
      <div className="fixed inset-0 bg-gradient-to-br from-amber-900/20 via-black to-yellow-900/20 pointer-events-none"></div>
      
      {/* Sticky Pills */}
      <div className="sticky top-0 z-20 bg-black/80 backdrop-blur-2xl border-b border-white/10 py-5 px-4">
        <div className="max-w-md mx-auto">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-full whitespace-nowrap transition-all duration-300 font-semibold text-sm ${
                  selectedCategory === cat 
                    ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black shadow-lg shadow-yellow-500/50' 
                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
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
      <div className="relative max-w-md mx-auto px-4 py-6">
        <div className="mb-4">
          <p className="text-amber-200/60 text-sm">{filteredProducts.length} Timepieces Available</p>
        </div>
        <div className="grid grid-cols-1 gap-6">
          {filteredProducts.map(product => (
            <div 
              key={product.id}
              onClick={() => openProductModal(product)}
              className="group relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 hover:border-yellow-500/50 transition-all duration-300 cursor-pointer"
              data-testid={`product-${product.id}`}
            >
              <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br from-gray-900 to-black">
                <OptimizedImage 
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  priority={product.id <= 4}
                />
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(product.id);
                  }}
                  className="absolute top-4 right-4 w-12 h-12 bg-black/60 backdrop-blur-xl rounded-full flex items-center justify-center hover:bg-black/80 transition-all"
                >
                  <Heart className={`w-6 h-6 ${favorites.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                </button>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded-full">{product.brand}</span>
                  {product.inStock <= 3 && (
                    <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded-full">Only {product.inStock} left</span>
                  )}
                </div>
                <h3 className="text-white font-bold text-xl mb-2">{product.name}</h3>
                <p className="text-amber-200/60 text-sm mb-4 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-yellow-400">${product.price.toLocaleString()}</span>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // PREMIUM MODAL
  const renderProductModal = () => {
    if (!selectedProduct || !isModalOpen) return null;

    return (
      <div className="fixed inset-0 z-50 bg-black overflow-y-auto font-montserrat smooth-scroll-page">
        <div className="fixed inset-0 bg-gradient-to-br from-amber-900/20 via-black to-yellow-900/20"></div>
        
        <div className="relative max-w-md mx-auto">
          <button 
            onClick={closeProductModal}
            className="fixed top-6 right-6 z-10 w-14 h-14 bg-white/10 backdrop-blur-2xl rounded-full flex items-center justify-center hover:bg-white/20 transition-all border border-white/20"
            data-testid="button-close-modal"
          >
            <X className="w-7 h-7 text-white" strokeWidth={2} />
          </button>

          {/* Large Product Image */}
          <div className="relative aspect-square bg-gradient-to-br from-gray-900 to-black">
            <OptimizedImage 
              src={selectedProduct.image}
              alt={selectedProduct.name}
              className="w-full h-full object-cover"
              priority
            />
            <button 
              onClick={() => toggleFavorite(selectedProduct.id)}
              className="absolute top-6 left-6 w-14 h-14 bg-black/60 backdrop-blur-2xl rounded-full flex items-center justify-center hover:bg-black/80 transition-all border border-white/20"
            >
              <Heart className={`w-7 h-7 ${favorites.includes(selectedProduct.id) ? 'fill-red-500 text-red-500' : 'text-white'}`} />
            </button>
          </div>

          {/* Product Info */}
          <div className="p-8 space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="px-4 py-2 bg-yellow-500/20 text-yellow-400 text-sm font-bold rounded-full">{selectedProduct.brand}</span>
                {selectedProduct.inStock <= 3 && (
                  <span className="px-4 py-2 bg-red-500/20 text-red-400 text-sm font-bold rounded-full">Only {selectedProduct.inStock} Available</span>
                )}
              </div>
              <h1 className="text-4xl font-bold text-white mb-4 leading-tight">{selectedProduct.name}</h1>
              <div className="flex items-center justify-between mb-6">
                <span className="text-4xl font-bold text-yellow-400">${selectedProduct.price.toLocaleString()}</span>
                <div className="flex items-center gap-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-amber-200 ml-2">({selectedProduct.rating})</span>
                </div>
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

            <div>
              <h3 className="text-white font-bold text-lg mb-3">Description</h3>
              <p className="text-amber-200/80 leading-relaxed">{selectedProduct.description}</p>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

            <div>
              <h3 className="text-white font-bold text-lg mb-4">Specifications</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
                  <p className="text-amber-200/60 text-xs mb-1">Movement</p>
                  <p className="text-white font-semibold">{selectedProduct.movement}</p>
                </div>
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
                  <p className="text-amber-200/60 text-xs mb-1">Water Resistance</p>
                  <p className="text-white font-semibold">{selectedProduct.waterResist}</p>
                </div>
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
                  <p className="text-amber-200/60 text-xs mb-1">Material</p>
                  <p className="text-white font-semibold">{selectedProduct.material}</p>
                </div>
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
                  <p className="text-amber-200/60 text-xs mb-1">Diameter</p>
                  <p className="text-white font-semibold">{selectedProduct.diameter}</p>
                </div>
              </div>
            </div>

            <button 
              onClick={addToCart}
              className="w-full py-5 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 text-black rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-yellow-500/50 transition-all duration-300 relative overflow-hidden group"
              data-testid="button-add-to-cart"
            >
              <span className="relative z-10">Add to Collection</span>
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Cart & Profile (simplified for demo)
  const renderCartTab = () => (
    <div className="min-h-screen bg-black font-montserrat pb-24">
      <div className="max-w-md mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-white mb-6">Your Collection</h1>
        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <Crown className="w-16 h-16 text-yellow-400/50 mx-auto mb-4" />
            <p className="text-amber-200/60">No timepieces added yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cartItems.map(item => (
              <div key={item.id} className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
                <h3 className="text-white font-bold">{item.name}</h3>
                <p className="text-yellow-400 font-bold">${item.price.toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderProfileTab = () => (
    <div className="min-h-screen bg-black font-montserrat pb-24">
      <div className="max-w-md mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-white mb-6">Profile</h1>
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-3xl font-bold text-black">VIP</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Luxury Member</h2>
          <p className="text-amber-200/60">collector@timeelite.com</p>
        </div>
      </div>
    </div>
  );

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
