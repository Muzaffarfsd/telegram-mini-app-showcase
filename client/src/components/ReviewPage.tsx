import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Star } from 'lucide-react';
import type { Review } from '@shared/schema';
import { useLanguage } from '../contexts/LanguageContext';
import { useTelegram } from '../hooks/useTelegram';
import { profilePost } from '../lib/profileRequest';
import { ProfileDetailArtwork, ProfileDetailLayout, ProfileDetailLoading } from './ProfileDetailLayout';
import reviewArtwork from '../assets/profile/review-detail-v5.webp';

interface ReviewPageProps {
  onBack: () => void;
}
type PublicReview = Omit<Review, 'telegramId'> & { hasAuthorAccount?: boolean };
type ReviewsResult = { data: PublicReview[]; total: number } | PublicReview[];

export default function ReviewPage({ onBack }: ReviewPageProps) {
  const { language } = useLanguage();
  const { user, initData } = useTelegram();
  const ru = language === 'ru';
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [name, setName] = useState(user?.first_name || '');
  const [nameTouched, setNameTouched] = useState(false);
  const [company, setCompany] = useState('');
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  useEffect(() => {
    if (!nameTouched && user?.first_name) setName(user.first_name);
  }, [nameTouched, user?.first_name]);
  const reviewsQuery = useQuery<ReviewsResult>({
    queryKey: ['/api/reviews'],
    queryFn: async () => {
      const response = await fetch('/api/reviews?submitted=1');
      if (!response.ok) throw new Error('Could not load reviews');
      return response.json();
    },
  });
  // The legacy seed contains sample testimonials without an author account.
  // Show submitted, approved feedback only; do not present sample entries as client reviews.
  const reviews = (Array.isArray(reviewsQuery.data) ? reviewsQuery.data : reviewsQuery.data?.data || [])
    .filter((review) => review.hasAuthorAccount === true);
  const submit = useMutation({
    mutationFn: (payload: { name: string; company?: string; rating: number; text: string }) =>
      profilePost('/api/reviews', initData, payload),
    onSuccess: () => {
      setSubmitted(true);
      void queryClient.invalidateQueries({ queryKey: ['/api/reviews'] });
    },
  });
  const valid = rating > 0 && name.trim().length >= 2 && comment.trim().length >= 10;

  return (
    <ProfileDetailLayout
      title={ru ? 'Ваш опыт важен' : 'Your experience matters'}
      intro={ru ? 'Расскажите, как вам работа с WEB4TG.' : 'Tell us about your experience with WEB4TG.'}
      eyebrow={ru ? 'ОТЗЫВЫ' : 'REVIEWS'}
      onBack={onBack}
      testId="profile-review-page"
    >
      {submitted ? (
        <div className="pd-card pd-review-success" role="status">
          <ProfileDetailArtwork src={reviewArtwork} className="pd-review-art" />
          <h2>{ru ? 'Спасибо за отзыв' : 'Thank you for your review'}</h2>
          <p className="pd-muted">
            {ru ? 'Мы получили его и отправили на модерацию.' : 'We have received it for moderation.'}
          </p>
          <button className="pd-button" type="button" onClick={onBack} data-testid="button-back-profile">
            {ru ? 'Вернуться в профиль' : 'Return to profile'} <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      ) : (
        <form
          className="pd-card pd-review-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (!valid || !initData || submit.isPending) return;
            const trimmedCompany = company.trim();
            submit.mutate({
              name: name.trim(),
              ...(trimmedCompany ? { company: trimmedCompany } : {}),
              rating,
              text: comment.trim(),
            });
          }}
        >
          <div className="pd-review-intro">
            <div>
              <span className="pd-kicker">{ru ? 'ПОДЕЛИТЬСЯ ВПЕЧАТЛЕНИЕМ' : 'SHARE YOUR FEEDBACK'}</span>
              <h2>{ru ? 'Оцените работу' : 'Rate your experience'}</h2>
              <p className="pd-muted">
                {ru ? 'Выберите оценку и напишите пару слов.' : 'Choose a rating and tell us more.'}
              </p>
            </div>
            <ProfileDetailArtwork src={reviewArtwork} className="pd-review-form-art" />
          </div>
          <fieldset className="pd-rating">
            <legend>
              <span className="pd-step-number">01</span>
              {ru ? 'Ваша оценка' : 'Your rating'}
            </legend>
            <div>
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  type="button"
                  key={value}
                  aria-label={ru ? `${value} из 5` : `${value} out of 5`}
                  aria-pressed={rating === value}
                  onClick={() => setRating(value)}
                  data-testid={`review-rating-${value}`}
                >
                  <Star size={25} fill={value <= rating ? 'currentColor' : 'none'} aria-hidden="true" />
                </button>
              ))}
            </div>
          </fieldset>
          <div className="pd-form-step">
            <span className="pd-step-number">02</span>
            {ru ? 'Пара слов о вас' : 'A little about you'}
          </div>
          <label className="pd-field" htmlFor="review-name">
            <span>{ru ? 'Как к вам обращаться' : 'Your name'}</span>
            <input
              id="review-name"
              value={name}
              maxLength={100}
              autoComplete="name"
              onChange={(event) => {
                setNameTouched(true);
                setName(event.target.value);
              }}
              placeholder={ru ? 'Ваше имя' : 'Your name'}
            />
          </label>
          <label className="pd-field" htmlFor="review-company">
            <span>
              {ru ? 'Компания или проект' : 'Company or project'}{' '}
              <small>{ru ? 'необязательно' : 'optional'}</small>
            </span>
            <input
              id="review-company"
              value={company}
              maxLength={200}
              onChange={(event) => setCompany(event.target.value)}
              placeholder={ru ? 'Название' : 'Name'}
            />
          </label>
          <div className="pd-form-step">
            <span className="pd-step-number">03</span>
            {ru ? 'Ваши впечатления' : 'Your feedback'}
          </div>
          <label className="pd-field" htmlFor="review-text">
            <span>{ru ? 'Ваш отзыв' : 'Your review'}</span>
            <textarea
              id="review-text"
              value={comment}
              maxLength={4000}
              rows={4}
              onChange={(event) => setComment(event.target.value)}
              placeholder={
                ru ? 'Что вам понравилось или что нам улучшить?' : 'What went well or what could we improve?'
              }
            />
          </label>
          <p className="pd-form-hint">
            {ru ? 'Имя — от 2 символов, отзыв — от 10.' : 'Name: at least 2 characters; review: at least 10.'}
          </p>
          {!initData && (
            <p className="pd-form-hint">
              {ru
                ? 'Чтобы отправить отзыв, откройте приложение в Telegram.'
                : 'Open the app in Telegram to submit your review.'}
            </p>
          )}
          {submit.isError && (
            <p className="pd-form-error" role="alert">
              {ru
                ? 'Не удалось отправить отзыв. Попробуйте ещё раз.'
                : 'Could not send the review. Please try again.'}
            </p>
          )}
          <button
            className="pd-button full"
            type="submit"
            disabled={!valid || !initData || submit.isPending}
            data-testid="button-submit-review"
          >
            {submit.isPending ? (ru ? 'Отправляем…' : 'Sending…') : ru ? 'Отправить отзыв' : 'Send review'}
          </button>
        </form>
      )}
      <section className="pd-section" aria-labelledby="reviews-list-title">
        <h2 id="reviews-list-title">{ru ? 'Отзывы клиентов' : 'Customer reviews'}</h2>
        {reviewsQuery.isLoading ? (
          <ProfileDetailLoading label={ru ? 'Загрузка отзывов' : 'Loading reviews'} />
        ) : reviewsQuery.isError ? (
          <div className="pd-notice">
            <p>{ru ? 'Не удалось загрузить отзывы.' : 'Could not load reviews.'}</p>
            <button className="pd-button secondary" type="button" onClick={() => void reviewsQuery.refetch()}>
              {ru ? 'Попробовать снова' : 'Try again'}
            </button>
          </div>
        ) : reviews.length === 0 ? (
          <div className="pd-notice">
            {ru ? 'Здесь появятся опубликованные отзывы.' : 'Published reviews will appear here.'}
          </div>
        ) : (
          <div className="pd-review-list">
            {reviews.map((review) => (
              <article className="pd-card pd-review-item" key={review.id}>
                <div>
                  <strong>{review.name}</strong>
                  <span aria-label={ru ? `Оценка ${review.rating} из 5` : `Rating ${review.rating} out of 5`}>
                    <Star size={15} fill="currentColor" aria-hidden="true" /> {review.rating}
                  </span>
                </div>
                {review.company && <small>{review.company}</small>}
                <p>{review.text}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </ProfileDetailLayout>
  );
}
