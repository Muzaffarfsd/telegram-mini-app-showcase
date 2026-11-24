import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useHaptic } from '../hooks/useHaptic';
import { useViewedDemos } from '../hooks/useTelegramStorage';
import HomeDemo from './HomeDemo';
import HomeStory from './HomeStory';
import { StudioContactLink } from './StudioContactLink';
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
        <div className="studio-intro">
          <h1 id="studio-home-title"><span>{ru ? 'Ваш бизнес' : 'Your business'}</span>{' '}<span>{ru ? 'в Telegram.' : 'in Telegram.'}</span></h1>
          <p className="studio-intro-copy">{ru ? 'Создадим магазин или сервис записи, который ваши клиенты откроют прямо из чата.' : 'A shop or booking app for your business that customers can open right from a chat.'}</p>
          <div className="studio-intro-actions">
            <StudioContactLink ru={ru} />
            <button type="button" onClick={() => go('projects')}>{ru ? 'Смотреть витрину' : 'Explore apps'} <ArrowRight size={16} aria-hidden="true"/></button>
            <button type="button" onClick={() => go('constructor')} data-testid="home-start-order">{ru ? 'Рассчитать проект' : 'Get an estimate'} <ArrowUpRight size={16} aria-hidden="true"/></button>
          </div>
        </div>
        <HomeDemo ru={ru} onOpenDemo={openDemo}/>
      </section>

      <HomeStory ru={ru} onNavigate={onNavigate} onOpenDemo={openDemo}/>
    </div>
  </main>;
}
