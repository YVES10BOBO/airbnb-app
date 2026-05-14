import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { authService } from '../../../api';
import { isValidEmail } from '../utils/validation';
import './LoginPage.css';
import './ForgotPasswordPage.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const normalizedEmail = email.trim().toLowerCase();
    if (!isValidEmail(normalizedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await authService.forgotPassword(normalizedEmail);
      toast.success(res.message ?? 'If your email is registered, reset instructions were sent.');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const apiError = err.response?.data?.error;
        if (typeof apiError === 'string') {
          setError(apiError);
        } else if (!err.response) {
          setError('Cannot reach the server. Check that the API is running and VITE_API_URL is correct.');
        } else {
          setError('Failed to send reset email. Try again or contact support.');
        }
      } else {
        setError('Failed to send reset email.');
      }
    } finally {
      setSubmitting(false);
    }
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

          {error && <p className="auth-form__error">{error}</p>}

          <button type="submit" className="auth-submit forgot-submit" disabled={submitting}>
            {submitting ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <p className="forgot-card__footer">
          Remember your password? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
