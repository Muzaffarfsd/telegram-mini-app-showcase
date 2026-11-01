import { useState, type ReactNode } from 'react';
import {
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  Mic,
  MoreVertical,
  Paperclip,
  ShoppingBag,
  Utensils,
} from 'lucide-react';
import type { ConsultantIndustry, ConsultantLanguage, DemoScene } from './consultantJourneyData';
import orb from '../assets/consultant/consultant-orb.webp';
import sneakerPhoto from '../assets/consultant/example-nike.webp';
import './AIConsultantChannelPreview.css';

type Props = {
  channel: 'app' | 'chat';
  industry: ConsultantIndustry;
  language: ConsultantLanguage;
  scene: DemoScene;
  messages: ReactNode;
  choices: ReactNode;
  choicesReady: boolean;
};

export function AIConsultantChannelPreview({
  channel,
  industry,
  language,
  scene,
  messages,
  choices,
  choicesReady,
}: Props) {
  const ru = language === 'ru';
  const [appChatOpen, setAppChatOpen] = useState(true);

  if (channel === 'chat') {
    return (
      <div
        className="ai4-telegram-window"
        data-testid="consultant-example-conversation"
        data-demo-channel="telegram"
      >
        <div className="ai4-telegram-head">
          <ArrowLeft size={19} aria-hidden="true" />
          <span className="ai4-telegram-avatar">
            <img src={orb} alt="" />
          </span>
          <span className="ai4-telegram-title">
            <strong>{scene.name}</strong>
            <small>{ru ? 'бот · пример' : 'bot · example'}</small>
          </span>
          <MoreVertical size={19} aria-hidden="true" />
        </div>
        <div className="ai2-chat-body ai4-telegram-messages">
          <span className="ai4-telegram-date">{ru ? 'Сегодня · пример' : 'Today · example'}</span>
          {messages}
        </div>
        <div className="ai4-telegram-composer" aria-hidden="true">
          <Paperclip size={19} />
          <span>{ru ? 'Сообщение' : 'Message'}</span>
          <Mic size={19} />
        </div>
        {choicesReady && (
          <div
            className="ai4-telegram-keyboard"
            role="group"
            aria-label={ru ? 'Ответы в примере бота' : 'Example bot reply keyboard'}
          >
            {choices}
          </div>
        )}
      </div>
    );
  }

  const appTitle =
    industry === 'shop'
      ? 'SNEAKER STORE'
      : industry === 'services'
        ? 'STUDIO'
        : industry === 'restaurant'
          ? 'FOOD & CO'
          : 'YOUR BUSINESS';
  const itemName =
    industry === 'shop'
      ? 'Nike Air Force 1'
      : industry === 'services'
        ? ru
          ? 'Маникюр'
          : 'Manicure'
        : industry === 'restaurant'
          ? ru
            ? 'Меню и доставка'
            : 'Menu & delivery'
          : ru
            ? 'Услуги и предложения'
            : 'Services and offers';
  const itemDetail =
    industry === 'shop'
      ? ru
        ? 'Размеры · пример'
        : 'Sizes · example'
      : industry === 'services'
        ? ru
          ? 'Запись на удобное время'
          : 'Find a convenient appointment'
        : industry === 'restaurant'
          ? ru
            ? 'Выбор блюд и доставка'
            : 'Choose a meal for delivery'
          : ru
            ? 'Каталог и помощь клиентам'
            : 'Explore and get assistance';
  const ItemIcon =
    industry === 'services' ? CalendarDays : industry === 'restaurant' ? Utensils : ShoppingBag;

  return (
    <div className="ai4-app-window" data-testid="consultant-example-conversation" data-demo-channel="app">
      <div className="ai4-app-head">
        <ArrowLeft size={18} aria-hidden="true" />
        <strong>{appTitle}</strong>
        <ShoppingBag size={18} aria-hidden="true" />
      </div>
      <div className="ai4-app-context">
        {industry === 'shop' ? (
          <img
            src={sneakerPhoto}
            alt={ru ? 'Пример фотографии кроссовок Nike' : 'Example photograph of Nike sneakers'}
            width="480"
            height="480"
          />
        ) : (
          <span className="ai4-app-item-icon">
            <ItemIcon size={26} strokeWidth={1.5} />
          </span>
        )}
        <div>
          <small>{ru ? 'ПРИМЕР ПРИЛОЖЕНИЯ' : 'EXAMPLE APP'}</small>
          <strong>{itemName}</strong>
          <span>{itemDetail}</span>
        </div>
      </div>
      <div className="ai4-app-assistant">
        <button
          type="button"
          className="ai4-app-assistant-toggle"
          aria-expanded={appChatOpen}
          onClick={() => setAppChatOpen((current) => !current)}
          data-testid="consultant-app-chat-toggle"
        >
          <span className="ai4-telegram-avatar">
            <img src={orb} alt="" />
          </span>
          <span>
            <strong>{ru ? 'Спросить консультанта' : 'Ask the consultant'}</strong>
            <small>{ru ? 'Поможет с выбором' : 'Here to help you choose'}</small>
          </span>
          <ChevronDown size={18} aria-hidden="true" />
        </button>
        {appChatOpen && (
          <div className="ai2-chat-body ai4-app-messages">
            {messages}
            {choicesReady && (
              <div
                className="ai2-replies"
                role="group"
                aria-label={ru ? 'Выберите продолжение' : 'Choose what happens next'}
              >
                {choices}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
