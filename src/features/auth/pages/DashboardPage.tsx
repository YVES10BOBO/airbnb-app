import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import {
  FaCalendarAlt, FaHeart, FaStar, FaHome, FaArrowUp, FaArrowDown,
  FaPlus, FaCommentDots, FaCog, FaListAlt, FaHandPaper,
} from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { useStore } from '../../../store/StoreContext';
import { bookingsService, usersService } from '../../../api';
import type { ApiBooking } from '../../../api/types';
import Spinner from '../../../shared/components/Spinner';
import './DashboardPage.css';

const QUICK_ACTIONS = [
  { icon: <FaPlus />, label: 'Add Listing', path: '/add-listing', color: '#FF4A2A' },
  { icon: <FaListAlt />, label: 'My Listings', path: '/dashboard/my-listings', color: '#7c3aed' },
  { icon: <FaCommentDots />, label: 'Messages', path: '/dashboard/messages', color: '#0284c7' },
  { icon: <FaCog />, label: 'Settings', path: '/dashboard/settings', color: '#16a34a' },
];

const STATUS_COLOR: Record<string, string> = {
  CONFIRMED: '#dcfce7',
  PENDING: '#fff3e0',
  CANCELLED: '#fce4ec',
};
const STATUS_TEXT: Record<string, string> = {
  CONFIRMED: '#16a34a',
  PENDING: '#e65100',
  CANCELLED: '#c62828',
};

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function fmtRange(checkIn: string, checkOut: string) {
  const a = new Date(checkIn);
  const b = new Date(checkOut);
  return `${a.toLocaleString('en-US', { month: 'short', day: 'numeric' })} – ${b.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { state } = useStore();
  const navigate = useNavigate();
  const savedCount = state.saved.length;
  const availableCount = state.listings.filter((l) => l.available).length;

  const [bookings, setBookings] = useState<ApiBooking[]>([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const rows = await bookingsService.getAll();
        if (!cancelled) setBookings(rows);
        if (user?.role === 'guest' && user.id) {
          try {
            const rev = await usersService.getReviews(user.id);
            if (!cancelled) setReviewCount(rev.length);
          } catch {
            if (!cancelled) setReviewCount(0);
          }
        } else if (!cancelled) setReviewCount(0);
      } catch {
        if (!cancelled) setBookings([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id, user?.role]);

  const isGuest = user?.role === 'guest';

  const totalSpent = useMemo(() => {
    if (!isGuest) return 0;
    const today = startOfDay(new Date());
    return bookings
      .filter((b) => b.status === 'CONFIRMED' && startOfDay(new Date(b.checkOut)) < today)
      .reduce((s, b) => s + b.totalPrice, 0);
  }, [bookings, isGuest]);

  const cancelledCount = useMemo(
    () => bookings.filter((b) => b.status === 'CANCELLED').length,
    [bookings],
  );

  const recentBookings = useMemo(() => [...bookings].slice(0, 3), [bookings]);

  return (
    <div className="dp">

      <div className="dp-banner">
        <div className="dp-banner__left">
          <p className="dp-banner__greeting">
            <FaHandPaper className="dp-banner__greet-icon" aria-hidden />
            {' '}Welcome back
          </p>
          <h1 className="dp-banner__name">{user?.name ?? 'Traveler'}</h1>
          <p className="dp-banner__sub">Here&apos;s what&apos;s happening with your account today.</p>
          <button type="button" className="dp-banner__btn" onClick={() => navigate('/listings')}>
            Explore Listings
          </button>
        </div>
        <div className="dp-banner__illustration">
          <div className="dp-banner__circle dp-banner__circle--1" />
          <div className="dp-banner__circle dp-banner__circle--2" />
          <div className="dp-banner__circle dp-banner__circle--3" />
          <span className="dp-banner__home-icon" aria-hidden><FaHome /></span>
        </div>
      </div>

      <div className="dp-stats">
        <div className="dp-stat-card">
          <div className="dp-stat-card__icon dp-stat-card__icon--orange"><FaHeart /></div>
          <div className="dp-stat-card__body">
            <span className="dp-stat-card__value">{savedCount}</span>
            <span className="dp-stat-card__label">Saved Listings</span>
          </div>
          <div className="dp-stat-card__spark dp-stat-card__spark--orange">
            <span className="dp-spark-bar" style={{ height: '40%' }} />
            <span className="dp-spark-bar" style={{ height: '65%' }} />
            <span className="dp-spark-bar" style={{ height: '45%' }} />
            <span className="dp-spark-bar" style={{ height: '80%' }} />
            <span className="dp-spark-bar" style={{ height: '55%' }} />
          </div>
        </div>
        <div className="dp-stat-card">
          <div className="dp-stat-card__icon dp-stat-card__icon--blue"><FaCalendarAlt /></div>
          <div className="dp-stat-card__body">
            <span className="dp-stat-card__value">{loading ? '—' : bookings.length}</span>
            <span className="dp-stat-card__label">Bookings</span>
          </div>
          <div className="dp-stat-card__spark dp-stat-card__spark--blue">
            <span className="dp-spark-bar" style={{ height: '55%' }} />
            <span className="dp-spark-bar" style={{ height: '70%' }} />
            <span className="dp-spark-bar" style={{ height: '50%' }} />
            <span className="dp-spark-bar" style={{ height: '90%' }} />
            <span className="dp-spark-bar" style={{ height: '65%' }} />
          </div>
        </div>
        <div className="dp-stat-card">
          <div className="dp-stat-card__icon dp-stat-card__icon--purple"><FaStar /></div>
          <div className="dp-stat-card__body">
            <span className="dp-stat-card__value">{loading ? '—' : reviewCount}</span>
            <span className="dp-stat-card__label">Reviews written</span>
          </div>
          <div className="dp-stat-card__spark dp-stat-card__spark--purple">
            <span className="dp-spark-bar" style={{ height: '30%' }} />
            <span className="dp-spark-bar" style={{ height: '60%' }} />
            <span className="dp-spark-bar" style={{ height: '45%' }} />
            <span className="dp-spark-bar" style={{ height: '75%' }} />
            <span className="dp-spark-bar" style={{ height: '50%' }} />
          </div>
        </div>
        <div className="dp-stat-card">
          <div className="dp-stat-card__icon dp-stat-card__icon--green"><FaHome /></div>
          <div className="dp-stat-card__body">
            <span className="dp-stat-card__value">{availableCount}</span>
            <span className="dp-stat-card__label">Available Now</span>
          </div>
          <div className="dp-stat-card__spark dp-stat-card__spark--green">
            <span className="dp-spark-bar" style={{ height: '70%' }} />
            <span className="dp-spark-bar" style={{ height: '50%' }} />
            <span className="dp-spark-bar" style={{ height: '85%' }} />
            <span className="dp-spark-bar" style={{ height: '60%' }} />
            <span className="dp-spark-bar" style={{ height: '75%' }} />
          </div>
        </div>
      </div>

      <div className="dp-big-stats">
        <div className="dp-big-stat">
          <div className="dp-big-stat__head">
            <span className="dp-big-stat__title">{isGuest ? 'Total spent (past stays)' : 'Booking volume'}</span>
            <FaArrowUp className="dp-big-stat__trend dp-big-stat__trend--up" />
          </div>
          <div className="dp-big-stat__value">
            {loading ? '—' : `$${(isGuest ? totalSpent : bookings.filter((b) => b.status === 'CONFIRMED').reduce((s, b) => s + b.totalPrice, 0)).toLocaleString()}`}
            {' '}<span className="dp-big-stat__unit">USD</span>
          </div>
          <div className="dp-big-stat__change dp-big-stat__change--up">
            <span>Based on confirmed bookings in your dashboard scope.</span>
          </div>
        </div>
        <div className="dp-big-stat">
          <div className="dp-big-stat__head">
            <span className="dp-big-stat__title">Listings in catalog</span>
            <FaArrowUp className="dp-big-stat__trend dp-big-stat__trend--up" />
          </div>
          <div className="dp-big-stat__value">{state.listings.length}</div>
          <div className="dp-big-stat__change dp-big-stat__change--up">
            <span>Loaded from browse cache on this device.</span>
          </div>
        </div>
        <div className="dp-big-stat">
          <div className="dp-big-stat__head">
            <span className="dp-big-stat__title">Cancelled</span>
            <FaArrowDown className="dp-big-stat__trend dp-big-stat__trend--down" />
          </div>
          <div className="dp-big-stat__value">{loading ? '—' : cancelledCount}</div>
          <div className="dp-big-stat__change dp-big-stat__change--down">
            <span>In your current booking list.</span>
          </div>
        </div>
      </div>

      <div className="dp-bottom">
        <div className="dp-recent">
          <div className="dp-recent__head">
            <h2 className="dp-recent__title">Recent bookings</h2>
            <button type="button" className="dp-recent__view-all" onClick={() => navigate('/dashboard/bookings')}>View all</button>
          </div>
          <div className="dp-recent__list">
            {loading ? (
              <div style={{ padding: 24 }}><Spinner /></div>
            ) : recentBookings.length === 0 ? (
              <p className="dp-recent-item__title" style={{ padding: 16, color: '#666' }}>No bookings yet.</p>
            ) : (
              recentBookings.map((b) => {
                const title = b.listing?.title ?? 'Stay';
                const loc = b.listing?.location ?? '';
                const img = b.listing?.photos?.[0]?.url;
                const st = b.status;
                return (
                  <div key={b.id} className="dp-recent-item">
                    {img ? (
                      <img src={img} alt="" className="dp-recent-item__img" />
                    ) : (
                      <div className="dp-recent-item__img dp-recent-item__img--empty" aria-hidden><FaHome /></div>
                    )}
                    <div className="dp-recent-item__info">
                      <p className="dp-recent-item__title">{title}</p>
                      <p className="dp-recent-item__loc">{loc}</p>
                      <p className="dp-recent-item__date">{fmtRange(b.checkIn, b.checkOut)}</p>
                    </div>
                    <div className="dp-recent-item__right">
                      <span className="dp-recent-item__price">${b.totalPrice.toLocaleString()}</span>
                      <span
                        className="dp-recent-item__badge"
                        style={{ background: STATUS_COLOR[st] ?? '#f0f0f0', color: STATUS_TEXT[st] ?? '#333' }}
                      >
                        {st.charAt(0) + st.slice(1).toLowerCase()}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="dp-quick">
          <h2 className="dp-quick__title">Quick Actions</h2>
          <div className="dp-quick__grid">
            {QUICK_ACTIONS.map((a) => (
              <button
                key={a.label}
                type="button"
                className="dp-quick-card"
                onClick={() => navigate(a.path)}
                style={{ '--qa-color': a.color } as React.CSSProperties}
              >
                <div className="dp-quick-card__icon">{a.icon}</div>
                <span className="dp-quick-card__label">{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
