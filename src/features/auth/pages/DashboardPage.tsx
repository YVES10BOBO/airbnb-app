import { useNavigate } from 'react-router-dom';
import {
  FaCalendarAlt, FaHeart, FaStar, FaHome, FaArrowUp, FaArrowDown,
  FaPlus, FaCommentDots, FaCog, FaListAlt,
} from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { useStore } from '../../../store/StoreContext';
import './DashboardPage.css';

const RECENT_BOOKINGS = [
  { id: 1, title: 'Luxury Beach Villa', location: 'Miami Beach, FL', date: 'Jun 12 – Jun 18', price: 2700, status: 'confirmed', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=80&h=80&fit=crop' },
  { id: 2, title: 'Cozy Mountain Cabin', location: 'Aspen, Colorado', date: 'Jul 15 – Jul 20', price: 925, status: 'pending', img: 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=80&h=80&fit=crop' },
  { id: 3, title: 'Modern Downtown Apt', location: 'New York, NY', date: 'May 20 – May 25', price: 600, status: 'completed', img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=80&h=80&fit=crop' },
];

const QUICK_ACTIONS = [
  { icon: <FaPlus />, label: 'Add Listing', path: '/add-listing', color: '#FF4A2A' },
  { icon: <FaListAlt />, label: 'My Listings', path: '/dashboard/my-listings', color: '#7c3aed' },
  { icon: <FaCommentDots />, label: 'Messages', path: '/dashboard/messages', color: '#0284c7' },
  { icon: <FaCog />, label: 'Settings', path: '/dashboard/settings', color: '#16a34a' },
];

const STATUS_COLOR: Record<string, string> = {
  confirmed: '#dcfce7',
  pending: '#fff3e0',
  completed: '#e8eaf6',
  cancelled: '#fce4ec',
};
const STATUS_TEXT: Record<string, string> = {
  confirmed: '#16a34a',
  pending: '#e65100',
  completed: '#3949ab',
  cancelled: '#c62828',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { state } = useStore();
  const navigate = useNavigate();
  const savedCount = state.saved.length;
  const availableCount = state.listings.filter((l) => l.available).length;

  return (
    <div className="dp">

      {/* ── Orange welcome banner ── */}
      <div className="dp-banner">
        <div className="dp-banner__left">
          <p className="dp-banner__greeting">Welcome back 👋</p>
          <h1 className="dp-banner__name">{user?.name ?? 'Traveler'}</h1>
          <p className="dp-banner__sub">Here's what's happening with your account today.</p>
          <button className="dp-banner__btn" onClick={() => navigate('/listings')}>
            Explore Listings
          </button>
        </div>
        <div className="dp-banner__illustration">
          <div className="dp-banner__circle dp-banner__circle--1" />
          <div className="dp-banner__circle dp-banner__circle--2" />
          <div className="dp-banner__circle dp-banner__circle--3" />
          <span className="dp-banner__emoji">🏡</span>
        </div>
      </div>

      {/* ── Mini stat cards ── */}
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
            <span className="dp-stat-card__value">4</span>
            <span className="dp-stat-card__label">Total Bookings</span>
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
            <span className="dp-stat-card__value">3</span>
            <span className="dp-stat-card__label">Reviews Given</span>
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

      {/* ── Big stat blocks ── */}
      <div className="dp-big-stats">
        <div className="dp-big-stat">
          <div className="dp-big-stat__head">
            <span className="dp-big-stat__title">Total Spent</span>
            <FaArrowUp className="dp-big-stat__trend dp-big-stat__trend--up" />
          </div>
          <div className="dp-big-stat__value">$4,225 <span className="dp-big-stat__unit">USD</span></div>
          <div className="dp-big-stat__change dp-big-stat__change--up">
            <FaArrowUp /> 12.5% &nbsp;<span>+$470 this month</span>
          </div>
        </div>
        <div className="dp-big-stat">
          <div className="dp-big-stat__head">
            <span className="dp-big-stat__title">Listings Viewed</span>
            <FaArrowUp className="dp-big-stat__trend dp-big-stat__trend--up" />
          </div>
          <div className="dp-big-stat__value">{state.listings.length}</div>
          <div className="dp-big-stat__change dp-big-stat__change--up">
            <FaArrowUp /> 8.2% &nbsp;<span>+3 this week</span>
          </div>
        </div>
        <div className="dp-big-stat">
          <div className="dp-big-stat__head">
            <span className="dp-big-stat__title">Cancelled</span>
            <FaArrowDown className="dp-big-stat__trend dp-big-stat__trend--down" />
          </div>
          <div className="dp-big-stat__value">1</div>
          <div className="dp-big-stat__change dp-big-stat__change--down">
            <FaArrowDown /> 9.0% &nbsp;<span>1 booking this month</span>
          </div>
        </div>
      </div>

      <div className="dp-bottom">
        {/* ── Recent bookings ── */}
        <div className="dp-recent">
          <div className="dp-recent__head">
            <h2 className="dp-recent__title">Recent Bookings</h2>
            <button className="dp-recent__view-all" onClick={() => navigate('/dashboard/bookings')}>View all</button>
          </div>
          <div className="dp-recent__list">
            {RECENT_BOOKINGS.map((b) => (
              <div key={b.id} className="dp-recent-item">
                <img src={b.img} alt={b.title} className="dp-recent-item__img" />
                <div className="dp-recent-item__info">
                  <p className="dp-recent-item__title">{b.title}</p>
                  <p className="dp-recent-item__loc">{b.location}</p>
                  <p className="dp-recent-item__date">{b.date}</p>
                </div>
                <div className="dp-recent-item__right">
                  <span className="dp-recent-item__price">${b.price.toLocaleString()}</span>
                  <span
                    className="dp-recent-item__badge"
                    style={{ background: STATUS_COLOR[b.status], color: STATUS_TEXT[b.status] }}
                  >
                    {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Quick actions ── */}
        <div className="dp-quick">
          <h2 className="dp-quick__title">Quick Actions</h2>
          <div className="dp-quick__grid">
            {QUICK_ACTIONS.map((a) => (
              <button
                key={a.label}
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
