import { useRef, useState, type KeyboardEvent } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { aboutStudioContent } from './aboutStudioContent';
import './AboutPage.css';

interface AboutPageProps { onNavigate: (section: string) => void }

export default function AboutPage({ onNavigate }: AboutPageProps) {
  const { language } = useLanguage();
  const copy = aboutStudioContent[language === 'ru' ? 'ru' : 'en'];
  const [selected, setSelected] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const explore = () => document.getElementById('about-story')?.scrollIntoView({
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    block: 'start',
  });

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next: number;
    if (event.key === 'ArrowRight') next = (index + 1) % copy.scenarios.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + copy.scenarios.length) % copy.scenarios.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = copy.scenarios.length - 1;
    else return;
    event.preventDefault();
    setSelected(next);
    tabs.current[next]?.focus();
  };

  return <main className="studio-about" data-testid="about-page">
    <div className="studio-about__inner">
      <header className="studio-about__hero">
        <span className="studio-about__eyebrow">{copy.eyebrow}</span>
        <h1>{copy.title}</h1>
        <p>{copy.intro}</p>
        <div className="studio-about__hero-art">
          <img src="/about-studio/hero.webp?v=retro-1" alt={copy.heroAlt} fetchPriority="high" decoding="async" onError={event => { event.currentTarget.hidden = true; }}/>
        </div>
        <button className="studio-about__primary" type="button" onClick={() => onNavigate('constructor')} data-testid="button-cta-constructor">{copy.order}<ArrowRight size={19} aria-hidden="true"/></button>
        <button className="studio-about__more" type="button" onClick={explore}>{copy.explore}<ArrowDown size={16} aria-hidden="true"/></button>
      </header>

      <section className="studio-about__section studio-about__intro-section" id="about-story" aria-labelledby="about-intro-title">
        <span className="studio-about__eyebrow">{copy.aboutLabel}</span>
        <h2 id="about-intro-title">{copy.aboutTitle}</h2>
        <p className="studio-about__lead">{copy.aboutText}</p>
      </section>

      <section className="studio-about__section studio-about__scenarios" aria-labelledby="about-scenarios-title">
        <span className="studio-about__eyebrow">{copy.scenariosLabel}</span>
        <h2 id="about-scenarios-title">{copy.scenariosTitle}</h2>
        <p className="studio-about__lead">{copy.scenariosText}</p>
        <div className="studio-about__tabs" role="tablist" aria-label={copy.tabsLabel}>
          {copy.scenarios.map((item, index) => <button key={item.tab} ref={node => { tabs.current[index] = node; }} id={`about-tab-${index}`} type="button" role="tab" aria-selected={selected === index} aria-controls={`about-scenario-${index}`} tabIndex={selected === index ? 0 : -1} onClick={() => setSelected(index)} onKeyDown={event => onTabKeyDown(event, index)}>{item.tab}</button>)}
        </div>
        <div className="studio-about__scenario-stack">
          {copy.scenarios.map((item, index) => <div key={item.tab} className="studio-about__scenario" id={`about-scenario-${index}`} role="tabpanel" aria-labelledby={`about-tab-${index}`} aria-hidden={selected !== index} data-active={selected === index} tabIndex={selected === index ? 0 : -1}>
            <h3>{item.title}</h3>
            <span className="studio-about__eyebrow studio-about__route-label">{copy.routeLabel}</span>
            <p className="studio-about__route">{item.path}</p>
            <p className="studio-about__scenario-text">{item.text}</p>
            <div className="studio-about__options"><span className="studio-about__eyebrow">{copy.featuresLabel}</span><ul>{item.features.map(feature => <li key={feature}>{feature}</li>)}</ul></div>
            <p className="studio-about__note">{copy.scenarioNote}</p>
          </div>)}
        </div>
        <button type="button" className="studio-about__text-link" onClick={() => onNavigate('projects')} data-testid="about-open-projects">{copy.examples}<ArrowUpRight size={16} aria-hidden="true"/></button>
      </section>

      <section className="studio-about__section" aria-labelledby="about-sides-title">
        <span className="studio-about__eyebrow">{copy.sidesLabel}</span>
        <h2 id="about-sides-title">{copy.sidesTitle}</h2>
        <div className="studio-about__sides">
          <article><span className="studio-about__side-index">01</span><div><h3>{copy.clientTitle}</h3><p>{copy.clientText}</p></div></article>
          <article><span className="studio-about__side-index">02</span><div><h3>{copy.teamTitle}</h3><p>{copy.teamText}</p></div></article>
        </div>
      </section>

      <section className="studio-about__ai" aria-labelledby="about-ai-title">
        <span className="studio-about__eyebrow">{copy.aiLabel}</span>
        <h2 id="about-ai-title">{copy.aiTitle}</h2>
        <p>{copy.aiText}</p>
        <button type="button" className="studio-about__ai-action" onClick={() => onNavigate('ai-process')} data-testid="about-open-ai">{copy.aiAction}<ArrowUpRight size={16} aria-hidden="true"/></button>
      </section>

      <section className="studio-about__section" aria-labelledby="about-process-title">
        <span className="studio-about__eyebrow">{copy.processLabel}</span>
        <h2 id="about-process-title">{copy.processTitle}</h2>
        <ol className="studio-about__steps">{copy.steps.map((step, index) => <li key={step.title}><span className="studio-about__step-index">0{index + 1}</span><div><h3>{step.title}</h3><p>{step.text}</p></div></li>)}</ol>
        <div className="studio-about__support"><h3>{copy.supportTitle}</h3><p>{copy.supportText}</p></div>
      </section>

      <section className="studio-about__section" aria-labelledby="about-faq-title">
        <span className="studio-about__eyebrow">{copy.faqLabel}</span>
        <h2 id="about-faq-title">{copy.faqTitle}</h2>
        <div className="studio-about__faqs">{copy.faqs.map(item => <details key={item.q}><summary>{item.q}<span aria-hidden="true" /></summary><p>{item.a}</p></details>)}</div>
      </section>

      <section className="studio-about__finish" aria-labelledby="about-finish-title">
        <span className="studio-about__eyebrow">{copy.finalLabel}</span>
        <h2 id="about-finish-title">{copy.finalTitle}</h2>
        <p>{copy.finalText}</p>
        <button className="studio-about__primary" type="button" onClick={() => onNavigate('constructor')} data-testid="about-calculate">{copy.calculate}<ArrowRight size={19} aria-hidden="true"/></button>
        <a className="studio-about__contact" href="https://t.me/web4tgs" target="_blank" rel="noopener noreferrer">{copy.contact}<ArrowUpRight size={16} aria-hidden="true"/></a>
      </section>
    </div>
  </main>;
}
