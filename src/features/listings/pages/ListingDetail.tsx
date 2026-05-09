import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  FaStar, FaMapMarkerAlt, FaArrowLeft, FaHeart, FaRegHeart,
  FaShareAlt, FaChevronLeft, FaChevronRight, FaThumbsUp,
  FaTv, FaBath, FaTree, FaVideo, FaSwimmer, FaWifi,
  FaFire, FaDumbbell, FaUtensils, FaParking, FaHome,
  FaClock, FaExpand, FaSearch,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useStore } from '../../../store/StoreContext';
import { useFavorites } from '../hooks/useFavorites';
import './ListingDetail.css';

const AMENITIES = [
  { icon: <FaTv />, label: 'Television' },
  { icon: <FaBath />, label: 'Jacuzzi' },
  { icon: <FaTree />, label: 'Garden' },
  { icon: <FaVideo />, label: 'Security cameras' },
  { icon: <FaSwimmer />, label: 'Shared Pool' },
  { icon: <FaWifi />, label: 'Wi-fi' },
  { icon: <FaFire />, label: 'Heater' },
  { icon: <FaDumbbell />, label: 'Gym (100m²)' },
  { icon: <FaUtensils />, label: 'Kitchen Appliances' },
  { icon: <FaParking />, label: 'Covered Parking' },
  { icon: <FaHome />, label: 'Furnished' },
];

const HOURS = [
  { day: 'Monday', time: '8:00 am - 6:00 pm' },
  { day: 'Tuesday', time: '8:00 am - 6:00 pm' },
  { day: 'Wednesday', time: '8:00 am - 6:00 pm' },
  { day: 'Thursday', time: '8:00 am - 6:00 pm' },
  { day: 'Friday', time: '8:00 am - 6:00 pm' },
  { day: 'Saturday', time: '8:00 am - 6:00 pm' },
  { day: 'Sunday', time: 'Close', closed: true },
];

const MOCK_REVIEWS = [
  {
    id: 1, name: 'Sarah Mitchell', date: 'Oct 2025 at 12:27 pm', rating: 4, helpful: 16,
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop',
    text: 'Absolutely stunning place! The views were breathtaking and the host was incredibly welcoming. Every detail was thought through and the amenities were top-notch. Would definitely return.',
  },
  {
    id: 2, name: 'Pranoti Deshpande', date: 'Oct 2025 at 12:27 pm', rating: 4, helpful: 16,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop',
    text: 'There are many beautiful places to visit but this one stands out. The location is perfect and the property is exactly as described. Highly recommend to anyone visiting this area.',
  },
  {
    id: 3, name: 'Marcus Knight', date: 'Oct 2025 at 12:27 pm', rating: 4, helpful: 16,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop',
    text: 'This is some content from a wonderful stay. You can replace your expectations with reality and enjoy the outstanding experience this property offers.',
  },
];

const THUMB2: Record<string, string> = {
  beach: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=400&h=220&fit=crop',
  mountain: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=400&h=220&fit=crop',
  city: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=220&fit=crop',
  countryside: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=220&fit=crop',
};

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state } = useStore();
  const { isSaved, toggle } = useFavorites();

  const [bookName, setBookName] = useState('');
  const [bookEmail, setBookEmail] = useState('');
  const [bookComment, setBookComment] = useState('');
  const [cName, setCName] = useState('');
  const [cEmail, setCEmail] = useState('');
  const [cText, setCText] = useState('');
  const [simPage, setSimPage] = useState(0);

  const listing = state.listings.find((l) => l.id === Number(id));

  if (!listing) {
    return (
      <div className="detail-not-found">
        <p>Listing not found.</p>
        <button className="btn btn--active" onClick={() => navigate('/')}>Back to listings</button>
      </div>
    );
  }

  const saved = isSaved(listing.id);
  const reviewCount = Math.floor(listing.rating * 487 + 12);
  const bookmarks = (reviewCount % 80) + 20;
  const similar = state.listings.filter((l) => l.category === listing.category && l.id !== listing.id).slice(0, 4);

  const pricing = [
    { name: 'Standard Night Stay', sub: listing.category + ' / Weekday / Peak Season', price: listing.price },
    { name: 'Weekend Package', sub: 'Fri–Sun / Breakfast Included', price: Math.round(listing.price * 1.2), badge: 'New' },
    { name: 'Extended Stay (7+ nights)', sub: 'Weekly Rate / Best Value', price: Math.round(listing.price * 0.85), badge: 'Recommended' },
    { name: 'Last Minute Deal', sub: 'Available Now / Limited Slots', price: Math.round(listing.price * 0.75) },
    { name: 'Holiday Premium', sub: 'Holiday Season / All Inclusive', price: Math.round(listing.price * 1.5) },
  ];

  function handleBook(e: React.FormEvent) {
    e.preventDefault();
    toast.success('Booking request sent!');
    setBookName(''); setBookEmail(''); setBookComment('');
  }

  function handleComment(e: React.FormEvent) {
    e.preventDefault();
    toast.success('Comment submitted!');
    setCName(''); setCEmail(''); setCText('');
  }

  const thumb1 = listing.img.includes('?') ? listing.img.split('?')[0] + '?w=400&h=220&fit=crop' : listing.img;
  const thumb2 = THUMB2[listing.category] ?? THUMB2.city;
  const mainImg = listing.img.includes('?') ? listing.img.split('?')[0] + '?w=900&h=480&fit=crop' : listing.img;

  return (
    <div className="ld-page">

      {/* ── Top bar ── */}
      <div className="ld-topbar">
        <div className="ld-topbar__left">
          <button className="ld-back-btn" onClick={() => navigate(-1)} title="Go back">
            <FaArrowLeft />
          </button>
          <button
            className={`ld-save-btn${saved ? ' ld-save-btn--active' : ''}`}
            onClick={() => toggle(listing.id, listing.title)}
          >
            {saved ? <FaHeart /> : <FaRegHeart />} Save this listing
          </button>
          <span className="ld-topbar__bookmarks">people bookmarked this place {bookmarks}</span>
        </div>

        <div className="ld-topbar__right">
          <h1 className="ld-title">{listing.title}</h1>
          <div className="ld-meta-row">
            <span className="ld-meta-reviews">reviews {reviewCount.toLocaleString()}</span>
            <span className="ld-meta-rating">({listing.rating.toFixed(1)})</span>
            <span className="ld-stars-row">
              {Array.from({ length: 5 }, (_, i) => (
                <FaStar key={i} className={i < Math.round(listing.rating) ? 'ld-star--on' : 'ld-star--off'} />
              ))}
            </span>
            <FaShareAlt className="ld-share-icon" />
            <span className="ld-meta-cat">{listing.category}</span>
            <span className="ld-sep">/</span>
          </div>
          <div className="ld-info-row">
            <span className="ld-info-type">{listing.available ? 'Full time' : 'Unavailable'}</span>
            <FaMapMarkerAlt className="ld-pin-icon" />
            <span className="ld-info-loc">{listing.location}</span>
            <span className="ld-sep">/</span>
            <span className="ld-info-posted">
              Posted {dayjs().diff(dayjs(listing.availableFrom), 'day') < 2
                ? '1 day ago'
                : dayjs(listing.availableFrom).format('MMM D, YYYY')}
            </span>
            <span className="ld-sep">/</span>
          </div>
        </div>
      </div>

      {/* ── Photo gallery ── */}
      <div className="ld-gallery">
        <div className="ld-gallery__left">
          <img src={thumb1} alt={listing.title} className="ld-gallery__thumb" />
          <div className="ld-gallery__thumb-wrap">
            <img src={thumb2} alt="interior" className="ld-gallery__thumb" />
            <button className="ld-view-photos-btn">
              <FaExpand /> View photos
            </button>
          </div>
        </div>
        <div className="ld-gallery__right">
          <img src={mainImg} alt={listing.title} className="ld-gallery__main" />
        </div>
      </div>
      <p className="ld-published">
        {dayjs(listing.availableFrom).format('MMMM DD, YYYY')}{' '}
        <strong>:Published</strong>
      </p>

      {/* ── Body: sidebar + content ── */}
      <div className="ld-body">

        {/* Sidebar */}
        <aside className="ld-sidebar">
          <div className="ld-book-card">
            <h3 className="ld-book-card__title">
              Book a stay <span className="ld-accent">online</span>
            </h3>
            <form onSubmit={handleBook}>
              <div className="ld-field">
                <label>*Full Name</label>
                <input type="text" placeholder="Enter your name" value={bookName}
                  onChange={(e) => setBookName(e.target.value)} required />
              </div>
              <div className="ld-field">
                <label>*Email Address</label>
                <input type="email" placeholder="Enter your email address" value={bookEmail}
                  onChange={(e) => setBookEmail(e.target.value)} required />
              </div>
              <div className="ld-field">
                <label>*Comment</label>
                <textarea placeholder="Tell us what we can help you with!" rows={5} value={bookComment}
                  onChange={(e) => setBookComment(e.target.value)} required />
              </div>
              <button type="submit" className="ld-book-btn">Book Now</button>
              <p className="ld-book-powered">Powered by ListOn</p>
            </form>
          </div>

          <div className="ld-hours-card">
            <div className="ld-hours-card__head">
              <FaClock className="ld-hours-clock" />
              <h3 className="ld-hours-title">
                Opening <span className="ld-accent">Hours</span>
              </h3>
            </div>
            <ul className="ld-hours-list">
              {HOURS.map((h) => (
                <li key={h.day} className="ld-hours-row">
                  <span className={h.closed ? 'ld-hours-time ld-hours-time--closed' : 'ld-hours-time'}>
                    {h.time}
                  </span>
                  <span className="ld-hours-day">{h.day}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main content */}
        <div className="ld-content">

          {/* Description */}
          <section className="ld-section">
            <h2 className="ld-section-title">
              Latest Property <span className="ld-accent">Reviews</span>
            </h2>
            <p className="ld-desc">
              This exceptional property in {listing.location} offers an unparalleled experience for travelers seeking comfort, style, and authenticity. From the moment you arrive, the attention to detail is evident — every corner thoughtfully designed to create a welcoming atmosphere that feels both luxurious and homely.
            </p>
            <p className="ld-desc">
              Whether you're visiting for a short getaway or an extended stay, this {listing.category} property delivers on every promise. With its prime location and outstanding amenities, it has earned its reputation as one of the most sought-after listings in the area. Listed since {dayjs(listing.availableFrom).format('MMMM YYYY')}, it continues to impress guests from around the world.
            </p>
          </section>

          {/* Amenities */}
          <section className="ld-section">
            <h2 className="ld-section-title">
              Amenities <span className="ld-accent">Available</span>
            </h2>
            <div className="ld-amenities">
              {AMENITIES.map((a) => (
                <div key={a.label} className="ld-amenity">
                  <span className="ld-amenity__icon">{a.icon}</span>
                  <span className="ld-amenity__label">{a.label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Pricing */}
          <section className="ld-section">
            <h2 className="ld-section-title">Pricing</h2>
            <div className="ld-pricing">
              {pricing.map((item) => (
                <div key={item.name} className="ld-pricing-row">
                  <span className="ld-pricing-price">${item.price}</span>
                  <div className="ld-pricing-info">
                    <span className="ld-pricing-name">
                      {item.name}
                      {item.badge && (
                        <span className={`ld-pricing-badge ld-pricing-badge--${item.badge.toLowerCase()}`}>
                          {item.badge}
                        </span>
                      )}
                    </span>
                    <span className="ld-pricing-sub">{item.sub}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Reviews */}
          <section className="ld-section">
            <h2 className="ld-section-title">
              Latest Property <span className="ld-accent">Reviews</span>
            </h2>
            <div className="ld-reviews">
              {MOCK_REVIEWS.map((r) => (
                <div key={r.id} className="ld-review">
                  <div className="ld-review__top">
                    <div className="ld-review__stars-row">
                      {Array.from({ length: 5 }, (_, i) => (
                        <FaStar key={i} className={i < r.rating ? 'ld-star--on' : 'ld-star--off'} />
                      ))}
                      <span className="ld-review__score">{r.rating}.5/5</span>
                    </div>
                    <div className="ld-review__author">
                      <span className="ld-review__name">{r.name} -</span>
                      <span className="ld-review__date">{r.date}</span>
                      <img src={r.avatar} alt={r.name} className="ld-review__avatar" />
                    </div>
                  </div>
                  <p className="ld-review__text">{r.text}</p>
                  <button className="ld-helpful-btn">
                    {r.helpful} <span>|</span> Helpful Review <FaThumbsUp />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* ── Leave a comment ── */}
      <section className="ld-comment-section">
        <h2 className="ld-section-title">
          Leave a <span className="ld-accent">Comment</span>
        </h2>
        <form className="ld-comment-form" onSubmit={handleComment}>
          <div className="ld-comment-row">
            <div className="ld-field">
              <label>*Email Address</label>
              <input type="email" value={cEmail} onChange={(e) => setCEmail(e.target.value)} required />
            </div>
            <div className="ld-field">
              <label>*Full Name</label>
              <input type="text" value={cName} onChange={(e) => setCName(e.target.value)} required />
            </div>
          </div>
          <div className="ld-field">
            <label>*Comment</label>
            <textarea rows={4} value={cText} onChange={(e) => setCText(e.target.value)} required />
          </div>
          <button type="submit" className="ld-comment-submit">Submit</button>
        </form>
      </section>

      {/* ── Similar listings ── */}
      {similar.length > 0 && (
        <section className="ld-similar-section">
          <p className="ld-similar-eyebrow">Similar Listings</p>
          <h2 className="ld-similar-heading">Similar Listings You May Like</h2>
          <p className="ld-similar-sub">
            Discover exciting categories.{' '}
            <span className="ld-accent">Find what you're looking for</span>
          </p>
          <div className="ld-similar-row">
            <button
              className="ld-carousel-btn"
              onClick={() => setSimPage((p) => Math.max(0, p - 1))}
              disabled={simPage === 0}
            >
              <FaChevronLeft />
            </button>
            <div className="ld-similar-grid">
              {similar.map((s) => (
                <div key={s.id} className="ld-sim-card" onClick={() => { navigate(`/listings/${s.id}`); window.scrollTo(0, 0); }}>
                  <div className="ld-sim-card__img-wrap">
                    <div className="ld-sim-card__actions">
                      <button className="ld-sim-card__action-btn" onClick={(e) => e.stopPropagation()}><FaSearch /></button>
                      <button className="ld-sim-card__action-btn" onClick={(e) => e.stopPropagation()}><FaRegHeart /></button>
                    </div>
                    <span className="ld-sim-card__off">OFF 10%</span>
                    <img src={s.img} alt={s.title} className="ld-sim-card__img" />
                    <div className="ld-sim-card__cat"><FaHome /></div>
                  </div>
                  <div className="ld-sim-card__body">
                    <div className="ld-sim-card__rating">
                      <span className="ld-sim-card__rev-count">reviews {Math.floor(s.rating * 487 + 12).toLocaleString()}</span>
                      <span className="ld-sim-card__score">({s.rating.toFixed(1)})</span>
                      <FaStar className="ld-star--on" />
                    </div>
                    <p className="ld-sim-card__title">{s.title}</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              className="ld-carousel-btn"
              onClick={() => setSimPage((p) => p + 1)}
              disabled={simPage >= Math.max(0, similar.length / 4 - 1)}
            >
              <FaChevronRight />
            </button>
          </div>
          <div className="ld-carousel-dots">
            <button className={`ld-dot${simPage === 0 ? ' ld-dot--active' : ''}`} onClick={() => setSimPage(0)} />
            <button className={`ld-dot${simPage === 1 ? ' ld-dot--active' : ''}`} onClick={() => setSimPage(1)} />
          </div>
        </section>
      )}
    </div>
  );
}
