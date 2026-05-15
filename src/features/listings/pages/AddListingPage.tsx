import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import { listingsService } from '../../../api';
import type { ApiListing } from '../../../api/types';
import {
  FaBuilding, FaHome, FaUmbrellaBeach, FaTree,
  FaWifi, FaParking, FaSwimmingPool, FaFire, FaTv, FaSnowflake,
  FaDumbbell, FaUtensils, FaTshirt, FaWater,
  FaPlus, FaMinus, FaCloudUploadAlt, FaTimes, FaCheck, FaChevronRight, FaChevronLeft, FaExclamationTriangle,
} from 'react-icons/fa';
import './AddListingPage.css';

const PROPERTY_TYPES = [
  { id: 'APARTMENT', label: 'Apartment', icon: <FaBuilding /> },
  { id: 'HOUSE',     label: 'House',     icon: <FaHome /> },
  { id: 'VILLA',     label: 'Villa',     icon: <FaUmbrellaBeach /> },
  { id: 'CABIN',     label: 'Cabin',     icon: <FaTree /> },
];

const AMENITIES = [
  { id: 'WiFi',            icon: <FaWifi />,        label: 'WiFi' },
  { id: 'Kitchen',         icon: <FaUtensils />,    label: 'Kitchen' },
  { id: 'Parking',         icon: <FaParking />,     label: 'Free Parking' },
  { id: 'Pool',            icon: <FaSwimmingPool />,label: 'Swimming Pool' },
  { id: 'Fireplace',       icon: <FaFire />,        label: 'Fireplace' },
  { id: 'TV',              icon: <FaTv />,           label: 'TV / Cable' },
  { id: 'Air conditioning',icon: <FaSnowflake />,   label: 'Air Conditioning' },
  { id: 'Gym',             icon: <FaDumbbell />,    label: 'Gym / Fitness' },
  { id: 'Washer',          icon: <FaTshirt />,      label: 'Washer & Dryer' },
  { id: 'Hot tub',         icon: <FaWater />,       label: 'Hot Tub' },
];

const STEPS = ['Type', 'Basic Info', 'Details', 'Photos', 'Pricing'];

interface FormState {
  type: string;
  title: string;
  description: string;
  location: string;
  country: string;
  guests: number;
  bedrooms: number;
  bathrooms: number;
  beds: number;
  amenities: string[];
  photos: { url: string; name: string; file?: File }[];
  pricePerNight: string;
  cleaningFee: string;
  minNights: string;
}

const INIT: FormState = {
  type: '', title: '', description: '', location: '', country: '',
  guests: 1, bedrooms: 1, bathrooms: 1, beds: 1,
  amenities: [], photos: [],
  pricePerNight: '', cleaningFee: '', minNights: '1',
};

function getApiErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const errorText = err.response?.data?.error;
    if (typeof errorText === 'string') return errorText;
    const issues = err.response?.data?.errors;
    if (Array.isArray(issues) && issues.length > 0) {
      const first = issues[0] as { message?: string };
      if (typeof first?.message === 'string') return first.message;
    }
    if (!err.response) return 'Cannot reach server. Please try again.';
  }
  return 'Failed to create listing. Please review your inputs and try again.';
}

function Counter({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="al-counter">
      <span className="al-counter__label">{label}</span>
      <div className="al-counter__ctrl">
        <button type="button" className="al-counter__btn" onClick={() => onChange(Math.max(1, value - 1))}><FaMinus /></button>
        <span className="al-counter__val">{value}</span>
        <button type="button" className="al-counter__btn" onClick={() => onChange(value + 1)}><FaPlus /></button>
      </div>
    </div>
  );
}

export default function AddListingPage() {
  const navigate  = useNavigate();
  const [step, setStep]       = useState(0);
  const [form, setForm]       = useState<FormState>(INIT);
  const [stepError, setStepError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);

  function set<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm(f => ({ ...f, [key]: val }));
    setStepError('');
  }

  function toggleAmenity(id: string) {
    setForm(f => ({
      ...f,
      amenities: f.amenities.includes(id)
        ? f.amenities.filter(a => a !== id)
        : [...f.amenities, id],
    }));
  }

  function handlePhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const newPhotos = files.map(f => ({ url: URL.createObjectURL(f), name: f.name, file: f }));
    setForm(f => ({ ...f, photos: [...f.photos, ...newPhotos].slice(0, 5) }));
    e.target.value = '';
  }

  function removePhoto(i: number) {
    setForm(f => ({ ...f, photos: f.photos.filter((_, idx) => idx !== i) }));
  }

  function getStepValidationError(): string | null {
    if (step === 0) {
      if (!form.type) return 'Please choose a property type.';
      return null;
    }

    if (step === 1) {
      if (form.title.trim().length < 10) {
        return 'Listing title must be at least 10 characters.';
      }
      if (form.description.trim().length < 50) {
        return 'Description must be at least 50 characters.';
      }
      if (form.location.trim().length < 2) {
        return 'City / location is required.';
      }
      return null;
    }

    if (step === 2) {
      if (form.amenities.length === 0) return 'Select at least one amenity.';
      return null;
    }

    if (step === 4) {
      if (!form.pricePerNight || Number(form.pricePerNight) <= 0) {
        return 'Please enter a valid price per night.';
      }
      return null;
    }

    return null;
  }

  function handleNext() {
    const validationError = getStepValidationError();
    if (validationError) {
      setStepError(validationError);
      return;
    }
    setStepError('');
    setStep(s => s + 1);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.title.trim().length < 10) {
      toast.error('Title must be at least 10 characters.');
      return;
    }
    if (form.description.trim().length < 50) {
      toast.error('Description must be at least 50 characters.');
      return;
    }
    if (form.location.trim().length < 2) {
      toast.error('Location is required.');
      return;
    }
    if (form.amenities.length === 0) {
      toast.error('Select at least one amenity.');
      return;
    }
    if (!form.pricePerNight || Number(form.pricePerNight) <= 0) {
      toast.error('Please enter a valid price per night.');
      return;
    }
    setSubmitting(true);
    try {
      const listing = await listingsService.create({
        title: form.title,
        description: form.description,
        location: form.location,
        type: form.type as ApiListing['type'],
        pricePerNight: Number(form.pricePerNight),
        guests: form.guests,
        amenities: form.amenities,
      });

      const photoFiles = form.photos.filter(p => p.file).map(p => p.file!);
      if (photoFiles.length > 0) {
        try {
          await listingsService.uploadPhotos(listing.id, photoFiles);
        } catch (uploadErr) {
          const detail = getApiErrorMessage(uploadErr);
          toast.error(
            `Listing saved but photos failed: ${detail}. Use JPG/PNG/WebP under 10 MB each. Check Cloudinary env on server.`,
            { duration: 8000 },
          );
          console.warn('Photo upload failed for listing:', listing.id, uploadErr);
        }
      }
      toast.success('Listing created successfully! Submitted for review.');
      navigate('/dashboard/my-listings');
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="al-page">
      {/* ── Progress bar ── */}
      <div className="al-progress">
        {STEPS.map((label, i) => (
          <div key={i} className="al-progress__step">
            <div className={`al-progress__circle ${i < step ? 'al-progress__circle--done' : i === step ? 'al-progress__circle--active' : ''}`}>
              {i < step ? <FaCheck /> : i + 1}
            </div>
            <span className={`al-progress__label ${i === step ? 'al-progress__label--active' : ''}`}>{label}</span>
            {i < STEPS.length - 1 && <div className={`al-progress__line ${i < step ? 'al-progress__line--done' : ''}`} />}
          </div>
        ))}
      </div>

      <form className="al-card" onSubmit={handleSubmit}>

        {/* ── Step 0: Property Type ── */}
        {step === 0 && (
          <div className="al-step">
            <h2 className="al-step__title">What type of property are you listing?</h2>
            <p className="al-step__sub">Choose the option that best describes your place.</p>
            <div className="al-type-grid">
              {PROPERTY_TYPES.map(t => (
                <button
                  key={t.id}
                  type="button"
                  className={`al-type-card ${form.type === t.id ? 'al-type-card--active' : ''}`}
                  onClick={() => set('type', t.id)}
                >
                  <span className="al-type-card__icon">{t.icon}</span>
                  <span className="al-type-card__label">{t.label}</span>
                  {form.type === t.id && <FaCheck className="al-type-card__check" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 1: Basic Info ── */}
        {step === 1 && (
          <div className="al-step">
            <h2 className="al-step__title">Tell us about your place</h2>
            <p className="al-step__sub">Guests will see this information on your listing.</p>

            <div className="al-field">
              <label className="al-field__label">Listing Title <span className="al-req">*</span></label>
              <input className="al-field__input" placeholder="e.g. Cozy Beach Apartment in Miami"
                value={form.title} onChange={e => set('title', e.target.value)} required />
            </div>

            <div className="al-field">
              <label className="al-field__label">Description <span className="al-req">*</span></label>
              <textarea className="al-field__textarea" rows={5}
                placeholder="Describe your property — what makes it special, nearby attractions, house rules…"
                value={form.description} onChange={e => set('description', e.target.value)} required />
              <span className="al-field__count">{form.description.length} / 2000</span>
            </div>

            <div className="al-grid-2">
              <div className="al-field">
                <label className="al-field__label">City / Location <span className="al-req">*</span></label>
                <input className="al-field__input" placeholder="e.g. Miami Beach, FL"
                  value={form.location} onChange={e => set('location', e.target.value)} required />
              </div>
              <div className="al-field">
                <label className="al-field__label">Country</label>
                <input className="al-field__input" placeholder="e.g. United States"
                  value={form.country} onChange={e => set('country', e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Details & Amenities ── */}
        {step === 2 && (
          <div className="al-step">
            <h2 className="al-step__title">Property details & amenities</h2>
            <p className="al-step__sub">Help guests know exactly what to expect.</p>

            <div className="al-counters">
              <Counter label="Max Guests"  value={form.guests}    onChange={v => set('guests', v)} />
              <Counter label="Bedrooms"    value={form.bedrooms}  onChange={v => set('bedrooms', v)} />
              <Counter label="Beds"        value={form.beds}      onChange={v => set('beds', v)} />
              <Counter label="Bathrooms"   value={form.bathrooms} onChange={v => set('bathrooms', v)} />
            </div>

            <hr className="al-divider" />

            <p className="al-field__label" style={{ marginBottom: 14 }}>Amenities <span style={{ fontWeight: 400, color: '#aaa' }}>(select all that apply)</span></p>
            <div className="al-amenity-grid">
              {AMENITIES.map(a => (
                <button
                  key={a.id}
                  type="button"
                  className={`al-amenity ${form.amenities.includes(a.id) ? 'al-amenity--active' : ''}`}
                  onClick={() => toggleAmenity(a.id)}
                >
                  <span className="al-amenity__icon">{a.icon}</span>
                  <span className="al-amenity__label">{a.label}</span>
                  {form.amenities.includes(a.id) && <FaCheck className="al-amenity__check" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 3: Photos ── */}
        {step === 3 && (
          <div className="al-step">
            <h2 className="al-step__title">Add photos of your property</h2>
            <p className="al-step__sub">Upload up to 10 high-quality photos. The first photo will be the cover image.</p>

            {/* Drop zone */}
            <div className="al-dropzone" onClick={() => fileRef.current?.click()}>
              <FaCloudUploadAlt className="al-dropzone__icon" />
              <p className="al-dropzone__text">Click to upload photos</p>
              <p className="al-dropzone__hint">JPG, PNG, or WebP up to 10 MB each · max 5 photos</p>
              <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={handlePhotos} />
            </div>

            {form.photos.length > 0 && (
              <div className="al-photo-grid">
                {form.photos.map((p, i) => (
                  <div key={i} className="al-photo-wrap">
                    <img src={p.url} alt={p.name} className="al-photo" />
                    {i === 0 && <span className="al-photo__cover">Cover</span>}
                    <button type="button" className="al-photo__remove" onClick={() => removePhoto(i)}><FaTimes /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Step 4: Pricing ── */}
        {step === 4 && (
          <div className="al-step">
            <h2 className="al-step__title">Set your pricing</h2>
            <p className="al-step__sub">You can always change your prices later.</p>

            <div className="al-grid-2">
              <div className="al-field">
                <label className="al-field__label">Price Per Night ($) <span className="al-req">*</span></label>
                <div className="al-field__prefix-wrap">
                  <span className="al-field__prefix">$</span>
                  <input className="al-field__input al-field__input--prefixed" type="number" min="1"
                    placeholder="0" value={form.pricePerNight}
                    onChange={e => set('pricePerNight', e.target.value)} required />
                </div>
              </div>
              <div className="al-field">
                <label className="al-field__label">Cleaning Fee ($) <span style={{ color: '#aaa', fontWeight: 400 }}>(optional)</span></label>
                <div className="al-field__prefix-wrap">
                  <span className="al-field__prefix">$</span>
                  <input className="al-field__input al-field__input--prefixed" type="number" min="0"
                    placeholder="0" value={form.cleaningFee}
                    onChange={e => set('cleaningFee', e.target.value)} />
                </div>
              </div>
            </div>

            <div className="al-field" style={{ maxWidth: 240 }}>
              <label className="al-field__label">Minimum Nights</label>
              <input className="al-field__input" type="number" min="1"
                value={form.minNights} onChange={e => set('minNights', e.target.value)} />
            </div>

            {/* Summary */}
            <div className="al-summary">
              <h4 className="al-summary__title">Listing Summary</h4>
              <div className="al-summary__row"><span>Type</span><strong>{form.type || '—'}</strong></div>
              <div className="al-summary__row"><span>Title</span><strong>{form.title || '—'}</strong></div>
              <div className="al-summary__row"><span>Location</span><strong>{form.location || '—'}</strong></div>
              <div className="al-summary__row"><span>Guests</span><strong>{form.guests}</strong></div>
              <div className="al-summary__row"><span>Bedrooms / Beds / Baths</span><strong>{form.bedrooms} / {form.beds} / {form.bathrooms}</strong></div>
              <div className="al-summary__row"><span>Amenities</span><strong>{form.amenities.length > 0 ? form.amenities.join(', ') : 'None selected'}</strong></div>
              <div className="al-summary__row"><span>Photos</span><strong>{form.photos.length} uploaded</strong></div>
              <div className="al-summary__row"><span>Price / night</span><strong style={{ color: '#FF4A2A' }}>{form.pricePerNight ? `$${form.pricePerNight}` : '—'}</strong></div>
            </div>
          </div>
        )}

        {/* ── Step error ── */}
        {stepError && (
          <p style={{ color: '#FF4A2A', fontSize: '0.82rem', fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <FaExclamationTriangle /> {stepError}
          </p>
        )}

        {/* ── Navigation ── */}
        <div className="al-nav">
          {step > 0
            ? <button type="button" className="al-nav__back" onClick={() => setStep(s => s - 1)}>
                <FaChevronLeft /> Back
              </button>
            : <span />
          }
          {step < STEPS.length - 1
            ? <button type="button" className="al-nav__next" onClick={handleNext}>
                Next <FaChevronRight />
              </button>
            : <button type="submit" className="al-nav__submit" disabled={submitting}>
                {submitting ? 'Publishing…' : <><FaCheck /> Submit Listing</>}
              </button>
          }
        </div>
      </form>
    </div>
  );
}
