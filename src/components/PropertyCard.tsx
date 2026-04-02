import { motion } from 'framer-motion';
import { Bath, BedDouble, CarFront, MapPin, Maximize2, ArrowUpRight, Heart } from 'lucide-react';
import { FeaturedBadge } from '../features/listings';
import type { Property } from '../types';
import { useFavorites } from '../hooks/useFavorites';

interface PropertyCardProps {
  property: Property;
  onClick: () => void;
  index: number;
}

const formatPrice = (amount?: number | null, currency?: string | null) => {
  if (!amount || !currency) return 'Consultar';
  return `${currency} ${amount.toLocaleString('es-AR')}`;
};

const getImageUrl = (property: Property) =>
  property.images?.[0] ||
  property.image ||
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80';

const shouldShowCoveredPrice = (type?: Property['type'] | null) =>
  type === 'casa' || type === 'comercial' || type === 'galpon-deposito';

const formatPricePerM2 = (amount?: number | null, area?: number | null, currency?: string | null) => {
  if (!amount || !area || !currency) return null;
  if (area <= 0) return null;
  return `${currency} ${Math.round(amount / area).toLocaleString('es-AR')}`;
};

const formatRelativeDate = (iso?: string | null) => {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return 'Publicado hoy';
  if (diffDays === 1) return 'Publicado ayer';
  if (diffDays < 30) return `Publicado hace ${diffDays} días`;
  return `Publicado el ${date.toLocaleDateString('es-AR')}`;
};

export function PropertyCard({ property, onClick, index }: PropertyCardProps) {
  const imageUrl = getImageUrl(property);
  const publisherName = property.publisher?.name ?? 'Sin especificar';
  const isFeatured = property.listing?.isFeatured ?? false;
  const publishedLabel = formatRelativeDate(property.publishedAt ?? property.createdAt ?? null);
  const pricePerM2Total = formatPricePerM2(
    property.price?.amount,
    property.specs?.totalArea,
    property.price?.currency,
  );
  const showCovered = shouldShowCoveredPrice(property.type);
  const pricePerM2Covered = showCovered
    ? formatPricePerM2(property.price?.amount, property.specs?.coveredArea, property.price?.currency)
    : null;
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(property.id);

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
      <div className="relative h-48 overflow-hidden bg-surface-muted">
        <img
          src={imageUrl}
          alt={property.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

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
        {pricePerM2Total && (
          <div className="text-xs text-ink-muted">
            {pricePerM2Total} / m² total
          </div>
        )}
        {pricePerM2Covered && (
          <div className="text-xs text-ink-muted">
            {pricePerM2Covered} / m² cubierto
          </div>
        )}
        {publishedLabel && <div className="text-xs text-ink-faint">{publishedLabel}</div>}

        {/* Location */}
        <div className="flex items-center gap-1.5 text-sm text-ink-muted">
          <MapPin className="h-3.5 w-3.5 text-brand-500 flex-shrink-0" />
          <span className="truncate">
            {property.location?.city}
            {property.location?.locality ? `, ${property.location.locality}` : ''}
          </span>
        </div>

        {/* Specs */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm text-ink-muted">
          {property.specs?.totalArea && (
            <div className="flex items-center gap-1.5">
              <Maximize2 className="h-3.5 w-3.5 text-brand-400" />
              <span>{property.specs.totalArea} m²</span>
            </div>
          )}
          {property.specs?.bedrooms && (
            <div className="flex items-center gap-1.5">
              <BedDouble className="h-3.5 w-3.5 text-brand-400" />
              <span>{property.specs.bedrooms} dorm.</span>
            </div>
          )}
          {property.specs?.bathrooms && (
            <div className="flex items-center gap-1.5">
              <Bath className="h-3.5 w-3.5 text-brand-400" />
              <span>{property.specs.bathrooms} baños</span>
            </div>
          )}
          {property.specs?.parking && (
            <div className="flex items-center gap-1.5">
              <CarFront className="h-3.5 w-3.5 text-brand-400" />
              <span>{property.specs.parking} coch.</span>
            </div>
          )}
        </div>

        {/* Publisher */}
        <div className="pt-3 border-t border-gray-100 text-xs text-ink-muted">
          Por <span className="font-medium text-ink">{publisherName}</span>
        </div>
      </div>
    </motion.article>
  );
}
