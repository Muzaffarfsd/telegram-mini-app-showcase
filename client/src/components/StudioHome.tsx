import { ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useHaptic } from '../hooks/useHaptic';
import { useViewedDemos } from '../hooks/useTelegramStorage';
import HomeDemo from './HomeDemo';
import HomeStory from './HomeStory';
import './StudioHome.css';

interface Props { onNavigate: (section: string) => void; onOpenDemo: (id: string) => void }

export default function StudioHome({ onNavigate, onOpenDemo }: Props) {
  const { language } = useLanguage();
  const ru = language === 'ru';
  const haptic = useHaptic();
  const { markAsViewed } = useViewedDemos();
  const go = (section: string) => { haptic.light(); onNavigate(section); };
  const openDemo = (id: string) => { haptic.light(); markAsViewed(id); onOpenDemo(id); };

  return <main className="studio-home" data-testid="home-page">
    <div className="studio-home__inner">
      <section className="studio-editorial" aria-labelledby="studio-home-title">
        <div className="studio-eyebrow"><span>WEB4TG | STUDIO</span></div>
        <h1 id="studio-home-title" aria-label={ru ? 'Ваш бизнес в Telegram' : 'Your business in Telegram'}><span>{ru ? 'ВАШ БИЗНЕС' : 'YOUR BUSINESS'}</span><span>{ru ? 'В TELEGRAM.' : 'IN TELEGRAM.'}</span></h1>
        <p className="studio-intro-copy">{ru ? 'Мы создаём приложение в Telegram, где удобно выбирать и заказывать.' : 'We create a Telegram app where customers can easily choose and order.'}</p>
        <HomeDemo ru={ru} onOpenDemo={openDemo}/>
        <div className="studio-intro-actions"><button type="button" onClick={() => go('projects')}>{ru ? 'Все примеры' : 'All examples'} <ArrowUpRight size={17} aria-hidden="true"/></button><button type="button" onClick={() => go('constructor')} data-testid="home-start-order">{ru ? 'Обсудить проект' : 'Discuss your project'} <ArrowUpRight size={17} aria-hidden="true"/></button></div>
      </section>

      <HomeStory ru={ru} onNavigate={onNavigate} onOpenDemo={openDemo}/>
    </div>
  </main>;
}
