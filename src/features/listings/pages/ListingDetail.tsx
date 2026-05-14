import { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import axios from 'axios';
import {
  FaStar, FaMapMarkerAlt, FaArrowLeft, FaHeart, FaRegHeart,
  FaShareAlt, FaChevronLeft, FaChevronRight, FaThumbsUp,
  FaTv, FaBath, FaTree, FaVideo, FaSwimmer, FaWifi,
  FaFire, FaDumbbell, FaUtensils, FaParking, FaHome,
  FaTh, FaSearch, FaUsers, FaChevronDown, FaChevronLeft as FaChevLeft, FaChevronRight as FaChevRight, FaTimes as FaX,
  FaImage, FaSnowflake, FaSwimmingPool, FaTshirt, FaWater, FaCheckCircle, FaUserCircle, FaCommentDots,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useStore } from '../../../store/StoreContext';
import { useFavorites } from '../hooks/useFavorites';
import { useAuth } from '../../auth/hooks/useAuth';
import { listingsService, reviewsService, messagesService } from '../../../api';
import type { ApiReview } from '../../../api/types';
import type { Listing } from '../types';
import { mapApiListingToListing } from '../utils/mapApiListing';
import ListingCover from '../components/ListingCover';
import Spinner from '../../../shared/components/Spinner';
import './ListingDetail.css';

function amenityIcon(label: string): React.ReactNode {
  const t = label.toLowerCase();
  if (t.includes('wifi')) return <FaWifi />;
  if (t.includes('kitchen')) return <FaUtensils />;
  if (t.includes('parking')) return <FaParking />;
  if (t.includes('pool')) return <FaSwimmingPool />;
  if (t.includes('fire')) return <FaFire />;
  if (t.includes('tv')) return <FaTv />;
  if (t.includes('air') || t.includes('ac')) return <FaSnowflake />;
  if (t.includes('gym')) return <FaDumbbell />;
  if (t.includes('washer') || t.includes('dryer')) return <FaTshirt />;
  if (t.includes('hot tub') || t.includes('tub')) return <FaWater />;
  if (t.includes('bath') || t.includes('jacuzzi')) return <FaBath />;
  if (t.includes('garden') || t.includes('yard')) return <FaTree />;
  if (t.includes('camera') || t.includes('security')) return <FaVideo />;
  if (t.includes('swim')) return <FaSwimmer />;
  return <FaCheckCircle />;
}

function reviewErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const msg = err.response?.data?.error;
    if (typeof msg === 'string') return msg;
  }
  return 'Could not submit review.';
}

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useStore();
  const { isSaved, toggle } = useFavorites();
  const { user } = useAuth();

  const [listing, setListing] = useState<Listing | null>(null);
  const [hostId, setHostId] = useState<string | null>(null);
  const [contactingHost, setContactingHost] = useState(false);
  const [detailLoading, setDetailLoading] = useState(true);
  const [detailError, setDetailError] = useState(false);
  const [reviews, setReviews] = useState<ApiReview[]>([]);
  const [reviewTotal, setReviewTotal] = useState(0);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [guestOpen, setGuestOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [simPage, setSimPage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setDetailLoading(true);
    setDetailError(false);

    (async () => {
      try {
        const [apiListing, catalogRes, reviewsRes] = await Promise.all([
          listingsService.getById(id),
          listingsService.getAll({ limit: 100 }),
          reviewsService.getForListing(id, { limit: 30 }),
        ]);
        if (cancelled) return;
        const mapped = mapApiListingToListing(apiListing);
        setListing(mapped);
        setHostId((apiListing.host as any)?.id ?? null);
        dispatch({ type: 'UPSERT_LISTING', payload: mapped });
        dispatch({ type: 'SET_LISTINGS', payload: catalogRes.data.map(mapApiListingToListing) });
        setReviews(reviewsRes.data);
        setReviewTotal(reviewsRes.meta.total);
      } catch {
        if (!cancelled) {
          setDetailError(true);
          setListing(null);
        }
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, dispatch]);

  const saved = listing ? isSaved(listing.id) : false;

  const similar = useMemo(() => {
    if (!listing) return [];
    return state.listings
      .filter((l) => l.category === listing.category && l.id !== listing.id)
      .slice(0, 4);
  }, [listing, state.listings]);

  const pricing = useMemo(() => {
    if (!listing) return [];
    return [
      { name: 'Standard Night Stay', sub: `${listing.category} / Weekday / Peak Season`, price: listing.price },
      { name: 'Weekend Package', sub: 'Fri–Sun / Breakfast Included', price: Math.round(listing.price * 1.2), badge: 'New' },
      { name: 'Extended Stay (7+ nights)', sub: 'Weekly Rate / Best Value', price: Math.round(listing.price * 0.85), badge: 'Recommended' },
      { name: 'Last Minute Deal', sub: 'Available Now / Limited Slots', price: Math.round(listing.price * 0.75) },
      { name: 'Holiday Premium', sub: 'Holiday Season / All Inclusive', price: Math.round(listing.price * 1.5) },
    ];
  }, [listing]);

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const diff = dayjs(checkOut).diff(dayjs(checkIn), 'day');
    return diff > 0 ? diff : 0;
  }, [checkIn, checkOut]);

  const cleaningFee = listing ? Math.round(listing.price * 0.15) : 0;
  const serviceFee = listing ? Math.round(listing.price * nights * 0.12) : 0;
  const subtotal = listing ? listing.price * nights : 0;
  const total = subtotal + cleaningFee + serviceFee;

  const todayStr = dayjs().format('YYYY-MM-DD');
  const minCheckOut = checkIn
    ? dayjs(checkIn).add(1, 'day').format('YYYY-MM-DD')
    : dayjs().add(1, 'day').format('YYYY-MM-DD');

  const rawPhotoUrls = useMemo(() => {
    if (!listing) return [];
    if (listing.photoUrls.length > 0) return listing.photoUrls;
    if (listing.img) return [listing.img];
    return [];
  }, [listing]);

  function sizeHeroUrl(url: string): string {
    if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
      return url.replace('/upload/', '/upload/w_1200,h_700,c_fill,f_auto,q_auto/');
    }
    const base = url.split('?')[0];
    return `${base}?w=1200&h=700&fit=crop`;
  }

  const photos = useMemo(
    () => rawPhotoUrls.map((u, i) => (i === 0 ? sizeHeroUrl(u) : u)),
    [rawPhotoUrls],
  );
  const thumbPhotos = photos.slice(1, 5);

  const closeLightbox = useCallback(() => setLightboxOpen(false), []);
  const prevPhoto = useCallback(
    () => setLightboxIdx((i) => (i - 1 + photos.length) % photos.length),
    [photos.length],
  );
  const nextPhoto = useCallback(
    () => setLightboxIdx((i) => (i + 1) % photos.length),
    [photos.length],
  );

  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevPhoto();
      if (e.key === 'ArrowRight') nextPhoto();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxOpen, closeLightbox, prevPhoto, nextPhoto]);

  function handleReserve() {
    if (!listing) return;
    if (!checkIn || !checkOut) {
      toast.error('Please select your check-in and check-out dates.');
      return;
    }
    if (nights === 0) {
      toast.error('Check-out must be after check-in.');
      return;
    }
    navigate(`/checkout?listing=${listing.id}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`);
  }

  async function handleContactHost() {
    if (!user) { navigate('/login'); return; }
    if (!hostId) return;
    if (user.id === hostId) { toast.error("You can't message your own listing."); return; }
    setContactingHost(true);
    try {
      await messagesService.getOrCreateConversation(hostId);
      navigate('/dashboard/messages');
    } catch {
      toast.error('Could not open chat. Please try again.');
    } finally {
      setContactingHost(false);
    }
  }

  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !listing) return;
    if (!user) {
      toast.error('Please log in as a guest to leave a review.');
      navigate('/login');
      return;
    }
    if (user.role === 'host') {
      toast.error('Hosts cannot review their own or other listings.');
      return;
    }
    const trimmed = reviewComment.trim();
    if (trimmed.length < 4) {
      toast.error('Please write a short comment (at least 4 characters).');
      return;
    }
    setReviewSubmitting(true);
    try {
      const created = await reviewsService.create(id, { rating: reviewRating, comment: trimmed });
      setReviews((prev) => [created, ...prev]);
      setReviewTotal((t) => t + 1);
      setReviewComment('');
      setReviewRating(5);
      toast.success('Thanks — your review was posted.');
    } catch (err) {
      toast.error(reviewErrorMessage(err));
    } finally {
      setReviewSubmitting(false);
    }
  }

  const maxG = listing?.maxGuests ?? 8;
  const guestOptions = useMemo(() => Array.from({ length: maxG }, (_, i) => i + 1), [maxG]);

  useEffect(() => {
    if (!listing) return;
    const cap = listing.maxGuests ?? 8;
    setGuests((g) => (g > cap ? cap : g));
  }, [listing]);

  if (!id) {
    return (
      <div className="detail-not-found">
        <p>Invalid listing link.</p>
        <button type="button" className="btn btn--active" onClick={() => navigate('/')}>Back to home</button>
      </div>
    );
  }

  if (detailLoading) {
    return (
      <div className="ld-page ld-page--center">
        <Spinner />
      </div>
    );
  }

  if (detailError || !listing) {
    return (
      <div className="detail-not-found">
        <p>Listing not found.</p>
        <button type="button" className="btn btn--active" onClick={() => navigate('/')}>Back to listings</button>
      </div>
    );
  }

  const displayRating = listing.rating > 0;
  const roundedStars = displayRating ? Math.round(listing.rating) : 0;

  return (
    <div className="ld-page">

      <div className="ld-topbar">
        <div className="ld-topbar__left">
          <button type="button" className="ld-back-btn" onClick={() => navigate(-1)} title="Go back">
            <FaArrowLeft />
          </button>
          <h1 className="ld-title">{listing.title}</h1>
          <div className="ld-meta-row">
            <span className="ld-stars-row">
              {Array.from({ length: 5 }, (_, i) => (
                <FaStar key={i} className={i < roundedStars ? 'ld-star--on' : 'ld-star--off'} />
              ))}
            </span>
            {displayRating ? (
              <>
                <span className="ld-meta-rating">{listing.rating.toFixed(1)}</span>
                <span className="ld-sep">·</span>
              </>
            ) : (
              <span className="ld-meta-rating ld-meta-rating--muted">New listing</span>
            )}
            <span className="ld-meta-reviews">{reviewTotal} reviews</span>
            <span className="ld-sep">·</span>
            <span className="ld-meta-cat">{listing.category}</span>
          </div>
          <div className="ld-info-row">
            <FaMapMarkerAlt className="ld-pin-icon" />
            <span className="ld-info-loc">{listing.location}</span>
            <span className="ld-sep">·</span>
            <span className="ld-info-type">{listing.available ? 'Available' : 'Unavailable'}</span>
            <span className="ld-sep">·</span>
            <span className="ld-info-posted">
              Listed {dayjs().diff(dayjs(listing.availableFrom), 'day') < 2
                ? '1 day ago'
                : dayjs(listing.availableFrom).format('MMM D, YYYY')}
            </span>
          </div>
        </div>

        <div className="ld-topbar__right">
          <button
            type="button"
            className={`ld-save-btn${saved ? ' ld-save-btn--active' : ''}`}
            onClick={() => toggle(listing.id, listing.title)}
          >
            {saved ? <FaHeart /> : <FaRegHeart />} Save
          </button>
          <button type="button" className="ld-share-btn"><FaShareAlt /> Share</button>
        </div>
      </div>

      <div
        className={`ld-gallery${photos.length === 0 ? ' ld-gallery--empty' : ''}${photos.length === 1 ? ' ld-gallery--single' : ''}`}
      >
        <div
          className="ld-gallery__hero"
          onClick={() => {
            if (photos.length === 0) return;
            setLightboxIdx(0);
            setLightboxOpen(true);
          }}
          style={{ cursor: photos.length ? 'pointer' : 'default' }}
        >
          {photos.length > 0 ? (
            <img src={photos[0]} alt={listing.title} className="ld-gallery__hero-img" />
          ) : (
            <div className="ld-gallery__hero-empty" role="img" aria-label="">
              <FaImage aria-hidden />
              <span>No photos uploaded</span>
            </div>
          )}
        </div>
        {photos.length > 1 && (
          <div className="ld-gallery__thumbs">
            {thumbPhotos.map((src, i) => {
              const isLastThumb = i === thumbPhotos.length - 1;
              return (
                <div
                  key={`${i}-${src}`}
                  className="ld-gallery__thumb-cell"
                  onClick={() => { setLightboxIdx(i + 1); setLightboxOpen(true); }}
                >
                  <img src={src} alt="" className="ld-gallery__thumb-img" />
                  {isLastThumb && photos.length > 5 && (
                    <button
                      type="button"
                      className="ld-show-all-btn"
                      onClick={(e) => { e.stopPropagation(); setLightboxIdx(0); setLightboxOpen(true); }}
                    >
                      <FaTh /> Show all photos
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <p className="ld-published">
        {dayjs(listing.availableFrom).format('MMMM DD, YYYY')}
        {' '}
        <strong>: Published</strong>
      </p>

      <div className="ld-body">

        <aside className="ld-sidebar">
          <div className="ld-widget">

            <div className="ld-widget__header">
              <div className="ld-widget__price">
                <span className="ld-widget__amount">${listing.price.toLocaleString()}</span>
                <span className="ld-widget__per"> / night</span>
              </div>
              <div className="ld-widget__rating">
                <FaStar className="ld-widget__star" />
                {displayRating ? (
                  <>
                    <span className="ld-widget__rating-val">{listing.rating.toFixed(1)}</span>
                    <span className="ld-widget__revcount">· {reviewTotal} reviews</span>
                  </>
                ) : (
                  <span className="ld-widget__revcount">New listing</span>
                )}
              </div>
            </div>

            <div className="ld-widget__dates">
              <div className="ld-widget__date-box ld-widget__date-box--left">
                <label className="ld-widget__date-label" htmlFor="ld-checkin">CHECK-IN</label>
                <input
                  id="ld-checkin"
                  type="date"
                  className="ld-widget__date-input"
                  value={checkIn}
                  min={todayStr}
                  onChange={(e) => {
                    setCheckIn(e.target.value);
                    if (checkOut && e.target.value >= checkOut) setCheckOut('');
                  }}
                />
              </div>
              <div className="ld-widget__date-box ld-widget__date-box--right">
                <label className="ld-widget__date-label" htmlFor="ld-checkout">CHECKOUT</label>
                <input
                  id="ld-checkout"
                  type="date"
                  className="ld-widget__date-input"
                  value={checkOut}
                  min={minCheckOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                />
              </div>
            </div>

            <div className="ld-widget__guests" onClick={() => setGuestOpen((o) => !o)}>
              <div>
                <div className="ld-widget__date-label">GUESTS</div>
                <div className="ld-widget__guests-val">
                  <FaUsers className="ld-widget__guests-icon" />
                  {guests} guest{guests > 1 ? 's' : ''}
                </div>
              </div>
              <FaChevronDown className={`ld-widget__chev${guestOpen ? ' ld-widget__chev--open' : ''}`} />
            </div>

            {guestOpen && (
              <div className="ld-widget__guest-panel">
                {guestOptions.map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`ld-widget__guest-opt${guests === n ? ' ld-widget__guest-opt--active' : ''}`}
                    onClick={() => { setGuests(n); setGuestOpen(false); }}
                  >
                    {n} guest{n > 1 ? 's' : ''}
                  </button>
                ))}
              </div>
            )}

            <button type="button" className="ld-widget__reserve-btn" onClick={handleReserve}>
              Reserve
            </button>
            <p className="ld-widget__notice">You won&apos;t be charged yet</p>

            {user && user.id !== hostId && hostId && (
              <button
                type="button"
                className="ld-widget__contact-btn"
                onClick={handleContactHost}
                disabled={contactingHost}
              >
                <FaCommentDots />
                {contactingHost ? 'Opening chat…' : 'Contact Host'}
              </button>
            )}

            {nights > 0 && (
              <div className="ld-widget__breakdown">
                <div className="ld-widget__breakdown-row">
                  <span>${listing.price.toLocaleString()} × {nights} night{nights > 1 ? 's' : ''}</span>
                  <span>${subtotal.toLocaleString()}</span>
                </div>
                <div className="ld-widget__breakdown-row">
                  <span>Cleaning fee</span>
                  <span>${cleaningFee.toLocaleString()}</span>
                </div>
                <div className="ld-widget__breakdown-row">
                  <span>Service fee</span>
                  <span>${serviceFee.toLocaleString()}</span>
                </div>
                <div className="ld-widget__breakdown-divider" />
                <div className="ld-widget__breakdown-row ld-widget__breakdown-row--total">
                  <strong>Total before taxes</strong>
                  <strong>${total.toLocaleString()}</strong>
                </div>
              </div>
            )}
          </div>
        </aside>

        <div className="ld-content">

          <section className="ld-section">
            <h2 className="ld-section-title">
              About this <span className="ld-accent">place</span>
            </h2>
            {listing.description ? (
              listing.description.split('\n').filter(Boolean).map((para, idx) => (
                <p key={idx} className="ld-desc">{para}</p>
              ))
            ) : (
              <p className="ld-desc">The host has not added a detailed description yet.</p>
            )}
          </section>

          <section className="ld-section">
            <h2 className="ld-section-title">
              Amenities <span className="ld-accent">included</span>
            </h2>
            {(listing.amenities?.length ?? 0) > 0 ? (
              <div className="ld-amenities">
                {listing.amenities!.map((a) => (
                  <div key={a} className="ld-amenity">
                    <span className="ld-amenity__icon">{amenityIcon(a)}</span>
                    <span className="ld-amenity__label">{a}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="ld-desc">No amenities listed yet.</p>
            )}
          </section>

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

          <section className="ld-section">
            <h2 className="ld-section-title">
              Guest <span className="ld-accent">reviews</span>
            </h2>
            {reviews.length === 0 ? (
              <p className="ld-desc">No reviews yet. Be the first to stay and share feedback.</p>
            ) : (
              <div className="ld-reviews">
                {reviews.map((r) => (
                  <div key={r.id} className="ld-review">
                    <div className="ld-review__top">
                      <div className="ld-review__stars-row">
                        {Array.from({ length: 5 }, (_, i) => (
                          <FaStar key={i} className={i < r.rating ? 'ld-star--on' : 'ld-star--off'} />
                        ))}
                        <span className="ld-review__score">{r.rating}/5</span>
                      </div>
                      <div className="ld-review__author">
                        <span className="ld-review__name">{r.user?.name ?? 'Guest'} —</span>
                        <span className="ld-review__date">{dayjs(r.createdAt).format('MMM D, YYYY h:mm a')}</span>
                        {r.user?.avatar ? (
                          <img src={r.user.avatar} alt="" className="ld-review__avatar" />
                        ) : (
                          <span className="ld-review__avatar ld-review__avatar--placeholder" aria-hidden>
                            <FaUserCircle />
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="ld-review__text">{r.comment}</p>
                    <div className="ld-helpful-row">
                      <FaThumbsUp className="ld-helpful-icon" aria-hidden />
                      <span>Helpful</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      <section className="ld-comment-section">
        <h2 className="ld-section-title">
          Write a <span className="ld-accent">review</span>
        </h2>
        <p className="ld-desc ld-review-hint">
          Guests with a <strong>confirmed booking</strong> for this listing can leave a rating and comment.
        </p>
        <form className="ld-comment-form" onSubmit={handleReviewSubmit}>
          <div className="ld-field">
            <span className="ld-widget__date-label">RATING</span>
            <div className="ld-star-pick" role="group" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`ld-star-pick__btn${reviewRating >= n ? ' ld-star-pick__btn--on' : ''}`}
                  onClick={() => setReviewRating(n)}
                  aria-label={`${n} stars`}
                >
                  <FaStar />
                </button>
              ))}
            </div>
          </div>
          <div className="ld-field">
            <label htmlFor="ld-review-comment">Comment</label>
            <textarea
              id="ld-review-comment"
              rows={4}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Share what stood out about your stay…"
              required
            />
          </div>
          <button type="submit" className="ld-comment-submit" disabled={reviewSubmitting}>
            {reviewSubmitting ? 'Submitting…' : 'Submit review'}
          </button>
        </form>
      </section>

      {similar.length > 0 && (
        <section className="ld-similar-section">
          <p className="ld-similar-eyebrow">Similar Listings</p>
          <h2 className="ld-similar-heading">Similar Listings You May Like</h2>
          <p className="ld-similar-sub">
            Discover more in this category.
            {' '}
            <span className="ld-accent">Find what you&apos;re looking for</span>
          </p>
          <div className="ld-similar-row">
            <button
              type="button"
              className="ld-carousel-btn"
              onClick={() => setSimPage((p) => Math.max(0, p - 1))}
              disabled={simPage === 0}
            >
              <FaChevronLeft />
            </button>
            <div className="ld-similar-grid">
              {similar.map((s) => (
                <div
                  key={s.id}
                  className="ld-sim-card"
                  onClick={() => { navigate(`/listings/${s.id}`); window.scrollTo(0, 0); }}
                >
                  <div className="ld-sim-card__img-wrap">
                    <div className="ld-sim-card__actions">
                      <button type="button" className="ld-sim-card__action-btn" onClick={(e) => e.stopPropagation()}><FaSearch /></button>
                      <button type="button" className="ld-sim-card__action-btn" onClick={(e) => e.stopPropagation()}><FaRegHeart /></button>
                    </div>
                    <span className="ld-sim-card__off">OFF 10%</span>
                    <ListingCover url={s.img} alt={s.title} className="ld-sim-card__img" />
                    <div className="ld-sim-card__cat"><FaHome /></div>
                  </div>
                  <div className="ld-sim-card__body">
                    <div className="ld-sim-card__rating">
                      <span className="ld-sim-card__rev-count">{s.rating > 0 ? 'Rated' : 'New'}</span>
                      <span className="ld-sim-card__score">({s.rating > 0 ? s.rating.toFixed(1) : '—'})</span>
                      <FaStar className="ld-star--on" />
                    </div>
                    <p className="ld-sim-card__title">{s.title}</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="ld-carousel-btn"
              onClick={() => setSimPage((p) => p + 1)}
              disabled={simPage >= Math.max(0, similar.length / 4 - 1)}
            >
              <FaChevronRight />
            </button>
          </div>
          <div className="ld-carousel-dots">
            <button type="button" className={`ld-dot${simPage === 0 ? ' ld-dot--active' : ''}`} onClick={() => setSimPage(0)} />
            <button type="button" className={`ld-dot${simPage === 1 ? ' ld-dot--active' : ''}`} onClick={() => setSimPage(1)} />
          </div>
        </section>
      )}

      {lightboxOpen && photos.length > 0 && (
        <div className="ld-lightbox" onClick={closeLightbox}>
          <div className="ld-lightbox__topbar">
            <span className="ld-lightbox__counter">{lightboxIdx + 1} / {photos.length}</span>
            <button type="button" className="ld-lightbox__close" onClick={(e) => { e.stopPropagation(); closeLightbox(); }}><FaX /></button>
          </div>
          <button
            type="button"
            className="ld-lightbox__arrow ld-lightbox__arrow--left"
            onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
          >
            <FaChevLeft />
          </button>
          <img
            src={photos[lightboxIdx]}
            alt={`Photo ${lightboxIdx + 1}`}
            className="ld-lightbox__img"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            className="ld-lightbox__arrow ld-lightbox__arrow--right"
            onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
          >
            <FaChevRight />
          </button>
          <div className="ld-lightbox__dots">
            {photos.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`ld-lightbox__dot${i === lightboxIdx ? ' ld-lightbox__dot--active' : ''}`}
                onClick={(e) => { e.stopPropagation(); setLightboxIdx(i); }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
