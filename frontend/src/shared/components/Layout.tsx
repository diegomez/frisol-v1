import { useAuthStore } from '../../features/auth/store/auth.store';
import { useNavigate, useLocation, Link } from 'react-router-dom';

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const roleLabels: Record<string, string> = {
    admin: 'Admin',
    csm: 'CSM',
    po: 'PO',
    dev: 'Dev',
  };

  const roleColors: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-800',
    csm: 'bg-teal-100 text-teal-800',
    po: 'bg-emerald-100 text-emerald-800',
    dev: 'bg-amber-100 text-amber-800',
  };

  const isOnDashboard = location.pathname === '/dashboard';
  const isAdminUsers = location.pathname === '/admin/users';

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/15 shadow-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left: Logo + Navigation */}
            <div className="flex items-center gap-6">
              <Link to="/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-container rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-extrabold font-headline">F</span>
                </div>
                <span className="text-lg font-extrabold font-headline text-on-surface tracking-tight hidden sm:block">
                  Frisol
                </span>
              </Link>

              {/* Navigation Links */}
              {!isOnDashboard && !isAdminUsers && (
                <Link
                  to="/dashboard"
                  className="text-sm font-body font-semibold text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Dashboard
                </Link>
              )}
              {user?.role === 'admin' && !isAdminUsers && (
                <Link
                  to="/admin/users"
                  className="text-sm font-body font-semibold text-on-surface-variant hover:text-primary transition-colors"
                >
                  Usuarios
                </Link>
              )}
              {isAdminUsers && (
                <Link
                  to="/dashboard"
                  className="text-sm font-body font-semibold text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Dashboard
                </Link>
              )}
            </div>

            {/* Right: User + Actions */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-body font-semibold text-on-surface">{user?.name}</p>
                </div>
                <div className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${roleColors[user?.role || ''] || 'bg-gray-100 text-gray-800'}`}>
                  {roleLabels[user?.role || ''] || user?.role}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all"
                title="Cerrar sesión"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
