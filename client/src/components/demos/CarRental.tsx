import React, { useState, useEffect } from 'react';
import {
  Car,
  Fuel,
  Users,
  Calendar,
  Clock,
  Star,
  Key,
  Shield,
  Navigation,
  Settings,
  Plus,
  MapPin,
  CreditCard
} from 'lucide-react';
import { scrollToTop } from "@/hooks/useScrollToTop";
import { LazyImage, UrgencyIndicator, TrustBadges, DemoThemeProvider } from "@/components/shared";

interface CarRentalProps {
  activeTab: 'home' | 'catalog' | 'cart' | 'profile';
  onNavigate: (tab: string) => void;
}

interface Vehicle {
  id: number;
  name: string;
  brand: string;
  type: string;
  price: number;
  fuelType: string;
  seats: number;
  transmission: string;
  rating: number;
  image: string;
  available: boolean;
  features: string[];
}

interface CartItem extends Vehicle {
  quantity: number;
  rentalDays: number;
  pickupDate: string;
}

const vehicles: Vehicle[] = [
  {
    id: 1,
    name: 'BMW X5',
    brand: 'BMW',
    type: 'SUV',
    price: 120,
    fuelType: 'Бензин',
    seats: 7,
    transmission: 'Автомат',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=500&fit=crop&crop=center',
    available: true,
    features: ['GPS', 'Кондиционер', 'Bluetooth', 'Камера']
  },
  {
    id: 2,
    name: 'Mercedes-Benz E-Class',
    brand: 'Mercedes',
    type: 'Седан',
    price: 100,
    fuelType: 'Бензин',
    seats: 5,
    transmission: 'Автомат',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&h=500&fit=crop&crop=center',
    available: true,
    features: ['GPS', 'Кожа', 'Люк', 'Premium Audio']
  },
  {
    id: 3,
    name: 'Tesla Model S',
    brand: 'Tesla',
    type: 'Электро',
    price: 150,
    fuelType: 'Электро',
    seats: 5,
    transmission: 'Автомат',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&h=500&fit=crop&crop=center',
    available: true,
    features: ['Автопилот', 'Быстрая зарядка', 'Premium Interior', 'OTA Updates']
  },
  {
    id: 4,
    name: 'Toyota Camry',
    brand: 'Toyota',
    type: 'Седан',
    price: 70,
    fuelType: 'Гибрид',
    seats: 5,
    transmission: 'Автомат',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&h=500&fit=crop&crop=center',
    available: true,
    features: ['Экономичный', 'Надежный', 'Комфортный', 'Безопасный']
  }
];

const categories = ['Все', 'Седан', 'SUV', 'Электро', 'Гибрид'];

function CarRental({ activeTab, onNavigate }: CarRentalProps) {
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    scrollToTop();
  }, [activeTab]);

  const filteredVehicles = selectedCategory === 'Все' 
    ? vehicles 
    : vehicles.filter(vehicle => vehicle.type === selectedCategory || vehicle.fuelType === selectedCategory);

  const addToCart = (vehicle: Vehicle) => {
    const existingItem = cartItems.find(item => item.id === vehicle.id);
    if (existingItem) {
      setCartItems(prev => 
        prev.map(item => 
          item.id === vehicle.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCartItems(prev => [...prev, { ...vehicle, quantity: 1, rentalDays: 1, pickupDate: 'Завтра' }]);
    }
  };

  const removeFromCart = (vehicleId: number) => {
    setCartItems(prev => prev.filter(item => item.id !== vehicleId));
  };

  const updateQuantity = (vehicleId: number, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(vehicleId);
      return;
    }
    setCartItems(prev => 
      prev.map(item => 
        item.id === vehicleId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const openVehicleModal = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const closeVehicleModal = () => {
    setSelectedVehicle(null);
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity * item.rentalDays), 0);

  const renderHomeTab = () => (
    <div className="min-h-screen font-montserrat smooth-scroll-page" style={{ backgroundColor: 'var(--theme-background)' }}>
      <div className="max-w-md mx-auto">
        
        <div className="px-6 pt-20 pb-16 text-center">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-8" style={{ backgroundColor: 'var(--theme-primary)' }}>
            <Car className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-semibold mb-3 tracking-wide" style={{ color: 'var(--theme-foreground)' }}>DriveNow</h1>
          <p className="text-sm font-medium" style={{ color: 'var(--theme-primary)' }}>Premium Car Rental Service</p>
        </div>

        <div className="px-6 pb-20">
          <div className="aspect-[16/10] rounded-2xl overflow-hidden mb-12 relative" style={{ backgroundColor: 'var(--theme-muted)' }}>
            <LazyImage 
              src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=500&fit=crop&crop=center" 
              alt="Premium Car Rental"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)' }} />
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <h2 className="text-xl font-semibold mb-2">Drive Your Dreams</h2>
              <p className="text-white/80 text-sm mb-4">Premium vehicles for every journey</p>
              <button 
                className="px-6 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-background)' }}
                onClick={() => openVehicleModal(vehicles[0])}
              >
                Book Now
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 py-20 border-t" style={{ borderColor: 'var(--theme-border)' }}>
          <div className="text-center mb-16">
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--theme-foreground)' }}>Premium Car Rental</h3>
            <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--theme-muted-foreground)' }}>
              Luxury vehicles with comprehensive insurance and 24/7 roadside assistance.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-12 text-center">
            {[
              { number: '200+', label: 'Vehicles' },
              { number: '50K+', label: 'Customers' },
              { number: '24/7', label: 'Support' },
              { number: '99%', label: 'Satisfaction' }
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-2xl font-bold mb-1" style={{ color: 'var(--theme-primary)' }}>{stat.number}</div>
                <div className="text-xs font-medium" style={{ color: 'var(--theme-muted-foreground)' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-20 border-t" style={{ borderColor: 'var(--theme-border)' }}>
          <div className="flex items-center justify-between mb-12">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--theme-foreground)' }}>Popular Cars</h3>
            <button 
              className="text-sm font-medium transition-colors"
              style={{ color: 'var(--theme-primary)' }}
              onClick={() => setSelectedCategory('Все')}
            >
              View all
            </button>
          </div>
          
          <div className="space-y-12">
            {vehicles.slice(0, 2).map((vehicle, index) => (
              <div 
                key={vehicle.id} 
                className="group cursor-pointer"
                onClick={() => openVehicleModal(vehicle)}
              >
                <div className="aspect-[5/3] rounded-xl overflow-hidden mb-6 relative" style={{ backgroundColor: 'var(--theme-muted)' }}>
                  <LazyImage 
                    src={vehicle.image}
                    alt={vehicle.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-3 left-3 text-white text-xs font-bold px-2 py-1 rounded" style={{ backgroundColor: 'var(--theme-primary)' }}>
                    {vehicle.type}
                  </div>
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-xs font-medium px-2 py-1 rounded flex items-center space-x-1" style={{ color: 'var(--theme-foreground)' }}>
                    <Star className="w-3 h-3 fill-current" style={{ color: 'var(--theme-primary)' }} />
                    <span>{vehicle.rating}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-base" style={{ color: 'var(--theme-foreground)' }}>{vehicle.name}</h4>
                      <p className="text-sm font-medium" style={{ color: 'var(--theme-muted-foreground)' }}>{vehicle.brand} • {vehicle.seats} мест</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold" style={{ color: 'var(--theme-foreground)' }}>${vehicle.price}/день</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );

  const renderCatalogTab = () => (
    <div className="bg-white min-h-screen smooth-scroll-page">
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        <h1 className="ios-title font-bold">Автомобили в аренду</h1>
      
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full whitespace-nowrap ios-footnote font-medium ${
              selectedCategory === category
                ? 'text-white'
                : 'bg-quaternary-system-fill text-label'
            }`}
            style={selectedCategory === category ? { backgroundColor: 'var(--theme-primary)' } : {}}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredVehicles.map((vehicle) => (
          <div 
            key={vehicle.id} 
            className="ios-card p-4 cursor-pointer"
            onClick={() => openVehicleModal(vehicle)}
          >
            <div className="flex items-center space-x-3">
              <LazyImage
                src={vehicle.image}
                alt={vehicle.name}
                className="w-20 h-20 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h4 className="ios-body font-semibold">{vehicle.name}</h4>
                <p className="ios-footnote text-secondary-label">{vehicle.brand} • {vehicle.transmission}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex items-center space-x-1">
                    <Users className="w-3 h-3 text-secondary-label" />
                    <span className="ios-caption2">{vehicle.seats}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Fuel className="w-3 h-3 text-secondary-label" />
                    <span className="ios-caption2">{vehicle.fuelType}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="ios-body font-bold" style={{ color: 'var(--theme-primary)' }}>${vehicle.price}/день</p>
                <div className="flex items-center space-x-1 mt-1">
                  <div className={`w-2 h-2 rounded-full ${vehicle.available ? 'bg-system-green' : 'bg-system-red'}`}></div>
                  <span className="ios-caption2">{vehicle.available ? 'Доступен' : 'Занят'}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    </div>
  );

  const renderCartTab = () => (
    <div className="bg-white min-h-screen smooth-scroll-page">
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        <h1 className="ios-title font-bold">Корзина аренды</h1>
        
        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <Car className="w-16 h-16 text-quaternary-label mx-auto mb-4" />
            <h2 className="ios-title font-semibold text-secondary-label mb-2">Корзина пуста</h2>
            <p className="ios-body text-tertiary-label">Выберите автомобиль для аренды</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={item.id} className="ios-card p-4">
                  <div className="flex items-center space-x-3">
                    <LazyImage
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="ios-body font-semibold">{item.name}</h4>
                      <p className="ios-footnote text-secondary-label">{item.brand}</p>
                      <p className="ios-caption2" style={{ color: 'var(--theme-primary)' }}>${item.price}/день × {item.rentalDays} дней</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-quaternary-system-fill flex items-center justify-center"
                      >
                        <span className="text-lg font-medium">-</span>
                      </button>
                      <span className="ios-body font-semibold w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: 'var(--theme-primary)' }}
                      >
                        <Plus className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="ios-card p-4">
              <div className="flex justify-between items-center">
                <span className="ios-headline font-semibold">Итого</span>
                <span className="ios-headline font-bold" style={{ color: 'var(--theme-primary)' }}>${cartTotal}</span>
              </div>
              
              <TrustBadges />
              
              <button className="w-full text-white ios-body font-semibold py-3 rounded-xl mt-4" style={{ backgroundColor: 'var(--theme-primary)' }}>
                Оформить аренду
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  const renderProfileTab = () => (
    <div className="bg-white min-h-screen smooth-scroll-page">
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        <h1 className="ios-title font-bold">Профиль водителя</h1>
        
        <div className="ios-card p-6 text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--theme-primary)' }}>
            <Key className="w-10 h-10 text-white" />
          </div>
          <h2 className="ios-headline font-semibold mb-1">Алексей Морозов</h2>
          <p className="ios-footnote text-secondary-label">Проверенный водитель</p>
        </div>

        <div className="space-y-1">
          <div className="ios-list-item">
            <Car className="w-5 h-5" style={{ color: 'var(--theme-primary)' }} />
            <span className="ios-body">История аренды</span>
          </div>
          <div className="ios-list-item">
            <CreditCard className="w-5 h-5 text-system-blue" />
            <span className="ios-body">Способы оплаты</span>
          </div>
          <div className="ios-list-item">
            <Shield className="w-5 h-5 text-system-green" />
            <span className="ios-body">Водительские права</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (selectedVehicle) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="relative">
            <LazyImage
              src={selectedVehicle.image}
              alt={selectedVehicle.name}
              className="w-full h-48 object-cover rounded-t-2xl"
            />
            <button
              onClick={closeVehicleModal}
              className="absolute top-4 right-4 w-8 h-8 bg-black/20 rounded-full flex items-center justify-center text-white"
            >
              ×
            </button>
          </div>
          
          <div className="p-6 space-y-4">
            <div>
              <h2 className="ios-title font-bold mb-2">{selectedVehicle.name}</h2>
              <p className="ios-body text-secondary-label">{selectedVehicle.brand}</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4" style={{ color: 'var(--theme-primary)' }} />
                <span className="ios-body">{selectedVehicle.rating}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4 text-system-blue" />
                <span className="ios-body">{selectedVehicle.seats} мест</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 py-3 border-t border-separator">
              <div className="text-center">
                <Fuel className="w-5 h-5 text-secondary-label mx-auto mb-1" />
                <span className="ios-footnote">{selectedVehicle.fuelType}</span>
              </div>
              <div className="text-center">
                <Settings className="w-5 h-5 text-secondary-label mx-auto mb-1" />
                <span className="ios-footnote">{selectedVehicle.transmission}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="ios-body font-semibold">Особенности:</h3>
              {selectedVehicle.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--theme-primary)' }}></div>
                  <span className="ios-footnote">{feature}</span>
                </div>
              ))}
            </div>
            
            <TrustBadges />
            
            <div className="flex items-center justify-between py-4 border-t border-separator">
              <span className="ios-headline font-semibold">${selectedVehicle.price}/день</span>
              <button
                onClick={() => {
                  addToCart(selectedVehicle);
                  closeVehicleModal();
                }}
                className="text-white px-6 py-2 rounded-xl ios-body font-semibold"
                style={{ backgroundColor: 'var(--theme-primary)' }}
              >
                Арендовать
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  switch (activeTab) {
    case 'catalog':
      return renderCatalogTab();
    case 'cart':
      return renderCartTab();
    case 'profile':
      return renderProfileTab();
    default:
      return renderHomeTab();
  }
}
