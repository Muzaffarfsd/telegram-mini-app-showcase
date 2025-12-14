import { Smartphone, Code, Zap, ArrowRight, Users, ShoppingCart } from "lucide-react";
import { Card3D } from './Card3D';
import { preloadDemo } from './demos/DemoRegistry';

interface BusinessCardsProps {
  onOpenDemo: (demoId: string) => void;
}

const businessApps = [
  {
    id: "luxury-watches",
    title: "CHRONOS Watch Store",
    subtitle: "Премиум часы 2025",
    description: "Роскошный магазин часов",
    categories: ["PREMIUM", "NEW", "LUXURY"],
    icon: Smartphone,
    stats: "2,453+ запущено",
    visual: "smartphone"
  },
  {
    id: "electronics", 
    title: "Интернет-магазин под ключ",
    description: "Продажи с первого дня",
    categories: ["E-COMMERCE", "HOT"],
    icon: ShoppingCart,
    visual: "cart"
  },
  {
    id: "beauty",
    title: "AI-помощник для бизнеса",
    description: "24/7 автоматизация",
    categories: ["AI", "AUTOMATION"],
    icon: Code,
    visual: "gear"
  }
];

export default function BusinessCards({ onOpenDemo }: BusinessCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 p-4">
      {/* Main Large Card */}
      <Card3D 
        className="col-span-2"
        onClick={() => onOpenDemo('luxury-watches')}
        intensity={10}
      >
      <div 
        className="relative bg-black rounded-3xl p-6 overflow-hidden cursor-pointer group transition-all duration-300"
        onMouseEnter={() => preloadDemo('luxury-watches')}
        onTouchStart={() => preloadDemo('luxury-watches')}
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 20%, rgba(77, 208, 225, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(77, 208, 225, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 40% 60%, rgba(77, 208, 225, 0.02) 0%, transparent 50%)
          `,
        }}
      >
        {/* Background Texture */}
        <div className="absolute inset-0 opacity-40" style={{
          backgroundImage: `
            radial-gradient(circle at 1px 1px, rgba(77, 208, 225, 0.15) 1px, transparent 0)
          `,
          backgroundSize: '30px 30px'
        }}></div>
        
        {/* Categories Pills */}
        <div className="relative z-10 flex flex-wrap gap-2 mb-4">
          {businessApps[0].categories.map((cat, index) => (
            <span key={index} className="px-3 py-1 bg-white/10 text-white text-xs font-medium rounded-full border border-white/20">
              {cat}
            </span>
          ))}
        </div>

        {/* Main Content */}
        <div className="relative z-10">
          <h2 className="text-white text-2xl font-bold mb-2 leading-tight">
            {businessApps[0].title}
          </h2>
          <h3 className="text-[#D4AF37] text-xl font-semibold mb-4">
            {businessApps[0].subtitle}
          </h3>
          
          <div className="flex items-end justify-between">
            <div>
              <p className="text-white/80 text-sm mb-2">{businessApps[0].description}</p>
              <div className="text-white text-lg font-bold">{businessApps[0].stats}</div>
            </div>
            
            {/* 3D Visual Element */}
            <div className="relative">
              <div 
                className="w-20 h-20 rounded-full bg-gradient-to-br from-[#4DD0E1] to-[#26C6DA] flex items-center justify-center shadow-lg"
                style={{
                  transform: 'perspective(100px) rotateX(10deg) rotateY(-10deg)',
                  boxShadow: '0 20px 40px rgba(77, 208, 225, 0.3), inset 0 2px 8px rgba(255,255,255,0.3)'
                }}
              >
                <Smartphone className="w-8 h-8 text-black" />
              </div>
            </div>
          </div>
        </div>

        {/* Arrow Indicator */}
        <div className="absolute top-4 right-4">
          <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-[#4DD0E1] transition-colors" />
        </div>
      </div>
      </Card3D>

      {/* E-commerce Card */}
      <Card3D onClick={() => onOpenDemo('electronics')} intensity={12}>
      <div 
        className="relative bg-black rounded-3xl p-4 overflow-hidden cursor-pointer group transition-all duration-300"
        onMouseEnter={() => preloadDemo('electronics')}
        onTouchStart={() => preloadDemo('electronics')}
        style={{
          backgroundImage: `radial-gradient(circle at 70% 30%, rgba(255, 179, 0, 0.08) 0%, transparent 60%)`
        }}
      >
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 179, 0, 0.1) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }}></div>
        
        <div className="relative z-10">
          <div className="flex flex-wrap gap-1 mb-3">
            {businessApps[1].categories.map((cat, index) => (
              <span key={index} className="px-2 py-1 bg-white/10 text-white text-xs font-medium rounded-full">
                {cat}
              </span>
            ))}
          </div>
          
          <h3 className="text-white text-lg font-bold mb-2 leading-tight">
            {businessApps[1].title}
          </h3>
          
          <p className="text-white/70 text-sm mb-4">{businessApps[1].description}</p>
          
          <div className="flex justify-center">
            <div 
              className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FFB300] to-[#FFA000] flex items-center justify-center"
              style={{
                boxShadow: '0 15px 30px rgba(255, 179, 0, 0.25), inset 0 2px 6px rgba(255,255,255,0.2)'
              }}
            >
              <ShoppingCart className="w-6 h-6 text-black" />
            </div>
          </div>
        </div>
      </div>
      </Card3D>

      {/* Automation Card */}
      <Card3D onClick={() => onOpenDemo('beauty')} intensity={12}>
      <div 
        className="relative bg-black rounded-3xl p-4 overflow-hidden cursor-pointer group transition-all duration-300"
        onMouseEnter={() => preloadDemo('beauty')}
        onTouchStart={() => preloadDemo('beauty')}
        style={{
          backgroundImage: `radial-gradient(circle at 30% 70%, rgba(239, 83, 80, 0.06) 0%, transparent 60%)`
        }}
      >
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(239, 83, 80, 0.1) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }}></div>
        
        <div className="relative z-10">
          <div className="flex flex-wrap gap-1 mb-3">
            {businessApps[2].categories.map((cat, index) => (
              <span key={index} className="px-2 py-1 bg-white/10 text-white text-xs font-medium rounded-full">
                {cat}
              </span>
            ))}
          </div>
          
          <h3 className="text-white text-lg font-bold mb-2 leading-tight">
            {businessApps[2].title}
          </h3>
          
          <p className="text-white/70 text-sm mb-4">{businessApps[2].description}</p>
          
          <div className="flex justify-center">
            <div 
              className="w-16 h-16 rounded-full bg-gradient-to-br from-[#EF5350] to-[#E53935] flex items-center justify-center"
              style={{
                boxShadow: '0 15px 30px rgba(239, 83, 80, 0.25), inset 0 2px 6px rgba(255,255,255,0.2)'
              }}
            >
              <Code className="w-6 h-6 text-black" />
            </div>
          </div>
        </div>
      </div>
      </Card3D>
    </div>
  );
}