import { memo, useState } from 'react';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTelegram } from '../hooks/useTelegram';
import { navigate } from '../hooks/useRouting';
import { ProfileDetailArtwork, ProfileDetailLayout } from './ProfileDetailLayout';
import helpArtwork from '../assets/profile/help-detail-v1.webp';

interface HelpPageProps {
  onBack: () => void;
}

const HelpPage = memo(function HelpPage({ onBack }: HelpPageProps) {
  const { language } = useLanguage();
  const { openTelegramLink } = useTelegram();
  const ru = language === 'ru';
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);
  const [topic, setTopic] = useState<'all' | 'order' | 'projects' | 'support'>('all');
  const faq = ru
    ? [
        [
          'Как заказать приложение?',
          'Выберите направление и нужные функции в разделе заказа. Затем можно отправить нам заявку в Telegram.',
        ],
        [
          'От чего зависит стоимость?',
          'От типа приложения, выбранных функций и условий сопровождения. Детали проекта обсудим с вами отдельно.',
        ],
        [
          'Где посмотреть свои проекты?',
          'Откройте «Мои проекты» в профиле. Если проект не отображается, напишите нам в Telegram.',
        ],
        [
          'Можно ли доработать приложение?',
          'Расскажите нам о текущем приложении и желаемых изменениях — обсудим задачу и возможный формат работы.',
        ],
        [
          'Как получить помощь после запуска?',
          'Напишите нам в Telegram и опишите вопрос. Условия сопровождения согласовываются для каждого проекта.',
        ],
      ]
    : [
        [
          'How do I order an app?',
          'Choose a business type and features in the order section, then send us your request in Telegram.',
        ],
        [
          'What affects the price?',
          'The app type, selected features and support terms. We will discuss the details of your project with you.',
        ],
        [
          'Where can I see my projects?',
          'Open “My projects” in your profile. If a project is missing, contact us in Telegram.',
        ],
        [
          'Can an existing app be improved?',
          'Tell us about your current app and the changes you need; we can discuss the project together.',
        ],
        [
          'How can I get help after launch?',
          'Message us in Telegram and describe your question. Support terms are agreed for each project.',
        ],
      ];

  return (
    <ProfileDetailLayout
      title={ru ? 'Мы рядом' : 'We are here to help'}
      intro={
        ru
          ? 'Ответы на частые вопросы и прямая связь с нами.'
          : 'Helpful answers and a direct way to reach us.'
      }
      eyebrow={ru ? 'ЦЕНТР ПОМОЩИ' : 'HELP CENTRE'}
      onBack={onBack}
      testId="profile-help-page"
    >
      <div className="pd-card pd-help-hero">
        <div>
          <span className="pd-kicker">{ru ? 'ХОРОШИЙ ВОПРОС' : 'A GOOD QUESTION'}</span>
          <strong>{ru ? 'Разберёмся вместе' : 'Let’s figure it out'}</strong>
          <p>
            {ru
              ? 'От первого вопроса до деталей проекта.'
              : 'From your first question to the project details.'}
          </p>
        </div>
        <ProfileDetailArtwork src={helpArtwork} className="pd-help-hero-art" />
      </div>
      <button
        className="pd-button full pd-after-hero"
        type="button"
        onClick={() => openTelegramLink('https://t.me/web4tgs')}
        data-testid="button-telegram-support"
      >
        {ru ? 'Написать в Telegram' : 'Message us on Telegram'} <ArrowUpRight size={17} aria-hidden="true" />
      </button>

      <section className="pd-section" aria-labelledby="help-faq-title">
        <div className="pd-section-title">
          <div>
            <span className="pd-kicker">{ru ? 'ПОЛЕЗНО ЗНАТЬ' : 'GOOD TO KNOW'}</span>
            <h2 id="help-faq-title">{ru ? 'Частые вопросы' : 'Frequently asked questions'}</h2>
          </div>
          <span className="pd-faq-count">{faq.length}</span>
        </div>
        <div className="pd-faq-filters" role="group" aria-label={ru ? 'Темы вопросов' : 'Question topics'}>
          {(
            [
              ['all', ru ? 'Все' : 'All'],
              ['order', ru ? 'Заказ' : 'Order'],
              ['projects', ru ? 'Проекты' : 'Projects'],
              ['support', ru ? 'Поддержка' : 'Support'],
            ] as const
          ).map(([value, label]) => (
            <button
              type="button"
              key={value}
              aria-pressed={topic === value}
              onClick={() => {
                setTopic(value);
                setOpenQuestion(null);
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="pd-faq-list">
          {faq
            .map(([question, answer], index) => ({
              question,
              answer,
              index,
              topic: index < 2 ? 'order' : index < 4 ? 'projects' : 'support',
            }))
            .filter((item) => topic === 'all' || item.topic === topic)
            .map(({ question, answer, index }) => {
              const expanded = openQuestion === index;
              return (
                <div className="pd-faq-item" key={question}>
                  <button
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={`faq-answer-${index}`}
                    onClick={() => setOpenQuestion(expanded ? null : index)}
                    data-testid={`button-faq-${index}`}
                  >
                    <span>{question}</span>
                    <ChevronDown size={18} aria-hidden="true" />
                  </button>
                  <div id={`faq-answer-${index}`} hidden={!expanded}>
                    <p>{answer}</p>
                  </div>
                </div>
              );
            })}
        </div>
      </section>

      <section className="pd-section pd-card pd-next-card">
        <div>
          <strong>{ru ? 'Готовы начать проект?' : 'Ready to start a project?'}</strong>
          <p className="pd-muted">
            {ru
              ? 'Выберите подходящее приложение и функции.'
              : 'Choose the app and features that fit your business.'}
          </p>
        </div>
        <button
          className="pd-button secondary"
          type="button"
          onClick={() => navigate('/constructor')}
          data-testid="help-open-order"
        >
          {ru ? 'К выбору' : 'Explore options'} <ArrowUpRight size={16} aria-hidden="true" />
        </button>
      </section>
    </ProfileDetailLayout>
  );
});

export default HelpPage;
