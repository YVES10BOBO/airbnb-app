import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FaHeart, FaUserCircle, FaMoon, FaSun, FaPlus,
  FaSignOutAlt, FaSignInAlt, FaBars, FaTimes,
  FaTachometerAlt, FaCalendarAlt, FaBookmark, FaUser, FaShieldAlt,
} from 'react-icons/fa';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useStore } from '../../store/StoreContext';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { state } = useStore();
  const navigate = useNavigate();
  const [dark, setDark] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const t = e.target as Element;
      if (!t.closest('.nav-user-wrap')) setUserMenuOpen(false);
      if (!t.closest('.nav-mobile-wrap')) setMobileOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function toggleDark() {
    setDark(v => !v);
    document.documentElement.classList.toggle('dark');
  }

  function handleLogout() {
    logout();
    setUserMenuOpen(false);
    setMobileOpen(false);
    navigate('/');
  }

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 no-underline whitespace-nowrap ${
      isActive ? 'text-primary font-bold bg-primary/8' : 'text-gray-600 hover:text-primary hover:bg-primary/5'
    }`;

  const initials = user?.name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-6">

        {/* ── Logo ── */}
        <NavLink to="/" className="text-xl font-extrabold text-gray-900 tracking-tight shrink-0 no-underline">
          List<span className="text-primary italic">On.</span>
        </NavLink>

        {/* ── Center nav links (desktop) ── */}
        <nav className="hidden lg:flex items-center gap-1 flex-1">
          <NavLink to="/" end className={linkCls}>Home</NavLink>
          <NavLink to="/explore" className={linkCls}>Explore</NavLink>
          <NavLink to="/listings" className={linkCls}>Listings</NavLink>
          <NavLink to="/about" className={linkCls}>About</NavLink>
        </nav>

        {/* ── Right side (desktop) ── */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">

          {/* Dark mode */}
          <button
            onClick={toggleDark}
            title="Toggle dark mode"
            className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-primary transition-all border-none bg-transparent cursor-pointer text-base"
          >
            {dark ? <FaSun /> : <FaMoon />}
          </button>

          {/* Saved heart */}
          <NavLink
            to="/dashboard/saved"
            className="relative w-9 h-9 rounded-full flex items-center justify-center text-primary hover:bg-red-50 transition-all no-underline text-base"
          >
            <FaHeart />
            {state.saved.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[10px] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center px-0.5 leading-none">
                {state.saved.length}
              </span>
            )}
          </NavLink>

          {/* Avatar dropdown */}
          <div className="nav-user-wrap relative">
            <button
              onClick={() => setUserMenuOpen(v => !v)}
              className="flex items-center gap-2 border border-gray-200 rounded-full pl-3 pr-2 py-1.5 hover:shadow-md transition-all bg-white cursor-pointer"
            >
              <FaBars className="text-gray-500 text-sm" />
              {isAuthenticated && user ? (
                <span className="w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                  {initials}
                </span>
              ) : (
                <FaUserCircle className="text-gray-400 text-2xl" />
              )}
            </button>

            {userMenuOpen && (
              <div className="absolute top-[calc(100%+10px)] right-0 bg-white border border-gray-100 rounded-2xl shadow-2xl w-56 overflow-hidden z-50 py-1">
                {isAuthenticated ? (
                  <>
                    <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      {user?.name}
                    </p>
                    <div className="border-t border-gray-100 my-1" />
                    {user?.role === 'admin' && (
                      <NavLink to="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-orange-600 hover:bg-orange-50 no-underline transition-colors" onClick={() => setUserMenuOpen(false)}>
                        <FaShieldAlt className="text-xs" /> Admin Panel
                      </NavLink>
                    )}
                    <NavLink to="/dashboard" end className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary no-underline transition-colors" onClick={() => setUserMenuOpen(false)}>
                      <FaTachometerAlt className="text-gray-400 text-xs" /> My Dashboard
                    </NavLink>
                    <NavLink to="/dashboard/bookings" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary no-underline transition-colors" onClick={() => setUserMenuOpen(false)}>
                      <FaCalendarAlt className="text-gray-400 text-xs" /> My Bookings
                    </NavLink>
                    <NavLink to="/dashboard/saved" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary no-underline transition-colors" onClick={() => setUserMenuOpen(false)}>
                      <FaBookmark className="text-gray-400 text-xs" /> Saved Listings
                    </NavLink>
                    <NavLink to="/dashboard/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary no-underline transition-colors" onClick={() => setUserMenuOpen(false)}>
                      <FaUser className="text-gray-400 text-xs" /> Edit Profile
                    </NavLink>
                    <div className="border-t border-gray-100 my-1" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-primary w-full bg-transparent border-none cursor-pointer font-sans transition-colors"
                    >
                      <FaSignOutAlt className="text-gray-400 text-xs" /> Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <NavLink to="/signup" className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50 no-underline transition-colors" onClick={() => setUserMenuOpen(false)}>
                      Sign Up
                    </NavLink>
                    <NavLink to="/login" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary no-underline transition-colors" onClick={() => setUserMenuOpen(false)}>
                      <FaSignInAlt className="text-gray-400 text-xs" /> Sign In
                    </NavLink>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Add Listing */}
          <NavLink
            to="/add-listing"
            className="flex items-center gap-2 bg-primary text-white no-underline px-4 py-2 rounded-full text-sm font-semibold hover:bg-primary-dark transition-all whitespace-nowrap shadow-sm"
          >
            <FaPlus className="text-xs" /> Add Listing
          </NavLink>
        </div>

        {/* ── Mobile right ── */}
        <div className="flex lg:hidden items-center gap-2 ml-auto">
          <NavLink to="/dashboard/saved" className="relative w-9 h-9 rounded-full flex items-center justify-center text-primary no-underline text-base">
            <FaHeart />
            {state.saved.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[10px] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center px-0.5 leading-none">
                {state.saved.length}
              </span>
            )}
          </NavLink>

          <div className="nav-mobile-wrap relative">
            <button
              onClick={() => setMobileOpen(v => !v)}
              className="flex items-center gap-2 border border-gray-200 rounded-full pl-3 pr-2 py-1.5 hover:shadow-md transition-all bg-white cursor-pointer"
            >
              {mobileOpen ? <FaTimes className="text-gray-500 text-sm" /> : <FaBars className="text-gray-500 text-sm" />}
              {isAuthenticated && user ? (
                <span className="w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                  {initials}
                </span>
              ) : (
                <FaUserCircle className="text-gray-400 text-2xl" />
              )}
            </button>

            {mobileOpen && (
              <div className="absolute top-[calc(100%+10px)] right-0 bg-white border border-gray-100 rounded-2xl shadow-2xl w-72 overflow-hidden z-50">
                {/* Nav links */}
                <div className="p-3 border-b border-gray-100">
                  <NavLink to="/" end className="block py-2.5 px-3 text-sm font-medium text-gray-800 hover:text-primary hover:bg-gray-50 rounded-lg no-underline transition-colors" onClick={() => setMobileOpen(false)}>Home</NavLink>
                  <NavLink to="/explore" className="block py-2.5 px-3 text-sm font-medium text-gray-800 hover:text-primary hover:bg-gray-50 rounded-lg no-underline transition-colors" onClick={() => setMobileOpen(false)}>Explore</NavLink>
                  <NavLink to="/listings" className="block py-2.5 px-3 text-sm font-medium text-gray-800 hover:text-primary hover:bg-gray-50 rounded-lg no-underline transition-colors" onClick={() => setMobileOpen(false)}>Listings</NavLink>
                  <NavLink to="/about" className="block py-2.5 px-3 text-sm font-medium text-gray-800 hover:text-primary hover:bg-gray-50 rounded-lg no-underline transition-colors" onClick={() => setMobileOpen(false)}>About</NavLink>
                </div>

                {/* Account links */}
                {isAuthenticated ? (
                  <div className="p-3 border-b border-gray-100">
                    <p className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{user?.name}</p>
                    {user?.role === 'admin' && (
                      <NavLink to="/admin" className="flex items-center gap-3 py-2.5 px-3 text-sm font-semibold text-orange-600 hover:bg-orange-50 rounded-lg no-underline transition-colors" onClick={() => setMobileOpen(false)}><FaShieldAlt className="text-xs" /> Admin Panel</NavLink>
                    )}
                    <NavLink to="/dashboard" className="flex items-center gap-3 py-2.5 px-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary rounded-lg no-underline transition-colors" onClick={() => setMobileOpen(false)}><FaTachometerAlt className="text-xs text-gray-400" /> Dashboard</NavLink>
                    <NavLink to="/dashboard/bookings" className="flex items-center gap-3 py-2.5 px-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary rounded-lg no-underline transition-colors" onClick={() => setMobileOpen(false)}><FaCalendarAlt className="text-xs text-gray-400" /> My Bookings</NavLink>
                    <NavLink to="/dashboard/saved" className="flex items-center gap-3 py-2.5 px-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary rounded-lg no-underline transition-colors" onClick={() => setMobileOpen(false)}><FaBookmark className="text-xs text-gray-400" /> Saved</NavLink>
                    <NavLink to="/dashboard/profile" className="flex items-center gap-3 py-2.5 px-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary rounded-lg no-underline transition-colors" onClick={() => setMobileOpen(false)}><FaUser className="text-xs text-gray-400" /> Edit Profile</NavLink>
                  </div>
                ) : null}

                {/* Actions */}
                <div className="p-3 flex flex-col gap-2">
                  <NavLink to="/add-listing" className="flex items-center justify-center gap-2 bg-primary text-white no-underline py-2.5 rounded-full text-sm font-semibold hover:bg-primary-dark transition-all" onClick={() => setMobileOpen(false)}>
                    <FaPlus className="text-xs" /> Add Listing
                  </NavLink>
                  {isAuthenticated ? (
                    <button onClick={handleLogout} className="flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold text-gray-600 bg-gray-100 border-none cursor-pointer font-sans hover:bg-gray-200 transition-all">
                      <FaSignOutAlt className="text-xs" /> Sign Out
                    </button>
                  ) : (
                    <NavLink to="/login" className="flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold text-gray-700 bg-gray-100 no-underline hover:bg-gray-200 transition-all" onClick={() => setMobileOpen(false)}>
                      <FaSignInAlt className="text-xs" /> Sign In
                    </NavLink>
                  )}
                  <button onClick={() => { toggleDark(); }} className="flex items-center justify-center gap-2 py-2 text-sm text-gray-500 bg-transparent border-none cursor-pointer font-sans">
                    {dark ? <><FaSun className="text-xs" /> Light mode</> : <><FaMoon className="text-xs" /> Dark mode</>}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}
