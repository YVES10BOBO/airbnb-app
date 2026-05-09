import { FaUsers, FaList, FaCalendarAlt, FaDollarSign, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import './AdminDashboardPage.css';

const STATS = [
  { icon: <FaUsers />,       iconBg: '#dbeafe', iconColor: '#1d4ed8', label: 'Total Users',    value: '1,248',  change: '+12%',  up: true  },
  { icon: <FaList />,        iconBg: '#dcfce7', iconColor: '#166534', label: 'Total Listings', value: '342',    change: '+8%',   up: true  },
  { icon: <FaCalendarAlt />, iconBg: '#fff3e0', iconColor: '#c2410c', label: 'Total Bookings', value: '5,670',  change: '+23%',  up: true  },
  { icon: <FaDollarSign />,  iconBg: '#fef9c3', iconColor: '#854d0e', label: 'Total Revenue',  value: '$94,200',change: '-2%',   up: false },
];

const RECENT_USERS = [
  { id: 1, name: 'Emma Johnson',  email: 'emma@example.com',   role: 'guest', joined: 'May 8, 2026',  color: '#7c3aed' },
  { id: 2, name: 'Marcus Lee',    email: 'marcus@example.com',  role: 'host',  joined: 'May 7, 2026',  color: '#0284c7' },
  { id: 3, name: 'Sophia Patel',  email: 'sophia@example.com',  role: 'guest', joined: 'May 6, 2026',  color: '#FF4A2A' },
  { id: 4, name: 'David Kim',     email: 'david@example.com',   role: 'host',  joined: 'May 5, 2026',  color: '#16a34a' },
  { id: 5, name: 'Laila Osman',   email: 'laila@example.com',   role: 'guest', joined: 'May 4, 2026',  color: '#d97706' },
];

const RECENT_BOOKINGS = [
  { id: 1, listing: 'Luxury Beach Villa',    guest: 'Emma Johnson',  amount: '$2,250', status: 'approved',  date: 'Jun 10 – 15' },
  { id: 2, listing: 'Cozy Mountain Cabin',   guest: 'Marcus Lee',    amount: '$740',   status: 'pending',   date: 'Jul 1 – 5'   },
  { id: 3, listing: 'Modern Downtown Apt',   guest: 'Sophia Patel',  amount: '$480',   status: 'pending',   date: 'Aug 14 – 18' },
  { id: 4, listing: 'Seaside Cottage',       guest: 'David Kim',     amount: '$2,170', status: 'approved',  date: 'Aug 20 – 27' },
  { id: 5, listing: 'Alpine Ski Chalet',     guest: 'Laila Osman',   amount: '$3,200', status: 'cancelled', date: 'Sep 5 – 10'  },
];

const STATUS_STYLE: Record<string, string> = {
  approved:  'adm-badge adm-badge--approved',
  pending:   'adm-badge adm-badge--pending',
  cancelled: 'adm-badge adm-badge--banned',
};

export default function AdminDashboardPage() {
  return (
    <div>
      <div className="adm-page__header">
        <h1 className="adm-page__title">Admin Dashboard</h1>
        <p className="adm-page__sub">Platform-wide overview — all users, listings, and revenue.</p>
      </div>

      {/* Stats */}
      <div className="adm-stats">
        {STATS.map((s, i) => (
          <div key={i} className="adm-stat-card">
            <div className="adm-stat-card__icon" style={{ background: s.iconBg, color: s.iconColor }}>
              {s.icon}
            </div>
            <div className="adm-stat-card__body">
              <p className="adm-stat-card__label">{s.label}</p>
              <p className="adm-stat-card__value">{s.value}</p>
              <span className={`adm-stat-card__change ${s.up ? 'adm-stat-card__change--up' : 'adm-stat-card__change--down'}`}>
                {s.up ? <FaArrowUp /> : <FaArrowDown />} {s.change} this month
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
              {RECENT_USERS.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="adm-avatar" style={{ background: u.color }}>
                        {u.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span style={{ fontWeight: 600, color: '#111' }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ color: '#888' }}>{u.email}</td>
                  <td><span className={`adm-badge adm-badge--${u.role}`}>{u.role}</span></td>
                  <td style={{ color: '#aaa', fontSize: 12 }}>{u.joined}</td>
                </tr>
              ))}
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
              {RECENT_BOOKINGS.map(b => (
                <tr key={b.id}>
                  <td>
                    <p style={{ fontWeight: 600, color: '#111', margin: 0 }}>{b.listing}</p>
                    <p style={{ fontSize: 11, color: '#aaa', margin: 0 }}>{b.date}</p>
                  </td>
                  <td style={{ color: '#555' }}>{b.guest}</td>
                  <td style={{ fontWeight: 700, color: '#FF4A2A' }}>{b.amount}</td>
                  <td><span className={STATUS_STYLE[b.status]}>{b.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
