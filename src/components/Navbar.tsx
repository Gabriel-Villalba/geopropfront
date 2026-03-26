import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, LogOut, Users, LayoutDashboard } from 'lucide-react';

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/dashboard');
  };

  const roleValue = (user as { role?: unknown } | null)?.role;
  const normalizedRole =
    typeof roleValue === 'string'
      ? roleValue
      : roleValue && typeof roleValue === 'object' && 'name' in roleValue
        ? String((roleValue as { name?: string }).name ?? '')
        : String(user?.roleId ?? '');

  const isAdmin = normalizedRole.toLowerCase() === 'admin';

  const getInitials = (name?: string) => {
    if (!name) return '';
    const parts = name.trim().split(' ');
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center shadow-sm group-hover:bg-brand-600 transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-white">
                <path d="M8 1L2 6v8h4v-4h4v4h4V6L8 1z" fill="currentColor"/>
              </svg>
            </div>
            <span className="font-display font-bold text-lg text-ink tracking-tight notranslate">
              GeoProp
            </span>
          </button>

          {/* Right side */}
          <div className="flex items-center gap-1">
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <button onClick={() => navigate('/users')} className="btn-ghost">
                    <Users className="w-4 h-4" />
                    <span className="hidden sm:inline">Usuarios</span>
                  </button>
                )}

                <button onClick={() => navigate('/panel')} className="btn-ghost" title="Mi panel">
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">Panel</span>
                </button>

                <button
                  onClick={() => navigate('/panel')}
                  title={user?.name}
                  className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-xs font-bold text-white hover:bg-brand-600 transition-colors ml-1"
                >
                  {getInitials(user?.name)}
                </button>

                <button onClick={handleLogout} className="btn-ghost ml-1" title="Cerrar sesión">
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm">Salir</span>
                </button>
              </>
            ) : (
              <button onClick={() => navigate('/login')} className="btn-primary">
                <LogIn className="w-4 h-4" />
                Iniciar sesión
              </button>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}
