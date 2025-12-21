interface StickyGlassHeaderProps {
  title?: string;
}

export default function StickyGlassHeader({ title = "WEB4TG" }: StickyGlassHeaderProps) {
  return (
    <header 
      className="sticky top-0 z-50 backdrop-blur-3xl shadow-2xl"
      style={{
        background: 'var(--glass-nav-background)',
        borderBottom: '1px solid var(--glass-nav-border)',
        boxShadow: 'var(--glass-nav-shadow)',
      }}
    >
      <div className="max-w-md mx-auto px-4 py-5 relative">
        <div className="flex items-center justify-center">
          <h1 className="wow-gradient-text text-xl font-black drop-shadow-lg">
            {title}
          </h1>
        </div>
      </div>
    </header>
  );
}