import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';
import { authService } from '../../../api';
import { getPasswordChecks, isStrongPassword } from '../utils/validation';
import './LoginPage.css';
import './ForgotPasswordPage.css';
import './SignUpPage.css';

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const passwordChecks = getPasswordChecks(password);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Reset token is missing.');
      return;
    }
    if (!isStrongPassword(password)) {
      setError('Password must be at least 8 chars and include upper, lower, number, and special character.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await authService.resetPassword(token, password);
      toast.success(res.message ?? 'Password reset successfully.');
      navigate('/login');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const apiError = err.response?.data?.error;
        setError(typeof apiError === 'string' ? apiError : 'Failed to reset password.');
      } else {
        setError('Failed to reset password.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="forgot-page">
      <div className="forgot-card">
        <h1 className="forgot-card__title">
          Set New <span className="forgot-card__title-accent">Password</span>
        </h1>
        <p className="forgot-card__sub">
          Enter your new password to complete the reset.
        </p>

        <form className="forgot-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-field__label">*New Password</label>
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
            <ul className="password-checks">
              <li className={passwordChecks.minLength ? 'ok' : ''}>At least 8 characters</li>
              <li className={passwordChecks.upper ? 'ok' : ''}>One uppercase letter</li>
              <li className={passwordChecks.lower ? 'ok' : ''}>One lowercase letter</li>
              <li className={passwordChecks.number ? 'ok' : ''}>One number</li>
              <li className={passwordChecks.special ? 'ok' : ''}>One special character</li>
            </ul>
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

          {error && <p className="auth-form__error">{error}</p>}
          <button type="submit" className="auth-submit forgot-submit" disabled={submitting}>
            {submitting ? 'Updating...' : 'Update Password'}
          </button>
        </form>

        <p className="forgot-card__footer">
          Back to <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
