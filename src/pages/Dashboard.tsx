import { useCallback, useEffect, useRef, useState } from 'react';
import { Filters, Navbar, Pagination, PropertyCard, PropertyModal } from '../components';
import { useFilters } from '../hooks/useFilters';
import { usePagination } from '../hooks/usePagination';
import { useProperties } from '../hooks/useProperties';
import { PackageOpen, Search } from 'lucide-react';
import type { Property } from '../types';
import { PublishPropertyCTA } from '../components/PublishPropertyCTA';

export function Dashboard() {
  const { filters, params, updateFilter, resetFilters } = useFilters();
  const { properties, isLoading, error, hasFetched, fetchProperties } = useProperties();

  const { visibleItems, currentPage, totalPages, totalCount, goToPage } = usePagination(properties, 6);

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const initialParamsRef = useRef(params);

  useEffect(() => {
    void fetchProperties(initialParamsRef.current);
  }, [fetchProperties]);

  const handleSubmit = useCallback(async () => {
    await fetchProperties(params);
  }, [fetchProperties, params]);

  const handleReset = useCallback(() => {
    resetFilters();
    void fetchProperties(initialParamsRef.current);
  }, [fetchProperties, resetFilters]);

  return (
    <div className="min-h-screen bg-white/30 pt-20 backdrop-blur-sm sm:pt-24">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <header className="mb-6 space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">GeoProp: El mapa de tu futura propiedad.</h1>
              <p className="mt-2 text-gray-600">
               Explorá, filtrá y compará cientos de inmuebles. Simple, rápido y sin vueltas.
              </p>
            </div>

            <PublishPropertyCTA />
          </div>
        </header>

        <Filters filters={filters} onChange={updateFilter} onSubmit={handleSubmit} onReset={handleReset} isLoading={isLoading} />

        {error && <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

        <section className="mt-10">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 shadow">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
              <p className="mt-4 text-gray-600">Buscando propiedades...</p>
            </div>
          ) : hasFetched ? (
            properties.length > 0 ? (
              <div>
                <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">{totalCount} Resultados</h2>
                  <p className="text-sm text-gray-500">Mostrando {visibleItems.length} resultados</p>
                </div>

                <div key={currentPage} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {visibleItems.map((property, index) => (
                    <PropertyCard key={property.id} property={property} index={index} onClick={() => setSelectedProperty(property)} />
                  ))}
                </div>

                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 shadow">
                <PackageOpen className="mb-4 h-16 w-16 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-900">No se encontraron propiedades</h3>
                <p className="mt-2 text-center text-gray-600">Ajusta los filtros para ver mas resultados.</p>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 shadow">
              <Search className="mb-4 h-16 w-16 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900">Empieza a explorar</h3>
              <p className="mt-2 text-center text-gray-600">Aplica filtros para buscar propiedades en Rafaela.</p>
            </div>
          )}
        </section>
      </main>

      {selectedProperty && <PropertyModal property={selectedProperty} onClose={() => setSelectedProperty(null)} />}
    </div>
  );
}
