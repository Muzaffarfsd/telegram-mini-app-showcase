import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, ShoppingBag, User, Settings, Heart } from "lucide-react";

interface RascalStoreProps {
  activeTab: 'home' | 'catalog' | 'cart' | 'profile';
}

function RascalStore({ activeTab }: RascalStoreProps) {
  const [screen, setScreen] = useState<'home' | 'second'>('home');

  if (screen === 'home') {
    return (
      <div className="h-full relative overflow-hidden" style={{ backgroundColor: '#1a2e2a' }}>
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-white text-2xl font-light tracking-widest mb-2">Hello Pixie</h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative w-full max-w-md mb-8"
          >
            <img
              src="/attached_assets/stock_images/futuristic_techwear__e958e42c.jpg"
              alt="Model in green jacket"
              className="w-full h-[500px] object-cover rounded-3xl shadow-2xl"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 w-full max-w-md border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#1a2e2a">
                    <path d="M12.4,2.2c-5.6,0-10.2,4.6-10.2,10.2s4.6,10.2,10.2,10.2c5.6,0,10.2-4.6,10.2-10.2S18,2.2,12.4,2.2z M12.4,20.3c-4.4,0-8-3.6-8-8c0-4.4,3.6-8,8-8s8,3.6,8,8C20.4,16.7,16.8,20.3,12.4,20.3z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-white font-bold text-lg">NIKE</p>
                  <p className="text-white/60 text-sm">Rascal Collection</p>
                </div>
              </div>
              <button
                onClick={() => setScreen('second')}
                className="px-6 py-3 rounded-full font-bold text-sm transition-all hover:scale-105"
                style={{ backgroundColor: '#7FB069', color: '#1a2e2a' }}
              >
                NEW
              </button>
            </div>
          </motion.div>
        </div>

        <div className="absolute right-6 top-1/2 transform -translate-y-1/2 flex flex-col gap-4">
          <button className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 hover:bg-white/30 transition-all">
            <Home className="w-5 h-5 text-white" />
          </button>
          <button className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 hover:bg-white/30 transition-all">
            <ShoppingBag className="w-5 h-5 text-white" />
          </button>
          <button className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 hover:bg-white/30 transition-all">
            <Heart className="w-5 h-5 text-white" />
          </button>
          <button className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 hover:bg-white/30 transition-all">
            <User className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full relative overflow-hidden" style={{ backgroundColor: '#1a2e2a' }}>
      <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-12"
        >
          <h1 className="text-[120px] font-black mb-8" style={{
            color: '#7FB069',
            textShadow: '0 10px 30px rgba(127, 176, 105, 0.3)',
            letterSpacing: '-0.05em'
          }}>
            hello
          </h1>

          <div className="flex items-center justify-center gap-8 mb-12">
            <div className="w-24 h-24 rounded-full" style={{
              background: 'radial-gradient(circle, #7FB069 0%, #5A8C4A 100%)',
              boxShadow: '0 0 60px rgba(127, 176, 105, 0.6)'
            }} />
            <div className="w-32 h-32 rounded-full" style={{
              background: 'radial-gradient(circle, #7FB069 0%, #5A8C4A 100%)',
              boxShadow: '0 0 80px rgba(127, 176, 105, 0.6)'
            }} />
            <div className="w-20 h-20 rounded-full" style={{
              background: 'radial-gradient(circle, #7FB069 0%, #5A8C4A 100%)',
              boxShadow: '0 0 50px rgba(127, 176, 105, 0.6)'
            }} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center max-w-2xl mb-8"
        >
          <p className="text-white text-4xl font-bold mb-4">67%</p>
          <p className="text-white/80 text-lg leading-relaxed">
            that's how much we managed to reduce<br/>
            the production of new textiles
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={() => setScreen('home')}
          className="px-8 py-4 rounded-full font-bold text-lg transition-all hover:scale-105"
          style={{
            backgroundColor: '#7FB069',
            color: '#1a2e2a',
            boxShadow: '0 10px 40px rgba(127, 176, 105, 0.4)'
          }}
        >
          Learn more about Rascal
        </motion.button>
      </div>
    </div>
  );
}

export default RascalStore;
