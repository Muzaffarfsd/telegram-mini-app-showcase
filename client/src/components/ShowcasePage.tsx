import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { m, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { useTelegram } from '../hooks/useTelegram';
import { useHaptic } from '../hooks/useHaptic';
import { useVideoLazyLoad } from '../hooks/useVideoLazyLoad';
import { preloadDemo } from './demos/DemoRegistry';

const heroVideo = "/videos/4e4993d0ac079a607a0bee301af06749_1761775010830.mp4";

interface ShowcasePageProps {
  onNavigate: (section: string) => void;
  onOpenDemo: (demoId: string) => void;
}

/* ═══════════════════════════════════════════════════════════════════════════
   APPLE 2025 — SCROLL-DRIVEN CINEMATIC EXPERIENCE
   Fixed for Safari sticky support - transforms on child elements only
═══════════════════════════════════════════════════════════════════════════ */

function ShowcasePage({ onNavigate, onOpenDemo }: ShowcasePageProps) {
  useTelegram();
  const haptic = useHaptic();
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useVideoLazyLoad();
  const [hovered, setHovered] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, { 
    stiffness: 100, 
    damping: 30, 
    restDelta: 0.001 
  });

  // Hero inner transforms (applied to child, not sticky container)
  const heroInnerScale = useTransform(smoothProgress, [0, 0.15], [1, 0.88]);
  const heroInnerOpacity = useTransform(smoothProgress, [0.08, 0.15], [1, 0]);
  const heroInnerY = useTransform(smoothProgress, [0, 0.15], [0, -80]);

  // Showcase section linked to scroll
  const showcaseOpacity = useTransform(smoothProgress, [0.12, 0.22], [0, 1]);
  const showcaseY = useTransform(smoothProgress, [0.12, 0.22], [60, 0]);
  const showcaseScale = useTransform(smoothProgress, [0.12, 0.22], [0.95, 1]);

  // Features section
  const featuresOpacity = useTransform(smoothProgress, [0.35, 0.45], [0, 1]);
  const featuresY = useTransform(smoothProgress, [0.35, 0.45], [40, 0]);

  // CTA section
  const ctaOpacity = useTransform(smoothProgress, [0.65, 0.75], [0, 1]);
  const ctaScale = useTransform(smoothProgress, [0.65, 0.75], [0.96, 1]);

  const contact = useCallback(() => { 
    haptic.medium(); 
    onNavigate('contact'); 
  }, [haptic, onNavigate]);

  const openDemo = useCallback(() => {
    haptic.light();
    preloadDemo('clothing-store');
    onOpenDemo('clothing-store');
  }, [haptic, onOpenDemo]);

  return (
    <div className="min-h-screen w-full flex justify-center" style={{ background: '#000' }}>
      <div 
        ref={containerRef}
        className="w-full relative"
        style={{ 
          maxWidth: '430px',
          background: '#000',
          fontFamily: "'SF Pro Display', 'Inter', -apple-system, sans-serif"
        }}
      >
        {/* ═══════════════════════════════════════════════════════════════
            HERO — Sticky container stays untransformed (Safari fix)
        ═══════════════════════════════════════════════════════════════ */}
        <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
          {/* Ambient light (static) */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 120% 60% at 50% 130%, rgba(255,255,255,0.04) 0%, transparent 50%)'
            }}
          />

          {/* Animated inner content */}
          <m.div 
            className="relative z-10 text-center px-8 w-full"
            style={{
              scale: heroInnerScale,
              opacity: heroInnerOpacity,
              y: heroInnerY
            }}
          >
            <m.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{
                fontSize: '11px',
                fontWeight: 500,
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.4)',
                marginBottom: '20px'
              }}
            >
              Introducing
            </m.p>

            <m.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontSize: 'clamp(72px, 22vw, 100px)',
                fontWeight: 600,
                letterSpacing: '-0.045em',
                lineHeight: 0.92,
                color: '#FFFFFF'
              }}
            >
              Mini
              <br />
              Apps.
            </m.h1>

            <m.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              style={{
                fontSize: '17px',
                fontWeight: 400,
                letterSpacing: '-0.01em',
                color: 'rgba(255,255,255,0.5)',
                marginTop: '24px'
              }}
            >
              Бизнес без границ.
            </m.p>
          </m.div>

          {/* Scroll hint - also in animated container */}
          <m.div
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 1.2 }}
            style={{ opacity: heroInnerOpacity }}
          >
            <m.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              style={{
                width: '20px',
                height: '32px',
                borderRadius: '10px',
                border: '1.5px solid rgba(255,255,255,0.3)',
                display: 'flex',
                justifyContent: 'center',
                paddingTop: '6px'
              }}
            >
              <m.div
                animate={{ opacity: [0.5, 1, 0.5], y: [0, 6, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  width: '2px',
                  height: '6px',
                  borderRadius: '1px',
                  background: 'rgba(255,255,255,0.6)'
                }}
              />
            </m.div>
          </m.div>
        </div>

        {/* Scroll distance for hero animation */}
        <div style={{ height: '60vh' }} aria-hidden="true" />

        {/* ═══════════════════════════════════════════════════════════════
            SHOWCASE — Scroll-linked reveal
        ═══════════════════════════════════════════════════════════════ */}
        <m.section 
          className="relative"
          style={{
            opacity: showcaseOpacity,
            y: showcaseY,
            scale: showcaseScale
          }}
        >
          <div className="px-6 mb-6">
            <p style={{
              fontSize: '11px',
              fontWeight: 500,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.3)',
              marginBottom: '10px'
            }}>
              Featured
            </p>
            <h2 style={{
              fontSize: '28px',
              fontWeight: 500,
              letterSpacing: '-0.025em',
              color: '#FFFFFF'
            }}>
              Radiance
            </h2>
            <p style={{
              fontSize: '15px',
              color: 'rgba(255,255,255,0.45)',
              marginTop: '6px'
            }}>
              Premium fashion commerce
            </p>
          </div>

          <div 
            className="relative cursor-pointer mx-4"
            onClick={openDemo}
            onMouseEnter={() => { setHovered(true); preloadDemo('clothing-store'); }}
            onMouseLeave={() => setHovered(false)}
            onTouchStart={() => preloadDemo('clothing-store')}
            data-testid="demo-card-main"
          >
            <m.div
              animate={{ scale: hovered ? 1.015 : 1 }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              style={{ 
                borderRadius: '20px',
                overflow: 'hidden',
                aspectRatio: '3/4',
                position: 'relative'
              }}
            >
              <video
                ref={videoRef}
                src={heroVideo}
                loop muted playsInline preload="none"
                className="absolute inset-0 w-full h-full object-cover"
                style={{
                  transform: hovered ? 'scale(1.05)' : 'scale(1)',
                  transition: 'transform 0.8s cubic-bezier(0.25, 0.1, 0.25, 1)'
                }}
              />
              
              <div 
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, transparent 40%, transparent 50%, rgba(0,0,0,0.6) 100%)'
                }}
              />

              <m.div
                className="absolute bottom-5 left-5 right-5 flex items-center justify-between"
                animate={{ opacity: hovered ? 1 : 0.7 }}
              >
                <span style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  letterSpacing: '0.08em',
                  color: 'rgba(255,255,255,0.8)',
                  textTransform: 'uppercase'
                }}>
                  Explore
                </span>
                <m.div
                  animate={{ x: hovered ? 4 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ArrowUpRight className="w-5 h-5 text-white/80" />
                </m.div>
              </m.div>
            </m.div>
          </div>

          <div className="px-6 mt-6">
            <button
              onClick={() => onNavigate('projects')}
              data-testid="button-view-all"
              className="group flex items-center gap-2"
              style={{
                background: 'none',
                border: 'none',
                fontSize: '14px',
                color: 'rgba(255,255,255,0.45)',
                cursor: 'pointer'
              }}
            >
              View all work
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </m.section>

        <div style={{ height: '120px' }} />

        {/* ═══════════════════════════════════════════════════════════════
            FEATURES — Scroll-linked
        ═══════════════════════════════════════════════════════════════ */}
        <m.section 
          className="px-6"
          style={{
            opacity: featuresOpacity,
            y: featuresY
          }}
        >
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '48px' }}>
            {[
              { title: 'Always On', sub: '24/7 sales automation' },
              { title: 'Native', sub: 'Telegram ecosystem integration' },
              { title: 'Forever', sub: 'Lifetime support included' }
            ].map((item, i) => (
              <FeatureRow key={item.title} {...item} index={i} />
            ))}
          </div>
        </m.section>

        <div style={{ height: '80px' }} />

        {/* ═══════════════════════════════════════════════════════════════
            SCARCITY
        ═══════════════════════════════════════════════════════════════ */}
        <m.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          <div 
            className="mx-6 text-center"
            style={{
              padding: '48px 24px',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.04)'
            }}
          >
            <p style={{
              fontSize: '48px',
              fontWeight: 300,
              letterSpacing: '-0.03em',
              color: '#FFFFFF'
            }}>
              7
            </p>
            <p style={{
              fontSize: '13px',
              color: 'rgba(255,255,255,0.35)',
              marginTop: '8px',
              letterSpacing: '0.02em'
            }}>
              spots available this season
            </p>
          </div>
        </m.section>

        <div style={{ height: '120px' }} />

        {/* ═══════════════════════════════════════════════════════════════
            CTA — Scroll-linked
        ═══════════════════════════════════════════════════════════════ */}
        <m.section 
          className="px-6 text-center py-16"
          style={{
            opacity: ctaOpacity,
            scale: ctaScale
          }}
        >
          <h2 style={{
            fontSize: 'clamp(44px, 14vw, 60px)',
            fontWeight: 500,
            letterSpacing: '-0.035em',
            lineHeight: 0.95,
            color: '#FFFFFF',
            marginBottom: '32px'
          }}>
            Start
            <br />
            building.
          </h2>

          <m.button
            onClick={contact}
            data-testid="button-contact"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            style={{
              background: '#FFFFFF',
              color: '#000000',
              border: 'none',
              fontSize: '15px',
              fontWeight: 500,
              padding: '16px 40px',
              borderRadius: '100px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            Get in touch
            <ArrowRight className="w-4 h-4" />
          </m.button>

          <p style={{
            fontSize: '12px',
            color: 'rgba(255,255,255,0.2)',
            marginTop: '16px'
          }}>
            Response within 24 hours
          </p>
        </m.section>

        {/* Footer */}
        <footer 
          className="py-10 text-center"
          style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}
        >
          <p style={{ 
            fontSize: '11px', 
            letterSpacing: '0.05em',
            color: 'rgba(255,255,255,0.12)' 
          }}>
            WEB4TG
          </p>
        </footer>

        <div style={{ height: '90px' }} />
      </div>
    </div>
  );
}

function FeatureRow({ title, sub, index }: { title: string; sub: string; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <m.div
      ref={ref}
      initial={{ opacity: 0, y: 15 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      style={{
        padding: '24px 0',
        borderBottom: '1px solid rgba(255,255,255,0.04)'
      }}
    >
      <h3 style={{
        fontSize: '22px',
        fontWeight: 500,
        letterSpacing: '-0.02em',
        color: '#FFFFFF',
        marginBottom: '4px'
      }}>
        {title}
      </h3>
      <p style={{
        fontSize: '14px',
        color: 'rgba(255,255,255,0.4)'
      }}>
        {sub}
      </p>
    </m.div>
  );
}

export default ShowcasePage;
