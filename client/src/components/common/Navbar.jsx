import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  Clock,
  Users,
  LogOut,
  Menu,
  X,
  Stethoscope,
  ClipboardList,
  ChevronDown,
  Activity
} from 'lucide-react';
import { RoleBadge } from './StatusBadge';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    setProfileDropdownOpen(false);
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Build role-specific navigation links
  const getNavLinks = () => {
    if (!isAuthenticated) {
      return [
        { label: 'Home', path: '/' },
        { label: 'Login', path: '/login' },
        { label: 'Register', path: '/register' }
      ];
    }

    if (user?.role === 'patient') {
      return [
        { label: 'Dashboard', path: '/patient-dashboard', icon: Activity },
        { label: 'Book Appointment', path: '/book-appointment', icon: Calendar },
        { label: 'My Appointments', path: '/my-appointments', icon: Clock }
      ];
    }

    if (user?.role === 'doctor') {
      return [
        { label: 'Doctor Dashboard', path: '/doctor-dashboard', icon: Stethoscope },
        { label: 'Appointment Requests', path: '/appointment-requests', icon: ClipboardList }
      ];
    }

    if (user?.role === 'admin') {
      return [
        { label: 'Admin Dashboard', path: '/admin-dashboard', icon: Activity },
        { label: 'Manage Users', path: '/manage-users', icon: Users },
        { label: 'All Appointments', path: '/all-appointments', icon: ClipboardList }
      ];
    }

    return [];
  };

  const navLinks = getNavLinks();

  const getDashboardPath = () => {
    if (user?.role === 'admin') return '/admin-dashboard';
    if (user?.role === 'doctor') return '/doctor-dashboard';
    return '/patient-dashboard';
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Main Navigation */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2.5 group">
              <img
                src="/logo.png"
                alt="ClinicPulse Logo"
                className="w-9 h-9 rounded-xl shadow-xs object-contain group-hover:scale-105 transition-transform"
              />
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-blue-900 group-hover:text-blue-700 transition-colors">
                  Clinic<span className="text-emerald-600">Pulse</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold -mt-1">
                  Hospital Care System
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:ml-8 md:flex md:space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? 'bg-blue-50 text-blue-800 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {Icon && (
                      <Icon
                        className={`w-4 h-4 ${
                          active ? 'text-blue-700' : 'text-slate-400'
                        }`}
                      />
                    )}
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User profile & Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative pl-3 border-l border-slate-200" ref={dropdownRef}>
                {/* Profile Circle Button Trigger */}
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-3 p-1.5 pl-3 rounded-full hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all focus:outline-none focus:ring-2 focus:ring-blue-100"
                  aria-expanded={profileDropdownOpen}
                >
                  <div className="flex flex-col text-right">
                    <span className="text-sm font-bold text-slate-800 leading-tight">
                      {user?.name}
                    </span>
                    <div className="flex justify-end mt-0.5">
                      <RoleBadge role={user?.role} />
                    </div>
                  </div>

                  {/* Circular Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-700 via-blue-600 to-emerald-600 text-white flex items-center justify-center font-extrabold text-base shadow-sm ring-2 ring-white">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>

                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      profileDropdownOpen ? 'rotate-180 text-blue-600' : ''
                    }`}
                  />
                </button>

                {/* Profile Dropdown Popup / Card */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-3 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-3">
                    {/* User Info Header */}
                    <div className="flex items-center gap-3 p-3 bg-slate-50/90 rounded-xl border border-slate-100">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-700 via-blue-600 to-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="overflow-hidden space-y-0.5">
                        <p className="font-bold text-slate-900 text-sm truncate">{user?.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        <div className="pt-0.5">
                          <RoleBadge role={user?.role} />
                        </div>
                      </div>
                    </div>

                    {/* Quick navigation link */}
                    <div className="pt-1">
                      <Link
                        to={getDashboardPath()}
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-colors"
                      >
                        <Activity className="w-4 h-4 text-blue-600" />
                        <span>
                          Go to {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''} Dashboard
                        </span>
                      </Link>
                    </div>

                    {/* Logout Button (Emergency Hospital Red Action) */}
                    <div className="border-t border-slate-100 pt-2">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4 text-red-600" />
                        <span>Log Out of ClinicPulse</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-blue-700 hover:text-blue-800 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm shadow-emerald-200 transition-all hover:shadow"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {isAuthenticated && (
            <div className="flex items-center justify-between py-2.5 px-3 mb-2 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-700 to-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{user?.name}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
              </div>
              <RoleBadge role={user?.role} />
            </div>
          )}

          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium ${
                  active ? 'bg-blue-50 text-blue-800 font-bold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {Icon && <Icon className="w-5 h-5 text-blue-600" />}
                {link.label}
              </Link>
            );
          })}

          {isAuthenticated ? (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-bold text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-5 h-5 text-red-600" />
              Log Out
            </button>
          ) : (
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-blue-700 font-semibold rounded-lg border border-slate-200"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-white bg-emerald-600 font-bold rounded-lg"
              >
                Register Account
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
