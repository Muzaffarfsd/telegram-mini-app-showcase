import { useState, memo } from "react";
import { 
  Star,
  Send,
  CheckCircle,
  MessageCircle,
  TrendingUp,
  ArrowRight,
  Quote,
  ThumbsUp
} from "lucide-react";

interface ReviewPageProps {
  onBack: () => void;
}

const existingReviews = [
  {
    id: 1,
    name: "Анна Козлова",
    rating: 5,
    date: "3 дня назад",
    comment: "Потрясающий результат! Приложение для моего бутика превзошло все ожидания. Продажи выросли на 180% за первый месяц.",
    project: "Бутик женской одежды",
    location: "Москва"
  },
  {
    id: 2,
    name: "Михаил Петров",
    rating: 5,
    date: "1 неделю назад", 
    comment: "Заказывал приложение для ресторана доставки. Результат превосходный! Теперь принимаем заказы 24/7 через Telegram.",
    project: "Ресторан \"Вкусная Азия\"",
    location: "Санкт-Петербург"
  },
  {
    id: 3,
    name: "Елена Смирнова",
    rating: 5,
    date: "2 недели назад",
    comment: "Фитнес-центр получил отличное приложение! Запись на тренировки стала проще, клиенты могут видеть расписание.",
    project: "Фитнес-центр \"Энергия\"",
    location: "Екатеринбург"
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
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsSubmitting(false);
      setSubmitted(true);
    }
  };

  const isFormValid = rating > 0 && comment.trim().length >= 10 && name.trim().length >= 2;

  const renderStars = (currentRating: number, interactive = false, size = 24) => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isActive = interactive 
        ? starValue <= (hoveredRating || rating)
        : starValue <= currentRating;
      
      return (
        <button
          key={index}
          className="transition-all duration-200"
          style={{ cursor: interactive ? 'pointer' : 'default' }}
          onClick={interactive ? () => setRating(starValue) : undefined}
          onMouseEnter={interactive ? () => setHoveredRating(starValue) : undefined}
          onMouseLeave={interactive ? () => setHoveredRating(0) : undefined}
          disabled={!interactive}
          data-testid={interactive ? `button-star-${starValue}` : undefined}
        >
          <Star
            size={size}
            style={{
              color: isActive ? '#F59E0B' : '#52525B',
              fill: isActive ? '#F59E0B' : 'none',
              transform: interactive && hoveredRating >= starValue ? 'scale(1.1)' : 'scale(1)',
              transition: 'all 0.2s'
            }}
          />
        </button>
      );
    });
  };

  if (submitted) {
    return (
      <div 
        className="min-h-screen pb-32"
        style={{ 
          background: '#09090B',
          color: '#E4E4E7',
          paddingTop: '140px'
        }}
      >
        <div className="max-w-md mx-auto flex items-center justify-center min-h-[60vh] px-7">
          <div className="text-center">
            <div 
              style={{
                width: '80px',
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '20px',
                background: 'rgba(34, 197, 94, 0.1)',
                margin: '0 auto 24px'
              }}
            >
              <CheckCircle size={40} color="#22C55E" />
            </div>
            
            <h2 style={{
              fontSize: '28px',
              fontWeight: 600,
              color: '#FAFAFA',
              marginBottom: '12px'
            }}>
              Спасибо за отзыв!
            </h2>
            
            <p style={{
              fontSize: '15px',
              color: '#71717A',
              lineHeight: '1.6',
              marginBottom: '32px',
              maxWidth: '280px',
              margin: '0 auto 32px'
            }}>
              Ваша оценка очень важна для нас. Мы учтем ваши комментарии для улучшения сервиса.
            </p>
            
            <div 
              style={{
                padding: '16px 20px',
                borderRadius: '12px',
                background: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                marginBottom: '24px'
              }}
            >
              <p style={{ fontSize: '14px', fontWeight: 500, color: '#A78BFA' }}>
                Скидка 10% на следующий проект активирована!
              </p>
            </div>
            
            <button
              onClick={onBack}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 28px',
                borderRadius: '12px',
                background: '#A78BFA',
                border: 'none',
                color: '#09090B',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              data-testid="button-back-profile"
            >
              Вернуться в профиль
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen pb-32"
      style={{ 
        background: '#09090B',
        color: '#E4E4E7',
        paddingTop: '140px'
      }}
    >
      <div className="max-w-md mx-auto">
        
        {/* HERO SECTION */}
        <header className="px-7 pt-8 pb-16">
          <p 
            className="scroll-fade-in"
            style={{
              fontSize: '11px',
              fontWeight: 500,
              letterSpacing: '0.18em',
              color: '#71717A',
              textTransform: 'uppercase',
              marginBottom: '24px'
            }}
          >
            Отзывы
          </p>
          
          <h1 
            className="scroll-fade-in-delay-1"
            style={{
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: '32px',
              fontWeight: 600,
              letterSpacing: '-0.025em',
              lineHeight: '1.2',
              color: '#FAFAFA'
            }}
          >
            Расскажите о
            <br />
            <span style={{ color: '#F59E0B' }}>вашем опыте</span>
          </h1>
          
          <p 
            className="scroll-fade-in-delay-2"
            style={{
              fontSize: '15px',
              fontWeight: 400,
              letterSpacing: '-0.01em',
              lineHeight: '1.6',
              color: '#71717A',
              marginTop: '20px',
              maxWidth: '320px'
            }}
          >
            Ваше мнение поможет нам стать лучше и поможет другим клиентам сделать выбор.
          </p>
        </header>

        {/* Hairline */}
        <div 
          className="mx-7"
          style={{ height: '1px', background: '#27272A' }}
        />

        {/* RATING SECTION */}
        <section className="px-7 py-12">
          <p 
            style={{
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.12em',
              color: '#52525B',
              textTransform: 'uppercase',
              marginBottom: '20px'
            }}
          >
            Ваша оценка
          </p>
          
          <div 
            style={{
              padding: '32px 24px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(234,88,12,0.04) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.15)',
              textAlign: 'center'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
              {renderStars(rating, true, 32)}
            </div>
            
            {rating > 0 && (
              <p style={{ fontSize: '15px', fontWeight: 500, color: '#F59E0B' }}>
                {rating === 5 ? 'Превосходно!' : rating === 4 ? 'Очень хорошо!' : rating === 3 ? 'Хорошо' : rating === 2 ? 'Удовлетворительно' : 'Плохо'}
              </p>
            )}
          </div>
        </section>

        {/* FORM SECTION */}
        <section className="px-7 py-8">
          <p 
            style={{
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.12em',
              color: '#52525B',
              textTransform: 'uppercase',
              marginBottom: '20px'
            }}
          >
            Детали отзыва
          </p>
          
          <div className="space-y-5">
            {/* Name Field */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: '#71717A',
                marginBottom: '8px'
              }}>
                Ваше имя *
              </label>
              <input
                type="text"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#FAFAFA',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                placeholder="Как к вам обращаться?"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={50}
                data-testid="input-name"
              />
            </div>

            {/* Company Field */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: '#71717A',
                marginBottom: '8px'
              }}>
                Название компании
              </label>
              <input
                type="text"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#FAFAFA',
                  fontSize: '15px',
                  outline: 'none'
                }}
                placeholder="Опционально"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                maxLength={100}
                data-testid="input-company"
              />
            </div>

            {/* Comment Field */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: '#71717A',
                marginBottom: '8px'
              }}>
                Ваш отзыв *
              </label>
              <textarea
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#FAFAFA',
                  fontSize: '15px',
                  outline: 'none',
                  resize: 'none',
                  minHeight: '120px'
                }}
                placeholder="Поделитесь впечатлениями..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={500}
                data-testid="input-comment"
              />
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                marginTop: '8px'
              }}>
                <span style={{ fontSize: '12px', color: comment.length >= 10 || comment.length === 0 ? '#52525B' : '#EF4444' }}>
                  {comment.length > 0 && comment.length < 10 ? 'Минимум 10 символов' : ''}
                </span>
                <span style={{ fontSize: '12px', color: '#52525B' }}>{comment.length}/500</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmitReview}
              disabled={!isFormValid || isSubmitting}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '16px 24px',
                borderRadius: '12px',
                background: isFormValid ? '#A78BFA' : 'rgba(255, 255, 255, 0.05)',
                border: 'none',
                color: isFormValid ? '#09090B' : '#52525B',
                fontSize: '15px',
                fontWeight: 600,
                cursor: isFormValid ? 'pointer' : 'not-allowed',
                marginTop: '12px'
              }}
              data-testid="button-submit-review"
            >
              {isSubmitting ? (
                <>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid rgba(0,0,0,0.2)',
                    borderTopColor: '#09090B',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  <span>Отправляем...</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>Отправить отзыв</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* Hairline */}
        <div 
          className="mx-7"
          style={{ height: '1px', background: '#27272A' }}
        />

        {/* STATS SECTION */}
        <section className="px-7 py-12">
          <p 
            style={{
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.12em',
              color: '#52525B',
              textTransform: 'uppercase',
              marginBottom: '20px'
            }}
          >
            Доверие клиентов
          </p>
          
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '12px'
            }}
          >
            {[
              { value: '4.9', label: 'рейтинг', icon: Star, color: '#F59E0B' },
              { value: '127', label: 'отзывов', icon: MessageCircle, color: '#3B82F6' },
              { value: '96%', label: 'рекомендуют', icon: TrendingUp, color: '#22C55E' }
            ].map((stat, index) => (
              <div 
                key={index}
                style={{
                  padding: '20px 16px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                  textAlign: 'center'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px' }}>
                  <stat.icon size={16} color={stat.color} />
                  <span style={{
                    fontSize: '22px',
                    fontWeight: 700,
                    color: '#FAFAFA',
                    letterSpacing: '-0.03em'
                  }}>
                    {stat.value}
                  </span>
                </div>
                <p style={{
                  fontSize: '11px',
                  color: '#52525B'
                }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* REVIEWS SECTION */}
        <section className="px-7 py-8 pb-16">
          <p 
            style={{
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.12em',
              color: '#52525B',
              textTransform: 'uppercase',
              marginBottom: '20px'
            }}
          >
            Отзывы клиентов
          </p>
          
          <div className="space-y-4">
            {existingReviews.map((review) => (
              <div 
                key={review.id}
                style={{
                  padding: '20px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.04)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(59,130,246,0.1) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <span style={{ fontSize: '16px', fontWeight: 600, color: '#A78BFA' }}>
                      {review.name.charAt(0)}
                    </span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <p style={{ fontSize: '15px', fontWeight: 600, color: '#FAFAFA' }}>{review.name}</p>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {renderStars(review.rating, false, 12)}
                      </div>
                    </div>
                    <p style={{ fontSize: '12px', color: '#52525B' }}>
                      {review.project} · {review.location}
                    </p>
                  </div>
                </div>
                
                <p style={{
                  fontSize: '14px',
                  color: '#A1A1AA',
                  lineHeight: '1.5',
                  marginBottom: '12px'
                }}>
                  "{review.comment}"
                </p>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', color: '#52525B' }}>{review.date}</span>
                  <button 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: 'none',
                      border: 'none',
                      color: '#52525B',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                    data-testid={`button-helpful-${review.id}`}
                  >
                    <ThumbsUp size={12} />
                    <span>Полезно</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* INCENTIVE CTA */}
        <section className="px-7 py-8 pb-24">
          <div 
            style={{
              padding: '24px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(59,130,246,0.05) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(139, 92, 246, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Quote size={24} color="#A78BFA" />
            </div>
            <div>
              <p style={{ fontSize: '15px', fontWeight: 600, color: '#FAFAFA', marginBottom: '4px' }}>
                Получите скидку 10%
              </p>
              <p style={{ fontSize: '13px', color: '#71717A' }}>
                На следующий проект за честный отзыв
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
});

export default ReviewPage;
