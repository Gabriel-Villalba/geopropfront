import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, AlertCircle, UserRound, Eye, EyeOff, ArrowRight } from 'lucide-react';
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
  const redirect = searchParams.get('redirect');

  useEffect(() => {
    const resetStatus = searchParams.get('reset');
    if (resetStatus === 'success') {
      setInfo('Contraseña actualizada. Iniciá sesión con tu nueva contraseña.');
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
        navigate(redirect || '/dashboard');
      } else if (mode === 'register') {
        await register({ name: normalizedName, email: normalizedEmail, password: normalizedPassword, clientName: normalizedName, role: 'agent' });
        navigate(redirect || '/dashboard');
      } else {
        await authApi.forgotPassword(normalizedEmail);
        setInfo('Revisá tu correo si la cuenta existe.');
      }
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  };

  const setModeSafe = (nextMode: AuthMode) => { setMode(nextMode); setError(''); setInfo(''); };

  const modeConfig = {
    login:    { title: 'Bienvenido de vuelta', subtitle: 'Ingresá a tu cuenta GeoProp', cta: 'Iniciar sesión' },
    register: { title: 'Crear cuenta',          subtitle: 'Unite a GeoProp hoy',         cta: 'Crear cuenta' },
    forgot:   { title: 'Recuperar contraseña',  subtitle: 'Te enviamos un enlace por email', cta: 'Enviar enlace' },
  };

  const cfg = modeConfig[mode];

  return (
    <div className="min-h-screen bg-surface-soft flex">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-ink flex-col justify-between p-12">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L2 6v8h4v-4h4v4h4V6L8 1z" fill="white"/>
            </svg>
          </div>
          <span className="font-display font-bold text-lg text-white notranslate">GeoProp</span>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="w-12 h-1 bg-brand-500 rounded-full" />
            <h2 className="font-display font-bold text-4xl text-white leading-tight">
              El mapa de tu<br />futura propiedad.
            </h2>
            <p className="text-gray-400 text-base leading-relaxed max-w-sm">
              Explorá cientos de inmuebles, detectá oportunidades por debajo del valor de mercado y tomá decisiones con datos reales.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Propiedades', value: '500+' },
              { label: 'Inmobiliarias', value: '20+' },
              { label: 'Ciudades', value: '50+' },
              { label: 'Oportunidades/día', value: '15+' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="font-display font-bold text-2xl text-white">{stat.value}</p>
                <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-600">© {new Date().getFullYear()} GeoProp</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-8">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-7 h-7 rounded-xl bg-brand-500 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L2 6v8h4v-4h4v4h4V6L8 1z" fill="white"/>
              </svg>
            </div>
            <span className="font-display font-bold text-base text-ink notranslate">GeoProp</span>
          </div>

          <div>
            <h1 className="font-display font-bold text-2xl text-ink tracking-tight">{cfg.title}</h1>
            <p className="text-ink-muted text-sm mt-1">{cfg.subtitle}</p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="flex items-start gap-3 p-3.5 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}
          {info && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-700">
              {info}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-ink">Nombre</label>
                <div className="relative">
                  <UserRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
                  <input id="name" required value={name} onChange={(e) => setName(e.target.value)}
                    className="input-base pl-10" placeholder="Tu nombre" />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-ink">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
                <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="input-base pl-10" placeholder="vos@ejemplo.com" />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-ink">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
                  <input id="password" type={showPassword ? 'text' : 'password'} required value={password}
                    onChange={(e) => setPassword(e.target.value)} className="input-base pl-10 pr-10" placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink-muted transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'login' && (
              <div className="flex justify-end">
                <button type="button" onClick={() => setModeSafe('forgot')}
                  className="text-xs text-brand-600 hover:text-brand-700 font-medium">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            )}

            <button type="submit" disabled={isLoading}
              className="w-full btn-primary py-3 justify-center disabled:opacity-60 disabled:cursor-not-allowed mt-2">
              {isLoading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><span>{cfg.cta}</span><ArrowRight className="w-4 h-4" /></>
              }
            </button>
          </form>

          <div className="text-center space-y-2">
            {mode === 'forgot' ? (
              <button type="button" onClick={() => setModeSafe('login')}
                className="text-sm text-ink-muted hover:text-ink transition-colors">
                ← Volver a iniciar sesión
              </button>
            ) : (
              <button type="button" onClick={() => setModeSafe(mode === 'login' ? 'register' : 'login')}
                className="text-sm text-ink-muted hover:text-ink transition-colors">
                {mode === 'login' ? '¿No tenés cuenta? ' : '¿Ya tenés cuenta? '}
                <span className="text-brand-600 font-medium">
                  {mode === 'login' ? 'Registrate' : 'Iniciá sesión'}
                </span>
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
