import { ArrowLeft, Plus } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../../components';
import { useAuth } from '../../../contexts/AuthContext';
import { useOwnerPanel } from '../../../hooks/useOwnerPanel';

function statusBadge(status: 'pending' | 'approved' | 'rejected'): string {
  if (status === 'approved') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (status === 'pending') return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-rose-50 text-rose-700 border-rose-200';
}

export default function MyPropertiesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    profile,
    myProperties,
    isLoading,
    message,
    loadPanel,
    activateProperty,
    deactivateProperty,
    approveProperty,
    deleteProperty,
    deletePropertyImage,
  } = useOwnerPanel();

  useEffect(() => {
    void loadPanel();
  }, [loadPanel]);

  const isAdmin = useMemo(() => {
    const role = (profile?.role ?? user?.role ?? '').toLowerCase();
    return role === 'admin';
  }, [profile?.role, user?.role]);

  return (
    <div className="min-h-screen bg-slate-50 pt-20 sm:pt-24">
      <Navbar />

      <main className="mx-auto w-full max-w-5xl px-4 pb-10 sm:px-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate('/panel')}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al panel
          </button>

          <button
            type="button"
            onClick={() => navigate('/panel/properties/create')}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Nueva publicacion
          </button>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">Mis propiedades</h1>
          <p className="mt-1 text-sm text-slate-600">Administra tus publicaciones activas y en revision.</p>

          {message && (
            <div
              className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
                message.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-rose-200 bg-rose-50 text-rose-700'
              }`}
            >
              {message.text}
            </div>
          )}

          {isLoading ? (
            <p className="mt-6 text-sm text-slate-600">Cargando propiedades...</p>
          ) : myProperties.length === 0 ? (
            <p className="mt-6 text-sm text-slate-600">No tenes propiedades registradas.</p>
          ) : (
            <div className="mt-6 space-y-3">
              {myProperties.map((entry) => (
                <article key={entry.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-base font-semibold text-slate-900">{entry.title}</h2>
                      <p className="text-sm text-slate-600">{entry.city?.name ?? entry.cityId}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusBadge(entry.status)}`}>
                        {entry.status}
                      </span>
                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                          entry.isActive
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-slate-200 bg-slate-100 text-slate-600'
                        }`}
                      >
                        {entry.isActive ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void activateProperty(entry.id)}
                      className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500"
                    >
                      Activar
                    </button>
                    <button
                      type="button"
                      onClick={() => void deactivateProperty(entry.id)}
                      className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-amber-400"
                    >
                      Desactivar
                    </button>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => void approveProperty(entry.id)}
                        className="rounded-lg bg-cyan-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-cyan-500"
                      >
                        Aprobar
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => void deleteProperty(entry.id)}
                      className="rounded-lg border border-rose-300 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
                    >
                      Eliminar
                    </button>
                  </div>

                  <div className="mt-4">
                    {entry.images && entry.images.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {entry.images
                          .slice()
                          .sort((a, b) => a.order - b.order)
                          .map((image) => (
                            <article key={image.id} className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                              <img
                                src={image.imageUrl}
                                alt={`Imagen de ${entry.title}`}
                                className="h-24 w-full rounded-md object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => void deletePropertyImage(entry.id, image.id)}
                                className="mt-2 w-full rounded-md border border-rose-300 px-2 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
                              >
                                Eliminar imagen
                              </button>
                            </article>
                          ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">Sin imagenes cargadas.</p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
