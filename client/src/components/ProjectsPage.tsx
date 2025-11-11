import { demoApps } from "../data/demoApps";

interface ProjectsPageProps {
  onNavigate: (section: string) => void;
  onOpenDemo: (demoId: string) => void;
}

export default function ProjectsPage({ onOpenDemo }: ProjectsPageProps) {
  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <div className="max-w-md mx-auto p-4">
        
        <div className="text-center mb-8 mt-6">
          <h1 className="text-4xl font-bold text-white mb-2">
            Витрина
          </h1>
          <p className="text-white/60 text-sm">
            {demoApps.length} готовых приложений
          </p>
        </div>

        <div className="space-y-3">
          {demoApps.map((app) => (
            <div
              key={app.id}
              onClick={() => onOpenDemo(app.id)}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 cursor-pointer hover:bg-white/10 hover:border-white/20 transition-all"
              data-testid={`card-app-${app.id}`}
            >
              <h3 className="text-lg font-semibold text-white mb-2" data-testid={`text-title-${app.id}`}>
                {app.title}
              </h3>
              <p className="text-sm text-white/70" data-testid={`text-description-${app.id}`}>
                {app.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
