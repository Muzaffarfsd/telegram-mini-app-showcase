import { ArrowRight, Zap, Shield, Clock, Users, Code, Rocket } from "lucide-react";
import { useLanguage } from '../contexts/LanguageContext';

interface AboutPageProps {
  onNavigate: (section: string) => void;
}

export default function AboutPage({ onNavigate }: AboutPageProps) {
  const { t } = useLanguage();

  const principles = [
    { 
      icon: Shield, 
      title: t('about.quality'), 
      desc: t('about.qualityDesc')
    },
    { 
      icon: Clock, 
      title: t('about.speed'), 
      desc: t('about.speedDesc')
    },
    { 
      icon: Code, 
      title: t('about.technology'), 
      desc: t('about.technologyDesc')
    },
    { 
      icon: Users, 
      title: t('about.partnership'), 
      desc: t('about.partnershipDesc')
    }
  ];

  const stats = [
    { value: '50+', label: t('about.projectsLaunched') },
    { value: '14', label: t('about.averageDays') },
    { value: '127%', label: t('about.salesGrowth') },
    { value: '24/7', label: t('about.clientSupport') }
  ];

  return (
    <div 
      className="min-h-screen pb-32 smooth-scroll-page"
     
      style={{ 
        background: 'var(--surface)',
        color: 'var(--text-secondary)',
        paddingTop: '140px'
      }}
    >
      <div className="max-w-md mx-auto">
        
        <header className="px-7 pt-8 pb-16">
          <p 
            className="scroll-fade-in"
            style={{
              fontSize: '11px',
              fontWeight: 500,
              letterSpacing: '0.18em',
              color: 'var(--text-tertiary)',
              textTransform: 'uppercase',
              marginBottom: '24px'
            }}
          >
            {t('about.title')}
          </p>
          
          <h1 
            className="scroll-fade-in-delay-1"
            style={{
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: '32px',
              fontWeight: 600,
              letterSpacing: '-0.025em',
              lineHeight: '1.2',
              color: 'var(--text-primary)'
            }}
          >
            {t('about.heroTitle1')}
            <br />
            <span style={{ color: 'var(--accent-primary)' }}>{t('about.heroTitle2')}</span>
            <br />
            {t('about.heroTitle3')}
          </h1>
          
          <p 
            className="scroll-fade-in-delay-2"
            style={{
              fontSize: '15px',
              fontWeight: 400,
              letterSpacing: '-0.01em',
              lineHeight: '1.6',
              color: 'var(--text-tertiary)',
              marginTop: '20px',
              maxWidth: '320px'
            }}
          >
            {t('about.heroDesc')}
          </p>
        </header>

        <div 
          className="mx-7"
          style={{ height: '1px', background: 'var(--divider)' }}
        />

        <section className="px-7 py-12">
          <p 
            style={{
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.12em',
              color: 'var(--text-tertiary)',
              textTransform: 'uppercase',
              marginBottom: '16px'
            }}
          >
            {t('about.mission')}
          </p>
          
          <div 
            style={{
              padding: '24px',
              borderRadius: 'var(--card-radius)',
              background: 'var(--hero-gradient)',
              border: '1px solid var(--hero-border)',
              boxShadow: 'var(--card-shadow)'
            }}
          >
            <p style={{
              fontSize: '17px',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              lineHeight: '1.5',
              fontStyle: 'italic'
            }}>
              {t('about.missionText')}
            </p>
          </div>
        </section>

        <section className="px-7 py-8">
          <p 
            style={{
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.12em',
              color: 'var(--text-tertiary)',
              textTransform: 'uppercase',
              marginBottom: '20px'
            }}
          >
            {t('about.principles')}
          </p>
          
          <div className="space-y-4">
            {principles.map((item, index) => (
              <div 
                key={index}
                style={{
                  display: 'flex',
                  gap: '16px',
                  padding: '20px',
                  borderRadius: 'var(--card-radius)',
                  background: 'var(--card-bg)',
                  border: '1px solid var(--card-border)',
                  boxShadow: 'var(--card-shadow)'
                }}
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '12px',
                  background: 'var(--button-secondary-bg)',
                  flexShrink: 0
                }}>
                  <item.icon size={20} style={{ color: 'var(--accent-primary)' }} />
                </div>
                <div>
                  <p style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: '4px'
                  }}>
                    {item.title}
                  </p>
                  <p style={{
                    fontSize: '13px',
                    color: 'var(--text-tertiary)',
                    lineHeight: '1.4'
                  }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="px-7 py-8">
          <p 
            style={{
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.12em',
              color: 'var(--text-tertiary)',
              textTransform: 'uppercase',
              marginBottom: '20px'
            }}
          >
            {t('about.inNumbers')}
          </p>
          
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px'
            }}
          >
            {stats.map((stat, index) => (
              <div 
                key={index}
                style={{
                  padding: '20px',
                  borderRadius: 'var(--card-radius)',
                  background: 'var(--card-bg)',
                  border: '1px solid var(--card-border)',
                  boxShadow: 'var(--card-shadow)',
                  textAlign: 'center',
                  minHeight: '100px'
                }}
              >
                <p style={{
                  fontSize: '28px',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.03em'
                }}>
                  {stat.value}
                </p>
                <p style={{
                  fontSize: '10px',
                  color: 'var(--text-tertiary)',
                  marginTop: '4px',
                  lineHeight: '1.3'
                }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-7 py-12">
          <div 
            style={{
              padding: '28px',
              borderRadius: 'var(--card-radius)',
              background: 'var(--hero-gradient)',
              border: '1px solid var(--hero-border)',
              boxShadow: 'var(--card-shadow)',
              textAlign: 'center'
            }}
          >
            <div style={{
              width: '56px',
              height: '56px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '16px',
              background: 'var(--button-secondary-bg)',
              margin: '0 auto 16px'
            }}>
              <Rocket size={28} style={{ color: 'var(--accent-primary)' }} />
            </div>
            
            <h3 style={{
              fontSize: '20px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: '8px'
            }}>
              {t('about.readyToStart')}
            </h3>
            
            <p style={{
              fontSize: '14px',
              color: 'var(--text-tertiary)',
              marginBottom: '20px',
              lineHeight: '1.5'
            }}>
              {t('about.discussProject')}
              <br />
              {t('about.optimalSolution')}
            </p>
            
            <button
              onClick={() => onNavigate('constructor')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 28px',
                borderRadius: '12px',
                background: 'var(--button-primary-bg)',
                border: 'none',
                color: 'var(--button-primary-text)',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              data-testid="button-cta-constructor"
            >
              {t('about.orderProject')}
              <ArrowRight size={18} />
            </button>
          </div>
        </section>

        <section className="px-7 py-8 pb-16">
          <p 
            style={{
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.12em',
              color: 'var(--text-tertiary)',
              textTransform: 'uppercase',
              marginBottom: '16px'
            }}
          >
            {t('about.contact')}
          </p>
          
          <div 
            style={{
              padding: '24px',
              borderRadius: 'var(--card-radius)',
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              boxShadow: 'var(--card-shadow)'
            }}
          >
            <div style={{ marginBottom: '16px' }}>
              <p style={{
                fontSize: '12px',
                color: 'var(--text-tertiary)',
                marginBottom: '4px'
              }}>
                Telegram
              </p>
              <p style={{
                fontSize: '15px',
                fontWeight: 500,
                color: 'var(--text-primary)'
              }}>
                @web4tg_studio
              </p>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <p style={{
                fontSize: '12px',
                color: 'var(--text-tertiary)',
                marginBottom: '4px'
              }}>
                Email
              </p>
              <p style={{
                fontSize: '15px',
                fontWeight: 500,
                color: 'var(--text-primary)'
              }}>
                hello@web4tg.studio
              </p>
            </div>
            
            <div>
              <p style={{
                fontSize: '12px',
                color: 'var(--text-tertiary)',
                marginBottom: '4px'
              }}>
                {t('about.workingHours')}
              </p>
              <p style={{
                fontSize: '15px',
                fontWeight: 500,
                color: 'var(--text-primary)'
              }}>
                {t('about.workingHoursValue')}
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
