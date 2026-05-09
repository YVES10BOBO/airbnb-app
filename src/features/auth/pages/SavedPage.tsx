import { useNavigate } from 'react-router-dom';
import { useStore } from '../../../store/StoreContext';
import './DashboardPage.css';

export default function SavedPage() {
  const { state, dispatch } = useStore();
  const navigate = useNavigate();
  const savedListings = state.listings.filter((l) => state.saved.includes(l.id));

  return (
    <div className="dash-overview">
      <div className="dash-overview__header">
        <h1 className="dash-overview__title">Saved Listings</h1>
        <p className="dash-overview__sub">Your collection of favorite places to stay.</p>
      </div>

      <div className="dashboard-section">
        <div className="dashboard-section__header">
          <h2 className="dashboard-section__title">{savedListings.length} saved</h2>
          {savedListings.length > 0 && (
            <button
              className="btn btn--outline"
              onClick={() => dispatch({ type: 'RESET' })}
            >
              Clear All
            </button>
          )}
        </div>

        {savedListings.length === 0 ? (
          <div className="dashboard-empty">
            <p>No saved listings yet.</p>
            <button className="btn btn--active" style={{ marginTop: 16 }} onClick={() => navigate('/')}>
              Browse Listings
            </button>
          </div>
        ) : (
          <ul className="dashboard-list">
            {savedListings.map((l) => (
              <li
                key={l.id}
                className="dashboard-list__item dashboard-list__item--clickable"
                onClick={() => navigate(`/listings/${l.id}`)}
              >
                <img src={l.img} alt={l.title} className="dashboard-list__img" />
                <div className="dashboard-list__info">
                  <span className="dashboard-list__title">{l.title}</span>
                  <span className="dashboard-list__location">{l.location}</span>
                </div>
                <span className="dashboard-list__price">${l.price}/night</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
