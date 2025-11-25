import { useState, memo } from "react";
import { 
  Star,
  Send,
  CheckCircle,
  User,
  Heart,
  ThumbsUp,
  MessageCircle,
  Award,
  Sparkles,
  TrendingUp,
  Users,
  Clock
} from "lucide-react";
import { BackHeader } from "./BackHeader";

interface ReviewPageProps {
  onBack: () => void;
}

const existingReviews = [
  {
    id: 1,
    name: "Анна Козлова",
    rating: 5,
    date: "3 дня назад",
    comment: "Потрясающий результат! Приложение для моего бутика превзошло все ожидания. Продажи выросли на 180% за первый месяц работы. Клиенты в восторге от удобства заказов прямо в Telegram. Команда работала профессионально, все сроки соблюдены. Однозначно рекомендую!",
    project: "Бутик женской одежды",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b36b8739?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80",
    location: "Москва"
  },
  {
    id: 2,
    name: "Михаил Петров",
    rating: 5,
    date: "1 неделю назад", 
    comment: "Заказывал приложение для ресторана доставки. Результат превосходный! Теперь принимаем заказы 24/7 через Telegram, клиенты довольны, персонал тоже. Интеграция с платежами работает без сбоев. Техподдержка отвечает моментально. Планирую заказать ещё одно приложение для второго ресторана.",
    project: "Ресторан \"Вкусная Азия\"",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80",
    location: "Санкт-Петербург"
  },
  {
    id: 3,
    name: "Елена Смирнова",
    rating: 5,
    date: "2 недели назад",
    comment: "Фитнес-центр получил отличное приложение! Запись на тренировки стала проще, клиенты могут видеть расписание и бронировать места. Очень удобная система уведомлений. Разработчики учли все наши пожелания. Качество на высшем уровне!",
    project: "Фитнес-центр \"Энергия\"",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80",
    location: "Екатеринбург"
  },
  {
    id: 4,
    name: "Дмитрий Волков",
    rating: 4,
    date: "3 недели назад",
    comment: "Хорошая работа команды! Интернет-магазин электроники работает стабильно. Единственное пожелание - хотелось бы больше возможностей для кастомизации дизайна. В остальном всё отлично - сроки соблюдены, функционал полный, поддержка оперативная.",
    project: "Магазин электроники \"ТехноМир\"",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80",
    location: "Новосибирск"
  },
  {
    id: 5,
    name: "Ольга Тихонова",
    rating: 5,
    date: "1 месяц назад",
    comment: "Заказывала приложение для салона красоты. Девочки в восторге! Клиенты теперь сами записываются на процедуры, видят свободные окна, получают напоминания. Работа стала намного организованнее. Спасибо за профессионализм!",
    project: "Салон красоты \"Афродита\"",
    avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80",
    location: "Краснодар"
  }
];

const ReviewPage = memo(function ReviewPage({ onBack }: ReviewPageProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitReview = async () => {
    if (isFormValid) {
      setIsSubmitting(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsSubmitting(false);
      setSubmitted(true);
    }
  };

  const isFormValid = rating > 0 && comment.trim().length >= 10 && name.trim().length >= 2;

  const renderStars = (currentRating: number, interactive = false, size = "w-6 h-6") => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isActive = interactive 
        ? starValue <= (hoveredRating || rating)
        : starValue <= currentRating;
      
      return (
        <button
          key={index}
          className={`transition-all duration-200 ${
            interactive ? 'cursor-pointer' : 'cursor-default'
          }`}
          onClick={interactive ? () => setRating(starValue) : undefined}
          onMouseEnter={interactive ? () => setHoveredRating(starValue) : undefined}
          onMouseLeave={interactive ? () => setHoveredRating(0) : undefined}
          disabled={!interactive}
        >
          <Star
            className={`${size} transition-all duration-200 ${
              isActive
                ? 'text-system-orange fill-current'
                : 'text-quaternary-label'
            } ${interactive && hoveredRating >= starValue ? 'scale-110' : ''}`}
          />
        </button>
      );
    });
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 5: return "Превосходно! ⭐";
      case 4: return "Очень хорошо! 👍";
      case 3: return "Хорошо 👌";
      case 2: return "Удовлетворительно 😐";
      case 1: return "Плохо 😞";
      default: return "";
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-black text-white safe-area-top">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="max-w-sm mx-auto">
            <div className="glass-card p-8 text-center">
              <div className="w-20 h-20 bg-system-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-system-green" />
              </div>
              <h2 className="ios-title2 mb-4 text-center">Спасибо за отзыв!</h2>
              <p className="ios-body text-secondary-label mb-6 text-center leading-relaxed">
                Ваша оценка очень важна для нас. Мы учтем ваши комментарии для улучшения сервиса.
              </p>
              <div className="glass-card p-4 bg-system-blue/5 border-system-blue/20 mb-6">
                <div className="flex items-center justify-center space-x-2 text-system-blue">
                  <Sparkles className="w-4 h-4" />
                  <span className="ios-footnote font-semibold">Скидка 10% на следующий проект активирована!</span>
                </div>
              </div>
              <button 
                className="ios-button-filled w-full"
                onClick={onBack}
              >
                Вернуться в профиль
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-32">
      <BackHeader onBack={onBack} title="Оставить отзыв" />

      <div className="max-w-md mx-auto px-4 space-y-6 mt-4">
        {/* Hero Section */}
        <section className="ios-slide-up">
          <div className="glass-card p-6 text-center">
            <div className="w-16 h-16 bg-system-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-system-orange" />
            </div>
            <h2 className="ios-title3 mb-2">Расскажите о вашем опыте</h2>
            <p className="ios-body text-secondary-label leading-relaxed">
              Ваше мнение поможет нам стать лучше и поможет другим клиентам сделать выбор
            </p>
          </div>
        </section>

        {/* Rating Section */}
        <section className="ios-slide-up">
          <div className="glass-card p-6">
            <div className="text-center mb-6">
              <h3 className="ios-headline font-semibold mb-4">Оцените качество работы</h3>
              
              {/* Rating Stars */}
              <div className="flex justify-center space-x-2 mb-4">
                {renderStars(rating, true, "w-8 h-8")}
              </div>

              {/* Rating Description */}
              {rating > 0 && (
                <div className="glass-card p-3 bg-system-orange/5 border-system-orange/20">
                  <p className="ios-body font-semibold text-system-orange">
                    {getRatingText(rating)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section className="ios-slide-up">
          <div className="glass-card p-6 space-y-6">
            <h3 className="ios-headline font-semibold text-center">Расскажите подробнее</h3>
            
            {/* Name Field */}
            <div className="space-y-2">
              <label className="ios-footnote text-secondary-label font-medium block">
                Ваше имя *
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-white/20 rounded-xl bg-white/10 text-white ios-body transition-all duration-200 focus:border-system-blue focus:ring-1 focus:ring-system-blue/20 focus:outline-none"
                placeholder="Как к вам обращаться?"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={50}
              />
              <div className="flex justify-between">
                <span className={`ios-caption2 ${name.length >= 2 || name.length === 0 ? 'text-secondary-label' : 'text-system-red'}`}>
                  {name.length > 0 && name.length < 2 ? 'Слишком короткое имя' : 'Минимум 2 символа'}
                </span>
                <span className="ios-caption2 text-secondary-label">{name.length}/50</span>
              </div>
            </div>

            {/* Company Field */}
            <div className="space-y-2">
              <label className="ios-footnote text-secondary-label font-medium block">
                Название компании/проекта
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-white/20 rounded-xl bg-white/10 text-white ios-body transition-all duration-200 focus:border-system-blue focus:ring-1 focus:ring-system-blue/20 focus:outline-none"
                placeholder="Опционально"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                maxLength={100}
              />
              <div className="text-right">
                <span className="ios-caption2 text-secondary-label">{company.length}/100</span>
              </div>
            </div>

            {/* Comment Field */}
            <div className="space-y-2">
              <label className="ios-footnote text-secondary-label font-medium block">
                Ваш отзыв *
              </label>
              <textarea
                className="w-full px-4 py-3 border border-separator rounded-xl bg-white ios-body transition-all duration-200 focus:border-system-blue focus:ring-1 focus:ring-system-blue/20 focus:outline-none resize-none"
                rows={5}
                placeholder="Поделитесь впечатлениями о работе с нами, качестве результата, соблюдении сроков..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={500}
              />
              <div className="flex justify-between">
                <span className={`ios-caption2 ${comment.length >= 10 || comment.length === 0 ? 'text-secondary-label' : 'text-system-red'}`}>
                  {comment.length > 0 && comment.length < 10 ? 'Слишком короткий отзыв' : 'Минимум 10 символов'}
                </span>
                <span className="ios-caption2 text-secondary-label">{comment.length}/500</span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                className={`w-full py-4 rounded-xl font-semibold ios-body transition-all duration-200 flex items-center justify-center space-x-2 ${
                  isFormValid
                    ? 'bg-system-blue text-white hover:bg-system-blue/90 active:bg-system-blue/80'
                    : 'bg-quaternary-system-fill text-quaternary-label cursor-not-allowed'
                }`}
                onClick={handleSubmitReview}
                disabled={!isFormValid || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Отправляем...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Отправить отзыв</span>
                  </>
                )}
              </button>
              
              {!isFormValid && (
                <p className="ios-caption2 text-secondary-label text-center mt-2">
                  Заполните все обязательные поля
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section className="ios-slide-up">
          <div className="glass-card p-6">
            <h3 className="ios-headline font-semibold mb-4 text-center">Доверие клиентов</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="glass-card p-4 text-center">
                <div className="flex items-center justify-center space-x-1 mb-2">
                  <Star className="w-5 h-5 text-system-orange fill-current" />
                  <span className="ios-title3 font-bold">4.9</span>
                </div>
                <p className="ios-caption1 text-secondary-label font-medium">Средний рейтинг</p>
              </div>
              <div className="glass-card p-4 text-center">
                <div className="flex items-center justify-center space-x-1 mb-2">
                  <MessageCircle className="w-5 h-5 text-system-blue" />
                  <span className="ios-title3 font-bold">127</span>
                </div>
                <p className="ios-caption1 text-secondary-label font-medium">Отзывов</p>
              </div>
              <div className="glass-card p-4 text-center">
                <div className="flex items-center justify-center space-x-1 mb-2">
                  <TrendingUp className="w-5 h-5 text-system-green" />
                  <span className="ios-title3 font-bold">96%</span>
                </div>
                <p className="ios-caption1 text-secondary-label font-medium">Рекомендуют</p>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Reviews */}
        <section className="ios-slide-up">
          <div className="glass-card p-6">
            <h3 className="ios-headline font-semibold mb-6 text-center">Отзывы клиентов</h3>
            <div className="space-y-6">
              {existingReviews.map((review) => (
                <div key={review.id} className="glass-card p-5">
                  <div className="flex items-start space-x-4">
                    <img
                      src={review.avatar}
                      alt={review.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="ios-body font-semibold">{review.name}</div>
                          <div className="ios-caption1 text-secondary-label">
                            {review.project} • {review.location}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="flex space-x-1">
                            {renderStars(review.rating, false, "w-3 h-3")}
                          </div>
                        </div>
                      </div>
                      <p className="ios-footnote text-secondary-label leading-relaxed mb-3">
                        {review.comment}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="ios-caption2 text-tertiary-label">{review.date}</span>
                        <div className="flex items-center space-x-3">
                          <button className="flex items-center space-x-1 text-tertiary-label hover:text-system-blue transition-colors">
                            <ThumbsUp className="w-3 h-3" />
                            <span className="ios-caption2">Полезно</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Incentive */}
        <section className="ios-slide-up">
          <div className="glass-card p-6 bg-gradient-to-r from-system-blue/5 to-system-purple/5 border-system-blue/20">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-system-blue/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-system-blue" />
              </div>
              <div className="flex-1">
                <div className="ios-body font-semibold text-system-blue mb-1">
                  Получите скидку 10%
                </div>
                <div className="ios-footnote text-secondary-label">
                  На следующий проект за честный отзыв
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
});

export default ReviewPage;