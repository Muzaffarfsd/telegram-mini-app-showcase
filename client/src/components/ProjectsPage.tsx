import { memo, useMemo } from "react";
import { demoApps } from "../data/demoApps";
import { ArrowRight } from "lucide-react";
import { FavoritesSection } from "./FavoritesSection";
import { FavoriteButton } from "./FavoriteButton";
import { useLanguage } from "@/contexts/LanguageContext";
import { VerticalImageStack, type VerticalImageItem } from "@/components/ui/vertical-image-stack";
import { LazyMotionProvider } from "@/utils/LazyMotionProvider";

interface ProjectsPageProps {
  onNavigate: (section: string) => void;
  onOpenDemo: (demoId: string) => void;
}

const AppCard = memo(({ app, onOpenDemo, t }: { app: any, onOpenDemo: (id: string) => void, t: any }) => {
  const handleCardClick = () => {
    try {
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
      }
    } catch (e) {}
    onOpenDemo(app.id);
  };

  return (
    <div
      onClick={handleCardClick}
      className="premium-card group gpu-layer"
      data-testid={`card-app-${app.id}`}
      style={{
        position: 'relative',
        cursor: 'pointer',
        borderRadius: 'var(--card-radius)',
        padding: '20px 20px 20px 24px',
        background: 'var(--card-bg)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid var(--card-border)',
        boxShadow: 'var(--card-shadow)',
        transition: 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
        contain: 'content'
      }}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 
            data-testid={`text-title-${app.id}`}
            style={{
              fontSize: '17px',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              marginBottom: '4px'
            }}
          >
            {app.title}
          </h3>
          <p 
            data-testid={`text-description-${app.id}`}
            style={{
              fontSize: '14px',
              lineHeight: '1.4',
              color: 'var(--text-tertiary)',
              letterSpacing: '-0.005em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {t(`projectsPage.appDescriptions.${app.id}`) || app.description}
          </p>
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          <FavoriteButton demoId={app.id} size="md" />
          <button
            className="open-button flex items-center gap-1.5 px-4 py-2 rounded-full transition-colors duration-200"
            style={{
              background: 'var(--button-secondary-bg)',
              border: '1px solid var(--button-secondary-border)',
              color: 'var(--button-secondary-text)',
              fontSize: '13px',
              fontWeight: 600,
              letterSpacing: '0.01em',
            }}
            data-testid={`button-open-${app.id}`}
          >
            <span>{t('projectsPage.open')}</span>
            <ArrowRight 
              className="w-3.5 h-3.5" 
              strokeWidth={2.5}
            />
          </button>
        </div>
      </div>
    </div>
  );
});

AppCard.displayName = 'AppCard';

const verticalImageItems: VerticalImageItem[] = [
  {
    id: 1,
    src: "/attached_assets/4659a0f48988f601b98b2cec6406c739_1762127566273.jpg",
    alt: "Radiance — Premium fashion",
  },
  {
    id: 2,
    src: "/attached_assets/1a589b27fba1af47b8e9957accf246dd_1763654490139.jpg",
    alt: "Nike Destiny — Sportswear",
  },
  {
    id: 3,
    src: "/attached_assets/f4f7105a6604aa1ca214f4fb48a515ac_1763654563855.jpg",
    alt: "Nike Green — Sustainable",
  },
  {
    id: 4,
    src: "/attached_assets/e81eb2add9c19398a4711b33670141ec_1763720062375.jpg",
    alt: "Rascal — Urban streetwear",
  },
  {
    id: 5,
    src: "/attached_assets/82a7adf27f8d0e1758ca0f797349db48_1763719506416.jpg",
    alt: "Studio Collection",
  },
];

export default memo(function ProjectsPage({ onOpenDemo }: ProjectsPageProps) {
  const { t } = useLanguage();
  const topApps = useMemo(() => demoApps, []);

  return (
    <div 
      className="min-h-screen pb-32 smooth-scroll-page gpu-layer"
      style={{ 
        background: 'var(--surface)',
        color: 'var(--text-secondary)',
        paddingTop: '140px',
        contain: 'layout'
      }}
    >
      <div className="max-w-md mx-auto">
        <header className="px-7 pt-8 pb-16">
          <p 
            style={{
              fontSize: '11px',
              fontWeight: 500,
              letterSpacing: '0.18em',
              color: 'var(--text-quaternary)',
              textTransform: 'uppercase',
              marginBottom: '24px'
            }}
          >
            {t('projectsPage.eyebrow')}
          </p>
          
          <h1 
            style={{
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: '28px',
              fontWeight: 600,
              letterSpacing: '-0.025em',
              lineHeight: '1.3',
              color: 'var(--text-primary)'
            }}
          >
            {t('projectsPage.heroLine1')}
            <br />
            <span style={{ color: 'var(--accent-primary)' }}>
              {t('projectsPage.heroLine2')}
            </span>
            <br />
            <span style={{ color: 'var(--text-primary)' }}>
              {t('projectsPage.heroLine3')}
            </span>
          </h1>
          
          <div 
            className="flex items-center gap-3"
            style={{ marginTop: '28px' }}
          >
            <div className="scroll-icon" />
            <span style={{ fontSize: '15px', color: 'var(--accent-primary)', fontWeight: 500 }}>
              {t('projectsPage.viewExamples')}
            </span>
          </div>
          
          <div 
            style={{
              marginTop: '36px',
              padding: '24px',
              borderRadius: 'var(--card-radius)',
              background: 'var(--hero-gradient)',
              border: '1px solid var(--hero-border)',
              boxShadow: 'var(--card-shadow)',
              contain: 'content'
            }}
          >
            <p style={{
              fontSize: '15px',
              fontWeight: 500,
              letterSpacing: '-0.01em',
              color: 'var(--text-secondary)',
              lineHeight: '1.6'
            }}>
              {t('projectsPage.fomoLine1')}
              <br />
              <span style={{ 
                color: 'var(--accent-primary)',
                fontWeight: 600
              }}>
                {t('projectsPage.fomoLine2')}
              </span>
              <br />
              <span style={{ color: 'var(--text-tertiary)' }}>
                {t('projectsPage.fomoLine3')}
              </span>
            </p>
          </div>
        </header>

        <section className="px-4 pb-10">
          <p 
            style={{
              fontSize: '12px',
              fontWeight: 500,
              letterSpacing: '0.12em',
              color: 'var(--text-quaternary)',
              textTransform: 'uppercase',
              marginBottom: '16px',
              paddingLeft: '12px'
            }}
          >
            {t('projectsPage.projects')}
          </p>
          <LazyMotionProvider>
            <VerticalImageStack
              images={verticalImageItems}
              height={480}
              cardWidth={260}
              cardHeight={380}
            />
          </LazyMotionProvider>
        </section>

        <div 
          className="mx-7"
          style={{ height: '1px', background: 'var(--divider)' }}
        />

        <div className="py-6">
          <FavoritesSection onOpenDemo={onOpenDemo} />
        </div>

        <section className="px-7 py-10">
          <div className="flex items-baseline justify-between">
            <p 
              style={{
                fontSize: '12px',
                fontWeight: 500,
                letterSpacing: '0.12em',
                color: 'var(--text-quaternary)',
                textTransform: 'uppercase'
              }}
            >
              {t('projectsPage.appCollection')}
            </p>
            <p 
              style={{
                fontSize: '13px',
                color: 'var(--text-quaternary)'
              }}
            >
              {topApps.length} {t('projectsPage.projectsCount')}
            </p>
          </div>
        </section>

        <div className="px-5 space-y-3">
          {topApps.map((app) => (
            <AppCard key={app.id} app={app} onOpenDemo={onOpenDemo} t={t} />
          ))}
        </div>

        <section className="px-7 mt-12">
          <div 
            style={{ 
              height: '1px', 
              background: 'var(--divider)',
              marginBottom: '32px'
            }}
          />
          
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <p style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>50+</p>
              <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{t('projectsPage.projects')}</p>
            </div>
            <div>
              <p style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>6</p>
              <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{t('projectsPage.industries')}</p>
            </div>
            <div>
              <p style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>14</p>
              <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{t('projectsPage.daysToLaunch')}</p>
            </div>
          </div>
        </section>

        <section className="px-7 mt-12">
          <div className="text-center">
            <p style={{ fontFamily: 'Georgia, serif', fontSize: '18px', fontStyle: 'italic', fontWeight: 400, color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '24px' }}>
              {t('projectsPage.pullQuote')}
            </p>

            <a
              href="https://t.me/web4tgs"
              target="_blank"
              rel="noopener noreferrer"
              className="cta-button inline-flex items-center justify-center gap-2.5 w-full py-4 rounded-xl font-medium transition-transform duration-200"
              style={{
                background: 'var(--button-primary-bg)',
                color: 'var(--button-primary-text)',
                fontSize: '15px',
                letterSpacing: '-0.01em',
                textDecoration: 'none'
              }}
              data-testid="button-order-cta"
            >
              {t('projectsPage.requestConsultation')}
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </section>

        <footer className="px-7 mt-16 text-center">
          <p style={{ fontSize: '10px', letterSpacing: '0.25em', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
            Web4TG · Telegram Mini Apps · 2025
          </p>
        </footer>
      </div>

      <style>{`
        .premium-card:active {
          transform: scale(0.98);
          opacity: 0.9;
        }

        .cta-button:active {
          transform: scale(0.98);
        }

        .scroll-icon {
          width: 20px;
          height: 32px;
          border: 2px solid var(--accent-primary);
          border-radius: 10px;
          position: relative;
        }

        .scroll-icon::before {
          content: '';
          width: 4px;
          height: 6px;
          background: var(--accent-primary);
          border-radius: 2px;
          position: absolute;
          top: 6px;
          left: 50%;
          transform: translateX(-50%);
          animation: scrollPulse 2s ease-in-out infinite;
        }

        @keyframes scrollPulse {
          0%, 20% { opacity: 1; transform: translateX(-50%) translateY(0); }
          80%, 100% { opacity: 0; transform: translateX(-50%) translateY(14px); }
        }
      `}</style>
    </div>
  );
});