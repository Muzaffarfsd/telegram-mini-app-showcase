import React, { useState } from 'react';
import { ArrowRight, Grid, Camera } from 'lucide-react';
import fashionImg1 from '@assets/stock_images/futuristic_fashion_m_4203db1e.jpg';
import fashionImg2 from '@assets/stock_images/futuristic_fashion_m_e4c35291.jpg';
import fashionImg3 from '@assets/stock_images/futuristic_fashion_m_518587e3.jpg';

export function FuturisticFashion4() {
  const [activeCard, setActiveCard] = useState(1);

  const cards = [
    {
      id: 1,
      title: 'ENTER\nTO FUTURE',
      image: fashionImg1,
      code: '001',
      icons: ['👤', '💎', '🔧', '⚡']
    },
    {
      id: 2,
      title: 'ONE MORE\nSTEP',
      subtitle: 'ACG',
      image: fashionImg2,
      code: '002',
      icons: ['•', '•', '•']
    },
    {
      id: 3,
      title: 'O75 JACKET',
      subtitle: 'ELVES',
      image: fashionImg3,
      code: '003',
      icons: ['•', '•']
    }
  ];

  return (
    <div className="h-screen bg-black text-white overflow-hidden">
      <div className="h-full flex items-center justify-center p-4">
        <div className="relative w-full max-w-md">
          {cards.map((card, index) => (
            <div
              key={card.id}
              className={`absolute inset-0 transition-all duration-700 ${
                activeCard === card.id
                  ? 'z-30 scale-100 opacity-100'
                  : activeCard === card.id - 1
                  ? 'z-20 scale-95 opacity-50 -translate-x-10'
                  : activeCard === card.id + 1
                  ? 'z-10 scale-95 opacity-50 translate-x-10'
                  : 'opacity-0 scale-90'
              }`}
              style={{
                transform: activeCard !== card.id
                  ? `translateX(${(index - cards.findIndex(c => c.id === activeCard)) * 50}px) scale(0.9)`
                  : undefined
              }}
            >
              <div className="relative h-[700px] rounded-[50px] overflow-hidden bg-gradient-to-b from-gray-900 to-black">
                <div className="absolute top-6 right-6 z-10">
                  <button className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                    <span className="text-xs">⋮</span>
                  </button>
                </div>

                <div className="absolute top-6 left-6 z-10">
                  <svg className="w-12 h-6" viewBox="0 0 48 24" fill="white">
                    <path d="M0 12c5.5 0 8.5-6 14-6s8.5 6 14 6 8.5-6 14-6 8.5 6 14 6" stroke="white" strokeWidth="2" fill="none"/>
                  </svg>
                </div>

                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url(${card.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />

                <div className="relative z-10 h-full flex flex-col justify-between p-8">
                  <div className="mt-auto">
                    <div className="mb-8">
                      <div className="flex gap-1 mb-4">
                        {card.icons.map((icon, i) => (
                          <div key={i} className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20 text-lg">
                            {icon}
                          </div>
                        ))}
                      </div>

                      <h2 className="text-4xl font-bold leading-tight whitespace-pre-line mb-2">
                        {card.title}
                      </h2>
                      {card.subtitle && (
                        <p className="text-xl text-white/60">{card.subtitle}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <button 
                        onClick={() => setActiveCard(card.id === 3 ? 1 : card.id + 1)}
                        className="w-16 h-16 bg-white rounded-full flex items-center justify-center group hover:scale-110 transition-transform"
                      >
                        <ArrowRight size={24} className="text-black" />
                      </button>
                      
                      <div className="flex items-center gap-3">
                        <button className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20">
                          <Grid size={16} />
                        </button>
                        <button className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20">
                          <Camera size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-8 right-8 text-xs text-white/40">
                  {card.code}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => setActiveCard(card.id)}
              className={`w-2 h-2 rounded-full transition-all ${
                activeCard === card.id ? 'bg-white w-8' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
