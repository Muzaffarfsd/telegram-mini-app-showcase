import React, { useState } from 'react';
import { ArrowLeft, Search, Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import fashionImg1 from '@assets/stock_images/cyberpunk_fashion_ho_b350f945.jpg';
import fashionImg2 from '@assets/stock_images/cyberpunk_fashion_ho_663ed3c4.jpg';
import fashionImg3 from '@assets/stock_images/cyberpunk_fashion_ho_1d2ca716.jpg';

export function FuturisticFashion5() {
  const [currentPage, setCurrentPage] = useState<'login' | 'catalog' | 'product'>('login');
  const [selectedSize, setSelectedSize] = useState('42');

  return (
    <div className="h-screen bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
      {currentPage === 'login' ? (
        <div className="h-full flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-[40px] overflow-hidden shadow-2xl">
            <div className="relative h-[700px]">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(255,255,255,0.9)), url(${fashionImg1})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
              <div className="relative z-10 h-full flex flex-col p-8">
                <div className="mt-auto">
                  <h1 className="text-4xl font-bold mb-2">
                    NEWW<span className="text-purple-500">A</span>VE<br />
                    TECHWEAR
                  </h1>
                  
                  <div className="mt-12 space-y-4">
                    <button className="w-full py-4 bg-gray-900 text-white rounded-2xl font-semibold hover:bg-gray-800 transition-colors">
                      Login
                    </button>
                    <button
                      onClick={() => setCurrentPage('catalog')}
                      className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-semibold hover:opacity-90 transition-opacity"
                    >
                      Sign Up
                    </button>
                  </div>

                  <div className="mt-6 flex items-center gap-2 text-sm">
                    <input type="checkbox" className="w-4 h-4 rounded accent-purple-500" />
                    <span className="text-gray-600">Trust restreaming</span>
                  </div>

                  <button className="mt-4 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                    Continue As A Guest
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : currentPage === 'catalog' ? (
        <div className="h-full bg-gradient-to-b from-[#2a2838] to-[#1a1828] text-white overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-8">
              <button>
                <div className="w-8 h-8 border border-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-xs">☰</span>
                </div>
              </button>
              <h1 className="text-xl font-bold">
                NEWW<span className="text-purple-400">A</span>VE TECHWEAR
              </h1>
              <Search size={20} />
            </div>

            <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
              <button className="text-sm whitespace-nowrap bg-white/10 px-4 py-2 rounded-full">
                New Releases
              </button>
              <button className="text-sm whitespace-nowrap text-white/60">
                Most Viewed
              </button>
            </div>

            <div className="space-y-4">
              <div
                onClick={() => setCurrentPage('product')}
                className="relative h-80 rounded-3xl overflow-hidden cursor-pointer group"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  style={{
                    backgroundImage: `linear-gradient(to bottom, rgba(42,40,56,0.2), rgba(42,40,56,0.8)), url(${fashionImg2})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
                <div className="absolute top-4 left-4">
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-3 py-1 border border-white/20">
                    <span className="text-xs">🔥 10 Items</span>
                  </div>
                </div>
                <div className="absolute bottom-4 left-4">
                  <h2 className="text-2xl font-bold mb-1">The Winter</h2>
                  <p className="text-sm text-white/60">Puffer</p>
                </div>
                <button className="absolute bottom-4 right-4 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                  <ArrowRight size={20} />
                </button>
              </div>

              <div className="relative h-64 rounded-3xl overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `linear-gradient(135deg, rgba(147,51,234,0.6), rgba(236,72,153,0.6)), url(${fashionImg3})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
                <div className="absolute top-4 left-4">
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-3 py-1 border border-white/20">
                    <span className="text-xs">💎 22 Items</span>
                  </div>
                </div>
                <button className="absolute bottom-4 right-4 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-full bg-gradient-to-br from-purple-50 to-pink-50 overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <button onClick={() => setCurrentPage('catalog')}>
                <ArrowLeft size={24} className="text-gray-900" />
              </button>
              <div className="flex gap-3">
                <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
                  <Heart size={18} />
                </button>
                <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
                  <ShoppingBag size={18} />
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl overflow-hidden mb-6 shadow-xl">
              <div className="relative h-96">
                <img
                  src={fashionImg2}
                  alt="Product"
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs text-gray-500 mb-1 block">40</span>
                    <h2 className="text-2xl font-bold mb-1">CUTTING EDGE</h2>
                    <h3 className="text-xl text-gray-600">PONCHO</h3>
                  </div>
                  <div className="flex gap-1">
                    {['40', '42', '44', '46'].map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-10 h-10 rounded-lg font-medium text-sm ${
                          selectedSize === size
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-6">
                  by The Wear
                </p>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-500">Price</span>
                    <p className="text-3xl font-bold">£5000</p>
                  </div>
                  <button className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity">
                    Buy Now
                    <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2">
              <div className="w-16 h-1 bg-purple-500 rounded-full" />
              <div className="w-8 h-1 bg-gray-300 rounded-full" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FuturisticFashion5;
