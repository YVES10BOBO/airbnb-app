import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaApple, FaGoogle, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import './LoginPage.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    login(email, password);
    navigate(email === 'admin@liston.com' ? '/admin' : '/dashboard');
  }

  return (
    <div className="auth-split">
      <div className="auth-split__hero">
        <div className="auth-hero__content">
          <h2 className="auth-hero__title">
            Effortlessly organize your<br />workspace with ease
          </h2>
          <p className="auth-hero__sub">
            Find and book the perfect place to stay, or list your own property with ease and confidence.
          </p>
          <div className="auth-hero__art">
            <svg viewBox="0 0 380 300" xmlns="http://www.w3.org/2000/svg" className="auth-hero__svg">
              <ellipse cx="135" cy="285" rx="105" ry="7" fill="rgba(0,0,0,0.08)" />
              <rect x="30" y="268" width="210" height="14" rx="7" fill="#2a2d3e" />
              <rect x="48" y="125" width="174" height="143" rx="10" fill="#2a2d3e" />
              <rect x="60" y="136" width="150" height="120" rx="6" fill="#edf0f8" />
              <rect x="74" y="152" width="122" height="78" rx="8" fill="white" />
              <circle cx="95" cy="175" r="13" fill="#e0e0e0" />
              <rect x="115" y="167" width="68" height="7" rx="3" fill="#e0e0e0" />
              <rect x="115" y="180" width="52" height="6" rx="3" fill="#ededed" />
              <rect x="115" y="192" width="60" height="6" rx="3" fill="#ededed" />
              <circle cx="195" cy="112" r="36" fill="#FF4A2A" />
              <rect x="180" y="108" width="30" height="24" rx="4" fill="white" />
              <path d="M186 108 V101 A9 9 0 0 1 204 101 V108" stroke="white" strokeWidth="5" fill="none" strokeLinecap="round" />
              <circle cx="195" cy="121" r="4" fill="#FF4A2A" />
              <rect x="193" y="121" width="4" height="7" rx="2" fill="#FF4A2A" />
              <ellipse cx="295" cy="285" rx="28" ry="7" fill="rgba(0,0,0,0.08)" />
              <rect x="278" y="225" width="16" height="60" rx="5" fill="#2a2d3e" />
              <rect x="299" y="225" width="16" height="60" rx="5" fill="#2a2d3e" />
              <path d="M263,158 C268,130 326,130 330,158 L334,228 H258 Z" fill="#FF4A2A" />
              <rect x="284" y="107" width="22" height="24" rx="4" fill="#e8b89a" />
              <circle cx="295" cy="92" r="27" fill="#2a2d3e" />
              <path d="M263 175 Q232 182 200 190" stroke="#e8b89a" strokeWidth="14" fill="none" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      <div className="auth-split__form">
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
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label className="auth-field__label">*Password</label>
              <div className="auth-field__pwd-wrap">
                <input
                  className="auth-field__input"
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button type="button" className="auth-field__eye" onClick={() => setShowPwd((v) => !v)}>
                  {showPwd ? <FaEye /> : <FaEyeSlash />}
                </button>
              </div>
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

            <button type="submit" className="auth-submit">Sign In</button>
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
