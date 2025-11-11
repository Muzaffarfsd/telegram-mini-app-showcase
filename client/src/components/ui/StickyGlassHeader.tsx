interface StickyGlassHeaderProps {
  title?: string;
}

export default function StickyGlassHeader({ title = "WEB4TG" }: StickyGlassHeaderProps) {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-3xl bg-white/5 border-b border-white/10 shadow-2xl shadow-black/5">
      <div className="max-w-md mx-auto px-4 py-3 relative">
        <div className="flex items-center justify-center">
          <h1 className="wow-gradient-text text-xl font-black drop-shadow-lg">
            {title}
          </h1>
        </div>
      </div>
      {/* Ultra transparent glass layers */}
      <div className="absolute inset-0 backdrop-blur-2xl bg-gradient-to-r from-white/3 via-white/8 to-white/3 -z-10"></div>
      <div className="absolute inset-0 backdrop-blur-xl bg-gradient-to-b from-white/6 to-white/2 -z-20"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/2 via-transparent to-purple-500/2 -z-30"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/1 to-white/3 -z-40"></div>
    </header>
  );
}