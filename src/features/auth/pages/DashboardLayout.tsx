import { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  FaTachometerAlt, FaCalendarAlt, FaHeart, FaStar,
  FaUser, FaPlus, FaSignOutAlt, FaListAlt, FaCommentDots,
  FaCog, FaChevronDown, FaChevronRight, FaCircle,
  FaWallet, FaHeadset,
} from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import './DashboardLayout.css';

const MAIN_ITEMS = [
  { to: '/dashboard',          end: true, icon: <FaTachometerAlt />, label: 'Dashboard' },
  { to: '/add-listing',                   icon: <FaPlus />,          label: 'Add Listing' },
  { to: '/dashboard/wallet',              icon: <FaWallet />,        label: 'Wallet' },
  { to: '/dashboard/messages',            icon: <FaCommentDots />,   label: 'Messages',  badge: 3 },
];

const ACCOUNT_ITEMS = [
  { to: '/dashboard/profile',  icon: <FaUser />,    label: 'Edit Profile' },
  { to: '/dashboard/settings', icon: <FaCog />,     label: 'Settings' },
  { to: '/dashboard/support',  icon: <FaHeadset />, label: 'Support' },
];

const MY_LISTING_SUB = [
  { label: 'Active',  status: 'active' },
  { label: 'Pending', status: 'pending' },
  { label: 'Expired', status: 'expired' },
];

type NavItem = { to: string; end?: boolean; icon: React.ReactNode; label: string; badge?: number };

function SidebarLink({ item }: { item: NavItem }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        `dash-sidebar__link${isActive ? ' dash-sidebar__link--active' : ''}`
      }
    >
      <span className="dash-sidebar__link-icon">{item.icon}</span>
      <span>{item.label}</span>
      {item.badge ? <span className="dash-sidebar__badge">{item.badge}</span> : null}
    </NavLink>
  );
}

export default function DashboardLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [myListingOpen, setMyListingOpen] = useState(
    location.pathname.includes('/my-listings')
  );

  const initials = user?.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() ?? 'U';

  function handleLogout() {
    logout();
    navigate('/');
  }

  const isMyListingActive = location.pathname.includes('/my-listings');

  return (
    <div className="dash-layout">
      <aside className="dash-sidebar">
        {/* User */}
        <div className="dash-sidebar__user">
          <div className="dash-sidebar__avatar">{initials}</div>
          <div className="dash-sidebar__user-info">
            <p className="dash-sidebar__name">{user?.name ?? 'Guest'}</p>
            <p className="dash-sidebar__email">{user?.email ?? ''}</p>
          </div>
        </div>

        <nav className="dash-sidebar__nav">
          {/* MAIN MENU */}
          <p className="dash-sidebar__group-label">MAIN MENU</p>
          {MAIN_ITEMS.map((item) => <SidebarLink key={item.to} item={item} />)}

          {/* LISTING */}
          <p className="dash-sidebar__group-label">LISTING</p>

          {/* My Listing — collapsible */}
          <button
            className={`dash-sidebar__link dash-sidebar__link--collapsible ${isMyListingActive ? 'dash-sidebar__link--active' : ''}`}
            onClick={() => {
              setMyListingOpen((v) => !v);
              if (!myListingOpen) navigate('/dashboard/my-listings');
            }}
          >
            <span className="dash-sidebar__link-icon"><FaListAlt /></span>
            <span>My Listing</span>
            <span className="dash-sidebar__chevron">
              {myListingOpen ? <FaChevronDown /> : <FaChevronRight />}
            </span>
          </button>

          {myListingOpen && (
            <div className="dash-sidebar__sub-menu">
              {MY_LISTING_SUB.map((s) => {
                const params = new URLSearchParams(location.search).get('status');
                const isActive = isMyListingActive && params === s.status;
                return (
                  <NavLink
                    key={s.status}
                    to={`/dashboard/my-listings?status=${s.status}`}
                    className={`dash-sidebar__sub-link ${isActive ? 'dash-sidebar__sub-link--active' : ''}`}
                  >
                    <FaCircle className="dash-sidebar__sub-dot" />
                    {s.label}
                  </NavLink>
                );
              })}
            </div>
          )}

          {/* Other listing items */}
          <SidebarLink item={{ to: '/dashboard/reviews',  icon: <FaStar />,        label: 'Reviews' }} />
          <SidebarLink item={{ to: '/dashboard/bookings', icon: <FaCalendarAlt />, label: 'Bookings' }} />
          <SidebarLink item={{ to: '/dashboard/saved',    icon: <FaHeart />,       label: 'Saved' }} />

          {/* ACCOUNT */}
          <p className="dash-sidebar__group-label">ACCOUNT</p>
          {ACCOUNT_ITEMS.map((item) => <SidebarLink key={item.to} item={item} />)}
        </nav>

        <button className="dash-sidebar__logout" onClick={handleLogout}>
          <FaSignOutAlt /> Sign Out
        </button>
      </aside>

      <main className="dash-main">
        <Outlet />
      </main>
    </div>
  );
}
