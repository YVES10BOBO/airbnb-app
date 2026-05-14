import { useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaSlidersH, FaTimes, FaStar, FaMapMarkerAlt, FaChevronDown, FaThLarge, FaMap, FaUmbrellaBeach, FaMountain, FaCity, FaLeaf } from 'react-icons/fa';
import { useStore } from '../../../store/StoreContext';
import ListingCover from '../components/ListingCover';
import { useListings } from '../hooks/useListings';
import { useFavorites } from '../hooks/useFavorites';
import ListingCard from '../components/ListingCard';
import Spinner from '../../../shared/components/Spinner';
import './ListingsPage.css';

const CATEGORIES = ['beach', 'mountain', 'city', 'countryside'] as const;
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  beach:       <FaUmbrellaBeach />,
  mountain:    <FaMountain />,
  city:        <FaCity />,
  countryside: <FaLeaf />,
};
const SORT_OPTIONS = [
  { value: 'default', label: 'Recommended' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

type Category = typeof CATEGORIES[number];
type SortKey = 'default' | 'price-asc' | 'price-desc' | 'rating';

interface Filters {
  categories: Category[];
  minPrice: number;
  maxPrice: number;
  minRating: number;
  availableOnly: boolean;
  superhostOnly: boolean;
}

const DEFAULT_FILTERS: Filters = {
  categories: [],
  minPrice: 0,
  maxPrice: 1000,
  minRating: 0,
  availableOnly: false,
  superhostOnly: false,
};

export default function ListingsPage() {
  const { state, dispatch } = useStore();
  const { loading, listings, filter } = state;
  const { isSaved, toggle } = useFavorites();
  const navigate = useNavigate();

  const [search, setSearch] = useState(filter);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortKey>('default');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  useListings();

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let result = listings.filter((l) => {
      if (q && !l.title.toLowerCase().includes(q) && !l.location.toLowerCase().includes(q)) return false;
      if (filters.categories.length > 0 && !filters.categories.includes(l.category as Category)) return false;
      if (l.price < filters.minPrice || l.price > filters.maxPrice) return false;
      if (l.rating < filters.minRating) return false;
      if (filters.availableOnly && !l.available) return false;
      if (filters.superhostOnly && !l.superhost) return false;
      return true;
    });

    if (sort === 'price-asc') result = [...result].sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') result = [...result].sort((a, b) => b.price - a.price);
    else if (sort === 'rating') result = [...result].sort((a, b) => b.rating - a.rating);

    return result;
  }, [listings, search, filters, sort]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'SET_FILTER', payload: search });
  }, [search, dispatch]);

  const toggleCategory = (cat: Category) => {
    setFilters((f) => ({
      ...f,
      categories: f.categories.includes(cat)
        ? f.categories.filter((c) => c !== cat)
        : [...f.categories, cat],
    }));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSearch('');
    dispatch({ type: 'SET_FILTER', payload: '' });
  };

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.minPrice > 0 ||
    filters.maxPrice < 1000 ||
    filters.minRating > 0 ||
    filters.availableOnly ||
    filters.superhostOnly ||
    search !== '';

  return (
    <div className="lp-page">

      {/* ── Hero search bar ── */}
      <section className="lp-hero">
        <div className="lp-hero__inner">
          <p className="lp-hero__label">FIND YOUR PERFECT STAY</p>
          <h1 className="lp-hero__title">
            Explore <em>Amazing</em> Places to Stay
          </h1>
          <form className="lp-searchbar" onSubmit={handleSearch}>
            <FaSearch className="lp-searchbar__icon" />
            <input
              className="lp-searchbar__input"
              placeholder="Search by city, country or title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button type="button" className="lp-searchbar__clear" onClick={() => { setSearch(''); dispatch({ type: 'SET_FILTER', payload: '' }); }}>
                <FaTimes />
              </button>
            )}
            <button type="submit" className="lp-searchbar__btn">Search</button>
          </form>
        </div>
      </section>

      {/* ── Category pills ── */}
      <div className="lp-cats">
        <div className="lp-cats__inner">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`lp-cat-pill ${filters.categories.includes(cat) ? 'lp-cat-pill--active' : ''}`}
              onClick={() => toggleCategory(cat)}
            >
              <span>{CATEGORY_ICONS[cat]}</span>
              <span>{cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Sidebar overlay ── */}
      {sidebarOpen && <div className="lp-sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      <aside className={`lp-sidebar${sidebarOpen ? ' lp-sidebar--open' : ''}`}>
          <div className="lp-sidebar__header">
            <h3 className="lp-sidebar__title"><FaSlidersH /> Filters</h3>
            <button className="lp-sidebar__close" onClick={() => setSidebarOpen(false)}><FaTimes /></button>
          </div>

          {hasActiveFilters && (
            <button className="lp-sidebar__reset" onClick={resetFilters}>Clear all filters</button>
          )}

          {/* Category */}
          <div className="lp-filter-group">
            <h4 className="lp-filter-group__title">Property Type</h4>
            <div className="lp-filter-cats">
              {CATEGORIES.map((cat) => (
                <label key={cat} className="lp-filter-check">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(cat)}
                    onChange={() => toggleCategory(cat)}
                  />
                  <span>{CATEGORY_ICONS[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price range */}
          <div className="lp-filter-group">
            <h4 className="lp-filter-group__title">Price per Night</h4>
            <div className="lp-filter-price-row">
              <span>${filters.minPrice}</span>
              <span>${filters.maxPrice === 1000 ? '1000+' : filters.maxPrice}</span>
            </div>
            <div className="lp-filter-range-wrap">
              <input
                type="range"
                className="lp-filter-range"
                min={0}
                max={1000}
                step={10}
                value={filters.minPrice}
                onChange={(e) => setFilters((f) => ({ ...f, minPrice: Math.min(+e.target.value, f.maxPrice - 10) }))}
              />
              <input
                type="range"
                className="lp-filter-range"
                min={0}
                max={1000}
                step={10}
                value={filters.maxPrice}
                onChange={(e) => setFilters((f) => ({ ...f, maxPrice: Math.max(+e.target.value, f.minPrice + 10) }))}
              />
            </div>
          </div>

          {/* Min rating */}
          <div className="lp-filter-group">
            <h4 className="lp-filter-group__title">Minimum Rating</h4>
            <div className="lp-filter-ratings">
              {[0, 4.5, 4.7, 4.9].map((r) => (
                <button
                  key={r}
                  className={`lp-filter-rating-btn ${filters.minRating === r ? 'lp-filter-rating-btn--active' : ''}`}
                  onClick={() => setFilters((f) => ({ ...f, minRating: f.minRating === r ? 0 : r }))}
                >
                  {r === 0 ? 'Any' : <><FaStar className="lp-filter-star" /> {r}+</>}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="lp-filter-group">
            <h4 className="lp-filter-group__title">Availability</h4>
            <label className="lp-filter-toggle-row">
              <span>Available now only</span>
              <input
                type="checkbox"
                className="lp-filter-switch"
                checked={filters.availableOnly}
                onChange={(e) => setFilters((f) => ({ ...f, availableOnly: e.target.checked }))}
              />
            </label>
            <label className="lp-filter-toggle-row">
              <span>Superhost only</span>
              <input
                type="checkbox"
                className="lp-filter-switch"
                checked={filters.superhostOnly}
                onChange={(e) => setFilters((f) => ({ ...f, superhostOnly: e.target.checked }))}
              />
            </label>
          </div>
        </aside>

      {/* ── Results ── */}
      <div className="lp-layout">
        <div className="lp-results">
          {/* Toolbar */}
          <div className="lp-toolbar">
            <div className="lp-toolbar__left">
              <button
                className={`lp-filter-toggle-btn${sidebarOpen ? ' lp-filter-toggle-btn--open' : ''}`}
                onClick={() => setSidebarOpen(o => !o)}
              >
                <FaSlidersH />
                <span>{sidebarOpen ? 'Hide' : 'Filters'}</span>
                {hasActiveFilters && <span className="lp-filter-toggle__dot" />}
              </button>
              <p className="lp-toolbar__count">
                <strong>{filtered.length}</strong> listing{filtered.length !== 1 ? 's' : ''} found
                {hasActiveFilters && <span className="lp-toolbar__active-tag"> · Filters active</span>}
              </p>
            </div>
            <div className="lp-toolbar__right">
              <div className="lp-view-toggle">
                <button
                  className={`lp-view-btn${viewMode === 'grid' ? ' lp-view-btn--active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Grid view"
                >
                  <FaThLarge />
                </button>
                <button
                  className={`lp-view-btn${viewMode === 'map' ? ' lp-view-btn--active' : ''}`}
                  onClick={() => setViewMode('map')}
                  title="Map view"
                >
                  <FaMap />
                </button>
              </div>
              <div className="lp-toolbar__sort">
                <FaChevronDown className="lp-toolbar__sort-icon" />
                <select
                  className="lp-toolbar__select"
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Grid view */}
          {viewMode === 'grid' && (
            loading ? (
              <Spinner />
            ) : filtered.length === 0 ? (
              <div className="lp-empty">
                <div className="lp-empty__icon"><FaMapMarkerAlt /></div>
                <h3 className="lp-empty__title">No listings found</h3>
                <p className="lp-empty__desc">Try adjusting your search or filters to find more stays.</p>
                <button className="lp-empty__btn" onClick={resetFilters}>Clear all filters</button>
              </div>
            ) : (
              <div className="lp-grid">
                {filtered.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    saved={isSaved(listing.id)}
                    onToggleSave={() => toggle(listing.id, listing.title)}
                    onClick={() => navigate(`/listings/${listing.id}`)}
                  />
                ))}
              </div>
            )
          )}

          {/* Map view */}
          {viewMode === 'map' && (
            <div className="lp-map-view">
              <div className="lp-map-list">
                {filtered.map((listing) => (
                  <div key={listing.id} className="lp-map-card" onClick={() => navigate(`/listings/${listing.id}`)}>
                    <ListingCover url={listing.img} alt={listing.title} className="lp-map-card__img" />
                    <div className="lp-map-card__body">
                      <p className="lp-map-card__title">{listing.title}</p>
                      <p className="lp-map-card__loc"><FaMapMarkerAlt />{listing.location}</p>
                      <p className="lp-map-card__price">${listing.price}<span>/night</span></p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="lp-map-frame">
                <iframe
                  title="Map"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(search || 'Miami Beach, Florida')}&output=embed&z=11`}
                  className="lp-map-iframe"
                  loading="lazy"
                  allowFullScreen
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
