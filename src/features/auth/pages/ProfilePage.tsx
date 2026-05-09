import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import {
  FaCheckCircle, FaMapMarkerAlt, FaCalendarAlt, FaCamera, FaImage,
  FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn,
} from 'react-icons/fa';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user } = useAuth();

  const [name,     setName]     = useState(user?.name  ?? '');
  const [email,    setEmail]    = useState(user?.email ?? '');
  const [phone,    setPhone]    = useState('');
  const [desc,     setDesc]     = useState('');
  const [facebook, setFacebook] = useState('');
  const [twitter,  setTwitter]  = useState('');
  const [instagram,setInstagram]= useState('');
  const [linkedin, setLinkedin] = useState('');

  const [curPwd,   setCurPwd]   = useState('');
  const [newPwd,   setNewPwd]   = useState('');

  const [headerUrl, setHeaderUrl] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const headerRef = useRef<HTMLInputElement>(null);
  const avatarRef = useRef<HTMLInputElement>(null);

  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  function pickHeader(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setHeaderUrl(URL.createObjectURL(file));
  }

  function pickAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setAvatarUrl(URL.createObjectURL(file));
  }

  function handleDetails(e: React.FormEvent) {
    e.preventDefault();
    toast.success('Profile updated successfully!');
  }

  function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!curPwd) { toast.error('Please enter your current password.'); return; }
    if (newPwd.length < 6) { toast.error('New password must be at least 6 characters.'); return; }
    toast.success('Password changed successfully!');
    setCurPwd(''); setNewPwd('');
  }

  return (
    <div className="pf-page">

      {/* ── Banner + avatar card ── */}
      <div className="pf-hero-card">
        {/* Banner */}
        <div
          className="pf-banner"
          style={headerUrl ? { backgroundImage: `url(${headerUrl})` } : {}}
        >
          <button className="pf-banner__upload-btn" onClick={() => headerRef.current?.click()}>
            <FaImage /> Upload header
          </button>
          <input ref={headerRef} type="file" accept="image/*" hidden onChange={pickHeader} />
        </div>

        {/* Avatar overlapping banner */}
        <div className="pf-avatar-wrap">
          <div className="pf-avatar">
            {avatarUrl
              ? <img src={avatarUrl} alt="avatar" className="pf-avatar__img" />
              : <span className="pf-avatar__initials">{initials}</span>
            }
            <button className="pf-avatar__cam" onClick={() => avatarRef.current?.click()} title="Upload photo">
              <FaCamera />
            </button>
            <input ref={avatarRef} type="file" accept="image/*" hidden onChange={pickAvatar} />
          </div>
        </div>

        {/* Identity */}
        <div className="pf-identity">
          <h2 className="pf-identity__name">
            {name || 'Your Name'}
            <FaCheckCircle className="pf-identity__check" />
          </h2>
          <div className="pf-identity__meta">
            <span><FaMapMarkerAlt className="pf-meta-icon pf-meta-icon--orange" /> San Francisco, US</span>
            <span className="pf-identity__sep">/</span>
            <span><FaCalendarAlt className="pf-meta-icon" /> Joined May 2025</span>
          </div>
        </div>
      </div>

      {/* ── Details form ── */}
      <form className="pf-section-card" onSubmit={handleDetails}>
        <div className="pf-section__head">
          <span className="pf-section__bar" />
          <h3 className="pf-section__title">Details</h3>
        </div>

        {/* Row 1: Name / Phone / Email */}
        <div className="pf-grid-3">
          <div className="pf-field">
            <label className="pf-field__label">Name <span className="pf-req">*</span></label>
            <input
              className="pf-field__input"
              placeholder="Name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div className="pf-field">
            <label className="pf-field__label">Phone <span className="pf-req">*</span></label>
            <input
              className="pf-field__input"
              type="tel"
              placeholder="(123) 456 - 789"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
            />
          </div>
          <div className="pf-field">
            <label className="pf-field__label">Email Address <span className="pf-req">*</span></label>
            <input
              className="pf-field__input"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Description */}
        <div className="pf-field">
          <label className="pf-field__label">Description <span className="pf-req">*</span></label>
          <textarea
            className="pf-field__textarea"
            rows={5}
            maxLength={4000}
            placeholder="Please enter up to 4000 characters."
            value={desc}
            onChange={e => setDesc(e.target.value)}
          />
          <span className="pf-field__count">{desc.length} / 4000</span>
        </div>

        <hr className="pf-divider" />

        {/* Social links */}
        <div className="pf-grid-2">
          <div className="pf-field">
            <label className="pf-field__label">
              <FaFacebookF className="pf-social-icon pf-social-icon--fb" />
              Facebook Page <span className="pf-optional">(optional)</span>
            </label>
            <input
              className="pf-field__input"
              placeholder="https://facebook.com"
              value={facebook}
              onChange={e => setFacebook(e.target.value)}
            />
          </div>
          <div className="pf-field">
            <label className="pf-field__label">
              <FaTwitter className="pf-social-icon pf-social-icon--tw" />
              Twitter Profile <span className="pf-optional">(optional)</span>
            </label>
            <input
              className="pf-field__input"
              placeholder="https://twitter.com"
              value={twitter}
              onChange={e => setTwitter(e.target.value)}
            />
          </div>
          <div className="pf-field">
            <label className="pf-field__label">
              <FaInstagram className="pf-social-icon pf-social-icon--ig" />
              Instagram Profile <span className="pf-optional">(optional)</span>
            </label>
            <input
              className="pf-field__input"
              placeholder="https://instagram.com"
              value={instagram}
              onChange={e => setInstagram(e.target.value)}
            />
          </div>
          <div className="pf-field">
            <label className="pf-field__label">
              <FaLinkedinIn className="pf-social-icon pf-social-icon--li" />
              LinkedIn Page <span className="pf-optional">(optional)</span>
            </label>
            <input
              className="pf-field__input"
              placeholder="https://linkedin.com"
              value={linkedin}
              onChange={e => setLinkedin(e.target.value)}
            />
          </div>
        </div>

        <div className="pf-form-actions">
          <button type="submit" className="pf-btn pf-btn--primary">Save Changes</button>
        </div>
      </form>

      {/* ── Change Password ── */}
      <form className="pf-section-card" onSubmit={handlePassword}>
        <div className="pf-section__head">
          <span className="pf-section__bar" />
          <h3 className="pf-section__title">Change Password</h3>
        </div>

        <div className="pf-grid-2">
          <div className="pf-field">
            <label className="pf-field__label">Current Password <span className="pf-req">*</span></label>
            <input
              className="pf-field__input"
              type="password"
              placeholder="••••••••"
              value={curPwd}
              onChange={e => setCurPwd(e.target.value)}
            />
          </div>
          <div className="pf-field">
            <label className="pf-field__label">New Password <span className="pf-req">*</span></label>
            <input
              className="pf-field__input"
              type="password"
              placeholder="••••••••"
              value={newPwd}
              onChange={e => setNewPwd(e.target.value)}
            />
          </div>
        </div>

        <div className="pf-form-actions">
          <button type="submit" className="pf-btn pf-btn--primary">Update Password</button>
        </div>
      </form>
    </div>
  );
}
