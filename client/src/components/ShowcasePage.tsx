import { ArrowRight } from "lucide-react";
import { useCallback, memo, useRef } from "react";
import { m, useScroll, useTransform } from 'framer-motion';
import { useHaptic } from '../hooks/useHaptic';

interface ShowcasePageProps {
  onNavigate: (section: string) => void;
  onOpenDemo: (demoId: string) => void;
}

function ShowcasePage({ onNavigate, onOpenDemo }: ShowcasePageProps) {
  const haptic = useHaptic();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const handleCTA = useCallback(() => {
    haptic.medium();
    onNavigate('constructor');
  }, [haptic, onNavigate]);

  const handleDemo = useCallback((id: string) => {
    haptic.light();
    onOpenDemo(id);
  }, [haptic, onOpenDemo]);

  return (
    <div className="min-h-screen bg-black">
      
      {/* ═══════════════════════════════════════════════════════════════
          HERO — Full screen product reveal
      ═══════════════════════════════════════════════════════════════ */}
      <section 
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden"
        style={{ paddingTop: '80px' }}
      >
        <m.div 
          style={{ scale: heroScale, opacity: heroOpacity }}
          className="text-center"
        >
          {/* Overline */}
          <m.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-[13px] font-medium tracking-wide mb-4"
            style={{ color: '#86868b' }}
          >
            Telegram Mini Apps
          </m.p>

          {/* Main headline */}
          <m.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[48px] font-semibold tracking-tight leading-[1.05] mb-4"
            style={{ 
              color: '#f5f5f7',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
            }}
          >
            Бизнес внутри
            <br />
            Telegram.
          </m.h1>

          {/* Subheadline */}
          <m.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[19px] font-normal leading-[1.4] mb-8 max-w-[320px] mx-auto"
            style={{ color: '#86868b' }}
          >
            Превращаем идеи в приложения, которые продают.
          </m.p>

          {/* CTA buttons */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col items-center gap-4"
          >
            <button
              onClick={handleCTA}
              className="inline-flex items-center justify-center gap-2 px-7 h-[44px] rounded-full text-[15px] font-medium transition-all"
              style={{ 
                background: '#0071e3',
                color: '#fff'
              }}
              data-testid="button-hero-cta"
            >
              Начать проект
              <ArrowRight className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => handleDemo('clothing-store')}
              className="inline-flex items-center gap-1 text-[15px] font-normal transition-opacity hover:opacity-70"
              style={{ color: '#2997ff' }}
              data-testid="button-hero-demo"
            >
              Смотреть демо
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </m.div>
        </m.div>

        {/* Product preview - floating phone mockup */}
        <m.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="mt-12 relative"
        >
          <div 
            className="w-[280px] h-[560px] rounded-[44px] overflow-hidden relative"
            style={{ 
              background: 'linear-gradient(180deg, #1c1c1e 0%, #000 100%)',
              boxShadow: '0 50px 100px -20px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.1)',
            }}
          >
            {/* Screen content preview */}
            <div className="absolute inset-3 rounded-[36px] overflow-hidden bg-gradient-to-b from-neutral-900 to-black">
              {/* Mock store UI */}
              <div className="p-4 space-y-3">
                <div className="h-3 w-24 bg-white/10 rounded-full" />
                <div className="h-32 w-full bg-white/5 rounded-2xl" />
                <div className="flex gap-2">
                  <div className="h-20 flex-1 bg-white/5 rounded-xl" />
                  <div className="h-20 flex-1 bg-white/5 rounded-xl" />
                </div>
                <div className="h-10 w-full bg-blue-500/20 rounded-xl" />
              </div>
            </div>
            
            {/* Notch */}
            <div 
              className="absolute top-3 left-1/2 -translate-x-1/2 w-[100px] h-[28px] bg-black rounded-full"
            />
          </div>
        </m.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FEATURES — Bento grid
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 px-5">
        <div className="max-w-[430px] mx-auto">
          
          {/* Section title */}
          <m.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 
              className="text-[32px] font-semibold tracking-tight leading-tight mb-3"
              style={{ color: '#f5f5f7' }}
            >
              Всё для роста.
            </h2>
            <p 
              className="text-[17px]"
              style={{ color: '#86868b' }}
            >
              Полный цикл разработки за 14 дней.
            </p>
          </m.div>

          {/* Bento grid */}
          <div className="grid grid-cols-2 gap-3">
            
            {/* Large card */}
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="col-span-2 p-6 rounded-2xl"
              style={{ background: '#1c1c1e' }}
            >
              <div 
                className="text-[13px] font-medium mb-2"
                style={{ color: '#86868b' }}
              >
                Конверсия
              </div>
              <div 
                className="text-[44px] font-semibold tracking-tight"
                style={{ color: '#f5f5f7' }}
              >
                +280%
              </div>
              <div 
                className="text-[15px] mt-1"
                style={{ color: '#86868b' }}
              >
                Средний рост продаж
              </div>
            </m.div>

            {/* Small cards */}
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="p-5 rounded-2xl"
              style={{ background: '#1c1c1e' }}
            >
              <div 
                className="text-[28px] font-semibold tracking-tight mb-1"
                style={{ color: '#f5f5f7' }}
              >
                127
              </div>
              <div 
                className="text-[13px]"
                style={{ color: '#86868b' }}
              >
                Проектов
              </div>
            </m.div>

            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="p-5 rounded-2xl"
              style={{ background: '#1c1c1e' }}
            >
              <div 
                className="text-[28px] font-semibold tracking-tight mb-1"
                style={{ color: '#f5f5f7' }}
              >
                14
              </div>
              <div 
                className="text-[13px]"
                style={{ color: '#86868b' }}
              >
                Дней разработки
              </div>
            </m.div>

            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="p-5 rounded-2xl"
              style={{ background: '#1c1c1e' }}
            >
              <div 
                className="text-[28px] font-semibold tracking-tight mb-1"
                style={{ color: '#f5f5f7' }}
              >
                98%
              </div>
              <div 
                className="text-[13px]"
                style={{ color: '#86868b' }}
              >
                Клиентов довольны
              </div>
            </m.div>

            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="p-5 rounded-2xl"
              style={{ background: '#1c1c1e' }}
            >
              <div 
                className="text-[28px] font-semibold tracking-tight mb-1"
                style={{ color: '#f5f5f7' }}
              >
                24/7
              </div>
              <div 
                className="text-[13px]"
                style={{ color: '#86868b' }}
              >
                Поддержка
              </div>
            </m.div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          PORTFOLIO — Horizontal scroll cards
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16">
        <div className="max-w-[430px] mx-auto px-5 mb-8">
          <h2 
            className="text-[28px] font-semibold tracking-tight"
            style={{ color: '#f5f5f7' }}
          >
            Наши работы.
          </h2>
        </div>

        {/* Scrollable cards */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-4 px-5 pb-4" style={{ width: 'max-content' }}>
            {[
              { id: 'clothing-store', name: 'LUMIERE', category: 'Мода' },
              { id: 'electronics', name: 'TECHZONE', category: 'Электроника' },
              { id: 'restaurant', name: 'SAKURA', category: 'Ресторан' },
              { id: 'beauty', name: 'GLOW', category: 'Красота' },
            ].map((project, i) => (
              <m.button
                key={project.id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleDemo(project.id)}
                className="flex-shrink-0 w-[200px] rounded-2xl overflow-hidden text-left"
                style={{ background: '#1c1c1e' }}
                data-testid={`card-project-${project.id}`}
              >
                {/* Preview */}
                <div 
                  className="h-[140px] w-full"
                  style={{ 
                    background: `linear-gradient(135deg, hsl(${i * 60}, 40%, 20%) 0%, hsl(${i * 60 + 30}, 30%, 10%) 100%)`
                  }}
                />
                
                {/* Info */}
                <div className="p-4">
                  <div 
                    className="text-[11px] font-medium uppercase tracking-wider mb-1"
                    style={{ color: '#86868b' }}
                  >
                    {project.category}
                  </div>
                  <div 
                    className="text-[17px] font-semibold"
                    style={{ color: '#f5f5f7' }}
                  >
                    {project.name}
                  </div>
                </div>
              </m.button>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FINAL CTA
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 px-5">
        <div className="max-w-[430px] mx-auto text-center">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 
              className="text-[32px] font-semibold tracking-tight leading-tight mb-4"
              style={{ color: '#f5f5f7' }}
            >
              Начните сегодня.
            </h2>
            <p 
              className="text-[17px] mb-8"
              style={{ color: '#86868b' }}
            >
              Бесплатная консультация. Ответим за час.
            </p>

            <button
              onClick={handleCTA}
              className="inline-flex items-center justify-center gap-2 px-8 h-[50px] rounded-full text-[17px] font-medium transition-all"
              style={{ 
                background: '#0071e3',
                color: '#fff'
              }}
              data-testid="button-final-cta"
            >
              Оставить заявку
              <ArrowRight className="w-4 h-4" />
            </button>
          </m.div>
        </div>
      </section>

      {/* Footer spacer */}
      <div className="h-24" />

    </div>
  );
}

export default memo(ShowcasePage);
