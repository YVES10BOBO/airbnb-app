import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  FaTachometerAlt, FaCalendarAlt, FaHeart, FaStar,
  FaPlus, FaSignOutAlt, FaListAlt, FaCommentDots,
  FaCog, FaChevronDown, FaChevronRight, FaCircle,
  FaHeadset, FaPlane, FaBell, FaShieldAlt,
} from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { messagesService } from '../../../api';
import './DashboardLayout.css';

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
  const navigate  = useNavigate();
  const location  = useLocation();
  const role      = user?.role ?? 'guest';

  const [myListingOpen, setMyListingOpen] = useState(
    location.pathname.includes('/my-listings')
  );
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (!user) return;
    messagesService.getConversations()
      .then((convs) => setUnreadMessages(convs.reduce((s, c) => s + c.unreadCount, 0)))
      .catch(() => {});
  }, [user, location.pathname]);

  function handleLogout() { logout(); navigate('/'); }

  const isMyListingActive = location.pathname.includes('/my-listings');

  return (
    <div className="dash-layout">
      <aside className="dash-sidebar">
        <nav className="dash-sidebar__nav">
          {/* ── MAIN MENU (all roles) ── */}
          <p className="dash-sidebar__group-label">MAIN MENU</p>
          <SidebarLink item={{ to: '/dashboard', end: true, icon: <FaTachometerAlt />, label: 'Dashboard' }} />
          <SidebarLink item={{ to: '/dashboard/messages', icon: <FaCommentDots />, label: 'Messages', badge: unreadMessages || undefined }} />
          <SidebarLink item={{ to: '/dashboard/notifications', icon: <FaBell />,        label: 'Notifications' }} />

          {/* ── HOST-only: Add Listing + My Listings ── */}
          {role === 'host' && (
            <>
              <p className="dash-sidebar__group-label">LISTINGS</p>
              <SidebarLink item={{ to: '/add-listing', icon: <FaPlus />, label: 'Add Listing' }} />

              {/* My Listing — collapsible */}
              <button
                className={`dash-sidebar__link dash-sidebar__link--collapsible ${isMyListingActive ? 'dash-sidebar__link--active' : ''}`}
                onClick={() => {
                  setMyListingOpen((v) => !v);
                  if (!myListingOpen) navigate('/dashboard/my-listings');
                }}
              >
                <span className="dash-sidebar__link-icon"><FaListAlt /></span>
                <span>My Listings</span>
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

              <SidebarLink item={{ to: '/dashboard/reviews',  icon: <FaStar />,        label: 'Reviews' }} />
              <SidebarLink item={{ to: '/dashboard/bookings', icon: <FaCalendarAlt />, label: 'Bookings' }} />
            </>
          )}

          {/* ── GUEST-only ── */}
          {role === 'guest' && (
            <>
              <p className="dash-sidebar__group-label">MY ACTIVITY</p>
              <SidebarLink item={{ to: '/dashboard/trips',    icon: <FaPlane />,       label: 'My Trips' }} />
              <SidebarLink item={{ to: '/dashboard/bookings', icon: <FaCalendarAlt />, label: 'Bookings' }} />
              <SidebarLink item={{ to: '/dashboard/saved',    icon: <FaHeart />,       label: 'Saved' }} />
            </>
          )}

          {/* ── ADMIN shortcut ── */}
          {role === 'admin' && (
            <>
              <p className="dash-sidebar__group-label">ADMIN</p>
              <SidebarLink item={{ to: '/admin', icon: <FaShieldAlt />, label: 'Admin Panel' }} />
            </>
          )}

          {/* ── ACCOUNT (all roles) ── */}
          <p className="dash-sidebar__group-label">ACCOUNT</p>
          <SidebarLink item={{ to: '/dashboard/settings', icon: <FaCog />,     label: 'Settings' }} />
          <SidebarLink item={{ to: '/dashboard/support',  icon: <FaHeadset />, label: 'Support' }} />
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
