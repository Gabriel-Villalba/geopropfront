import { motion } from 'framer-motion';
import { ArrowUpRight, Heart } from 'lucide-react';
import { FeaturedBadge } from '../features/listings';
import type { Property } from '../types';
import { useFavorites } from '../hooks/useFavorites';

interface PropertyCardProps {
  property: Property;
  onClick: () => void;
  index: number;
}

const formatPrice = (amount?: number | null, currency?: string | null) => {
  if (!amount || !currency) return 'Consultar precio';
  return `${currency} ${amount.toLocaleString('es-AR')}`;
};

const getImageUrl = (property: Property) =>
  property.images?.[0] ||
  property.image ||
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80';

const getSoldBadge = (property: Property) => {
  if (!property.soldAt) return null;
  const soldDate = new Date(property.soldAt);
  if (Number.isNaN(soldDate.getTime())) return null;
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - soldDate.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0 || diffDays > 30) return null;
  return property.soldType === 'rent' ? 'ALQUILADO' : 'VENDIDO';
};

export function PropertyCard({ property, onClick, index }: PropertyCardProps) {
  const imageUrl = getImageUrl(property);
  const isFeatured = property.listing?.isFeatured ?? false;
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(property.id);
  const soldBadge = getSoldBadge(property);

  return (
    <motion.article
      onClick={onClick}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        ease: [0.22, 1, 0.36, 1],
        delay: (index % 6) * 0.06,
      }}
      className="group cursor-pointer bg-surface-card rounded-2xl overflow-hidden shadow-card border border-gray-100 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden bg-surface-muted">
        <img
          src={imageUrl}
          alt={property.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {soldBadge && (
          <span className="absolute left-[-52px] top-4 w-40 -rotate-45 bg-rose-500 text-white text-[11px] font-bold uppercase tracking-wide text-center py-1 shadow-md">
            {soldBadge}
          </span>
        )}

        {/* Operation badge */}
        {property.operation && (
          <span className="absolute left-3 top-3 bg-white/95 backdrop-blur-sm text-ink text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-lg shadow-sm">
            {property.operation === 'venta' ? 'Venta' : property.operation === 'alquiler' ? 'Alquiler' : property.operation}
          </span>
        )}

        {/* Property type */}
        {property.type && (
          <span className="absolute left-3 bottom-3 bg-ink/80 backdrop-blur-sm text-white text-[11px] font-medium uppercase tracking-wide px-2.5 py-1 rounded-lg">
            {property.type}
          </span>
        )}
        <FeaturedBadge isFeatured={isFeatured} className="absolute right-3 top-3" />

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            toggleFavorite(property);
          }}
          className={`absolute right-3 bottom-3 w-9 h-9 rounded-full border flex items-center justify-center transition ${
            favorite
              ? 'bg-rose-500 border-rose-500 text-white'
              : 'bg-white/90 border-gray-200 text-ink hover:bg-white'
          }`}
          aria-label={favorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
          <Heart className="w-4 h-4" fill={favorite ? 'currentColor' : 'none'} />
        </button>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-ink/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="flex items-center gap-1.5 bg-white text-ink text-sm font-semibold px-4 py-2 rounded-xl shadow-lg">
            Ver propiedad
            <ArrowUpRight className="w-4 h-4" />
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Price */}
        <div className="font-display font-bold text-xl text-ink tracking-tight">
          {formatPrice(property.price?.amount, property.price?.currency)}
        </div>

      </div>
    </motion.article>
  );
}
