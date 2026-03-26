import { useState } from 'react';
import {
  Bath, BedDouble, CalendarClock, CarFront, ChevronDown, ChevronLeft,
  ChevronRight, ChevronUp, Home, LandPlot, LayoutGrid, MapPin,
  Maximize2, MessageCircle, X,
} from 'lucide-react';
import type { Property } from '../types';

interface PropertyModalProps {
  property: Property;
  onClose: () => void;
}

const formatPrice = (amount?: number | null, currency?: string | null) => {
  if (!amount || !currency) return 'Consultar precio';
  return `${currency} ${amount.toLocaleString('es-AR')}`;
};
const formatArea = (value?: number | null) => {
  if (value == null) return null;
  return `${value.toLocaleString('es-AR', { maximumFractionDigits: 2 })} m²`;
};
const formatCount = (value: number | null | undefined, singular: string, plural: string) => {
  if (value == null) return null;
  return `${value} ${value === 1 ? singular : plural}`;
};

export function PropertyModal({ property, onClose }: PropertyModalProps) {
  const publisherName = property.publisher?.name ?? 'Sin especificar';
  const phoneRaw = property.publisher?.phone ?? '';
  const phoneDigits = phoneRaw.replace(/\D/g, '');
  const phoneLabel = phoneRaw || 'Sin teléfono disponible';
  const whatsappLink = phoneDigits
    ? `https://wa.me/${phoneDigits}?text=Hola, quiero consultar por la propiedad ${property.id}`
    : null;

  const images =
    property.images && property.images.length > 0
      ? property.images
      : property.image
        ? [property.image]
        : ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80'];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDescription, setShowDescription] = useState(false);

  const stats = [
    { label: 'm² totales',   value: formatArea(property.specs?.totalArea),   icon: Maximize2 },
    { label: 'm² cubiertos', value: formatArea(property.specs?.coveredArea),  icon: Home },
    { label: 'm² terreno',   value: formatArea(property.specs?.landArea),     icon: LandPlot },
    { label: 'ambientes',    value: formatCount(property.specs?.rooms, 'ambiente', 'ambientes'), icon: LayoutGrid },
    { label: 'baños',        value: formatCount(property.specs?.bathrooms, 'baño', 'baños'),     icon: Bath },
    { label: 'cochera',      value: formatCount(property.specs?.parking, 'cochera', 'cocheras'), icon: CarFront },
    { label: 'dormitorios',  value: formatCount(property.specs?.bedrooms, 'dormitorio', 'dormitorios'), icon: BedDouble },
    { label: 'antigüedad',   value: formatCount(property.specs?.ageYears, 'año', 'años'),        icon: CalendarClock },
  ].filter((s) => Boolean(s.value));

  const goPrev = () => setCurrentIndex((p) => (p === 0 ? images.length - 1 : p - 1));
  const goNext = () => setCurrentIndex((p) => (p === images.length - 1 ? 0 : p + 1));

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
      <div className="relative w-full sm:max-w-4xl max-h-[96vh] sm:max-h-[92vh] overflow-y-auto bg-white sm:rounded-2xl shadow-modal">

        {/* Close */}
        <button onClick={onClose}
          className="absolute right-4 top-4 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 flex items-center justify-center text-ink hover:bg-gray-100 transition-colors shadow-sm">
          <X className="h-4 w-4" />
        </button>

        {/* Gallery */}
        <div className="relative bg-surface-muted">
          <img src={images[currentIndex]} alt={property.title}
            className="w-full h-64 sm:h-[380px] object-cover" />

          {images.length > 1 && (
            <>
              <button onClick={goPrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 flex items-center justify-center shadow-sm hover:bg-white transition-colors">
                <ChevronLeft className="h-4 w-4 text-ink" />
              </button>
              <button onClick={goNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 flex items-center justify-center shadow-sm hover:bg-white transition-colors">
                <ChevronRight className="h-4 w-4 text-ink" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, i) => (
                  <button key={i} onClick={() => setCurrentIndex(i)}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentIndex ? 'bg-white w-4' : 'bg-white/50'}`} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6">

          {/* Header */}
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              {property.operation && (
                <span className="bg-brand-50 text-brand-700 text-xs font-semibold uppercase tracking-wide px-2.5 py-1 rounded-lg border border-brand-100">
                  {property.operation}
                </span>
              )}
              {property.type && (
                <span className="bg-surface-muted text-ink-muted text-xs font-medium uppercase tracking-wide px-2.5 py-1 rounded-lg border border-gray-100">
                  {property.type}
                </span>
              )}
            </div>
            <h2 className="font-display font-bold text-2xl text-ink tracking-tight">{property.title}</h2>
            <div className="mt-2 flex items-center gap-2 text-sm text-ink-muted">
              <MapPin className="h-3.5 w-3.5 text-brand-500 flex-shrink-0" />
              <span>
                {property.location?.city}
                {property.location?.locality ? `, ${property.location.locality}` : ''}
              </span>
            </div>
            <div className="mt-3 font-display font-bold text-3xl text-ink">
              {formatPrice(property.price?.amount, property.price?.currency)}
            </div>
          </div>

          {/* Specs */}
          {stats.length > 0 && (
            <div className="bg-surface-soft rounded-2xl p-5 border border-gray-100">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-ink-muted mb-4">Características</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 px-3.5 py-3 shadow-card">
                      <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-4 w-4 text-brand-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-ink">{stat.value}</p>
                        <p className="text-[11px] text-ink-faint uppercase tracking-wide">{stat.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Description */}
          {property.descriptionShort && (
            <div className="border-t border-gray-100 pt-5">
              <button onClick={() => setShowDescription(!showDescription)}
                className="flex w-full items-center justify-between text-sm font-semibold text-ink-muted uppercase tracking-widest hover:text-ink transition-colors">
                Descripción
                {showDescription ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {showDescription && (
                <div className="mt-3 text-sm text-ink-muted leading-relaxed whitespace-pre-line">
                  {property.descriptionShort}
                  <button onClick={() => setShowDescription(false)}
                    className="mt-3 flex items-center gap-1 text-xs font-semibold text-brand-500 hover:text-brand-600">
                    Ver menos <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Contact */}
          <div className="border-t border-gray-100 pt-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="bg-surface-soft rounded-xl p-4 border border-gray-100">
                <p className="text-xs text-ink-muted mb-1.5">Publicado por</p>
                <p className="font-semibold text-sm text-ink">{publisherName}</p>
              </div>
              <div>
                {whatsappLink ? (
                  <a href={whatsappLink} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full h-full min-h-[64px] bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl transition-colors">
                    <MessageCircle className="h-4 w-4" />
                    Contactar por WhatsApp
                  </a>
                ) : (
                  <div className="flex items-center justify-center w-full h-full min-h-[64px] bg-surface-muted text-sm text-ink-muted rounded-xl border border-gray-100">
                    {phoneLabel}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
