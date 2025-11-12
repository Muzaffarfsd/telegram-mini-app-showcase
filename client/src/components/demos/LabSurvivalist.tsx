import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

interface LabSurvivalistProps {
  activeTab: 'home' | 'catalog' | 'cart' | 'profile';
}

const lookbookItems = [
  {
    id: 1,
    image: '/attached_assets/stock_images/futuristic_fashion_m_331bf630.jpg',
    title: 'Field Vest',
    color: 'Olive'
  },
  {
    id: 2,
    image: '/attached_assets/stock_images/futuristic_fashion_m_b5d87157.jpg',
    title: 'Tactical Jacket',
    color: 'Black'
  },
  {
    id: 3,
    image: '/attached_assets/stock_images/futuristic_fashion_m_331bf630.jpg',
    title: 'Cargo Pants',
    color: 'Gray'
  }
];

function LabSurvivalist({ activeTab }: LabSurvivalistProps) {
  const [screen, setScreen] = useState<'dark' | 'light'>('dark');
  const [currentItem, setCurrentItem] = useState(0);

  if (screen === 'dark') {
    return (
      <div className="h-full bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div 
                className="w-[500px] h-[500px] rounded-full border-[40px] border-white"
                style={{ borderColor: 'white' }}
              />
            </div>

            <div className="relative w-[400px] h-[400px] rounded-full overflow-hidden">
              <img
                src="/attached_assets/stock_images/futuristic_fashion_m_331bf630.jpg"
                alt="Model"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </div>

        <div className="absolute top-12 left-12">
          <p className="text-white/40 text-sm font-mono mb-2">001</p>
        </div>

        <div className="absolute left-12 top-1/2 transform -translate-y-1/2">
          <h1 className="text-[80px] font-black tracking-tighter leading-none mb-4">
            SURVIVALIST
          </h1>
          <h2 className="text-[60px] font-light tracking-widest text-white/60">
            EXPLORE
          </h2>
        </div>

        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2">
          <button
            onClick={() => setScreen('light')}
            className="flex flex-col items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <span className="text-sm font-mono tracking-wider">SCROLL</span>
            <ChevronDown className="w-6 h-6 animate-bounce" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white text-black relative overflow-hidden">
      <div className="p-12">
        <div className="mb-12">
          <h1 className="text-6xl font-black tracking-tighter mb-2">LOOK BOOK</h1>
          <p className="text-black/40 font-mono text-sm">SURVIVALIST COLLECTION</p>
        </div>

        <div className="relative mb-12">
          <div className="w-full h-[500px] bg-black/5 rounded-3xl overflow-hidden">
            <img
              src={lookbookItems[currentItem].image}
              alt={lookbookItems[currentItem].title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="absolute top-8 right-8 bg-white px-4 py-2 rounded-full shadow-lg">
            <p className="font-mono font-bold">
              {(currentItem + 1).toString().padStart(2, '0')}/08
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">{lookbookItems[currentItem].title}</h2>
          <p className="text-black/60">Color: {lookbookItems[currentItem].color}</p>
        </div>

        <div className="relative">
          <div className="flex gap-6 overflow-x-auto pb-4">
            {lookbookItems.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => setCurrentItem(idx)}
                className={`flex-shrink-0 w-48 h-64 rounded-2xl overflow-hidden cursor-pointer transition-all ${
                  idx === currentItem ? 'ring-4 ring-black' : 'opacity-50 hover:opacity-100'
                }`}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentItem(Math.max(0, currentItem - 1))}
                className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentItem(Math.min(lookbookItems.length - 1, currentItem + 1))}
                className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-black/40 font-mono">
              SWIPE →
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LabSurvivalist;
