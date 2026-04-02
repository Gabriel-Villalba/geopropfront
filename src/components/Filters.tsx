import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, cubicBezier, motion } from 'framer-motion';
import { MapPin, ChevronDown, SlidersHorizontal, Search, RotateCcw } from 'lucide-react';
import type { FiltersFormState } from '../hooks/useFilters';
import { useSantaFeCities } from '../hooks/useSantaFeCities';

interface FiltersProps {
  filters: FiltersFormState;
  onChange: (key: keyof FiltersFormState, value: string) => void;
  onSubmit: () => void;
  onReset: () => void;
  isLoading: boolean;
}

type DropdownType = 'price' | 'operation' | 'type' | 'advanced' | null;

type ValidPropertyType = Exclude<FiltersFormState['type'], ''>;

const typeLabel: Record<ValidPropertyType, string> = {
  casa: 'Casa',
  departamento: 'Departamento',
  comercial: 'Local Comercial',
  lote: 'Lote',
  'galpon-deposito': 'Galpón/Depósito',
};

const dropdownMotion = {
  initial: { opacity: 0, y: -8, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -8, scale: 0.97 },
  transition: { duration: 0.18, ease: cubicBezier(0.22, 1, 0.36, 1) },
};

export function Filters({ filters, onChange, onSubmit, onReset, isLoading }: FiltersProps) {
  const [openDropdown, setOpenDropdown] = useState<DropdownType>(null);
  const wrapperRef = useRef<HTMLFormElement>(null);
  const { cities, isLoadingCities, isRetryingCities, citiesError, reloadCities } = useSantaFeCities();

  useEffect(() => {
    if (!filters.city || cities.length === 0) return;
    const hasCurrentCity = cities.some((city) => city.name === filters.city);
    if (hasCurrentCity) return;
    onChange('city', '');
  }, [cities, filters.city, onChange]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggle = (key: DropdownType) => setOpenDropdown(openDropdown === key ? null : key);

  const FilterButton = ({
    id,
    label,
    active,
  }: {
    id: DropdownType;
    label: string;
    active?: boolean;
  }) => (
    <button
      type="button"
      onClick={() => toggle(id)}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-150 whitespace-nowrap ${
        openDropdown === id || active
          ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
          : 'bg-white text-ink border-gray-200 hover:border-brand-300 hover:bg-brand-50'
      }`}
    >
      {label}
      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === id ? 'rotate-180' : ''}`} />
    </button>
  );

  return (
    <form
      ref={wrapperRef}
      onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
      className="bg-white rounded-2xl border border-gray-100 shadow-card p-4"
    >
      <div className="flex flex-wrap gap-2 items-center">

        {/* Operation */}
        <div className="relative">
          <FilterButton
            id="operation"
            label={filters.operation === 'venta' ? 'Comprar' : filters.operation === 'alquiler' ? 'Alquilar' : 'Operación'}
            active={!!filters.operation}
          />
          <AnimatePresence>
            {openDropdown === 'operation' && (
              <motion.div {...dropdownMotion} className="absolute left-0 z-50 mt-2 w-44 bg-white rounded-xl shadow-modal border border-gray-100 py-1 overflow-hidden">
                {[{ value: '', label: 'Todas' }, { value: 'venta', label: 'Comprar' }, { value: 'alquiler', label: 'Alquilar' }].map((op) => (
                  <button key={op.value} type="button" onClick={() => { onChange('operation', op.value); setOpenDropdown(null); }}
                    className={`w-full px-4 py-2.5 text-left text-sm transition hover:bg-surface-soft ${filters.operation === op.value ? 'text-brand-600 font-semibold' : 'text-ink'}`}>
                    {op.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Type */}
        <div className="relative">
          <FilterButton id="type" label={filters.type ? typeLabel[filters.type] : 'Tipo'} active={!!filters.type} />
          <AnimatePresence>
            {openDropdown === 'type' && (
              <motion.div {...dropdownMotion} className="absolute left-0 z-50 mt-2 w-52 bg-white rounded-xl shadow-modal border border-gray-100 py-1 overflow-hidden">
                {Object.entries(typeLabel).map(([value, label]) => (
                  <button key={value} type="button" onClick={() => { onChange('type', value); setOpenDropdown(null); }}
                    className={`w-full px-4 py-2.5 text-left text-sm transition hover:bg-surface-soft ${filters.type === value ? 'text-brand-600 font-semibold' : 'text-ink'}`}>
                    {label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* City */}
        <div className="relative flex items-center">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brand-400 pointer-events-none z-10" />
          <select
            value={filters.city}
            onChange={(e) => onChange('city', e.target.value)}
            disabled={isLoadingCities || Boolean(citiesError)}
            className="pl-8 pr-8 py-2.5 text-sm border border-gray-200 rounded-xl bg-white text-ink outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition appearance-none cursor-pointer disabled:bg-gray-50 disabled:text-ink-muted min-w-[200px]"
          >
            <option value="">
              {isRetryingCities ? 'Reintentando conexión...' : isLoadingCities ? 'Cargando...' : 'Ciudad / Localidad'}
            </option>
            {cities.map((city) => (
              <option key={city.id} value={city.name}>{city.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-faint pointer-events-none" />
        </div>

        {/* Search */}
        <div className="relative flex items-center">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brand-400 pointer-events-none" />
          <input
            value={filters.search}
            onChange={(e) => onChange('search', e.target.value)}
            placeholder="Barrio, direcciÃ³n o descripciÃ³n"
            className="pl-8 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white text-ink outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition min-w-[220px]"
          />
        </div>

        {/* Sort */}
        <div className="relative flex items-center">
          <select
            value={`${filters.sortBy}:${filters.order}`}
            onChange={(e) => {
              const [sortBy, order] = e.target.value.split(':');
              onChange('sortBy', sortBy);
              onChange('order', order);
            }}
            className="pl-4 pr-8 py-2.5 text-sm border border-gray-200 rounded-xl bg-white text-ink outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition appearance-none cursor-pointer min-w-[180px]"
          >
            <option value="price:asc">Menor precio</option>
            <option value="price:desc">Mayor precio</option>
            <option value="createdAt:desc">MÃ¡s recientes</option>
            <option value="area:desc">Mayor superficie</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-faint pointer-events-none" />
        </div>

        {/* Price */}
        <div className="relative">
          <FilterButton id="price" label="Precio" active={!!filters.minPrice || !!filters.maxPrice} />
          <AnimatePresence>
            {openDropdown === 'price' && (
              <motion.div {...dropdownMotion} className="absolute left-0 z-50 mt-2 w-64 bg-white rounded-xl shadow-modal border border-gray-100 p-4">
                <p className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-3">Rango de precio</p>
                <div className="space-y-2">
                  <input type="number" placeholder="Mínimo" value={filters.minPrice} onChange={(e) => onChange('minPrice', e.target.value)}
                    className="input-base" />
                  <input type="number" placeholder="Máximo" value={filters.maxPrice} onChange={(e) => onChange('maxPrice', e.target.value)}
                    className="input-base" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Advanced */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggle('advanced')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-150 ${
              openDropdown === 'advanced' ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-ink border-gray-200 hover:border-brand-300 hover:bg-brand-50'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Más filtros
          </button>
          <AnimatePresence>
            {openDropdown === 'advanced' && (
              <motion.div {...dropdownMotion} className="absolute left-0 z-50 mt-2 w-72 bg-white rounded-xl shadow-modal border border-gray-100 p-4">
                <p className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-3">Filtros avanzados</p>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-ink-muted mb-1 block">Dormitorios mínimos</label>
                    <input type="number" placeholder="Ej: 2" value={filters.minBedrooms} onChange={(e) => onChange('minBedrooms', e.target.value)} className="input-base" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-ink-muted mb-1 block">Cocheras mínimas</label>
                    <input type="number" placeholder="Ej: 1" value={filters.minParking} onChange={(e) => onChange('minParking', e.target.value)} className="input-base" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-ink-muted mb-1 block">Área total (m²)</label>
                    <div className="flex gap-2">
                      <input type="number" placeholder="Desde" value={filters.minArea} onChange={(e) => onChange('minArea', e.target.value)} className="input-base" />
                      <input type="number" placeholder="Hasta" value={filters.maxArea} onChange={(e) => onChange('maxArea', e.target.value)} className="input-base" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-ink-muted mb-1 block">Tipo de anunciante</label>
                    <select value={filters.publisherType} onChange={(e) => onChange('publisherType', e.target.value)} className="select-base">
                      <option value="">Todos</option>
                      <option value="inmobiliaria">Inmobiliaria</option>
                      <option value="particular">Dueño directo</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Actions */}
        <button type="button" onClick={onReset} className="btn-ghost gap-1.5">
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Limpiar</span>
        </button>

        <button type="submit" disabled={isLoading} className="btn-primary disabled:opacity-60">
          <Search className="w-4 h-4" />
          {isLoading ? 'Buscando…' : 'Buscar'}
        </button>
      </div>

      {citiesError && (
        <div className="mt-3 flex items-center justify-between border border-red-100 bg-red-50 rounded-xl px-4 py-3 text-xs text-red-700">
          <span>No se pudieron cargar las ciudades.</span>
          <button type="button" onClick={() => void reloadCities()} className="font-semibold underline ml-3">
            Reintentar
          </button>
        </div>
      )}

      {isRetryingCities && !citiesError && (
        <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs text-amber-700">
          Reintentando conexión...
        </div>
      )}
    </form>
  );
}
