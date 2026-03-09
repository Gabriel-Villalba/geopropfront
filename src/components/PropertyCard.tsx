import { motion } from 'framer-motion';
import { Bath, BedDouble, CarFront, MapPin, Maximize2 } from 'lucide-react';
import { FeaturedBadge } from '../features/listings';
import type { Property } from '../types';

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
  'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80';

export function PropertyCard({ property, onClick, index }: PropertyCardProps) {
  const imageUrl = getImageUrl(property);
  const publisherName = property.publisher?.name ?? 'GeoProp';
  const isFeatured = property.listing?.isFeatured ?? false;

  return (
    <motion.article
      onClick={onClick}
      initial={{
        opacity: 0,
        x: index % 3 === 0 ? -80 : index % 3 === 2 ? 80 : 0,
        y: 40,
      }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{
        type: 'spring',
        stiffness: 70,
        damping: 18,
        delay: Math.floor(index / 3) * 0.25,
      }}
      className="group cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative h-52 w-full overflow-hidden">
        <img
          src={imageUrl}
          alt={property.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {property.type && (
          <span className="absolute left-4 top-4 rounded-full border border-orange-500 bg-white/90 px-3 py-1 text-xs font-semibold uppercase text-gray-700 shadow">
            {property.type}
          </span>
        )}
        <FeaturedBadge isFeatured={isFeatured} className="absolute right-4 top-4" />

        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
          <span className="rounded-xl border border-orange-500 bg-white px-4 py-2 text-sm font-semibold">Ver mas</span>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="text-xl font-bold text-gray-900">{formatPrice(property.price?.amount, property.price?.currency)}</div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4 text-blue-600" />
          <span>
            {property.location?.city}
            {property.location?.locality ? `, ${property.location.locality}` : ''}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
          {property.specs?.totalArea && (
            <div className="flex items-center gap-2">
              <Maximize2 className="h-4 w-4 text-blue-600" />
              <span>{property.specs.totalArea} m2</span>
            </div>
          )}

          {property.specs?.bedrooms && (
            <div className="flex items-center gap-2">
              <BedDouble className="h-4 w-4 text-blue-600" />
              <span>{property.specs.bedrooms} dorm.</span>
            </div>
          )}

          {property.specs?.bathrooms && (
            <div className="flex items-center gap-2">
              <Bath className="h-4 w-4 text-blue-600" />
              <span>{property.specs.bathrooms} banos</span>
            </div>
          )}

          {property.specs?.parking && (
            <div className="flex items-center gap-2">
              <CarFront className="h-4 w-4 text-blue-600" />
              <span>{property.specs.parking} coch.</span>
            </div>
          )}
        </div>

        <div className="border-t pt-3 text-xs text-gray-500">
          Publicado por <span className="font-semibold text-gray-800">{publisherName}</span>
        </div>
      </div>
    </motion.article>
  );
}
