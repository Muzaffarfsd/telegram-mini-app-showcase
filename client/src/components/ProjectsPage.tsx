import { demoApps } from "../data/demoApps";

interface ProjectsPageProps {
  onNavigate: (section: string) => void;
  onOpenDemo: (demoId: string) => void;
}

// Уникальные градиенты для каждой карточки
const gradients = [
  'linear-gradient(90deg, #4285f4, #34a853, #fbbc05, #ea4335, #4285f4)', // Google colors
  'linear-gradient(90deg, #667eea, #764ba2, #f093fb, #4facfe, #667eea)', // Purple-Blue
  'linear-gradient(90deg, #f093fb, #f5576c, #feca57, #48dbfb, #f093fb)', // Pink-Yellow
  'linear-gradient(90deg, #fa709a, #fee140, #30cfd0, #330867, #fa709a)', // Sunset
  'linear-gradient(90deg, #4facfe, #00f2fe, #43e97b, #38f9d7, #4facfe)', // Ocean
  'linear-gradient(90deg, #f857a6, #ff5858, #f6d365, #fda085, #f857a6)', // Warm
  'linear-gradient(90deg, #a8edea, #fed6e3, #fbc2eb, #a6c1ee, #a8edea)', // Pastel
  'linear-gradient(90deg, #ff9a56, #ff6a88, #fcb69f, #ff9a9e, #ff9a56)', // Coral
  'linear-gradient(90deg, #00c6ff, #0072ff, #00d2ff, #3a7bd5, #00c6ff)', // Sky
  'linear-gradient(90deg, #f093fb, #f5576c, #4facfe, #00f2fe, #f093fb)', // Vibrant
  'linear-gradient(90deg, #667eea, #764ba2, #f093fb, #f5576c, #667eea)', // Deep Purple
];

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
            >
              {/* Animated gradient border - толще и уникальный градиент */}
              <div 
                className="absolute -inset-[2.5px] rounded-2xl opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: gradients[index % gradients.length],
                  backgroundSize: '300% 100%',
                  animation: 'gradient-shift 4s ease infinite',
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
