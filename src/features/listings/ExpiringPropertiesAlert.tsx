import type { ExpiringProperty } from '../../types';

interface ExpiringPropertiesAlertProps {
  items: ExpiringProperty[];
  renewingPropertyId?: string | null;
  onRenew: (item: ExpiringProperty) => void;
}

export function ExpiringPropertiesAlert({ items, renewingPropertyId = null, onRenew }: ExpiringPropertiesAlertProps) {
  if (items.length === 0) return null;

  return (
    <section className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <h2 className="text-sm font-semibold text-amber-800">Publicaciones por vencer</h2>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <article key={item.propertyId} className="rounded-xl border border-amber-100 bg-white p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="text-xs text-slate-600">Vence en {item.daysLeft} dias</p>
              </div>
              <button
                type="button"
                disabled={renewingPropertyId === item.propertyId || !item.canRenew}
                onClick={() => onRenew(item)}
                className="rounded-lg border border-amber-300 px-3 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Renovar
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
