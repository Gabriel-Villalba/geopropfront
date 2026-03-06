import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Building2, Mail, Lock, AlertCircle, UserRound, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../services/api';
import { getApiErrorMessage } from '../services/backend';

type AuthMode = 'login' | 'register' | 'forgot';

export function Login() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const resetStatus = searchParams.get('reset');
    if (resetStatus === 'success') {
      setInfo('Contrasena actualizada. Inicia sesion con tu nueva contrasena.');
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setInfo('');
    setIsLoading(true);

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();
    const normalizedName = name.trim();

    try {
      if (mode === 'login') {
        await login({ email: normalizedEmail, password: normalizedPassword });
        navigate('/dashboard');
      } else if (mode === 'register') {
        await register({
          name: normalizedName,
          email: normalizedEmail,
          password: normalizedPassword,
          clientName: normalizedName,
          role: 'agent',
        });
        navigate('/dashboard');
      } else {
        await authApi.forgotPassword(normalizedEmail);
        setInfo('Revisa tu correo si la cuenta existe.');
      }
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  };

  const setModeSafe = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError('');
    setInfo('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-gray-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-orange-500 p-3 ">
              <Building2 className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">GeoProp</h2>
          <p className="mt-2 text-sm text-gray-600">
            Busqueda de propiedades estrategicas para operaciones, logistica y bases de trabajo.
          </p>
        </div>

        <div className="bg-white shadow-lg border border-orange-500 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <span className="text-sm text-red-800">{error}</span>
              </div>
            )}

            {info && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <span className="text-sm text-emerald-800">{info}</span>
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserRound className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    required
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                    placeholder="Tu nombre"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Contrasena
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="block w-full pl-10 pr-12 py-3 border border-gray-300  focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                    placeholder="********"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((previous) => !previous)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    aria-label={showPassword ? 'Ocultar clave' : 'Mostrar clave'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4  shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : mode === 'login' ? (
                'Iniciar sesion'
              ) : mode === 'register' ? (
                'Crear cuenta'
              ) : (
                'Enviar enlace de recuperacion'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            {mode === 'login' && (
              <button
                type="button"
                onClick={() => setModeSafe('forgot')}
                className="block mx-auto text-xs text-orange-700 hover:text-orange-800 underline"
              >
                Olvide mi contrasena
              </button>
            )}

            {mode !== 'forgot' ? (
              <button
                type="button"
                onClick={() => setModeSafe(mode === 'login' ? 'register' : 'login')}
                className="mt-2 text-xs text-orange-700 hover:text-orange-800 underline"
              >
                {mode === 'login' ? 'No tienes cuenta? Crear cuenta' : 'Ya tienes cuenta? Iniciar sesion'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setModeSafe('login')}
                className="mt-2 text-xs text-orange-700 hover:text-orange-800 underline"
              >
                Volver a iniciar sesion
              </button>
            )}

            <p className="mt-2 text-xs text-gray-500">Usa tus credenciales reales del backend.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
