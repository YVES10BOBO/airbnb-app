import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import { useAuth } from '../hooks/useAuth';
import { usersService } from '../../../api';
import { isValidPhone } from '../utils/validation';
import {
  FaCheckCircle, FaMapMarkerAlt, FaCalendarAlt, FaCamera, FaImage,
  FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn,
} from 'react-icons/fa';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [desc, setDesc] = useState('');
  const [facebook, setFacebook] = useState('');
  const [twitter, setTwitter] = useState('');
  const [instagram, setInstagram] = useState('');
  const [linkedin, setLinkedin] = useState('');

  const [headerUrl, setHeaderUrl] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({ name: '', phone: '' });

  function clearErr(field: keyof typeof errors) {
    setErrors(p => ({ ...p, [field]: '' }));
  }

  const headerRef = useRef<HTMLInputElement>(null);
  const avatarRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone ?? '');
    setDesc(user.bio ?? '');
  }, [user]);

  useEffect(() => {
    setAvatarPreview((prev) => {
      if (prev?.startsWith('blob:')) {
        URL.revokeObjectURL(prev);
        return null;
      }
      return prev;
    });
  }, [user?.avatar]);

  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase() || 'U';

  function pickHeader(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setHeaderUrl(URL.createObjectURL(file));
  }

  async function pickAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    setAvatarPreview(URL.createObjectURL(file));
    try {
      await usersService.uploadAvatar(user.id, file);
      await refreshUser();
      toast.success('Profile photo updated.');
    } catch (err) {
      setAvatarPreview((prev) => {
        if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
        return null;
      });
      toast.error(axios.isAxiosError(err) && typeof err.response?.data?.error === 'string'
        ? err.response.data.error
        : 'Upload failed.');
    }
    e.target.value = '';
  }

  async function handleDetails(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.id) return;
    const errs = { name: '', phone: '' };
    if (name.trim().length < 2) errs.name = 'Name must be at least 2 characters.';
    if (!phone.trim()) errs.phone = 'Phone number is required.';
    else if (!isValidPhone(phone)) errs.phone = 'Enter a valid phone number (e.g. +1 555 0100).';
    if (errs.name || errs.phone) { setErrors(errs); return; }
    setErrors({ name: '', phone: '' });
    setSaving(true);
    try {
      await usersService.update(user.id, {
        name: name.trim(),
        phone: phone.trim(),
        bio: desc.trim() || undefined,
      });
      await refreshUser();
      toast.success('Profile updated successfully.');
    } catch (err) {
      toast.error(axios.isAxiosError(err) && typeof err.response?.data?.error === 'string'
        ? err.response.data.error
        : 'Update failed.');
    } finally {
      setSaving(false);
    }
  }

  const displayAvatar = avatarPreview ?? user?.avatar;

  return (
    <div className="pf-page">

      <div className="pf-hero-card">
        <div
          className="pf-banner"
          style={headerUrl ? { backgroundImage: `url(${headerUrl})` } : {}}
        >
          <button type="button" className="pf-banner__upload-btn" onClick={() => headerRef.current?.click()}>
            <FaImage /> Upload header
          </button>
          <input ref={headerRef} type="file" accept="image/*" hidden onChange={pickHeader} />
        </div>

        <div className="pf-avatar-wrap">
          <div className="pf-avatar">
            {displayAvatar
              ? <img src={displayAvatar} alt="" className="pf-avatar__img" />
              : <span className="pf-avatar__initials">{initials}</span>}
            <button type="button" className="pf-avatar__cam" onClick={() => avatarRef.current?.click()} title="Upload photo">
              <FaCamera />
            </button>
            <input ref={avatarRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={pickAvatar} />
          </div>
        </div>

        <div className="pf-identity">
          <h2 className="pf-identity__name">
            {name || 'Your Name'}
            <FaCheckCircle className="pf-identity__check" />
          </h2>
          <div className="pf-identity__meta">
            <span><FaMapMarkerAlt className="pf-meta-icon pf-meta-icon--orange" /> Profile</span>
            <span className="pf-identity__sep">/</span>
            <span><FaCalendarAlt className="pf-meta-icon" /> Joined {user?.createdAt ? dayjs(user.createdAt).format('MMM YYYY') : '—'}</span>
          </div>
        </div>
      </div>

      <form className="pf-section-card" onSubmit={handleDetails}>
        <div className="pf-section__head">
          <span className="pf-section__bar" />
          <h3 className="pf-section__title">Details</h3>
        </div>

        <div className="pf-grid-3">
          <div className="pf-field">
            <label className="pf-field__label">Name <span className="pf-req">*</span></label>
            <input
              className="pf-field__input"
              placeholder="Your full name"
              value={name}
              minLength={2}
              required
              style={errors.name ? { borderColor: '#FF4A2A' } : {}}
              onChange={(e) => { setName(e.target.value); clearErr('name'); }}
            />
            {errors.name && <p style={{ color: '#FF4A2A', fontSize: '0.72rem', marginTop: 4, fontWeight: 500 }}>{errors.name}</p>}
          </div>
          <div className="pf-field">
            <label className="pf-field__label">Phone <span className="pf-req">*</span></label>
            <input
              className="pf-field__input"
              type="tel"
              placeholder="+1 555 0100"
              value={phone}
              required
              style={errors.phone ? { borderColor: '#FF4A2A' } : {}}
              onChange={(e) => { setPhone(e.target.value); clearErr('phone'); }}
            />
            {errors.phone && <p style={{ color: '#FF4A2A', fontSize: '0.72rem', marginTop: 4, fontWeight: 500 }}>{errors.phone}</p>}
          </div>
          <div className="pf-field">
            <label className="pf-field__label">Email</label>
            <input
              className="pf-field__input"
              type="email"
              value={email}
              readOnly
              title="Email cannot be changed here"
            />
          </div>
        </div>

        <div className="pf-field">
          <label className="pf-field__label">Bio</label>
          <textarea
            className="pf-field__textarea"
            rows={5}
            maxLength={4000}
            placeholder="Tell guests about yourself (optional)."
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
          <span className="pf-field__count">{desc.length} / 4000</span>
        </div>

        <hr className="pf-divider" />

        <div className="pf-grid-2">
          <div className="pf-field">
            <label className="pf-field__label">
              <FaFacebookF className="pf-social-icon pf-social-icon--fb" />
              Facebook <span className="pf-optional">(local only)</span>
            </label>
            <input className="pf-field__input" placeholder="https://facebook.com" value={facebook} onChange={(e) => setFacebook(e.target.value)} />
          </div>
          <div className="pf-field">
            <label className="pf-field__label">
              <FaTwitter className="pf-social-icon pf-social-icon--tw" />
              Twitter <span className="pf-optional">(local only)</span>
            </label>
            <input className="pf-field__input" placeholder="https://twitter.com" value={twitter} onChange={(e) => setTwitter(e.target.value)} />
          </div>
          <div className="pf-field">
            <label className="pf-field__label">
              <FaInstagram className="pf-social-icon pf-social-icon--ig" />
              Instagram <span className="pf-optional">(local only)</span>
            </label>
            <input className="pf-field__input" placeholder="https://instagram.com" value={instagram} onChange={(e) => setInstagram(e.target.value)} />
          </div>
          <div className="pf-field">
            <label className="pf-field__label">
              <FaLinkedinIn className="pf-social-icon pf-social-icon--li" />
              LinkedIn <span className="pf-optional">(local only)</span>
            </label>
            <input className="pf-field__input" placeholder="https://linkedin.com" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
          </div>
        </div>

        <div className="pf-form-actions">
          <button type="submit" className="pf-btn pf-btn--primary" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
        </div>
      </form>
    </div>
  );
}
