import { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaEnvelope, FaCommentDots, FaBook } from 'react-icons/fa';
import toast from 'react-hot-toast';
import './SupportPage.css';

const FAQS = [
  { q: 'How do I cancel a booking?',               a: 'Go to My Bookings, find the booking you want to cancel, and click the "Cancel" button. Refund eligibility depends on the host\'s cancellation policy.' },
  { q: 'How do I contact my host?',                a: 'Use the Messages section in your dashboard to send a message directly to your host before or after booking.' },
  { q: 'What payment methods are accepted?',       a: 'We accept all major credit/debit cards (Visa, Mastercard, Amex), PayPal, and Apple Pay. All payments are processed securely.' },
  { q: 'How do I list my property?',               a: 'Click "Add Listing" in the dashboard sidebar or navbar. Fill in the property details, add photos, set your price, and publish.' },
  { q: 'What happens if there is a problem with my stay?', a: 'Contact your host first via Messages. If unresolved within 24 hours, use the form below to reach our support team and we will mediate.' },
  { q: 'How are ratings and reviews calculated?',  a: 'Ratings are averaged from all verified guest reviews. Only guests who completed a stay can leave a review — no anonymous or fake reviews.' },
];

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [form, setForm] = useState({ subject: '', message: '' });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    toast.success('Support request sent! We\'ll reply within 24 hours.');
    setForm({ subject: '', message: '' });
  }

  return (
    <div className="sup-page">
      <div className="sup-page__header">
        <h1 className="sup-page__title">Support Center</h1>
        <p className="sup-page__sub">We're here to help. Find answers or get in touch.</p>
      </div>

      {/* Quick contact options */}
      <div className="sup-cards">
        <div className="sup-card">
          <div className="sup-card__icon sup-card__icon--orange"><FaEnvelope /></div>
          <h3 className="sup-card__title">Email Support</h3>
          <p className="sup-card__desc">Send us a message and we'll respond within 24 hours.</p>
          <span className="sup-card__detail">support@liston.com</span>
        </div>
        <div className="sup-card">
          <div className="sup-card__icon sup-card__icon--blue"><FaCommentDots /></div>
          <h3 className="sup-card__title">Live Chat</h3>
          <p className="sup-card__desc">Chat with our team in real time during business hours.</p>
          <span className="sup-card__detail">Mon–Fri, 9am–6pm EST</span>
        </div>
        <div className="sup-card">
          <div className="sup-card__icon sup-card__icon--purple"><FaBook /></div>
          <h3 className="sup-card__title">Help Docs</h3>
          <p className="sup-card__desc">Browse our guides, tutorials, and policy documentation.</p>
          <span className="sup-card__detail">Available 24/7</span>
        </div>
      </div>

      {/* FAQ */}
      <div className="sup-faq">
        <h2 className="sup-faq__title">Frequently Asked Questions</h2>
        <div className="sup-faq__list">
          {FAQS.map((faq, i) => (
            <div key={i} className={`sup-faq-item ${openFaq === i ? 'sup-faq-item--open' : ''}`}>
              <button className="sup-faq-item__q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <span>{faq.q}</span>
                {openFaq === i ? <FaChevronUp className="sup-faq-item__icon" /> : <FaChevronDown className="sup-faq-item__icon" />}
              </button>
              {openFaq === i && <p className="sup-faq-item__a">{faq.a}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Contact form */}
      <div className="sup-form-wrap">
        <h2 className="sup-form-wrap__title">Still need help?</h2>
        <p className="sup-form-wrap__sub">Fill out the form and our team will get back to you within 24 hours.</p>
        <form className="sup-form" onSubmit={handleSubmit}>
          <div className="sup-field">
            <label className="sup-field__label">Subject</label>
            <input
              className="sup-field__input"
              placeholder="e.g. Issue with my booking"
              value={form.subject}
              onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
              required
            />
          </div>
          <div className="sup-field">
            <label className="sup-field__label">Message</label>
            <textarea
              className="sup-field__textarea"
              rows={5}
              placeholder="Describe your issue in detail..."
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              required
            />
          </div>
          <button type="submit" className="sup-form__btn">Send Message</button>
        </form>
      </div>
    </div>
  );
}
