import { demoApps } from "../data/demoApps";

interface ProjectsPageProps {
  onNavigate: (section: string) => void;
  onOpenDemo: (demoId: string) => void;
}

export default function ProjectsPage({ onOpenDemo }: ProjectsPageProps) {
  // Показываем только топ-11 самых популярных приложений
  const topApps = demoApps.slice(0, 11);

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <div className="max-w-md mx-auto p-4">
        
        <div className="text-center mb-8 mt-6">
          <h1 
            style={{
              fontSize: '36px',
              fontWeight: 700,
              letterSpacing: '-0.04em',
              color: '#FFFFFF',
              marginBottom: '8px'
            }}
          >
            Витрина
          </h1>
          <p 
            style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.5)',
              fontWeight: 400
            }}
          >
            11 готовых приложений
          </p>
        </div>

        <div className="space-y-3">
          {topApps.map((app, index) => (
            <div
              key={app.id}
              onClick={() => onOpenDemo(app.id)}
              className="luxury-card group"
              data-testid={`card-app-${app.id}`}
              style={{
                position: 'relative',
                cursor: 'pointer',
                borderRadius: '20px',
                padding: '20px',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)',
                backdropFilter: 'blur(20px) saturate(120%)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: `
                  0 1px 3px rgba(0, 0, 0, 0.3),
                  0 8px 24px rgba(0, 0, 0, 0.15),
                  inset 0 1px 0 rgba(255, 255, 255, 0.05)
                `,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <h3 
                className="text-lg font-semibold text-white mb-2" 
                data-testid={`text-title-${app.id}`}
                style={{
                  fontSize: '17px',
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                  color: '#FFFFFF'
                }}
              >
                {app.title}
              </h3>
              <p 
                className="text-sm" 
                data-testid={`text-description-${app.id}`}
                style={{
                  fontSize: '14px',
                  lineHeight: '1.5',
                  color: 'rgba(255, 255, 255, 0.6)',
                  letterSpacing: '-0.01em'
                }}
              >
                {app.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .luxury-card:hover {
          transform: translateY(-2px);
          border-color: rgba(255, 255, 255, 0.12);
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
          box-shadow: 
            0 2px 6px rgba(0, 0, 0, 0.25),
            0 12px 32px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }

        .luxury-card:active {
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
}
