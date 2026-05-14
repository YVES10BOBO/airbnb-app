import { useEffect, useMemo, useState } from 'react';
import { FaSearch, FaChevronLeft, FaChevronRight, FaBan, FaTrash, FaEye, FaTimes, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { usersService } from '../../../api';
import type { ApiUser } from '../../../api/types';

type UserRole = 'admin' | 'host' | 'guest';

function roleToLocal(role: ApiUser['role']): UserRole {
  if (role === 'ADMIN') return 'admin';
  if (role === 'HOST') return 'host';
  return 'guest';
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [search, setSearch]         = useState('');
  const [page, setPage]             = useState(1);
  const [deleteTarget, setDelete]   = useState<ApiUser | null>(null);
  const pageSize = 6;
  function avatarColor(id: string): string {
    const colors = ['#FF4A2A', '#7c3aed', '#0284c7', '#16a34a', '#d97706', '#9333ea', '#0891b2', '#dc2626'];
    const seed = id.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0);
    return colors[seed % colors.length] ?? '#FF4A2A';
  }


  useEffect(() => {
    setLoading(true);
    usersService.getAll()
      .then((rows) => setUsers(rows))
      .catch(() => toast.error('Failed to load users.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => users.filter((u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    ), [users, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage   = Math.min(page, totalPages);
  const rows       = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  function toggleBan(u: ApiUser) {
    if (u.role === 'ADMIN') { toast.error('Cannot ban an admin account.'); return; }
    toast('Ban/unban API is not implemented yet in backend.', { icon: 'ℹ️' });
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setBusyId(deleteTarget.id);
    try {
      await usersService.remove(deleteTarget.id);
      setUsers((prev) => prev.filter((x) => x.id !== deleteTarget.id));
      toast.success(`User "${deleteTarget.name}" deleted.`);
      setDelete(null);
    } catch {
      toast.error('Failed to delete user.');
    } finally {
      setBusyId(null);
    }
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
              {loading
                ? <tr><td colSpan={8} className="adm-table__empty"><FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> Loading users...</td></tr>
                : rows.length === 0
                ? <tr><td colSpan={8} className="adm-table__empty">No users found.</td></tr>
                : rows.map((u, i) => (
                  <tr key={u.id}>
                    <td className="adm-td--sl">{String((safePage - 1) * pageSize + i + 1).padStart(2, '0')}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="adm-avatar" style={{ background: avatarColor(u.id) }}>
                          {u.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span style={{ fontWeight: 600, color: '#111' }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ color: '#666' }}>{u.email}</td>
                    <td><span className={`adm-badge adm-badge--${roleToLocal(u.role)}`}>{roleToLocal(u.role)}</span></td>
                    <td style={{ color: '#555', textAlign: 'center' }}>—</td>
                    <td style={{ color: '#aaa', fontSize: 12 }}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <span className="adm-badge adm-badge--active">
                        active
                      </span>
                    </td>
                    <td>
                      <div className="adm-actions">
                        <button className="adm-btn adm-btn--gray adm-btn--icon" title="View"><FaEye /></button>
                        <button
                          className="adm-btn adm-btn--icon adm-btn--orange"
                          title="Ban user"
                          onClick={() => toggleBan(u)}
                        ><FaBan /></button>
                        <button className="adm-btn adm-btn--red adm-btn--icon" title="Delete"
                          disabled={busyId === u.id}
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
            <div className="bk-modal__icon"><FaTrash /></div>
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
