import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaApple, FaGoogle, FaEye, FaEyeSlash,
  FaSuitcaseRolling, FaHome,
  FaUser, FaEnvelope, FaPhone, FaLock,
} from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { getPasswordChecks, isStrongPassword, isValidEmail, isValidPhone } from '../utils/validation';
import './LoginPage.css';
import './SignUpPage.css';

export default function SignUpPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'guest' | 'host'>('guest');
  const [showPwd, setShowPwd] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ name: '', email: '', phone: '', password: '' });
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const passwordChecks = getPasswordChecks(password);

  function clearErr(field: keyof typeof fieldErrors) {
    setFieldErrors(p => ({ ...p, [field]: '' }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiError('');
    const errs = { name: '', email: '', phone: '', password: '' };
    if (name.trim().length < 2) errs.name = 'Full name must be at least 2 characters.';
    if (!isValidEmail(email)) errs.email = 'Please enter a valid email address.';
    if (!isValidPhone(phone)) errs.phone = 'Enter a valid phone number (e.g. +1 555 0100).';
    if (!isStrongPassword(password)) errs.password = 'Password must meet all requirements shown below.';
    if (errs.name || errs.email || errs.phone || errs.password) { setFieldErrors(errs); return; }
    setFieldErrors({ name: '', email: '', phone: '', password: '' });
    setSubmitting(true);
    try {
      await signup(name, email, password, phone, role);
      navigate('/dashboard');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.error;
        setApiError(typeof msg === 'string' ? msg : 'Registration failed');
      } else {
        setApiError(err instanceof Error ? err.message : 'Registration failed');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">

      {/* ── Left decorative panel ── */}
      <div className="auth-panel">
        <div className="auth-panel__blob auth-panel__blob--1" />
        <div className="auth-panel__blob auth-panel__blob--2" />
        <div className="auth-panel__blob auth-panel__blob--3" />
        <div className="auth-panel__content">
          <p className="auth-panel__logo">List<em>On.</em></p>
          <h2 className="auth-panel__heading">Join our community today.</h2>
          <p className="auth-panel__tagline">
            Discover handpicked stays, earn as a host, and connect with travelers worldwide.
          </p>
          <ul className="auth-panel__features">
            <li><FaSuitcaseRolling /> Book stays worldwide</li>
            <li><FaHome /> List your property</li>
            <li><FaEnvelope /> 24/7 host support</li>
            <li><FaLock /> Secure & verified</li>
          </ul>
          <div className="auth-panel__stats">
            <div className="auth-panel__stat"><strong>24+</strong><span>Listings</span></div>
            <div className="auth-panel__stat"><strong>4.9★</strong><span>Rating</span></div>
            <div className="auth-panel__stat"><strong>100%</strong><span>Verified</span></div>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="auth-right">
        <div className="auth-shell">
          <p className="auth-shell__brand">LISTON STAYS</p>

          <h1 className="auth-form__title">
            Hello! Please
            <br />
            <span className="auth-form__title-dot">.</span>
            <span className="auth-form__title-italic">Sign up</span>
            {' '}to continue
          </h1>
          <p className="auth-form__sub">
            Join our community and unlock access to exclusive listings, reviews, and personalized recommendations.
          </p>

          <div className="auth-social">
            <button type="button" className="auth-social__btn auth-social__btn--dark">
              <FaApple /> Sign up with Apple
            </button>
            <button type="button" className="auth-social__btn auth-social__btn--light">
              <FaGoogle /> Sign up with Google
            </button>
          </div>

          <p className="auth-social__note">
            We won't post anything without your permission and your personal details are kept private
          </p>

          <div className="auth-divider"><span>Or sign up with email</span></div>

          <form className="auth-form" onSubmit={handleSubmit}>

            {/* Name + Email row */}
            <div className="signup-row">
              <div className="auth-field">
                <label className="auth-field__label">Full Name</label>
                <div className="auth-field__icon-wrap">
                  <FaUser className="auth-field__icon-left" />
                  <input
                    className={`auth-field__input auth-field__input--icon ${fieldErrors.name ? 'auth-field__input--error' : ''}`}
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={e => { setName(e.target.value); clearErr('name'); }}
                    minLength={2}
                    required
                  />
                </div>
                {fieldErrors.name && <p className="auth-field__err">{fieldErrors.name}</p>}
              </div>

              <div className="auth-field">
                <label className="auth-field__label">Email Address</label>
                <div className="auth-field__icon-wrap">
                  <FaEnvelope className="auth-field__icon-left" />
                  <input
                    className={`auth-field__input auth-field__input--icon ${fieldErrors.email ? 'auth-field__input--error' : ''}`}
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => { setEmail(e.target.value); clearErr('email'); }}
                    required
                  />
                </div>
                {fieldErrors.email && <p className="auth-field__err">{fieldErrors.email}</p>}
              </div>
            </div>

            {/* I want to join as */}
            <div className="auth-field">
              <label className="auth-field__label">I want to join as</label>
              <div className="signup-role-grid">
                <button
                  type="button"
                  className={`signup-role-card ${role === 'guest' ? 'signup-role-card--active' : ''}`}
                  onClick={() => setRole('guest')}
                >
                  <span className="signup-role-card__icon"><FaSuitcaseRolling /></span>
                  <span className="signup-role-card__title">Guest</span>
                  <span className="signup-role-card__desc">Book stays & leave reviews</span>
                </button>
                <button
                  type="button"
                  className={`signup-role-card ${role === 'host' ? 'signup-role-card--active' : ''}`}
                  onClick={() => setRole('host')}
                >
                  <span className="signup-role-card__icon"><FaHome /></span>
                  <span className="signup-role-card__title">Host</span>
                  <span className="signup-role-card__desc">List properties & earn</span>
                </button>
              </div>
              <p className="signup-role-note">Admin accounts are created internally for security.</p>
            </div>

            {/* Phone */}
            <div className="auth-field">
              <label className="auth-field__label">Phone Number</label>
              <div className="auth-field__icon-wrap">
                <FaPhone className="auth-field__icon-left" />
                <input
                  className={`auth-field__input auth-field__input--icon ${fieldErrors.phone ? 'auth-field__input--error' : ''}`}
                  type="tel"
                  placeholder="+1 555 0100"
                  value={phone}
                  onChange={e => { setPhone(e.target.value); clearErr('phone'); }}
                  required
                />
              </div>
              {fieldErrors.phone && <p className="auth-field__err">{fieldErrors.phone}</p>}
            </div>

            {/* Password */}
            <div className="auth-field">
              <label className="auth-field__label">Password</label>
              <div className="auth-field__icon-wrap">
                <FaLock className="auth-field__icon-left" />
                <input
                  className={`auth-field__input auth-field__input--icon auth-field__input--icon-right ${fieldErrors.password ? 'auth-field__input--error' : ''}`}
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); clearErr('password'); }}
                  required
                />
                <button type="button" className="auth-field__eye" onClick={() => setShowPwd(v => !v)}>
                  {showPwd ? <FaEye /> : <FaEyeSlash />}
                </button>
              </div>
              {fieldErrors.password && <p className="auth-field__err">{fieldErrors.password}</p>}
              <ul className="password-checks">
                <li className={passwordChecks.minLength ? 'ok' : ''}>At least 8 characters</li>
                <li className={passwordChecks.upper ? 'ok' : ''}>One uppercase letter</li>
                <li className={passwordChecks.lower ? 'ok' : ''}>One lowercase letter</li>
                <li className={passwordChecks.number ? 'ok' : ''}>One number</li>
                <li className={passwordChecks.special ? 'ok' : ''}>One special character</li>
              </ul>
            </div>

            {apiError && <p className="auth-form__error">{apiError}</p>}

            <button type="submit" className="auth-submit" disabled={submitting}>
              {submitting
                ? <span className="auth-submit__spinner" />
                : 'Create Account'}
            </button>
          </form>

          <p className="auth-footer__line" style={{ textAlign: 'center', marginTop: 20 }}>
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
