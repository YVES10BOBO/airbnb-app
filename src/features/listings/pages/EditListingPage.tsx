import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import {
  FaBuilding, FaHome, FaUmbrellaBeach, FaTree,
  FaWifi, FaParking, FaSwimmingPool, FaFire, FaTv, FaSnowflake,
  FaDumbbell, FaUtensils, FaTshirt, FaWater,
  FaPlus, FaMinus, FaArrowLeft, FaSave, FaExclamationTriangle,
} from 'react-icons/fa';
import { listingsService } from '../../../api';
import Spinner from '../../../shared/components/Spinner';
import './AddListingPage.css';

const PROPERTY_TYPES = [
  { id: 'APARTMENT', label: 'Apartment', icon: <FaBuilding /> },
  { id: 'HOUSE',     label: 'House',     icon: <FaHome /> },
  { id: 'VILLA',     label: 'Villa',     icon: <FaUmbrellaBeach /> },
  { id: 'CABIN',     label: 'Cabin',     icon: <FaTree /> },
];

const AMENITIES = [
  { id: 'WiFi',             icon: <FaWifi />,         label: 'WiFi' },
  { id: 'Kitchen',          icon: <FaUtensils />,     label: 'Kitchen' },
  { id: 'Parking',          icon: <FaParking />,      label: 'Free Parking' },
  { id: 'Pool',             icon: <FaSwimmingPool />, label: 'Swimming Pool' },
  { id: 'Fireplace',        icon: <FaFire />,         label: 'Fireplace' },
  { id: 'TV',               icon: <FaTv />,           label: 'TV / Cable' },
  { id: 'Air conditioning', icon: <FaSnowflake />,    label: 'Air Conditioning' },
  { id: 'Gym',              icon: <FaDumbbell />,     label: 'Gym / Fitness' },
  { id: 'Washer',           icon: <FaTshirt />,       label: 'Washer & Dryer' },
  { id: 'Hot tub',          icon: <FaWater />,        label: 'Hot Tub' },
];

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

function getApiError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const msg = err.response?.data?.error;
    if (typeof msg === 'string') return msg;
    const issues = err.response?.data?.errors;
    if (Array.isArray(issues) && issues.length > 0) return issues[0].message ?? 'Validation error.';
    if (!err.response) return 'Cannot reach server.';
  }
  return 'Failed to update listing.';
}

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stepError, setStepError] = useState('');

  const [type, setType] = useState('APARTMENT');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [guests, setGuests] = useState(1);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [pricePerNight, setPricePerNight] = useState('');

  useEffect(() => {
    if (!id) return;
    listingsService.getById(id)
      .then((l) => {
        setType(l.type);
        setTitle(l.title);
        setDescription(l.description ?? '');
        setLocation(l.location);
        setGuests(l.guests);
        setAmenities(Array.isArray(l.amenities) ? l.amenities : []);
        setPricePerNight(String(l.pricePerNight));
      })
      .catch(() => toast.error('Could not load listing.'))
      .finally(() => setLoading(false));
  }, [id]);

  function toggleAmenity(a: string) {
    setAmenities((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]);
    setStepError('');
  }

  async function handleSave() {
    if (title.trim().length < 5) { setStepError('Title must be at least 5 characters.'); return; }
    if (description.trim().length < 10) { setStepError('Description must be at least 10 characters.'); return; }
    if (!location.trim()) { setStepError('Location is required.'); return; }
    if (!pricePerNight || Number(pricePerNight) <= 0) { setStepError('Price must be a positive number.'); return; }
    if (amenities.length === 0) { setStepError('Select at least one amenity.'); return; }

    setStepError('');
    setSaving(true);
    try {
      await listingsService.update(id!, {
        type: type as any,
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        guests,
        pricePerNight: Number(pricePerNight),
        amenities,
      });
      toast.success('Listing updated!');
      navigate('/dashboard/my-listings');
    } catch (err) {
      setStepError(getApiError(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="al-page" style={{ textAlign: 'center', paddingTop: 80 }}><Spinner /></div>;

  return (
    <div className="al-page">
      <button type="button" className="al-back-btn" style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#FF4A2A', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', marginBottom: 24 }} onClick={() => navigate('/dashboard/my-listings')}>
        <FaArrowLeft /> Back to My Listings
      </button>

      <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 6 }}>Edit Listing</h1>
      <p style={{ color: '#8f93a8', marginBottom: 32 }}>Update your property details below.</p>

      {/* Property type */}
      <div className="al-card">
        <h2 className="al-card__title">Property Type</h2>
        <div className="al-type-grid">
          {PROPERTY_TYPES.map((pt) => (
            <button
              key={pt.id}
              type="button"
              className={`al-type-card ${type === pt.id ? 'al-type-card--active' : ''}`}
              onClick={() => setType(pt.id)}
            >
              <span className="al-type-card__icon">{pt.icon}</span>
              <span className="al-type-card__label">{pt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Basic info */}
      <div className="al-card">
        <h2 className="al-card__title">Basic Info</h2>
        <div className="al-field">
          <label className="al-label">Title *</label>
          <input className="al-input" placeholder="e.g. Cozy Beachfront Villa" value={title} onChange={(e) => { setTitle(e.target.value); setStepError(''); }} />
        </div>
        <div className="al-field">
          <label className="al-label">Location *</label>
          <input className="al-input" placeholder="City, Country" value={location} onChange={(e) => { setLocation(e.target.value); setStepError(''); }} />
        </div>
        <div className="al-field">
          <label className="al-label">Description *</label>
          <textarea className="al-textarea" rows={5} placeholder="Describe your property…" value={description} onChange={(e) => { setDescription(e.target.value); setStepError(''); }} />
          <span style={{ fontSize: '0.72rem', color: '#8f93a8', marginTop: 2, display: 'block' }}>{description.length} characters</span>
        </div>
      </div>

      {/* Guests */}
      <div className="al-card">
        <h2 className="al-card__title">Capacity</h2>
        <Counter label="Max Guests" value={guests} onChange={(v) => { setGuests(v); setStepError(''); }} />
      </div>

      {/* Amenities */}
      <div className="al-card">
        <h2 className="al-card__title">Amenities</h2>
        <div className="al-amenities">
          {AMENITIES.map((a) => (
            <button
              key={a.id}
              type="button"
              className={`al-amenity ${amenities.includes(a.id) ? 'al-amenity--active' : ''}`}
              onClick={() => toggleAmenity(a.id)}
            >
              <span className="al-amenity__icon">{a.icon}</span>
              <span className="al-amenity__label">{a.label}</span>
            </button>
          ))}
        </div>
        {/* show amenities from API not in the preset list */}
        {amenities.filter((a) => !AMENITIES.find((x) => x.id === a)).map((a) => (
          <span key={a} style={{ display: 'inline-block', background: '#fff0ed', color: '#FF4A2A', borderRadius: 20, padding: '4px 12px', fontSize: '0.8rem', marginRight: 6, marginTop: 8 }}>
            {a} <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FF4A2A' }} onClick={() => toggleAmenity(a)}>×</button>
          </span>
        ))}
      </div>

      {/* Price */}
      <div className="al-card">
        <h2 className="al-card__title">Pricing</h2>
        <div className="al-field">
          <label className="al-label">Price per night (USD) *</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#8f93a8', fontWeight: 700 }}>$</span>
            <input className="al-input" style={{ paddingLeft: 28 }} type="number" min={1} placeholder="0" value={pricePerNight} onChange={(e) => { setPricePerNight(e.target.value); setStepError(''); }} />
          </div>
        </div>
      </div>

      {stepError && (
        <p style={{ color: '#FF4A2A', fontWeight: 600, fontSize: '0.85rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}><FaExclamationTriangle /> {stepError}</p>
      )}

      <button
        type="button"
        className="al-nav__btn al-nav__btn--next"
        style={{ width: '100%', justifyContent: 'center', gap: 8, fontSize: '1rem', padding: '14px 0' }}
        onClick={handleSave}
        disabled={saving}
      >
        <FaSave /> {saving ? 'Saving…' : 'Save Changes'}
      </button>
    </div>
  );
}
