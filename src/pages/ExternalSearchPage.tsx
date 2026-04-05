import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import { Filters, Navbar, Pagination, PropertyCard } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { useFilters } from '../hooks/useFilters';
import { useLocations } from '../hooks/useLocations';
import { usePagination } from '../hooks/usePagination';
import { useProperties } from '../hooks/useProperties';
import type { Property } from '../types';

function toCsvValue(value: string | number | null | undefined) {
  if (value === null || value === undefined) return '';
  const raw = String(value).replace(/"/g, '""');
  return `"${raw}"`;
}

function buildCsv(properties: Property[]) {
  const header = [
    'titulo',
    'precio',
    'moneda',
    'ciudad',
    'localidad',
    'tipo',
    'operacion',
    'dormitorios',
    'banos',
    'superficie',
    'link',
  ];

  const rows = properties.map((property) => [
    toCsvValue(property.title),
    toCsvValue(property.price?.amount ?? property.price?.raw ?? ''),
    toCsvValue(property.price?.currency ?? ''),
    toCsvValue(property.location?.city ?? ''),
    toCsvValue(property.location?.locality ?? ''),
    toCsvValue(property.type ?? ''),
    toCsvValue(property.operation ?? ''),
    toCsvValue(property.specs?.bedrooms ?? ''),
    toCsvValue(property.specs?.bathrooms ?? ''),
    toCsvValue(property.specs?.totalArea ?? ''),
    toCsvValue(property.sourceUrl ?? ''),
  ]);

  return [header.join(','), ...rows.map((row) => row.join(','))].join('\n');
}

export default function ExternalSearchPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAllowed = user?.plan === 'INMOBILIARIA' || user?.plan === 'BROKER';
  const { filters, params, updateFilter, resetFilters } = useFilters();
  const { provinces, cities, isLoadingProvinces, isLoadingCities, citiesError, reloadCities } = useLocations(filters.province);
  const { properties, isLoading, isRetrying, error, hasFetched, fetchProperties } = useProperties();
  const { visibleItems, currentPage, totalPages, totalCount, goToPage } = usePagination(properties, 6);

  const selectedProvince = useMemo(
    () => provinces.find((province) => province.slug === filters.province),
    [filters.province, provinces],
  );

  const handleSubmit = useCallback(async () => {
    if (!isAllowed) return;
    const externalParams = {
      ...params,
      external: 'ml',
      province: selectedProvince?.name,
      city: filters.city || undefined,
    };
    await fetchProperties(externalParams);
  }, [fetchProperties, filters.city, isAllowed, params, selectedProvince]);

  const handleReset = useCallback(() => {
    resetFilters();
  }, [resetFilters]);

  const handleDownloadCsv = () => {
    const csv = buildCsv(properties);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'busqueda-externa.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-surface-soft pt-16">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="mt-6 inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink transition-colors font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al buscador
        </button>

        <header className="py-8 sm:py-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2 max-w-2xl">
              <h1 className="font-display font-bold text-3xl sm:text-4xl text-ink tracking-tight leading-tight">
                Búsqueda externa
              </h1>
              <p className="text-ink-muted text-sm leading-relaxed">
                Consultá oportunidades en portales externos sin salir de GeoProp.
              </p>
              {!isAllowed && (
                <p className="text-xs text-rose-600">
                  Esta función está disponible solo para planes Inmobiliaria o Broker.
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleDownloadCsv}
                disabled={properties.length === 0}
                className="btn-ghost gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Descargar CSV
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                disabled={properties.length === 0}
                className="btn-ghost gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Printer className="w-4 h-4" />
                Imprimir
              </button>
            </div>
          </div>
        </header>

        <Filters
          filters={filters}
          onChange={updateFilter}
          onSubmit={handleSubmit}
          onReset={handleReset}
          isLoading={isLoading}
          provinces={provinces}
          isLoadingProvinces={isLoadingProvinces}
          citiesOverride={cities}
          isLoadingCitiesOverride={isLoadingCities}\n          isRetryingCitiesOverride={false}\n          citiesErrorOverride={citiesError}
          onRetryCitiesOverride={() => void reloadCities()}
        />

        {error && (
          <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="mt-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center rounded-2xl bg-white border border-gray-100 py-20 shadow-card">
              <div className="w-10 h-10 rounded-full border-2 border-brand-200 border-t-brand-500 animate-spin" />
              <p className="mt-4 text-sm text-ink-muted">
                {isRetrying ? 'Reintentando conexión...' : 'Buscando...' }
              </p>
            </div>
          ) : hasFetched ? (
            properties.length > 0 ? (
              <div>
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="font-display font-semibold text-lg text-ink">
                    {totalCount} resultado{totalCount !== 1 ? 's' : ''}
                  </h2>
                  <span className="text-sm text-ink-muted">Mostrando {visibleItems.length}</span>
                </div>
                <div key={currentPage} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {visibleItems.map((property, index) => (
                    <PropertyCard
                      key={`${property.id}-${index}`}
                      property={property}
                      index={index}
                      onClick={() => {
                        if (property.sourceUrl) {
                          window.open(property.sourceUrl, '_blank', 'noopener,noreferrer');
                        }
                      }}
                    />
                  ))}
                </div>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl bg-white border border-gray-100 py-20 shadow-card text-center px-6">
                <h3 className="font-display font-semibold text-lg text-ink">Sin resultados</h3>
                <p className="mt-2 text-sm text-ink-muted max-w-xs">Probá con otra zona o filtros.</p>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl bg-white border border-gray-100 py-20 shadow-card text-center px-6">
              <h3 className="font-display font-semibold text-lg text-ink">Empezá a buscar</h3>
              <p className="mt-2 text-sm text-ink-muted max-w-xs">Elegí provincia, ciudad y filtros para buscar en portales externos.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

