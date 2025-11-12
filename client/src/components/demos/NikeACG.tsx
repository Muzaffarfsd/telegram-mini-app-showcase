import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Circle, ChevronUp, ChevronDown } from "lucide-react";
import fashionImage from '@assets/stock_images/futuristic_fashion_m_4203db1e.jpg';
import techwearImage from '@assets/stock_images/futuristic_techwear__737df842.jpg';

interface NikeACGProps {
  activeTab: 'home' | 'catalog' | 'cart' | 'profile';
}

const cards = [
  {
    id: 1,
    title: 'ENTER TO FUTURE',
    subtitle: '',
    bgColor: '#000000',
    textColor: '#FFFFFF',
    image: fashionImage,
    type: 'hero'
  },
  {
    id: 2,
    title: 'ONE MORE STEP',
    subtitle: 'ACG TRAIL PANTS',
    bgColor: '#FFFFFF',
    textColor: '#2D3748',
    image: techwearImage,
    type: 'product'
  },
  {
    id: 3,
    title: '075',
    subtitle: 'JACKET',
    bgColor: '#000000',
    textColor: '#FFFFFF',
    image: fashionImage,
    type: 'product'
  },
  {
    id: 4,
    title: 'ACG FULL',
    subtitle: 'システム',
    price: 799,
    description: 'All-conditions gear for outdoor exploration. Waterproof, breathable, and built to last.',
    bgColor: '#2D3748',
    textColor: '#FFFFFF',
    image: techwearImage,
    type: 'detail'
  },
  {
    id: 5,
    title: '005',
    subtitle: 'GLOVES',
    bgColor: '#000000',
    textColor: '#FFFFFF',
    image: fashionImage,
    type: 'product'
  }
];

function NikeACG({ activeTab }: NikeACGProps) {
  const [currentCard, setCurrentCard] = useState(0);

  const card = cards[currentCard];

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: card.bgColor }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentCard}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {card.type === 'detail' ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-12">
              <div className="max-w-4xl w-full grid grid-cols-2 gap-12">
                <div className="relative h-[600px] rounded-3xl overflow-hidden">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex flex-col justify-center">
                  <h1 className="text-7xl font-black mb-4" style={{ color: card.textColor }}>
                    {card.title}
                  </h1>
                  <p className="text-3xl font-light mb-8" style={{ color: card.textColor, opacity: 0.6 }}>
                    {card.subtitle}
                  </p>

                  <p className="text-lg mb-8" style={{ color: card.textColor, opacity: 0.8 }}>
                    {card.description}
                  </p>

                  <p className="text-6xl font-bold mb-12" style={{ color: card.textColor }}>
                    ${card.price}
                  </p>

                  <button className="bg-white text-black font-bold py-6 px-12 rounded-full hover:bg-gray-100 transition-all text-xl">
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full">
              <div className="absolute inset-0">
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover"
                  style={{ opacity: 0.7 }}
                />
              </div>

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <h1
                    className="text-[120px] font-black leading-none mb-4"
                    style={{
                      color: card.textColor,
                      textShadow: '0 10px 30px rgba(0,0,0,0.3)'
                    }}
                  >
                    {card.title}
                  </h1>
                  {card.subtitle && (
                    <p
                      className="text-4xl font-light tracking-widest"
                      style={{ color: card.textColor, opacity: 0.8 }}
                    >
                      {card.subtitle}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="absolute left-8 top-1/2 transform -translate-y-1/2 flex flex-col gap-4">
        <button
          onClick={() => setCurrentCard(Math.max(0, currentCard - 1))}
          disabled={currentCard === 0}
          className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 hover:bg-white/30 transition-all disabled:opacity-30"
        >
          <ChevronUp className="w-6 h-6" style={{ color: card.textColor }} />
        </button>

        <div className="flex flex-col gap-2">
          {cards.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentCard(idx)}
              className={`w-3 h-3 rounded-full transition-all ${
                idx === currentCard
                  ? 'bg-white scale-125'
                  : 'bg-white/30'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => setCurrentCard(Math.min(cards.length - 1, currentCard + 1))}
          disabled={currentCard === cards.length - 1}
          className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 hover:bg-white/30 transition-all disabled:opacity-30"
        >
          <ChevronDown className="w-6 h-6" style={{ color: card.textColor }} />
        </button>
      </div>

      <div className="absolute bottom-8 right-8">
        <p className="text-sm font-mono" style={{ color: card.textColor, opacity: 0.6 }}>
          {(currentCard + 1).toString().padStart(2, '0')} / {cards.length.toString().padStart(2, '0')}
        </p>
      </div>
    </div>
  );
}

export default NikeACG;
