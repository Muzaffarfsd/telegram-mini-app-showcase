import React, { useState } from 'react';
import { ArrowLeft, ShoppingCart, Heart, User, Menu } from 'lucide-react';
import fashionImg1 from '@assets/stock_images/futuristic_techwear__e958e42c.jpg';
import fashionImg2 from '@assets/stock_images/futuristic_techwear__832ae961.jpg';

export function FuturisticFashion1() {
  const [currentPage, setCurrentPage] = useState<'home' | 'catalog'>('home');

  return (
    <div className="min-h-screen bg-[#1a2e2a] overflow-hidden relative">
      {currentPage === 'home' ? (
        <div className="h-full relative">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `linear-gradient(to bottom, rgba(26, 46, 42, 0.3), rgba(26, 46, 42, 0.7)), url(${fashionImg1})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
          
          <div className="relative z-10 h-full flex flex-col p-6">
            <div className="flex justify-between items-center mb-8">
              <svg className="w-16 h-8" viewBox="0 0 64 32" fill="none">
                <path d="M8 8C8 8 16 16 24 8C32 0 40 16 48 8" stroke="#7FB069" strokeWidth="3" strokeLinecap="round"/>
              </svg>
              <div className="flex gap-3">
                <button className="w-10 h-10 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                  <User size={18} className="text-white" />
                </button>
                <button className="w-10 h-10 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                  <Menu size={18} className="text-white" />
                </button>
              </div>
            </div>

            <div className="mt-auto">
              <p className="text-[#7FB069] text-sm font-medium mb-2">
                Hello Explorer
              </p>
              <p className="text-white/60 text-xs mb-6">
                Curated by FASHIONLAB
              </p>
              
              <div className="flex items-end justify-between mb-8">
                <div>
                  <h1 className="text-6xl font-bold text-white tracking-tight mb-2">
                    Rascal®
                  </h1>
                  <p className="text-white/80 text-lg">
                    Waterproof jackets
                  </p>
                </div>
                <div className="bg-black px-4 py-2 rounded-full">
                  <span className="text-white text-xs font-bold">NEW</span>
                </div>
              </div>

              <div className="bg-[#7FB069]/20 backdrop-blur-md rounded-3xl p-4 mb-6 border border-[#7FB069]/30">
                <svg className="w-12 h-12 mx-auto mb-2" viewBox="0 0 48 48" fill="none">
                  <path d="M24 8C24 8 28 12 32 8C36 4 40 12 44 8" stroke="#7FB069" strokeWidth="2"/>
                </svg>
                <div className="flex items-center justify-center gap-2 bg-[#1a2e2a] rounded-2xl px-4 py-2">
                  <span className="text-[#7FB069] text-xs font-medium">RASCAL®</span>
                  <span className="text-white/60 text-xs">Pre-consumer & waterproof</span>
                </div>
              </div>

              <button
                onClick={() => setCurrentPage('catalog')}
                className="w-full bg-[#7FB069] text-white py-4 rounded-2xl font-semibold text-lg hover:bg-[#6fa059] transition-colors"
              >
                EXPLORE
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-full bg-[#1a2e2a]">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <button onClick={() => setCurrentPage('home')}>
                <ArrowLeft className="text-white" size={24} />
              </button>
              <h2 className="text-white text-xl font-bold">Collection</h2>
              <button>
                <ShoppingCart className="text-white" size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="relative h-96 rounded-3xl overflow-hidden group">
                <img
                  src={fashionImg1}
                  alt="Fashion item"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex justify-between items-end">
                    <div>
                      <h3 className="text-3xl font-bold text-white mb-2">Hello</h3>
                      <p className="text-[#7FB069] text-sm font-medium">Beyond your world</p>
                    </div>
                    <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                      <Heart size={20} className="text-[#1a2e2a]" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-[#7FB069]/10 backdrop-blur-md rounded-3xl p-6 border border-[#7FB069]/20">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">67%</h3>
                    <p className="text-white/60 text-sm">
                      67% - that's how much we managed to reduce the production of new textiles.
                    </p>
                  </div>
                </div>
                <button className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-full text-white text-sm font-medium border border-white/20 hover:bg-white/20 transition-colors">
                  Learn more about Rascal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FuturisticFashion1;
