import { useState, memo } from "react";
import { ArrowRight, Star, Send, CheckCircle, MessageSquare, TrendingUp, Award } from "lucide-react";

interface ReviewPageProps {
  onBack: () => void;
}

const reviews = [
  {
    name: "Анна К.",
    company: "Бутик «Элегант»",
    text: "Продажи выросли на 180% за первый месяц. Клиенты в восторге от удобства.",
    rating: 5
  },
  {
    name: "Михаил П.",
    company: "Ресторан доставки",
    text: "Заказы идут круглосуточно. Лучшее вложение в бизнес за последние годы.",
    rating: 5
  },
  {
    name: "Елена С.",
    company: "Фитнес-центр",
    text: "Запись на тренировки автоматизирована. Высвободили 3 часа в день.",
    rating: 5
  }
];

const ReviewPage = memo(function ReviewPage({ onBack }: ReviewPageProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating > 0 && comment.trim().length >= 10 && name.trim().length >= 2) {
      setIsSubmitting(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSubmitting(false);
      setSubmitted(true);
    }
  };

  const isValid = rating > 0 && comment.trim().length >= 10 && name.trim().length >= 2;

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
        <div className="max-w-md mx-auto px-7 flex items-center justify-center" style={{ minHeight: '60vh' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '16px',
              background: 'rgba(34, 197, 94, 0.1)',
              margin: '0 auto 20px'
            }}>
              <CheckCircle size={32} color="#22C55E" />
            </div>
            
            <h2 style={{
              fontSize: '24px',
              fontWeight: 600,
              color: '#FAFAFA',
              marginBottom: '8px'
            }}>
              Спасибо за отзыв
            </h2>
            
            <p style={{
              fontSize: '14px',
              color: '#71717A',
              marginBottom: '24px'
            }}>
              Ваше мнение важно для нас
            </p>
            
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
              Вернуться
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
        
        {/* HERO */}
        <header className="px-7 pt-8 pb-16">
          <button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'none',
              border: 'none',
              color: '#71717A',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              marginBottom: '20px',
              padding: 0
            }}
            data-testid="button-back"
          >
            <ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} />
            Назад
          </button>
          
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
            Ваше мнение
            <br />
            <span style={{ color: '#A78BFA' }}>формирует нас.</span>
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
            Расскажите о вашем опыте работы с нами — это поможет другим принять решение.
          </p>
        </header>

        {/* Hairline */}
        <div className="mx-7" style={{ height: '1px', background: '#27272A' }} />

        {/* STATS */}
        <section className="px-7 py-12">
          <p style={{
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '0.12em',
            color: '#52525B',
            textTransform: 'uppercase',
            marginBottom: '20px'
          }}>
            Статистика
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            {[
              { icon: Star, value: '4.9', label: 'рейтинг' },
              { icon: MessageSquare, value: '127', label: 'отзывов' },
              { icon: TrendingUp, value: '96%', label: 'рекомендуют' }
            ].map((stat, index) => (
              <div 
                key={index}
                style={{
                  padding: '20px 12px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                  textAlign: 'center'
                }}
              >
                <stat.icon size={18} color="#A78BFA" style={{ margin: '0 auto 8px' }} />
                <p style={{
                  fontSize: '22px',
                  fontWeight: 700,
                  color: '#FAFAFA',
                  letterSpacing: '-0.03em'
                }}>
                  {stat.value}
                </p>
                <p style={{ fontSize: '11px', color: '#52525B', marginTop: '2px' }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* FORM */}
        <section className="px-7 py-8">
          <p style={{
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '0.12em',
            color: '#52525B',
            textTransform: 'uppercase',
            marginBottom: '20px'
          }}>
            Оставить отзыв
          </p>
          
          {/* Rating */}
          <div 
            style={{
              padding: '24px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(59,130,246,0.04) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.15)',
              marginBottom: '16px',
              textAlign: 'center'
            }}
          >
            <p style={{ fontSize: '13px', color: '#71717A', marginBottom: '12px' }}>
              Ваша оценка
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                  data-testid={`button-star-${star}`}
                >
                  <Star
                    size={28}
                    fill={star <= rating ? '#F59E0B' : 'none'}
                    color={star <= rating ? '#F59E0B' : '#52525B'}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div style={{ marginBottom: '12px' }}>
            <input
              type="text"
              placeholder="Ваше имя"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              style={{
                width: '100%',
                padding: '16px 20px',
                borderRadius: '14px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.04)',
                color: '#FAFAFA',
                fontSize: '15px',
                outline: 'none'
              }}
              data-testid="input-name"
            />
          </div>

          {/* Company */}
          <div style={{ marginBottom: '12px' }}>
            <input
              type="text"
              placeholder="Название компании (опционально)"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              maxLength={100}
              style={{
                width: '100%',
                padding: '16px 20px',
                borderRadius: '14px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.04)',
                color: '#FAFAFA',
                fontSize: '15px',
                outline: 'none'
              }}
              data-testid="input-company"
            />
          </div>

          {/* Comment */}
          <div style={{ marginBottom: '16px' }}>
            <textarea
              placeholder="Расскажите о вашем опыте..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
              style={{
                width: '100%',
                padding: '16px 20px',
                borderRadius: '14px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.04)',
                color: '#FAFAFA',
                fontSize: '15px',
                outline: 'none',
                resize: 'none',
                minHeight: '120px'
              }}
              data-testid="input-comment"
            />
            <p style={{ 
              fontSize: '11px', 
              color: '#52525B', 
              textAlign: 'right',
              marginTop: '6px'
            }}>
              {comment.length}/500
            </p>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '16px 24px',
              borderRadius: '12px',
              background: isValid ? '#A78BFA' : 'rgba(255, 255, 255, 0.05)',
              border: 'none',
              color: isValid ? '#09090B' : '#52525B',
              fontSize: '15px',
              fontWeight: 600,
              cursor: isValid ? 'pointer' : 'not-allowed'
            }}
            data-testid="button-submit-review"
          >
            {isSubmitting ? (
              <span>Отправляем...</span>
            ) : (
              <>
                <Send size={18} />
                Отправить отзыв
              </>
            )}
          </button>
        </section>

        {/* Hairline */}
        <div className="mx-7" style={{ height: '1px', background: '#27272A' }} />

        {/* REVIEWS */}
        <section className="px-7 py-12">
          <p style={{
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '0.12em',
            color: '#52525B',
            textTransform: 'uppercase',
            marginBottom: '20px'
          }}>
            Отзывы клиентов
          </p>
          
          <div className="space-y-4">
            {reviews.map((review, index) => (
              <div 
                key={index}
                style={{
                  padding: '20px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.04)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: 'rgba(139, 92, 246, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span style={{ fontSize: '16px', fontWeight: 600, color: '#A78BFA' }}>
                      {review.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: '#FAFAFA' }}>
                      {review.name}
                    </p>
                    <p style={{ fontSize: '12px', color: '#52525B' }}>
                      {review.company}
                    </p>
                  </div>
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: '2px' }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={12} fill="#F59E0B" color="#F59E0B" />
                    ))}
                  </div>
                </div>
                <p style={{
                  fontSize: '14px',
                  color: '#A1A1AA',
                  lineHeight: '1.5',
                  fontStyle: 'italic'
                }}>
                  «{review.text}»
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="px-7 py-8 pb-16">
          <div 
            style={{
              padding: '28px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(59,130,246,0.08) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              textAlign: 'center'
            }}
          >
            <div style={{
              width: '56px',
              height: '56px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '16px',
              background: 'rgba(139, 92, 246, 0.2)',
              margin: '0 auto 16px'
            }}>
              <Award size={28} color="#A78BFA" />
            </div>
            
            <h3 style={{
              fontSize: '20px',
              fontWeight: 600,
              color: '#FAFAFA',
              marginBottom: '8px'
            }}>
              Бонус за отзыв
            </h3>
            
            <p style={{
              fontSize: '14px',
              color: '#71717A',
              lineHeight: '1.5'
            }}>
              Скидка 10% на следующий проект
              <br />
              за честный отзыв
            </p>
          </div>
        </section>

      </div>
    </div>
  );
});

export default ReviewPage;
