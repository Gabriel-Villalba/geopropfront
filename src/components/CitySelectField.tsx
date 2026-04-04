import type { City } from '../types';

interface CitySelectFieldProps {
  label?: string;
  value: string;
  cities: City[];
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
  onChange: (value: string, city?: City | null) => void;
  selectClassName?: string;
  labelClassName?: string;
  disabled?: boolean;
}

export function CitySelectField({
  label = 'Ciudad o localidad (Santa Fe)',
  value,
  cities,
  isLoading,
  error,
  onRetry,
  onChange,
  selectClassName = 'border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500',
  labelClassName = 'text-sm font-medium text-slate-700',
  disabled,
}: CitySelectFieldProps) {
  const isDisabled = Boolean(disabled) || isLoading || Boolean(error);
  const hasEmptyCities = !isLoading && !error && cities.length === 0;

  return (
    <div className="grid gap-1.5">
      <span className={labelClassName}>{label}</span>
      <select
        value={value}
        onChange={(event) => {
          const nextValue = event.target.value;
          const selectedCity = cities.find((city) => city.id === nextValue) ?? null;
          onChange(nextValue, selectedCity);
        }}
        disabled={isDisabled}
        className={`${selectClassName} disabled:cursor-not-allowed disabled:bg-slate-100`}
      >
        <option value="">
          {isLoading ? 'Cargando ciudades...' : 'Seleccionar ciudad o localidad'}
        </option>
        {cities.map((city) => (
          <option key={city.id} value={city.id}>
            {city.name}
          </option>
        ))}
      </select>
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          <p>{error}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-2 rounded-md border border-rose-300 px-2 py-1 font-semibold transition hover:bg-rose-100"
            >
              Reintentar ciudades
            </button>
          )}
        </div>
      )}
      {hasEmptyCities && <p className="text-xs text-amber-700">No hay ciudades/localidades disponibles para Santa Fe.</p>}
    </div>
  );
}
