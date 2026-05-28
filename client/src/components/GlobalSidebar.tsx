import { useState, useCallback, useEffect, useRef, forwardRef, memo, useMemo } from "react";
import { ChevronRight, ArrowUpRight, Send } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { SiInstagram, SiTelegram, SiYoutube, SiTiktok } from "react-icons/si";
import UserAvatar from "./UserAvatar";
import { useLanguage } from "../contexts/LanguageContext";

interface GlobalSidebarProps {
  currentRoute: string;
  onNavigate: (section: string) => void;
  user?: { photo_url?: string; first_name?: string };
}

/* ====================================================================
   WEB4TG — global menu · Apple-grade minimal drawer · OLED black · 2026
   ==================================================================== */

const FONT = '"Manrope", -apple-system, BlinkMacSystemFont, system-ui, sans-serif';
const EM = '#34d399';
const EM_SOFT = '#6ee7b7';

interface AnimatedHamburgerIconProps {
  isOpen: boolean;
  onClick: () => void;
  ariaLabel: string;
  testId: string;
}

const AnimatedHamburgerIcon = memo(forwardRef<HTMLButtonElement, AnimatedHamburgerIconProps>(
  ({ isOpen, onClick, ariaLabel, testId }, ref) => {
    const [isHovered, setIsHovered] = useState(false);
    const className = useMemo(
      () => `hb-btn ${isOpen ? 'open' : ''} ${isHovered ? 'hovered' : ''}`,
      [isOpen, isHovered]
    );
    return (
      <button
        ref={ref}
        onClick={() => onClick()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={className}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        data-testid={testId}
      >
        <span className="hb-icon">
          <span className={`hb-line l1 ${isOpen ? 'open' : ''}`} />
          <span className={`hb-line l2 ${isOpen ? 'open' : ''}`} />
          <span className={`hb-line l3 ${isOpen ? 'open' : ''}`} />
        </span>
      </button>
    );
  }
));
AnimatedHamburgerIcon.displayName = 'AnimatedHamburgerIcon';

export default function GlobalSidebar({ currentRoute, onNavigate, user }: GlobalSidebarProps) {
  const { isDark } = useTheme();
  const { t, language } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pressedItem, setPressedItem] = useState<string | null>(null);
  const [, setIsAnimating] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);
  const touchStartX = useRef<number>(0);
  const touchCurrentX = useRef<number>(0);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [swipeOpenOffset, setSwipeOpenOffset] = useState(0);
  const isSwipingToOpen = useRef(false);
  const edgeSwipeStartX = useRef<number>(0);
  const edgeSwipeStartY = useRef<number>(0);
  const swipeDirection = useRef<'horizontal' | 'vertical' | null>(null);

  useEffect(() => {
    try {
      const tg = (window as any).Telegram?.WebApp;
      if (tg?.SecondaryButton) tg.SecondaryButton.setText(t('actions.share'));
    } catch (e) {}
  }, [language, t]);

  const menuItems = [
    { label: t('sidebar.home'), section: '', routes: ['showcase'] },
    { label: t('sidebar.businessApps'), section: 'projects', routes: ['projects'] },
    { label: t('sidebar.aiForBusiness'), section: 'ai-process', routes: ['aiProcess', 'aiAgent'] },
    { label: t('sidebar.aboutStudio'), section: 'about', routes: ['about'] },
    { label: t('sidebar.orderProject'), section: 'constructor', routes: ['constructor', 'checkout'] },
    { label: t('sidebar.analytics'), section: 'analytics', routes: ['analytics'] },
  ];

  const stages = [t('sidebar.brief'), t('sidebar.design'), t('sidebar.code'), t('sidebar.launch')];
  const activeStage = 1;

  // openExternal: route http(s) URL through the OS so iOS/Android Universal
  // Links / App Links open the native app (TikTok, YouTube, Instagram...) instead
  // of Telegram's in-app browser.  Falls back to a normal new-tab open elsewhere.
  const openExternal = useCallback((url: string) => {
    try {
      const tg = (window as any).Telegram?.WebApp;
      if (tg?.openLink) { tg.openLink(url, { try_instant_view: false }); return; }
    } catch (e) {}
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  const socialLinks = [
    { icon: SiTelegram, label: t('sidebar.telegramChannel'), url: 'https://t.me/web4_tg' },
    { icon: SiInstagram, label: 'Instagram', url: 'https://instagram.com/web4tg' },
    { icon: SiTiktok, label: 'TikTok', url: 'https://tiktok.com/@web4tg' },
    { icon: SiYoutube, label: 'YouTube', url: 'https://www.youtube.com/channel/UCnI08ZJJAB6CpEW5nLH5J5Q' },
    { icon: Send, label: t('sidebar.consultation'), url: 'https://t.me/web4tgs' },
  ];

  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    try {
      const tg = (window as any).Telegram?.WebApp;
      if (tg?.HapticFeedback) {
        if (type === 'light') tg.HapticFeedback.impactOccurred('light');
        else if (type === 'medium') tg.HapticFeedback.impactOccurred('medium');
        else tg.HapticFeedback.impactOccurred('heavy');
      }
    } catch (e) {}
  }, []);

  const openSidebar = useCallback(() => {
    setIsAnimating(true);
    setSidebarOpen(true);
    triggerHaptic('medium');
    setTimeout(() => { firstFocusableRef.current?.focus(); }, 100);
  }, [triggerHaptic]);

  const closeSidebar = useCallback(() => {
    setIsAnimating(true);
    setSidebarOpen(false);
    setSwipeOffset(0);
    triggerHaptic('light');
    setTimeout(() => {
      setIsAnimating(false);
      triggerButtonRef.current?.focus();
    }, 350);
  }, [triggerHaptic]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && sidebarOpen) closeSidebar();
    };
    if (sidebarOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [sidebarOpen, closeSidebar]);

  useEffect(() => {
    if (!sidebarOpen || !sidebarRef.current) return;
    const sidebar = sidebarRef.current;
    const focusable = sidebar.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0] as HTMLElement;
    const last = focusable[focusable.length - 1] as HTMLElement;
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };
    sidebar.addEventListener('keydown', handleTab);
    return () => sidebar.removeEventListener('keydown', handleTab);
  }, [sidebarOpen]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchCurrentX.current = e.touches[0].clientX;
  }, []);
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchCurrentX.current = e.touches[0].clientX;
    const diff = touchStartX.current - touchCurrentX.current;
    if (diff > 0) setSwipeOffset(Math.min(diff, 380));
  }, []);
  const handleTouchEnd = useCallback(() => {
    const diff = touchStartX.current - touchCurrentX.current;
    if (diff > 100) closeSidebar();
    else setSwipeOffset(0);
    touchStartX.current = 0;
    touchCurrentX.current = 0;
  }, [closeSidebar]);

  const handleEdgeTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    if (touch.clientX <= 25 && !sidebarOpen) {
      isSwipingToOpen.current = true;
      edgeSwipeStartX.current = touch.clientX;
      edgeSwipeStartY.current = touch.clientY;
      swipeDirection.current = null;
    }
  }, [sidebarOpen]);
  const handleEdgeTouchMove = useCallback((e: TouchEvent) => {
    if (!isSwipingToOpen.current) return;
    const touch = e.touches[0];
    const diffX = touch.clientX - edgeSwipeStartX.current;
    const diffY = touch.clientY - edgeSwipeStartY.current;
    if (swipeDirection.current === null && (Math.abs(diffX) > 20 || Math.abs(diffY) > 20)) {
      swipeDirection.current = Math.abs(diffX) > Math.abs(diffY) * 2 ? 'horizontal' : 'vertical';
    }
    if (swipeDirection.current === 'horizontal' && diffX > 30) {
      e.preventDefault();
      const w = Math.min(370, window.innerWidth - 40);
      setSwipeOpenOffset(Math.min(diffX, w));
    }
  }, []);
  const handleEdgeTouchEnd = useCallback(() => {
    if (!isSwipingToOpen.current) return;
    const w = Math.min(370, window.innerWidth - 40);
    if (swipeOpenOffset > w * 0.3) openSidebar();
    setSwipeOpenOffset(0);
    isSwipingToOpen.current = false;
    edgeSwipeStartX.current = 0;
    edgeSwipeStartY.current = 0;
    swipeDirection.current = null;
  }, [swipeOpenOffset, openSidebar]);

  useEffect(() => {
    if (sidebarOpen) return;
    document.addEventListener('touchstart', handleEdgeTouchStart, { passive: true });
    document.addEventListener('touchmove', handleEdgeTouchMove, { passive: false });
    document.addEventListener('touchend', handleEdgeTouchEnd, { passive: true });
    return () => {
      document.removeEventListener('touchstart', handleEdgeTouchStart);
      document.removeEventListener('touchmove', handleEdgeTouchMove);
      document.removeEventListener('touchend', handleEdgeTouchEnd);
    };
  }, [sidebarOpen, handleEdgeTouchStart, handleEdgeTouchMove, handleEdgeTouchEnd]);

  const isActive = (routes: string[]) => routes.includes(currentRoute);
  const isProfileActive = ['profile', 'referral', 'rewards', 'earning'].includes(currentRoute);

  const handleNavClick = useCallback((section: string) => {
    setPressedItem(section);
    triggerHaptic('light');
    setTimeout(() => {
      onNavigate(section);
      closeSidebar();
      setPressedItem(null);
    }, 170);
  }, [onNavigate, closeSidebar, triggerHaptic]);

  return (
    <>
      <style>{`
        /* ── hamburger ── */
        .hb-btn{
          width:52px;height:52px;display:flex;align-items:center;justify-content:center;
          border-radius:13px;background:rgba(255,255,255,0.06);
          border:1px solid rgba(255,255,255,0.11);cursor:pointer;
          -webkit-tap-highlight-color:transparent;position:relative;
          transition:transform .24s cubic-bezier(.34,1.5,.64,1),background .2s,border-color .2s;
        }
        .hb-btn.hovered{background:rgba(255,255,255,0.1);}
        .hb-btn.open{background:rgba(52,211,153,0.13);border-color:rgba(52,211,153,0.32);}
        .hb-btn:active{transform:scale(.9);}
        .hb-icon{width:17px;height:11px;position:relative;display:flex;flex-direction:column;
          justify-content:space-between;align-items:flex-start;}
        .hb-line{display:block;height:1.8px;border-radius:2px;background:#fff;
          transition:transform .34s cubic-bezier(.68,-0.5,.27,1.5),opacity .2s,width .24s,background .2s;
          transform-origin:center;}
        .hb-line.l1{width:100%;} .hb-line.l2{width:62%;} .hb-line.l3{width:100%;}
        .hb-btn.hovered .hb-line.l2{width:100%;}
        .hb-line.l1.open{transform:translateY(4.6px) rotate(45deg);width:100%;background:${EM_SOFT};}
        .hb-line.l2.open{opacity:0;transform:scaleX(0);}
        .hb-line.l3.open{transform:translateY(-4.6px) rotate(-45deg);width:100%;background:${EM_SOFT};}
        html.light .hb-btn{background:rgba(0,0,0,0.05);border-color:rgba(0,0,0,0.1);}
        html.light .hb-btn.hovered{background:rgba(0,0,0,0.08);}
        html.light .hb-line{background:#16181c;}
        html.light .hb-btn.open{background:rgba(52,211,153,0.13);border-color:rgba(52,211,153,0.4);}

        /* ── overlay + panel ── */
        .w4m-overlay{
          position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,0.34);
          backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px);
          opacity:0;pointer-events:none;transition:opacity .32s ease;touch-action:none;
        }
        .w4m-overlay.open{opacity:1;pointer-events:auto;}
        .w4m-panel{
          position:fixed;top:0;left:0;height:100%;z-index:100001;
          width:min(372px,calc(100vw - 38px));
          /* Frosted-glass material — translucent dark + backdrop blur.
             No bright inset highlights, no glowing border, no inner halo —
             those were the "lines/shadows" we removed.  Just clean glass. */
          background:rgba(14,15,18,0.78);
          backdrop-filter:blur(28px) saturate(140%);
          -webkit-backdrop-filter:blur(28px) saturate(140%);
          border-right:none;
          border-radius:0 26px 26px 0;
          /* No shadow in closed state — only the outer drop shadow on .open. */
          box-shadow:none;
          display:flex;flex-direction:column;
          overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;
          transform:translate3d(-100%,0,0);
          transition:transform .44s cubic-bezier(.32,.72,0,1),
                     box-shadow .32s ease-out;
          will-change:transform;
        }
        .w4m-panel.open{
          transform:translate3d(0,0,0);
          box-shadow:36px 0 110px rgba(0,0,0,0.62);
        }
        .w4m-panel::-webkit-scrollbar{display:none;}
        .w4m-panel{scrollbar-width:none;}

        /* ── nav row ── */
        .w4m-row{
          display:flex;align-items:center;width:100%;
          padding:17px 4px;background:transparent;border:none;cursor:pointer;
          border-top:1px solid rgba(255,255,255,0.07);
          text-align:left;-webkit-tap-highlight-color:transparent;
          opacity:0;transform:translateX(-10px);
          transition:opacity .5s ease,transform .5s cubic-bezier(.22,1,.36,1),background-color .18s ease;
        }
        .w4m-panel.open .w4m-row{opacity:1;transform:translateX(0);}
        .w4m-row:active{background-color:rgba(255,255,255,0.045);}

        /* ── controls ── */
        .w4m-tap{transition:transform .16s cubic-bezier(.22,1,.36,1),background-color .18s ease;-webkit-tap-highlight-color:transparent;}
        .w4m-tap:active{transform:scale(.97);}
        .w4m-cta{
          display:flex;align-items:center;justify-content:center;gap:8px;width:100%;height:52px;
          border-radius:999px;background:${EM};border:none;cursor:pointer;
          transition:transform .18s cubic-bezier(.22,1,.36,1);-webkit-tap-highlight-color:transparent;
        }
        .w4m-cta:active{transform:scale(.975);}
        .w4m-soc{
          width:44px;height:44px;display:flex;align-items:center;justify-content:center;
          border-radius:14px;background:rgba(255,255,255,0.07);
          border:1px solid rgba(255,255,255,0.12);cursor:pointer;
          transition:transform .2s cubic-bezier(.34,1.5,.64,1),background-color .18s ease;
          -webkit-tap-highlight-color:transparent;
        }
        .w4m-soc:active{transform:scale(.92);}
        .w4m-row:focus-visible,.w4m-tap:focus-visible,.w4m-cta:focus-visible,
        .w4m-soc:focus-visible,.hb-btn:focus-visible{outline:2px solid ${EM};outline-offset:3px;}

        /* ── top bar ── */
        .w4-topbar{
          position:fixed;top:0;left:0;right:0;z-index:90;
          background:rgba(0,0,0,0.55);
          backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
          border-bottom:1px solid rgba(255,255,255,0.06);
          padding-top:max(env(safe-area-inset-top,0px),var(--csat,0px),12px);
        }
        html.light .w4-topbar{background:rgba(250,250,252,0.8);border-bottom-color:rgba(0,0,0,0.07);}

        @media (prefers-reduced-motion:reduce){
          .hb-btn,.hb-line,.w4m-overlay,.w4m-panel,.w4m-row,.w4m-cta,.w4m-soc,.w4m-tap{
            transition-duration:.01ms!important;
          }
        }
      `}</style>

      {/* overlay */}
      <div
        className={`w4m-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={closeSidebar}
        aria-hidden="true"
        style={{
          opacity: sidebarOpen ? 1 : swipeOpenOffset > 0 ? swipeOpenOffset / 370 : 0,
          pointerEvents: sidebarOpen ? 'auto' : swipeOpenOffset > 0 ? 'auto' : 'none',
        }}
      />

      {/* panel */}
      <div
        ref={sidebarRef}
        className={`w4m-panel ${sidebarOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={t('sidebar.navigation')}
        style={{
          transform: sidebarOpen
            ? `translateX(${-swipeOffset}px)`
            : swipeOpenOffset > 0
              ? `translateX(calc(-100% + ${swipeOpenOffset}px))`
              : 'translateX(-100%)',
          transition: swipeOpenOffset > 0 ? 'none' : undefined,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div style={{ padding: 'calc(max(env(safe-area-inset-top, 0px), var(--csat, 0px)) + 18px) 24px 0' }}>
          {/* close */}
          <div className="flex items-center justify-end">
            <AnimatedHamburgerIcon ref={firstFocusableRef} isOpen={true} onClick={closeSidebar} ariaLabel={t('sidebar.closeMenu')} testId="button-menu-close" />
          </div>

          {/* profile */}
          <button
            onClick={() => handleNavClick('profile')}
            className="w4m-tap flex items-center"
            data-testid="button-nav-profile"
            style={{
              width: '100%', gap: 13, marginTop: 8, padding: '14px 4px',
              borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'transparent',
              border: 'none', borderBottomWidth: 1, borderBottomStyle: 'solid',
              borderBottomColor: 'rgba(255,255,255,0.07)', textAlign: 'left', cursor: 'pointer',
            }}
          >
            <UserAvatar photoUrl={user?.photo_url} firstName={user?.first_name} size="md" />
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{
                display: 'block', fontFamily: FONT, fontSize: '1rem', fontWeight: 600, color: '#fff',
                letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{user?.first_name || t('sidebar.guest')}</span>
              <span style={{ display: 'block', fontFamily: FONT, fontSize: '0.8rem', fontWeight: 500, color: 'rgba(255,255,255,0.62)', marginTop: 2 }}>
                {t('sidebar.myProfile')}
              </span>
            </span>
            <ChevronRight size={17} color={isProfileActive ? EM : 'rgba(255,255,255,0.32)'} />
          </button>

          {/* project status */}
          <div style={{ marginTop: 24 }}>
            <div style={{ fontFamily: FONT, fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)' }}>
              {t('sidebar.projectStatus')}
            </div>
            <div className="flex items-baseline justify-between" style={{ marginTop: 11 }}>
              <span style={{ fontFamily: FONT, fontSize: '0.95rem', fontWeight: 600, color: '#fff', letterSpacing: '-0.01em' }}>
                {stages[activeStage - 1]}
              </span>
              <span style={{ fontFamily: FONT, fontSize: '0.8rem', fontWeight: 500, color: 'rgba(255,255,255,0.62)', fontVariantNumeric: 'tabular-nums' }}>
                {language === 'ru' ? `Этап ${activeStage} из 4` : `Step ${activeStage} of 4`}
              </span>
            </div>
            <div style={{ marginTop: 10, height: 3, borderRadius: 999, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(activeStage / 4) * 100}%`, background: EM, borderRadius: 999 }} />
            </div>
          </div>

          {/* navigation */}
          <div style={{ marginTop: 28 }}>
            <div style={{ fontFamily: FONT, fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: 4 }}>
              {t('sidebar.navigation')}
            </div>
            <div>
              {menuItems.map((item, i) => {
                const active = isActive(item.routes);
                return (
                  <button
                    key={item.section || 'home'}
                    onClick={() => handleNavClick(item.section)}
                    className="w4m-row"
                    data-testid={`button-nav-${item.section || 'home'}`}
                    style={{ transitionDelay: sidebarOpen ? `${0.12 + i * 0.04}s` : '0s' }}
                  >
                    <span style={{
                      flex: 1, minWidth: 0, fontFamily: FONT, fontSize: '1.0625rem',
                      fontWeight: active ? 600 : 500, letterSpacing: '-0.015em',
                      color: active ? EM : 'rgba(255,255,255,0.9)',
                    }}>{item.label}</span>
                    <ChevronRight size={17} color={active ? EM : 'rgba(255,255,255,0.26)'} style={{ flexShrink: 0 }} />
                  </button>
                );
              })}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }} />
            </div>
          </div>
        </div>

        {/* bottom */}
        <div style={{ padding: '28px 24px calc(env(safe-area-inset-bottom, 0px) + 22px)' }}>
          <button onClick={() => handleNavClick('constructor')} className="w4m-cta" data-testid="button-discuss-project">
            <span style={{ fontFamily: FONT, fontSize: '0.95rem', fontWeight: 700, color: '#04140d', letterSpacing: '-0.01em' }}>
              {language === 'ru' ? 'Обсудить проект' : 'Discuss a project'}
            </span>
            <ArrowUpRight size={17} color="#04140d" strokeWidth={2.6} />
          </button>
          <div className="flex items-center justify-between" style={{ gap: 8, marginTop: 18 }}>
            {socialLinks.map((s) => (
              <a key={s.label} href={s.url}
                onClick={(e) => { e.preventDefault(); openExternal(s.url); }}
                target="_blank" rel="noopener noreferrer"
                className="w4m-soc" aria-label={s.label}
                data-testid={`link-social-${s.label.toLowerCase().replace(/\s+/g, '-')}`}>
                <s.icon size={17} color="rgba(255,255,255,0.6)" aria-hidden="true" focusable={false} />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* top bar */}
      <div className="w4-topbar">
        <div className="max-w-md mx-auto px-5 pt-5 pb-1 flex items-end justify-between gap-4" style={{ position: 'relative' }}>
          <div className="w-[60px]">
            <AnimatedHamburgerIcon
              ref={triggerButtonRef}
              isOpen={false}
              onClick={() => (sidebarOpen ? closeSidebar() : openSidebar())}
              ariaLabel={sidebarOpen ? t('sidebar.closeMenu') : t('sidebar.openMenu')}
              testId="button-hamburger"
            />
          </div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <span style={{
              fontFamily: '"Syne", system-ui, sans-serif', fontSize: '14px', fontWeight: 800, letterSpacing: '-0.03em',
              color: isDark ? 'rgba(255,255,255,0.7)' : '#000000',
              textShadow: isDark ? '0 0 20px rgba(255,255,255,0.15)' : 'none',
            }}>WEB4TG</span>
          </div>
          <div className="w-[60px]" aria-hidden="true" />
        </div>
      </div>
    </>
  );
}
