import { useState, useEffect, memo, useMemo } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, X, ChevronLeft, ChevronRight, Star, Clock, Eye, ExternalLink, Share2, Menu, Bell, Search, User, Package, ArrowRight } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { ConfirmDrawer } from "../ui/modern-drawer";

interface OxyzNFTProps {
  activeTab: 'home' | 'catalog' | 'cart' | 'profile';
}

interface NFTItem {
  id: number;
  name: string;
  price: number;
  priceChange: number;
  image: string;
  creator: string;
  collection: string;
  rarity: string;
  likes: number;
}

interface CartItem extends NFTItem {
  quantity: number;
}

const nftItems: NFTItem[] = [
  {
    id: 1,
    name: "Genesis Portal",
    price: 9.53,
    priceChange: 0.46,
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=800&fit=crop&q=90",
    creator: "CryptoArtist",
    collection: "Genesis",
    rarity: "Legendary",
    likes: 2847
  },
  {
    id: 2,
    name: "Digital Dreams",
    price: 6.74,
    priceChange: 0.98,
    image: "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=800&h=800&fit=crop&q=90",
    creator: "NeonMaster",
    collection: "Dreams",
    rarity: "Epic",
    likes: 1923
  },
  {
    id: 3,
    name: "Cyber Vision",
    price: 12.45,
    priceChange: -0.32,
    image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&h=800&fit=crop&q=90",
    creator: "VoxelKing",
    collection: "Cyber",
    rarity: "Rare",
    likes: 3421
  },
  {
    id: 4,
    name: "Abstract Realm",
    price: 4.21,
    priceChange: 0.15,
    image: "https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=800&h=800&fit=crop&q=90",
    creator: "ArtBlock",
    collection: "Dimensions",
    rarity: "Common",
    likes: 876
  }
];

function OxyzNFT({ activeTab }: OxyzNFTProps) {
  const [selectedNFT, setSelectedNFT] = useState<NFTItem | null>(null);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [cart, setCart] = useState<CartItem[]>([]);
  const [countdown, setCountdown] = useState({ hours: 4, minutes: 55, seconds: 16 });
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleFavorite = (id: number) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
  };

  const addToCart = (item: NFTItem) => {
    const existingItem = cart.find(c => c.id === item.id);
    if (!existingItem) {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
    setSelectedNFT(null);
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

  const handleImageLoad = (id: number) => {
    setLoadedImages(prev => new Set(prev).add(id));
  };

  const barcodePattern = useMemo(() => 
    Array.from({ length: 50 }).map(() => ({
      width: Math.random() > 0.5 ? 2 : 1,
      height: Math.random() * 12 + 18
    })), []
  );

  // ========================================
  // DETAILS PAGE - Exact match to reference
  // ========================================
  if (activeTab === 'catalog' && selectedNFT) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white overflow-auto pb-24">
        <div className="relative h-screen">
          <img
            src={selectedNFT.image}
            alt={selectedNFT.name}
            className="w-full h-full object-cover"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
          
          {/* Top Header */}
          <div className="absolute top-0 left-0 right-0 z-10 demo-nav-safe flex items-center justify-between">
            <button 
              onClick={() => setSelectedNFT(null)}
              className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-xl flex items-center justify-center"
              data-testid="button-back-detail"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-[15px] font-medium tracking-wide">Details</span>
            <div className="w-10" />
          </div>

          {/* Show Button - Right side */}
          <div className="absolute top-32 right-6 z-10">
            <button 
              className="flex items-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-semibold"
              style={{ background: '#E53935' }}
            >
              <span className="w-2 h-2 bg-white rounded-full" />
              Show
            </button>
          </div>

          {/* Bottom Content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 space-y-5">
            <div>
              <p className="text-white/50 text-[13px]">Only on</p>
              <p className="text-white/70 text-[13px]">Wednesday - Friday</p>
            </div>

            {/* Time Display */}
            <div className="flex items-baseline gap-8">
              <span className="text-[64px] font-extralight tracking-tight leading-none">19:45</span>
              <span className="text-[42px] font-light tracking-tight" style={{ color: '#E53935' }}>-24:00</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[18px] font-semibold" style={{ color: '#E53935' }}>NFT</span>
              <span className="text-[18px] text-white/70">party</span>
              <span className="text-white/50 text-[13px] ml-2">at 11:00 PM</span>
            </div>

            {/* Barcode Section */}
            <div className="pt-5 border-t border-white/10">
              <p className="text-[11px] text-white/40 mb-3 tracking-wide">Scan the barcode for more info</p>
              <div className="flex items-end gap-[1px]">
                {barcodePattern.map((bar, i) => (
                  <div 
                    key={i}
                    className="bg-white/80"
                    style={{ 
                      width: `${bar.width}px`,
                      height: `${bar.height}px`
                    }}
                  />
                ))}
                <span className="ml-6 text-[11px] text-white/50 font-mono tracking-wider">7845993 379623</span>
              </div>
            </div>

            {/* Action Button */}
            <ConfirmDrawer
              trigger={
                <button 
                  className="w-full py-4 rounded-full font-semibold text-[15px] transition-all flex items-center justify-center gap-2"
                  style={{ 
                    background: '#E53935',
                    boxShadow: '0 0 40px rgba(229, 57, 53, 0.3)'
                  }}
                  data-testid="button-place-bid"
                >
                  Place Bid
                </button>
              }
              title="Place Bid?"
              description={`${selectedNFT.name} - ${selectedNFT.price} ETH`}
              confirmText="Confirm"
              cancelText="Cancel"
              variant="default"
              onConfirm={() => addToCart(selectedNFT)}
            />
          </div>
        </div>
      </div>
    );
  }

  // ========================================
  // HOME PAGE - Exact match to reference
  // ========================================
  if (activeTab === 'home') {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white overflow-auto pb-24">
        <div className="demo-nav-safe px-5">
          
          {/* Header - OXYZ. with @oxyz New badge */}
          <div className="flex items-center justify-between mb-10">
            <button 
              className="w-[46px] h-[46px] rounded-xl flex items-center justify-center"
              style={{ border: '1px solid rgba(255,255,255,0.15)' }}
              data-testid="button-menu"
            >
              <Menu className="w-5 h-5 text-white/80" />
            </button>
            
            <div className="flex items-center gap-3">
              <span className="text-[20px] font-bold tracking-wide">OXYZ.</span>
              <div 
                className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <span className="text-[11px] text-white/50">@oxyz</span>
                <span 
                  className="px-2 py-0.5 rounded-full text-[9px] font-semibold"
                  style={{ background: 'rgba(255,255,255,0.15)' }}
                >
                  New
                </span>
              </div>
            </div>
          </div>

          {/* Main Headline - IT'S NOT JUST AN APP */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <p className="text-white/40 text-[13px] mb-3 tracking-wide">It's a revolution</p>
            <h1 className="leading-[0.92]">
              <span className="text-[52px] font-black tracking-tight block">IT'S</span>
              <span className="text-[52px] font-black tracking-tight block">NOT JUST</span>
              <span className="text-[52px] font-black tracking-tight block">AN APP</span>
            </h1>
          </m.div>

          {/* Social Icons - Instagram & X */}
          <div className="flex items-center gap-3 mb-10">
            <button 
              className="w-11 h-11 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="18" cy="6" r="1.5" fill="currentColor" stroke="none"/>
              </svg>
            </button>
            <button 
              className="w-11 h-11 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </button>
          </div>

          {/* Stats Cards Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Left Card - 9.53 with image */}
            <m.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-[28px] p-5 relative overflow-hidden"
              style={{ 
                background: 'linear-gradient(160deg, #1C1C1E 0%, #0D0D0D 100%)',
                border: '1px solid rgba(255,255,255,0.06)'
              }}
            >
              {/* Subtle glow effect */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl" />
              
              <div className="relative z-10">
                <div className="text-[48px] font-light tracking-tight leading-none mb-1">9.53</div>
                <div className="flex items-center gap-1.5 mb-5">
                  <span className="text-emerald-400 text-[13px] font-medium">+0.46</span>
                </div>
                
                {/* Image preview */}
                <div className="relative h-[100px] rounded-2xl overflow-hidden mb-4">
                  <img
                    src={nftItems[0].image}
                    alt="Featured"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>

                <p className="text-right text-[12px] text-white/40 mb-4">Fresh</p>
                
                <button 
                  className="w-full py-3.5 rounded-full text-[14px] font-semibold flex items-center justify-center"
                  style={{ background: '#E53935' }}
                  onClick={() => setSelectedNFT(nftItems[0])}
                  data-testid="button-details-1"
                >
                  Details
                </button>
              </div>
            </m.div>

            {/* Right Card - 6.74 with image */}
            <m.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-[28px] p-5 relative overflow-hidden"
              style={{ 
                background: 'linear-gradient(160deg, #1C1C1E 0%, #0D0D0D 100%)',
                border: '1px solid rgba(255,255,255,0.06)'
              }}
            >
              <div className="text-right text-[12px] text-white/40 mb-1.5">+0.98</div>
              <div className="text-[42px] font-light tracking-tight text-right leading-none mb-5">6.74</div>
              
              {/* NFT Image */}
              <div 
                className="relative h-[140px] rounded-2xl overflow-hidden cursor-pointer"
                onClick={() => setSelectedNFT(nftItems[1])}
              >
                <img
                  src={nftItems[1].image}
                  alt="Featured"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
            </m.div>
          </div>

          {/* Hero Card - GET BEST CREATIONS */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative rounded-[28px] overflow-hidden mb-6"
            style={{ height: '400px' }}
          >
            <img
              src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&h=600&fit=crop&q=90"
              alt="Featured NFT"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />
            
            {/* Top badges */}
            <div className="absolute top-5 left-5 flex items-center gap-2">
              <div 
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-medium"
                style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <Star className="w-3 h-3" />
                Dynamic Ecosystem
              </div>
            </div>
            
            <div className="absolute top-5 right-5 flex items-center gap-2">
              <span className="text-[11px] text-white/50">NFT</span>
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
              <div 
                className="px-3 py-1.5 rounded-lg text-[11px] font-medium"
                style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                marketplace
              </div>
            </div>

            {/* Bottom Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="mb-8">
                <div className="flex items-center gap-3 text-[38px] font-black leading-none tracking-tight mb-1">
                  <span className="text-white/40">GET</span>
                  <span className="text-white/25">→</span>
                  <span>B8ST</span>
                </div>
                <div className="text-[38px] font-black leading-none tracking-tight flex items-center">
                  <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 400 }}>CRE</span>
                  <span className="text-white/70 mx-0.5">A</span>
                  <span>TIONS</span>
                </div>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-white/40 text-[11px] mb-2">New platform coming soon</p>
                  <button 
                    className="flex items-center gap-2 px-5 py-3 rounded-full text-[13px] font-medium"
                    style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}
                    data-testid="button-find-out"
                  >
                    Find out
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </m.div>

          {/* Bottom Row - Countdown & Date */}
          <div className="grid grid-cols-2 gap-4">
            {/* Red Countdown Card */}
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-[28px] p-5 relative overflow-hidden"
              style={{ background: '#E53935' }}
            >
              <div className="flex items-center gap-2 mb-5">
                <div 
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.2)' }}
                >
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              
              {/* Countdown Timer */}
              <div className="flex items-baseline gap-1 text-[28px] font-bold tracking-tight mb-2">
                <span>{String(countdown.hours).padStart(2, '0')}</span>
                <span className="text-white/50 text-[20px]">:</span>
                <span>{String(countdown.minutes).padStart(2, '0')}</span>
                <span className="text-white/50 text-[20px]">:</span>
                <span>{String(countdown.seconds).padStart(2, '0')}</span>
              </div>
              <p className="text-white/50 text-[9px] uppercase tracking-[0.15em] mb-6">Hours   Minutes   Seconds</p>
              
              <div className="mt-auto">
                <p className="text-white/50 text-[11px] mb-0.5">At</p>
                <p className="text-[13px] font-semibold">17:00 UTC</p>
              </div>
            </m.div>

            {/* Date Card - 31 DEC */}
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="rounded-[28px] p-5 flex flex-col justify-end"
              style={{ 
                background: 'linear-gradient(160deg, #1C1C1E 0%, #0D0D0D 100%)',
                border: '1px solid rgba(255,255,255,0.06)'
              }}
            >
              <div className="text-[72px] font-black leading-none tracking-tight">31</div>
              <div 
                className="text-[56px] leading-none tracking-tight"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                DEC
              </div>
            </m.div>
          </div>
        </div>
      </div>
    );
  }

  // ========================================
  // CATALOG PAGE
  // ========================================
  if (activeTab === 'catalog') {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white overflow-auto pb-24">
        <div className="demo-nav-safe px-5">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-[24px] font-bold">Marketplace</h1>
            <button 
              className="w-11 h-11 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              data-testid="button-search"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
            {['All', 'Art', 'Music', 'Gaming', 'Photo'].map((cat, idx) => (
              <button
                key={cat}
                className={`px-5 py-2.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-all`}
                style={idx === 0 
                  ? { background: '#E53935' } 
                  : { background: 'transparent', border: '1px solid rgba(255,255,255,0.1)' }
                }
                data-testid={`button-category-${cat.toLowerCase()}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* NFT Grid */}
          <div className="space-y-4">
            {nftItems.map((item, idx) => (
              <m.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
                onClick={() => setSelectedNFT(item)}
                className="rounded-[24px] p-4 cursor-pointer"
                style={{ 
                  background: 'linear-gradient(160deg, #1C1C1E 0%, #0D0D0D 100%)',
                  border: '1px solid rgba(255,255,255,0.06)'
                }}
                data-testid={`nft-card-${item.id}`}
              >
                <div className="flex gap-4">
                  <div className="relative w-[100px] h-[100px] rounded-2xl overflow-hidden flex-shrink-0">
                    {!loadedImages.has(item.id) && (
                      <Skeleton className="w-full h-full absolute inset-0" />
                    )}
                    <img
                      src={item.image}
                      alt={item.name}
                      className={`w-full h-full object-cover transition-opacity ${!loadedImages.has(item.id) ? 'opacity-0' : 'opacity-100'}`}
                      onLoad={() => handleImageLoad(item.id)}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                    <div>
                      <h3 className="font-bold text-[17px] mb-1 truncate">{item.name}</h3>
                      <p className="text-white/40 text-[13px]">{item.collection}</p>
                    </div>
                    
                    <div className="flex items-end justify-between">
                      <div>
                        <span className="text-[24px] font-bold">{item.price}</span>
                        <span className="text-[13px] text-white/40 ml-1">ETH</span>
                        <p className={`text-[13px] ${item.priceChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {item.priceChange >= 0 ? '+' : ''}{item.priceChange}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(item.id);
                        }}
                        className="flex items-center gap-1.5 text-white/40"
                        data-testid={`button-favorite-${item.id}`}
                      >
                        <Heart className={`w-4 h-4 ${favorites.has(item.id) ? 'fill-red-500 text-red-500' : ''}`} />
                        <span className="text-[12px]">{item.likes}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </m.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ========================================
  // CART PAGE
  // ========================================
  if (activeTab === 'cart') {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white overflow-auto pb-24">
        <div className="demo-nav-safe px-5">
          <h1 className="text-[24px] font-bold mb-6">My Bids</h1>

          {cart.length === 0 ? (
            <div className="text-center py-20">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <ShoppingBag className="w-8 h-8 text-white/30" />
              </div>
              <p className="text-white/60 font-medium text-[15px]">No active bids</p>
              <p className="text-white/30 text-[13px] mt-2">Start bidding on NFTs you love</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map(item => (
                <m.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="rounded-[20px] p-4"
                  style={{ 
                    background: 'linear-gradient(160deg, #1C1C1E 0%, #0D0D0D 100%)',
                    border: '1px solid rgba(255,255,255,0.06)'
                  }}
                >
                  <div className="flex gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-[72px] h-[72px] rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-[15px]">{item.name}</h3>
                      <p className="text-white/40 text-[12px]">{item.creator}</p>
                      <p className="text-[20px] font-bold mt-2">{item.price} <span className="text-[12px] text-white/40">ETH</span></p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="w-9 h-9 rounded-full flex items-center justify-center self-center"
                      style={{ background: 'rgba(229, 57, 53, 0.1)', border: '1px solid rgba(229, 57, 53, 0.2)' }}
                      data-testid={`button-remove-${item.id}`}
                    >
                      <X className="w-4 h-4" style={{ color: '#E53935' }} />
                    </button>
                  </div>
                </m.div>
              ))}

              <div 
                className="rounded-[20px] p-6 mt-6"
                style={{ 
                  background: 'linear-gradient(160deg, #1C1C1E 0%, #0D0D0D 100%)',
                  border: '1px solid rgba(255,255,255,0.06)'
                }}
              >
                <div className="flex items-center justify-between mb-5">
                  <span className="text-white/50 text-[14px]">Total Value</span>
                  <span className="text-[24px] font-bold">{cartTotal.toFixed(2)} <span className="text-[13px] text-white/40">ETH</span></span>
                </div>
                <button 
                  className="w-full py-4 rounded-full font-semibold text-[15px]"
                  style={{ background: '#E53935' }}
                  data-testid="button-confirm-bids"
                >
                  Confirm All Bids
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ========================================
  // PROFILE PAGE
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
                style={{ border: '3px solid #E53935' }}
              />
              <div 
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: '#E53935' }}
              >
                <Star className="w-4 h-4" />
              </div>
            </div>
            <h2 className="text-[22px] font-bold">CryptoCollector</h2>
            <p className="text-white/40 text-[13px]">@collector.eth</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { value: cart.length, label: 'Bids' },
              { value: favorites.size, label: 'Saved' },
              { value: 12, label: 'Owned' }
            ].map((stat, idx) => (
              <div 
                key={idx}
                className="rounded-[18px] p-4 text-center"
                style={{ 
                  background: 'linear-gradient(160deg, #1C1C1E 0%, #0D0D0D 100%)',
                  border: '1px solid rgba(255,255,255,0.06)'
                }}
              >
                <p className="text-[22px] font-bold">{stat.value}</p>
                <p className="text-white/40 text-[11px]">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Menu Items */}
          <div className="space-y-3">
            {[
              { icon: User, label: 'Edit Profile' },
              { icon: Package, label: 'My Collections' },
              { icon: Heart, label: 'Favorites' },
              { icon: Clock, label: 'Bid History' },
            ].map((item, idx) => (
              <button
                key={idx}
                className="w-full flex items-center gap-4 p-4 rounded-[18px]"
                style={{ 
                  background: 'linear-gradient(160deg, #1C1C1E 0%, #0D0D0D 100%)',
                  border: '1px solid rgba(255,255,255,0.06)'
                }}
                data-testid={`button-${item.label.toLowerCase().replace(' ', '-')}`}
              >
                <div 
                  className="w-11 h-11 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="font-medium text-[15px]">{item.label}</span>
                <ChevronRight className="w-5 h-5 ml-auto text-white/30" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default memo(OxyzNFT);
