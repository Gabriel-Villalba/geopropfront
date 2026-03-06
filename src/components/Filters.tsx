import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import type { FiltersFormState } from '../hooks/useFilters';

interface FiltersProps {
  filters: FiltersFormState;
  onChange: (key: keyof FiltersFormState, value: string) => void;
  onSubmit: () => void;
  onReset: () => void;
  isLoading: boolean;
}

type DropdownType = 'price' | 'operation' | 'type' | 'advanced' | null;

const baseButton =
  'w-full md:w-44 text-center  border border-orange-500 px-4 py-3 text-sm font-semibold transition';

type ValidPropertyType = Exclude<
  FiltersFormState['type'],
  ''
>;

const typeLabel: Record<ValidPropertyType, string> = {
  casa: 'Casa',
  departamento: 'Departamento',
  comercial: 'Local Comercial',
  lote: 'Lote',
  'galpon-deposito': 'Galpón/Depósito',
};

export function Filters({ filters, onChange, onSubmit, onReset, isLoading }: FiltersProps) {
  const [openDropdown, setOpenDropdown] = useState<DropdownType>(null);
  const wrapperRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <form
      ref={wrapperRef}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="relative bg-white p-4 shadow"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === 'operation' ? null : 'operation')}
            className={`${baseButton} ${
              openDropdown === 'operation' ? 'bg-orange-500 text-white rounded-none' : 'bg-white text-gray-700 hover:bg-orange-50 rounded-none'
            }`}
          >
            {filters.operation === 'venta' ? 'Comprar' : 'Alquilar'}
          </button>

          <AnimatePresence>
            {openDropdown === 'operation' && (
              <motion.div
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                exit={{ opacity: 0, scaleY: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformOrigin: 'top' }}
                className="absolute left-0 z-50 mt-2 w-48 bg-orange-500 p-2 shadow-lg rounded-none"
              >
                {[
                  { value: 'venta', label: 'Comprar' },
                  { value: 'alquiler', label: 'Alquilar' },
                ].map((operation) => (
                  <button
                    key={operation.value}
                    type="button"
                    onClick={() => {
                      onChange('operation', operation.value);
                      setOpenDropdown(null);
                    }}
                    className="w-full px-3 py-2 text-center text-sm text-white transition hover:bg-orange-400 rounded-none"
                  >
                    {operation.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === 'type' ? null : 'type')}
            className={`${baseButton} ${
              openDropdown === 'type' ? 'bg-orange-500 text-white rounded-none' : 'bg-white text-gray-700 hover:bg-orange-50 rounded-none'
            }`}
          >
            {filters.type ? typeLabel[filters.type] : 'Tipo'}
          </button>

          <AnimatePresence>
            {openDropdown === 'type' && (
              <motion.div
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                exit={{ opacity: 0, scaleY: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformOrigin: 'top' }}
                className="absolute left-0 z-50 mt-2 w-56 bg-orange-500 p-2 shadow-lg"
              >
                {[
                  { value: 'casa', label: 'Casa' },
                  { value: 'departamento', label: 'Departamento' },
                  { value: 'comercial', label: 'Local Comercial' },
                  { value: 'lote', label: 'Lote' },
                  { value: 'galpon-deposito', label: 'Galpón/Depósito' },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => {
                      onChange('type', item.value);
                      setOpenDropdown(null);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-white transition hover:bg-orange-400"
                  >
                    {item.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative">
          <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={filters.city}
            disabled
            className="w-full cursor-not-allowed  border border-orange-500 bg-gray-100 px-4 py-3 text-center text-sm text-gray-600 rounded-none"
          />
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === 'price' ? null : 'price')}
            className={`${baseButton} ${
              openDropdown === 'price' ? 'bg-orange-500 text-white rounded-none' : 'bg-white text-gray-700 hover:bg-orange-50 rounded-none'
            }`}
          >
            Precio
          </button>

          <AnimatePresence>
            {openDropdown === 'price' && (
              <motion.div
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                exit={{ opacity: 0, scaleY: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformOrigin: 'top' }}
                className="absolute left-0 top-12 z-50 w-64 bg-orange-500 p-4 shadow-xl"
              >
                <div className="flex flex-col gap-3">
                  <input
                    type="number"
                    placeholder="Precio minimo"
                    value={filters.minPrice}
                    onChange={(event) => onChange('minPrice', event.target.value)}
                    className="bg-white px-3 py-2 text-sm focus:outline-none"
                  />

                  <input
                    type="number"
                    placeholder="Precio maximo"
                    value={filters.maxPrice}
                    onChange={(event) => onChange('maxPrice', event.target.value)}
                    className="bg-white px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === 'advanced' ? null : 'advanced')}
            className={`${baseButton} ${
              openDropdown === 'advanced' ? 'bg-orange-500 text-white rounded-none' : 'bg-white text-gray-700 hover:bg-orange-50 rounded-none'
            }`}
          >
            Mas filtros
          </button>

          <AnimatePresence>
            {openDropdown === 'advanced' && (
              <motion.div
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                exit={{ opacity: 0, scaleY: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformOrigin: 'top' }}
                className="absolute left-0 top-12 z-50 w-72 bg-orange-500 p-4 shadow-xl"
              >
                <div className="flex flex-col gap-4 text-sm text-white">
                  <div>
                    <label className="mb-1 block font-semibold">Dormitorios minimos</label>
                    <input
                      type="number"
                      placeholder="Ej: 2"
                      value={filters.minBedrooms}
                      onChange={(event) => onChange('minBedrooms', event.target.value)}
                      className="w-full bg-white px-3 py-2 text-gray-700"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block font-semibold">Cocheras minimas</label>
                    <input
                      type="number"
                      placeholder="Ej: 1"
                      value={filters.minParking}
                      onChange={(event) => onChange('minParking', event.target.value)}
                      className="w-full bg-white px-3 py-2 text-gray-700"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block font-semibold">Area total (m2)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Desde"
                        value={filters.minArea}
                        onChange={(event) => onChange('minArea', event.target.value)}
                        className="w-full bg-white px-3 py-2 text-gray-700"
                      />
                      <input
                        type="number"
                        placeholder="Hasta"
                        value={filters.maxArea}
                        onChange={(event) => onChange('maxArea', event.target.value)}
                        className="w-full bg-white px-3 py-2 text-gray-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block font-semibold">Tipo de anunciante</label>
                    <select
                      value={filters.publisherType}
                      onChange={(event) => onChange('publisherType', event.target.value)}
                      className="w-full bg-white px-3 py-2 text-gray-700"
                    >
                      <option value="">Todos</option>
                      <option value="inmobiliaria">Inmobiliaria</option>
                      <option value="particular">Dueno directo</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="w-full  border border-orange-500 px-4 py-3 text-center text-sm font-semibold text-gray-700 transition hover:bg-gray-100 md:w-32"
        >
          Limpiar
        </button>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-orange-500 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60 md:w-44"
        >
          {isLoading ? 'Buscando...' : 'Buscar'}
        </button>
      </div>
    </form>
  );
}
