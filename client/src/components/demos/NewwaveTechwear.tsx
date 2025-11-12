import { useState } from "react";
import { motion } from "framer-motion";
import { Check, TrendingUp, Eye, ShoppingBag } from "lucide-react";
import cyberpunkImage1 from '@assets/stock_images/cyberpunk_fashion_ho_b350f945.jpg';
import cyberpunkImage2 from '@assets/stock_images/cyberpunk_fashion_ho_51de6edd.jpg';

interface NewwaveTechwearProps {
  activeTab: 'home' | 'catalog' | 'cart' | 'profile';
}

function NewwaveTechwear({ activeTab }: NewwaveTechwearProps) {
  const [screen, setScreen] = useState<'login' | 'dashboard' | 'product'>('login');
  const [trialEnabled, setTrialEnabled] = useState(false);

  if (screen === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-8">
        <div className="max-w-4xl w-full grid grid-cols-2 gap-12">
          <div className="relative h-[600px] rounded-3xl overflow-hidden shadow-2xl">
            <img
              src={cyberpunkImage1}
              alt="Model"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col justify-center">
            <h1 className="text-5xl font-black mb-2" style={{ color: '#9333EA' }}>
              NEWW(AI)VE
            </h1>
            <h2 className="text-4xl font-black mb-12 text-gray-800">
              TECHWEAR
            </h2>

            <div className="space-y-4 mb-8">
              <button
                onClick={() => setScreen('dashboard')}
                className="w-full bg-gray-300 text-gray-800 font-bold py-5 rounded-full hover:bg-gray-400 transition-all text-lg"
              >
                Login
              </button>

              <button
                onClick={() => setScreen('dashboard')}
                className="w-full font-bold py-5 rounded-full text-white transition-all text-lg"
                style={{
                  background: 'linear-gradient(135deg, #9333EA 0%, #EC4899 100%)',
                  boxShadow: '0 10px 30px rgba(147, 51, 234, 0.3)'
                }}
              >
                Sign Up
              </button>
            </div>

            <label className="flex items-center gap-3 mb-6 cursor-pointer">
              <div
                onClick={() => setTrialEnabled(!trialEnabled)}
                className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                  trialEnabled
                    ? 'bg-[#9333EA] border-[#9333EA]'
                    : 'border-gray-300'
                }`}
              >
                {trialEnabled && <Check className="w-4 h-4 text-white" />}
              </div>
              <span className="text-gray-600">Trial reasoning</span>
            </label>

            <button
              onClick={() => setScreen('dashboard')}
              className="text-center text-[#9333EA] font-medium hover:underline"
            >
              Continue As A Guest
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'dashboard') {
    return (
      <div className="h-full overflow-auto" style={{ backgroundColor: '#3D2952' }}>
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-black text-white mb-2">Dashboard</h1>
            <p className="text-white/60">Your techwear collection</p>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div
              className="rounded-3xl p-8 border"
              style={{
                background: 'linear-gradient(135deg, #9333EA 0%, #7C3AED 100%)',
                borderColor: '#EC4899'
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <span className="text-white font-bold">12</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">New Releases</h3>
              <p className="text-white/60">Latest arrivals this week</p>
            </div>

            <div
              className="rounded-3xl p-8 border"
              style={{
                background: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
                borderColor: '#9333EA'
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <Eye className="w-8 h-8 text-white" />
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <span className="text-white font-bold">8</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Most Viewed</h3>
              <p className="text-white/60">Trending items today</p>
            </div>
          </div>

          <div
            className="rounded-3xl overflow-hidden border cursor-pointer hover:scale-[1.02] transition-all"
            style={{ borderColor: '#EC4899' }}
            onClick={() => setScreen('product')}
          >
            <div className="grid grid-cols-2">
              <div className="relative h-80">
                <img
                  src="/attached_assets/stock_images/cyberpunk_fashion_ho_51de6edd.jpg"
                  alt="Winter Puffer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-8 flex flex-col justify-center" style={{ backgroundColor: '#2D1F3D' }}>
                <h3 className="text-3xl font-black text-white mb-4">
                  The Winter Puffer
                </h3>
                <p className="text-white/60 mb-6">
                  Premium insulation meets cyberpunk aesthetics
                </p>
                <button
                  className="px-6 py-3 rounded-full font-bold text-white w-fit"
                  style={{ background: 'linear-gradient(135deg, #9333EA 0%, #EC4899 100%)' }}
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-gray-50 to-gray-100">
      <button
        onClick={() => setScreen('dashboard')}
        className="p-6 text-gray-600 hover:text-gray-800"
      >
        ← Back to Dashboard
      </button>

      <div className="p-8 pt-0">
        <div className="max-w-6xl mx-auto grid grid-cols-2 gap-12">
          <div className="relative h-[700px] rounded-3xl overflow-hidden shadow-2xl">
            <img
              src="/attached_assets/stock_images/cyberpunk_fashion_ho_b350f945.jpg"
              alt="Cutting Edge Poncho"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col justify-center">
            <div className="inline-block px-4 py-2 rounded-full mb-6 w-fit" style={{
              background: 'linear-gradient(135deg, #9333EA 0%, #EC4899 100%)'
            }}>
              <span className="text-white font-bold text-sm">NEW ARRIVAL</span>
            </div>

            <h1 className="text-5xl font-black mb-6" style={{ color: '#9333EA' }}>
              CUTTING EDGE<br/>PONCHO
            </h1>

            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              Futuristic design meets premium materials. This cutting-edge poncho combines 
              cyberpunk aesthetics with practical functionality.
            </p>

            <div className="mb-8">
              <p className="text-gray-600 mb-4 font-medium">Select Size</p>
              <div className="flex gap-3">
                {[40, 42, 44, 46].map((size) => (
                  <button
                    key={size}
                    className="w-16 h-16 rounded-xl border-2 border-gray-300 hover:border-[#9333EA] font-bold text-gray-800 hover:text-[#9333EA] transition-all"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-12">
              <p className="text-6xl font-black mb-2" style={{ color: '#9333EA' }}>
                £5,000
              </p>
              <p className="text-gray-500">Including taxes and duties</p>
            </div>

            <button
              className="w-full font-bold py-6 rounded-full text-white text-xl flex items-center justify-center gap-3 transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #9333EA 0%, #EC4899 100%)',
                boxShadow: '0 20px 40px rgba(147, 51, 234, 0.3)'
              }}
            >
              <ShoppingBag className="w-6 h-6" />
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewwaveTechwear;
