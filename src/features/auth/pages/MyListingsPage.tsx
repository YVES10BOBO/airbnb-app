import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaEye, FaStar, FaMapMarkerAlt, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { useStore } from '../../../store/StoreContext';
import './MyListingsPage.css';

export default function MyListingsPage() {
  const { state } = useStore();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const statusParam = searchParams.get('status') ?? 'all';

  const myListings = state.listings.slice(0, 6);

  const filtered = myListings.filter((l) => {
    if (statusParam === 'active'  || statusParam === 'available') return l.available;
    if (statusParam === 'pending')                                 return !l.available;
    if (statusParam === 'expired')                                 return false;
    return true;
  });

  function setTab(tab: string) {
    setSearchParams(tab === 'all' ? {} : { status: tab });
  }

  return (
    <div className="ml-page">
      <div className="ml-page__header">
        <div>
          <p className="ml-page__label">My Listings</p>
          <h1 className="ml-page__title">
            {statusParam === 'all' || !searchParams.get('status') ? 'All Listings' :
             statusParam === 'active'  ? 'Active Listings'  :
             statusParam === 'pending' ? 'Pending Listings' : 'Expired Listings'}
          </h1>
          <p className="ml-page__sub">Discover exciting categories. <span className="ml-page__sub--red">Find what you're looking for.</span></p>
        </div>
        <button className="ml-page__add-btn" onClick={() => navigate('/add-listing')}>
          <FaPlus /> Add New Listing
        </button>
      </div>

      {/* Summary cards */}
      <div className="ml-summary">
        <div className="ml-summary-card">
          <span className="ml-summary-card__val">{myListings.length}</span>
          <span className="ml-summary-card__label">Total Listings</span>
        </div>
        <div className="ml-summary-card ml-summary-card--green">
          <span className="ml-summary-card__val">{myListings.filter(l => l.available).length}</span>
          <span className="ml-summary-card__label">Available</span>
        </div>
        <div className="ml-summary-card ml-summary-card--red">
          <span className="ml-summary-card__val">{myListings.filter(l => !l.available).length}</span>
          <span className="ml-summary-card__label">Booked</span>
        </div>
        <div className="ml-summary-card ml-summary-card--purple">
          <span className="ml-summary-card__val">{myListings.filter(l => l.superhost).length}</span>
          <span className="ml-summary-card__label">Superhost</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="ml-tabs">
        {['all', 'active', 'pending', 'expired'].map((tab) => (
          <button
            key={tab}
            className={`ml-tab ${statusParam === tab || (tab === 'all' && !searchParams.get('status')) ? 'ml-tab--active' : ''}`}
            onClick={() => setTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Listings table */}
      <div className="ml-table-wrap">
        <table className="ml-table">
          <thead>
            <tr>
              <th>Property</th>
              <th>Category</th>
              <th>Price/night</th>
              <th>Rating</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => (
              <tr key={l.id} className="ml-row">
                <td>
                  <div className="ml-row__prop">
                    <img src={l.img} alt={l.title} className="ml-row__img" />
                    <div>
                      <p className="ml-row__title">{l.title}</p>
                      <p className="ml-row__loc"><FaMapMarkerAlt className="ml-row__pin" />{l.location}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="ml-row__cat">{l.category}</span>
                </td>
                <td>
                  <span className="ml-row__price">${l.price}</span>
                </td>
                <td>
                  <span className="ml-row__rating"><FaStar className="ml-row__star" />{l.rating.toFixed(2)}</span>
                </td>
                <td>
                  <div className="ml-row__toggle">
                    {l.available
                      ? <><FaToggleOn className="ml-row__toggle-icon ml-row__toggle-icon--on" /><span className="ml-row__avail ml-row__avail--on">Available</span></>
                      : <><FaToggleOff className="ml-row__toggle-icon ml-row__toggle-icon--off" /><span className="ml-row__avail ml-row__avail--off">Booked</span></>
                    }
                  </div>
                </td>
                <td>
                  <div className="ml-row__actions">
                    <button className="ml-action ml-action--view" onClick={() => navigate(`/listings/${l.id}`)} title="View"><FaEye /></button>
                    <button className="ml-action ml-action--edit" title="Edit"><FaEdit /></button>
                    <button className="ml-action ml-action--del" title="Delete"><FaTrash /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
