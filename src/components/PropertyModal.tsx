import { useState } from 'react';
import {
  Bath,
  BedDouble,
  CalendarClock,
  CarFront,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Home,
  LandPlot,
  LayoutGrid,
  MapPin,
  Maximize2,
  MessageCircle,
  X,
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
  if (value === null || value === undefined) return null;
  return `${value.toLocaleString('es-AR', { maximumFractionDigits: 2 })} m2`;
};

const formatCount = (value: number | null | undefined, singular: string, plural: string) => {
  if (value === null || value === undefined) return null;
  return `${value} ${value === 1 ? singular : plural}`;
};

export function PropertyModal({ property, onClose }: PropertyModalProps) {
  const publisherName = property.publisher?.name ?? 'Sin especificar';
  const phoneRaw = property.publisher?.phone ?? '';
  const phoneDigits = phoneRaw.replace(/\D/g, '');
  const phoneLabel = phoneRaw || 'Sin telefono disponible';
  const whatsappLink = phoneDigits
    ? `https://wa.me/${phoneDigits}?text=Hola, quiero consultar por la propiedad ${property.id}`
    : null;

  const images =
    property.images && property.images.length > 0
      ? property.images
      : property.image
        ? [property.image]
        : ['https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80'];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDescription, setShowDescription] = useState(false);

  const stats = [
    {
      label: 'm2 totales',
      value: formatArea(property.specs?.totalArea),
      icon: Maximize2,
    },
    {
      label: 'm2 cubiertos',
      value: formatArea(property.specs?.coveredArea),
      icon: Home,
    },
    {
      label: 'm2 terreno',
      value: formatArea(property.specs?.landArea),
      icon: LandPlot,
    },
    {
      label: 'ambientes',
      value: formatCount(property.specs?.rooms, 'ambiente', 'ambientes'),
      icon: LayoutGrid,
    },
    {
      label: 'banos',
      value: formatCount(property.specs?.bathrooms, 'bano', 'banos'),
      icon: Bath,
    },
    {
      label: 'cochera',
      value: formatCount(property.specs?.parking, 'cochera', 'cocheras'),
      icon: CarFront,
    },
    {
      label: 'dormitorios',
      value: formatCount(property.specs?.bedrooms, 'dormitorio', 'dormitorios'),
      icon: BedDouble,
    },
    {
      label: 'anos antiguedad',
      value: formatCount(property.specs?.ageYears, 'ano', 'anos'),
      icon: CalendarClock,
    },
  ].filter((stat) => Boolean(stat.value));

  const goPrev = () => setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  const goNext = () => setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
      <div className="relative max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-6 top-4 z-10 rounded-full bg-orange-500 p-2 text-white shadow transition hover:bg-orange-600"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative px-8 pt-8">
          <div className="relative rounded-xl bg-gray-100 p-4">
            <img src={images[currentIndex]} alt={property.title} className="max-h-[400px] w-full rounded-lg object-contain" />

            {images.length > 1 && (
              <>
                <button
                  onClick={goPrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <button
                  onClick={goNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="space-y-6 p-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{property.title}</h2>

            <div className="mt-2 flex items-center gap-2 text-gray-600">
              <MapPin className="h-4 w-4 text-orange-500" />
              <span>
                {property.location?.city}
                {property.location?.locality ? `, ${property.location.locality}` : ''}
              </span>
            </div>

            <div className="mt-4 text-xl font-semibold text-gray-900">{formatPrice(property.price?.amount, property.price?.currency)}</div>

            {(property.operation || property.type) && (
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide">
                {property.operation && (
                  <span className="rounded-full bg-orange-100 px-3 py-1 text-orange-700">{property.operation}</span>
                )}
                {property.type && <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">{property.type}</span>}
              </div>
            )}
          </div>

          {stats.length > 0 && (
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-500">CARACTERISTICAS</h3>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/80 p-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-orange-500 shadow-sm">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-base font-semibold text-gray-900">{stat.value}</p>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{stat.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {property.descriptionShort && (
            <div>
              <button
                onClick={() => setShowDescription(!showDescription)}
                className="flex w-full items-center justify-between border-b pb-2 text-sm font-semibold uppercase text-gray-500"
              >
                DESCRIPCION
                {showDescription ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {showDescription && (
                <div className="mt-3 whitespace-pre-line text-sm text-gray-700">
                  {property.descriptionShort}

                  <button
                    onClick={() => setShowDescription(false)}
                    className="mt-4 flex items-center gap-1 text-xs font-semibold text-orange-500"
                  >
                    VER MENOS
                    <ChevronUp className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="border-t pt-6">
            <div className="flex flex-col gap-4 border-t pt-6 sm:grid sm:grid-cols-2 sm:gap-3">
              <div className="flex flex-col">
                <p className="mb-2 text-sm text-gray-600">Publicado por:</p>
                <div className="flex-1">
                  <div className="w-full rounded-xl bg-orange-500 px-4 py-3 text-center text-sm font-semibold text-white">
                    {publisherName}
                  </div>
                </div>
              </div>

              <div className="flex flex-col">
                <p className="mb-2 text-sm text-gray-600">Contactar anunciante:</p>
                {whatsappLink ? (
                  <div className="space-y-2">
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-green-600 text-sm font-semibold text-white transition-all duration-200 hover:bg-green-700"
                    >
                      <MessageCircle className="h-5 w-5" />
                      <span>Contactar por WhatsApp</span>
                    </a>
                    <div className="text-center text-xs text-gray-600">{phoneLabel}</div>
                  </div>
                ) : (
                  <div className="flex h-12 w-full items-center justify-center rounded-xl bg-gray-100 text-sm text-gray-500">
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
