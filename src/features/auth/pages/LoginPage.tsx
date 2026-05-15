import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaApple, FaGoogle, FaEye, FaEyeSlash,
  FaEnvelope, FaLock, FaUmbrellaBeach, FaMountain, FaCity, FaLeaf,
} from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { isValidEmail } from '../utils/validation';
import './LoginPage.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const showSignupHint = !!apiError;

  function clearErr(field: keyof typeof fieldErrors) {
    setFieldErrors(p => ({ ...p, [field]: '' }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiError('');
    const normalizedEmail = email.trim().toLowerCase();
    const errs = { email: '', password: '' };
    if (!isValidEmail(normalizedEmail)) errs.email = 'Please enter a valid email address.';
    if (!password.trim()) errs.password = 'Password is required.';
    if (errs.email || errs.password) { setFieldErrors(errs); return; }
    setFieldErrors({ email: '', password: '' });
    setSubmitting(true);
    try {
      const startedAt = Date.now();
      const user = await login(normalizedEmail, password);
      const elapsed = Date.now() - startedAt;
      if (elapsed < 600) await new Promise(r => setTimeout(r, 600 - elapsed));
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch {
      setApiError('Invalid email or password. If you are new, please create an account first.');
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
          <h2 className="auth-panel__heading">Find your perfect stay.</h2>
          <p className="auth-panel__tagline">
            Handpicked homes across beaches, mountains, cities and beyond.
          </p>
          <ul className="auth-panel__features">
            <li><FaUmbrellaBeach /> Beachfront villas</li>
            <li><FaMountain /> Mountain retreats</li>
            <li><FaCity /> City apartments</li>
            <li><FaLeaf /> Countryside estates</li>
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
            Welcome back! Please
            <br />
            <span className="auth-form__title-dot">.</span>
            <span className="auth-form__title-italic">Sign in</span>
            {' '}to continue
          </h1>
          <p className="auth-form__sub">
            Unlock a world of exclusive listings, manage your bookings,
            and be the first to discover new stays.
          </p>

          <div className="auth-social">
            <button type="button" className="auth-social__btn auth-social__btn--dark">
              <FaApple /> Sign in with Apple
            </button>
            <button type="button" className="auth-social__btn auth-social__btn--light">
              <FaGoogle /> Sign in with Google
            </button>
          </div>

          <p className="auth-social__note">
            We won't post anything without your permission and your personal details are kept private
          </p>

          <div className="auth-divider"><span>Or sign in with email</span></div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label className="auth-field__label">Email address</label>
              <div className="auth-field__icon-wrap">
                <FaEnvelope className="auth-field__icon-left" />
                <input
                  className={`auth-field__input auth-field__input--icon ${fieldErrors.email ? 'auth-field__input--error' : ''}`}
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearErr('email'); }}
                  placeholder="you@example.com"
                  required
                />
              </div>
              {fieldErrors.email && <p className="auth-field__err">{fieldErrors.email}</p>}
            </div>

            <div className="auth-field">
              <label className="auth-field__label">Password</label>
              <div className="auth-field__icon-wrap">
                <FaLock className="auth-field__icon-left" />
                <input
                  className={`auth-field__input auth-field__input--icon auth-field__input--icon-right ${fieldErrors.password ? 'auth-field__input--error' : ''}`}
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearErr('password'); }}
                  placeholder="Enter your password"
                  required
                />
                <button type="button" className="auth-field__eye" onClick={() => setShowPwd(v => !v)}>
                  {showPwd ? <FaEye /> : <FaEyeSlash />}
                </button>
              </div>
              {fieldErrors.password && <p className="auth-field__err">{fieldErrors.password}</p>}
            </div>

            <div className="auth-remember">
              <label className="auth-remember__label">
                <input
                  type="checkbox"
                  className="auth-remember__checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                />
                Remember me
              </label>
              <Link to="/forgot-password" className="auth-remember__forgot">Forgot password?</Link>
            </div>

            {apiError && <p className="auth-form__error">{apiError}</p>}
            {showSignupHint && (
              <p className="auth-form__hint">
                New here? <Link to="/signup">Create an account</Link>
              </p>
            )}

            <button type="submit" className="auth-submit" disabled={submitting}>
              {submitting
                ? <span className="auth-submit__spinner" />
                : 'Sign In'}
            </button>
          </form>

          <p className="auth-footer__line" style={{ textAlign: 'center', marginTop: 20 }}>
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
