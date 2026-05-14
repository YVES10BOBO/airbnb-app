import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  FaBell, FaCalendarAlt, FaStar, FaInfoCircle,
  FaHeart, FaCheck,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { bookingsService } from '../../../api';
import { useAuth } from '../hooks/useAuth';
import { useStore } from '../../../store/StoreContext';
import Spinner from '../../../shared/components/Spinner';
import type { ApiBooking } from '../../../api/types';
import './NotificationsPage.css';

dayjs.extend(relativeTime);

type NotifType = 'booking' | 'review' | 'system' | 'saved';

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  read: boolean;
  link?: string;
}

const TYPE_CONFIG: Record<NotifType, { icon: React.ReactNode; color: string; bg: string }> = {
  booking: { icon: <FaCalendarAlt />, color: '#1d4ed8', bg: '#dbeafe' },
  review:  { icon: <FaStar />,        color: '#d97706', bg: '#fef3c7' },
  system:  { icon: <FaInfoCircle />,  color: '#6b21a8', bg: '#f3e8ff' },
  saved:   { icon: <FaHeart />,       color: '#dc2626', bg: '#fee2e2' },
};

const TAB_OPTIONS = [
  { key: 'all',     label: 'All' },
  { key: 'unread',  label: 'Unread' },
  { key: 'booking', label: 'Bookings' },
  { key: 'review',  label: 'Reviews' },
] as const;

type TabKey = typeof TAB_OPTIONS[number]['key'];

function bookingToNotif(b: ApiBooking): Notification {
  const title = b.listing?.title ?? 'your stay';
  const location = b.listing?.location ?? '';
  const checkIn = dayjs(b.checkIn).format('MMM D');
  const checkOut = dayjs(b.checkOut).format('MMM D');

  let heading: string;
  let body: string;

  if (b.status === 'CANCELLED') {
    heading = 'Booking Cancelled';
    body = `Your booking at ${title}${location ? ` in ${location}` : ''} (${checkIn}–${checkOut}) was cancelled.`;
  } else if (dayjs(b.checkOut).isBefore(dayjs())) {
    heading = 'Stay Completed — Leave a Review';
    body = `Your stay at ${title} (${checkIn}–${checkOut}) is complete. Share your experience!`;
  } else if (dayjs(b.checkIn).diff(dayjs(), 'day') <= 3) {
    heading = 'Check-in Soon!';
    body = `Your stay at ${title}${location ? ` in ${location}` : ''} starts ${dayjs(b.checkIn).fromNow()}. Check-in at 3:00 PM.`;
  } else {
    heading = b.status === 'CONFIRMED' ? 'Booking Confirmed' : 'Booking Pending';
    body = `${b.status === 'CONFIRMED' ? 'Confirmed' : 'Pending'}: ${title}${location ? ` in ${location}` : ''} · ${checkIn}–${checkOut} · $${b.totalPrice.toLocaleString()}`;
  }

  return {
    id: `booking-${b.id}`,
    type: 'booking',
    title: heading,
    body,
    time: dayjs(b.createdAt).fromNow(),
    read: false,
    link: `/dashboard/trips`,
  };
}

function savedToNotifs(savedIds: string[]): Notification[] {
  if (savedIds.length === 0) return [];
  return [{
    id: 'saved-summary',
    type: 'saved',
    title: 'Saved Listings',
    body: `You have ${savedIds.length} saved listing${savedIds.length > 1 ? 's' : ''} in your wishlist. Book before they fill up!`,
    time: 'Now',
    read: true,
    link: '/dashboard/saved',
  }];
}

const SYSTEM_NOTIFS: Notification[] = [
  {
    id: 'sys-1',
    type: 'system',
    title: 'Welcome to Liston Stays',
    body: 'Complete your profile and add a phone number to unlock all features and build trust with hosts.',
    time: 'Always',
    read: true,
  },
];

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { state } = useStore();
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>('all');

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    bookingsService.getAll()
      .then((bookings: ApiBooking[]) => {
        const bookingNotifs = bookings.map(bookingToNotif);
        const savedNotifs = savedToNotifs(state.saved);
        const all = [...bookingNotifs, ...savedNotifs, ...SYSTEM_NOTIFS];
        // Sort: unread first, then by recency (use id sort as proxy)
        setNotifs(all);
      })
      .catch(() => {
        setNotifs([...savedToNotifs(state.saved), ...SYSTEM_NOTIFS]);
      })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const unreadCount = notifs.filter(n => !n.read).length;

  const visible = notifs.filter(n => {
    if (tab === 'all') return true;
    if (tab === 'unread') return !n.read;
    return n.type === tab;
  });

  function markRead(id: string) {
    setNotifs(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));
  }

  function markAllRead() {
    setNotifs(ns => ns.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read.');
  }

  function dismiss(id: string) {
    setNotifs(ns => ns.filter(n => n.id !== id));
  }

  return (
    <div className="nf-page">
      <div className="nf-header">
        <div>
          <h1 className="nf-header__title">
            <FaBell className="nf-header__bell" /> Notifications
            {unreadCount > 0 && <span className="nf-header__badge">{unreadCount}</span>}
          </h1>
          <p className="nf-header__sub">Stay updated on your bookings, reviews, and more</p>
        </div>
        {unreadCount > 0 && (
          <button className="nf-mark-all-btn" onClick={markAllRead}>
            <FaCheck /> Mark all as read
          </button>
        )}
      </div>

      <div className="nf-tabs">
        {TAB_OPTIONS.map(t => (
          <button
            key={t.key}
            className={`nf-tab${tab === t.key ? ' nf-tab--active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
            {t.key === 'unread' && unreadCount > 0 && <span className="nf-tab__dot" />}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="nf-empty"><Spinner /></div>
      ) : visible.length === 0 ? (
        <div className="nf-empty">
          <FaBell className="nf-empty__icon" />
          <p>No notifications here.</p>
        </div>
      ) : (
        <div className="nf-list">
          {visible.map(n => {
            const cfg = TYPE_CONFIG[n.type];
            return (
              <div
                key={n.id}
                className={`nf-item${n.read ? '' : ' nf-item--unread'}`}
                onClick={() => { markRead(n.id); if (n.link) navigate(n.link); }}
                style={{ cursor: n.link ? 'pointer' : 'default' }}
              >
                <div className="nf-item__icon" style={{ background: cfg.bg, color: cfg.color }}>
                  {cfg.icon}
                </div>
                <div className="nf-item__body">
                  <p className="nf-item__title">{n.title}</p>
                  <p className="nf-item__text">{n.body}</p>
                  <span className="nf-item__time">{n.time}</span>
                </div>
                <div className="nf-item__actions">
                  {!n.read && <span className="nf-item__dot" />}
                  <button
                    className="nf-item__dismiss"
                    onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                    title="Dismiss"
                  >×</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
