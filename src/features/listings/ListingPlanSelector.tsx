import type { ListingDuration, ListingType } from '../../types';

export interface ListingPlanSelection {
  listingType: ListingType;
  listingDuration: ListingDuration;
}

interface ListingPlanSelectorProps {
  value: ListingPlanSelection;
  onChange: (next: ListingPlanSelection) => void;
  disabled?: boolean;
  prices?: Partial<Record<ListingType, Partial<Record<ListingDuration, number>>>>;
}

const LISTING_TYPES: ListingType[] = ['normal', 'featured'];
const LISTING_DURATIONS: ListingDuration[] = [15, 30, 60];

function formatType(type: ListingType): string {
  return type === 'featured' ? 'Destacado' : 'Normal';
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ListingPlanSelector({ value, onChange, disabled = false, prices }: ListingPlanSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-slate-800">Tipo de publicacion</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {LISTING_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              disabled={disabled}
              onClick={() => onChange({ ...value, listingType: type })}
              className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                value.listingType === type
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
            >
              <p className="font-semibold">
                {formatType(type)}
                {type === 'featured' ? ' *' : ''}
              </p>
              <p className="mt-1 text-xs text-slate-500">Elige entre listado normal o destacado.</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-slate-800">Duracion</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {LISTING_DURATIONS.map((duration) => {
            const amount = prices?.[value.listingType]?.[duration];

            return (
              <button
                key={duration}
                type="button"
                disabled={disabled}
                onClick={() => onChange({ ...value, listingDuration: duration })}
                className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                  value.listingDuration === duration
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
              >
                <p className="font-semibold">{duration} dias</p>
                {typeof amount === 'number' && <p className="mt-1 text-xs text-slate-500">{formatCurrency(amount)}</p>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
