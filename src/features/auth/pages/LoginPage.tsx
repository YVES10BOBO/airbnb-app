import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaApple, FaGoogle, FaEye, FaEyeSlash } from 'react-icons/fa';
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
      <div className="auth-shell">
        <p className="auth-shell__brand">LISTON STAYS</p>
        <div className="auth-form__inner">
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
              Sign in with Apple <FaApple />
            </button>
            <button type="button" className="auth-social__btn auth-social__btn--light">
              Sign in with Google <FaGoogle />
            </button>
          </div>

          <p className="auth-social__note">
            We won't post anything without your permission and your personal details are kept private
          </p>

          <div className="auth-divider"><span>Or</span></div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label className="auth-field__label">*Enter Email</label>
              <input
                className="auth-field__input"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearErr('email'); }}
                style={fieldErrors.email ? { borderColor: '#FF4A2A' } : {}}
                placeholder="you@example.com"
                required
              />
              {fieldErrors.email && <p style={{ color: '#FF4A2A', fontSize: '0.72rem', marginTop: 4, fontWeight: 500 }}>{fieldErrors.email}</p>}
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
            </div>

            <div className="auth-remember">
              <label className="auth-remember__label">
                Remember me next time
                <input
                  type="checkbox"
                  className="auth-remember__checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
              </label>
            </div>

            {apiError && <p className="auth-form__error">{apiError}</p>}
            {showSignupHint && (
              <p className="auth-form__hint">
                New here? <Link to="/signup">Create an account</Link>
              </p>
            )}
            <button type="submit" className="auth-submit" disabled={submitting}>
              {submitting ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-footer">
            <p className="auth-footer__line">
              Don't have an account? <Link to="/signup">Sign Up</Link>
            </p>
            <p className="auth-footer__line">
              <Link to="/forgot-password">Remind Password</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
