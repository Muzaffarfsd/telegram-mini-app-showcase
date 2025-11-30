import { useState, memo } from "react";
import { 
  Phone,
  Mail,
  MessageCircle,
  Clock,
  Shield,
  CreditCard,
  Package,
  Smartphone,
  Star,
  CheckCircle,
  AlertCircle,
  Info,
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Zap,
  Users,
  Code,
  Globe,
  DollarSign,
  Calendar,
  Settings,
  Lock,
  Headphones,
  Award,
  TrendingUp,
  FileText,
  Download
} from "lucide-react";
import { BackHeader } from "./BackHeader";

interface HelpPageProps {
  onBack: () => void;
}

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
  icon: any;
  color: string;
}

const faqCategories = [
  { id: 'all', name: 'Все вопросы', icon: HelpCircle },
  { id: 'development', name: 'Разработка', icon: Code },
  { id: 'payment', name: 'Оплата', icon: CreditCard },
  { id: 'support', name: 'Поддержка', icon: Headphones },
  { id: 'features', name: 'Функции', icon: Settings }
];

const faqItems: FAQItem[] = [
  {
    id: 1,
    question: "Сколько времени занимает разработка приложения?",
    answer: "Сроки разработки зависят от сложности проекта:\n\n• Простой магазин (каталог + корзина) — 5-7 дней\n• Ресторан с доставкой — 7-10 дней\n• Фитнес-центр с записью — 8-12 дней\n• Сложные проекты с уникальным функционалом — до 14 дней\n\nМы всегда соблюдаем оговоренные сроки и информируем о ходе работ ежедневно.",
    category: "development",
    icon: Clock,
    color: "text-system-blue"
  },
  {
    id: 2,
    question: "Какие способы оплаты вы принимаете?",
    answer: "Мы работаем со всеми популярными способами оплаты:\n\n• Банковские карты (Visa, MasterCard, МИР)\n• СБП (Система быстрых платежей)\n• Онлайн-банкинг (Сбербанк, Тинькофф, Альфа-Банк)\n• Электронные кошельки (ЮMoney, QIWI)\n• Банковские переводы для юридических лиц\n\nОплата происходит поэтапно: 50% аванс, 50% при сдаче проекта.",
    category: "payment",
    icon: CreditCard,
    color: "text-system-green"
  },
  {
    id: 3,
    question: "Нужен ли мне собственный Telegram Bot Token?",
    answer: "Нет, не нужен! Мы создаем Mini App (мини-приложение), которое работает внутри Telegram без создания отдельного бота.\n\nПреимущества Mini App:\n• Не требует токенов или настройки API\n• Автоматически интегрируется с Telegram\n• Доступно всем пользователям Telegram\n• Работает на всех устройствах\n• Поддерживает платежи через Telegram\n\nВам нужно только предоставить контент и пожелания по дизайну.",
    category: "development",
    icon: Smartphone,
    color: "text-system-purple"
  },
  {
    id: 4,
    question: "Можно ли вносить изменения после запуска?",
    answer: "Конечно! Мы предоставляем полную техподдержку:\n\n• Первый месяц — бесплатная поддержка\n• Мелкие правки (тексты, цены) — бесплатно\n• Добавление новых товаров/услуг — бесплатно\n• Крупные изменения функционала — по отдельному тарифу\n• Срочные исправления — в течение 2 часов\n\nВсе изменения вносятся через удобную админ-панель или по вашему запросу.",
    category: "support",
    icon: Package,
    color: "text-system-orange"
  },
  {
    id: 5,
    question: "Насколько безопасны платежи в приложении?",
    answer: "Безопасность платежей — наш приоритет №1:\n\n• Используем только сертифицированные платежные системы\n• Все данные передаются по защищенному протоколу HTTPS\n• Платежные данные не сохраняются на наших серверах\n• Соответствуем стандарту PCI DSS\n• Интеграция с Telegram Payments (высший уровень безопасности)\n• Автоматическое шифрование всех транзакций\n\nВаши клиенты могут быть уверены в безопасности своих данных.",
    category: "features",
    icon: Shield,
    color: "text-system-red"
  },
  {
    id: 6,
    question: "Какую поддержку вы предоставляете после запуска?",
    answer: "Мы обеспечиваем комплексную поддержку 24/7:\n\n• Техническая поддержка — круглосуточно\n• Ответ в Telegram — в течение 30 минут\n• Устранение критических ошибок — в течение 15 минут\n• Бесплатные консультации — первые 30 дней\n• Обучение работе с админ-панелью\n• Помощь в настройке аналитики\n\nКонтакты поддержки: @web4tgs в Telegram",
    category: "support",
    icon: MessageCircle,
    color: "text-system-teal"
  },
  {
    id: 7,
    question: "Какие функции входят в базовый пакет?",
    answer: "Базовый пакет включает все необходимое для работы:\n\n• Каталог товаров/услуг с фото и описаниями\n• Корзина и оформление заказов\n• Система уведомлений\n• Админ-панель для управления\n• Интеграция с Telegram\n• Адаптивный дизайн для всех устройств\n• Базовая аналитика заказов\n• SSL-сертификат безопасности\n\nДополнительно можно добавить: платежи, доставку, бонусную систему, расширенную аналитику.",
    category: "features",
    icon: Package,
    color: "text-system-blue"
  },
  {
    id: 8,
    question: "Сколько стоит разработка приложения?",
    answer: "Стоимость зависит от типа и сложности приложения:\n\n• Простой магазин — от 25 000 ₽\n• Ресторан/кафе — от 30 000 ₽\n• Фитнес-центр — от 35 000 ₽\n• Сфера услуг — от 28 000 ₽\n• Уникальные проекты — от 40 000 ₽\n\nВ стоимость входит: разработка, дизайн, тестирование, запуск, месяц поддержки.\nДополнительные функции: платежи (+15 000 ₽), доставка (+12 000 ₽), аналитика (+12 000 ₽).",
    category: "payment",
    icon: DollarSign,
    color: "text-system-green"
  },
  {
    id: 9,
    question: "Предоставляете ли вы исходный код?",
    answer: "Да, после полной оплаты вы получаете:\n\n• Полный исходный код приложения\n• Документацию по развертыванию\n• Инструкции по внесению изменений\n• Доступ к административной панели\n• Права на коммерческое использование\n• Техническую документацию\n\nВы становитесь полноправным владельцем приложения и можете модифицировать его по своему усмотрению.",
    category: "development",
    icon: Code,
    color: "text-system-purple"
  },
  {
    id: 10,
    question: "Можете ли вы интегрировать приложение с моей CRM?",
    answer: "Да, мы интегрируем приложения с популярными CRM-системами:\n\n• amoCRM — автоматическая передача заказов\n• Битрикс24 — синхронизация клиентов и сделок\n• RetailCRM — управление заказами и складом\n• МойСклад — учет товаров и продаж\n• 1С — интеграция с учетными системами\n• Собственные API — разработаем под ваши нужды\n\nИнтеграция позволяет автоматизировать все бизнес-процессы.",
    category: "features",
    icon: Settings,
    color: "text-system-orange"
  }
];

const contactMethods = [
  {
    id: 1,
    title: "Telegram поддержка",
    description: "Самый быстрый способ получить помощь",
    detail: "Отвечаем в течение 30 минут, 24/7",
    action: () => window.open('https://t.me/web4tgs', '_blank'),
    icon: MessageCircle,
    color: "bg-system-blue/10 text-system-blue",
    urgent: true
  },
  {
    id: 2,
    title: "Телефонная поддержка",
    description: "+7 (999) 999-99-99",
    detail: "Звонки принимаем с 9:00 до 21:00 МСК",
    action: () => window.open('tel:+79999999999', '_blank'),
    icon: Phone,
    color: "bg-system-green/10 text-system-green",
    urgent: false
  },
  {
    id: 3,
    title: "Email поддержка",
    description: "support@web4tg.com",
    detail: "Подробные вопросы и техническая документация",
    action: () => window.open('mailto:support@web4tg.com', '_blank'),
    icon: Mail,
    color: "bg-system-purple/10 text-system-purple",
    urgent: false
  }
];

const serviceFeatures = [
  {
    icon: CheckCircle,
    title: "Гарантия качества",
    description: "100% возврат средств, если результат не устроит",
    color: "text-system-green"
  },
  {
    icon: Star,
    title: "4.9/5 рейтинг",
    description: "Средняя оценка от 127+ довольных клиентов",
    color: "text-system-orange"
  },
  {
    icon: Shield,
    title: "Полная безопасность",
    description: "Соблюдаем GDPR и российские стандарты защиты данных",
    color: "text-system-blue"
  },
  {
    icon: Zap,
    title: "Быстрая разработка",
    description: "От идеи до запуска за 5-14 дней",
    color: "text-system-purple"
  },
  {
    icon: TrendingUp,
    title: "Рост продаж",
    description: "Клиенты увеличивают выручку в среднем на 180%",
    color: "text-system-green"
  },
  {
    icon: Award,
    title: "Премиум качество",
    description: "Используем только современные технологии и лучшие практики",
    color: "text-system-red"
  }
];

const HelpPage = memo(function HelpPage({ onBack }: HelpPageProps) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const filteredFAQs = faqItems.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
                         item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFAQ = (id: number) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-black text-white pb-32" style={{ paddingTop: '140px' }}>
      <BackHeader onBack={onBack} title="Справка" />

      <div className="max-w-md mx-auto px-4 space-y-6 mt-4">
        {/* Hero Section */}
        <section className="ios-slide-up scroll-fade-in">
          <div className="glass-card p-6 text-center">
            <div className="w-16 h-16 bg-system-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-8 h-8 text-system-blue" />
            </div>
            <h2 className="ios-title3 mb-2">Центр поддержки</h2>
            <p className="ios-body text-secondary-label mb-4">
              Найдите ответы на все вопросы о создании Telegram приложений
            </p>
            <button 
              className="ios-button-filled"
              onClick={() => window.open('https://t.me/web4tgs', '_blank')}
            >
              Связаться с поддержкой
            </button>
          </div>
        </section>

        {/* Search */}
        <section className="ios-slide-up scroll-fade-in-delay-1">
          <div className="glass-card p-4">
            <div className="flex items-center space-x-3 bg-secondary-system-fill rounded-xl px-4 py-3">
              <Search className="w-5 h-5 text-secondary-label" />
              <input
                type="text"
                placeholder="Поиск по справке..."
                className="flex-1 bg-transparent border-none outline-none ios-body"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* FAQ Categories */}
        <section className="ios-slide-up scroll-fade-in-delay-2">
          <div className="glass-card p-4">
            <div className="overflow-x-auto no-scrollbar">
              <div className="flex space-x-2 min-w-max">
                {faqCategories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <button
                      key={category.id}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-200 ${
                        activeCategory === category.id
                          ? 'bg-system-blue text-white'
                          : 'bg-secondary-system-fill text-secondary-label hover:bg-tertiary-system-fill'
                      }`}
                      onClick={() => setActiveCategory(category.id)}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span className="ios-footnote font-medium">{category.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Items */}
        <section className="ios-slide-up scroll-fade-in-delay-3">
          <div className="glass-card p-4">
            <h3 className="ios-headline font-semibold mb-4">
              {activeCategory === 'all' ? 'Все вопросы' : faqCategories.find(c => c.id === activeCategory)?.name}
              <span className="ios-footnote text-secondary-label ml-2">({filteredFAQs.length})</span>
            </h3>
            
            <div className="space-y-3">
              {filteredFAQs.map((item) => {
                const IconComponent = item.icon;
                const isExpanded = expandedFAQ === item.id;
                
                return (
                  <div key={item.id} className="glass-card overflow-hidden">
                    <button
                      className="w-full p-4 text-left transition-colors hover:bg-secondary-system-fill/50"
                      onClick={() => toggleFAQ(item.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          item.color === 'text-system-blue' ? 'bg-system-blue/10' :
                          item.color === 'text-system-green' ? 'bg-system-green/10' :
                          item.color === 'text-system-purple' ? 'bg-system-purple/10' :
                          item.color === 'text-system-orange' ? 'bg-system-orange/10' :
                          item.color === 'text-system-red' ? 'bg-system-red/10' :
                          'bg-system-teal/10'
                        }`}>
                          <IconComponent className={`w-4 h-4 ${item.color}`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="ios-body font-semibold">{item.question}</h4>
                        </div>
                        <div className="flex-shrink-0">
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-secondary-label" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-secondary-label" />
                          )}
                        </div>
                      </div>
                    </button>
                    
                    {isExpanded && (
                      <div className="px-4 pb-4">
                        <div className="ml-11 pl-3 border-l-2 border-secondary-system-fill">
                          <div className="ios-footnote text-secondary-label leading-relaxed whitespace-pre-line">
                            {item.answer}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {filteredFAQs.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-quaternary-system-fill rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-quaternary-label" />
                </div>
                <h3 className="ios-body font-semibold mb-2">Ничего не найдено</h3>
                <p className="ios-footnote text-secondary-label">
                  Попробуйте изменить запрос или выберите другую категорию
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Contact Methods */}
        <section className="ios-slide-up scroll-fade-in-delay-4">
          <div className="glass-card p-4">
            <h3 className="ios-headline font-semibold mb-4">Не нашли ответ?</h3>
            <div className="space-y-3">
              {contactMethods.map((method) => {
                const IconComponent = method.icon;
                return (
                  <div 
                    key={method.id} 
                    className="glass-card p-4 cursor-pointer transition-all duration-200 hover:glass-floating"
                    onClick={method.action}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${method.color}`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <div className="ios-body font-semibold">{method.title}</div>
                          {method.urgent && (
                            <div className="px-2 py-1 bg-system-red/10 rounded-full">
                              <span className="ios-caption2 text-system-red font-semibold">Быстро</span>
                            </div>
                          )}
                        </div>
                        <div className="ios-footnote text-secondary-label">{method.description}</div>
                        <div className="ios-caption2 text-tertiary-label">{method.detail}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Service Features */}
        <section className="ios-slide-up scroll-fade-in">
          <div className="glass-card p-4">
            <h3 className="ios-headline font-semibold mb-4">Почему выбирают нас</h3>
            <div className="space-y-4">
              {serviceFeatures.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div key={index} className="glass-card p-4">
                    <div className="flex items-start space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        feature.color === 'text-system-green' ? 'bg-system-green/10' :
                        feature.color === 'text-system-orange' ? 'bg-system-orange/10' :
                        feature.color === 'text-system-blue' ? 'bg-system-blue/10' :
                        feature.color === 'text-system-purple' ? 'bg-system-purple/10' :
                        feature.color === 'text-system-red' ? 'bg-system-red/10' :
                        'bg-quaternary-system-fill'
                      }`}>
                        <IconComponent className={`w-5 h-5 ${feature.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="ios-body font-semibold mb-1">{feature.title}</div>
                        <div className="ios-footnote text-secondary-label">{feature.description}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Documentation Links */}
        <section className="ios-slide-up scroll-fade-in-delay-1">
          <div className="glass-card p-4">
            <h3 className="ios-headline font-semibold mb-4">Полезные материалы</h3>
            <div className="space-y-3">
              <div className="glass-card p-4 cursor-pointer hover:glass-floating transition-all duration-200">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-system-blue" />
                  <div className="flex-1">
                    <div className="ios-body font-semibold">Техническая документация</div>
                    <div className="ios-footnote text-secondary-label">API, интеграции, настройки</div>
                  </div>
                  <Download className="w-4 h-4 text-tertiary-label" />
                </div>
              </div>
              
              <div className="glass-card p-4 cursor-pointer hover:glass-floating transition-all duration-200">
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-system-green" />
                  <div className="flex-1">
                    <div className="ios-body font-semibold">Примеры проектов</div>
                    <div className="ios-footnote text-secondary-label">Портфолио готовых решений</div>
                  </div>
                  <Download className="w-4 h-4 text-tertiary-label" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Emergency */}
        <section className="ios-slide-up scroll-fade-in-delay-2">
          <div className="glass-card p-4 bg-system-red/5 border-system-red/20">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-6 h-6 text-system-red flex-shrink-0 mt-1" />
              <div>
                <div className="ios-body font-semibold text-system-red mb-2">Экстренная поддержка</div>
                <div className="ios-footnote text-secondary-label leading-relaxed">
                  Если ваше приложение не работает или произошла критическая ошибка, 
                  немедленно напишите нам в Telegram <span className="font-semibold">@web4tgs</span>.
                  
                  <br/><br/>
                  
                  <span className="font-semibold">Время реакции:</span>
                  <br/>• Критические ошибки — 15 минут
                  <br/>• Проблемы с платежами — 30 минут  
                  <br/>• Обычные вопросы — 2 часа
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
});

export default HelpPage;