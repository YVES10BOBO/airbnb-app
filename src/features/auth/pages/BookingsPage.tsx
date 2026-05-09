import { useState, useMemo } from 'react';
import { FaTrash, FaCheck, FaSearch, FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';
import './BookingsPage.css';

type BookingStatus = 'approved' | 'pending' | 'cancelled';

interface Booking {
  id: number;
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
  status: BookingStatus;
}

const INIT_BOOKINGS: Booking[] = [
  { id: 1, listingName: 'Luxury Beach Villa',       avatar: 'LB', avatarColor: '#0284c7', checkIn: '2026-06-10', checkOut: '2026-06-15', persons: '2 Adults',          price: 2250, clientName: 'Emma Johnson',    clientEmail: 'emma@example.com',    clientPhone: '123-456-789', status: 'approved'  },
  { id: 2, listingName: 'Cozy Mountain Cabin',      avatar: 'CM', avatarColor: '#16a34a', checkIn: '2026-07-01', checkOut: '2026-07-05', persons: '2 Adults, 1 Child', price:  740, clientName: 'Marcus Lee',      clientEmail: 'marcus@example.com',  clientPhone: '123-456-790', status: 'pending'   },
  { id: 3, listingName: 'Modern Downtown Apt',      avatar: 'MD', avatarColor: '#7c3aed', checkIn: '2026-08-14', checkOut: '2026-08-18', persons: '1 Adult',           price:  480, clientName: 'Sophia Patel',    clientEmail: 'sophia@example.com',  clientPhone: '123-456-791', status: 'pending'   },
  { id: 4, listingName: 'Seaside Cottage',          avatar: 'SC', avatarColor: '#d97706', checkIn: '2026-08-20', checkOut: '2026-08-27', persons: '3 Adults',          price: 2170, clientName: 'David Kim',       clientEmail: 'david@example.com',   clientPhone: '123-456-792', status: 'approved'  },
  { id: 5, listingName: 'Alpine Ski Chalet',        avatar: 'AS', avatarColor: '#FF4A2A', checkIn: '2026-09-05', checkOut: '2026-09-10', persons: '4 Adults',          price: 3200, clientName: 'Laila Osman',     clientEmail: 'laila@example.com',   clientPhone: '123-456-793', status: 'cancelled' },
  { id: 6, listingName: 'Vineyard Cottage',         avatar: 'VC', avatarColor: '#9333ea', checkIn: '2026-09-15', checkOut: '2026-09-20', persons: '2 Adults',          price: 1100, clientName: 'Chris Burton',    clientEmail: 'chris@example.com',   clientPhone: '123-456-794', status: 'pending'   },
  { id: 7, listingName: 'Tropical Jungle Retreat',  avatar: 'TJ', avatarColor: '#0891b2', checkIn: '2026-10-01', checkOut: '2026-10-07', persons: '2 Adults, 2 Kids',  price: 1860, clientName: 'Amara Diallo',    clientEmail: 'amara@example.com',   clientPhone: '123-456-795', status: 'approved'  },
];

const STATUS_CONFIG: Record<BookingStatus, { label: string; dotClass: string; textClass: string }> = {
  approved:  { label: 'Approved',  dotClass: 'bk-dot--green',  textClass: 'bk-status--green'  },
  pending:   { label: 'Pending',   dotClass: 'bk-dot--orange', textClass: 'bk-status--orange' },
  cancelled: { label: 'Cancelled', dotClass: 'bk-dot--red',    textClass: 'bk-status--red'    },
};

const PAGE_SIZES = [5, 10, 25];

function fmt(d: string) {
  const [y, m, day] = d.split('-');
  return `${day}.${m}.${y}`;
}

export default function BookingsPage() {
  const [bookings, setBookings]       = useState<Booking[]>(INIT_BOOKINGS);
  const [search, setSearch]           = useState('');
  const [pageSize, setPageSize]       = useState(5);
  const [page, setPage]               = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Booking | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return bookings.filter(
      (b) =>
        b.listingName.toLowerCase().includes(q) ||
        b.clientName.toLowerCase().includes(q) ||
        b.clientEmail.toLowerCase().includes(q)
    );
  }, [bookings, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage   = Math.min(page, totalPages);
  const pageRows   = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  function handleApprove(b: Booking) {
    if (b.status === 'approved') {
      toast('Already approved.', { icon: 'ℹ️' });
      return;
    }
    setBookings((prev) =>
      prev.map((x) => (x.id === b.id ? { ...x, status: 'approved' } : x))
    );
    toast.success(`Booking for "${b.listingName}" approved!`);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    setBookings((prev) => prev.filter((x) => x.id !== deleteTarget.id));
    toast.error(`Booking for "${deleteTarget.listingName}" deleted.`);
    setDeleteTarget(null);
  }

  return (
    <div className="bk-page">
      {/* Header */}
      <div className="bk-page__header">
        <div>
          <h1 className="bk-page__title">Booking Requests</h1>
          <p className="bk-page__sub">Review, approve and manage all guest booking requests.</p>
        </div>
      </div>

      {/* Table card */}
      <div className="bk-card">
        {/* Controls */}
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

        {/* Table */}
        <div className="bk-table-wrap">
          <table className="bk-table">
            <thead>
              <tr>
                <th>SL.</th>
                <th>LOGO</th>
                <th>CUSTOMER</th>
                <th>BOOKING DATE</th>
                <th>PERSONS</th>
                <th>PRICE</th>
                <th>CLIENT</th>
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
                          <button
                            className="bk-btn bk-btn--approve"
                            onClick={() => handleApprove(b)}
                            title="Approve booking"
                          >
                            <FaCheck /> Approve
                          </button>
                          <button
                            className="bk-btn bk-btn--delete"
                            onClick={() => setDeleteTarget(b)}
                            title="Delete booking"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer: count + pagination */}
        <div className="bk-footer">
          <p className="bk-footer__info">
            {filtered.length === 0
              ? 'No entries'
              : `Showing ${(safePage - 1) * pageSize + 1} to ${Math.min(safePage * pageSize, filtered.length)} of ${filtered.length} entries`}
          </p>
          <div className="bk-pagination">
            <button
              className="bk-page-btn"
              disabled={safePage === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <FaChevronLeft />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                className={`bk-page-btn ${n === safePage ? 'bk-page-btn--active' : ''}`}
                onClick={() => setPage(n)}
              >
                {n}
              </button>
            ))}
            <button
              className="bk-page-btn"
              disabled={safePage === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="bk-modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="bk-modal" onClick={(e) => e.stopPropagation()}>
            <button className="bk-modal__close" onClick={() => setDeleteTarget(null)}><FaTimes /></button>
            <div className="bk-modal__icon">🗑️</div>
            <h3 className="bk-modal__title">Delete Booking?</h3>
            <p className="bk-modal__body">
              You are about to delete the booking for <strong>{deleteTarget.listingName}</strong> by{' '}
              <strong>{deleteTarget.clientName}</strong>. This action cannot be undone.
            </p>
            <div className="bk-modal__actions">
              <button className="bk-modal__btn bk-modal__btn--cancel" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button className="bk-modal__btn bk-modal__btn--confirm" onClick={confirmDelete}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
