import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FaSearch, FaMapMarkerAlt, FaStar, FaArrowUp,
  FaUmbrellaBeach, FaMountain, FaCity, FaLeaf,
  FaHeart, FaRegHeart, FaChevronLeft, FaChevronRight,
  FaShieldAlt, FaHeadset, FaCheckCircle, FaHandPaper,
} from 'react-icons/fa';
import { useStore } from '../../../store/StoreContext';
import ListingCover from '../components/ListingCover';
import { useListings } from '../hooks/useListings';
import { useFavorites } from '../hooks/useFavorites';
import { useAuth } from '../../auth/hooks/useAuth';
import { bookingsService, messagesService } from '../../../api';
import numeral from 'numeral';
import './HomePage.css';

const CATEGORIES = [
  { key: 'beach', label: 'Beach', icon: <FaUmbrellaBeach />, desc: 'Sun, sand & sea stays', color: '#e0f2fe', iconColor: '#0284c7' },
  { key: 'mountain', label: 'Mountain', icon: <FaMountain />, desc: 'Alpine & highland retreats', color: '#dcfce7', iconColor: '#16a34a' },
  { key: 'city', label: 'City', icon: <FaCity />, desc: 'Urban apartments & lofts', color: '#f3e8ff', iconColor: '#9333ea' },
  { key: 'countryside', label: 'Countryside', icon: <FaLeaf />, desc: 'Farms, vineyards & estates', color: '#fef3c7', iconColor: '#d97706' },
];

const HOW_STEPS = [
  {
    num: '01',
    title: 'Search Your Destination',
    desc: 'Enter your city, country or vibe. Our smart search finds the best stays near you.',
    icon: <FaSearch />,
  },
  {
    num: '02',
    title: 'Pick the Perfect Stay',
    desc: 'Browse verified listings with real photos, honest reviews, and transparent pricing.',
    icon: <FaStar />,
  },
  {
    num: '03',
    title: 'Book & Enjoy',
    desc: 'Secure instant booking, flexible cancellation, and 24/7 support from check-in to checkout.',
    icon: <FaCheckCircle />,
  },
];

const TRUST_ITEMS = [
  { icon: <FaShieldAlt />, title: 'Verified Listings', desc: 'Every property is manually reviewed for quality and accuracy before going live.' },
  { icon: <FaStar />, title: 'Honest Reviews', desc: 'Only guests who actually stayed can leave reviews — no fake ratings, ever.' },
  { icon: <FaHeadset />, title: '24/7 Support', desc: 'Our team is available around the clock to assist hosts and guests alike.' },
];


export default function HomePage() {
  const { state } = useStore();
  const { listings } = state;
  const { isSaved, toggle } = useFavorites();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showTop, setShowTop] = useState(false);
  const [featuredIdx, setFeaturedIdx] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  useListings();

  const topRated = listings.filter((l) => l.rating >= 4.85).slice(0, 8);
  const catCounts: Record<string, number> = {};
  listings.forEach((l) => { catCounts[l.category] = (catCounts[l.category] || 0) + 1; });

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/listings?q=${encodeURIComponent(search)}`);
  };

  const slideFeatured = useCallback((dir: 'prev' | 'next') => {
    const max = Math.max(0, topRated.length - 4);
    setFeaturedIdx((i) => dir === 'next' ? Math.min(i + 1, max) : Math.max(i - 1, 0));
  }, [topRated.length]);

  const [bookingCount, setBookingCount]   = useState(0);
  const [unreadMsgs,   setUnreadMsgs]     = useState(0);

  useEffect(() => {
    if (!isAuthenticated) return;
    bookingsService.getAll().then((b) => setBookingCount(b.length)).catch(() => {});
    messagesService.getConversations().then((c) => setUnreadMsgs(c.reduce((s, x) => s + x.unreadCount, 0))).catch(() => {});
  }, [isAuthenticated]);

  const savedCount   = state.saved.length;
  const firstName    = user?.name?.split(' ')[0] ?? 'there';
  const isAdmin      = user?.role === 'admin';

  return (
    <div className="hp">

      {/* ── Logged-in welcome banner ── */}
      {isAuthenticated && (
        <div className="hp-welcome">
          <div className="hp-welcome__inner">
            <div className="hp-welcome__left">
              <div className="hp-welcome__avatar">
                {user?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
              <div>
                <p className="hp-welcome__greeting">
                  <FaHandPaper className="hp-welcome__greet-icon" aria-hidden />
                  {' '}Welcome back
                </p>
                <h2 className="hp-welcome__name">Hello, {firstName}!</h2>
              </div>
            </div>
            <div className="hp-welcome__stats">
              <div className="hp-welcome__stat">
                <span className="hp-welcome__stat-val">{savedCount}</span>
                <span className="hp-welcome__stat-label">Saved</span>
              </div>
              <div className="hp-welcome__divider" />
              <div className="hp-welcome__stat">
                <span className="hp-welcome__stat-val">{bookingCount}</span>
                <span className="hp-welcome__stat-label">Bookings</span>
              </div>
              <div className="hp-welcome__divider" />
              <div className="hp-welcome__stat">
                <span className="hp-welcome__stat-val">{unreadMsgs}</span>
                <span className="hp-welcome__stat-label">Unread</span>
              </div>
            </div>
            <div className="hp-welcome__actions">
              {isAdmin && (
                <button className="hp-welcome__btn hp-welcome__btn--outline"
                  onClick={() => navigate('/admin')}>
                  Admin Panel
                </button>
              )}
              <button className="hp-welcome__btn hp-welcome__btn--primary"
                onClick={() => navigate(isAdmin ? '/admin' : '/dashboard')}>
                Go to Dashboard →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Hero ── */}
      <section className="hp-hero">
        <div className="hp-hero__inner">
          <p className="hp-hero__label">WE ARE #1 ON THE MARKET</p>
          <h1 className="hp-hero__title">
            We're Here To Help You <br />
            <em>Navigate</em> While Traveling
          </h1>
          <p className="hp-hero__desc">
            Discover handpicked stays across beaches, mountains, cities and countryside — all in one place.
          </p>
          <form className="hp-searchbar" onSubmit={handleSearch}>
            <div className="hp-searchbar__left">
              <FaSearch className="hp-searchbar__icon" />
              <input
                className="hp-searchbar__input"
                placeholder="What are you looking for?"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="hp-searchbar__divider" />
            <div className="hp-searchbar__right">
              <FaMapMarkerAlt className="hp-searchbar__icon hp-searchbar__icon--red" />
              <select className="hp-searchbar__select">
                <option value="">Location</option>
                <option>Miami Beach, FL</option>
                <option>Paris, France</option>
                <option>Bali, Indonesia</option>
                <option>Aspen, Colorado</option>
                <option>Santorini, Greece</option>
                <option>Tokyo, Japan</option>
              </select>
            </div>
            <button type="submit" className="hp-searchbar__btn">Search places</button>
          </form>
          <div className="hp-hero__tags">
            <span className="hp-hero__tag-label">Popular:</span>
            {['Beach', 'Mountain', 'City', 'Countryside'].map((t) => (
              <button key={t} className="hp-hero__tag" onClick={() => navigate(`/listings`)}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <div className="hp-stats">
        <div className="hp-stats__inner">
          {[
            { val: `${listings.length}+`, label: 'Total Listings' },
            { val: '120+', label: 'Cities Worldwide' },
            { val: '85K+', label: 'Happy Guests' },
            { val: '4.9', label: 'Average Rating' },
          ].map((s) => (
            <div key={s.label} className="hp-stat">
              <div className="hp-stat__val">{s.val}</div>
              <div className="hp-stat__label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Categories ── */}
      <section className="hp-section">
        <div className="hp-section__head">
          <p className="hp-section__sub">Categories</p>
          <h2 className="hp-section__title">Featured <em>Categories</em></h2>
          <p className="hp-section__desc">Browse by type and find exactly the kind of stay you're dreaming of.</p>
        </div>
        <div className="hp-cats">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.key}
              to="/listings"
              className="hp-cat-card"
              style={{ '--cat-bg': cat.color, '--cat-icon': cat.iconColor } as React.CSSProperties}
            >
              <div className="hp-cat-card__icon">{cat.icon}</div>
              <div className="hp-cat-card__body">
                <h3 className="hp-cat-card__name">{cat.label}</h3>
                <p className="hp-cat-card__desc">{cat.desc}</p>
                <span className="hp-cat-card__count">{catCounts[cat.key] || 0}+ listings</span>
              </div>
              <span className="hp-cat-card__arrow">↗</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Top Rated Listings ── */}
      <section className="hp-section hp-section--gray">
        <div className="hp-section__head">
          <p className="hp-section__sub">Top Picks</p>
          <h2 className="hp-section__title">Most <em>Popular</em> Stays</h2>
          <p className="hp-section__desc">Hand-picked properties with the highest guest ratings this season.</p>
        </div>
        <div className="hp-featured-wrap">
          <button
            className="hp-featured__arrow hp-featured__arrow--left"
            onClick={() => slideFeatured('prev')}
            disabled={featuredIdx === 0}
          >
            <FaChevronLeft />
          </button>
          <div className="hp-featured-viewport" ref={carouselRef}>
            <div
              className="hp-featured-track"
              style={{ transform: `translateX(calc(-${featuredIdx} * (280px + 20px)))` }}
            >
              {topRated.map((l) => (
                <div key={l.id} className="hp-featured-card" onClick={() => navigate(`/listings/${l.id}`)}>
                  <div className="hp-featured-card__img-wrap">
                    <ListingCover url={l.img} alt={l.title} className="hp-featured-card__img" />
                    <button
                      className={`hp-featured-card__heart ${isSaved(l.id) ? 'hp-featured-card__heart--active' : ''}`}
                      onClick={(e) => { e.stopPropagation(); toggle(l.id, l.title); }}
                    >
                      {isSaved(l.id) ? <FaHeart /> : <FaRegHeart />}
                    </button>
                    {l.superhost && <span className="hp-featured-card__badge">Superhost</span>}
                  </div>
                  <div className="hp-featured-card__body">
                    <div className="hp-featured-card__top">
                      <h3 className="hp-featured-card__title">{l.title}</h3>
                      <div className="hp-featured-card__rating">
                        <FaStar className="hp-featured-card__star" />
                        <span>{l.rating.toFixed(2)}</span>
                      </div>
                    </div>
                    <p className="hp-featured-card__loc"><FaMapMarkerAlt className="hp-featured-card__pin" />{l.location}</p>
                    <div className="hp-featured-card__footer">
                      <span className="hp-featured-card__price">{numeral(l.price).format('$0,0')}<span className="hp-featured-card__night"> / night</span></span>
                      <span className={`hp-featured-card__status ${!l.available ? 'hp-featured-card__status--booked' : ''}`}>
                        {l.available ? 'Available' : 'Booked'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button
            className="hp-featured__arrow hp-featured__arrow--right"
            onClick={() => slideFeatured('next')}
            disabled={featuredIdx >= Math.max(0, topRated.length - 4)}
          >
            <FaChevronRight />
          </button>
        </div>
        <div className="hp-featured-footer">
          <Link to="/listings" className="hp-featured-footer__link">View all listings →</Link>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="hp-section">
        <div className="hp-section__head">
          <p className="hp-section__sub">Best Way</p>
          <h2 className="hp-section__title">Find Your Dream Place <em>The Best Way</em></h2>
          <p className="hp-section__desc">Discover exciting categories. <span className="hp-section__desc--red">Find what you're looking for.</span></p>
        </div>
        <div className="hp-how">
          {HOW_STEPS.map((step, i) => (
            <div key={step.num} className="hp-how-step">
              <div className="hp-how-step__num">{step.num}</div>
              <div className="hp-how-step__icon">{step.icon}</div>
              <h3 className="hp-how-step__title">{step.title}</h3>
              <p className="hp-how-step__desc">{step.desc}</p>
              {i < HOW_STEPS.length - 1 && (
                <div className="hp-how-step__connector" aria-hidden="true" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Available Listings preview ── */}
      <section className="hp-section hp-section--gray">
        <div className="hp-section__head">
          <p className="hp-section__sub">Available Now</p>
          <h2 className="hp-section__title">Browse <em>Latest Listings</em></h2>
          <p className="hp-section__desc">Fresh picks ready to book — explore and find your next stay.</p>
        </div>
        <div className="hp-preview-grid">
          {listings.filter((l) => l.available).slice(0, 6).map((l) => (
            <div key={l.id} className="hp-preview-card" onClick={() => navigate(`/listings/${l.id}`)}>
              <div className="hp-preview-card__img-wrap">
                <ListingCover url={l.img} alt={l.title} className="hp-preview-card__img" />
                <button
                  className={`hp-featured-card__heart ${isSaved(l.id) ? 'hp-featured-card__heart--active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); toggle(l.id, l.title); }}
                >
                  {isSaved(l.id) ? <FaHeart /> : <FaRegHeart />}
                </button>
              </div>
              <div className="hp-preview-card__body">
                <div className="hp-preview-card__top">
                  <h3 className="hp-preview-card__title">{l.title}</h3>
                  <div className="hp-preview-card__rating">
                    <FaStar className="hp-featured-card__star" />
                    <span>{l.rating > 0 ? l.rating.toFixed(1) : 'New'}</span>
                  </div>
                </div>
                <p className="hp-preview-card__loc"><FaMapMarkerAlt className="hp-featured-card__pin" />{l.location}</p>
                <div className="hp-preview-card__footer">
                  <span className="hp-featured-card__price">{numeral(l.price).format('$0,0')}<span className="hp-featured-card__night"> / night</span></span>
                  <span className="hp-preview-card__type">{l.category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="hp-featured-footer">
          <Link to="/listings" className="hp-featured-footer__link">View all listings →</Link>
        </div>
      </section>

      {/* ── Why Trust Us ── */}
      <section className="hp-section">
        <div className="hp-section__head">
          <p className="hp-section__sub">Why ListOn</p>
          <h2 className="hp-section__title">Travel With <em>Confidence</em></h2>
          <p className="hp-section__desc">We've built every feature with trust, safety and great experiences in mind.</p>
        </div>
        <div className="hp-trust">
          {TRUST_ITEMS.map((item) => (
            <div key={item.title} className="hp-trust-card">
              <div className="hp-trust-card__icon">{item.icon}</div>
              <h3 className="hp-trust-card__title">{item.title}</h3>
              <p className="hp-trust-card__desc">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="hp-cta">
        <div className="hp-cta__inner">
          <div className="hp-cta__text">
            <h2 className="hp-cta__title">Own a property? <em>Start earning today.</em></h2>
            <p className="hp-cta__desc">Join thousands of hosts who trust ListOn to connect them with guests from around the world. Listing is free and takes less than 5 minutes.</p>
            <Link to="/add-listing" className="hp-cta__btn">List Your Property</Link>
          </div>
          <div className="hp-cta__img-wrap">
            <img
              src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500&h=360&fit=crop"
              alt="Beautiful property"
              className="hp-cta__img"
            />
          </div>
        </div>
      </section>

      {/* ── Back to top ── */}
      {showTop && (
        <button className="hp-back-top" onClick={scrollToTop} aria-label="Back to top">
          <FaArrowUp />
        </button>
      )}
    </div>
  );
}
