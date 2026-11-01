import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, RotateCcw } from 'lucide-react';
import type { ConsultantIndustry, ConsultantLanguage } from './consultantJourneyData';
import { industryScenes } from './consultantJourneyData';
import orb from '../assets/consultant/consultant-orb.webp';
import sneakerPhoto from '../assets/consultant/example-nike.webp';
import handoffArt from '../assets/consultant/handoff-v1.webp';

type Props = {
  industry: ConsultantIndustry;
  language: ConsultantLanguage;
  branchId: string | null;
  onBranch: (id: string | null) => void;
  view: 'customer' | 'business';
  onView: (view: 'customer' | 'business') => void;
  channel: 'app' | 'chat';
  onChannel: (channel: 'app' | 'chat') => void;
  onChangeIndustry: () => void;
  onContinue: () => void;
};

function useAnimatedText(text: string, enabled: boolean, instant: boolean, replay: number) {
  const [visible, setVisible] = useState('');
  const [typing, setTyping] = useState(false);
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!enabled || !text) {
      setVisible('');
      setTyping(false);
      setDone(false);
      return;
    }
    if (instant || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setVisible(text);
      setTyping(false);
      setDone(true);
      return;
    }
    let timer = 0;
    let interval = 0;
    let active = true;
    const letters = Array.from(text);
    let index = 0;
    setVisible('');
    setTyping(true);
    setDone(false);
    timer = window.setTimeout(() => {
      if (!active) return;
      setTyping(false);
      interval = window.setInterval(() => {
        if (!active) return;
        index = Math.min(index + 2, letters.length);
        setVisible(letters.slice(0, index).join(''));
        if (index >= letters.length) {
          window.clearInterval(interval);
          setDone(true);
        }
      }, 35);
    }, 360);
    return () => {
      active = false;
      window.clearTimeout(timer);
      window.clearInterval(interval);
    };
  }, [text, enabled, instant, replay]);
  return { visible, typing, done };
}

export function AIConsultantDemo({
  industry,
  language,
  branchId,
  onBranch,
  view,
  onView,
  channel,
  onChannel,
  onChangeIndustry,
  onContinue,
}: Props) {
  const ru = language === 'ru';
  const scene = industryScenes[industry][language];
  const branch = useMemo(() => scene.branches.find((item) => item.id === branchId), [scene, branchId]);
  const [introInstant, setIntroInstant] = useState(false);
  const [answerInstant, setAnswerInstant] = useState(false);
  const [replay, setReplay] = useState(0);
  const [productSelected, setProductSelected] = useState(false);
  const intro = useAnimatedText(scene.introduction, true, introInstant, replay);
  const answer = useAnimatedText(branch?.answer || '', Boolean(branch), answerInstant, replay);

  useEffect(() => {
    setProductSelected(false);
  }, [branchId]);
  const selectView = (next: 'customer' | 'business') => {
    if (next === 'business') {
      setIntroInstant(true);
      setAnswerInstant(true);
    }
    onView(next);
  };
  const chooseBranch = (id: string) => {
    setIntroInstant(true);
    setAnswerInstant(false);
    onBranch(id);
  };
  const replayDemo = () => {
    setIntroInstant(false);
    setAnswerInstant(false);
    setReplay((value) => value + 1);
    onBranch(null);
    setProductSelected(false);
    onView('customer');
  };

  return (
    <section className="ai2-demo-screen" aria-labelledby="ai2-demo-title">
      <div className="ai2-page-heading">
        <span className="ai2-kicker">
          {ru ? 'ОДНА ИСТОРИЯ · ДВА ВЗГЛЯДА' : 'ONE STORY · TWO PERSPECTIVES'}
        </span>
        <h1 id="ai2-demo-title">
          {ru ? 'Посмотрите разговор в действии' : 'See the conversation in action'}
        </h1>
        <p>
          {ru
            ? 'Выберите продолжение и посмотрите, как помощник может ответить.'
            : 'Choose what happens next and see how an assistant could respond.'}
        </p>
      </div>
      <div className="ai2-context-row">
        <span>{scene.name}</span>
        <button type="button" onClick={onChangeIndustry} data-testid="consultant-change-industry">
          {ru ? 'Изменить' : 'Change'}
        </button>
      </div>
      <div
        className="ai2-segment"
        role="group"
        aria-label={ru ? 'Взгляд на разговор' : 'Conversation perspective'}
      >
        <button
          type="button"
          aria-pressed={view === 'customer'}
          onClick={() => selectView('customer')}
          data-testid="consultant-view-customer"
        >
          {ru ? 'Я клиент' : 'Customer view'}
        </button>
        <button
          type="button"
          aria-pressed={view === 'business'}
          onClick={() => selectView('business')}
          data-testid="consultant-view-business"
        >
          {ru ? 'Я владелец' : 'Business view'}
        </button>
      </div>
      {view === 'customer' ? (
        <>
          <div
            className="ai2-channel-row"
            role="group"
            aria-label={ru ? 'Где показан диалог' : 'Where the conversation appears'}
          >
            <button
              type="button"
              aria-pressed={channel === 'app'}
              onClick={() => onChannel('app')}
              data-testid="consultant-demo-channel-app"
            >
              Mini App
            </button>
            <button
              type="button"
              aria-pressed={channel === 'chat'}
              onClick={() => onChannel('chat')}
              data-testid="consultant-demo-channel-chat"
            >
              Telegram
            </button>
          </div>
          <div className="ai2-chat-window" data-testid="consultant-example-conversation">
            <div className="ai2-chat-head">
              <span className="ai2-chat-avatar">
                <img src={orb} alt="" />
              </span>
              <span>
                <strong>{ru ? 'ИИ-консультант' : 'AI consultant'}</strong>
                <small>{channel === 'app' ? 'Mini App' : 'Telegram'}</small>
              </span>
              <span className="ai2-demo-badge">{ru ? 'ПРИМЕР' : 'EXAMPLE'}</span>
            </div>
            <div className="ai2-chat-body">
              <div className="ai2-message is-customer">
                {industry === 'shop' && (
                  <img
                    src={sneakerPhoto}
                    className="ai2-message-photo"
                    alt={ru ? 'Пример фотографии кроссовок Nike' : 'Example photograph of Nike sneakers'}
                    width="480"
                    height="480"
                  />
                )}
                <span>{scene.question}</span>
              </div>
              {intro.typing && (
                <div
                  className="ai2-typing"
                  aria-label={ru ? 'Консультант печатает' : 'The consultant is typing'}
                >
                  <i />
                  <i />
                  <i />
                </div>
              )}
              {intro.visible && (
                <div className="ai2-message is-assistant">
                  <span aria-hidden={!intro.done}>{intro.visible}</span>
                </div>
              )}
              {(intro.done || introInstant) && (
                <div
                  className="ai2-replies"
                  role="group"
                  aria-label={ru ? 'Выберите продолжение' : 'Choose what happens next'}
                >
                  {scene.branches.map((option) => (
                    <button
                      type="button"
                      key={option.id}
                      aria-pressed={branchId === option.id}
                      onClick={() => chooseBranch(option.id)}
                      data-testid={`consultant-reply-${option.id}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
              {branch && (
                <>
                  <div className="ai2-message is-customer">
                    <span>{branch.customer}</span>
                  </div>
                  {answer.typing && (
                    <div
                      className="ai2-typing"
                      aria-label={ru ? 'Консультант печатает' : 'The consultant is typing'}
                    >
                      <i />
                      <i />
                      <i />
                    </div>
                  )}
                  {answer.visible && (
                    <div className="ai2-message is-assistant">
                      <span aria-hidden={!answer.done}>{answer.visible}</span>
                    </div>
                  )}
                  {branch.product && (answer.done || answerInstant) && (
                    <div className="ai2-product" data-testid="consultant-example-product">
                      <img src={sneakerPhoto} alt="" width="480" height="480" />
                      <div>
                        <strong>Nike Air Force 1</strong>
                        <small>{ru ? 'Размер 42 · пример' : 'Size 42 · example'}</small>
                        <button
                          type="button"
                          aria-pressed={productSelected}
                          onClick={() => setProductSelected(!productSelected)}
                        >
                          {productSelected
                            ? ru
                              ? 'Выбрано в примере'
                              : 'Selected in example'
                            : ru
                              ? 'Выбрать'
                              : 'Select'}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
              <span className="profile-visually-hidden" role="status">
                {intro.typing || answer.typing
                  ? ru
                    ? 'Консультант печатает'
                    : 'The consultant is typing'
                  : answer.done
                    ? ru
                      ? 'Ответ показан'
                      : 'Answer shown'
                    : ''}
              </span>
            </div>
          </div>
          <div className="ai2-demo-foot">
            <p>
              {ru
                ? 'Демонстрация: ответы и наличие показаны на примере.'
                : 'Demonstration: answers and availability are illustrative.'}
            </p>
            <button
              type="button"
              onClick={replayDemo}
              aria-label={ru ? 'Повторить пример' : 'Replay example'}
              data-testid="consultant-replay"
            >
              <RotateCcw size={15} />
              <span>{ru ? 'Повторить' : 'Replay'}</span>
            </button>
          </div>
          {(!intro.done || (branch && !answer.done)) && (
            <button
              className="ai2-skip"
              type="button"
              onClick={() => {
                setIntroInstant(true);
                setAnswerInstant(true);
              }}
              data-testid="consultant-skip-typing"
            >
              {ru ? 'Показать сразу' : 'Show immediately'}
            </button>
          )}
          <button
            type="button"
            className="ai2-next-story"
            onClick={() => selectView('business')}
            data-testid="consultant-show-business"
          >
            <span>
              <strong>{ru ? 'А что видит бизнес?' : 'What does the business see?'}</strong>
              <small>
                {ru
                  ? 'Посмотреть этот же разговор с другой стороны'
                  : 'See the same conversation from the other side'}
              </small>
            </span>
            <ArrowRight size={19} />
          </button>
        </>
      ) : (
        <>
          <div className="ai2-business-story" data-testid="consultant-business-story">
            <div className="ai2-business-copy">
              <span className="ai2-kicker">{ru ? 'ВЗГЛЯД БИЗНЕСА' : 'BUSINESS VIEW'}</span>
              <h2>{ru ? 'За каждым ответом — задача' : 'A purpose behind every answer'}</h2>
              <p>
                {ru
                  ? 'Разбор этого примера помогает понять, как может работать ваш консультант.'
                  : 'This example illustrates how your consultant could work.'}
              </p>
            </div>
            <img src={handoffArt} alt="" />
          </div>
          <div className="ai2-story-timeline">
            <div>
              <span>01</span>
              <p>
                <strong>{ru ? 'Клиент обратился' : 'The customer asked'}</strong>
                <small>{scene.question}</small>
              </p>
            </div>
            <div>
              <span>02</span>
              <p>
                <strong>{ru ? 'Консультант помог' : 'The consultant helped'}</strong>
                <small>
                  {branch
                    ? branch.insight
                    : ru
                      ? 'Вернитесь в диалог и выберите продолжение, чтобы увидеть этот шаг.'
                      : 'Return to the conversation and choose a reply to see this step.'}
                </small>
              </p>
            </div>
            <div>
              <span>03</span>
              <p>
                <strong>{ru ? 'Что дальше' : 'What happens next'}</strong>
                <small>
                  {branch
                    ? branch.next
                    : ru
                      ? 'Следующий шаг зависит от вопроса клиента и настроек бизнеса.'
                      : 'The next step depends on the customer’s question and your setup.'}
                </small>
              </p>
            </div>
          </div>
          <p className="ai2-demo-disclaimer">
            {ru
              ? 'Это пример сценария, а не настоящие обращения или показатели.'
              : 'This is an illustrative scenario, not real customer activity or metrics.'}
          </p>
          <button type="button" className="ai2-inline-action" onClick={() => selectView('customer')}>
            <span>{ru ? 'Вернуться к диалогу' : 'Back to conversation'}</span>
            <ArrowRight size={17} />
          </button>
        </>
      )}
      <button
        type="button"
        className="ai2-primary"
        onClick={onContinue}
        data-testid="consultant-demo-continue"
      >
        <span>{ru ? 'Как это работает для бизнеса' : 'How it works for your business'}</span>
        <ArrowRight size={18} />
      </button>
    </section>
  );
}
