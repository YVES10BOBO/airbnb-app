import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaEye, FaStar, FaMapMarkerAlt } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { listingsService } from '../../../api';
import ListingCover from '../../listings/components/ListingCover';
import type { ApiListing } from '../../../api/types';
import './MyListingsPage.css';

type HostListing = ApiListing & { _count?: { bookings?: number } };

function mapType(type: ApiListing['type']): string {
  switch (type) {
    case 'VILLA': return 'beach';
    case 'CABIN': return 'mountain';
    case 'HOUSE': return 'countryside';
    default: return 'city';
  }
}

function getApiErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const errorText = err.response?.data?.error;
    if (typeof errorText === 'string') return errorText;
    if (!err.response) return 'Cannot reach server. Please try again.';
  }
  return 'Something went wrong. Please try again.';
}

export default function MyListingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const statusParam = searchParams.get('status') ?? 'all';
  const [myListings, setMyListings] = useState<HostListing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    listingsService.getForHost(user.id)
      .then((rows) => setMyListings(rows as HostListing[]))
      .catch((err) => toast.error(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const filtered = useMemo(
    () => myListings.filter((l) => {
      if (statusParam === 'active') return l.status === 'APPROVED';
      if (statusParam === 'pending') return l.status === 'PENDING';
      if (statusParam === 'expired') return l.status === 'REJECTED';
      return true;
    }),
    [myListings, statusParam],
  );

  async function handleDelete(id: string, title: string): Promise<void> {
    const confirmDelete = window.confirm(`Delete listing "${title}"? This cannot be undone.`);
    if (!confirmDelete) return;
    setBusyId(id);
    try {
      await listingsService.remove(id);
      setMyListings((prev) => prev.filter((l) => l.id !== id));
      toast.success('Listing deleted.');
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

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
          <span className="ml-summary-card__val">{myListings.filter((l) => l.status === 'APPROVED').length}</span>
          <span className="ml-summary-card__label">Approved</span>
        </div>
        <div className="ml-summary-card ml-summary-card--red">
          <span className="ml-summary-card__val">{myListings.filter((l) => l.status === 'PENDING').length}</span>
          <span className="ml-summary-card__label">Pending</span>
        </div>
        <div className="ml-summary-card ml-summary-card--purple">
          <span className="ml-summary-card__val">{myListings.filter((l) => l.status === 'REJECTED').length}</span>
          <span className="ml-summary-card__label">Rejected</span>
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
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="ml-table__empty">No listings found for this tab.</td>
              </tr>
            )}
            {loading && (
              <tr>
                <td colSpan={6} className="ml-table__empty">Loading listings...</td>
              </tr>
            )}
            {!loading && filtered.map((l) => (
              <tr key={l.id} className="ml-row">
                <td>
                  <div className="ml-row__prop">
                <ListingCover
                  url={l.photos?.[0]?.url}
                  alt={l.title}
                  className="ml-row__img"
                />
                    <div>
                      <p className="ml-row__title">{l.title}</p>
                      <p className="ml-row__loc"><FaMapMarkerAlt className="ml-row__pin" />{l.location}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="ml-row__cat">{mapType(l.type)}</span>
                </td>
                <td>
                  <span className="ml-row__price">${l.pricePerNight}</span>
                </td>
                <td>
                  <span className="ml-row__rating"><FaStar className="ml-row__star" />{(l.rating ?? 0).toFixed(2)}</span>
                </td>
                <td>
                  <div className="ml-row__toggle">
                    <span className={`ml-row__avail ${
                      l.status === 'APPROVED' ? 'ml-row__avail--on' : l.status === 'PENDING' ? 'ml-row__avail--off' : ''
                    }`}>
                      {l.status}
                    </span>
                  </div>
                </td>
                <td>
                  <div className="ml-row__actions">
                    <button className="ml-action ml-action--view" onClick={() => navigate(`/listings/${l.id}`)} title="View"><FaEye /></button>
                    <button
                      className="ml-action ml-action--edit"
                      title="Edit"
                      onClick={() => navigate(`/edit-listing/${l.id}`)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="ml-action ml-action--del"
                      title="Delete"
                      disabled={busyId === l.id}
                      onClick={() => handleDelete(l.id, l.title)}
                    >
                      <FaTrash />
                    </button>
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
