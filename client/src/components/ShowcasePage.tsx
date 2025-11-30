import { ArrowRight, Lock, X } from "lucide-react";
import { useCallback, useRef, useState, useEffect, useMemo } from "react";
import { m, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useTelegram } from '../hooks/useTelegram';
import { useHaptic } from '../hooks/useHaptic';
import { useVideoPreload } from '../hooks/useVideoPreload';
import { useVideoLazyLoad } from '../hooks/useVideoLazyLoad';
import { preloadDemo } from './demos/DemoRegistry';

const sneakerVideo = "/videos/ae01958370d099047455d799eba60389_1762352751328.mp4";
const watchesVideo = "/videos/ac56ea9bc8429fb2f0ffacfac0abe74d_1762353025450.mp4";
const fashionVideo = "/videos/4e4993d0ac079a607a0bee301af06749_1761775010830.mp4";

interface ShowcasePageProps {
  onNavigate: (section: string) => void;
  onOpenDemo: (demoId: string) => void;
}

/* ═══════════════════════════════════════════════════════════════════════════
   СВЯЩЕННАЯ ГЕОМЕТРИЯ - Культовый символ
═══════════════════════════════════════════════════════════════════════════ */
function SacredSigil({ size = 80, className = "" }: { size?: number; className?: string }) {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* Внешнее свечение */}
      <m.div
        className="absolute inset-0"
        animate={{ 
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 60%)',
          filter: 'blur(20px)'
        }}
      />
      
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className="relative z-10">
        {/* Внешний круг с градиентом */}
        <defs>
          <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.5)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.2)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.5)" />
          </linearGradient>
        </defs>
        
        {/* Концентрические кольца */}
        <m.circle 
          cx="50" cy="50" r="47" 
          stroke="url(#ring-gradient)" 
          strokeWidth="0.5" 
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
        />
        <circle cx="50" cy="50" r="38" stroke="rgba(255,255,255,0.25)" strokeWidth="0.5" fill="none" />
        <circle cx="50" cy="50" r="29" stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" fill="none" />
        <circle cx="50" cy="50" r="20" stroke="rgba(255,255,255,0.45)" strokeWidth="0.75" fill="none" />
        <circle cx="50" cy="50" r="11" stroke="rgba(255,255,255,0.6)" strokeWidth="1" fill="none" />
        
        {/* Крест - вертикаль власти */}
        <line x1="50" y1="3" x2="50" y2="97" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
        <line x1="3" y1="50" x2="97" y2="50" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
        
        {/* Диагонали */}
        <line x1="15" y1="15" x2="85" y2="85" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
        <line x1="85" y1="15" x2="15" y2="85" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
        
        {/* Центральное ядро */}
        <circle cx="50" cy="50" r="4" fill="rgba(255,255,255,0.9)" />
        <circle cx="50" cy="50" r="2" fill="#FFFFFF" />
        
        {/* Точки силы */}
        <circle cx="50" cy="12" r="1.5" fill="rgba(255,255,255,0.5)" />
        <circle cx="50" cy="88" r="1.5" fill="rgba(255,255,255,0.5)" />
        <circle cx="12" cy="50" r="1.5" fill="rgba(255,255,255,0.5)" />
        <circle cx="88" cy="50" r="1.5" fill="rgba(255,255,255,0.5)" />
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   СЧЁТЧИК ОБРАТНОГО ОТСЧЁТА - Реальное давление
═══════════════════════════════════════════════════════════════════════════ */
function UrgencyCountdown() {
  const [time, setTime] = useState({ h: 47, m: 59, s: 59 });
  
  useEffect(() => {
    const tick = () => {
      setTime(prev => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 47; m = 59; s = 59; }
        return { h, m, s };
      });
    };
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="flex items-center justify-center gap-1">
      {[
        { val: pad(time.h), label: 'ч' },
        { val: pad(time.m), label: 'м' },
        { val: pad(time.s), label: 'с' }
      ].map((unit, i) => (
        <div key={i} className="flex items-center">
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px',
            padding: '8px 10px',
            minWidth: '44px',
            textAlign: 'center'
          }}>
            <m.span
              key={unit.val}
              initial={{ opacity: 0.5, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                fontFamily: "'SF Mono', 'Roboto Mono', monospace",
                fontSize: '18px',
                fontWeight: 600,
                letterSpacing: '-0.02em',
                color: '#FFFFFF'
              }}
            >
              {unit.val}
            </m.span>
          </div>
          {i < 2 && (
            <span style={{ 
              color: 'rgba(255,255,255,0.3)', 
              fontSize: '16px', 
              margin: '0 2px',
              fontWeight: 300
            }}>:</span>
          )}
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   СЛОТ-ЛЕДЖЕР - Живое убывание мест
═══════════════════════════════════════════════════════════════════════════ */
function SlotLedger() {
  const [slots, setSlots] = useState(21);
  const [recentClaim, setRecentClaim] = useState<string | null>(null);
  
  const names = useMemo(() => [
    'A.K.', 'M.S.', 'D.V.', 'I.P.', 'S.N.', 'E.R.', 'K.L.', 'V.M.', 'O.T.', 'N.B.'
  ], []);

  useEffect(() => {
    const claimSlot = () => {
      if (slots > 7) {
        const name = names[Math.floor(Math.random() * names.length)];
        setRecentClaim(name);
        setSlots(s => s - 1);
        setTimeout(() => setRecentClaim(null), 3000);
      }
    };
    
    const interval = setInterval(claimSlot, 8000 + Math.random() * 12000);
    return () => clearInterval(interval);
  }, [slots, names]);

  return (
    <div className="text-center">
      <div 
        style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '16px',
          padding: '16px 24px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Живой индикатор */}
        <div className="flex items-center justify-center gap-3 mb-2">
          <m.div 
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }}
          />
          <span style={{ 
            fontSize: '11px', 
            fontWeight: 500, 
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.4)' 
          }}>
            LIVE
          </span>
        </div>
        
        {/* Счётчик мест */}
        <div className="flex items-baseline justify-center gap-2">
          <m.span
            key={slots}
            initial={{ scale: 1.2, color: '#10B981' }}
            animate={{ scale: 1, color: '#FFFFFF' }}
            transition={{ duration: 0.5 }}
            style={{
              fontSize: '40px',
              fontWeight: 300,
              letterSpacing: '-0.03em',
              lineHeight: 1
            }}
          >
            {slots}
          </m.span>
          <span style={{ 
            fontSize: '14px', 
            color: 'rgba(255,255,255,0.4)',
            fontWeight: 400
          }}>
            / 21
          </span>
        </div>
        
        <p style={{ 
          fontSize: '11px', 
          color: 'rgba(255,255,255,0.35)',
          marginTop: '8px',
          letterSpacing: '0.05em'
        }}>
          мест в этом сезоне
        </p>

        {/* Уведомление о занятии места */}
        <AnimatePresence>
          {recentClaim && (
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute bottom-0 left-0 right-0"
              style={{
                background: 'linear-gradient(180deg, transparent, rgba(16,185,129,0.1))',
                padding: '8px',
                borderBottomLeftRadius: '16px',
                borderBottomRightRadius: '16px'
              }}
            >
              <p style={{ fontSize: '10px', color: 'rgba(16,185,129,0.8)' }}>
                {recentClaim} только что получил доступ
              </p>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ЭЛИТНАЯ КНОПКА - Тактильный отклик
═══════════════════════════════════════════════════════════════════════════ */
function EliteButton({ 
  children, 
  onClick, 
  testId,
  variant = 'primary'
}: { 
  children: React.ReactNode; 
  onClick?: () => void;
  testId?: string;
  variant?: 'primary' | 'secondary';
}) {
  const [pressed, setPressed] = useState(false);
  const [ripple, setRipple] = useState(false);
  const isPrimary = variant === 'primary';

  const handleClick = () => {
    setRipple(true);
    setTimeout(() => setRipple(false), 600);
    onClick?.();
  };

  return (
    <m.button
      onClick={handleClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      data-testid={testId}
      animate={{ scale: pressed ? 0.97 : 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="w-full relative overflow-hidden"
      style={{
        background: isPrimary 
          ? 'linear-gradient(135deg, #FFFFFF 0%, #F0F0F0 100%)'
          : 'transparent',
        color: isPrimary ? '#000000' : 'rgba(255,255,255,0.7)',
        border: isPrimary ? 'none' : '1px solid rgba(255,255,255,0.15)',
        fontSize: '13px',
        fontWeight: 600,
        letterSpacing: '0.02em',
        padding: '16px 28px',
        borderRadius: '14px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        boxShadow: isPrimary ? '0 4px 20px rgba(255,255,255,0.15)' : 'none'
      }}
    >
      {/* Ripple effect */}
      <AnimatePresence>
        {ripple && (
          <m.div
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 rounded-full"
            style={{
              background: isPrimary 
                ? 'radial-gradient(circle, rgba(0,0,0,0.1) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)'
            }}
          />
        )}
      </AnimatePresence>
      
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </m.button>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   АРТЕФАКТ ВИДЕО - Реликвия коллекции
═══════════════════════════════════════════════════════════════════════════ */
function VideoRelic({ 
  video, 
  index,
  active,
  onActivate,
  onLeave,
  onClick
}: { 
  video: { id: string; ref: any; src: string; title: string; subtitle: string };
  index: number;
  active: boolean;
  onActivate: () => void;
  onLeave: () => void;
  onClick: () => void;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <m.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      onMouseEnter={() => { preloadDemo(video.id); onActivate(); }}
      onMouseLeave={onLeave}
      onTouchStart={() => preloadDemo(video.id)}
      className="cursor-pointer group"
      data-testid={`demo-card-${video.id}`}
    >
      <m.div 
        className="relative"
        animate={{ 
          scale: active ? 1.02 : 1,
          y: active ? -4 : 0
        }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        style={{
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: active 
            ? '0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.15)' 
            : '0 20px 50px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.08)'
        }}
      >
        <div style={{ aspectRatio: '16/9', position: 'relative' }}>
          <video
            ref={video.ref}
            src={video.src}
            loop muted playsInline preload="none"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ 
              transform: active ? 'scale(1.08)' : 'scale(1)',
              transition: 'transform 1s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          />
          
          {/* Градиентный оверлей */}
          <div 
            className="absolute inset-0 transition-all duration-700"
            style={{ 
              background: active
                ? 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.8) 100%)'
                : 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.85) 100%)'
            }}
          />
          
          {/* Номер серии */}
          <div className="absolute top-4 left-4">
            <span style={{
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.2em',
              color: 'rgba(255,255,255,0.4)',
              fontFamily: "'SF Mono', monospace"
            }}>
              №{String(index + 1).padStart(2, '0')}
            </span>
          </div>
          
          {/* Sigil в углу */}
          <m.div 
            className="absolute top-4 right-4"
            animate={{ opacity: active ? 0.6 : 0.2, rotate: active ? 45 : 0 }}
            transition={{ duration: 0.5 }}
          >
            <SacredSigil size={24} />
          </m.div>
          
          {/* Контент */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <m.div
              animate={{ y: active ? -4 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <p style={{
                fontSize: '10px',
                fontWeight: 600,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: active ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)',
                marginBottom: '6px',
                transition: 'color 0.3s'
              }}>
                {video.subtitle}
              </p>
              <h3 style={{
                fontSize: '22px',
                fontWeight: 600,
                letterSpacing: '-0.02em',
                color: '#FFFFFF'
              }}>
                {video.title}
              </h3>
            </m.div>
          </div>

          {/* Hover indicator */}
          <m.div
            className="absolute bottom-5 right-5"
            animate={{ 
              opacity: active ? 1 : 0,
              x: active ? 0 : -10
            }}
            transition={{ duration: 0.3 }}
          >
            <ArrowRight className="w-5 h-5 text-white" />
          </m.div>
        </div>
      </m.div>
    </m.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ГЛАВНАЯ СТРАНИЦА - AIDA Framework
═══════════════════════════════════════════════════════════════════════════ */
function ShowcasePage({ onNavigate, onOpenDemo }: ShowcasePageProps) {
  useTelegram();
  const haptic = useHaptic();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const [inviteCode, setInviteCode] = useState('');
  const [codeStatus, setCodeStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
  
  const videoRef1 = useVideoPreload();
  const videoRef2 = useVideoPreload();
  const videoRef3 = useVideoLazyLoad();

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -50]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  
  const openDemo = useCallback((id: string) => { 
    haptic.medium(); 
    onOpenDemo(id); 
  }, [haptic, onOpenDemo]);
  
  const contact = useCallback(() => { 
    haptic.heavy(); 
    onNavigate('contact'); 
  }, [haptic, onNavigate]);

  const validateCode = useCallback(() => {
    if (!inviteCode) return;
    setCodeStatus('checking');
    setTimeout(() => {
      setCodeStatus(inviteCode.length >= 6 ? 'valid' : 'invalid');
      setTimeout(() => setCodeStatus('idle'), 3000);
    }, 1500);
  }, [inviteCode]);

  const videos = [
    { id: 'sneaker-store', ref: videoRef1, src: sneakerVideo, title: 'SneakerVault', subtitle: 'КОЛЛЕКЦИЯ' },
    { id: 'luxury-watches', ref: videoRef2, src: watchesVideo, title: 'TimeElite', subtitle: 'ЭКСКЛЮЗИВ' },
    { id: 'clothing-store', ref: videoRef3, src: fashionVideo, title: 'Radiance', subtitle: 'ЛИМИТЕД' },
  ];

  return (
    <div className="min-h-screen w-full flex justify-center" style={{ background: '#000' }}>
      <div 
        ref={containerRef}
        className="w-full relative overflow-x-hidden"
        style={{ 
          maxWidth: '430px',
          background: '#030303',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
        }}
      >
        {/* Noise Texture Overlay */}
        <div 
          className="fixed inset-0 pointer-events-none z-50 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat'
          }}
        />

        {/* ══════════════════════════════════════════════════════════════════
            A T T E N T I O N — Ритуал входа
        ══════════════════════════════════════════════════════════════════ */}
        <m.section 
          className="relative px-6 pt-6 pb-16"
          style={{ opacity: heroOpacity, y: heroY }}
        >
          {/* Ambient aurora */}
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255,255,255,0.03) 0%, transparent 70%)',
            }}
          />

          <div className="relative z-10">
            {/* Sacred Sigil */}
            <m.div 
              className="flex justify-center mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <SacredSigil size={72} />
            </m.div>

            {/* Exclusive Badge */}
            <m.div 
              className="flex justify-center mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <div style={{
                fontSize: '9px',
                fontWeight: 600,
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.5)',
                padding: '10px 20px',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '100px',
                background: 'rgba(255,255,255,0.02)'
              }}>
                ТОЛЬКО ПО ПРИГЛАШЕНИЮ
              </div>
            </m.div>

            {/* Manifesto */}
            <m.div 
              className="text-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <h1 style={{
                fontSize: '32px',
                fontWeight: 300,
                letterSpacing: '-0.03em',
                lineHeight: 1.2,
                color: '#FFFFFF',
                marginBottom: '16px'
              }} data-testid="text-hero-main">
                Не для всех.
                <br />
                <span style={{ fontWeight: 600 }}>Для избранных.</span>
              </h1>
              
              <p style={{
                fontSize: '14px',
                fontWeight: 400,
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.4)',
                maxWidth: '280px',
                margin: '0 auto'
              }} data-testid="text-hero-manifesto">
                Telegram-приложения, которые получают только 0.7% обратившихся.
              </p>
            </m.div>

            {/* Countdown */}
            <m.div
              className="mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <p style={{
                fontSize: '10px',
                fontWeight: 500,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.35)',
                textAlign: 'center',
                marginBottom: '12px'
              }}>
                Окно закрывается через
              </p>
              <UrgencyCountdown />
            </m.div>

            {/* Slot Ledger */}
            <m.div
              className="mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.6 }}
            >
              <SlotLedger />
            </m.div>

            {/* CTA Buttons */}
            <m.div
              className="space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.6 }}
            >
              <EliteButton onClick={contact} testId="button-request-access">
                Запросить доступ
                <Lock className="w-4 h-4" />
              </EliteButton>

              <EliteButton 
                variant="secondary"
                onClick={() => {
                  haptic.light();
                  document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' });
                }}
                testId="button-view-work"
              >
                Изучить коллекцию
              </EliteButton>
            </m.div>
          </div>
        </m.section>

        {/* ══════════════════════════════════════════════════════════════════
            I N T E R E S T — Коллекция реликвий
        ══════════════════════════════════════════════════════════════════ */}
        <section id="collection" className="px-4 pt-8 pb-12">
          <m.div 
            className="text-center mb-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center gap-3 mb-3">
              <div style={{ width: '24px', height: '1px', background: 'rgba(255,255,255,0.15)' }} />
              <SacredSigil size={16} />
              <div style={{ width: '24px', height: '1px', background: 'rgba(255,255,255,0.15)' }} />
            </div>
            <p style={{
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.35)',
              marginBottom: '8px'
            }}>
              ЗАКРЫТАЯ КОЛЛЕКЦИЯ
            </p>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 300,
              letterSpacing: '-0.02em',
              color: '#FFFFFF'
            }}>
              Работы членов клуба
            </h2>
          </m.div>

          <div className="space-y-5">
            {videos.map((v, i) => (
              <VideoRelic
                key={v.id}
                video={v}
                index={i}
                active={activeCard === i}
                onActivate={() => setActiveCard(i)}
                onLeave={() => setActiveCard(null)}
                onClick={() => openDemo(v.id)}
              />
            ))}
          </div>

          <m.div
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <button
              onClick={() => onNavigate('projects')}
              data-testid="button-view-all"
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255,255,255,0.4)',
                fontSize: '11px',
                fontWeight: 500,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              Вся коллекция
              <ArrowRight className="w-4 h-4" />
            </button>
          </m.div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            D E S I R E — Статус и эксклюзивность
        ══════════════════════════════════════════════════════════════════ */}
        <section className="px-6 py-16">
          <m.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* Quote */}
            <div className="text-center mb-12">
              <SacredSigil size={28} className="mx-auto mb-6" />
              
              <p style={{
                fontSize: '20px',
                fontWeight: 300,
                letterSpacing: '-0.01em',
                lineHeight: 1.5,
                color: 'rgba(255,255,255,0.85)',
                fontStyle: 'italic',
                marginBottom: '16px'
              }}>
                "Когда у тебя есть это —<br/>
                ты понимаешь разницу."
              </p>
              
              <p style={{
                fontSize: '10px',
                fontWeight: 600,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.25)'
              }}>
                — Член клуба #0017
              </p>
            </div>

            {/* Stats Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1px',
              background: 'rgba(255,255,255,0.06)',
              borderRadius: '20px',
              overflow: 'hidden'
            }}>
              {[
                { value: '0.7%', label: 'Одобренных заявок', highlight: true },
                { value: '48ч', label: 'Окно подачи' },
                { value: '∞', label: 'Поддержка навсегда' },
                { value: '21', label: 'Мест в сезоне' }
              ].map((stat, i) => (
                <m.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="text-center"
                  style={{ 
                    padding: '24px 16px', 
                    background: '#060606'
                  }}
                >
                  <p style={{
                    fontSize: '28px',
                    fontWeight: 300,
                    letterSpacing: '-0.02em',
                    color: stat.highlight ? '#FFFFFF' : 'rgba(255,255,255,0.9)',
                    marginBottom: '6px'
                  }}>
                    {stat.value}
                  </p>
                  <p style={{
                    fontSize: '9px',
                    fontWeight: 600,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.3)'
                  }}>
                    {stat.label}
                  </p>
                </m.div>
              ))}
            </div>
          </m.div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            A C T I O N — Ритуал инициации
        ══════════════════════════════════════════════════════════════════ */}
        <section className="px-6 py-16">
          <m.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <SacredSigil size={48} className="mx-auto mb-8" />

            <h2 style={{
              fontSize: '28px',
              fontWeight: 300,
              letterSpacing: '-0.02em',
              color: '#FFFFFF',
              marginBottom: '8px'
            }}>
              Готовы вступить?
            </h2>
            
            <p style={{
              fontSize: '13px',
              color: 'rgba(255,255,255,0.35)',
              marginBottom: '24px'
            }}>
              Введите инвайт-код для приоритетного доступа
            </p>

            {/* Invite Code Input */}
            <div className="mb-6">
              <div 
                className="relative"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: `1px solid ${
                    codeStatus === 'valid' ? 'rgba(16,185,129,0.5)' :
                    codeStatus === 'invalid' ? 'rgba(239,68,68,0.5)' :
                    'rgba(255,255,255,0.08)'
                  }`,
                  borderRadius: '14px',
                  padding: '4px',
                  transition: 'border-color 0.3s'
                }}
              >
                <div className="flex">
                  <input
                    type="text"
                    placeholder="XXXXXX"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase().slice(0, 8))}
                    onKeyDown={(e) => e.key === 'Enter' && validateCode()}
                    data-testid="input-invite-code"
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      padding: '14px 16px',
                      fontSize: '14px',
                      fontWeight: 600,
                      letterSpacing: '0.15em',
                      color: '#FFFFFF',
                      textAlign: 'center',
                      textTransform: 'uppercase',
                      fontFamily: "'SF Mono', monospace"
                    }}
                  />
                  {inviteCode && (
                    <button
                      onClick={() => setInviteCode('')}
                      className="px-3"
                      style={{ color: 'rgba(255,255,255,0.3)' }}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              
              <AnimatePresence mode="wait">
                <m.p
                  key={codeStatus}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  style={{
                    fontSize: '10px',
                    color: codeStatus === 'valid' ? '#10B981' : 
                           codeStatus === 'invalid' ? '#EF4444' : 
                           'rgba(255,255,255,0.25)',
                    marginTop: '10px'
                  }}
                >
                  {codeStatus === 'checking' ? 'Проверка кода...' :
                   codeStatus === 'valid' ? 'Код принят. Приоритетный доступ активирован.' :
                   codeStatus === 'invalid' ? 'Код не найден.' :
                   'Нет кода? Подайте заявку на общих основаниях.'}
                </m.p>
              </AnimatePresence>
            </div>

            <EliteButton onClick={contact} testId="button-cta-apply">
              Подать заявку
              <ArrowRight className="w-4 h-4" />
            </EliteButton>

            <p style={{
              fontSize: '11px',
              color: 'rgba(255,255,255,0.2)',
              marginTop: '20px'
            }}>
              Ответ в течение 24 часов
            </p>
          </m.div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-12 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <SacredSigil size={24} className="mx-auto mb-4" />
          <p style={{ 
            fontSize: '9px', 
            fontWeight: 600,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.15)' 
          }}>
            WEB4TG STUDIO · EST. 2024
          </p>
          <p style={{ 
            fontSize: '10px', 
            color: 'rgba(255,255,255,0.1)',
            marginTop: '8px'
          }}>
            Доступ ограничен
          </p>
        </footer>

        <div style={{ height: '90px' }} />
      </div>
    </div>
  );
}

export default ShowcasePage;
