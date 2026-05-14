import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  FaTachometerAlt, FaUsers, FaList, FaCalendarAlt,
  FaSignOutAlt, FaShieldAlt,
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
];

export default function AdminLayout() {
  const { logout } = useAuth();
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
