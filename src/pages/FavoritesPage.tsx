import { useNavigate } from 'react-router-dom';
import { HeartOff } from 'lucide-react';
import { Navbar, PropertyCard } from '../components';
import { useFavorites } from '../hooks/useFavorites';

export default function FavoritesPage() {
  const navigate = useNavigate();
  const { favorites } = useFavorites();

  return (
    <div className="min-h-screen bg-surface-soft pt-16">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <header className="py-10 sm:py-12">
          <h1 className="font-display font-bold text-3xl text-ink tracking-tight">Favoritos</h1>
          <p className="mt-2 text-sm text-ink-muted">GuardÃ¡ propiedades para volver cuando quieras.</p>
        </header>

        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-white border border-gray-100 py-20 shadow-card text-center px-6">
            <div className="mb-4 p-4 bg-surface-muted rounded-2xl">
              <HeartOff className="w-10 h-10 text-ink-faint" />
            </div>
            <h3 className="font-display font-semibold text-lg text-ink">Sin favoritos</h3>
            <p className="mt-2 text-sm text-ink-muted max-w-xs">
              ExplorÃ¡ el listado y guardÃ¡ propiedades para verlas mÃ¡s tarde.
            </p>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="mt-6 btn-primary"
            >
              Ir al listado
            </button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((property, index) => (
              <PropertyCard
                key={property.id}
                property={property}
                index={index}
                onClick={() => navigate(`/properties/${property.id}`, { state: { property } })}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
