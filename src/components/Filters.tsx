import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, cubicBezier, motion } from 'framer-motion';
import { ArrowRight, MapPin, ChevronDown, SlidersHorizontal, Search, RotateCcw, Mic, MicOff } from 'lucide-react';
import type { FiltersFormState } from '../hooks/useFilters';
import { useFreeSearchNormalization } from '../hooks/useFreeSearchNormalization';
import { useSantaFeCities } from '../hooks/useSantaFeCities';
import type { City, Province } from '../types';

interface FiltersProps {
  filters: FiltersFormState;
  onChange: (key: keyof FiltersFormState, value: string) => void;
  onApplyFilters: (nextFilters: FiltersFormState) => void;
  onSubmit: (nextFilters?: FiltersFormState) => void | Promise<void>;
  onReset: () => void;
  isLoading: boolean;
  provinces?: Province[];
  isLoadingProvinces?: boolean;
  citiesOverride?: City[];
  isLoadingCitiesOverride?: boolean;
  isRetryingCitiesOverride?: boolean;
  citiesErrorOverride?: string | null;
  onRetryCitiesOverride?: () => void;
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

// ── Speech Recognition types ─────────────────────────────────────────────────
type SpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

interface WindowWithSpeechRecognition extends Window {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  length: number;
  [index: number]: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionResultListLike {
  length: number;
  [index: number]: SpeechRecognitionResultLike;
}

interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultListLike;
}

interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
}

interface BrowserSpeechRecognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: ((this: BrowserSpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: BrowserSpeechRecognition, ev: SpeechRecognitionEventLike) => void) | null;
  onerror: ((this: BrowserSpeechRecognition, ev: SpeechRecognitionErrorEventLike) => void) | null;
  onend: ((this: BrowserSpeechRecognition, ev: Event) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null;
  const w = window as WindowWithSpeechRecognition;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function Filters({
  filters,
  onChange,
  onApplyFilters,
  onSubmit,
  onReset,
  isLoading,
  provinces,
  isLoadingProvinces,
  citiesOverride,
  isLoadingCitiesOverride,
  isRetryingCitiesOverride,
  citiesErrorOverride,
  onRetryCitiesOverride,
}: FiltersProps) {
  const [openDropdown, setOpenDropdown] = useState<DropdownType>(null);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeechBlocked, setIsSpeechBlocked] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLFormElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);

  const {
    cities: fallbackCities,
    isLoadingCities: fallbackLoading,
    isRetryingCities: fallbackRetrying,
    citiesError: fallbackError,
    reloadCities: fallbackReload,
  } = useSantaFeCities();

  const cities = citiesOverride ?? fallbackCities;
  const isLoadingCities = isLoadingCitiesOverride ?? fallbackLoading;
  const isRetryingCities = isRetryingCitiesOverride ?? fallbackRetrying;
  const citiesError = citiesErrorOverride ?? fallbackError;
  const reloadCities = onRetryCitiesOverride ?? fallbackReload;
  const { prepareFiltersForSubmit, resetParsedFilters } = useFreeSearchNormalization({
    cities,
    provinces,
  });
  const speechStatus = isListening
    ? { label: 'Escuchando...', tone: 'text-red-600', dot: 'bg-red-500' }
    : isSpeechBlocked
      ? { label: 'Micrófono bloqueado', tone: 'text-amber-700', dot: 'bg-amber-500' }
      : !isSpeechSupported
        ? { label: 'Micrófono no disponible', tone: 'text-ink-muted', dot: 'bg-gray-300' }
        : { label: 'Micrófono inactivo', tone: 'text-ink-muted', dot: 'bg-gray-400' };

  // Reset city si cambia la lista y la ciudad actual ya no está
  useEffect(() => {
    if (!filters.city || cities.length === 0) return;
    const hasCurrentCity = cities.some((city) => city.name === filters.city);
    if (hasCurrentCity) return;
    onChange('city', '');
  }, [cities, filters.city, onChange]);

  // Click fuera cierra dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Detectar soporte de Speech API y limpiar al desmontar
  useEffect(() => {
    setIsSpeechSupported(Boolean(getSpeechRecognitionConstructor()));
    return () => {
      recognitionRef.current?.abort();
      recognitionRef.current = null;
    };
  }, []);

  // Auto-limpiar error de voz después de 4 segundos
  useEffect(() => {
    if (!speechError) return;
    const timer = setTimeout(() => setSpeechError(null), 4000);
    return () => clearTimeout(timer);
  }, [speechError]);

  const applyTranscriptToSearch = (transcript: string) => {
    const normalizedTranscript = transcript.trim().replace(/\s+/g, ' ');
    if (!normalizedTranscript) return;

    onChange('search', normalizedTranscript);

    requestAnimationFrame(() => {
      const input = searchInputRef.current;
      if (!input) return;
      input.focus();
      input.setSelectionRange(normalizedTranscript.length, normalizedTranscript.length);
    });
  };

  const toggleVoiceSearch = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const SpeechRecognitionCtor = getSpeechRecognitionConstructor();
    if (!SpeechRecognitionCtor) {
      setSpeechError('Tu navegador no permite búsqueda por voz.');
      return;
    }

    setSpeechError(null);
    setIsSpeechBlocked(false);

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = 'es-AR';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = Array.from({ length: event.results.length - event.resultIndex })
        .map((_, offset) => event.results[event.resultIndex + offset]?.[0]?.transcript ?? '')
        .join(' ');
      applyTranscriptToSearch(transcript);
    };

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setIsSpeechBlocked(true);
        setSpeechError('Sin permiso de micrófono. Revisá los permisos del navegador.');
        return;
      }
      if (event.error === 'audio-capture') {
        setSpeechError('No se detectó micrófono disponible.');
        return;
      }
      if (event.error === 'no-speech') {
        setSpeechError('No detectamos voz. Intentá de nuevo.');
        return;
      }
      setSpeechError('No se pudo usar el micrófono.');
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      setIsListening(false);
      setSpeechError('No se pudo iniciar la grabación.');
      recognitionRef.current = null;
    }
  };

  const toggle = (key: DropdownType) => setOpenDropdown(openDropdown === key ? null : key);

  const handleNormalizedSubmit = async () => {
    const nextFilters = prepareFiltersForSubmit(filters);
    onApplyFilters(nextFilters);
    await onSubmit(nextFilters);
  };

  const handleReset = () => {
    resetParsedFilters();
    onReset();
  };

  const FilterButton = ({ id, label, active }: { id: DropdownType; label: string; active?: boolean }) => (
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
      onSubmit={(e) => {
        e.preventDefault();
        void handleNormalizedSubmit();
      }}
      className="bg-white rounded-2xl border border-gray-100 shadow-card p-4"
    >
      <div className="flex flex-wrap gap-2 items-center">

        {/* Operación */}
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
                  <button key={op.value} type="button"
                    onClick={() => { onChange('operation', op.value); setOpenDropdown(null); }}
                    className={`w-full px-4 py-2.5 text-left text-sm transition hover:bg-surface-soft ${filters.operation === op.value ? 'text-brand-600 font-semibold' : 'text-ink'}`}>
                    {op.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tipo */}
        <div className="relative">
          <FilterButton id="type" label={filters.type ? typeLabel[filters.type] : 'Tipo'} active={!!filters.type} />
          <AnimatePresence>
            {openDropdown === 'type' && (
              <motion.div {...dropdownMotion} className="absolute left-0 z-50 mt-2 w-52 bg-white rounded-xl shadow-modal border border-gray-100 py-1 overflow-hidden">
                {Object.entries(typeLabel).map(([value, label]) => (
                  <button key={value} type="button"
                    onClick={() => { onChange('type', value); setOpenDropdown(null); }}
                    className={`w-full px-4 py-2.5 text-left text-sm transition hover:bg-surface-soft ${filters.type === value ? 'text-brand-600 font-semibold' : 'text-ink'}`}>
                    {label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Provincia (solo si se pasa) */}
        {provinces && (
          <div className="relative flex items-center">
            <select
              value={filters.province}
              onChange={(e) => onChange('province', e.target.value)}
              disabled={isLoadingProvinces}
              className="pl-4 pr-8 py-2.5 text-sm border border-gray-200 rounded-xl bg-white text-ink outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition appearance-none cursor-pointer disabled:bg-gray-50 disabled:text-ink-muted min-w-[200px]"
            >
              <option value="">
                {isLoadingProvinces ? 'Cargando provincias...' : 'Provincia'}
              </option>
              {provinces.map((province) => (
                <option key={province.id} value={province.slug}>{province.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-faint pointer-events-none" />
          </div>
        )}

        {/* Ciudad */}
        <div className="relative flex items-center">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brand-400 pointer-events-none z-10" />
          <select
            value={filters.city}
            onChange={(e) => onChange('city', e.target.value)}
            disabled={isLoadingCities || Boolean(citiesError)}
            className="pl-8 pr-8 py-2.5 text-sm border border-gray-200 rounded-xl bg-white text-ink outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition appearance-none cursor-pointer disabled:bg-gray-50 disabled:text-ink-muted min-w-[200px]"
          >
            <option value="">
              {isRetryingCities ? 'Reintentando...' : isLoadingCities ? 'Cargando...' : 'Ciudad / Localidad'}
            </option>
            {cities.map((city) => (
              <option key={city.id} value={city.name}>{city.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-faint pointer-events-none" />
        </div>

        {/* Búsqueda por texto + micrófono */}
        <div className="relative flex items-center gap-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brand-400 pointer-events-none" />
            <input
              ref={searchInputRef}
              value={filters.search}
              onChange={(e) => onChange('search', e.target.value)}
              placeholder="Barrio, dirección o descripción"
              className="pl-8 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white text-ink outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition min-w-[220px]"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            title="Interpretar y buscar"
            className="flex items-center justify-center w-10 h-10 rounded-xl border border-brand-200 bg-brand-50 text-brand-600 transition-all duration-150 flex-shrink-0 hover:border-brand-300 hover:bg-brand-100 disabled:opacity-60"
          >
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Botón micrófono */}
          {isSpeechSupported && (
            <button
              type="button"
              onClick={toggleVoiceSearch}
              title={isListening ? 'Detener grabación' : isSpeechBlocked ? 'Micrófono bloqueado' : 'Buscar por voz'}
              className={`relative flex items-center justify-center w-10 h-10 rounded-xl border transition-all duration-150 flex-shrink-0 ${
                isListening
                  ? 'bg-red-500 border-red-500 text-white shadow-sm'
                  : isSpeechBlocked
                    ? 'bg-amber-50 border-amber-300 text-amber-700'
                    : 'bg-white border-gray-200 text-ink-muted hover:border-brand-300 hover:text-brand-500 hover:bg-brand-50'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4" />
                  {/* Pulso animado mientras graba */}
                  <span className="absolute inset-0 rounded-xl bg-red-400 animate-ping opacity-30" />
                </>
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>
          )}

          <div className={`ml-1 hidden sm:flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium ${speechStatus.tone}`}>
            <span className={`h-2 w-2 rounded-full ${speechStatus.dot}`} />
            <span>{speechStatus.label}</span>
          </div>
        </div>

        {/* Ordenamiento */}
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
            <option value="createdAt:desc">Más recientes</option>
            <option value="area:desc">Mayor superficie</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-faint pointer-events-none" />
        </div>

        {/* Precio */}
        <div className="relative">
          <FilterButton id="price" label="Precio" active={!!filters.minPrice || !!filters.maxPrice} />
          <AnimatePresence>
            {openDropdown === 'price' && (
              <motion.div {...dropdownMotion} className="absolute left-0 z-50 mt-2 w-64 bg-white rounded-xl shadow-modal border border-gray-100 p-4">
                <p className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-3">Rango de precio</p>
                <div className="space-y-2">
                  <input type="number" placeholder="Mínimo" value={filters.minPrice}
                    onChange={(e) => onChange('minPrice', e.target.value)} className="input-base" />
                  <input type="number" placeholder="Máximo" value={filters.maxPrice}
                    onChange={(e) => onChange('maxPrice', e.target.value)} className="input-base" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Más filtros */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggle('advanced')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-150 ${
              openDropdown === 'advanced'
                ? 'bg-brand-500 text-white border-brand-500'
                : 'bg-white text-ink border-gray-200 hover:border-brand-300 hover:bg-brand-50'
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
                    <input type="number" placeholder="Ej: 2" value={filters.minBedrooms}
                      onChange={(e) => onChange('minBedrooms', e.target.value)} className="input-base" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-ink-muted mb-1 block">Cocheras mínimas</label>
                    <input type="number" placeholder="Ej: 1" value={filters.minParking}
                      onChange={(e) => onChange('minParking', e.target.value)} className="input-base" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-ink-muted mb-1 block">Área total (m²)</label>
                    <div className="flex gap-2">
                      <input type="number" placeholder="Desde" value={filters.minArea}
                        onChange={(e) => onChange('minArea', e.target.value)} className="input-base" />
                      <input type="number" placeholder="Hasta" value={filters.maxArea}
                        onChange={(e) => onChange('maxArea', e.target.value)} className="input-base" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-ink-muted mb-1 block">Tipo de anunciante</label>
                    <select value={filters.publisherType}
                      onChange={(e) => onChange('publisherType', e.target.value)} className="select-base">
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

        {/* Limpiar + Buscar */}
        <button type="button" onClick={handleReset} className="btn-ghost gap-1.5">
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Limpiar</span>
        </button>

        <button type="submit" disabled={isLoading} className="btn-primary disabled:opacity-60">
          <Search className="w-4 h-4" />
          {isLoading ? 'Buscando…' : 'Buscar'}
        </button>
      </div>

      {/* Error de voz */}
      <AnimatePresence>
        {speechError && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-3 flex items-center justify-between border border-amber-100 bg-amber-50 rounded-xl px-4 py-2.5 text-xs text-amber-700"
          >
            <span>{speechError}</span>
            <button type="button" onClick={() => setSpeechError(null)}
              className="ml-3 font-semibold hover:underline">
              Cerrar
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error de ciudades */}
      {citiesError && (
        <div className="mt-3 flex items-center justify-between border border-red-100 bg-red-50 rounded-xl px-4 py-3 text-xs text-red-700">
          <span>No se pudieron cargar las ciudades.</span>
          <button type="button" onClick={() => void reloadCities()}
            className="font-semibold underline ml-3">
            Reintentar
          </button>
        </div>
      )}

      {/* Reintentando ciudades */}
      {isRetryingCities && !citiesError && (
        <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs text-amber-700">
          Reintentando conexión con el servidor de ciudades...
        </div>
      )}
    </form>
  );
}
