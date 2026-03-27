import { ArrowLeft, Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../../components';
import { useAuth } from '../../../contexts/AuthContext';
import { ExpiringPropertiesAlert, RenewListingModal } from '../../../features/listings';
import { useOwnerPanel } from '../../../hooks/useOwnerPanel';
import type { RenewListingPayload } from '../../../types';

function statusBadge(status: string): string {
  if (status === 'active' || status === 'approved') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (status === 'draft' || status === 'pending') return 'bg-amber-50 text-amber-700 border-amber-200';
  if (status === 'expired') return 'bg-slate-100 text-slate-700 border-slate-200';
  if (status === 'rejected') return 'bg-rose-50 text-rose-700 border-rose-200';
  return 'bg-rose-50 text-rose-700 border-rose-200';
}

export default function MyPropertiesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [renewModalPropertyId, setRenewModalPropertyId] = useState<string | null>(null);
  const [renewModalTitle, setRenewModalTitle] = useState('');
  const [renewModalType, setRenewModalType] = useState<'normal' | 'featured'>('normal');
  const [renewModalDuration, setRenewModalDuration] = useState<15 | 30 | 60>(30);
  const [integrationMessage, setIntegrationMessage] = useState<string | null>(null);
  const {
    profile,
    myProperties,
    expiringSoon,
    isLoading,
    listingActionPropertyId,
    message,
    loadPanel,
    activateProperty,
    deactivateProperty,
    approveProperty,
    deleteProperty,
    deletePropertyImage,
    renewPropertyListing,
    createPreferenceAndRedirect,
  } = useOwnerPanel();

  useEffect(() => {
    void loadPanel();
  }, [loadPanel]);

  const isAdmin = useMemo(() => {
    const role = (profile?.role ?? user?.role ?? '').toLowerCase();
    return role === 'admin';
  }, [profile?.role, user?.role]);

  const plan = useMemo(() => {
    return (profile?.plan ?? user?.plan ?? 'FREE').toUpperCase();
  }, [profile?.plan, user?.plan]);

  const hasBulkIntegrations = plan === 'INMOBILIARIA' || plan === 'BROKER';

  const openRenewModal = (
    property: { id: string; title: string; listing?: { listingType?: 'normal' | 'featured'; listingDuration?: 15 | 30 | 60 } },
    forcedType?: 'normal' | 'featured',
  ) => {
    setRenewModalPropertyId(property.id);
    setRenewModalTitle(property.title);
    setRenewModalType(forcedType ?? property.listing?.listingType ?? 'normal');
    setRenewModalDuration(property.listing?.listingDuration ?? 30);
  };

  const closeRenewModal = () => {
    setRenewModalPropertyId(null);
    setRenewModalTitle('');
    setRenewModalType('normal');
    setRenewModalDuration(30);
  };

  const handleConfirmRenew = async (selection: RenewListingPayload) => {
    if (!renewModalPropertyId) return;

    if (selection.listingType === 'featured') {
      await createPreferenceAndRedirect({
        propertyId: renewModalPropertyId,
        type: selection.listingType,
        duration: selection.listingDuration,
      });
      return;
    }

    await renewPropertyListing(renewModalPropertyId, selection);
    closeRenewModal();
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20 sm:pt-24">
      <Navbar />

      <main className="mx-auto w-full max-w-5xl px-4 pb-10 sm:px-6">
        <ExpiringPropertiesAlert
          items={expiringSoon}
          renewingPropertyId={listingActionPropertyId}
          onRenew={(item) => {
            const sourceProperty = myProperties.find((property) => property.id === item.propertyId);
            openRenewModal(
              {
                id: item.propertyId,
                title: item.title,
                listing: sourceProperty?.listing,
              },
              item.listingType,
            );
          }}
        />

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
            onClick={() => navigate('/panel/properties/publish')}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Nueva publicacion
          </button>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">Mis propiedades</h1>
          <p className="mt-1 text-sm text-slate-600">Administra tus publicaciones activas y en revision.</p>

          {hasBulkIntegrations && (
            <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
              <p className="font-semibold">Integraciones para {plan}</p>
              <p className="mt-1 text-xs text-blue-800">
                Puedes conectar tu sistema o importar un CSV/Excel. Esta demo simula el flujo hasta que el backend lo habilite.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setIntegrationMessage('Integracion solicitada. Te contactaremos para configurar la API.')}
                  className="rounded-lg border border-blue-300 bg-white px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                >
                  Conectar sistema
                </button>
                <button
                  type="button"
                  onClick={() => setIntegrationMessage('Importacion CSV simulada. En breve podras subir archivos reales.')}
                  className="rounded-lg border border-blue-300 bg-white px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                >
                  Importar CSV/Excel
                </button>
              </div>
              {integrationMessage && <p className="mt-2 text-xs text-blue-800">{integrationMessage}</p>}
            </div>
          )}

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
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusBadge(entry.listing?.status ?? entry.status)}`}>
                        {entry.listing?.status ?? entry.status}
                      </span>
                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                          (entry.listing?.isActive ?? entry.isActive)
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-slate-200 bg-slate-100 text-slate-600'
                        }`}
                      >
                        {(entry.listing?.isActive ?? entry.isActive) ? 'Activa' : 'Inactiva'}
                      </span>
                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                          entry.listing?.isFeatured || entry.isFeatured
                            ? 'border-amber-200 bg-amber-50 text-amber-700'
                            : 'border-slate-200 bg-slate-100 text-slate-600'
                        }`}
                      >
                        {entry.listing?.isFeatured || entry.isFeatured ? 'Destacado' : 'Normal'}
                      </span>
                    </div>
                  </div>

                  {entry.listing?.listingExpiresAt && (
                    <p className="mt-2 text-xs text-slate-600">
                      Vence: {new Date(entry.listing.listingExpiresAt).toLocaleDateString('es-AR')}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/panel/properties/${entry.id}/edit`)}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Editar
                    </button>
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
                    <button
                      type="button"
                      onClick={() => openRenewModal(entry)}
                      className="rounded-lg border border-blue-300 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-50"
                    >
                      Renovar
                    </button>
                    <button
                      type="button"
                      onClick={() => openRenewModal(entry, 'featured')}
                      className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-amber-400"
                    >
                      Destacar propiedad
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

      <RenewListingModal
        open={Boolean(renewModalPropertyId)}
        propertyTitle={renewModalTitle}
        initialType={renewModalType}
        initialDuration={renewModalDuration}
        isSubmitting={Boolean(listingActionPropertyId)}
        error={
          message?.type === 'error' && listingActionPropertyId === renewModalPropertyId
            ? message.text
            : null
        }
        onClose={closeRenewModal}
        onConfirm={handleConfirmRenew}
      />
    </div>
  );
}
