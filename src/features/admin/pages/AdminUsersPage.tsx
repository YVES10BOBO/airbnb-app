import { useState, useMemo } from 'react';
import { FaSearch, FaChevronLeft, FaChevronRight, FaBan, FaTrash, FaEye, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';

type UserStatus = 'active' | 'banned';
type UserRole   = 'admin' | 'host' | 'guest';

interface AdminUser {
  id: number; name: string; email: string; role: UserRole;
  status: UserStatus; joined: string; bookings: number; color: string;
}

const INIT: AdminUser[] = [
  { id: 1, name: 'Admin Liston',  email: 'admin@liston.com',   role: 'admin', status: 'active', joined: 'Jan 2025', bookings: 0,  color: '#FF4A2A' },
  { id: 2, name: 'Alice Moreau',  email: 'alice@example.com',  role: 'host',  status: 'active', joined: 'Feb 2025', bookings: 12, color: '#7c3aed' },
  { id: 3, name: 'Clara Singh',   email: 'clara@example.com',  role: 'host',  status: 'active', joined: 'Mar 2025', bookings: 8,  color: '#0284c7' },
  { id: 4, name: 'Bob Tanaka',    email: 'bob@example.com',    role: 'guest', status: 'active', joined: 'Mar 2025', bookings: 3,  color: '#16a34a' },
  { id: 5, name: 'Diana Osei',    email: 'diana@example.com',  role: 'guest', status: 'active', joined: 'Apr 2025', bookings: 5,  color: '#d97706' },
  { id: 6, name: 'Evan Carter',   email: 'evan@example.com',   role: 'guest', status: 'active', joined: 'Apr 2025', bookings: 1,  color: '#9333ea' },
  { id: 7, name: 'Emma Johnson',  email: 'emma@example.com',   role: 'guest', status: 'active', joined: 'May 2025', bookings: 2,  color: '#0891b2' },
  { id: 8, name: 'Marcus Lee',    email: 'marcus@example.com', role: 'host',  status: 'active', joined: 'May 2025', bookings: 15, color: '#dc2626' },
];

export default function AdminUsersPage() {
  const [users, setUsers]           = useState<AdminUser[]>(INIT);
  const [search, setSearch]         = useState('');
  const [page, setPage]             = useState(1);
  const [deleteTarget, setDelete]   = useState<AdminUser | null>(null);
  const pageSize = 6;

  const filtered = useMemo(() =>
    users.filter(u =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    ), [users, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage   = Math.min(page, totalPages);
  const rows       = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  function toggleBan(u: AdminUser) {
    if (u.role === 'admin') { toast.error("Cannot ban an admin account."); return; }
    setUsers(prev => prev.map(x => x.id === u.id ? { ...x, status: x.status === 'active' ? 'banned' : 'active' } : x));
    toast.success(`${u.name} has been ${u.status === 'active' ? 'banned' : 'unbanned'}.`);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    setUsers(prev => prev.filter(x => x.id !== deleteTarget.id));
    toast.error(`User "${deleteTarget.name}" deleted.`);
    setDelete(null);
  }

  return (
    <div>
      <div className="adm-page__header">
        <h1 className="adm-page__title">Users</h1>
        <p className="adm-page__sub">Manage all registered users on the platform.</p>
      </div>

      <div className="adm-card">
        <div className="adm-controls">
          <p className="adm-controls__label" style={{ margin: 0 }}>{filtered.length} total users</p>
          <div className="adm-controls__right">
            <span className="adm-controls__label">Search:</span>
            <div className="adm-search">
              <FaSearch className="adm-search__icon" />
              <input className="adm-search__input" placeholder="Name or email…" value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
          </div>
        </div>

        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead><tr>
              <th>SL.</th><th>USER</th><th>EMAIL</th><th>ROLE</th>
              <th>BOOKINGS</th><th>JOINED</th><th>STATUS</th><th>ACTION</th>
            </tr></thead>
            <tbody>
              {rows.length === 0
                ? <tr><td colSpan={8} className="adm-table__empty">No users found.</td></tr>
                : rows.map((u, i) => (
                  <tr key={u.id}>
                    <td className="adm-td--sl">{String((safePage - 1) * pageSize + i + 1).padStart(2, '0')}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="adm-avatar" style={{ background: u.color }}>
                          {u.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span style={{ fontWeight: 600, color: '#111' }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ color: '#666' }}>{u.email}</td>
                    <td><span className={`adm-badge adm-badge--${u.role}`}>{u.role}</span></td>
                    <td style={{ color: '#555', textAlign: 'center' }}>{u.bookings}</td>
                    <td style={{ color: '#aaa', fontSize: 12 }}>{u.joined}</td>
                    <td>
                      <span className={`adm-badge adm-badge--${u.status === 'active' ? 'active' : 'banned'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td>
                      <div className="adm-actions">
                        <button className="adm-btn adm-btn--gray adm-btn--icon" title="View"><FaEye /></button>
                        <button
                          className={`adm-btn adm-btn--icon ${u.status === 'active' ? 'adm-btn--orange' : 'adm-btn--green'}`}
                          title={u.status === 'active' ? 'Ban user' : 'Unban user'}
                          onClick={() => toggleBan(u)}
                        ><FaBan /></button>
                        <button className="adm-btn adm-btn--red adm-btn--icon" title="Delete"
                          onClick={() => setDelete(u)}><FaTrash /></button>
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

      {deleteTarget && (
        <div className="bk-modal-overlay" onClick={() => setDelete(null)}>
          <div className="bk-modal" onClick={e => e.stopPropagation()}>
            <button className="bk-modal__close" onClick={() => setDelete(null)}><FaTimes /></button>
            <div className="bk-modal__icon">🗑️</div>
            <h3 className="bk-modal__title">Delete User?</h3>
            <p className="bk-modal__body">You are about to permanently delete <strong>{deleteTarget.name}</strong>. This cannot be undone.</p>
            <div className="bk-modal__actions">
              <button className="bk-modal__btn bk-modal__btn--cancel" onClick={() => setDelete(null)}>Cancel</button>
              <button className="bk-modal__btn bk-modal__btn--confirm" onClick={confirmDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
