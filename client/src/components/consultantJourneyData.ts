export type ConsultantLanguage = 'ru' | 'en';
export type ConsultantIndustry = 'shop' | 'services' | 'restaurant' | 'other';
export type ConsultantChannel = 'app' | 'chat' | 'both';
export type ConsultantTone = 'warm' | 'business';
export type ConsultantTask = 'questions' | 'selection' | 'booking' | 'orders' | 'handoff';

export type DemoBranch = {
  id: string;
  label: string;
  customer: string;
  answer: string;
  insight: string;
  next: string;
  product?: boolean;
};
export type DemoScene = {
  name: string;
  caption: string;
  question: string;
  introduction: string;
  branches: DemoBranch[];
};

export const industryNames: Record<ConsultantIndustry, Record<ConsultantLanguage, string>> = {
  shop: { ru: 'Интернет-магазин', en: 'Online store' },
  services: { ru: 'Услуги и запись', en: 'Services & bookings' },
  restaurant: { ru: 'Ресторан и доставка', en: 'Restaurant & delivery' },
  other: { ru: 'Другое направление', en: 'Another business' },
};

export const taskNames: Record<ConsultantTask, Record<ConsultantLanguage, string>> = {
  questions: { ru: 'Отвечать на вопросы', en: 'Answer questions' },
  selection: { ru: 'Помогать с выбором', en: 'Help customers choose' },
  booking: { ru: 'Помогать с записью', en: 'Help with bookings' },
  orders: { ru: 'Помогать с заказами', en: 'Help with orders' },
  handoff: { ru: 'Передавать специалисту', en: 'Involve a specialist' },
};

export const industryScenes: Record<ConsultantIndustry, Record<ConsultantLanguage, DemoScene>> = {
  shop: {
    ru: {
      name: 'Магазин кроссовок',
      caption: 'Покупатель ищет подходящую пару',
      question: 'Хочу такие кроссовки. Поможете выбрать?',
      introduction: 'Конечно! Что вы хотите узнать в первую очередь?',
      branches: [
        {
          id: 'size',
          label: 'Есть 42 размер?',
          customer: 'Есть 42 размер?',
          answer: 'В этом примере 42-й размер есть. Могу показать пару и помочь с заказом.',
          insight: 'Уточнил нужный размер и показал подходящую пару.',
          next: 'Покупатель может продолжить выбор или обратиться к команде.',
          product: true,
        },
        {
          id: 'alternative',
          label: 'Если размера нет',
          customer: 'А если моего размера нет?',
          answer: 'Подберу похожие варианты и при необходимости уточню наличие у специалиста.',
          insight: 'Предложил следующий шаг, когда нужного размера нет.',
          next: 'Похожие товары можно подбирать по данным вашего каталога.',
        },
        {
          id: 'human',
          label: 'Нужен специалист',
          customer: 'Можно поговорить с человеком?',
          answer: 'Конечно. Подготовлю обращение специалисту и передам, что вы ищете.',
          insight: 'Распознал просьбу и предложил передать вопрос человеку.',
          next: 'Сценарий передачи согласовывается при настройке.',
        },
      ],
    },
    en: {
      name: 'Sneaker store',
      caption: 'A shopper is looking for the right pair',
      question: 'I like these sneakers. Can you help me choose?',
      introduction: 'Of course! What would you like to know first?',
      branches: [
        {
          id: 'size',
          label: 'Is size 42 available?',
          customer: 'Is size 42 available?',
          answer: 'In this example, size 42 is available. I can show you the pair and help with an order.',
          insight: 'Asked about the size and showed a suitable pair.',
          next: 'The shopper can keep browsing or contact the team.',
          product: true,
        },
        {
          id: 'alternative',
          label: 'If my size is out',
          customer: 'What if my size is unavailable?',
          answer: 'I can suggest similar options and ask a specialist to check availability if needed.',
          insight: 'Suggested a next step when the requested size is unavailable.',
          next: 'Alternatives can be based on your connected catalogue.',
        },
        {
          id: 'human',
          label: 'Talk to a person',
          customer: 'Can I speak to a person?',
          answer: 'Of course. I can prepare a request for a specialist and pass along what you need.',
          insight: 'Recognised the request and offered a handoff.',
          next: 'The handoff is agreed when the service is configured.',
        },
      ],
    },
  },
  services: {
    ru: {
      name: 'Студия услуг',
      caption: 'Клиент хочет записаться',
      question: 'Хочу записаться на маникюр в субботу.',
      introduction: 'Помогу с записью. Что для вас важнее?',
      branches: [
        {
          id: 'time',
          label: 'Удобное время',
          customer: 'Лучше утром. Есть время?',
          answer: 'В примере доступно 11:00. Могу показать детали и помочь с записью.',
          insight: 'Уточнил пожелание и предложил пример времени.',
          next: 'Реальное расписание зависит от подключения календаря.',
        },
        {
          id: 'price',
          label: 'Узнать стоимость',
          customer: 'А сколько стоит услуга?',
          answer: 'Расскажу об услуге по вашим материалам или уточню стоимость у специалиста.',
          insight: 'Понял вопрос о стоимости и выбрал подходящий источник.',
          next: 'Ответы о ценах настраиваются по материалам бизнеса.',
        },
        {
          id: 'human',
          label: 'Нужен специалист',
          customer: 'Хочу уточнить у мастера.',
          answer: 'Конечно. Подготовлю вопрос для специалиста и передам контекст записи.',
          insight: 'Предложил передать нестандартный вопрос человеку.',
          next: 'Передача обращения настраивается отдельно.',
        },
      ],
    },
    en: {
      name: 'Service studio',
      caption: 'A customer wants to book',
      question: 'I’d like a manicure appointment on Saturday.',
      introduction: 'I can help with that. What matters most to you?',
      branches: [
        {
          id: 'time',
          label: 'Choose a time',
          customer: 'Morning is best. Is anything available?',
          answer: 'In this example, 11:00 is available. I can show the details and help with a booking.',
          insight: 'Asked about the preference and offered an example time.',
          next: 'A real schedule requires a calendar connection.',
        },
        {
          id: 'price',
          label: 'Ask about price',
          customer: 'How much does it cost?',
          answer: 'I can explain the service using your materials or ask a specialist about the price.',
          insight: 'Recognised a pricing question and chose an appropriate source.',
          next: 'Price answers are configured using your business information.',
        },
        {
          id: 'human',
          label: 'Ask a specialist',
          customer: 'I’d like to ask the specialist.',
          answer: 'Of course. I can prepare the question and pass along the booking context.',
          insight: 'Offered to pass the special question to a person.',
          next: 'The handoff is configured separately.',
        },
      ],
    },
  },
  restaurant: {
    ru: {
      name: 'Ресторан',
      caption: 'Гость выбирает ужин',
      question: 'Помогите выбрать ужин с доставкой.',
      introduction: 'Конечно. Что для вас важнее?',
      branches: [
        {
          id: 'menu',
          label: 'Без мяса',
          customer: 'Хочу что-нибудь без мяса.',
          answer: 'Подберу подходящие блюда по меню. Состав и ограничения лучше уточнить у команды.',
          insight: 'Уточнил предпочтение и предложил варианты из меню.',
          next: 'Состав блюд берётся из согласованных материалов.',
        },
        {
          id: 'delivery',
          label: 'Условия доставки',
          customer: 'Расскажите про доставку.',
          answer: 'Подскажу условия доставки по вашим данным. В какой район нужен заказ?',
          insight: 'Задал уточняющий вопрос о доставке.',
          next: 'Зоны и условия зависят от данных ресторана.',
        },
        {
          id: 'human',
          label: 'Нужен сотрудник',
          customer: 'Можно уточнить у сотрудника?',
          answer: 'Да, подготовлю вопрос для команды ресторана.',
          insight: 'Предложил передать вопрос сотруднику.',
          next: 'Способ передачи настраивается для бизнеса.',
        },
      ],
    },
    en: {
      name: 'Restaurant',
      caption: 'A guest is choosing dinner',
      question: 'Can you help me choose dinner for delivery?',
      introduction: 'Of course. What matters most to you?',
      branches: [
        {
          id: 'menu',
          label: 'Meat-free',
          customer: 'I’d like something without meat.',
          answer:
            'I can suggest options from the menu. Please confirm ingredients and restrictions with the team.',
          insight: 'Asked about a preference and suggested menu options.',
          next: 'Ingredients are taken from the agreed business information.',
        },
        {
          id: 'delivery',
          label: 'Delivery details',
          customer: 'Tell me about delivery.',
          answer: 'I can explain delivery based on your information. Which area is the order for?',
          insight: 'Asked a follow-up question about delivery.',
          next: 'Areas and conditions depend on the restaurant’s data.',
        },
        {
          id: 'human',
          label: 'Ask the team',
          customer: 'Can I ask a team member?',
          answer: 'Yes, I can prepare the question for the restaurant team.',
          insight: 'Offered to pass the question to a person.',
          next: 'The handoff method is configured for the business.',
        },
      ],
    },
  },
  other: {
    ru: {
      name: 'Ваш бизнес',
      caption: 'Клиент узнаёт об услуге',
      question: 'Помогите разобраться, что мне подойдёт.',
      introduction: 'С удовольствием. Что вы хотите узнать?',
      branches: [
        {
          id: 'choice',
          label: 'Помочь с выбором',
          customer: 'Как выбрать подходящий вариант?',
          answer: 'Задам несколько вопросов и помогу выбрать из доступных предложений.',
          insight: 'Уточнил задачу и помог с выбором.',
          next: 'Сценарий подбирается под ваши продукты и аудиторию.',
        },
        {
          id: 'price',
          label: 'Узнать условия',
          customer: 'Какие условия и стоимость?',
          answer: 'Расскажу по согласованным материалам или помогу связаться со специалистом.',
          insight: 'Помог с вопросом об условиях.',
          next: 'Актуальные данные предоставляет бизнес.',
        },
        {
          id: 'human',
          label: 'Нужен специалист',
          customer: 'Хочу обсудить с человеком.',
          answer: 'Конечно. Подготовлю обращение и передам ваш вопрос команде.',
          insight: 'Предложил передачу вопроса человеку.',
          next: 'Способ передачи определим при настройке.',
        },
      ],
    },
    en: {
      name: 'Your business',
      caption: 'A customer asks about a service',
      question: 'Can you help me find the right service?',
      introduction: 'Of course. What would you like to know?',
      branches: [
        {
          id: 'choice',
          label: 'Help me choose',
          customer: 'How do I choose the right option?',
          answer: 'I can ask a few questions and help you choose from the available options.',
          insight: 'Clarified the need and helped with the choice.',
          next: 'The scenario is tailored to your products and audience.',
        },
        {
          id: 'price',
          label: 'Ask about terms',
          customer: 'What are the terms and price?',
          answer: 'I can explain the agreed information or help you contact a specialist.',
          insight: 'Helped with a question about the terms.',
          next: 'Your business provides the current information.',
        },
        {
          id: 'human',
          label: 'Ask a specialist',
          customer: 'I’d like to speak to a person.',
          answer: 'Of course. I can prepare the request and pass your question to the team.',
          insight: 'Offered to hand the question to a person.',
          next: 'The handoff method is agreed during setup.',
        },
      ],
    },
  },
};
