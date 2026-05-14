import { useEffect, useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import { FaStar } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { usersService } from '../../../api';
import type { ApiMyReview } from '../../../api/types';
import Spinner from '../../../shared/components/Spinner';
import './ReviewsPage.css';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="star-rating" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <FaStar
          key={i}
          className={`star star--icon ${i < rating ? 'star--filled' : ''}`}
          aria-hidden
        />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ApiMyReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    const uid = user.id;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await usersService.getReviews(uid);
        if (!cancelled) setReviews(data);
      } catch (err) {
        if (!cancelled) setReviews([]);
        if (axios.isAxiosError(err) && err.response?.status !== 401) {
          console.error(err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  if (!user) {
    return (
      <div className="reviews-page">
        <p className="reviews-page__sub">Sign in to see your reviews.</p>
      </div>
    );
  }

  return (
    <div className="reviews-page">
      <div className="reviews-page__header">
        <h1 className="reviews-page__title">My Reviews</h1>
        <p className="reviews-page__sub">Reviews you&apos;ve left for your stays.</p>
      </div>

      {loading && (
        <div className="reviews-page__state">
          <Spinner />
        </div>
      )}

      {!loading && reviews.length === 0 && (
        <p className="reviews-page__empty">You haven&apos;t written any reviews yet.</p>
      )}

      {!loading && reviews.length > 0 && (
        <div className="reviews-list">
          {reviews.map((r) => {
            const img = r.listing.photos?.[0]?.url;
            const hostName = r.listing.host?.name ?? 'Host';
            return (
              <div key={r.id} className="review-card">
                {img
                  ? <img src={img} alt="" className="review-card__img" />
                  : <div className="review-card__img review-card__img--empty" aria-hidden />}
                <div className="review-card__body">
                  <div className="review-card__top">
                    <div>
                      <h3 className="review-card__listing">{r.listing.title}</h3>
                      <p className="review-card__host">Hosted by {hostName} · {r.listing.location}</p>
                    </div>
                    <span className="review-card__date">{dayjs(r.createdAt).format('MMM D, YYYY')}</span>
                  </div>
                  <StarRating rating={r.rating} />
                  <p className="review-card__comment">{r.comment}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
