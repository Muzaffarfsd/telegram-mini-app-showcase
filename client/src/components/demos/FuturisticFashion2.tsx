import React, { useState } from 'react';
import { ArrowLeft, Search, ShoppingBag, Plus, Minus } from 'lucide-react';
import fashionImg1 from '@assets/stock_images/cyberpunk_fashion_ho_8df162c4.jpg';
import fashionImg2 from '@assets/stock_images/cyberpunk_fashion_ho_58c75d49.jpg';

export function FuturisticFashion2() {
  const [currentPage, setCurrentPage] = useState<'catalog' | 'product'>('catalog');
  const [quantity, setQuantity] = useState(1);

  const products = [
    { id: 1, name: 'Ludens M1', price: '$374.49', image: fashionImg1 },
    { id: 2, name: 'Ludens M2', price: '$398.99', image: fashionImg2 },
  ];

  return (
    <div className="h-screen bg-black text-white overflow-y-auto">
      {currentPage === 'catalog' ? (
        <div className="p-6">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 border border-white/30 rounded flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
              </div>
              <span className="text-sm font-bold">STORE</span>
            </div>
            <Search size={20} className="text-white/60" />
          </div>

          <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
            <button className="text-sm font-medium whitespace-nowrap border-b-2 border-white pb-1">
              All Products
            </button>
            <button className="text-sm text-white/40 whitespace-nowrap">
              Apparel
            </button>
            <button className="text-sm text-white/40 whitespace-nowrap">
              Accessories
            </button>
            <button className="text-sm text-white/40 whitespace-nowrap">
              Footwear
            </button>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Popular Toys</h2>
              <button className="text-xs text-white/60">View All</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  onClick={() => setCurrentPage('product')}
                  className="bg-[#111] rounded-2xl overflow-hidden border border-white/10 hover:border-white/30 transition-all cursor-pointer"
                >
                  <div className="aspect-square bg-[#1a1a1a] p-4 relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-xl"
                    />
                    <button className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center">
                      <span className="text-black text-lg">→</span>
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-medium mb-1">{product.name}</h3>
                    <p className="text-xs text-white/40 mb-2">{product.price}</p>
                    <button className="text-xs text-white/60 flex items-center gap-1">
                      <span>♡</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Popular Objets</h2>
              <button className="text-xs text-white/60">View All</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#111] rounded-2xl p-4 border border-white/10">
                <div className="aspect-square bg-[#1a1a1a] rounded-xl mb-3" />
                <h3 className="text-sm font-medium mb-1">Watch M-80C</h3>
                <p className="text-xs text-white/40">$ 424.00</p>
              </div>
              <div className="bg-[#111] rounded-2xl p-4 border border-yellow-500/50 relative">
                <div className="aspect-square bg-yellow-400/20 rounded-xl mb-3 flex items-center justify-center">
                  <span className="text-4xl">🔑</span>
                </div>
                <h3 className="text-sm font-medium mb-1">Diamond Key</h3>
                <p className="text-xs text-white/40">$ 14.49</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-full flex flex-col">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <button onClick={() => setCurrentPage('catalog')}>
                <div className="flex items-center gap-2">
                  <ArrowLeft size={20} />
                  <span className="text-sm">BACK</span>
                </div>
              </button>
              <Search size={20} className="text-white/60" />
            </div>

            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold mb-2">NEWWAVE JUMBO</h1>
              <h2 className="text-xl mb-1">LUDENS M1 (WHITE)</h2>
            </div>

            <div className="bg-[#111] rounded-3xl p-8 mb-6 relative">
              <img
                src={fashionImg1}
                alt="Product"
                className="w-full h-96 object-cover rounded-2xl"
              />
              <div className="absolute left-0 right-0 bottom-12 flex justify-center gap-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-16 h-20 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20"
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <span className="text-sm text-white/60">SIZE</span>
                <span className="text-sm font-bold">01</span>
              </div>
              <div className="flex items-center gap-3 bg-[#111] rounded-full px-4 py-2">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                  <Minus size={16} />
                </button>
                <span className="text-sm font-bold w-8 text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}>
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <span className="text-3xl font-bold">$374.49</span>
              <button className="px-8 py-4 bg-white text-black rounded-full font-bold text-sm hover:bg-white/90 transition-colors">
                Add to Cart
              </button>
            </div>

            <div>
              <h3 className="text-sm font-bold mb-3">DETAIL</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Microencapsulation is a technique by which minimal portions of an active principle gas liquid solid are covered by an envelope of inert materials that protects said active principle from the environment that surrounds it.
              </p>
            </div>

            <button className="fixed bottom-6 right-6 w-14 h-14 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
              <ShoppingBag size={20} className="text-black" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
