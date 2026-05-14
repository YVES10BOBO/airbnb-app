import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { favoritesService, type ApiFavorite } from '../../../api';
import { useFavorites } from '../../listings/hooks/useFavorites';
import ListingCover from '../../listings/components/ListingCover';
import Spinner from '../../../shared/components/Spinner';
import './DashboardPage.css';

export default function SavedPage() {
  const { user } = useAuth();
  const { toggle } = useFavorites();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<ApiFavorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    favoritesService.getAll(user.id)
      .then(setFavorites)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

  async function handleRemove(listingId: string, title: string) {
    await toggle(listingId, title);
    setFavorites((prev) => prev.filter((f) => f.listingId !== listingId));
  }

  if (loading) return <Spinner />;

  return (
    <div className="dash-overview">
      <div className="dash-overview__header">
        <h1 className="dash-overview__title">Saved Listings</h1>
        <p className="dash-overview__sub">Your collection of favorite places to stay.</p>
      </div>

      <div className="dashboard-section">
        <div className="dashboard-section__header">
          <h2 className="dashboard-section__title">{favorites.length} saved</h2>
        </div>

        {favorites.length === 0 ? (
          <div className="dashboard-empty">
            <p>No saved listings yet.</p>
            <button className="btn btn--active" style={{ marginTop: 16 }} onClick={() => navigate('/')}>
              Browse Listings
            </button>
          </div>
        ) : (
          <ul className="dashboard-list">
            {favorites.map(({ listingId, listing }) => {
              const imgUrl = listing.photos?.[0]?.url ?? '';
              return (
                <li
                  key={listingId}
                  className="dashboard-list__item dashboard-list__item--clickable"
                  onClick={() => navigate(`/listings/${listingId}`)}
                >
                  <ListingCover url={imgUrl} alt={listing.title} className="dashboard-list__img" />
                  <div className="dashboard-list__info">
                    <span className="dashboard-list__title">{listing.title}</span>
                    <span className="dashboard-list__location">{listing.location}</span>
                  </div>
                  <span className="dashboard-list__price">${listing.pricePerNight}/night</span>
                  <button
                    className="btn btn--outline"
                    style={{ marginLeft: 'auto', flexShrink: 0 }}
                    onClick={(e) => { e.stopPropagation(); handleRemove(listingId, listing.title); }}
                  >
                    Remove
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
