import { useState, useMemo, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaTrash, FaCheck, FaSearch, FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { bookingsService } from '../../../api';
import type { ApiBooking } from '../../../api/types';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../../../shared/components/Spinner';
import './BookingsPage.css';

type RowStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

interface BookingRow {
  id: string;
  listingName: string;
  avatar: string;
  avatarColor: string;
  checkIn: string;
  checkOut: string;
  persons: string;
  price: number;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  status: RowStatus;
}

const STATUS_CONFIG: Record<RowStatus, { label: string; dotClass: string; textClass: string }> = {
  CONFIRMED: { label: 'Confirmed', dotClass: 'bk-dot--green', textClass: 'bk-status--green' },
  PENDING:   { label: 'Pending',   dotClass: 'bk-dot--orange', textClass: 'bk-status--orange' },
  CANCELLED: { label: 'Cancelled', dotClass: 'bk-dot--red',    textClass: 'bk-status--red'    },
};

const AVATAR_COLORS = ['#0284c7', '#16a34a', '#7c3aed', '#d97706', '#FF4A2A', '#9333ea', '#0891b2'];

const PAGE_SIZES = [5, 10, 25];

function initials(name: string): string {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (p.length === 0) return '?';
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

function colorFor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
}

function mapApiToRow(b: ApiBooking, isHostView: boolean): BookingRow {
  const listingName = b.listing?.title ?? 'Listing';
  const guest = b.guest;
  const displayName = isHostView ? (guest?.name ?? 'Guest') : (guest?.name ?? 'You');
  const email = guest?.email ?? '—';
  const phone = guest?.phone ?? '—';
  return {
    id: b.id,
    listingName,
    avatar: initials(displayName),
    avatarColor: colorFor(b.guestId),
    checkIn: b.checkIn.slice(0, 10),
    checkOut: b.checkOut.slice(0, 10),
    persons: `${b.guests} guest${b.guests !== 1 ? 's' : ''}`,
    price: b.totalPrice,
    clientName: displayName,
    clientEmail: email,
    clientPhone: phone,
    status: b.status,
  };
}

function fmt(d: string) {
  const [y, m, day] = d.split('-');
  return `${day}.${m}.${y}`;
}

function apiErr(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const t = err.response?.data?.error;
    if (typeof t === 'string') return t;
  }
  return 'Something went wrong.';
}

export default function BookingsPage() {
  const { user } = useAuth();
  const isHostView = user?.role === 'host' || user?.role === 'admin';

  const [rows, setRows] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(5);
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<BookingRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await bookingsService.getAll();
      setRows(data.map((b) => mapApiToRow(b, isHostView)));
    } catch {
      toast.error('Failed to load bookings.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [isHostView]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return rows.filter(
      (b) =>
        b.listingName.toLowerCase().includes(q) ||
        b.clientName.toLowerCase().includes(q) ||
        b.clientEmail.toLowerCase().includes(q),
    );
  }, [rows, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  async function handleApprove(b: BookingRow) {
    if (b.status === 'CONFIRMED') {
      toast('Already confirmed.');
      return;
    }
    try {
      await bookingsService.updateStatus(b.id, 'CONFIRMED');
      setRows((prev) => prev.map((x) => (x.id === b.id ? { ...x, status: 'CONFIRMED' as const } : x)));
      toast.success(`Booking confirmed for "${b.listingName}".`);
    } catch (err) {
      toast.error(apiErr(err));
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await bookingsService.cancel(deleteTarget.id);
      setRows((prev) => prev.map((x) => (x.id === deleteTarget.id ? { ...x, status: 'CANCELLED' as const } : x)));
      toast.success('Booking cancelled.');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(apiErr(err));
    }
  }

  return (
    <div className="bk-page">
      <div className="bk-page__header">
        <div>
          <h1 className="bk-page__title">
            {isHostView ? 'Booking requests' : 'My reservations'}
          </h1>
          <p className="bk-page__sub">
            {isHostView
              ? 'Review and confirm bookings for your listings, or cancel a request.'
              : 'Bookings you have made as a guest. You can cancel upcoming stays where allowed.'}
          </p>
        </div>
      </div>

      <div className="bk-card">
        <div className="bk-controls">
          <div className="bk-controls__left">
            <span className="bk-controls__show">Show</span>
            <select
              className="bk-controls__select"
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            >
              {PAGE_SIZES.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            <span className="bk-controls__show">entries</span>
          </div>
          <div className="bk-controls__right">
            <span className="bk-controls__show">Search:</span>
            <div className="bk-search">
              <FaSearch className="bk-search__icon" />
              <input
                className="bk-search__input"
                placeholder="Name, listing, email…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
          </div>
        </div>

        <div className="bk-table-wrap">
          {loading ? (
            <div className="bk-table__empty" style={{ padding: '48px' }}><Spinner /></div>
          ) : (
            <table className="bk-table">
              <thead>
                <tr>
                  <th>SL.</th>
                  <th>LOGO</th>
                  <th>{isHostView ? 'LISTING' : 'STAY'}</th>
                  <th>DATES</th>
                  <th>GUESTS</th>
                  <th>PRICE</th>
                  <th>{isHostView ? 'GUEST' : 'DETAILS'}</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="bk-table__empty">No bookings found.</td>
                  </tr>
                ) : (
                  pageRows.map((b, i) => {
                    const sl = String((safePage - 1) * pageSize + i + 1).padStart(2, '0');
                    const cfg = STATUS_CONFIG[b.status];
                    return (
                      <tr key={b.id}>
                        <td className="bk-td--sl">{sl}</td>
                        <td>
                          <div className="bk-avatar" style={{ background: b.avatarColor }}>{b.avatar}</div>
                        </td>
                        <td className="bk-td--name">{b.listingName}</td>
                        <td className="bk-td--date">{fmt(b.checkIn)} – {fmt(b.checkOut)}</td>
                        <td className="bk-td--persons">{b.persons}</td>
                        <td className="bk-td--price">${b.price.toLocaleString()}</td>
                        <td className="bk-td--client">
                          <span className="bk-client__name">{b.clientName}</span>
                          <span className="bk-client__email">{b.clientEmail}</span>
                          <span className="bk-client__phone">{b.clientPhone}</span>
                        </td>
                        <td>
                          <span className={`bk-status ${cfg.textClass}`}>
                            <span className={`bk-dot ${cfg.dotClass}`} />
                            {cfg.label}
                          </span>
                        </td>
                        <td>
                          <div className="bk-actions">
                            {isHostView && b.status === 'PENDING' && (
                              <button
                                type="button"
                                className="bk-btn bk-btn--approve"
                                onClick={() => handleApprove(b)}
                                title="Confirm booking"
                              >
                                <FaCheck /> Confirm
                              </button>
                            )}
                            {(b.status === 'PENDING' || b.status === 'CONFIRMED') && (
                              <button
                                type="button"
                                className="bk-btn bk-btn--delete"
                                onClick={() => setDeleteTarget(b)}
                                title={isHostView ? 'Cancel booking' : 'Cancel my booking'}
                              >
                                <FaTrash />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="bk-footer">
          <p className="bk-footer__info">
            {filtered.length === 0
              ? 'No entries'
              : `Showing ${(safePage - 1) * pageSize + 1} to ${Math.min(safePage * pageSize, filtered.length)} of ${filtered.length} entries`}
          </p>
          <div className="bk-pagination">
            <button
              type="button"
              className="bk-page-btn"
              disabled={safePage === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <FaChevronLeft />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                className={`bk-page-btn ${n === safePage ? 'bk-page-btn--active' : ''}`}
                onClick={() => setPage(n)}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              className="bk-page-btn"
              disabled={safePage === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      </div>

      {deleteTarget && (
        <div className="bk-modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="bk-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="bk-modal__close" onClick={() => setDeleteTarget(null)}><FaTimes /></button>
            <div className="bk-modal__icon bk-modal__icon--trash"><FaTrash /></div>
            <h3 className="bk-modal__title">Cancel booking?</h3>
            <p className="bk-modal__body">
              {isHostView ? 'This will cancel the reservation for ' : 'You are about to cancel '}
              <strong>{deleteTarget.listingName}</strong>
              {isHostView ? ` (${deleteTarget.clientName}).` : '.'}
            </p>
            <div className="bk-modal__actions">
              <button type="button" className="bk-modal__btn bk-modal__btn--cancel" onClick={() => setDeleteTarget(null)}>
                Go back
              </button>
              <button type="button" className="bk-modal__btn bk-modal__btn--confirm" onClick={confirmDelete}>
                Yes, cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
