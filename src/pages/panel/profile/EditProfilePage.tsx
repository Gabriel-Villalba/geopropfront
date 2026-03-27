import { ArrowLeft, BadgeCheck, Mail, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../../components';
import { useAuth } from '../../../contexts/AuthContext';
import { useOwnerPanel } from '../../../hooks/useOwnerPanel';

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const { profile, isLoading, isSavingProfile, message, loadPanel, updateProfile } = useOwnerPanel();
  const [displayName, setDisplayName]           = useState('');
  const [email, setEmail]                       = useState('');
  const [contactPhone, setContactPhone]         = useState('');
  const [password, setPassword]                 = useState('');

  useEffect(() => { void loadPanel(); }, [loadPanel]);
  useEffect(() => {
    setDisplayName(profile?.name ?? '');
    setEmail(profile?.email ?? '');
    setContactPhone(profile?.phone ?? '');
    setPassword('');
  }, [profile]);

  const handleSave = async () => {
    if (!profile) return;
    const updated = await updateProfile({
      name: displayName.trim(), email: email.trim(),
      phone: contactPhone.trim() || null,
      password: password.trim() || undefined,
    });
    if (updated) updateUser(updated);
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-surface-soft pt-16">
      <Navbar />

      <main className="mx-auto w-full max-w-2xl px-4 pb-16 sm:px-6 pt-10">
        <button type="button" onClick={() => navigate('/panel')}
          className="mb-6 inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink transition-colors font-medium">
          <ArrowLeft className="h-4 w-4" />
          Volver al panel
        </button>

        <h1 className="font-display font-bold text-2xl text-ink tracking-tight mb-1">Editar perfil</h1>
        <p className="text-sm text-ink-muted mb-8">Gestión básica del perfil.</p>

        {message && (
          <div className={`mb-6 px-4 py-3 rounded-xl text-sm border ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
              : 'bg-red-50 border-red-100 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">

            {/* Current info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-ink-muted mb-4">Información actual</h2>
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="bg-surface-soft rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-ink-muted mb-2">
                    <UserRound className="w-3.5 h-3.5" /> Nombre
                  </div>
                  <p className="text-sm font-medium text-ink">{profile?.name ?? '—'}</p>
                </div>
                <div className="bg-surface-soft rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-ink-muted mb-2">
                    <Mail className="w-3.5 h-3.5" /> Email
                  </div>
                  <p className="text-sm font-medium text-ink truncate">{profile?.email ?? '—'}</p>
                </div>
                <div className="bg-surface-soft rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-ink-muted mb-2">
                    <BadgeCheck className="w-3.5 h-3.5" /> Plan
                  </div>
                  <p className="text-sm font-medium text-ink">{profile?.plan ?? 'FREE'}</p>
                </div>
              </div>
            </div>

            {/* Edit form */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 space-y-4">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-ink-muted mb-2">Editar datos</h2>

              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-ink">Nombre para mostrar</span>
                <input value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Tu nombre visible" className="input-base" />
              </label>

              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-ink">Email de contacto</span>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com" className="input-base" />
              </label>

              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-ink">Teléfono de contacto</span>
                <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="Ej: +54 9 3492 …" className="input-base" />
              </label>

              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-ink">Nueva contraseña <span className="text-ink-faint font-normal">(opcional)</span></span>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres" className="input-base" />
              </label>
            </div>

            
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-ink-muted mb-2">Planes y suscripcion</h2>
              <p className="text-sm text-ink-muted mb-4">
                Administra tu plan, fechas y estado de suscripcion desde un lugar dedicado.
              </p>
              <button
                type="button"
                onClick={() => navigate('/panel/plans')}
                className="btn-primary w-full justify-center"
              >
                Planes y suscripcion
              </button>
            </div>
            <button type="button" onClick={handleSave} disabled={isSavingProfile}
              className="btn-primary w-full justify-center py-3 disabled:opacity-60 disabled:cursor-not-allowed">
              {isSavingProfile
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando…</>
                : 'Guardar cambios'
              }
            </button>
          </div>
        )}
      </main>
    </div>
  );
}



