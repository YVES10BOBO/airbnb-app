import { useState, useEffect, useMemo } from 'react';
import { FaSearch, FaChevronLeft, FaChevronRight, FaCheck, FaTimes, FaTrash, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { listingsService } from '../../../api';
import type { ApiListing } from '../../../api/types';

type StatusFilter = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';

const STATUS_TABS: StatusFilter[] = ['ALL', 'PENDING', 'APPROVED', 'REJECTED'];

const badgeCls: Record<string, string> = {
  PENDING:  'adm-badge adm-badge--pending',
  APPROVED: 'adm-badge adm-badge--active',
  REJECTED: 'adm-badge adm-badge--banned',
};

export default function AdminListingsPage() {
  const [listings, setListings] = useState<ApiListing[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [tab, setTab]           = useState<StatusFilter>('PENDING');
  const [page, setPage]         = useState(1);
  const [delTarget, setDel]     = useState<ApiListing | null>(null);
  const [busy, setBusy]         = useState<string | null>(null);
  const pageSize = 10;

  useEffect(() => {
    setLoading(true);
    listingsService.adminGetAll({ limit: 200 })
      .then(res => setListings(res.data))
      .catch(() => toast.error('Failed to load listings.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let rows = listings;
    if (tab !== 'ALL') rows = rows.filter(l => l.status === tab);
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(l =>
        l.title.toLowerCase().includes(q) ||
        l.location.toLowerCase().includes(q) ||
        l.host?.name.toLowerCase().includes(q)
      );
    }
    return rows;
  }, [listings, tab, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage   = Math.min(page, totalPages);
  const rows       = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const counts = useMemo(() => ({
    ALL:      listings.length,
    PENDING:  listings.filter(l => l.status === 'PENDING').length,
    APPROVED: listings.filter(l => l.status === 'APPROVED').length,
    REJECTED: listings.filter(l => l.status === 'REJECTED').length,
  }), [listings]);

  async function setStatus(l: ApiListing, status: 'APPROVED' | 'REJECTED') {
    if (l.status === status) return;
    setBusy(l.id);
    try {
      const updated = await listingsService.updateStatus(l.id, status);
      setListings(prev => prev.map(x => x.id === l.id ? { ...x, status: updated.status } : x));
      toast.success(status === 'APPROVED' ? `"${l.title}" approved!` : `"${l.title}" rejected.`);
    } catch {
      toast.error('Failed to update status.');
    } finally {
      setBusy(null);
    }
  }

  async function confirmDelete() {
    if (!delTarget) return;
    setBusy(delTarget.id);
    try {
      await listingsService.remove(delTarget.id);
      setListings(prev => prev.filter(x => x.id !== delTarget.id));
      toast.success(`"${delTarget.title}" deleted.`);
    } catch {
      toast.error('Failed to delete listing.');
    } finally {
      setBusy(null);
      setDel(null);
    }
  }

  return (
    <div>
      <div className="adm-page__header">
        <h1 className="adm-page__title">Listings</h1>
        <p className="adm-page__sub">Review, approve, or reject property listings.</p>
      </div>

      {/* Status tabs */}
      <div className="adm-tabs">
        {STATUS_TABS.map(s => (
          <button
            key={s}
            className={`adm-tab ${tab === s ? 'adm-tab--active' : ''}`}
            onClick={() => { setTab(s); setPage(1); }}
          >
            {s} <span className="adm-tab__count">{counts[s]}</span>
          </button>
        ))}
      </div>

      <div className="adm-card">
        <div className="adm-controls">
          <p className="adm-controls__label" style={{ margin: 0 }}>{filtered.length} listings</p>
          <div className="adm-controls__right">
            <div className="adm-search">
              <FaSearch className="adm-search__icon" />
              <input className="adm-search__input" placeholder="Title, host, location…" value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
          </div>
        </div>

        <div className="adm-table-wrap">
          {loading ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: '#aaa' }}>
              <FaSpinner style={{ animation: 'spin 1s linear infinite', fontSize: 28 }} />
              <p style={{ marginTop: 12 }}>Loading listings…</p>
            </div>
          ) : (
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
                          <div className="adm-avatar" style={{ borderRadius: 8, overflow: 'hidden', background: '#f0f0f0' }}>
                            {l.photos?.[0]
                              ? <img src={l.photos[0].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : l.title.slice(0, 2).toUpperCase()
                            }
                          </div>
                          <span style={{ fontWeight: 600, color: '#111', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.title}</span>
                        </div>
                      </td>
                      <td style={{ color: '#555' }}>{l.host?.name ?? '—'}</td>
                      <td style={{ color: '#888', fontSize: 12 }}>{l.location}</td>
                      <td><span className="adm-badge adm-badge--guest" style={{ fontSize: 11 }}>{l.type}</span></td>
                      <td style={{ fontWeight: 700, color: '#FF4A2A' }}>${l.pricePerNight.toLocaleString()}</td>
                      <td><span className={badgeCls[l.status] ?? 'adm-badge'}>{l.status}</span></td>
                      <td>
                        <div className="adm-actions">
                          {busy === l.id
                            ? <FaSpinner style={{ animation: 'spin 1s linear infinite', color: '#aaa' }} />
                            : <>
                              <button className="adm-btn adm-btn--green adm-btn--icon" title="Approve"
                                disabled={l.status === 'APPROVED'}
                                onClick={() => setStatus(l, 'APPROVED')}><FaCheck /></button>
                              <button className="adm-btn adm-btn--orange adm-btn--icon" title="Reject"
                                disabled={l.status === 'REJECTED'}
                                onClick={() => setStatus(l, 'REJECTED')}><FaTimes /></button>
                              <button className="adm-btn adm-btn--red adm-btn--icon" title="Delete"
                                onClick={() => setDel(l)}><FaTrash /></button>
                            </>
                          }
                        </div>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          )}
        </div>

        <div className="adm-footer">
          <p className="adm-footer__info">
            {filtered.length === 0 ? 'No entries' :
              `Showing ${(safePage - 1) * pageSize + 1}–${Math.min(safePage * pageSize, filtered.length)} of ${filtered.length}`}
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
            <div className="bk-modal__icon"><FaTrash /></div>
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
