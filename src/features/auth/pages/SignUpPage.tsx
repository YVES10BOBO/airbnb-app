import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaApple, FaGoogle, FaEye, FaEyeSlash, FaSuitcaseRolling, FaHome } from 'react-icons/fa';
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
      <div className="auth-shell">
        <p className="auth-shell__brand">LISTON STAYS</p>
        <div className="auth-form__inner">
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
              Sign up with Apple <FaApple />
            </button>
            <button type="button" className="auth-social__btn auth-social__btn--light">
              Sign up with Google <FaGoogle />
            </button>
          </div>

          <p className="auth-social__note">
            We won't post anything without your permission and your personal details are kept private
          </p>

          <div className="auth-divider"><span>Or</span></div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label className="auth-field__label">*Full Name</label>
              <input
                className="auth-field__input"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => { setName(e.target.value); clearErr('name'); }}
                style={fieldErrors.name ? { borderColor: '#FF4A2A' } : {}}
                minLength={2}
                required
              />
              {fieldErrors.name && <p style={{ color: '#FF4A2A', fontSize: '0.72rem', marginTop: 4, fontWeight: 500 }}>{fieldErrors.name}</p>}
            </div>

            <div className="auth-field">
              <label className="auth-field__label">*Enter Email</label>
              <input
                className="auth-field__input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearErr('email'); }}
                style={fieldErrors.email ? { borderColor: '#FF4A2A' } : {}}
                required
              />
              {fieldErrors.email && <p style={{ color: '#FF4A2A', fontSize: '0.72rem', marginTop: 4, fontWeight: 500 }}>{fieldErrors.email}</p>}
            </div>

            <div className="auth-field">
              <label className="auth-field__label">*I want to join as</label>
              <div className="signup-role-grid">
                <button
                  type="button"
                  className={`signup-role-card ${role === 'guest' ? 'signup-role-card--active' : ''}`}
                  onClick={() => setRole('guest')}
                >
                  <span className="signup-role-card__icon"><FaSuitcaseRolling /></span>
                  <span className="signup-role-card__title">Guest</span>
                  <span className="signup-role-card__desc">Book stays and leave reviews</span>
                </button>
                <button
                  type="button"
                  className={`signup-role-card ${role === 'host' ? 'signup-role-card--active' : ''}`}
                  onClick={() => setRole('host')}
                >
                  <span className="signup-role-card__icon"><FaHome /></span>
                  <span className="signup-role-card__title">Host</span>
                  <span className="signup-role-card__desc">List properties and earn</span>
                </button>
              </div>
              <p className="signup-role-note">
                Admin accounts are created internally for security.
              </p>
            </div>

            <div className="auth-field">
              <label className="auth-field__label">*Phone</label>
              <input
                className="auth-field__input"
                type="tel"
                placeholder="+1 555 0100"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); clearErr('phone'); }}
                style={fieldErrors.phone ? { borderColor: '#FF4A2A' } : {}}
                required
              />
              {fieldErrors.phone && <p style={{ color: '#FF4A2A', fontSize: '0.72rem', marginTop: 4, fontWeight: 500 }}>{fieldErrors.phone}</p>}
            </div>

            <div className="auth-field">
              <label className="auth-field__label">*Password</label>
              <div className="auth-field__pwd-wrap">
                <input
                  className="auth-field__input"
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearErr('password'); }}
                  style={fieldErrors.password ? { borderColor: '#FF4A2A' } : {}}
                  required
                />
                <button type="button" className="auth-field__eye" onClick={() => setShowPwd((v) => !v)}>
                  {showPwd ? <FaEye /> : <FaEyeSlash />}
                </button>
              </div>
              {fieldErrors.password && <p style={{ color: '#FF4A2A', fontSize: '0.72rem', marginTop: 4, fontWeight: 500 }}>{fieldErrors.password}</p>}
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
              {submitting ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <div className="auth-footer">
            <p className="auth-footer__line">
              Already have an account? <Link to="/login">Sign In</Link>
            </p>
            <p className="auth-footer__line">
              <Link to="/forgot-password">Forgot Password?</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
