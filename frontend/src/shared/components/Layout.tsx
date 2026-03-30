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

  const isOnDashboard = location.pathname === '/dashboard';
  const isAdminUsers = location.pathname === '/admin/users';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-6">
              <h1 className="text-xl font-bold text-gray-900">Frisol</h1>
              {!isOnDashboard && !isAdminUsers && (
                <Link
                  to="/dashboard"
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  ← Volver al Dashboard
                </Link>
              )}
              {user?.role === 'admin' && !isAdminUsers && (
                <Link
                  to="/admin/users"
                  className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                >
                  Usuarios
                </Link>
              )}
              {isAdminUsers && (
                <Link
                  to="/dashboard"
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  ← Volver al Dashboard
                </Link>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {user?.name} ({roleLabels[user?.role || '']})
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
