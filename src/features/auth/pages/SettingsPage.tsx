import { useState } from 'react';
import { FaBell, FaLock, FaGlobe, FaShieldAlt, FaTrash, FaCheck } from 'react-icons/fa';
import toast from 'react-hot-toast';
import './SettingsPage.css';

interface Toggle {
  id: string;
  label: string;
  desc: string;
  value: boolean;
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('notifications');
  const [saved, setSaved] = useState(false);

  const [notifications, setNotifications] = useState<Toggle[]>([
    { id: 'booking_confirm', label: 'Booking Confirmations', desc: 'Get notified when a booking is confirmed.', value: true },
    { id: 'booking_remind', label: 'Booking Reminders', desc: 'Reminders 24 hours before check-in.', value: true },
    { id: 'new_message', label: 'New Messages', desc: 'Notify me when I receive a new message.', value: true },
    { id: 'review_received', label: 'New Reviews', desc: 'Alert me when a guest leaves a review.', value: false },
    { id: 'price_drop', label: 'Price Drop Alerts', desc: 'Notify me when saved listings drop in price.', value: false },
    { id: 'newsletter', label: 'Newsletter & Promotions', desc: 'Weekly curated travel deals and news.', value: false },
  ]);

  const [privacy, setPrivacy] = useState<Toggle[]>([
    { id: 'show_profile', label: 'Public Profile', desc: 'Allow other users to view your profile.', value: true },
    { id: 'show_reviews', label: 'Show My Reviews', desc: 'Display reviews you\'ve written publicly.', value: true },
    { id: 'data_analytics', label: 'Usage Analytics', desc: 'Help us improve by sharing anonymous usage data.', value: false },
  ]);

  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [currency, setCurrency] = useState('USD');
  const [language, setLanguage] = useState('en');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');

  function toggleNotif(id: string) {
    setNotifications((ns) => ns.map((n) => n.id === id ? { ...n, value: !n.value } : n));
  }
  function togglePrivacy(id: string) {
    setPrivacy((ps) => ps.map((p) => p.id === id ? { ...p, value: !p.value } : p));
  }

  function handleSave() {
    setSaved(true);
    toast.success('Settings saved!');
    setTimeout(() => setSaved(false), 2000);
  }

  const SECTIONS = [
    { id: 'notifications', icon: <FaBell />, label: 'Notifications' },
    { id: 'privacy', icon: <FaShieldAlt />, label: 'Privacy' },
    { id: 'security', icon: <FaLock />, label: 'Security' },
    { id: 'preferences', icon: <FaGlobe />, label: 'Preferences' },
    { id: 'danger', icon: <FaTrash />, label: 'Danger Zone' },
  ];

  return (
    <div className="sp">
      <div className="sp__header">
        <h1 className="sp__title">Settings</h1>
        <p className="sp__sub">Manage your account preferences and security.</p>
      </div>

      <div className="sp-layout">
        {/* Section nav */}
        <nav className="sp-nav">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              className={`sp-nav__item ${activeSection === s.id ? 'sp-nav__item--active' : ''} ${s.id === 'danger' ? 'sp-nav__item--danger' : ''}`}
              onClick={() => setActiveSection(s.id)}
            >
              {s.icon} {s.label}
            </button>
          ))}
        </nav>

        {/* Section content */}
        <div className="sp-content">

          {activeSection === 'notifications' && (
            <div className="sp-section">
              <h2 className="sp-section__title">Notification Preferences</h2>
              <p className="sp-section__desc">Choose what you want to be notified about.</p>
              <div className="sp-toggles">
                {notifications.map((n) => (
                  <label key={n.id} className="sp-toggle-row">
                    <div className="sp-toggle-row__info">
                      <span className="sp-toggle-row__label">{n.label}</span>
                      <span className="sp-toggle-row__desc">{n.desc}</span>
                    </div>
                    <div
                      className={`sp-switch ${n.value ? 'sp-switch--on' : ''}`}
                      onClick={() => toggleNotif(n.id)}
                    >
                      <div className="sp-switch__knob" />
                    </div>
                  </label>
                ))}
              </div>
              <button className="sp-save-btn" onClick={handleSave}>
                {saved ? <><FaCheck /> Saved!</> : 'Save Changes'}
              </button>
            </div>
          )}

          {activeSection === 'privacy' && (
            <div className="sp-section">
              <h2 className="sp-section__title">Privacy Settings</h2>
              <p className="sp-section__desc">Control who can see your information.</p>
              <div className="sp-toggles">
                {privacy.map((p) => (
                  <label key={p.id} className="sp-toggle-row">
                    <div className="sp-toggle-row__info">
                      <span className="sp-toggle-row__label">{p.label}</span>
                      <span className="sp-toggle-row__desc">{p.desc}</span>
                    </div>
                    <div
                      className={`sp-switch ${p.value ? 'sp-switch--on' : ''}`}
                      onClick={() => togglePrivacy(p.id)}
                    >
                      <div className="sp-switch__knob" />
                    </div>
                  </label>
                ))}
              </div>
              <button className="sp-save-btn" onClick={handleSave}>
                {saved ? <><FaCheck /> Saved!</> : 'Save Changes'}
              </button>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="sp-section">
              <h2 className="sp-section__title">Change Password</h2>
              <p className="sp-section__desc">Use a strong password you don't use anywhere else.</p>
              <div className="sp-form">
                <div className="sp-field">
                  <label className="sp-field__label">Current Password</label>
                  <input
                    type="password"
                    className="sp-field__input"
                    placeholder="Enter current password"
                    value={pwForm.current}
                    onChange={(e) => setPwForm((f) => ({ ...f, current: e.target.value }))}
                  />
                </div>
                <div className="sp-field">
                  <label className="sp-field__label">New Password</label>
                  <input
                    type="password"
                    className="sp-field__input"
                    placeholder="Enter new password"
                    value={pwForm.next}
                    onChange={(e) => setPwForm((f) => ({ ...f, next: e.target.value }))}
                  />
                </div>
                <div className="sp-field">
                  <label className="sp-field__label">Confirm New Password</label>
                  <input
                    type="password"
                    className="sp-field__input"
                    placeholder="Confirm new password"
                    value={pwForm.confirm}
                    onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))}
                  />
                </div>
                <button className="sp-save-btn" onClick={handleSave}>Update Password</button>
              </div>
            </div>
          )}

          {activeSection === 'preferences' && (
            <div className="sp-section">
              <h2 className="sp-section__title">Regional & Display Preferences</h2>
              <p className="sp-section__desc">Customize your experience.</p>
              <div className="sp-form">
                <div className="sp-field">
                  <label className="sp-field__label">Currency</label>
                  <select className="sp-field__select" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                    <option value="USD">USD — US Dollar</option>
                    <option value="EUR">EUR — Euro</option>
                    <option value="GBP">GBP — British Pound</option>
                    <option value="JPY">JPY — Japanese Yen</option>
                    <option value="CAD">CAD — Canadian Dollar</option>
                  </select>
                </div>
                <div className="sp-field">
                  <label className="sp-field__label">Language</label>
                  <select className="sp-field__select" value={language} onChange={(e) => setLanguage(e.target.value)}>
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                    <option value="es">Español</option>
                    <option value="de">Deutsch</option>
                    <option value="ja">日本語</option>
                  </select>
                </div>
                <div className="sp-field">
                  <label className="sp-field__label">Theme</label>
                  <div className="sp-theme-btns">
                    {(['light', 'dark', 'system'] as const).map((t) => (
                      <button
                        key={t}
                        className={`sp-theme-btn ${theme === t ? 'sp-theme-btn--active' : ''}`}
                        onClick={() => setTheme(t)}
                      >
                        {t === 'light' ? '☀️' : t === 'dark' ? '🌙' : '💻'} {t.charAt(0).toUpperCase() + t.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <button className="sp-save-btn" onClick={handleSave}>
                  {saved ? <><FaCheck /> Saved!</> : 'Save Preferences'}
                </button>
              </div>
            </div>
          )}

          {activeSection === 'danger' && (
            <div className="sp-section">
              <h2 className="sp-section__title sp-section__title--danger">Danger Zone</h2>
              <p className="sp-section__desc">These actions are irreversible. Please be careful.</p>
              <div className="sp-danger-cards">
                <div className="sp-danger-card">
                  <div>
                    <p className="sp-danger-card__title">Deactivate Account</p>
                    <p className="sp-danger-card__desc">Temporarily disable your account. You can reactivate it anytime by logging back in.</p>
                  </div>
                  <button className="sp-danger-btn sp-danger-btn--soft">Deactivate</button>
                </div>
                <div className="sp-danger-card sp-danger-card--red">
                  <div>
                    <p className="sp-danger-card__title">Delete Account</p>
                    <p className="sp-danger-card__desc">Permanently delete your account and all data. This cannot be undone.</p>
                  </div>
                  <button className="sp-danger-btn sp-danger-btn--hard">Delete Account</button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
