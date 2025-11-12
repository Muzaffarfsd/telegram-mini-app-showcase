import React, { useState } from 'react';
import { Menu, Heart, ShoppingBag } from 'lucide-react';
import fashionImg1 from '@assets/stock_images/futuristic_fashion_m_331bf630.jpg';
import fashionImg2 from '@assets/stock_images/futuristic_fashion_m_472b5d38.jpg';

export function FuturisticFashion3() {
  const [currentPage, setCurrentPage] = useState<'home' | 'lookbook'>('home');

  return (
    <div className="h-screen overflow-hidden">
      {currentPage === 'home' ? (
        <div className="h-full bg-black text-white relative overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-12">
              <h1 className="text-2xl font-light">
                lab<span className="text-2xl">°</span>
              </h1>
              <div className="flex gap-4">
                <button>
                  <Menu size={24} className="text-white" />
                </button>
                <div className="text-sm">
                  <span className="font-light">BAG </span>
                  <span className="font-bold">0</span>
                </div>
              </div>
            </div>

            <div className="relative h-[600px] flex items-center justify-center mb-8">
              <div className="absolute w-80 h-80 border border-white/20 rounded-full" />
              <div 
                className="w-72 h-[500px] bg-cover bg-center rounded-3xl"
                style={{
                  backgroundImage: `url(${fashionImg1})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
              <div className="absolute top-0 right-0 text-right">
                <div className="text-xs text-white/40 mb-2">001</div>
                <div className="flex flex-col gap-1">
                  <div className="w-16 h-0.5 bg-white" />
                  <div className="w-16 h-0.5 bg-white/20" />
                  <div className="w-16 h-0.5 bg-white/20" />
                </div>
              </div>
            </div>

            <div className="text-center mb-12">
              <h2 className="text-5xl font-light mb-4 tracking-wider">
                SURVIVALIST
              </h2>
              <button 
                onClick={() => setCurrentPage('lookbook')}
                className="text-sm border border-white/20 px-8 py-3 rounded-full hover:bg-white hover:text-black transition-colors"
              >
                EXPLORE
              </button>
            </div>

            <div className="bg-[#111] rounded-3xl p-6 mb-6 flex items-center gap-4">
              <div className="w-20 h-20 bg-white/10 rounded-xl" />
              <div>
                <p className="text-xs text-white/40 mb-2">
                  FOR AUTHENTIFICATION OF LAB° UNVEIL SUMMER 2025 COLLECTION AND PROTECTION KEEP UNDER ALL NIGHT CONDITION
                </p>
                <div className="text-right text-xs text-white/60">01/08</div>
              </div>
            </div>

            <div className="text-center mb-8">
              <p className="text-sm text-white/60">SCROLL</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-full bg-white text-black overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-12">
              <h1 className="text-2xl font-light">
                lab<span className="text-2xl">°</span>
              </h1>
              <div className="flex gap-4">
                <button>
                  <Menu size={24} />
                </button>
                <div className="text-sm">
                  <span className="font-light">BAG </span>
                  <span className="font-bold">0</span>
                </div>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-5xl font-light mb-2 tracking-wider">
                LOOK<br />
                <span className="text-black/30">BOOK</span>
              </h2>
              <p className="text-sm text-black/60 mb-4">
                Engineered to withstand<br />
                all climates.
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-black/40">SS20</span>
                <div className="flex-1 mx-4 h-px bg-black/20" />
                <span className="text-black/40">FW21</span>
                <div className="w-16 ml-4 h-px bg-black/80" />
                <span className="font-bold ml-4">NEW</span>
              </div>
            </div>

            <div className="relative h-[600px] mb-8">
              <div
                className="absolute inset-0 bg-cover bg-center rounded-3xl"
                style={{
                  backgroundImage: `url(${fashionImg2})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
              <button className="absolute top-6 left-6 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                <Heart size={20} />
              </button>
              <div className="absolute top-6 right-6 text-xs text-white/60">
                01/08
              </div>
              <div className="absolute bottom-6 left-0 right-0 px-6">
                <div className="flex gap-3 mb-4">
                  {[fashionImg1, fashionImg2, fashionImg1].map((img, i) => (
                    <div
                      key={i}
                      className="w-20 h-24 bg-cover bg-center rounded-xl border-2 border-white/50"
                      style={{ backgroundImage: `url(${img})` }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="text-center mb-8">
              <p className="text-sm text-black/60">SWIPE</p>
            </div>

            <button className="fixed bottom-6 right-6 w-14 h-14 bg-black rounded-full flex items-center justify-center shadow-lg">
              <ShoppingBag size={20} className="text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
