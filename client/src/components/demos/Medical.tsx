import React, { useState } from 'react';
import {
  Heart,
  Calendar,
  UserCheck,
  Clock,
  Star,
  Stethoscope,
  Activity,
  Pill,
  Shield,
  Phone,
  MapPin,
  Plus
} from 'lucide-react';
import { OptimizedImage } from "../OptimizedImage";

interface MedicalProps {
  activeTab: 'home' | 'catalog' | 'cart' | 'profile';
  onNavigate: (tab: string) => void;
}

interface Service {
  id: number;
  name: string;
  specialty: string;
  doctor: string;
  price: number;
  duration: string;
  rating: number;
  image: string;
  available: boolean;
}

interface CartItem extends Service {
  quantity: number;
  appointment: string;
}

const services: Service[] = [
  {
    id: 1,
    name: 'Общий осмотр',
    specialty: 'Терапевт',
    doctor: 'Др. Иванов А.С.',
    price: 80,
    duration: '30 мин',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=500&fit=crop&crop=center',
    available: true
  },
  {
    id: 2,
    name: 'Кардиограмма',
    specialty: 'Кардиолог',
    doctor: 'Др. Петрова М.В.',
    price: 120,
    duration: '45 мин',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=500&fit=crop&crop=center',
    available: true
  },
  {
    id: 3,
    name: 'УЗИ диагностика',
    specialty: 'Диагност',
    doctor: 'Др. Смирнов В.К.',
    price: 150,
    duration: '60 мин',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=800&h=500&fit=crop&crop=center',
    available: true
  },
  {
    id: 4,
    name: 'Стоматология',
    specialty: 'Стоматолог',
    doctor: 'Др. Козлова Е.Н.',
    price: 200,
    duration: '90 мин',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=800&h=500&fit=crop&crop=center',
    available: true
  }
];

const categories = ['Все', 'Терапевт', 'Кардиолог', 'Диагност', 'Стоматолог'];

export default function Medical({ activeTab, onNavigate }: MedicalProps) {
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const filteredServices = selectedCategory === 'Все' 
    ? services 
    : services.filter(service => service.specialty === selectedCategory);

  const addToCart = (service: Service) => {
    const existingItem = cartItems.find(item => item.id === service.id);
    if (existingItem) {
      setCartItems(prev => 
        prev.map(item => 
          item.id === service.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCartItems(prev => [...prev, { ...service, quantity: 1, appointment: 'Ближайшее время' }]);
    }
  };

  const removeFromCart = (serviceId: number) => {
    setCartItems(prev => prev.filter(item => item.id !== serviceId));
  };

  const updateQuantity = (serviceId: number, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(serviceId);
      return;
    }
    setCartItems(prev => 
      prev.map(item => 
        item.id === serviceId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const openServiceModal = (service: Service) => {
    setSelectedService(service);
  };

  const closeServiceModal = () => {
    setSelectedService(null);
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const renderHomeTab = () => (
    <div className="min-h-screen bg-blue-50 font-montserrat smooth-scroll-page">
      <div className="max-w-md mx-auto">
        
        {/* Medical Header */}
        <div className="px-6 pt-20 pb-16 text-center">
          <div className="w-20 h-20 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-8">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-blue-900 mb-3 tracking-wide">MediCare Center</h1>
          <p className="text-blue-600 text-sm font-medium">Premium Healthcare Services</p>
        </div>

        {/* Hero Medical Section */}
        <div className="px-6 pb-20">
          <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-blue-100 mb-12 relative">
            <OptimizedImage 
              src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&h=500&fit=crop&crop=center" 
              alt="Premium Medical Care"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 via-blue-900/40 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <h2 className="text-xl font-semibold mb-2">Your Health, Our Priority</h2>
              <p className="text-white/80 text-sm mb-4">Expert medical care with modern technology</p>
              <button 
                className="bg-white text-blue-900 px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
                onClick={() => openServiceModal(services[0])}
              >
                Book Appointment
              </button>
            </div>
          </div>
        </div>

        {/* Medical Stats */}
        <div className="px-6 py-20 border-t border-blue-200">
          <div className="text-center mb-16">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Trusted Healthcare</h3>
            <p className="text-blue-600 text-sm font-medium leading-relaxed">
              Professional medical services with experienced doctors and modern equipment.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-12 text-center">
            {[
              { number: '50+', label: 'Doctors' },
              { number: '10K+', label: 'Patients' },
              { number: '24/7', label: 'Emergency' },
              { number: '98%', label: 'Satisfaction' }
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-2xl font-bold text-blue-600 mb-1">{stat.number}</div>
                <div className="text-blue-500 text-xs font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Services */}
        <div className="px-6 py-20 border-t border-blue-200">
          <div className="flex items-center justify-between mb-12">
            <h3 className="text-lg font-semibold text-blue-900">Popular Services</h3>
            <button 
              className="text-blue-500 text-sm font-medium hover:text-blue-600 transition-colors"
              onClick={() => setSelectedCategory('Все')}
            >
              View all
            </button>
          </div>
          
          <div className="space-y-12">
            {services.slice(0, 2).map((service, index) => (
              <div 
                key={service.id} 
                className="group cursor-pointer"
                onClick={() => openServiceModal(service)}
              >
                <div className="aspect-[5/3] rounded-xl overflow-hidden bg-blue-100 mb-6 relative">
                  <OptimizedImage 
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                    {service.duration}
                  </div>
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-blue-900 text-xs font-medium px-2 py-1 rounded flex items-center space-x-1">
                    <Star className="w-3 h-3 text-blue-500 fill-current" />
                    <span>{service.rating}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-blue-900 font-semibold text-base">{service.name}</h4>
                      <p className="text-blue-500 text-sm font-medium">{service.doctor}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-blue-900 font-semibold">${service.price}</p>
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
        <h1 className="ios-title font-bold">Медицинские услуги</h1>
      
      {/* Categories */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full whitespace-nowrap ios-footnote font-medium ${
              selectedCategory === category
                ? 'bg-system-blue text-white'
                : 'bg-quaternary-system-fill text-label'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Services List */}
      <div className="space-y-3">
        {filteredServices.map((service) => (
          <div 
            key={service.id} 
            className="ios-card p-4 cursor-pointer"
            onClick={() => openServiceModal(service)}
          >
            <div className="flex items-center space-x-3">
              <OptimizedImage
                src={service.image}
                alt={service.name}
                className="w-20 h-20 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h4 className="ios-body font-semibold">{service.name}</h4>
                <p className="ios-footnote text-secondary-label">{service.doctor}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="ios-body font-bold text-system-blue">${service.price}</span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-system-orange" />
                    <span className="ios-caption2">{service.rating}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`w-3 h-3 rounded-full ${service.available ? 'bg-system-green' : 'bg-system-red'}`}></div>
                <p className="ios-caption2 text-secondary-label mt-1">{service.duration}</p>
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
        <h1 className="ios-title font-bold">Записи на прием</h1>
        
        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-quaternary-label mx-auto mb-4" />
            <h2 className="ios-title font-semibold text-secondary-label mb-2">Нет записей</h2>
            <p className="ios-body text-tertiary-label">Выберите медицинскую услугу для записи</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={item.id} className="ios-card p-4">
                  <div className="flex items-center space-x-3">
                    <OptimizedImage
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="ios-body font-semibold">{item.name}</h4>
                      <p className="ios-footnote text-secondary-label">{item.doctor}</p>
                      <p className="ios-caption2 text-system-blue">${item.price}</p>
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
                        className="w-8 h-8 rounded-full bg-system-blue flex items-center justify-center"
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
                <span className="ios-headline font-bold text-system-blue">${cartTotal}</span>
              </div>
              <button className="w-full bg-system-blue text-white ios-body font-semibold py-3 rounded-xl mt-4">
                Записаться на прием
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
        <h1 className="ios-title font-bold">Профиль пациента</h1>
        
        <div className="ios-card p-6 text-center">
          <div className="w-20 h-20 bg-system-blue rounded-full flex items-center justify-center mx-auto mb-4">
            <UserCheck className="w-10 h-10 text-white" />
          </div>
          <h2 className="ios-headline font-semibold mb-1">Иван Петров</h2>
          <p className="ios-footnote text-secondary-label">Постоянный пациент</p>
        </div>

        <div className="space-y-1">
          <div className="ios-list-item">
            <Calendar className="w-5 h-5 text-system-blue" />
            <span className="ios-body">История приемов</span>
          </div>
          <div className="ios-list-item">
            <Activity className="w-5 h-5 text-system-green" />
            <span className="ios-body">Медицинская карта</span>
          </div>
          <div className="ios-list-item">
            <Shield className="w-5 h-5 text-system-orange" />
            <span className="ios-body">Страховка</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Service Modal
  if (selectedService) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="relative">
            <OptimizedImage
              src={selectedService.image}
              alt={selectedService.name}
              className="w-full h-48 object-cover rounded-t-2xl"
            />
            <button
              onClick={closeServiceModal}
              className="absolute top-4 right-4 w-8 h-8 bg-black/20 rounded-full flex items-center justify-center text-white"
            >
              ×
            </button>
          </div>
          
          <div className="p-6 space-y-4">
            <div>
              <h2 className="ios-title font-bold mb-2">{selectedService.name}</h2>
              <p className="ios-body text-secondary-label">{selectedService.doctor}</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-system-orange" />
                <span className="ios-body">{selectedService.rating}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4 text-system-blue" />
                <span className="ios-body">{selectedService.duration}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between py-4 border-t border-separator">
              <span className="ios-headline font-semibold">${selectedService.price}</span>
              <button
                onClick={() => {
                  addToCart(selectedService);
                  closeServiceModal();
                }}
                className="bg-system-blue text-white px-6 py-2 rounded-xl ios-body font-semibold"
              >
                Записаться
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