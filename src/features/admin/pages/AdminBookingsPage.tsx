import { useEffect, useMemo, useState } from 'react';
import { FaSearch, FaChevronLeft, FaChevronRight, FaCheck, FaTimes, FaTrash, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { bookingsService } from '../../../api';
import type { ApiBooking } from '../../../api/types';

type AdminBooking = ApiBooking & {
  listing?: { title?: string };
  guest?: { name?: string };
};

const statusCls: Record<string, string> = {
  CONFIRMED: 'adm-badge adm-badge--approved',
  PENDING: 'adm-badge adm-badge--pending',
  CANCELLED: 'adm-badge adm-badge--banned',
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [search, setSearch]     = useState('');
  const [page, setPage]         = useState(1);
  const [delTarget, setDel]     = useState<AdminBooking | null>(null);
  const pageSize = 5;

  useEffect(() => {
    setLoading(true);
    bookingsService.getAll()
      .then((rows) => setBookings(rows as AdminBooking[]))
      .catch(() => toast.error('Failed to load bookings.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() =>
    bookings.filter(b =>
      (b.listing?.title ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (b.guest?.name ?? '').toLowerCase().includes(search.toLowerCase())
    ), [bookings, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage   = Math.min(page, totalPages);
  const rows       = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  function formatDates(checkIn: string, checkOut: string): string {
    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);
    return `${inDate.toLocaleDateString()} - ${outDate.toLocaleDateString()}`;
  }

  function approve(b: AdminBooking) {
    if (b.status === 'CONFIRMED') { toast('Already approved.', { icon: 'ℹ️' }); return; }
    setBusyId(b.id);
    bookingsService.updateStatus(b.id, 'CONFIRMED')
      .then((updated) => {
        setBookings((prev) => prev.map((x) => (x.id === b.id ? { ...x, status: updated.status } : x)));
        toast.success(`Booking for "${b.listing?.title ?? 'listing'}" approved!`);
      })
      .catch(() => toast.error('Failed to approve booking.'))
      .finally(() => setBusyId(null));
  }

  function cancel(b: AdminBooking) {
    if (b.status === 'CANCELLED') { toast('Already cancelled.', { icon: 'ℹ️' }); return; }
    setBusyId(b.id);
    bookingsService.updateStatus(b.id, 'CANCELLED')
      .then((updated) => {
        setBookings((prev) => prev.map((x) => (x.id === b.id ? { ...x, status: updated.status } : x)));
        toast.error(`Booking for "${b.listing?.title ?? 'listing'}" cancelled.`);
      })
      .catch(() => toast.error('Failed to cancel booking.'))
      .finally(() => setBusyId(null));
  }

  async function confirmDelete() {
    if (!delTarget) return;
    setBusyId(delTarget.id);
    try {
      await bookingsService.cancel(delTarget.id);
      setBookings((prev) => prev.filter((x) => x.id !== delTarget.id));
      toast.success('Booking deleted.');
      setDel(null);
    } catch {
      toast.error('Failed to delete booking.');
    } finally {
      setBusyId(null);
    }
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
              <input className="adm-search__input" placeholder="Listing or guest…" value={search}
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
              {loading
                ? <tr><td colSpan={9} className="adm-table__empty"><FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> Loading bookings...</td></tr>
                : rows.length === 0
                ? <tr><td colSpan={9} className="adm-table__empty">No bookings found.</td></tr>
                : rows.map((b, i) => (
                  <tr key={b.id}>
                    <td className="adm-td--sl">{String((safePage - 1) * pageSize + i + 1).padStart(2, '0')}</td>
                    <td style={{ fontWeight: 600, color: '#111', minWidth: 150 }}>{b.listing?.title ?? '—'}</td>
                    <td style={{ color: '#555' }}>{b.guest?.name ?? '—'}</td>
                    <td style={{ color: '#888' }}>—</td>
                    <td style={{ color: '#666', fontSize: 12, whiteSpace: 'nowrap' }}>{formatDates(b.checkIn, b.checkOut)}</td>
                    <td style={{ textAlign: 'center', color: '#555' }}>{b.guests}</td>
                    <td style={{ fontWeight: 700, color: '#FF4A2A', whiteSpace: 'nowrap' }}>${b.totalPrice.toLocaleString()}</td>
                    <td><span className={statusCls[b.status] ?? 'adm-badge'}>{b.status}</span></td>
                    <td>
                      <div className="adm-actions">
                        {busyId === b.id ? (
                          <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                        ) : (
                          <>
                            <button className="adm-btn adm-btn--green adm-btn--icon" title="Approve" onClick={() => approve(b)}><FaCheck /></button>
                            <button className="adm-btn adm-btn--orange adm-btn--icon" title="Cancel" onClick={() => cancel(b)}><FaTimes /></button>
                            <button className="adm-btn adm-btn--red adm-btn--icon" title="Delete" onClick={() => setDel(b)}><FaTrash /></button>
                          </>
                        )}
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
            <div className="bk-modal__icon"><FaTrash /></div>
            <h3 className="bk-modal__title">Delete Booking?</h3>
            <p className="bk-modal__body">Permanently delete booking for <strong>{delTarget.listing?.title ?? 'this listing'}</strong>? This cannot be undone.</p>
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
