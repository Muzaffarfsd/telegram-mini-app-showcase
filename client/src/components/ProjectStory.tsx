import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, ZoomIn } from 'lucide-react';
import { ShowcaseArtwork } from './ShowcaseArtwork';
import { ProjectScreenViewer } from './ProjectScreenViewer';
import { projectStories } from '../data/projectStories';
import { projectStoryScreens, type ProjectStoryScreen } from '../data/projectStoryScreens';
import './ProjectStory.css';

interface ProjectStoryProps {
  id: string;
  ru: boolean;
  onBack: () => void;
  onOpenProject: () => void;
  onOrder: () => void;
}

/** The project is opened from the showcase, which remains mounted behind this view. */
export function ProjectStory({ id, ru, onBack, onOpenProject, onOrder }: ProjectStoryProps) {
  const story = projectStories[id];
  const [selection, setSelection] = useState<{ id: string; screen: ProjectStoryScreen } | null>(null);
  const activeScreen = selection?.id === id ? selection.screen : null;
  useEffect(() => { setSelection(null); }, [id]);
  if (!story) return null;
  const locale = ru ? 0 : 1;
  const title = story.title[locale];
  const allScreens = projectStoryScreens[id] ?? [];
  const localizedScreens = allScreens.filter(screen => screen.language === (ru ? 'ru' : 'en'));
  const screens = localizedScreens.length ? localizedScreens : allScreens.filter(screen => screen.language === 'ru');

  return <main className="projects-showcase project-story" data-testid="project-story" data-project={id}>
    <div className="projects-page-frame project-story-inner">
      <button className="project-story-back" type="button" onClick={onBack} data-testid="project-story-back"><ArrowLeft size={19}/><span>{ru ? 'Витрина' : 'Showcase'}</span></button>
      <div className="project-story-topline"><span>{ru ? 'ПРОЕКТ WEB4TG' : 'A WEB4TG PROJECT'}</span><span aria-hidden="true"> / </span><span>{title}</span></div>
      <header className="project-story-intro">
        <h1 id="project-story-title">{story.headline[locale]}</h1>
        <p>{story.audience[locale]}</p>
      </header>
      <section className="project-story-hero" aria-label={title}>
        <div className="project-story-hero-copy"><span className="project-story-eyebrow">{ru ? 'ЗАДАЧА БИЗНЕСА' : 'THE BUSINESS NEED'}</span><p>{story.businessProblem[locale]}</p></div>
        <div className="project-story-hero-art" aria-hidden="true"><ShowcaseArtwork id={id} index={0} ru={ru}/></div>
        <div className="project-story-hero-footer"><button className="project-story-open" type="button" onClick={onOpenProject} data-testid="project-story-open">{ru ? 'Открыть проект' : 'Open app'}<ArrowUpRight size={17}/></button><button className="project-story-hero-order" type="button" onClick={onOrder} data-testid="project-story-order-intro">{ru ? 'Хочу такое' : 'Get similar'}<ArrowRight size={15}/></button></div>
      </section>
      <section className="project-story-value" aria-labelledby="project-story-value-title">
        <span className="project-story-eyebrow">{ru ? 'РЕШЕНИЕ В ПРОЕКТЕ' : 'THE SOLUTION'}</span>
        <h2 id="project-story-value-title">{ru ? 'Как это работает для бизнеса' : 'How it works for the business'}</h2>
        <ol className="project-story-value-list">{story.businessValue.map((item, index) => <li key={item.title[0]}><span className="project-story-value-number">{String(index + 1).padStart(2, '0')}</span><div><h3>{item.title[locale]}</h3><p>{item.description[locale]}</p></div></li>)}</ol>
      </section>
      <section className="project-story-flow" aria-labelledby="project-story-flow-title">
        <div className="project-story-section-heading"><div><span className="project-story-eyebrow">{ru ? 'ВНУТРИ ПРОЕКТА' : 'INSIDE THE PROJECT'}</span><h2 id="project-story-flow-title">{ru ? 'Путь клиента' : 'The customer journey'}</h2></div></div>
        {screens.length > 0 && <div className="project-story-gallery-section">
          <div className="project-story-gallery" role="group" tabIndex={0} aria-label={ru ? 'Экраны проекта' : 'Project screens'}>
            {screens.map((screen, index) => <figure className="project-story-gallery-item" key={screen.src}>
              <button className="project-story-gallery-stage" type="button" onClick={() => setSelection({ id, screen })} aria-label={`${ru ? 'Увеличить' : 'Enlarge'}: ${screen.caption[locale]}`}><span className="project-story-phone"><img src={screen.src} alt="" loading="lazy" decoding="async" width="390" height="844" /></span><span className="project-story-zoom" aria-hidden="true"><ZoomIn size={16}/></span></button>
              <figcaption><span>{String(index + 1).padStart(2, '0')}</span>{screen.caption[locale]}</figcaption>
            </figure>)}
          </div>
          {!ru && !localizedScreens.length && <p className="project-story-screen-language">Screens shown in Russian.</p>}
        </div>}
        <ol className="project-story-steps">{story.journey.map((step, index) => <li key={step.title[0]}><span className="project-story-number">{String(index + 1).padStart(2, '0')}</span><div><h3>{step.title[locale]}</h3><p>{step.description[locale]}</p></div></li>)}</ol>
      </section>
      <section className="project-story-features" aria-labelledby="project-story-features-title"><span className="project-story-eyebrow">{ru ? 'ВОЗМОЖНОСТИ' : 'FEATURES'}</span><h2 id="project-story-features-title">{ru ? 'Что умеет приложение' : 'What the app can do'}</h2><ul>{story.features.map(feature => <li key={feature[0]}><span><Check size={15}/></span>{feature[locale]}</li>)}</ul></section>
      <section className="project-story-contact"><h2>{ru ? 'Создадим приложение для вашего бизнеса' : 'Build an app for your business'}</h2><p>{ru ? 'Выберите направление и функции — подготовим проект к обсуждению.' : 'Choose a direction and features to start discussing your project.'}</p><button type="button" onClick={onOrder} data-testid="project-story-order">{ru ? 'Хочу похожее приложение' : 'I want a similar app'}<ArrowRight size={18}/></button></section>
    </div>
    {activeScreen && <ProjectScreenViewer screen={activeScreen} ru={ru} onClose={() => setSelection(null)} />}
  </main>;
}
