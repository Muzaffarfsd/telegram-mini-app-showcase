import { useState, memo } from "react";
import { m } from "framer-motion";
import { Heart, MessageCircle, ChevronLeft, ChevronRight, Check, Lock, Star, Sparkles, X, Send, Image as ImageIcon, Settings, Grid } from "lucide-react";

interface EmilyCarterAIProps {
  activeTab: 'home' | 'catalog' | 'cart' | 'profile';
}

interface Post {
  id: number;
  text: string;
  price: number;
  image?: string;
  locked: boolean;
  likes: number;
}

const posts: Post[] = [
  {
    id: 1,
    text: "Hi! Set for those who want to see awesome gameplay! Spoiler alert - i win!",
    price: 5.99,
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&q=90",
    locked: true,
    likes: 847
  },
  {
    id: 2,
    text: "New cosplay photos are ready! Check out my latest Zodiac collection",
    price: 9.99,
    image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop&q=90",
    locked: true,
    likes: 1234
  },
  {
    id: 3,
    text: "Behind the scenes of my latest photoshoot. Exclusive access!",
    price: 14.99,
    locked: true,
    likes: 2156
  }
];

function EmilyCarterAI({ activeTab }: EmilyCarterAIProps) {
  const [selectedPlan, setSelectedPlan] = useState<'yearly' | 'weekly'>('yearly');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [following, setFollowing] = useState(false);
  const [showMessages, setShowMessages] = useState(false);

  // ========================================
  // HOME PAGE - Subscription screen (Light mode)
  // ========================================
  if (activeTab === 'home') {
    return (
      <div className="min-h-screen bg-[#F5F4F0] text-[#1A1A1A] overflow-auto pb-24">
        <div className="demo-nav-safe px-5">
          {/* Hero Image */}
          <m.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative rounded-[32px] overflow-hidden mb-6"
            style={{ height: '420px' }}
          >
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=1000&fit=crop&q=95"
              alt="Emily Carter"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            
            {/* AI Creator Badge */}
            <div className="absolute bottom-6 left-6">
              <div 
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3"
                style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(20px)' }}
              >
                <Sparkles className="w-3.5 h-3.5" style={{ color: '#A78BFA' }} />
                <span className="text-white text-[12px] font-medium">AI Creator</span>
              </div>
              <div className="flex items-center gap-2">
                <h2 className="text-white text-[28px] font-bold">Emily Carter</h2>
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
          </m.div>

          {/* Subscription Section */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm">
            <h3 className="text-[18px] font-semibold text-center mb-6">Select your plan</h3>
            
            {/* Yearly Plan */}
            <m.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedPlan('yearly')}
              className={`w-full p-4 rounded-2xl mb-3 flex items-center justify-between transition-all ${
                selectedPlan === 'yearly' 
                  ? 'bg-[#F5F4F0] border-2 border-[#1A1A1A]' 
                  : 'bg-[#F5F4F0] border-2 border-transparent'
              }`}
              data-testid="button-plan-yearly"
            >
              <div className="flex items-center gap-3">
                <div 
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedPlan === 'yearly' ? 'border-[#1A1A1A] bg-[#1A1A1A]' : 'border-gray-300'
                  }`}
                >
                  {selectedPlan === 'yearly' && <Check className="w-3 h-3 text-white" />}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Yearly</span>
                    <span 
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                      style={{ background: '#22C55E' }}
                    >
                      Save 90%
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold">$0.77 <span className="font-normal text-gray-500">/ week</span></div>
                <div className="text-[12px] text-gray-400">just $39.99 year</div>
              </div>
            </m.button>

            {/* Weekly Plan */}
            <m.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedPlan('weekly')}
              className={`w-full p-4 rounded-2xl mb-6 flex items-center justify-between transition-all ${
                selectedPlan === 'weekly' 
                  ? 'bg-[#F5F4F0] border-2 border-[#1A1A1A]' 
                  : 'bg-[#F5F4F0] border-2 border-transparent'
              }`}
              data-testid="button-plan-weekly"
            >
              <div className="flex items-center gap-3">
                <div 
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedPlan === 'weekly' ? 'border-[#1A1A1A] bg-[#1A1A1A]' : 'border-gray-300'
                  }`}
                >
                  {selectedPlan === 'weekly' && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="font-semibold">Weekly</span>
              </div>
              <div className="font-bold">$6.99 <span className="font-normal text-gray-500">/ week</span></div>
            </m.button>

            {/* Subscribe Button */}
            <button 
              onClick={() => setIsSubscribed(true)}
              className="w-full py-4 rounded-full bg-[#1A1A1A] text-white font-semibold text-[15px]"
              data-testid="button-subscribe"
            >
              Subscribe
            </button>

            <p className="text-center text-gray-400 text-[13px] mt-4">Cancel anytime</p>
            
            <div className="flex items-center justify-center gap-4 mt-3">
              <span className="text-[12px] text-gray-400 underline">Terms of use</span>
              <span className="text-gray-300">|</span>
              <span className="text-[12px] text-gray-400 underline">Privacy policy</span>
              <span className="text-gray-300">|</span>
              <span className="text-[12px] text-gray-400 underline">Purchases</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========================================
  // CATALOG/PROFILE PAGE - Dark mode profile
  // ========================================
  if (activeTab === 'catalog') {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white overflow-auto pb-24">
        <div className="demo-nav-safe px-5">
          {/* Back button */}
          <button 
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-6"
            data-testid="button-back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Profile Section */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-center flex-1">
              <span className="text-[24px] font-bold">34.9 K</span>
              <p className="text-white/50 text-[12px]">followers</p>
            </div>
            
            {/* Avatar */}
            <div className="relative">
              <div 
                className="w-[100px] h-[100px] rounded-full overflow-hidden"
                style={{ border: '3px solid rgba(255,255,255,0.1)' }}
              >
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&q=90"
                  alt="Emily Carter"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="text-center flex-1">
              <span className="text-[24px] font-bold">2245</span>
              <p className="text-white/50 text-[12px]">following</p>
            </div>
          </div>

          {/* Name and Bio */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-[20px] font-bold">Emily Carter</span>
              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            </div>
            <p className="text-white/50 text-[13px]">E-gamer | Kawaii lover | Zodiac girl</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-8">
            <button 
              onClick={() => setFollowing(!following)}
              className={`flex-1 py-3 rounded-full font-semibold text-[14px] flex items-center justify-center gap-2 ${
                following 
                  ? 'bg-white/10 text-white' 
                  : 'bg-white text-black'
              }`}
              data-testid="button-follow"
            >
              <Heart className={`w-4 h-4 ${following ? 'fill-red-500 text-red-500' : ''}`} />
              {following ? 'Following' : 'Follow'}
            </button>
            <button 
              onClick={() => setShowMessages(true)}
              className="flex-1 py-3 rounded-full bg-white/10 font-semibold text-[14px] flex items-center justify-center gap-2"
              data-testid="button-messages"
            >
              <MessageCircle className="w-4 h-4" />
              Messages
            </button>
          </div>

          {/* Posts */}
          <div className="space-y-4">
            {posts.slice(0, 1).map(post => (
              <div 
                key={post.id}
                className="rounded-[24px] p-4"
                style={{ background: 'linear-gradient(160deg, #2A2A2C 0%, #1C1C1E 100%)' }}
              >
                <div className="flex items-start gap-3 mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&q=90"
                    alt="Emily"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-[14px]">Emily Carter</span>
                      <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                    </div>
                    <p className="text-white/60 text-[13px]">{post.text}</p>
                  </div>
                </div>
                
                {post.image && (
                  <div className="relative rounded-2xl overflow-hidden mb-4">
                    <img
                      src={post.image}
                      alt="Post"
                      className="w-full h-[120px] object-cover"
                      style={{ filter: post.locked ? 'blur(20px)' : 'none' }}
                    />
                    {post.locked && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Lock className="w-8 h-8 text-white/80" />
                      </div>
                    )}
                    <div className="absolute bottom-3 right-3 px-2 py-1 rounded-lg bg-black/60 text-[11px]">
                      21:24
                    </div>
                  </div>
                )}
                
                <button 
                  className="w-full py-3 rounded-full text-[14px] font-semibold"
                  style={{ background: 'rgba(255,255,255,0.1)' }}
                  data-testid={`button-buy-${post.id}`}
                >
                  Buy ${post.price}
                </button>
              </div>
            ))}
          </div>

          {/* Upgrade Card */}
          <div 
            className="rounded-[24px] p-5 mt-4"
            style={{ background: 'linear-gradient(160deg, #F5F4F0 0%, #E8E7E3 100%)' }}
          >
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-gray-600" />
                  <span className="text-[12px] text-gray-500">The best price</span>
                </div>
                <h3 className="text-[#1A1A1A] text-[18px] font-bold mb-1">Unlock all exclusive content</h3>
                <p className="text-gray-500 text-[13px]">Upgrade to Silver</p>
              </div>
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #E5E7EB 0%, #9CA3AF 100%)' }}
              >
                <Star className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="flex items-center justify-center gap-3 mt-6">
            {[Star, Heart, MessageCircle, Grid].map((Icon, idx) => (
              <button
                key={idx}
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: idx === 0 ? '#1A1A1A' : 'rgba(255,255,255,0.1)' }}
              >
                <Icon className="w-5 h-5" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ========================================
  // CART PAGE - Content purchases
  // ========================================
  if (activeTab === 'cart') {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white overflow-auto pb-24">
        <div className="demo-nav-safe px-5">
          <h1 className="text-[24px] font-bold mb-6">My Purchases</h1>

          {isSubscribed ? (
            <div className="space-y-4">
              {posts.map(post => (
                <div 
                  key={post.id}
                  className="rounded-[20px] p-4"
                  style={{ background: 'linear-gradient(160deg, #1C1C1E 0%, #0D0D0D 100%)' }}
                >
                  <div className="flex gap-4">
                    <div className="relative w-[80px] h-[80px] rounded-xl overflow-hidden">
                      <img
                        src={post.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&q=90"}
                        alt="Content"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-[14px] mb-2 line-clamp-2">{post.text}</p>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-green-500 text-[12px]">Unlocked</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <Lock className="w-8 h-8 text-white/30" />
              </div>
              <p className="text-white/60 font-medium text-[15px]">No purchases yet</p>
              <p className="text-white/30 text-[13px] mt-2">Subscribe to unlock exclusive content</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ========================================
  // PROFILE PAGE - Settings
  // ========================================
  if (activeTab === 'profile') {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white overflow-auto pb-24">
        <div className="demo-nav-safe px-5">
          <div className="text-center mb-8">
            <div className="relative w-[88px] h-[88px] mx-auto mb-4">
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&q=80"
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
                style={{ border: '3px solid #A78BFA' }}
              />
            </div>
            <h2 className="text-[22px] font-bold">My Account</h2>
            <p className="text-white/40 text-[13px]">@viewer</p>
          </div>

          <div className="space-y-3">
            {[
              { icon: Heart, label: 'Favorites', value: '12 creators' },
              { icon: Lock, label: 'Subscriptions', value: isSubscribed ? 'Active' : 'None' },
              { icon: ImageIcon, label: 'Purchases', value: isSubscribed ? '3 items' : '0 items' },
              { icon: Settings, label: 'Settings', value: '' }
            ].map((item, idx) => (
              <button
                key={idx}
                className="w-full flex items-center gap-4 p-4 rounded-[18px]"
                style={{ background: 'linear-gradient(160deg, #1C1C1E 0%, #0D0D0D 100%)' }}
              >
                <div 
                  className="w-11 h-11 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                >
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="font-medium text-[15px] flex-1 text-left">{item.label}</span>
                {item.value && <span className="text-white/40 text-[13px]">{item.value}</span>}
                <ChevronRight className="w-5 h-5 text-white/30" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default memo(EmilyCarterAI);
