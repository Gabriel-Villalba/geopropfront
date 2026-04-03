import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { meApi } from '../services/api';
import type { ZonePriceStat } from  '../types';

interface ZonePriceStatsProps {
  className?: string;
}

export default function ZonePriceStats({ className = '' }: ZonePriceStatsProps) {
  const [stats, setStats] = useState<ZonePriceStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    meApi
      .getZonePriceStats()
      .then((data) => {
        setStats(data);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Error al cargar estadísticas de zona');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const formatCurrency = (amount: number | null, currency: string | null) => {
    if (amount === null || !currency) return '-';
    return `${currency} ${Math.round(amount).toLocaleString('es-AR')}`;
  };

  const getPriceComparison = (userPrice: number, marketAvg: number | null) => {
    if (marketAvg === null) return { status: 'unknown', difference: 0 };

    const difference = ((userPrice - marketAvg) / marketAvg) * 100;
    if (difference > 5) return { status: 'above', difference: Math.round(difference) };
    if (difference < -5) return { status: 'below', difference: Math.round(difference) };
    return { status: 'average', difference: Math.round(difference) };
  };

  if (loading) {
    return (
      <div className={`rounded-lg bg-white p-6 shadow-sm border border-gray-200 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-lg bg-white p-6 shadow-sm border border-gray-200 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Estadísticas de Precio por Zona</h3>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  if (stats.length === 0) {
    return (
      <div className={`rounded-lg bg-white p-6 shadow-sm border border-gray-200 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Estadísticas de Precio por Zona</h3>
        <p className="text-gray-500 text-sm">No hay suficientes datos para mostrar estadísticas de zona.</p>
      </div>
    );
  }

  return (
    <div className={`rounded-lg bg-white p-6 shadow-sm border border-gray-200 ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Estadísticas de Precio por Zona</h3>
        <p className="text-sm text-gray-600 mt-1">
          Precio promedio por m² en las zonas donde tienes propiedades activas
        </p>
      </div>

      <div className="space-y-4">
        {stats.map((stat) => (
          <div key={stat.cityId} className="border border-gray-100 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">{stat.cityName}</h4>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {formatCurrency(stat.avgPricePerM2, stat.currency)}
                </p>
                <p className="text-xs text-gray-500">promedio / m²</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <p className="text-xs text-gray-500">Mínimo</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatCurrency(stat.minPricePerM2, stat.currency)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Máximo</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatCurrency(stat.maxPricePerM2, stat.currency)}
                </p>
              </div>
            </div>

            {stat.userProperties && stat.userProperties.length > 0 && (
              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs text-gray-500 mb-2">Tus propiedades en esta zona:</p>
                <div className="space-y-2">
                  {stat.userProperties.map((property) => {
                    const comparison = getPriceComparison(
                      property.pricePerSqm,
                      stat.avgPricePerM2
                    );

                    return (
                      <div key={property.id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700 truncate mr-2" title={property.title}>
                          {property.title}
                        </span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="font-medium text-gray-900">
                            {formatCurrency(property.pricePerSqm, stat.currency)}
                          </span>
                          {comparison.status === 'above' && (
                            <div className="flex items-center text-green-600">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              <span className="text-xs">+{comparison.difference}%</span>
                            </div>
                          )}
                          {comparison.status === 'below' && (
                            <div className="flex items-center text-red-600">
                              <TrendingDown className="h-3 w-3 mr-1" />
                              <span className="text-xs">{comparison.difference}%</span>
                            </div>
                          )}
                          {comparison.status === 'average' && (
                            <div className="flex items-center text-gray-500">
                              <Minus className="h-3 w-3 mr-1" />
                              <span className="text-xs">~{comparison.difference}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-700">
          💡 <strong>¿Sabías?</strong> Los precios mostrados son promedios actuales del mercado.
          Compara tus precios con el mercado para optimizar tus ventas.
        </p>
      </div>
    </div>
  );
}