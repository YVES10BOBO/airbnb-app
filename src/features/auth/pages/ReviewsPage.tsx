import './ReviewsPage.css';

interface Review {
  id: number;
  listing: string;
  img: string;
  rating: number;
  comment: string;
  date: string;
  host: string;
}

const MOCK_REVIEWS: Review[] = [
  {
    id: 1,
    listing: 'Luxury Beach Villa',
    img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=260&fit=crop',
    rating: 5,
    comment: 'Absolutely stunning villa! The views were breathtaking and the host was incredibly welcoming. Would definitely return.',
    date: '2026-04-20',
    host: 'Maria S.',
  },
  {
    id: 2,
    listing: 'Cozy Mountain Cabin',
    img: 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=400&h=260&fit=crop',
    rating: 4,
    comment: 'Beautiful cabin with amazing mountain views. Very cozy and well-equipped. The hike nearby was spectacular.',
    date: '2026-03-15',
    host: 'James K.',
  },
  {
    id: 3,
    listing: 'Modern Downtown Apartment',
    img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=260&fit=crop',
    rating: 5,
    comment: 'Perfect location in the heart of the city. The apartment was clean, modern, and had everything we needed.',
    date: '2026-04-12',
    host: 'Sophie L.',
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="star-rating">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < rating ? 'star star--filled' : 'star'}>★</span>
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  return (
    <div className="reviews-page">
      <div className="reviews-page__header">
        <h1 className="reviews-page__title">My Reviews</h1>
        <p className="reviews-page__sub">Reviews you've left for your stays.</p>
      </div>

      <div className="reviews-list">
        {MOCK_REVIEWS.map((r) => (
          <div key={r.id} className="review-card">
            <img src={r.img} alt={r.listing} className="review-card__img" />
            <div className="review-card__body">
              <div className="review-card__top">
                <div>
                  <h3 className="review-card__listing">{r.listing}</h3>
                  <p className="review-card__host">Hosted by {r.host}</p>
                </div>
                <span className="review-card__date">{r.date}</span>
              </div>
              <StarRating rating={r.rating} />
              <p className="review-card__comment">{r.comment}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
