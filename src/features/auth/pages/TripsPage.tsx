import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaMapMarkerAlt, FaStar, FaCalendarAlt, FaTimes, FaCheck, FaChevronRight } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { bookingsService } from '../../../api';
import type { ApiBooking } from '../../../api/types';
import ListingCover from '../../listings/components/ListingCover';
import Spinner from '../../../shared/components/Spinner';
import { useAuth } from '../hooks/useAuth';
import './TripsPage.css';

type TripStatus = 'upcoming' | 'completed' | 'cancelled';

interface Trip {
  id: string;
  listingId: string;
  title: string;
  location: string;
  img: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  total: number;
  status: TripStatus;
  apiStatus: ApiBooking['status'];
  nights: number;
}

const STATUS_CONFIG = {
  upcoming:  { label: 'Upcoming',  cls: 'tr-badge--upcoming' },
  completed: { label: 'Completed', cls: 'tr-badge--completed' },
  cancelled: { label: 'Cancelled', cls: 'tr-badge--cancelled' },
};

const TABS = [
  { key: 'all',       label: 'All Trips' },
  { key: 'upcoming',  label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
] as const;

type TabKey = typeof TABS[number]['key'];

function fmt(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function mapBookingToTrip(b: ApiBooking): Trip {
  const checkIn = b.checkIn.slice(0, 10);
  const checkOut = b.checkOut.slice(0, 10);
  const inD = new Date(checkIn);
  const outD = new Date(checkOut);
  const nights = Math.max(1, Math.round((outD.getTime() - inD.getTime()) / (86400000)));
  const cover = b.listing?.photos?.[0]?.url ?? '';

  let status: TripStatus;
  if (b.status === 'CANCELLED') status = 'cancelled';
  else {
    const today = startOfDay(new Date());
    if (startOfDay(outD) < today) status = 'completed';
    else status = 'upcoming';
  }

  return {
    id: b.id,
    listingId: b.listingId,
    title: b.listing?.title ?? 'Stay',
    location: b.listing?.location ?? '',
    img: cover,
    checkIn,
    checkOut,
    guests: b.guests,
    total: b.totalPrice,
    status,
    apiStatus: b.status,
    nights,
  };
}

function apiErr(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const t = err.response?.data?.error;
    if (typeof t === 'string') return t;
  }
  return 'Request failed.';
}

export default function TripsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isGuest = user?.role === 'guest';

  const [tab, setTab] = useState<TabKey>('all');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!isGuest) {
      setTrips([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await bookingsService.getAll();
      setTrips(data.map(mapBookingToTrip));
    } catch {
      toast.error('Could not load trips.');
      setTrips([]);
    } finally {
      setLoading(false);
    }
  }, [isGuest]);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(
    () => (tab === 'all' ? trips : trips.filter((t) => t.status === tab)),
    [trips, tab],
  );

  async function handleCancel(trip: Trip) {
    try {
      await bookingsService.cancel(trip.id);
      setTrips((prev) => prev.map((t) => (t.id === trip.id ? { ...t, status: 'cancelled' as TripStatus, apiStatus: 'CANCELLED' } : t)));
      toast.success('Booking cancelled.');
    } catch (err) {
      toast.error(apiErr(err));
    }
  }

  if (!isGuest) {
    return (
      <div className="tr-page">
        <div className="tr-header">
          <h1 className="tr-header__title">My Trips</h1>
          <p className="tr-header__sub">Trip history is available for guest accounts. As a host, manage incoming reservations under Bookings.</p>
        </div>
        <div className="tr-empty"><p>No guest trips to show.</p></div>
      </div>
    );
  }

  return (
    <div className="tr-page">
      <div className="tr-header">
        <h1 className="tr-header__title">My Trips</h1>
        <p className="tr-header__sub">Your travel history and upcoming adventures</p>
      </div>

      <div className="tr-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`tr-tab${tab === t.key ? ' tr-tab--active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
            <span className="tr-tab__count">
              {t.key === 'all' ? trips.length : trips.filter((x) => x.status === t.key).length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="tr-empty"><Spinner /></div>
      ) : visible.length === 0 ? (
        <div className="tr-empty"><p>No trips found.</p></div>
      ) : (
        <div className="tr-list">
          {visible.map((trip) => (
            <div key={trip.id} className="tr-card">
              <div className="tr-card__img-wrap">
                <ListingCover url={trip.img} alt={trip.title} className="tr-card__img" />
                <span className={`tr-badge ${STATUS_CONFIG[trip.status].cls}`}>
                  {STATUS_CONFIG[trip.status].label}
                </span>
              </div>
              <div className="tr-card__body">
                <div className="tr-card__top">
                  <div>
                    <h3 className="tr-card__title">{trip.title}</h3>
                    <p className="tr-card__loc"><FaMapMarkerAlt />{trip.location}</p>
                  </div>
                </div>
                <div className="tr-card__details">
                  <div className="tr-card__detail">
                    <FaCalendarAlt className="tr-card__detail-icon" />
                    <span>{fmt(trip.checkIn)} → {fmt(trip.checkOut)}</span>
                  </div>
                  <div className="tr-card__meta-row">
                    <span>{trip.nights} night{trip.nights > 1 ? 's' : ''}</span>
                    <span>·</span>
                    <span>{trip.guests} guest{trip.guests > 1 ? 's' : ''}</span>
                  </div>
                </div>
                <div className="tr-card__footer">
                  <div>
                    <span className="tr-card__total-label">Total</span>
                    <span className="tr-card__total">${trip.total.toLocaleString()}</span>
                  </div>
                  <div className="tr-card__actions">
                    {trip.status === 'upcoming' && trip.apiStatus !== 'CANCELLED' && (
                      <>
                        <button type="button" className="tr-btn tr-btn--outline" onClick={() => handleCancel(trip)}>
                          <FaTimes /> Cancel
                        </button>
                        <button type="button" className="tr-btn tr-btn--primary" onClick={() => navigate(`/listings/${trip.listingId}`)}>
                          View listing <FaChevronRight />
                        </button>
                      </>
                    )}
                    {trip.status === 'completed' && (
                      <button
                        type="button"
                        className="tr-btn tr-btn--primary"
                        onClick={() => navigate(`/listings/${trip.listingId}`)}
                      >
                        <FaStar /> View / review
                      </button>
                    )}
                    {trip.status === 'cancelled' && (
                      <span className="tr-reviewed"><FaCheck /> Cancelled</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
