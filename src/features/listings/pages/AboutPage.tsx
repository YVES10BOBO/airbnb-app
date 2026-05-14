import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaAward, FaHome, FaUsers, FaStar, FaFacebookF, FaTwitter, FaLinkedinIn, FaGlobe, FaHandshake, FaCheck } from 'react-icons/fa';
import './AboutPage.css';

const STATS = [
  { icon: <FaHome />, value: '12,000+', label: 'Properties Listed' },
  { icon: <FaUsers />, value: '85,000+', label: 'Happy Guests' },
  { icon: <FaMapMarkerAlt />, value: '120+', label: 'Cities Worldwide' },
  { icon: <FaStar />, value: '4.9', label: 'Average Rating' },
];

const TEAM = [
  {
    name: 'James Wilson',
    role: 'CEO & Co-Founder',
    img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=460&fit=crop&crop=top',
  },
  {
    name: 'Sarah Chen',
    role: 'Head of Design',
    img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=460&fit=crop&crop=top',
  },
  {
    name: 'Marcus Thompson',
    role: 'Lead Engineer',
    img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=460&fit=crop&crop=top',
  },
  {
    name: 'Amara Osei',
    role: 'Host Relations',
    img: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=460&fit=crop&crop=top',
  },
];

const VALUES = [
  {
    icon: <FaHome style={{ color: '#FF4A2A', fontSize: 26 }} />,
    title: 'Authentic Stays',
    desc: 'Every property on ListOn is verified and curated so you always know what to expect.',
  },
  {
    icon: <FaGlobe style={{ color: '#FF4A2A', fontSize: 26 }} />,
    title: 'Global Reach',
    desc: 'From mountain cabins to city penthouses, we connect you to stays in 120+ cities.',
  },
  {
    icon: <FaHandshake style={{ color: '#FF4A2A', fontSize: 26 }} />,
    title: 'Trust First',
    desc: 'Secure payments, transparent reviews, and 24/7 support keep every booking safe.',
  },
  {
    icon: <FaAward style={{ color: '#FF4A2A', fontSize: 26 }} />,
    title: 'Award Winning',
    desc: 'Recognized as the #1 emerging travel platform by TravelTech Awards 2024.',
  },
];

export default function AboutPage() {
  return (
    <div className="about-page">

      {/* Hero */}
      <section className="about-hero">
        <div className="about-hero__content">
          <p className="about-hero__label">WHO WE ARE</p>
          <h1 className="about-hero__title">
            We Help You Find <em>Your Perfect</em> Stay
          </h1>
          <p className="about-hero__desc">
            ListOn is a modern travel platform connecting guests with extraordinary places to stay.
            Whether you're planning a weekend getaway or a month-long adventure, we've got you covered.
          </p>
        </div>
      </section>

      {/* Stats bar */}
      <section className="about-stats">
        {STATS.map((s) => (
          <div key={s.label} className="about-stat">
            <div className="about-stat__icon">{s.icon}</div>
            <div className="about-stat__value">{s.value}</div>
            <div className="about-stat__label">{s.label}</div>
          </div>
        ))}
      </section>

      <div className="about-inner">

        {/* Mission */}
        <section className="about-mission">
          <div className="about-mission__img-wrap">
            <img
              src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=440&fit=crop"
              alt="Cozy living room"
              className="about-mission__img"
            />
            <div className="about-mission__badge">
              <span className="about-mission__badge-num">10+</span>
              <span className="about-mission__badge-txt">Years of excellence</span>
            </div>
          </div>
          <div className="about-mission__text">
            <p className="about-section__label">OUR MISSION</p>
            <h2 className="about-section__title">
              Making Every Trip<br /><em>Unforgettable</em>
            </h2>
            <p className="about-mission__desc">
              We started ListOn with a simple belief: everyone deserves a home away from home.
              Our platform makes it easy to discover, book, and enjoy unique stays — from cozy
              countryside cottages to sleek city apartments.
            </p>
            <p className="about-mission__desc">
              We work closely with hosts to ensure every listing meets our quality standards,
              so you can travel with confidence knowing your stay will exceed expectations.
            </p>
            <div className="about-mission__bullets">
              <div className="about-mission__bullet"><FaCheck style={{ color: '#FF4A2A', marginRight: 8 }} /> Verified listings with transparent reviews</div>
              <div className="about-mission__bullet"><FaCheck style={{ color: '#FF4A2A', marginRight: 8 }} /> Secure, flexible booking and cancellation</div>
              <div className="about-mission__bullet"><FaCheck style={{ color: '#FF4A2A', marginRight: 8 }} /> 24/7 dedicated support team</div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="about-values">
          <div className="about-values__head">
            <p className="about-section__label">WHAT DRIVES US</p>
            <h2 className="about-section__title">Our Core <em>Values</em></h2>
          </div>
          <div className="about-values__grid">
            {VALUES.map((v) => (
              <div key={v.title} className="about-value-card">
                <div className="about-value-card__icon">{v.icon}</div>
                <h3 className="about-value-card__title">{v.title}</h3>
                <p className="about-value-card__desc">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="about-team">
          <div className="about-team__head">
            <p className="about-section__label">THE PEOPLE BEHIND LISTON</p>
            <h2 className="about-section__title">Meet Our <em>Team</em></h2>
          </div>
          <div className="about-team__grid">
            {TEAM.map((m) => (
              <div key={m.name} className="about-team-card">
                <div className="about-team-card__photo-wrap">
                  <img src={m.img} alt={m.name} className="about-team-card__photo" />
                  <div className="about-team-card__socials">
                    <a href="#" className="about-team-card__social" aria-label="Facebook" onClick={e => e.preventDefault()}>
                      <FaFacebookF />
                    </a>
                    <a href="#" className="about-team-card__social" aria-label="Twitter" onClick={e => e.preventDefault()}>
                      <FaTwitter />
                    </a>
                    <a href="#" className="about-team-card__social" aria-label="LinkedIn" onClick={e => e.preventDefault()}>
                      <FaLinkedinIn />
                    </a>
                  </div>
                </div>
                <div className="about-team-card__info">
                  <h3 className="about-team-card__name">{m.name}</h3>
                  <p className="about-team-card__role">{m.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="about-contact">
          <div className="about-contact__text">
            <p className="about-section__label">GET IN TOUCH</p>
            <h2 className="about-section__title">We'd Love To <em>Hear</em> From You</h2>
            <p className="about-contact__desc">
              Have a question about listing your property or planning your next trip? Our team is here to help.
            </p>
            <div className="about-contact__items">
              <div className="about-contact__item">
                <FaMapMarkerAlt className="about-contact__icon" />
                <div>
                  <div className="about-contact__item-label">Our Office</div>
                  <div className="about-contact__item-val">123 Travel Lane, San Francisco, CA 94105</div>
                </div>
              </div>
              <div className="about-contact__item">
                <FaPhone className="about-contact__icon" />
                <div>
                  <div className="about-contact__item-label">Phone</div>
                  <div className="about-contact__item-val">+1 (800) 123-4567</div>
                </div>
              </div>
              <div className="about-contact__item">
                <FaEnvelope className="about-contact__icon" />
                <div>
                  <div className="about-contact__item-label">Email</div>
                  <div className="about-contact__item-val">hello@liston.com</div>
                </div>
              </div>
            </div>
          </div>
          <form className="about-contact__form" onSubmit={(e) => e.preventDefault()}>
            <div className="about-contact__row">
              <input className="about-contact__input" placeholder="Your Name" />
              <input className="about-contact__input" placeholder="Your Email" type="email" />
            </div>
            <input className="about-contact__input" placeholder="Subject" />
            <textarea className="about-contact__textarea" rows={5} placeholder="Your message..." />
            <button type="submit" className="about-contact__btn">Send Message</button>
          </form>
        </section>

      </div>
    </div>
  );
}
