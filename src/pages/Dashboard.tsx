import { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filters, Navbar, Pagination, PropertyCard } from '../components';
import { useFilters } from '../hooks/useFilters';
import { usePagination } from '../hooks/usePagination';
import { useProperties } from '../hooks/useProperties';
import { Heart, PackageOpen, Search, TrendingUp } from 'lucide-react';
import { PublishPropertyCTA } from '../components/PublishPropertyCTA';
import { useFavorites } from '../hooks/useFavorites';
import { useAuth } from '../contexts/AuthContext';

export function Dashboard() {
  const { filters, params, updateFilter, resetFilters } = useFilters();
  const { properties, isLoading, isRetrying, error, hasFetched, fetchProperties } = useProperties();
  const { visibleItems, currentPage, totalPages, totalCount, goToPage } = usePagination(properties, 6);
  const { favorites } = useFavorites();
  const { user } = useAuth();
  const navigate = useNavigate();
  const initialParamsRef = useRef(params);
  const canExternalSearch = user?.plan === 'INMOBILIARIA' || user?.plan === 'BROKER';

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
    <div className="min-h-screen bg-surface-soft pt-16">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">

        {/* Hero header */}
        <header className="py-10 sm:py-14">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-600 text-xs font-semibold px-3 py-1.5 rounded-full border border-brand-100">
                <TrendingUp className="w-3.5 h-3.5" />
                Rafaela, Santa Fe
              </div>
              <h1 className="font-display font-bold text-3xl sm:text-4xl text-ink tracking-tight leading-tight">
                Encontrá tu próxima<br className="hidden sm:block" /> propiedad
              </h1>
              <p className="text-ink-muted text-base leading-relaxed">
                Explorá, filtrá y compará cientos de inmuebles. Simple, rápido y sin vueltas.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {canExternalSearch && (
                <button
                  type="button"
                  onClick={() => navigate('/busqueda-externa')}
                  className="btn-ghost border border-gray-200 hover:border-brand-200"
                >
                  Búsqueda externa
                </button>
              )}
              <PublishPropertyCTA />
            </div>
          </div>
        </header>

        {/* Filters */}
        <Filters filters={filters} onChange={updateFilter} onSubmit={handleSubmit} onReset={handleReset} isLoading={isLoading} />

        {/* Error */}
        {error && (
          <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Results */}
        <section className="mt-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center rounded-2xl bg-white border border-gray-100 py-20 shadow-card">
              <div className="w-10 h-10 rounded-full border-2 border-brand-200 border-t-brand-500 animate-spin" />
              <p className="mt-4 text-sm text-ink-muted">
                {isRetrying ? 'Reintentando conexión...' : 'Cargando...'}
              </p>
            </div>
          ) : hasFetched ? (
            properties.length > 0 ? (
              <div>
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="font-display font-semibold text-lg text-ink">
                    {totalCount} resultado{totalCount !== 1 ? 's' : ''}
                  </h2>
                  <div className="flex items-center gap-3 text-sm text-ink-muted">
                    <button
                      type="button"
                      onClick={() => navigate('/favoritos')}
                      className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-100 transition"
                    >
                      <Heart className="h-3.5 w-3.5" />
                      {favorites.length} favorito{favorites.length !== 1 ? 's' : ''}
                    </button>
                    <span>Mostrando {visibleItems.length}</span>
                  </div>
                </div>

                <div key={currentPage} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {visibleItems.map((property, index) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      index={index}
                      onClick={() => navigate(`/properties/${property.id}`, { state: { property } })}
                    />
                  ))}
                </div>

                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} />
              </div>
            ) : (
              <EmptyState
                icon={<PackageOpen className="w-10 h-10 text-ink-faint" />}
                title="Sin resultados"
                description="Ajustá los filtros para ver más propiedades."
              />
            )
          ) : (
            <EmptyState
              icon={<Search className="w-10 h-10 text-ink-faint" />}
              title="Empezá a explorar"
              description="Aplicá filtros para buscar propiedades en Rafaela y zona."
            />
          )}
        </section>
      </main>

    </div>
  );
}

function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-white border border-gray-100 py-20 shadow-card text-center px-6">
      <div className="mb-4 p-4 bg-surface-muted rounded-2xl">
        {icon}
      </div>
      <h3 className="font-display font-semibold text-lg text-ink">{title}</h3>
      <p className="mt-2 text-sm text-ink-muted max-w-xs">{description}</p>
    </div>
  );
}
