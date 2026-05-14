import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaWhatsapp, FaFacebook, FaTwitter, FaInstagram, FaDribbble,
  FaArrowRight, FaPhone, FaEnvelope, FaMapMarkerAlt, FaApple,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { apiClient } from '../../api';

const SOCIALS = [
  { icon: <FaWhatsapp />, href: '#', label: 'WhatsApp' },
  { icon: <FaFacebook />, href: '#', label: 'Facebook' },
  { icon: <FaDribbble />, href: '#', label: 'Dribbble' },
  { icon: <FaTwitter />, href: '#', label: 'Twitter' },
  { icon: <FaInstagram />, href: '#', label: 'Instagram' },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post('/newsletter/subscribe', { email });
      toast.success('Subscribed! Check your inbox for a welcome email.');
      setEmail('');
    } catch (err) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Subscription failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <footer className="bg-[#13141f] text-gray-400">

      {/* ── App banner ── */}
      <div className="bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center gap-6 justify-between">
          {/* Store buttons */}
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button className="flex items-center gap-2.5 border-2 border-white/60 rounded-lg px-4 py-2.5 text-white bg-transparent cursor-pointer hover:bg-white/10 transition-all">
              <span className="flex flex-col text-left">
                <span className="text-[10px] opacity-80">Get it on</span>
                <span className="text-sm font-bold">Google Play ▶</span>
              </span>
            </button>
            <button className="flex items-center gap-2.5 border-2 border-white/60 rounded-lg px-4 py-2.5 text-white bg-transparent cursor-pointer hover:bg-white/10 transition-all">
              <FaApple className="text-2xl" />
              <span className="flex flex-col text-left">
                <span className="text-[10px] opacity-80">Available on the</span>
                <span className="text-sm font-bold">App Store</span>
              </span>
            </button>
          </div>

          {/* Text */}
          <div className="text-right">
            <h3 className="text-lg font-extrabold text-white mb-1">Download Our App</h3>
            <p className="text-sm text-white/80 leading-relaxed">Search and discover nearby landmarks and amazing places around you, anytime.</p>
          </div>

          {/* Phone mockups — hidden on small screens */}
          <div className="hidden md:flex relative w-36 h-32 shrink-0">
            {/* Back phone */}
            <div className="absolute top-0 right-0 w-[70px] h-[112px] bg-white border border-black/10 rounded-xl overflow-hidden flex flex-col">
              <div className="w-5 h-1.5 bg-black/10 rounded-b mx-auto mt-1 mb-1" />
              <div className="flex-1 px-1.5 bg-gray-50">
                <p className="text-[7px] font-bold text-gray-700 mb-1">Find what you need</p>
                <div className="h-5 bg-gray-200 rounded mb-1" />
                <div className="h-3 bg-gray-200 rounded" />
              </div>
            </div>
            {/* Front phone */}
            <div className="absolute bottom-0 left-0 w-[70px] h-[112px] bg-[#1a1a2e] border border-white/20 rounded-xl overflow-hidden flex flex-col z-10">
              <div className="w-5 h-1.5 bg-white/20 rounded-b mx-auto mt-1 mb-1" />
              <div className="flex-1 px-1.5">
                <p className="text-[7px] font-bold text-white mb-0.5">Search & <em className="text-primary not-italic">Discover</em></p>
                <p className="text-[6px] text-white/70 leading-tight mb-1">Nearby Landmarks Around You</p>
                <div className="h-5 bg-white/10 rounded mb-1" />
                <div className="h-3 bg-white/10 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main columns ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 border-b border-white/5">

        {/* Col 1 — Subscribe + socials */}
        <div>
          <h4 className="text-sm font-bold text-white text-center mb-5">Get In Touch</h4>
          <form className="flex bg-white/5 border border-white/8 rounded-lg overflow-hidden mb-6" onSubmit={handleSubscribe}>
            <input
              type="email"
              className="flex-1 bg-transparent border-none px-3.5 py-2.5 text-sm text-gray-300 font-sans outline-none placeholder-gray-600"
              placeholder="name@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <button type="submit" disabled={loading} className="bg-primary border-none w-10 cursor-pointer text-white flex items-center justify-center text-sm hover:bg-primary-dark transition-all disabled:opacity-60">
              <FaArrowRight />
            </button>
          </form>
          <p className="text-xs font-semibold text-white text-center mb-3">Follow Us</p>
          <div className="flex gap-2.5 justify-center">
            {SOCIALS.map(s => (
              <a key={s.label} href={s.href} aria-label={s.label}
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 text-gray-400 flex items-center justify-center text-sm no-underline hover:bg-primary hover:text-white hover:border-primary transition-all">
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Col 2 — Contact */}
        <div className="flex flex-col items-center">
          <h4 className="text-sm font-bold text-white text-center mb-5">Stay Connect</h4>
          <div className="flex flex-col gap-4">
            <p className="flex items-start gap-2 text-sm text-gray-400 leading-relaxed">
              <FaMapMarkerAlt className="text-primary mt-0.5 shrink-0" />
              Kigali Innovation City,<br />Kigali, Rwanda KN 5 Rd
            </p>
            <p className="flex items-center gap-2 text-sm text-gray-400">
              <FaPhone className="text-primary shrink-0" />
              +250 788 123 456
            </p>
            <p className="flex items-center gap-2 text-sm text-gray-400">
              <FaEnvelope className="text-primary shrink-0" />
              support@ListOn.com
            </p>
          </div>
        </div>

        {/* Col 3 — Newsletter */}
        <div className="flex flex-col items-end text-right">
          <h4 className="text-sm font-bold text-white mb-5">Get In Touch</h4>
          <p className="text-sm text-gray-400 leading-relaxed mb-4">
            Join our newsletter and receive the best listing openings of the week, right on your inbox.
          </p>
          <div className="w-full bg-white/5 border border-white/8 rounded-lg p-3.5 mb-4">
            <p className="text-xs text-gray-500 mb-1.5">Join our Whatsapp:</p>
            <p className="text-base font-bold text-white underline flex items-center gap-2 cursor-pointer justify-end">
              +250 788 123 456 <FaWhatsapp />
            </p>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed mb-1">
            Want to join ListOn?<br /><strong className="text-white">Write us!</strong>
          </p>
          <p className="text-sm text-gray-500">support@ListOn.com</p>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="bg-[#0e0f1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <a href="#" className="hover:text-primary transition-colors no-underline text-gray-600">Cookies</a>
            <span>/</span>
            <a href="#" className="hover:text-primary transition-colors no-underline text-gray-600">Sitemap</a>
            <span>/</span>
            <a href="#" className="hover:text-primary transition-colors no-underline text-gray-600">Privacy</a>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">ListOn — All Rights Reserved 2025 ©</span>
            <Link to="/" className="text-xl font-extrabold text-white no-underline tracking-tight">
              List<span className="text-primary italic">On.</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
