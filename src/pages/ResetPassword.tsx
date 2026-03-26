import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react';
import { authApi } from '../services/api';
import { getApiErrorMessage } from '../services/backend';

export function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (password !== confirm) { setError('Las contraseñas no coinciden.'); return; }
    if (password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres.'); return; }
    setIsLoading(true);
    try {
      await authApi.resetPassword(token, password.trim());
      setSuccess(true);
      setTimeout(() => navigate('/login?reset=success'), 2500);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-soft flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L2 6v8h4v-4h4v4h4V6L8 1z" fill="white"/>
            </svg>
          </div>
          <span className="font-display font-bold text-lg text-ink notranslate">GeoProp</span>
        </div>

        {success ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-7 h-7 text-emerald-500" />
            </div>
            <h2 className="font-display font-bold text-xl text-ink">¡Contraseña actualizada!</h2>
            <p className="text-sm text-ink-muted mt-2">Redirigiendo al inicio de sesión…</p>
          </div>
        ) : (
          <>
            <h1 className="font-display font-bold text-2xl text-ink tracking-tight mb-1">Nueva contraseña</h1>
            <p className="text-sm text-ink-muted mb-8">Ingresá y confirmá tu nueva contraseña.</p>

            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-ink">Nueva contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
                  <input type={showPassword ? 'text' : 'password'} required value={password}
                    onChange={(e) => setPassword(e.target.value)} className="input-base pl-10 pr-10" placeholder="Mínimo 8 caracteres" />
                  <button type="button" onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink-muted">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-ink">Confirmar contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
                  <input type={showPassword ? 'text' : 'password'} required value={confirm}
                    onChange={(e) => setConfirm(e.target.value)} className="input-base pl-10" placeholder="Repetí la contraseña" />
                </div>
              </div>

              <button type="submit" disabled={isLoading} className="w-full btn-primary py-3 justify-center mt-2 disabled:opacity-60">
                {isLoading
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><span>Actualizar contraseña</span><ArrowRight className="w-4 h-4" /></>
                }
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
