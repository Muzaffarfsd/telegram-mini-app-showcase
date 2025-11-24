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
          <h1 className="text-4xl font-bold text-white mb-2">
            Витрина
          </h1>
          <p className="text-white/60 text-sm">
            11 готовых приложений
          </p>
        </div>

        <div className="space-y-3">
          {topApps.map((app, index) => (
            <div
              key={app.id}
              onClick={() => onOpenDemo(app.id)}
              className="relative cursor-pointer group"
              data-testid={`card-app-${app.id}`}
              style={{
                // Задержка анимации для эффекта каскада
                animationDelay: `${index * 0.05}s`
              }}
            >
              {/* Animated gradient border */}
              <div 
                className="absolute -inset-[1px] rounded-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: 'linear-gradient(90deg, #4285f4, #34a853, #fbbc05, #ea4335, #4285f4)',
                  backgroundSize: '300% 100%',
                  animation: 'gradient-shift 3s ease infinite',
                  filter: 'blur(0.5px)'
                }}
              />
              
              {/* Card content */}
              <div 
                className="relative bg-black rounded-2xl p-4 transition-all duration-300 group-hover:bg-white/5"
              >
                <h3 className="text-lg font-semibold text-white mb-2" data-testid={`text-title-${app.id}`}>
                  {app.title}
                </h3>
                <p className="text-sm text-white/70" data-testid={`text-description-${app.id}`}>
                  {app.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes gradient-shift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  );
}
