import { ArrowLeft, BadgeCheck, Mail, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../../components';
import { useOwnerPanel } from '../../../hooks/useOwnerPanel';

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { profile, isLoading, message, loadPanel } = useOwnerPanel();
  const [displayName, setDisplayName] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  useEffect(() => {
    void loadPanel();
  }, [loadPanel]);

  useEffect(() => {
    setDisplayName(profile?.name ?? '');
    setContactPhone('');
  }, [profile]);

  const handleSave = () => {
    console.log('Perfil actualizado (simulado):', {
      displayName: displayName.trim(),
      contactPhone: contactPhone.trim(),
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20 sm:pt-24">
      <Navbar />

      <main className="mx-auto w-full max-w-3xl px-4 pb-10 sm:px-6">
        <button
          type="button"
          onClick={() => navigate('/panel')}
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al panel
        </button>

        <section className=" border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">Editar perfil</h1>
          <p className="mt-1 text-sm text-slate-600">Gestion basica del perfil y plan de la cuenta.</p>

          {message && (
            <div
              className={`mt-4 border px-4 py-3 text-sm ${
                message.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-rose-200 bg-rose-50 text-rose-700'
              }`}
            >
              {message.text}
            </div>
          )}

          {isLoading ? (
            <p className="mt-6 text-sm text-slate-600">Cargando perfil...</p>
          ) : (
            <>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className=" border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <UserRound className="h-4 w-4" />
                    Nombre actual
                  </div>
                  <p className="mt-2 text-sm text-slate-900">{profile?.name ?? 'No disponible'}</p>
                </div>
                <div className=" border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Mail className="h-4 w-4" />
                    Email
                  </div>
                  <p className="mt-2 text-sm text-slate-900">{profile?.email ?? 'No disponible'}</p>
                </div>
                <div className=" border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <BadgeCheck className="h-4 w-4" />
                    Plan
                  </div>
                  <p className="mt-2 text-sm text-slate-900">{profile?.plan ?? 'FREE'}</p>
                </div>
              </div>

              <div className="mt-6 grid gap-4">
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-700">Nombre para mostrar</span>
                  <input
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    placeholder="Tu nombre visible"
                    className=" border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-700">Telefono de contacto</span>
                  <input
                    value={contactPhone}
                    onChange={(event) => setContactPhone(event.target.value)}
                    placeholder="Ej: +54 9 3492 ..."
                    className=" border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500"
                  />
                </label>

                <button
                  type="button"
                  onClick={handleSave}
                  className="mt-2 w-full  bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 sm:w-auto"
                >
                  Guardar cambios (simulado)
                </button>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
