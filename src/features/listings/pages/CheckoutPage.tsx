import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaLock, FaCreditCard, FaCalendarAlt, FaUsers, FaCheckCircle, FaChevronLeft, FaMapMarkerAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import axios from 'axios';
import { useStore } from '../../../store/StoreContext';
import ListingCover from '../components/ListingCover';
import { bookingsService } from '../../../api';
import './CheckoutPage.css';

function fmt(d: string) {
  return dayjs(d).format('MMM D, YYYY');
}

function getApiErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    if (!err.response) return 'Cannot reach server. Please try again.';
    const { error, errors } = err.response.data ?? {};
    if (typeof error === 'string') return error;
    if (Array.isArray(errors) && errors.length > 0) return errors[0].message ?? 'Validation error.';
  }
  return 'Booking failed. Please check your details and try again.';
}

export default function CheckoutPage() {
  const { state } = useStore();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const listingId = params.get('listing') ?? '';
  const checkIn   = params.get('checkIn')  ?? '';
  const checkOut  = params.get('checkOut') ?? '';
  const guests    = Number(params.get('guests') ?? 1);

  const listing = state.listings.find((l) => l.id === listingId);

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const diff = dayjs(checkOut).diff(dayjs(checkIn), 'day');
    return diff > 0 ? diff : 0;
  }, [checkIn, checkOut]);

  const cleaningFee = listing ? Math.round(listing.price * 0.15) : 0;
  const serviceFee  = listing ? Math.round(listing.price * nights * 0.12) : 0;
  const subtotal    = listing ? listing.price * nights : 0;
  const total       = subtotal + cleaningFee + serviceFee;

  const [form, setForm] = useState({ cardName: '', cardNumber: '', expiry: '', cvv: '', zip: '' });
  const [submitting, setSubmitting] = useState(false);

  function set(k: keyof typeof form, v: string) {
    setForm(f => ({ ...f, [k]: v }));
  }

  function formatCardNumber(v: string) {
    return v.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})/g, '$1 ').trim();
  }

  function formatExpiry(v: string) {
    const clean = v.replace(/\D/g, '').slice(0, 4);
    if (clean.length >= 3) return clean.slice(0, 2) + '/' + clean.slice(2);
    return clean;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cardDigits = form.cardNumber.replace(/\s/g, '');
    if (!listingId || !checkIn || !checkOut || guests < 1) {
      toast.error('Invalid booking details. Please restart from listing page.');
      return;
    }
    if (!form.cardName.trim()) {
      toast.error('Cardholder name is required.');
      return;
    }
    if (!/^\d{16}$/.test(cardDigits)) {
      toast.error('Card number must be exactly 16 digits.');
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(form.expiry)) {
      toast.error('Expiry date must be in MM/YY format.');
      return;
    }
    if (!/^\d{3}$/.test(form.cvv)) {
      toast.error('CVV must be exactly 3 digits.');
      return;
    }
    if (!form.zip.trim() || form.zip.trim().length < 3) {
      toast.error('Billing ZIP is required.');
      return;
    }
    setSubmitting(true);
    try {
      await bookingsService.create({
        listingId,
        checkIn: new Date(checkIn).toISOString(),
        checkOut: new Date(checkOut).toISOString(),
        guests,
      });
      toast.success('Booking confirmed! Check your trips for details.');
      navigate('/dashboard/trips');
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (!listing) {
    return (
      <div className="co-notfound">
        <p>Listing not found.</p>
        <button className="co-back" onClick={() => navigate('/listings')}>Back to listings</button>
      </div>
    );
  }

  return (
    <div className="co-page">
      <button className="co-back" onClick={() => navigate(-1)}>
        <FaChevronLeft /> Back
      </button>
      <h1 className="co-title">Confirm and pay</h1>

      <div className="co-layout">
        {/* ── Payment form ── */}
        <div className="co-form-col">
          <form className="co-form" onSubmit={handleSubmit}>
            <div className="co-section">
              <h2 className="co-section__title">Trip details</h2>
              <div className="co-trip-row">
                <FaCalendarAlt className="co-trip-icon" />
                <div>
                  <span className="co-trip-label">Dates</span>
                  <span className="co-trip-val">{fmt(checkIn)} → {fmt(checkOut)}</span>
                </div>
              </div>
              <div className="co-trip-row">
                <FaUsers className="co-trip-icon" />
                <div>
                  <span className="co-trip-label">Guests</span>
                  <span className="co-trip-val">{guests} guest{guests > 1 ? 's' : ''} · {nights} night{nights > 1 ? 's' : ''}</span>
                </div>
              </div>
              <div className="co-trip-row">
                <FaMapMarkerAlt className="co-trip-icon" />
                <div>
                  <span className="co-trip-label">Location</span>
                  <span className="co-trip-val">{listing.location}</span>
                </div>
              </div>
            </div>

            <div className="co-divider" />

            <div className="co-section">
              <h2 className="co-section__title">Pay with card</h2>
              <div className="co-field">
                <label className="co-label">Cardholder name</label>
                <input className="co-input" placeholder="Name on card"
                  value={form.cardName} onChange={e => set('cardName', e.target.value)} required />
              </div>
              <div className="co-field">
                <label className="co-label">Card number</label>
                <div className="co-input-icon-wrap">
                  <FaCreditCard className="co-input-icon" />
                  <input className="co-input co-input--icon" placeholder="1234 5678 9012 3456"
                    value={form.cardNumber}
                    onChange={e => set('cardNumber', formatCardNumber(e.target.value))}
                    required />
                </div>
              </div>
              <div className="co-grid-2">
                <div className="co-field">
                  <label className="co-label">Expiry date</label>
                  <input className="co-input" placeholder="MM/YY"
                    value={form.expiry}
                    onChange={e => set('expiry', formatExpiry(e.target.value))}
                    required />
                </div>
                <div className="co-field">
                  <label className="co-label">CVV</label>
                  <input className="co-input" placeholder="•••" type="password" maxLength={4}
                    value={form.cvv} onChange={e => set('cvv', e.target.value.replace(/\D/, '').slice(0, 4))}
                    required />
                </div>
              </div>
              <div className="co-field" style={{ maxWidth: 200 }}>
                <label className="co-label">Billing ZIP</label>
                <input className="co-input" placeholder="ZIP code" maxLength={10}
                  value={form.zip} onChange={e => set('zip', e.target.value)} />
              </div>
            </div>

            <p className="co-notice">
              <FaLock /> Your payment info is encrypted and never stored on our servers.
            </p>

            <button type="submit" className="co-submit-btn" disabled={submitting}>
              {submitting ? 'Processing…' : (
                <><FaLock /> Confirm and pay ${total.toLocaleString()}</>
              )}
            </button>
          </form>
        </div>

        {/* ── Booking summary ── */}
        <div className="co-summary-col">
          <div className="co-summary-card">
            <div className="co-summary-card__img-wrap">
              <ListingCover url={listing.img} alt={listing.title} className="co-summary-card__img" />
            </div>
            <div className="co-summary-card__info">
              <p className="co-summary-card__cat">{listing.category}</p>
              <p className="co-summary-card__title">{listing.title}</p>
              <p className="co-summary-card__loc">{listing.location}</p>
            </div>
          </div>

          <div className="co-price-breakdown">
            <h3 className="co-price-breakdown__title">Price breakdown</h3>
            <div className="co-price-row">
              <span>${listing.price.toLocaleString()} × {nights} night{nights > 1 ? 's' : ''}</span>
              <span>${subtotal.toLocaleString()}</span>
            </div>
            <div className="co-price-row">
              <span>Cleaning fee</span>
              <span>${cleaningFee.toLocaleString()}</span>
            </div>
            <div className="co-price-row">
              <span>Service fee</span>
              <span>${serviceFee.toLocaleString()}</span>
            </div>
            <div className="co-price-divider" />
            <div className="co-price-row co-price-row--total">
              <strong>Total</strong>
              <strong>${total.toLocaleString()}</strong>
            </div>
          </div>

          <div className="co-policy">
            <FaCheckCircle className="co-policy__icon" />
            <p><strong>Free cancellation</strong> before {dayjs(checkIn).subtract(3, 'day').format('MMM D')}. After that, the first night is non-refundable.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
