import { useNavigate } from 'react-router-dom';
import { useStore } from '../../../store/StoreContext';
import './ExplorePage.css';

const CATEGORIES = [
  { key: 'beach', label: 'Beach', emoji: '🏖️', desc: 'Ocean views, sand, and sun', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop' },
  { key: 'mountain', label: 'Mountain', emoji: '🏔️', desc: 'Fresh air and scenic peaks', img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop' },
  { key: 'city', label: 'City', emoji: '🏙️', desc: 'Urban stays in top cities', img: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&h=400&fit=crop' },
  { key: 'countryside', label: 'Countryside', emoji: '🌿', desc: 'Peaceful rural escapes', img: 'https://images.unsplash.com/photo-1500076656116-558758c991c1?w=600&h=400&fit=crop' },
] as const;

export default function ExplorePage() {
  const { state } = useStore();
  const navigate = useNavigate();

  function handleCategory(key: string) {
    navigate(`/listings?category=${key}`);
  }

  return (
    <div className="explore-page">
      <div className="explore-hero">
        <p className="explore-hero__sub">DISCOVER YOUR NEXT STAY</p>
        <h1 className="explore-hero__title">Explore by Category</h1>
        <p className="explore-hero__desc">Find the perfect place based on what you love most.</p>
      </div>

      <div className="explore-section">
        <div className="explore-grid">
          {CATEGORIES.map((cat) => {
            const count = state.listings.filter((l) => l.category === cat.key).length;
            return (
              <button
                key={cat.key}
                className="explore-card"
                onClick={() => handleCategory(cat.key)}
              >
                <div className="explore-card__img-wrap">
                  <img src={cat.img} alt={cat.label} className="explore-card__img" />
                  <div className="explore-card__overlay" />
                </div>
                <div className="explore-card__body">
                  <span className="explore-card__emoji">{cat.emoji}</span>
                  <h2 className="explore-card__label">{cat.label}</h2>
                  <p className="explore-card__desc">{cat.desc}</p>
                  <span className="explore-card__count">{count} listings</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="explore-stats">
          <div className="explore-stat">
            <span className="explore-stat__num">{state.listings.length}+</span>
            <span className="explore-stat__label">Total Listings</span>
          </div>
          <div className="explore-stat">
            <span className="explore-stat__num">4</span>
            <span className="explore-stat__label">Categories</span>
          </div>
          <div className="explore-stat">
            <span className="explore-stat__num">{state.listings.filter(l => l.superhost).length}</span>
            <span className="explore-stat__label">Superhosts</span>
          </div>
          <div className="explore-stat">
            <span className="explore-stat__num">{state.listings.filter(l => l.available).length}</span>
            <span className="explore-stat__label">Available Now</span>
          </div>
        </div>
      </div>
    </div>
  );
}
