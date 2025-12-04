import { ArrowLeft, Star, Play, ExternalLink, Share2 } from "lucide-react";
import { demoApps } from "@/data/demoApps";
import { useTelegram } from "@/hooks/useTelegram";
import { useToast } from "@/hooks/use-toast";

interface DemoAppLandingProps {
  demoId: string;
}

export default function DemoAppLanding({ demoId }: DemoAppLandingProps) {
  const { hapticFeedback, shareApp } = useTelegram();
  const { toast } = useToast();
  
  // Find the demo app
  const demoApp = demoApps.find(app => app.id === demoId);
  
  if (!demoApp) {
    return (
      <div className="min-h-screen bg-system-background flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <h2 className="ios-title2 font-bold mb-2">Приложение не найдено</h2>
          <p className="ios-body text-secondary-label mb-4">
            Запрошенное приложение не существует
          </p>
          <button
            onClick={() => window.location.hash = '/'}
            className="ios-button-filled"
          >
            На главную
          </button>
        </div>
      </div>
    );
  }

  const handleEnterApp = () => {
    hapticFeedback?.medium();
    window.location.hash = `/demos/${demoId}/app`;
  };

  const goBack = () => {
    hapticFeedback?.light();
    window.location.hash = '/';
  };

  const handleShare = () => {
    console.log('[DemoApp] Share clicked:', demoApp.title);
    hapticFeedback?.medium();
    shareApp(`Посмотри демо "${demoApp.title}" в Web4TG!`);
    toast({
      title: "Поделиться",
      description: "Открываю окно для отправки...",
    });
  };

  const { home } = demoApp;

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/10 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-md mx-auto px-4 py-5">
          <div className="flex items-center space-x-3">
            <button
              onClick={goBack}
              className="ios-button-plain"
              aria-label="Назад"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="flex-1 text-center">
              <h1 className="ios-headline font-semibold truncate">{demoApp.title}</h1>
              <p className="ios-caption1 text-system-blue">{demoApp.category}</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleShare}
                className="p-1 rounded-full hover-elevate active-elevate-2"
                aria-label="Поделиться"
                data-testid="button-share-demo"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-system-yellow fill-current" />
                <span className="ios-caption2 font-medium">4.9</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {home?.hero && (
        <section className="relative overflow-hidden">
          <div className={`h-64 ${home.hero.bgClass || 'bg-gradient-to-r from-blue-500 to-purple-600'}`}>
            {home.hero.image && (
              <img 
                src={home.hero.image} 
                alt={home.hero.title}
                className="w-full h-full object-cover absolute inset-0 mix-blend-overlay"
              />
            )}
            <div className="relative h-full flex items-center justify-center text-center text-white">
              <div className="max-w-md mx-auto px-4">
                <h2 className="ios-title1 font-bold mb-2">
                  {home.hero.title || `Добро пожаловать в ${demoApp.title}`}
                </h2>
                <p className="ios-body opacity-90">
                  {home.hero.subtitle || demoApp.description}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Banners Section */}
      {home?.banners && home.banners.length > 0 && (
        <section className="py-6">
          <div className="max-w-md mx-auto px-4">
            <div className="space-y-4">
              {home.banners.map((banner, index) => (
                <div 
                  key={index}
                  className={`relative overflow-hidden rounded-2xl h-32 ${banner.bgClass || 'bg-gradient-to-r from-indigo-500 to-purple-600'}`}
                >
                  {banner.image && (
                    <img 
                      src={banner.image} 
                      alt={banner.title}
                      className="w-full h-full object-cover absolute inset-0 mix-blend-overlay"
                    />
                  )}
                  <div className="relative h-full flex items-center text-white p-6">
                    <div>
                      <h3 className="ios-title3 font-bold mb-1">{banner.title}</h3>
                      {banner.subtitle && (
                        <p className="ios-body opacity-90">{banner.subtitle}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Services Section */}
      {home?.services && home.services.length > 0 && (
        <section className="pb-8">
          <div className="max-w-md mx-auto px-4">
            <h3 className="ios-title2 font-bold mb-4">Основные функции</h3>
            <div className="space-y-3">
              {home.services.map((service) => (
                <div 
                  key={service.id}
                  className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 hover:border-system-blue/30 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-system-blue/10 rounded-xl flex items-center justify-center">
                      {service.image ? (
                        <img 
                          src={service.image} 
                          alt={service.title}
                          className="w-8 h-8 object-cover rounded"
                        />
                      ) : (
                        <div className="w-6 h-6 bg-system-blue/20 rounded"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="ios-body font-semibold">{service.title}</h4>
                      {service.priceText && (
                        <p className="ios-caption1 text-secondary-label">{service.priceText}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Demo Info Section */}
      <section className="py-6 bg-secondary-system-background">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="text-center mb-4">
              <h3 className="ios-title2 font-bold mb-2">О демо-приложении</h3>
              <p className="ios-body text-secondary-label">
                {demoApp.description}
              </p>
            </div>
            
            <div className="flex items-center justify-between py-3 border-t border-separator">
              <span className="ios-body text-secondary-label">Категория</span>
              <span className="ios-body font-medium">{demoApp.category}</span>
            </div>
            
            <div className="flex items-center justify-between py-3 border-t border-separator">
              <span className="ios-body text-secondary-label">Разработчик</span>
              <span className="ios-body font-medium">{demoApp.creator}</span>
            </div>
            
            <div className="flex items-center justify-between py-3 border-t border-separator">
              <span className="ios-body text-secondary-label">Лайки</span>
              <div className="flex items-center space-x-1">
                <span className="ios-body font-medium">{demoApp.likes}</span>
                <Star className="w-4 h-4 text-system-yellow fill-current" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-separator safe-area-bottom">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex space-x-3">
            <button
              onClick={handleEnterApp}
              className="flex-1 ios-button-filled flex items-center justify-center space-x-2"
            >
              <Play className="w-4 h-4" />
              <span>Открыть демо</span>
            </button>
            <button
              onClick={() => window.location.hash = '/projects'}
              className="px-4 ios-button-tinted flex items-center justify-center"
              aria-label="Все проекты"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}