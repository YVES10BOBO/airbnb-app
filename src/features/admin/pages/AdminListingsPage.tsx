import { useState, useMemo } from 'react';
import { FaSearch, FaChevronLeft, FaChevronRight, FaCheck, FaTimes, FaTrash, FaEye } from 'react-icons/fa';
import toast from 'react-hot-toast';

type ListingStatus = 'active' | 'pending' | 'rejected';

interface AdminListing {
  id: number; title: string; host: string; location: string;
  type: string; price: number; status: ListingStatus; color: string;
}

const INIT: AdminListing[] = [
  { id: 1, title: 'Cozy Downtown Apartment',   host: 'Alice Moreau', location: 'New York, NY',       type: 'APARTMENT', price: 120,  status: 'active',  color: '#7c3aed' },
  { id: 2, title: 'Lakeside Cabin Retreat',     host: 'Clara Singh',  location: 'Lake Tahoe, CA',     type: 'CABIN',     price: 275,  status: 'active',  color: '#0284c7' },
  { id: 3, title: 'Modern Beach Villa',         host: 'Alice Moreau', location: 'Miami Beach, FL',    type: 'VILLA',     price: 550,  status: 'pending', color: '#16a34a' },
  { id: 4, title: 'Charming Victorian House',   host: 'Clara Singh',  location: 'San Francisco, CA',  type: 'HOUSE',     price: 320,  status: 'active',  color: '#d97706' },
  { id: 5, title: 'Luxury Penthouse Suite',     host: 'Marcus Lee',   location: 'Chicago, IL',        type: 'APARTMENT', price: 480,  status: 'pending', color: '#9333ea' },
  { id: 6, title: 'Rustic Mountain Retreat',    host: 'Marcus Lee',   location: 'Denver, CO',         type: 'CABIN',     price: 195,  status: 'rejected',color: '#dc2626' },
];

const statusCls: Record<ListingStatus, string> = {
  active:   'adm-badge adm-badge--active',
  pending:  'adm-badge adm-badge--pending',
  rejected: 'adm-badge adm-badge--banned',
};

export default function AdminListingsPage() {
  const [listings, setListings] = useState<AdminListing[]>(INIT);
  const [search, setSearch]     = useState('');
  const [page, setPage]         = useState(1);
  const [delTarget, setDel]     = useState<AdminListing | null>(null);
  const pageSize = 5;

  const filtered = useMemo(() =>
    listings.filter(l =>
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.host.toLowerCase().includes(search.toLowerCase()) ||
      l.location.toLowerCase().includes(search.toLowerCase())
    ), [listings, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage   = Math.min(page, totalPages);
  const rows       = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  function approve(l: AdminListing) {
    if (l.status === 'active') { toast('Already active.', { icon: 'ℹ️' }); return; }
    setListings(prev => prev.map(x => x.id === l.id ? { ...x, status: 'active' } : x));
    toast.success(`"${l.title}" approved!`);
  }
  function reject(l: AdminListing) {
    if (l.status === 'rejected') { toast('Already rejected.', { icon: 'ℹ️' }); return; }
    setListings(prev => prev.map(x => x.id === l.id ? { ...x, status: 'rejected' } : x));
    toast.error(`"${l.title}" rejected.`);
  }
  function confirmDelete() {
    if (!delTarget) return;
    setListings(prev => prev.filter(x => x.id !== delTarget.id));
    toast.error(`Listing "${delTarget.title}" deleted.`);
    setDel(null);
  }

  return (
    <div>
      <div className="adm-page__header">
        <h1 className="adm-page__title">Listings</h1>
        <p className="adm-page__sub">Review, approve, or reject property listings.</p>
      </div>

      <div className="adm-card">
        <div className="adm-controls">
          <p className="adm-controls__label" style={{ margin: 0 }}>{filtered.length} listings</p>
          <div className="adm-controls__right">
            <span className="adm-controls__label">Search:</span>
            <div className="adm-search">
              <FaSearch className="adm-search__icon" />
              <input className="adm-search__input" placeholder="Title, host, location…" value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
          </div>
        </div>

        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead><tr>
              <th>SL.</th><th>LISTING</th><th>HOST</th><th>LOCATION</th>
              <th>TYPE</th><th>PRICE/NIGHT</th><th>STATUS</th><th>ACTION</th>
            </tr></thead>
            <tbody>
              {rows.length === 0
                ? <tr><td colSpan={8} className="adm-table__empty">No listings found.</td></tr>
                : rows.map((l, i) => (
                  <tr key={l.id}>
                    <td className="adm-td--sl">{String((safePage - 1) * pageSize + i + 1).padStart(2, '0')}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="adm-avatar" style={{ background: l.color, borderRadius: 8 }}>
                          {l.title.slice(0, 2).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600, color: '#111' }}>{l.title}</span>
                      </div>
                    </td>
                    <td style={{ color: '#555' }}>{l.host}</td>
                    <td style={{ color: '#888', fontSize: 12 }}>{l.location}</td>
                    <td><span className="adm-badge adm-badge--guest" style={{ fontSize: 11 }}>{l.type}</span></td>
                    <td style={{ fontWeight: 700, color: '#FF4A2A' }}>${l.price}</td>
                    <td><span className={statusCls[l.status]}>{l.status}</span></td>
                    <td>
                      <div className="adm-actions">
                        <button className="adm-btn adm-btn--gray adm-btn--icon" title="View"><FaEye /></button>
                        <button className="adm-btn adm-btn--green adm-btn--icon" title="Approve" onClick={() => approve(l)}><FaCheck /></button>
                        <button className="adm-btn adm-btn--orange adm-btn--icon" title="Reject" onClick={() => reject(l)}><FaTimes /></button>
                        <button className="adm-btn adm-btn--red adm-btn--icon" title="Delete" onClick={() => setDel(l)}><FaTrash /></button>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>

        <div className="adm-footer">
          <p className="adm-footer__info">
            {filtered.length === 0 ? 'No entries' :
              `Showing ${(safePage - 1) * pageSize + 1} to ${Math.min(safePage * pageSize, filtered.length)} of ${filtered.length}`}
          </p>
          <div className="adm-pagination">
            <button className="adm-page-btn" disabled={safePage === 1} onClick={() => setPage(p => p - 1)}><FaChevronLeft /></button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button key={n} className={`adm-page-btn ${n === safePage ? 'adm-page-btn--active' : ''}`} onClick={() => setPage(n)}>{n}</button>
            ))}
            <button className="adm-page-btn" disabled={safePage === totalPages} onClick={() => setPage(p => p + 1)}><FaChevronRight /></button>
          </div>
        </div>
      </div>

      {delTarget && (
        <div className="bk-modal-overlay" onClick={() => setDel(null)}>
          <div className="bk-modal" onClick={e => e.stopPropagation()}>
            <button className="bk-modal__close" onClick={() => setDel(null)}><FaTimes /></button>
            <div className="bk-modal__icon">🗑️</div>
            <h3 className="bk-modal__title">Delete Listing?</h3>
            <p className="bk-modal__body">Permanently delete <strong>{delTarget.title}</strong>? This cannot be undone.</p>
            <div className="bk-modal__actions">
              <button className="bk-modal__btn bk-modal__btn--cancel" onClick={() => setDel(null)}>Cancel</button>
              <button className="bk-modal__btn bk-modal__btn--confirm" onClick={confirmDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
