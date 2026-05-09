import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  FaTachometerAlt, FaUsers, FaList, FaCalendarAlt,
  FaStar, FaSignOutAlt, FaShieldAlt,
} from 'react-icons/fa';
import { useAuth } from '../../auth/hooks/useAuth';
import './AdminLayout.css';

const NAV = [
  { label: 'OVERVIEW' },
  { to: '/admin',          end: true, icon: <FaTachometerAlt />, text: 'Dashboard'    },
  { label: 'MANAGE' },
  { to: '/admin/users',              icon: <FaUsers />,         text: 'Users'         },
  { to: '/admin/listings',           icon: <FaList />,          text: 'Listings'      },
  { to: '/admin/bookings',           icon: <FaCalendarAlt />,   text: 'Bookings'      },
  { to: '/admin/reviews',            icon: <FaStar />,          text: 'Reviews'       },
];

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  function handleLogout() { logout(); navigate('/'); }

  return (
    <div className="adm-layout">
      <aside className="adm-sidebar">
        {/* Brand */}
        <div className="adm-sidebar__brand">
          <FaShieldAlt className="adm-sidebar__brand-icon" />
          <div>
            <p className="adm-sidebar__brand-name">Admin Panel</p>
            <p className="adm-sidebar__brand-sub">Liston Platform</p>
          </div>
        </div>

        {/* Admin identity */}
        <div className="adm-sidebar__user">
          <div className="adm-sidebar__avatar">
            {user?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </div>
          <div className="adm-sidebar__user-info">
            <p className="adm-sidebar__user-name">{user?.name}</p>
            <span className="adm-sidebar__role-badge">Administrator</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="adm-sidebar__nav">
          {NAV.map((item, i) =>
            'label' in item ? (
              <p key={i} className="adm-sidebar__group">{item.label}</p>
            ) : (
              <NavLink
                key={item.to}
                to={item.to!}
                end={item.end}
                className={({ isActive }) =>
                  `adm-sidebar__link${isActive ? ' adm-sidebar__link--active' : ''}`
                }
              >
                <span className="adm-sidebar__link-icon">{item.icon}</span>
                {item.text}
              </NavLink>
            )
          )}
        </nav>

        <button className="adm-sidebar__logout" onClick={handleLogout}>
          <FaSignOutAlt /> Sign Out
        </button>
      </aside>

      <main className="adm-main">
        <Outlet />
      </main>
    </div>
  );
}
