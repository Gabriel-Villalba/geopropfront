import { ArrowLeft, Heart, MessageCircle, Plus, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../../components';
import { PropertyComparator, ZonePriceStats } from '../../../components';
import { useAuth } from '../../../contexts/AuthContext';
import { ExpiringPropertiesAlert, RenewListingModal } from '../../../features/listings';
import { useFavorites } from '../../../hooks/useFavorites';
import { useOwnerPanel } from '../../../hooks/useOwnerPanel';
import { meApi } from '../../../services/api';
import type { PropertyPerformanceMetric, ZonePriceStat } from '../../../types';
import type { RenewListingPayload } from '../../../types';

function statusBadge(status: string): string {
  if (status === 'active' || status === 'approved') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (status === 'draft' || status === 'pending') return 'bg-amber-50 text-amber-700 border-amber-200';
  if (status === 'expired') return 'bg-slate-100 text-slate-700 border-slate-200';
  if (status === 'rejected') return 'bg-rose-50 text-rose-700 border-rose-200';
  return 'bg-rose-50 text-rose-700 border-rose-200';
}

function resolveImageUrl(rawUrl?: string | null): string | null {
  if (!rawUrl || !rawUrl.trim()) return null;
  if (/^https?:\/\//i.test(rawUrl)) return rawUrl;
  if (rawUrl.startsWith('data:')) return rawUrl;

  const apiBase = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';
  const base = apiBase.replace(/\/api\/?$/i, '');
  if (rawUrl.startsWith('/')) return `${base}${rawUrl}`;
  return `${base}/${rawUrl}`;
}

type PanelImageItem = {
  id?: string;
  imageUrl?: string | null;
  order?: number;
  isPrimary?: boolean;
};

function normalizePanelImages(images: unknown): Array<PanelImageItem & { canDelete: boolean }> {
  if (!Array.isArray(images)) return [];

  return images
    .map((item, index) => {
      if (typeof item === 'string') {
        return {
          id: `image-${index}`,
          imageUrl: item,
          order: index,
          isPrimary: index === 0,
          canDelete: false,
        };
      }

      if (item && typeof item === 'object') {
        const image = item as PanelImageItem;
        return {
          id: image.id,
          imageUrl: image.imageUrl ?? null,
          order: typeof image.order === 'number' ? image.order : index,
          isPrimary: Boolean(image.isPrimary),
          canDelete: Boolean(image.id),
        };
      }

      return {
        id: `image-${index}`,
        imageUrl: null,
        order: index,
        isPrimary: false,
        canDelete: false,
      };
    })
    .filter((image) => Boolean(image.imageUrl));
}

export default function MyPropertiesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [renewModalPropertyId, setRenewModalPropertyId] = useState<string | null>(null);
  const [renewModalTitle, setRenewModalTitle] = useState('');
  const [renewModalType, setRenewModalType] = useState<'normal' | 'featured'>('normal');
  const [renewModalDuration, setRenewModalDuration] = useState<15 | 30 | 60>(30);
  const [integrationMessage, setIntegrationMessage] = useState<string | null>(null);
  const { isFavorite } = useFavorites();
  const [metrics, setMetrics] = useState<Record<string, PropertyPerformanceMetric>>({});
  const [selectedCompare, setSelectedCompare] = useState<string[]>([]);
  const [showComparator, setShowComparator] = useState(false);
  const [zoneStats, setZoneStats] = useState<ZonePriceStat[]>([]);
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

  useEffect(() => {
    let active = true;
    meApi
      .getPropertyPerformance()
      .then((data) => {
        if (!active) return;
        const map: Record<string, PropertyPerformanceMetric> = {};
        data.forEach((item) => {
          map[item.id] = item;
        });
        setMetrics(map);
      })
      .catch(() => null);

    meApi
      .getZonePriceStats()
      .then((data) => {
        if (active) setZoneStats(data);
      })
      .catch(() => null);

    return () => {
      active = false;
    };
  }, []);

  const isAdmin = useMemo(() => {
    const role = (profile?.role ?? user?.role ?? '').toLowerCase();
    return role === 'admin';
  }, [profile?.role, user?.role]);

  const plan = useMemo(() => {
    return (profile?.plan ?? user?.plan ?? 'FREE').toUpperCase();
  }, [profile?.plan, user?.plan]);

  const hasBulkIntegrations = plan === 'INMOBILIARIA' || plan === 'BROKER';
  const hasZoneStats = plan === 'INMOBILIARIA' || plan === 'BROKER';

  const toggleCompare = (propertyId: string) => {
    setSelectedCompare((prev) => {
      if (prev.includes(propertyId)) {
        return prev.filter((id) => id !== propertyId);
      }
      if (prev.length >= 3) return prev;
      return [...prev, propertyId];
    });
  };

  const compareItems = selectedCompare
    .map((id) => metrics[id])
    .filter((item): item is PropertyPerformanceMetric => Boolean(item));

  const formatMoney = (value?: number | null, currency?: string | null) => {
    if (value == null || !currency) return '-';
    return `${currency} ${Number(value).toLocaleString('es-AR')}`;
  };

  const pricePerM2 = (price?: number, area?: number | null) => {
    if (!price || !area || area <= 0) return null;
    return Math.round(price / area);
  };

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

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => navigate('/panel/inquiries')}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <MessageCircle className="h-4 w-4" />
              Ver consultas
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
                      {isFavorite(entry.id) && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-600">
                          <Heart className="h-3 w-3" />
                          Favorito
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => toggleCompare(entry.id)}
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold transition ${
                          selectedCompare.includes(entry.id)
                            ? 'border-brand-200 bg-brand-50 text-brand-700'
                            : 'border-slate-200 bg-slate-100 text-slate-600'
                        }`}
                      >
                        Comparar
                      </button>
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
                  {metrics[entry.id] && (
                    <div className="mt-3 grid gap-2 sm:grid-cols-3 text-xs text-slate-600">
                      <div className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2">
                        <p className="text-[11px] text-slate-500">Vistas esta semana</p>
                        <p className="text-sm font-semibold text-slate-900">{metrics[entry.id].viewsCurrent}</p>
                        <p className="text-[11px] text-slate-500">Semana anterior: {metrics[entry.id].viewsPrevious}</p>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2">
                        <p className="text-[11px] text-slate-500">Consultas esta semana</p>
                        <p className="text-sm font-semibold text-slate-900">{metrics[entry.id].inquiriesCurrent}</p>
                        <p className="text-[11px] text-slate-500">Semana anterior: {metrics[entry.id].inquiriesPrevious}</p>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 flex items-center justify-between">
                        <div>
                          <p className="text-[11px] text-slate-500">ConversiÃ³n total</p>
                          <p className="text-sm font-semibold text-slate-900">
                            {(metrics[entry.id].conversion * 100).toFixed(1)}%
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Semana vs anterior: {metrics[entry.id].changePercent >= 0 ? '+' : ''}
                            {metrics[entry.id].changePercent}%
                          </p>
                        </div>
                        <TrendingUp className={`h-4 w-4 ${metrics[entry.id].changePercent >= 0 ? 'text-emerald-500' : 'text-rose-500'}`} />
                      </div>
                    </div>
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
                      onClick={() => navigate(`/panel/properties/${entry.id}/inquiries`, { state: { propertyTitle: entry.title } })}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Consultas
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
                    {normalizePanelImages(entry.images).length > 0 ? (
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {normalizePanelImages(entry.images)
                          .slice()
                          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                          .map((image) => {
                            const resolvedImageUrl = resolveImageUrl(image.imageUrl);

                            return (
                              <article key={image.id} className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                                {resolvedImageUrl ? (
                                  <img
                                    src={resolvedImageUrl}
                                    alt={`Imagen de ${entry.title}`}
                                    className="h-24 w-full rounded-md object-cover"
                                  />
                                ) : (
                                  <div className="flex h-24 w-full items-center justify-center rounded-md border border-dashed border-slate-300 bg-white text-xs text-slate-500">
                                    Imagen no disponible
                                  </div>
                                )}
                                {image.canDelete && image.id ? (
                                  <button
                                    type="button"
                                    onClick={() => void deletePropertyImage(entry.id, image.id)}
                                    className="mt-2 w-full rounded-md border border-rose-300 px-2 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
                                  >
                                    Eliminar imagen
                                  </button>
                                ) : (
                                  <p className="mt-2 text-center text-[11px] text-slate-500">Imagen cargada</p>
                                )}
                              </article>
                            );
                          })}
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

        {compareItems.length >= 2 && (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Comparador de propiedades</h2>
            <p className="text-xs text-slate-600 mb-4">SeleccionÃ¡ hasta 3 propiedades para comparar.</p>
            <div className="overflow-x-auto">
              <table className="min-w-[700px] w-full text-xs">
                <thead>
                  <tr className="text-left text-slate-500">
                    <th className="py-2">Campo</th>
                    {compareItems.map((item) => (
                      <th key={item.id} className="py-2">{item.title}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-slate-700">
                  <tr className="border-t">
                    <td className="py-2">Precio</td>
                    {compareItems.map((item) => (
                      <td key={item.id} className="py-2">{formatMoney(item.price, item.currency)}</td>
                    ))}
                  </tr>
                  <tr className="border-t">
                    <td className="py-2">mÂ² total</td>
                    {compareItems.map((item) => (
                      <td key={item.id} className="py-2">{item.totalArea ?? '-'}</td>
                    ))}
                  </tr>
                  <tr className="border-t">
                    <td className="py-2">mÂ² cubierto</td>
                    {compareItems.map((item) => (
                      <td key={item.id} className="py-2">{item.coveredArea ?? '-'}</td>
                    ))}
                  </tr>
                  <tr className="border-t">
                    <td className="py-2">Precio / mÂ²</td>
                    {compareItems.map((item) => (
                      <td key={item.id} className="py-2">
                        {pricePerM2(item.price, item.totalArea)
                          ? `${item.currency} ${pricePerM2(item.price, item.totalArea)?.toLocaleString('es-AR')}`
                          : '-'}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t">
                    <td className="py-2">UbicaciÃ³n</td>
                    {compareItems.map((item) => (
                      <td key={item.id} className="py-2">{item.location ?? '-'}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        )}

        {hasZoneStats && zoneStats.length > 0 && (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Precio promedio por zona</h2>
            <p className="text-xs text-slate-600 mb-4">Rango actual estimado (no histÃ³rico).</p>
            <div className="overflow-x-auto">
              <table className="min-w-[600px] w-full text-xs">
                <thead>
                  <tr className="text-left text-slate-500">
                    <th className="py-2">Ciudad</th>
                    <th className="py-2">Promedio / mÂ²</th>
                    <th className="py-2">MÃ­nimo</th>
                    <th className="py-2">MÃ¡ximo</th>
                  </tr>
                </thead>
                <tbody className="text-slate-700">
                  {zoneStats.map((stat) => (
                    <tr key={stat.cityId} className="border-t">
                      <td className="py-2">{stat.cityName}</td>
                      <td className="py-2">
                        {stat.avgPricePerM2 ? `USD ${Math.round(stat.avgPricePerM2).toLocaleString('es-AR')}` : '-'}
                      </td>
                      <td className="py-2">
                        {stat.minPricePerM2 ? `USD ${Math.round(stat.minPricePerM2).toLocaleString('es-AR')}` : '-'}
                      </td>
                      <td className="py-2">
                        {stat.maxPricePerM2 ? `USD ${Math.round(stat.maxPricePerM2).toLocaleString('es-AR')}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
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

      {showComparator && (
        <PropertyComparator
          propertyIds={selectedCompare}
          onClose={() => setShowComparator(false)}
        />
      )}
    </div>
  );
}
