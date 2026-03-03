import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Building2, LogIn, LogOut, MapPin, Phone, Users } from 'lucide-react';

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/dashboard');
  };
  const handleGoHome = () => {
    navigate('/dashboard');
  };
  const handleGoUsers = () => {
    navigate('/users');
  };
  const handleGoLogin = () => {
    navigate('/login');
  };

  const roleValue = (user as { role?: unknown } | null)?.role;
  const normalizedRole =
    typeof roleValue === 'string'
      ? roleValue
      : roleValue && typeof roleValue === 'object' && 'name' in roleValue
        ? String((roleValue as { name?: string }).name ?? '')
        : String(user?.roleId ?? '');

  const isAdmin = normalizedRole.toLowerCase() === 'admin';

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-orange-600 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

       <div className="flex items-center justify-between py-3">

          {/* Logo */}
         <button
            onClick={handleGoHome}
            className="flex items-center space-x-2 hover:opacity-90 transition-opacity"
          >
            <Building2 className="w-6 h-6 text-white" />
            <span className="text-xl font-semibold text-white notranslate">
              GeoProp
            </span>
          </button>


          {/* Franja central redondeada */}
         <div className="hidden sm:block flex-1 sm:mx-6">
            <div className="bg-orange-400 px-4 py-2 rounded-full flex items-center justify-center sm:justify-between text-sm text-white shadow-inner">

              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Rafaela, Santa Fe</span>
              </div>

              <a
                href="https://wa.me/549XXXXXXXXXX"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
              >
                <Phone className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>

            </div>
          </div>

          {/* Usuario */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <button
                    onClick={handleGoUsers}
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white hover:opacity-80 transition-opacity"
                  >
                    <Users className="w-4 h-4" />
                    <span className="hidden sm:inline">Usuarios</span>
                  </button>
                )}
                <span className="text-sm text-white hidden sm:block">
                  {user?.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white hover:opacity-80 transition-opacity"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleGoLogin}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white hover:opacity-80 transition-opacity"
              >
                <LogIn className="w-4 h-4" />
                <span>Iniciar sesion</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}
