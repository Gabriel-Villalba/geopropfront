import { useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, MapPin, MessageCircle, X } from 'lucide-react';
import type { Property } from '../types';

interface PropertyModalProps {
  property: Property;
  onClose: () => void;
}

const formatPrice = (amount?: number | null, currency?: string | null) => {
  if (!amount || !currency) return 'Consultar precio';
  return `${currency} ${amount.toLocaleString('es-AR')}`;
};

export function PropertyModal({ property, onClose }: PropertyModalProps) {
  const publisherName = property.publisher?.name ?? 'GeoProp';
  const phoneRaw = property.publisher?.phone ?? '';
  const phoneDigits = phoneRaw.replace(/\D/g, '');
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

        <div className="flex flex-wrap items-center gap-3 bg-gray-50 px-8 py-4 text-sm text-gray-700">
          {property.type && <span className="font-medium capitalize">{property.type}</span>}
          {property.specs?.bedrooms && <span>{property.specs.bedrooms} dormitorios</span>}
          {property.specs?.bathrooms && <span>{property.specs.bathrooms} banos</span>}
          {property.specs?.parking && <span>{property.specs.parking} cochera</span>}
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
          </div>

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
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-green-600 text-sm font-semibold text-white transition-all duration-200 hover:bg-green-700"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span>Contactar por WhatsApp</span>
                  </a>
                ) : (
                  <div className="flex h-12 w-full items-center justify-center rounded-xl bg-gray-100 text-sm text-gray-500">
                    Sin telefono disponible
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
