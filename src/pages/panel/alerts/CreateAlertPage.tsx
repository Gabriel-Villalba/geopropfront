import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../../components';
import { useOwnerPanel } from '../../../hooks/useOwnerPanel';

interface AlertDraft {
  cityId: string;
  operation: 'sale' | 'rent';
  propertyType: 'house' | 'apartment' | 'land' | 'commercial';
  minPrice: string;
  maxPrice: string;
  rooms: string;
}

const defaultAlertDraft: AlertDraft = {
  cityId: '',
  operation: 'sale',
  propertyType: 'apartment',
  minPrice: '',
  maxPrice: '',
  rooms: '',
};

function asNumber(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export default function CreateAlertPage() {
  const navigate = useNavigate();
  const { alerts, isLoading, isSavingAlert, message, loadPanel, createAlert, deactivateAlert } = useOwnerPanel();
  const [draft, setDraft] = useState<AlertDraft>(defaultAlertDraft);

  useEffect(() => {
    void loadPanel();
  }, [loadPanel]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await createAlert({
      cityId: draft.cityId.trim(),
      operation: draft.operation,
      propertyType: draft.propertyType,
      minPrice: asNumber(draft.minPrice),
      maxPrice: asNumber(draft.maxPrice),
      rooms: asNumber(draft.rooms),
    });

    setDraft(defaultAlertDraft);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20 sm:pt-24">
      <Navbar />

      <main className="mx-auto w-full max-w-4xl px-4 pb-10 sm:px-6">
        <button
          type="button"
          onClick={() => navigate('/panel')}
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al panel
        </button>

        <section className=" border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">Crear alerta</h1>
          <p className="mt-1 text-sm text-slate-600">Define criterios para recibir nuevas oportunidades.</p>

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

          <form className="mt-6 grid gap-3 sm:grid-cols-2" onSubmit={handleSubmit}>
            <input
              required
              placeholder="City ID (UUID)"
              value={draft.cityId}
              onChange={(event) => setDraft((prev) => ({ ...prev, cityId: event.target.value }))}
              className=" border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 sm:col-span-2"
            />
            <select
              value={draft.operation}
              onChange={(event) => setDraft((prev) => ({ ...prev, operation: event.target.value as AlertDraft['operation'] }))}
              className=" border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
            >
              <option value="sale">Venta</option>
              <option value="rent">Alquiler</option>
            </select>
            <select
              value={draft.propertyType}
              onChange={(event) => setDraft((prev) => ({ ...prev, propertyType: event.target.value as AlertDraft['propertyType'] }))}
              className=" border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
            >
              <option value="house">Casa</option>
              <option value="apartment">Departamento</option>
              <option value="land">Lote</option>
              <option value="commercial">Local comercial</option>
            </select>
            <input
              type="number"
              placeholder="Precio minimo"
              value={draft.minPrice}
              onChange={(event) => setDraft((prev) => ({ ...prev, minPrice: event.target.value }))}
              className=" border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
            />
            <input
              type="number"
              placeholder="Precio maximo"
              value={draft.maxPrice}
              onChange={(event) => setDraft((prev) => ({ ...prev, maxPrice: event.target.value }))}
              className=" border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
            />
            <input
              type="number"
              placeholder="Ambientes"
              value={draft.rooms}
              onChange={(event) => setDraft((prev) => ({ ...prev, rooms: event.target.value }))}
              className=" border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
            />

            <button
              type="submit"
              disabled={isSavingAlert}
              className="w-full bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {isSavingAlert ? 'Guardando...' : 'Crear alerta'}
            </button>
          </form>

          <div className="mt-6 space-y-2">
            {isLoading ? (
              <p className="text-sm text-slate-600">Cargando alertas...</p>
            ) : alerts.length === 0 ? (
              <p className="text-sm text-slate-600">No tenes alertas registradas.</p>
            ) : (
              alerts.map((alert) => (
                <div key={alert.id} className="flex flex-wrap items-center justify-between gap-2  border border-slate-200 p-3">
                  <div className="text-sm text-slate-700">
                    {alert.operation} - {alert.propertyType} - {alert.city?.name ?? alert.cityId}
                  </div>
                  <button
                    type="button"
                    onClick={() => void deactivateAlert(alert.id)}
                    disabled={!alert.active}
                    className=" border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {alert.active ? 'Desactivar' : 'Inactiva'}
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
