import { useState, memo } from "react";
import { m } from "framer-motion";
import { ChevronLeft, ChevronRight, Heart, Plus, Search, Calendar, Clock, Check, X, MapPin, Star, User } from "lucide-react";

interface N99BeautyStudioProps {
  activeTab: 'home' | 'catalog' | 'cart' | 'profile';
}

interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: string;
  stylist: string;
  image: string;
}

interface InspoImage {
  id: number;
  image: string;
  liked: boolean;
  tags: string[];
}

const services: Service[] = [
  {
    id: 1,
    name: "Manicure 3D",
    description: "+ mini patterns",
    price: 48.99,
    duration: "1.5h",
    stylist: "Emily Taylor",
    image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=400&fit=crop&q=90"
  },
  {
    id: 2,
    name: "Gel Polish",
    description: "Premium collection",
    price: 35.99,
    duration: "1h",
    stylist: "Sarah Johnson",
    image: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=400&h=400&fit=crop&q=90"
  },
  {
    id: 3,
    name: "Nail Art Design",
    description: "Custom artwork",
    price: 65.99,
    duration: "2h",
    stylist: "Emily Taylor",
    image: "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=400&h=400&fit=crop&q=90"
  }
];

const inspoImages: InspoImage[] = [
  { id: 1, image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=300&h=300&fit=crop&q=80", liked: true, tags: ['Autumn', 'Almond'] },
  { id: 2, image: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=300&h=300&fit=crop&q=80", liked: false, tags: ['Nude', 'Classic'] },
  { id: 3, image: "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=300&h=300&fit=crop&q=80", liked: true, tags: ['Dark', 'Glitter'] },
  { id: 4, image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=300&h=300&fit=crop&q=80", liked: false, tags: ['French', 'Elegant'] },
  { id: 5, image: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=300&h=300&fit=crop&q=80", liked: true, tags: ['Minimal', 'Natural'] },
  { id: 6, image: "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=300&h=300&fit=crop&q=80", liked: false, tags: ['Bold', 'Artistic'] }
];

function N99BeautyStudio({ activeTab }: N99BeautyStudioProps) {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState("Mon 12.11");
  const [selectedTime, setSelectedTime] = useState("12:00-13:30");
  const [bookings, setBookings] = useState<Service[]>([]);
  const [favorites, setFavorites] = useState<Set<number>>(new Set([1, 3, 5]));
  const [activeTags, setActiveTags] = useState<string[]>(['Autumn', 'Almond shape', 'Nude']);

  const toggleFavorite = (id: number) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
  };

  const addBooking = (service: Service) => {
    setBookings([...bookings, service]);
    setSelectedService(null);
  };

  // ========================================
  // HOME PAGE - Main booking screen
  // ========================================
  if (activeTab === 'home') {
    return (
      <div className="min-h-screen bg-[#F5F4F0] text-[#1A1A1A] overflow-auto pb-24">
        <div className="demo-nav-safe">
          {/* Hero Section */}
          <div className="relative h-[280px] mb-6">
            <img
              src="https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&h=600&fit=crop&q=90"
              alt="N99 Beauty"
              className="w-full h-full object-cover"
              style={{ filter: 'brightness(0.4)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            
            {/* Back button */}
            <button 
              className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center"
              data-testid="button-back-home"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>

            {/* Logo */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <h1 className="text-white text-[64px] font-light tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
                N99<span className="text-[32px]">°</span>
              </h1>
              <p className="text-white/60 text-[11px] tracking-[0.3em] uppercase mt-2">Beauty Studio</p>
            </div>
          </div>

          {/* Booking Card */}
          <div className="px-5">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[28px] p-6 shadow-lg"
            >
              {/* Status Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span 
                    className="text-[48px] font-light tracking-tight"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    N99<span className="text-[24px]">°</span>
                  </span>
                </div>
                <span 
                  className="px-3 py-1 rounded-full text-[11px] font-medium text-yellow-700"
                  style={{ background: 'rgba(234, 179, 8, 0.15)' }}
                >
                  Unconfirmed
                </span>
              </div>

              {/* Service Details */}
              <h2 className="text-[22px] font-bold mb-1">Manicure 3D</h2>
              <p className="text-gray-500 text-[14px] mb-5">+ mini patterns</p>

              {/* Stylist */}
              <div className="flex items-center gap-3 mb-5">
                <img
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&q=90"
                  alt="Stylist"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-[13px] text-gray-400">Stylist: Emily Taylor</p>
                  <p className="text-[12px] text-gray-300">N99 Studio</p>
                </div>
              </div>

              {/* Inspiration */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-gray-400 text-[12px] mb-2">Added inspo</p>
                  <div className="flex -space-x-2">
                    {inspoImages.slice(0, 3).map((img, idx) => (
                      <div 
                        key={idx}
                        className="w-8 h-8 rounded-full overflow-hidden border-2 border-white"
                      >
                        <img src={img.image} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                    <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-medium text-gray-500">
                      +16
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-[12px] mb-1">Selected date</p>
                  <p className="font-bold text-[18px]">{selectedDate}</p>
                  <p className="text-gray-500 text-[13px]">{selectedTime}</p>
                </div>
              </div>

              {/* Pay Button */}
              <button 
                onClick={() => addBooking(services[0])}
                className="w-full py-4 rounded-full text-[15px] font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #B8860B 0%, #8B6914 100%)' }}
                data-testid="button-pay"
              >
                Pay 48.99$
              </button>

              <p className="text-center text-gray-400 text-[11px] mt-4">
                By confirming the reservation, a deposit of 50%<br/>
                of the amount due will be collected.
              </p>
            </m.div>
          </div>
        </div>
      </div>
    );
  }

  // ========================================
  // CATALOG PAGE - Add inspiration
  // ========================================
  if (activeTab === 'catalog') {
    return (
      <div className="min-h-screen bg-[#F5F4F0] text-[#1A1A1A] overflow-auto pb-24">
        <div className="demo-nav-safe px-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center" data-testid="button-back-catalog">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Search className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-[28px] font-bold mb-2">Add inspo</h1>
          <p className="text-gray-400 text-[14px] mb-6">Your references for stylist</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {activeTags.map((tag, idx) => (
              <div 
                key={idx}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800 text-white text-[13px]"
              >
                <span>{tag}</span>
                <X className="w-3.5 h-3.5 cursor-pointer" />
              </div>
            ))}
          </div>

          {/* Stylist Profile */}
          <div className="flex items-center gap-3 mb-6">
            <img
              src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&q=90"
              alt="Emily Taylor"
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-1">
              <p className="font-semibold text-[15px]">Emily Taylor</p>
            </div>
            <button 
              className="px-5 py-2 rounded-full bg-gray-900 text-white text-[13px] font-medium"
              data-testid="button-follow-stylist"
            >
              Follow
            </button>
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-2 gap-3">
            {inspoImages.map((img, idx) => (
              <m.div
                key={img.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="relative rounded-2xl overflow-hidden aspect-square"
              >
                <img
                  src={img.image}
                  alt="Nail art"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => toggleFavorite(img.id)}
                  className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center"
                  data-testid={`button-like-${img.id}`}
                >
                  <Heart 
                    className={`w-4 h-4 ${favorites.has(img.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
                  />
                </button>
                {idx === 2 && (
                  <div className="absolute bottom-3 left-3 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                {idx === 5 && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Plus className="w-8 h-8 text-white" />
                  </div>
                )}
              </m.div>
            ))}
          </div>

          {/* Added count */}
          <div className="fixed bottom-28 left-1/2 transform -translate-x-1/2 flex items-center gap-3 px-5 py-3 rounded-full bg-gray-900 text-white">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <span className="text-[14px] font-medium">Added 13 Pics</span>
          </div>
        </div>
      </div>
    );
  }

  // ========================================
  // CART PAGE - My bookings
  // ========================================
  if (activeTab === 'cart') {
    return (
      <div className="min-h-screen bg-[#F5F4F0] text-[#1A1A1A] overflow-auto pb-24">
        <div className="demo-nav-safe px-5">
          <h1 className="text-[24px] font-bold mb-6">My Bookings</h1>

          {bookings.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium text-[15px]">No bookings yet</p>
              <p className="text-gray-300 text-[13px] mt-2">Book your first appointment</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking, idx) => (
                <m.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-[20px] p-4 shadow-sm"
                >
                  <div className="flex gap-4">
                    <img
                      src={booking.image}
                      alt={booking.name}
                      className="w-[72px] h-[72px] rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-[15px]">{booking.name}</h3>
                        <span className="text-[11px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Confirmed</span>
                      </div>
                      <p className="text-gray-400 text-[12px] mb-2">{booking.stylist}</p>
                      <div className="flex items-center gap-3 text-[12px] text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {selectedDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {selectedTime}
                        </span>
                      </div>
                    </div>
                  </div>
                </m.div>
              ))}
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
      <div className="min-h-screen bg-[#F5F4F0] text-[#1A1A1A] overflow-auto pb-24">
        <div className="demo-nav-safe px-5">
          <div className="text-center mb-8">
            <div className="relative w-[88px] h-[88px] mx-auto mb-4">
              <div 
                className="w-full h-full rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #B8860B 0%, #8B6914 100%)' }}
              >
                <User className="w-10 h-10 text-white" />
              </div>
            </div>
            <h2 className="text-[22px] font-bold">Guest User</h2>
            <p className="text-gray-400 text-[13px]">Sign in for full experience</p>
          </div>

          <div className="space-y-3">
            {[
              { icon: Calendar, label: 'My Appointments', value: `${bookings.length} upcoming` },
              { icon: Heart, label: 'Saved Designs', value: `${favorites.size} items` },
              { icon: Star, label: 'Favorite Stylists', value: '2 stylists' },
              { icon: MapPin, label: 'Nearby Studios', value: '' }
            ].map((item, idx) => (
              <button
                key={idx}
                className="w-full flex items-center gap-4 p-4 rounded-[18px] bg-white shadow-sm"
              >
                <div 
                  className="w-11 h-11 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #B8860B15 0%, #8B691415 100%)' }}
                >
                  <item.icon className="w-5 h-5" style={{ color: '#8B6914' }} />
                </div>
                <span className="font-medium text-[15px] flex-1 text-left">{item.label}</span>
                {item.value && <span className="text-gray-400 text-[13px]">{item.value}</span>}
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default memo(N99BeautyStudio);
