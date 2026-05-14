import { FaUsers, FaList, FaCalendarAlt, FaDollarSign, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import './AdminDashboardPage.css';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { bookingsService, listingsService, usersService } from '../../../api';
import type { ApiBooking, ApiListing, ApiUser } from '../../../api/types';

type DashboardBooking = ApiBooking & {
  listing?: { title?: string };
  guest?: { name?: string };
};

const STATUS_STYLE: Record<string, string> = {
  CONFIRMED: 'adm-badge adm-badge--approved',
  PENDING: 'adm-badge adm-badge--pending',
  CANCELLED: 'adm-badge adm-badge--banned',
};

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [listings, setListings] = useState<ApiListing[]>([]);
  const [bookings, setBookings] = useState<DashboardBooking[]>([]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      usersService.getAll(),
      listingsService.adminGetAll({ limit: 200 }).then((res) => res.data),
      bookingsService.getAll().then((rows) => rows as DashboardBooking[]),
    ])
      .then(([usersRows, listingRows, bookingRows]) => {
        setUsers(usersRows);
        setListings(listingRows);
        setBookings(bookingRows);
      })
      .catch(() => toast.error('Failed to load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = useMemo(
    () => bookings.filter((b) => b.status === 'CONFIRMED').reduce((sum, booking) => sum + booking.totalPrice, 0),
    [bookings],
  );

  const stats = [
    { icon: <FaUsers />, iconBg: '#dbeafe', iconColor: '#1d4ed8', label: 'Total Users', value: users.length.toLocaleString() },
    { icon: <FaList />, iconBg: '#dcfce7', iconColor: '#166534', label: 'Total Listings', value: listings.length.toLocaleString() },
    { icon: <FaCalendarAlt />, iconBg: '#fff3e0', iconColor: '#c2410c', label: 'Total Bookings', value: bookings.length.toLocaleString() },
    { icon: <FaDollarSign />, iconBg: '#fef9c3', iconColor: '#854d0e', label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}` },
  ];

  const recentUsers = [...users]
    .sort((a, b) => +new Date(b.createdAt ?? 0) - +new Date(a.createdAt ?? 0))
    .slice(0, 5);
  const recentBookings = [...bookings]
    .sort((a, b) => +new Date(b.createdAt ?? 0) - +new Date(a.createdAt ?? 0))
    .slice(0, 5);

  function avatarColor(id: string): string {
    const colors = ['#7c3aed', '#0284c7', '#FF4A2A', '#16a34a', '#d97706', '#9333ea', '#0891b2', '#dc2626'];
    const seed = id.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0);
    return colors[seed % colors.length] ?? '#FF4A2A';
  }

  function roleToLocal(role: ApiUser['role']): 'admin' | 'host' | 'guest' {
    if (role === 'ADMIN') return 'admin';
    if (role === 'HOST') return 'host';
    return 'guest';
  }

  return (
    <div>
      <div className="adm-page__header">
        <h1 className="adm-page__title">Admin Dashboard</h1>
        <p className="adm-page__sub">Platform-wide overview — all users, listings, and revenue.</p>
      </div>

      {/* Stats */}
      <div className="adm-stats">
        {stats.map((s, i) => (
          <div key={i} className="adm-stat-card">
            <div className="adm-stat-card__icon" style={{ background: s.iconBg, color: s.iconColor }}>
              {s.icon}
            </div>
            <div className="adm-stat-card__body">
              <p className="adm-stat-card__label">{s.label}</p>
              <p className="adm-stat-card__value">{s.value}</p>
              <span className={`adm-stat-card__change ${loading ? 'adm-stat-card__change--down' : 'adm-stat-card__change--up'}`}>
                {loading ? <FaArrowDown /> : <FaArrowUp />} {loading ? 'Loading...' : 'Live API'}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="adm-bottom">
        {/* Recent Users */}
        <div className="adm-card">
          <div className="adm-card__head">
            <h3 className="adm-card__title">Recent Users</h3>
          </div>
          <table className="adm-table">
            <thead>
              <tr>
                <th>USER</th>
                <th>EMAIL</th>
                <th>ROLE</th>
                <th>JOINED</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="adm-avatar" style={{ background: avatarColor(u.id) }}>
                        {u.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span style={{ fontWeight: 600, color: '#111' }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ color: '#888' }}>{u.email}</td>
                  <td><span className={`adm-badge adm-badge--${roleToLocal(u.role)}`}>{roleToLocal(u.role)}</span></td>
                  <td style={{ color: '#aaa', fontSize: 12 }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
              {!loading && recentUsers.length === 0 && <tr><td colSpan={4} className="adm-table__empty">No users found.</td></tr>}
            </tbody>
          </table>
        </div>

        {/* Recent Bookings */}
        <div className="adm-card">
          <div className="adm-card__head">
            <h3 className="adm-card__title">Recent Bookings</h3>
          </div>
          <table className="adm-table">
            <thead>
              <tr>
                <th>LISTING</th>
                <th>GUEST</th>
                <th>AMOUNT</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((b) => (
                <tr key={b.id}>
                  <td>
                    <p style={{ fontWeight: 600, color: '#111', margin: 0 }}>{b.listing?.title ?? '—'}</p>
                    <p style={{ fontSize: 11, color: '#aaa', margin: 0 }}>
                      {new Date(b.checkIn).toLocaleDateString()} - {new Date(b.checkOut).toLocaleDateString()}
                    </p>
                  </td>
                  <td style={{ color: '#555' }}>{b.guest?.name ?? '—'}</td>
                  <td style={{ fontWeight: 700, color: '#FF4A2A' }}>${b.totalPrice.toLocaleString()}</td>
                  <td><span className={STATUS_STYLE[b.status]}>{b.status}</span></td>
                </tr>
              ))}
              {!loading && recentBookings.length === 0 && <tr><td colSpan={4} className="adm-table__empty">No bookings found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
