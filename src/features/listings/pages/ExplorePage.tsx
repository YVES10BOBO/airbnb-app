import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUmbrellaBeach, FaMountain, FaCity, FaLeaf, FaSearch, FaMagic, FaMapMarkerAlt, FaStar, FaTimes } from 'react-icons/fa';
import { useStore } from '../../../store/StoreContext';
import { aiService } from '../../../api';
import type { ApiListing } from '../../../api/types';
import './ExplorePage.css';

const CATEGORIES = [
  { key: 'beach', label: 'Beach', icon: <FaUmbrellaBeach />, desc: 'Ocean views, sand, and sun', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop' },
  { key: 'mountain', label: 'Mountain', icon: <FaMountain />, desc: 'Fresh air and scenic peaks', img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop' },
  { key: 'city', label: 'City', icon: <FaCity />, desc: 'Urban stays in top cities', img: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&h=400&fit=crop' },
  { key: 'countryside', label: 'Countryside', icon: <FaLeaf />, desc: 'Peaceful rural escapes', img: 'https://images.unsplash.com/photo-1500076656116-558758c991c1?w=600&h=400&fit=crop' },
] as const;

const EXAMPLE_QUERIES = [
  'Apartment under $150 for 2 guests',
  'Cozy cabin for a family of 4',
  'Villa with pool under $500',
  'House in the city for 3 people',
];

interface AiFilters {
  location?: string | null;
  type?: string | null;
  maxPrice?: number | null;
  guests?: number | null;
}

export default function ExplorePage() {
  const { state } = useStore();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ApiListing[] | null>(null);
  const [filters, setFilters] = useState<AiFilters | null>(null);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');

  function handleCategory(key: string) {
    navigate(`/listings?category=${key}`);
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setResults(null);
    setFilters(null);
    try {
      const res = await aiService.search(query.trim(), { limit: 12 });
      setResults(res.data);
      setFilters((res as any).filters ?? null);
      setTotal(res.meta.total);
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? 'AI search failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function clearResults() {
    setResults(null);
    setFilters(null);
    setError('');
    setQuery('');
  }

  const activeFilters = filters
    ? Object.entries(filters).filter(([, v]) => v != null).map(([k, v]) => {
        if (k === 'maxPrice') return `Max $${v}/night`;
        if (k === 'guests') return `${v}+ guests`;
        if (k === 'type') return String(v).charAt(0) + String(v).slice(1).toLowerCase();
        return String(v);
      })
    : [];

  return (
    <div className="explore-page">
      <div className="explore-hero">
        <p className="explore-hero__sub">DISCOVER YOUR NEXT STAY</p>
        <h1 className="explore-hero__title">Explore Listings</h1>
        <p className="explore-hero__desc">Search in plain English — our AI understands what you're looking for.</p>

        {/* ── AI Search bar ── */}
        <form className="ai-search-bar" onSubmit={handleSearch}>
          <FaMagic className="ai-search-bar__icon" />
          <input
            className="ai-search-bar__input"
            type="text"
            placeholder='Try: "cabin for 4 guests under $200" or "villa with pool"'
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button
            className="ai-search-bar__btn"
            type="submit"
            disabled={loading || !query.trim()}
          >
            {loading ? <span className="ai-search-bar__spinner" /> : <><FaSearch /> Search</>}
          </button>
        </form>

        {/* Example chips */}
        <div className="ai-examples">
          {EXAMPLE_QUERIES.map(q => (
            <button
              key={q}
              type="button"
              className="ai-example-chip"
              onClick={() => setQuery(q)}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      <div className="explore-section">

        {/* ── AI Results ── */}
        {(loading || results !== null || error) && (
          <div className="ai-results-section">
            <div className="ai-results-header">
              <div>
                <h2 className="ai-results-title">
                  {loading ? 'Searching…' : error ? 'No results' : `${total} listing${total !== 1 ? 's' : ''} found`}
                </h2>
                {activeFilters.length > 0 && (
                  <div className="ai-filter-chips">
                    {activeFilters.map(f => (
                      <span key={f} className="ai-filter-chip">{f}</span>
                    ))}
                  </div>
                )}
                {error && <p className="ai-error">{error}</p>}
              </div>
              <button className="ai-clear-btn" onClick={clearResults} title="Clear results">
                <FaTimes /> Clear
              </button>
            </div>

            {loading && (
              <div className="ai-loading">
                <div className="ai-loading__dots">
                  <span /><span /><span />
                </div>
                <p>AI is analyzing your request…</p>
              </div>
            )}

            {!loading && results && results.length === 0 && !error && (
              <p className="ai-empty">No listings match those filters. Try a different search.</p>
            )}

            {!loading && results && results.length > 0 && (
              <div className="ai-results-grid">
                {results.map(listing => (
                  <Link key={listing.id} to={`/listings/${listing.id}`} className="ai-result-card">
                    <div className="ai-result-card__img-wrap">
                      {listing.photos?.[0]?.url
                        ? <img src={listing.photos[0].url} alt={listing.title} className="ai-result-card__img" />
                        : <div className="ai-result-card__no-img">No photo</div>
                      }
                      <span className="ai-result-card__type">{listing.type}</span>
                    </div>
                    <div className="ai-result-card__body">
                      <h3 className="ai-result-card__title">{listing.title}</h3>
                      <p className="ai-result-card__location">
                        <FaMapMarkerAlt /> {listing.location}
                      </p>
                      <div className="ai-result-card__footer">
                        <span className="ai-result-card__price">${listing.pricePerNight}<span>/night</span></span>
                        {listing.rating && (
                          <span className="ai-result-card__rating">
                            <FaStar /> {listing.rating}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {!loading && results && total > 12 && (
              <div style={{ textAlign: 'center', marginTop: 24 }}>
                <Link to="/listings" className="ai-see-all-btn">
                  See all {total} listings
                </Link>
              </div>
            )}
          </div>
        )}

        {/* ── Categories ── */}
        {!results && !loading && (
          <>
            <h2 className="explore-section-title">Browse by Category</h2>
            <div className="explore-grid">
              {CATEGORIES.map((cat) => {
                const count = state.listings.filter((l) => l.category === cat.key).length;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    className="explore-card"
                    onClick={() => handleCategory(cat.key)}
                  >
                    <div className="explore-card__img-wrap">
                      <img src={cat.img} alt="" className="explore-card__img" />
                      <div className="explore-card__overlay" />
                    </div>
                    <div className="explore-card__body">
                      <span className="explore-card__icon" aria-hidden>{cat.icon}</span>
                      <h2 className="explore-card__label">{cat.label}</h2>
                      <p className="explore-card__desc">{cat.desc}</p>
                      <span className="explore-card__count">{count} listings</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="explore-stats">
              <div className="explore-stat">
                <span className="explore-stat__num">{state.listings.length}+</span>
                <span className="explore-stat__label">Total Listings</span>
              </div>
              <div className="explore-stat">
                <span className="explore-stat__num">4</span>
                <span className="explore-stat__label">Categories</span>
              </div>
              <div className="explore-stat">
                <span className="explore-stat__num">{state.listings.filter(l => l.superhost).length}</span>
                <span className="explore-stat__label">Superhosts</span>
              </div>
              <div className="explore-stat">
                <span className="explore-stat__num">{state.listings.filter(l => l.available).length}</span>
                <span className="explore-stat__label">Available Now</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
