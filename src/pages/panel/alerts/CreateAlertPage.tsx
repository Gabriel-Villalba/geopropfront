import { ArrowLeft, Bell, BellOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../../components';
import { useOwnerPanel } from '../../../hooks/useOwnerPanel';
import { useSantaFeCities } from '../../../hooks/useSantaFeCities';

interface AlertDraft {
  cityId: string;
  operation: 'sale' | 'rent';
  propertyType: 'house' | 'apartment' | 'land' | 'commercial';
  minPrice: string;
  maxPrice: string;
  rooms: string;
}

const defaultAlertDraft: AlertDraft = { cityId: '', operation: 'sale', propertyType: 'apartment', minPrice: '', maxPrice: '', rooms: '' };

function asNumber(value: string): number | undefined {
  const t = value.trim();
  if (!t) return undefined;
  const p = Number(t);
  return Number.isFinite(p) ? p : undefined;
}

export default function CreateAlertPage() {
  const navigate = useNavigate();
  const { alerts, isLoading, isSavingAlert, message, loadPanel, createAlert, deactivateAlert } = useOwnerPanel();
  const [draft, setDraft] = useState<AlertDraft>(defaultAlertDraft);
  const { cities, isLoadingCities, citiesError, reloadCities } = useSantaFeCities();

  useEffect(() => { void loadPanel(); }, [loadPanel]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await createAlert({
      cityId: draft.cityId.trim(), operation: draft.operation, propertyType: draft.propertyType,
      minPrice: asNumber(draft.minPrice), maxPrice: asNumber(draft.maxPrice), rooms: asNumber(draft.rooms),
    });
    setDraft(defaultAlertDraft);
  };

  const set = (key: keyof AlertDraft, value: string) => setDraft((p) => ({ ...p, [key]: value }));

  return (
    <div className="min-h-screen bg-surface-soft pt-16">
      <Navbar />

      <main className="mx-auto w-full max-w-3xl px-4 pb-16 sm:px-6 pt-10">
        <button type="button" onClick={() => navigate('/panel')}
          className="mb-6 inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink transition-colors font-medium">
          <ArrowLeft className="h-4 w-4" />
          Volver al panel
        </button>

        <h1 className="font-display font-bold text-2xl text-ink tracking-tight mb-1">Alertas de búsqueda</h1>
        <p className="text-sm text-ink-muted mb-8">Definí criterios para recibir nuevas oportunidades.</p>

        {message && (
          <div className={`mb-6 px-4 py-3 rounded-xl text-sm border ${
            message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'
          }`}>{message.text}</div>
        )}

        {/* Create form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-ink-muted mb-5">Nueva alerta</h2>
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-ink-muted mb-1.5 block">Ciudad o localidad (Santa Fe)</label>
              <select
                required
                value={draft.cityId}
                onChange={(e) => set('cityId', e.target.value)}
                disabled={isLoadingCities || Boolean(citiesError)}
                className="select-base w-full disabled:cursor-not-allowed disabled:bg-gray-50"
              >
                <option value="">
                  {isLoadingCities ? 'Cargando ciudades...' : 'Seleccionar ciudad o localidad'}
                </option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
              {citiesError && (
                <div className="mt-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                  <p>{citiesError}</p>
                  <button
                    type="button"
                    onClick={() => void reloadCities()}
                    className="mt-2 rounded-md border border-rose-300 px-2 py-1 font-semibold transition hover:bg-rose-100"
                  >
                    Reintentar ciudades
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-ink-muted mb-1.5 block">Operación</label>
              <select value={draft.operation} onChange={(e) => set('operation', e.target.value as AlertDraft['operation'])} className="select-base">
                <option value="sale">Venta</option>
                <option value="rent">Alquiler</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-ink-muted mb-1.5 block">Tipo de propiedad</label>
              <select value={draft.propertyType} onChange={(e) => set('propertyType', e.target.value as AlertDraft['propertyType'])} className="select-base">
                <option value="house">Casa</option>
                <option value="apartment">Departamento</option>
                <option value="land">Lote</option>
                <option value="commercial">Local comercial</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-ink-muted mb-1.5 block">Precio mínimo</label>
              <input type="number" placeholder="Ej: 50000" value={draft.minPrice} onChange={(e) => set('minPrice', e.target.value)} className="input-base" />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-muted mb-1.5 block">Precio máximo</label>
              <input type="number" placeholder="Ej: 150000" value={draft.maxPrice} onChange={(e) => set('maxPrice', e.target.value)} className="input-base" />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-muted mb-1.5 block">Ambientes</label>
              <input type="number" placeholder="Ej: 2" value={draft.rooms} onChange={(e) => set('rooms', e.target.value)} className="input-base" />
            </div>

            <div className="sm:col-span-2 flex justify-end">
              <button type="submit" disabled={isSavingAlert} className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed">
                {isSavingAlert
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Guardando…</>
                  : <><Bell className="w-4 h-4" />Crear alerta</>
                }
              </button>
            </div>
          </form>
        </div>

        {/* Alert list */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-ink-muted mb-5">Mis alertas</h2>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
            </div>
          ) : alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-12 h-12 rounded-2xl bg-surface-muted flex items-center justify-center mb-3">
                <Bell className="w-5 h-5 text-ink-faint" />
              </div>
              <p className="text-sm text-ink-muted">No tenés alertas registradas todavía.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between gap-3 bg-surface-soft rounded-xl border border-gray-100 px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${alert.active ? 'bg-emerald-50' : 'bg-surface-muted'}`}>
                      {alert.active
                        ? <Bell className="w-4 h-4 text-emerald-600" />
                        : <BellOff className="w-4 h-4 text-ink-faint" />
                      }
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink">
                        {alert.operation === 'sale' ? 'Venta' : 'Alquiler'} · {alert.propertyType}
                      </p>
                      <p className="text-xs text-ink-muted">{alert.city?.name ?? alert.cityId}</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => void deactivateAlert(alert.id)} disabled={!alert.active}
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${
                      alert.active
                        ? 'border-gray-200 text-ink-muted hover:border-red-200 hover:text-red-600 hover:bg-red-50'
                        : 'border-gray-100 text-ink-faint cursor-not-allowed opacity-50'
                    }`}>
                    {alert.active ? 'Desactivar' : 'Inactiva'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
