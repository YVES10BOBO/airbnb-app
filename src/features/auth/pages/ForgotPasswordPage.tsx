import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import './LoginPage.css';
import './ForgotPasswordPage.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    toast.success('Password reset instructions sent!');
  }

  return (
    <div className="forgot-page">
      <div className="forgot-card">
        <h1 className="forgot-card__title">
          Password <span className="forgot-card__title-accent">Reset</span>
        </h1>
        <p className="forgot-card__sub">
          Fill with your mail to receive instructions on how to reset your password.
        </p>

        <form className="forgot-form" onSubmit={handleSubmit}>
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

          <div className="auth-field">
            <label className="auth-field__label">*Confirm Password</label>
            <div className="auth-field__pwd-wrap">
              <input
                className="auth-field__input"
                type={showConfirm ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
              <button type="button" className="auth-field__eye" onClick={() => setShowConfirm((v) => !v)}>
                {showConfirm ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-submit forgot-submit">
            Reset Password
          </button>
        </form>

        <p className="forgot-card__footer">
          Remember your password? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
