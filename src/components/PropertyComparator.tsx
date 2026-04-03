import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { meApi } from '../services/api';
import type { PropertyComparison } from '../types';

interface PropertyComparatorProps {
  propertyIds: string[];
  onClose: () => void;
}

export default function PropertyComparator({ propertyIds, onClose }: PropertyComparatorProps) {
  const [comparisons, setComparisons] = useState<PropertyComparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (propertyIds.length === 0) return;

    setLoading(true);
    setError(null);

    meApi
      .getMyProperties()
      .then((data) => {
        const selected = data
          .filter((property) => propertyIds.includes(String(property.id)))
          .map((property) => ({
            id: property.id,
            title: property.title,
            city: property.city?.name ?? null,
            province: property.city?.province ?? null,
            price: Number(property.price),
            currency: property.currency,
            area: property.area,
            pricePerSqm:
              property.area && property.area > 0
                ? Number(property.price && property.price > 0 ? Math.round(property.price / property.area) : 0)
                : null,
            bedrooms: property.bedrooms ?? null,
            bathrooms: property.bathrooms ?? null,
            garages: property.parking ?? null,
            operation: property.operation,
            propertyType: property.propertyType,
            views: property.views ?? 0,
            inquiriesCount: 0,
          }));

        setComparisons(selected);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Error al comparar propiedades');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [propertyIds]);

  const formatCurrency = (amount?: number | null, currency?: string | null) => {
    if (amount == null || !currency) return '-';
    return `${currency} ${amount.toLocaleString('es-AR')}`;
  };

  const formatArea = (area?: number | null) => {
    if (area == null) return '-';
    return `${area.toLocaleString('es-AR')} m²`;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="w-full max-w-6xl rounded-lg bg-white p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600"></div>
              <p className="mt-4 text-sm text-gray-600">Comparando propiedades...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="w-full max-w-6xl rounded-lg bg-white p-6">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <h2 className="text-lg font-semibold text-gray-900">Comparar Propiedades</h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="py-12 text-center">
            <p className="text-red-600">{error}</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-7xl max-h-[90vh] overflow-auto rounded-lg bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Comparar Propiedades</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Característica
                </th>
                {comparisons.map((property) => (
                  <th key={property.id} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 min-w-[250px]">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-gray-900">{property.title}</p>
                      <p className="text-xs text-gray-500">{property.city}, {property.province}</p>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Precio</td>
                {comparisons.map((property) => (
                  <td key={property.id} className="px-6 py-4 text-sm text-gray-900">
                    {formatCurrency(property.price, property.currency)}
                  </td>
                ))}
              </tr>
              <tr className="bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Superficie</td>
                {comparisons.map((property) => (
                  <td key={property.id} className="px-6 py-4 text-sm text-gray-900">
                    {formatArea(property.area)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Precio por m²</td>
                {comparisons.map((property) => (
                  <td key={property.id} className="px-6 py-4 text-sm text-gray-900">
                    {formatCurrency(property.pricePerSqm, property.currency)}
                  </td>
                ))}
              </tr>
              <tr className="bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Dormitorios</td>
                {comparisons.map((property) => (
                  <td key={property.id} className="px-6 py-4 text-sm text-gray-900">
                    {property.bedrooms}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Baños</td>
                {comparisons.map((property) => (
                  <td key={property.id} className="px-6 py-4 text-sm text-gray-900">
                    {property.bathrooms}
                  </td>
                ))}
              </tr>
              <tr className="bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Cocheras</td>
                {comparisons.map((property) => (
                  <td key={property.id} className="px-6 py-4 text-sm text-gray-900">
                    {property.garages}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Tipo de Operación</td>
                {comparisons.map((property) => (
                  <td key={property.id} className="px-6 py-4 text-sm text-gray-900 capitalize">
                    {property.operation === 'sale' ? 'Venta' : 'Alquiler'}
                  </td>
                ))}
              </tr>
              <tr className="bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Tipo de Propiedad</td>
                {comparisons.map((property) => (
                  <td key={property.id} className="px-6 py-4 text-sm text-gray-900 capitalize">
                    {property.propertyType.replace(/_/g, ' ')}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Vistas</td>
                {comparisons.map((property) => (
                  <td key={property.id} className="px-6 py-4 text-sm text-gray-900">
                    {property.views != null ? property.views.toLocaleString('es-AR') : '-'}
                  </td>
                ))}
              </tr>
              <tr className="bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Consultas Recibidas</td>
                {comparisons.map((property) => (
                  <td key={property.id} className="px-6 py-4 text-sm text-gray-900">
                    {property.inquiriesCount}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="border-t border-gray-200 px-6 py-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}