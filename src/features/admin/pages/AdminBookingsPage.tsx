import { useState, useMemo } from 'react';
import { FaSearch, FaChevronLeft, FaChevronRight, FaCheck, FaTimes, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';

type BookStatus = 'approved' | 'pending' | 'cancelled';

interface AdminBooking {
  id: number; listing: string; guest: string; host: string;
  dates: string; amount: number; guests: number; status: BookStatus;
}

const INIT: AdminBooking[] = [
  { id: 1, listing: 'Cozy Downtown Apartment', guest: 'Bob Tanaka',   host: 'Alice Moreau', dates: 'Aug 1–5, 2026',    amount: 480,  guests: 2, status: 'approved'  },
  { id: 2, listing: 'Lakeside Cabin Retreat',  guest: 'Diana Osei',   host: 'Clara Singh',  dates: 'Sep 10–17, 2026',  amount: 1925, guests: 4, status: 'approved'  },
  { id: 3, listing: 'Charming Victorian House', guest: 'Evan Carter',  host: 'Clara Singh',  dates: 'Oct 20–23, 2026',  amount: 960,  guests: 3, status: 'pending'   },
  { id: 4, listing: 'Modern Beach Villa',       guest: 'Emma Johnson', host: 'Alice Moreau', dates: 'Jun 12–18, 2026',  amount: 3300, guests: 6, status: 'pending'   },
  { id: 5, listing: 'Alpine Ski Chalet',        guest: 'Laila Osman',  host: 'Marcus Lee',   dates: 'Sep 5–10, 2026',   amount: 3200, guests: 4, status: 'cancelled' },
  { id: 6, listing: 'Luxury Penthouse Suite',   guest: 'Marcus Lee',   host: 'Clara Singh',  dates: 'Nov 1–4, 2026',    amount: 1440, guests: 2, status: 'pending'   },
];

const statusCls: Record<BookStatus, string> = {
  approved:  'adm-badge adm-badge--approved',
  pending:   'adm-badge adm-badge--pending',
  cancelled: 'adm-badge adm-badge--banned',
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>(INIT);
  const [search, setSearch]     = useState('');
  const [page, setPage]         = useState(1);
  const [delTarget, setDel]     = useState<AdminBooking | null>(null);
  const pageSize = 5;

  const filtered = useMemo(() =>
    bookings.filter(b =>
      b.listing.toLowerCase().includes(search.toLowerCase()) ||
      b.guest.toLowerCase().includes(search.toLowerCase()) ||
      b.host.toLowerCase().includes(search.toLowerCase())
    ), [bookings, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage   = Math.min(page, totalPages);
  const rows       = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  function approve(b: AdminBooking) {
    if (b.status === 'approved') { toast('Already approved.', { icon: 'ℹ️' }); return; }
    setBookings(prev => prev.map(x => x.id === b.id ? { ...x, status: 'approved' } : x));
    toast.success(`Booking for "${b.listing}" approved!`);
  }
  function cancel(b: AdminBooking) {
    if (b.status === 'cancelled') { toast('Already cancelled.', { icon: 'ℹ️' }); return; }
    setBookings(prev => prev.map(x => x.id === b.id ? { ...x, status: 'cancelled' } : x));
    toast.error(`Booking for "${b.listing}" cancelled.`);
  }
  function confirmDelete() {
    if (!delTarget) return;
    setBookings(prev => prev.filter(x => x.id !== delTarget.id));
    toast.error(`Booking deleted.`);
    setDel(null);
  }

  return (
    <div>
      <div className="adm-page__header">
        <h1 className="adm-page__title">Bookings</h1>
        <p className="adm-page__sub">Monitor and manage all platform bookings.</p>
      </div>

      <div className="adm-card">
        <div className="adm-controls">
          <p className="adm-controls__label" style={{ margin: 0 }}>{filtered.length} bookings</p>
          <div className="adm-controls__right">
            <span className="adm-controls__label">Search:</span>
            <div className="adm-search">
              <FaSearch className="adm-search__icon" />
              <input className="adm-search__input" placeholder="Listing, guest, host…" value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
          </div>
        </div>

        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead><tr>
              <th>SL.</th><th>LISTING</th><th>GUEST</th><th>HOST</th>
              <th>DATES</th><th>GUESTS</th><th>AMOUNT</th><th>STATUS</th><th>ACTION</th>
            </tr></thead>
            <tbody>
              {rows.length === 0
                ? <tr><td colSpan={9} className="adm-table__empty">No bookings found.</td></tr>
                : rows.map((b, i) => (
                  <tr key={b.id}>
                    <td className="adm-td--sl">{String((safePage - 1) * pageSize + i + 1).padStart(2, '0')}</td>
                    <td style={{ fontWeight: 600, color: '#111', minWidth: 150 }}>{b.listing}</td>
                    <td style={{ color: '#555' }}>{b.guest}</td>
                    <td style={{ color: '#888' }}>{b.host}</td>
                    <td style={{ color: '#666', fontSize: 12, whiteSpace: 'nowrap' }}>{b.dates}</td>
                    <td style={{ textAlign: 'center', color: '#555' }}>{b.guests}</td>
                    <td style={{ fontWeight: 700, color: '#FF4A2A', whiteSpace: 'nowrap' }}>${b.amount.toLocaleString()}</td>
                    <td><span className={statusCls[b.status]}>{b.status}</span></td>
                    <td>
                      <div className="adm-actions">
                        <button className="adm-btn adm-btn--green adm-btn--icon" title="Approve" onClick={() => approve(b)}><FaCheck /></button>
                        <button className="adm-btn adm-btn--orange adm-btn--icon" title="Cancel" onClick={() => cancel(b)}><FaTimes /></button>
                        <button className="adm-btn adm-btn--red adm-btn--icon" title="Delete" onClick={() => setDel(b)}><FaTrash /></button>
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
            <h3 className="bk-modal__title">Delete Booking?</h3>
            <p className="bk-modal__body">Permanently delete booking for <strong>{delTarget.listing}</strong>? This cannot be undone.</p>
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
