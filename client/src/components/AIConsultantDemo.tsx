import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CheckCheck, RotateCcw } from 'lucide-react';
import type { ConsultantIndustry, ConsultantLanguage } from './consultantJourneyData';
import { industryScenes } from './consultantJourneyData';
import sneakerPhoto from '../assets/consultant/example-nike.webp';
import handoffArt from '../assets/consultant/handoff-v1.webp';
import { AIConsultantChannelPreview } from './AIConsultantChannelPreview';

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
  const [introInstant, setIntroInstant] = useState(Boolean(branchId));
  const [answerInstant, setAnswerInstant] = useState(Boolean(branchId));
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

  const choices = scene.branches.map((option) => (
    <button
      type="button"
      key={option.id}
      aria-pressed={branchId === option.id}
      onClick={() => chooseBranch(option.id)}
      data-testid={`consultant-reply-${option.id}`}
    >
      {option.label}
    </button>
  ));
  const selectionLabel = productSelected
    ? ru
      ? 'Выбрано в примере'
      : 'Selected in example'
    : ru
      ? 'Выбрать'
      : 'Select';
  const messages = (
    <>
      <div className="ai2-message is-customer">
        {industry === 'shop' && channel === 'chat' && (
          <img
            src={sneakerPhoto}
            className="ai2-message-photo"
            alt={ru ? 'Пример фотографии кроссовок Nike' : 'Example photograph of Nike sneakers'}
            width="480"
            height="480"
          />
        )}
        <span>{scene.question}</span>
        {channel === 'chat' && (
          <span className="ai4-message-time" aria-hidden="true">
            12:41 <CheckCheck size={13} />
          </span>
        )}
      </div>
      {intro.typing && (
        <div className="ai2-typing" aria-label={ru ? 'Консультант печатает' : 'The consultant is typing'}>
          <i />
          <i />
          <i />
        </div>
      )}
      {intro.visible && (
        <div className="ai2-message is-assistant">
          <span aria-hidden={!intro.done}>{intro.visible}</span>
          {channel === 'chat' && intro.done && (
            <span className="ai4-message-time" aria-hidden="true">
              12:41
            </span>
          )}
        </div>
      )}
      {branch && (
        <>
          <div className="ai2-message is-customer">
            <span>{channel === 'chat' ? branch.label : branch.customer}</span>
            {channel === 'chat' && (
              <span className="ai4-message-time" aria-hidden="true">
                12:42 <CheckCheck size={13} />
              </span>
            )}
          </div>
          {answer.typing && (
            <div className="ai2-typing" aria-label={ru ? 'Консультант печатает' : 'The consultant is typing'}>
              <i />
              <i />
              <i />
            </div>
          )}
          {answer.visible && (
            <div className="ai2-message is-assistant">
              <span aria-hidden={!answer.done}>{answer.visible}</span>
              {channel === 'chat' && answer.done && (
                <span className="ai4-message-time" aria-hidden="true">
                  12:42
                </span>
              )}
            </div>
          )}
          {branch.product &&
            (answer.done || answerInstant) &&
            (channel === 'chat' ? (
              <div className="ai4-telegram-product" data-testid="consultant-example-product">
                <div>
                  <img src={sneakerPhoto} alt="" width="480" height="480" />
                  <strong>Nike Air Force 1</strong>
                  <small>{ru ? 'Размер 42 · пример' : 'Size 42 · example'}</small>
                </div>
                <button
                  type="button"
                  aria-pressed={productSelected}
                  onClick={() => setProductSelected(!productSelected)}
                >
                  {selectionLabel}
                </button>
              </div>
            ) : (
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
                    {selectionLabel}
                  </button>
                </div>
              </div>
            ))}
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
    </>
  );

  return (
    <section className="ai2-demo-screen" aria-labelledby="ai2-demo-title">
      <div className="ai2-page-heading">
        <span className="ai2-kicker">{ru ? 'ПРИМЕР ОБЩЕНИЯ' : 'AN EXAMPLE CONVERSATION'}</span>
        <h1 id="ai2-demo-title">
          {ru ? 'Один диалог. Два взгляда.' : 'One conversation. Two perspectives.'}
        </h1>
        <p>{ru ? 'Выберите, что спросит клиент.' : 'Choose what the customer asks next.'}</p>
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
          <AIConsultantChannelPreview
            channel={channel}
            industry={industry}
            language={language}
            scene={scene}
            messages={messages}
            choices={choices}
            choicesReady={intro.done || introInstant}
          />
          <div className="ai2-demo-foot">
            <p>
              {channel === 'chat'
                ? ru
                  ? 'Выберите кнопку: настоящие сообщения не отправляются.'
                  : 'Choose a button; no real messages are sent.'
                : ru
                  ? 'Пример: ответы и действия не меняют реальные данные.'
                  : 'Example: replies and actions do not change real data.'}
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
              <small className="ai3-behind-label">{ru ? 'ЗА КАДРОМ' : 'BEHIND THE SCENES'}</small>
              <strong>
                {branch ? branch.insight : ru ? 'А что видит бизнес?' : 'What does the business see?'}
              </strong>
              <small>
                {ru ? 'Посмотреть историю со стороны бизнеса' : 'See the story from the business perspective'}
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
