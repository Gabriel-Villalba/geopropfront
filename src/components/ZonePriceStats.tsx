import { TrendingUp, TrendingDown, Minus, BarChart2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { meApi } from '../services/api';
import type { ZonePriceStat } from '../types';

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
      .then((data) => setStats(data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Error al cargar estadísticas de zona'))
      .finally(() => setLoading(false));
  }, []);

  const formatCurrency = (amount: number | null, currency: string | null) => {
    if (amount === null || !currency) return '—';
    return `${currency} ${Math.round(amount).toLocaleString('es-AR')}`;
  };

  const getPriceComparison = (userPrice: number, marketAvg: number | null) => {
    if (marketAvg === null) return { status: 'unknown', difference: 0 };
    const difference = ((userPrice - marketAvg) / marketAvg) * 100;
    if (difference > 5)  return { status: 'above',   difference: Math.round(difference) };
    if (difference < -5) return { status: 'below',   difference: Math.round(difference) };
    return                      { status: 'average', difference: Math.round(difference) };
  };

  // ── Loading ──────────────────────────────────────────────────
  if (loading) return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-card p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
          <BarChart2 className="w-4 h-4 text-brand-500" />
        </div>
        <div className="h-4 bg-surface-muted rounded-full w-48 animate-pulse" />
      </div>
      <div className="space-y-3">
        {[1,2,3].map((i) => (
          <div key={i} className="h-3 bg-surface-muted rounded-full animate-pulse" style={{ width: `${70 - i*10}%` }} />
        ))}
      </div>
    </div>
  );

  // ── Error ────────────────────────────────────────────────────
  if (error) return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-card p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
          <BarChart2 className="w-4 h-4 text-brand-500" />
        </div>
        <h3 className="font-display font-semibold text-base text-ink">Precio por zona</h3>
      </div>
      <p className="text-sm text-red-600">{error}</p>
    </div>
  );

  // ── Empty ────────────────────────────────────────────────────
  if (stats.length === 0) return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-card p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
          <BarChart2 className="w-4 h-4 text-brand-500" />
        </div>
        <h3 className="font-display font-semibold text-base text-ink">Precio por zona</h3>
      </div>
      <p className="text-sm text-ink-muted">No hay suficientes datos para mostrar estadísticas de zona.</p>
    </div>
  );

  // ── Main ─────────────────────────────────────────────────────
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-card p-6 ${className}`}>

      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
          <BarChart2 className="w-4 h-4 text-brand-500" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-base text-ink">Precio por zona</h3>
          <p className="text-xs text-ink-muted mt-0.5">Promedio / m² en zonas con propiedades activas</p>
        </div>
      </div>

      {/* Zone cards */}
      <div className="space-y-3">
        {stats.map((stat) => (
          <div key={stat.cityId} className="bg-surface-soft rounded-xl border border-gray-100 p-4">

            {/* City + avg */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <h4 className="font-display font-semibold text-sm text-ink">{stat.cityName}</h4>
              <div className="text-right flex-shrink-0">
                <p className="font-display font-bold text-base text-ink">
                  {formatCurrency(stat.avgPricePerM2, stat.currency)}
                </p>
                <p className="text-[11px] text-ink-faint">promedio / m²</p>
              </div>
            </div>

            {/* Min / Max */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-white rounded-lg border border-gray-100 px-3 py-2">
                <p className="text-[11px] text-ink-faint mb-0.5">Mínimo</p>
                <p className="text-sm font-semibold text-ink">{formatCurrency(stat.minPricePerM2, stat.currency)}</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-100 px-3 py-2">
                <p className="text-[11px] text-ink-faint mb-0.5">Máximo</p>
                <p className="text-sm font-semibold text-ink">{formatCurrency(stat.maxPricePerM2, stat.currency)}</p>
              </div>
            </div>

            {/* User properties */}
            {stat.userProperties && stat.userProperties.length > 0 && (
              <div className="border-t border-gray-100 pt-3 space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint">
                  Tus propiedades en esta zona
                </p>
                {stat.userProperties.map((property) => {
                  const cmp = getPriceComparison(property.pricePerSqm, stat.avgPricePerM2);
                  return (
                    <div key={property.id} className="flex items-center justify-between gap-3 bg-white rounded-lg border border-gray-100 px-3 py-2.5">
                      <span className="text-sm text-ink truncate" title={property.title}>
                        {property.title}
                      </span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-sm font-semibold text-ink">
                          {formatCurrency(property.pricePerSqm, stat.currency)}
                        </span>
                        {cmp.status === 'above' && (
                          <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-lg">
                            <TrendingUp className="w-3 h-3" />
                            <span className="text-[11px] font-semibold">+{cmp.difference}%</span>
                          </div>
                        )}
                        {cmp.status === 'below' && (
                          <div className="flex items-center gap-1 bg-red-50 text-red-600 px-2 py-0.5 rounded-lg">
                            <TrendingDown className="w-3 h-3" />
                            <span className="text-[11px] font-semibold">{cmp.difference}%</span>
                          </div>
                        )}
                        {cmp.status === 'average' && (
                          <div className="flex items-center gap-1 bg-surface-muted text-ink-muted px-2 py-0.5 rounded-lg">
                            <Minus className="w-3 h-3" />
                            <span className="text-[11px] font-semibold">~{cmp.difference}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        ))}
      </div>

      {/* Tip */}
      <div className="mt-4 bg-brand-50 rounded-xl border border-brand-100 px-4 py-3">
        <p className="text-xs text-brand-700 leading-relaxed">
          <span className="font-semibold">Tip:</span> Los precios son promedios actuales del mercado.
          Comparalos con los tuyos para optimizar tus publicaciones.
        </p>
      </div>

    </div>
  );
}
