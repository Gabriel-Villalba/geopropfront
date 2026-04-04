import { X, MapPin, BedDouble, Bath, CarFront, Maximize2, DollarSign, Eye, MessageCircle, ArrowUpRight } from 'lucide-react';
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
      .finally(() => setLoading(false));
  }, [propertyIds]);

  const formatCurrency = (amount?: number | null, currency?: string | null) => {
    if (amount == null || !currency) return '—';
    return `${currency} ${amount.toLocaleString('es-AR')}`;
  };
  const formatArea = (area?: number | null) => {
    if (area == null) return '—';
    return `${area.toLocaleString('es-AR')} m²`;
  };
  const formatVal = (val?: number | null) => (val == null ? '—' : String(val));

  const rows: { label: string; icon: React.ReactNode; getValue: (p: PropertyComparison) => string }[] = [
    { label: 'Precio', icon: <DollarSign className="w-3.5 h-3.5" />, getValue: (p) => formatCurrency(p.price, p.currency) },
    { label: 'Superficie', icon: <Maximize2 className="w-3.5 h-3.5" />, getValue: (p) => formatArea(p.area) },
    { label: 'Precio / m²', icon: <DollarSign className="w-3.5 h-3.5" />, getValue: (p) => formatCurrency(p.pricePerSqm, p.currency) },
    { label: 'Dormitorios', icon: <BedDouble className="w-3.5 h-3.5" />, getValue: (p) => formatVal(p.bedrooms) },
    { label: 'Baños', icon: <Bath className="w-3.5 h-3.5" />, getValue: (p) => formatVal(p.bathrooms) },
    { label: 'Cocheras', icon: <CarFront className="w-3.5 h-3.5" />, getValue: (p) => formatVal(p.garages) },
    { label: 'Operación', icon: <ArrowUpRight className="w-3.5 h-3.5" />, getValue: (p) => p.operation === 'sale' ? 'Venta' : 'Alquiler' },
    { label: 'Tipo', icon: <MapPin className="w-3.5 h-3.5" />, getValue: (p) => p.propertyType.replace(/_/g, ' ') },
    { label: 'Vistas', icon: <Eye className="w-3.5 h-3.5" />, getValue: (p) => p.views != null ? p.views.toLocaleString('es-AR') : '—' },
    { label: 'Consultas', icon: <MessageCircle className="w-3.5 h-3.5" />, getValue: (p) => String(p.inquiriesCount) },
  ];

  const Overlay = ({ children }: { children: React.ReactNode }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm p-4 animate-fade-in">
      {children}
    </div>
  );

  if (loading) return (
    <Overlay>
      <div className="bg-white rounded-2xl shadow-modal p-10 flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-brand-200 border-t-brand-500 animate-spin" />
        <p className="text-sm text-ink-muted">Comparando propiedades…</p>
      </div>
    </Overlay>
  );

  if (error) return (
    <Overlay>
      <div className="bg-white rounded-2xl shadow-modal p-8 max-w-sm w-full text-center">
        <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
          <X className="w-5 h-5 text-red-500" />
        </div>
        <h2 className="font-display font-semibold text-lg text-ink mb-2">No se pudo cargar</h2>
        <p className="text-sm text-ink-muted mb-6">{error}</p>
        <button onClick={onClose} className="btn-outline w-full justify-center">Cerrar</button>
      </div>
    </Overlay>
  );

  return (
    <Overlay>
      <div className="bg-white rounded-2xl shadow-modal w-full max-w-5xl max-h-[88vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="font-display font-bold text-lg text-ink">Comparar propiedades</h2>
            <p className="text-xs text-ink-muted mt-0.5">{comparisons.length} propiedades seleccionadas</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-ink-faint hover:bg-surface-muted hover:text-ink transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-auto flex-1">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-surface-soft border-b border-gray-100">
                <th className="text-left px-5 py-4 w-36 flex-shrink-0">
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint">Característica</span>
                </th>
                {comparisons.map((p) => (
                  <th key={p.id} className="text-left px-5 py-4 min-w-[220px]">
                    <p className="font-display font-semibold text-sm text-ink leading-snug">{p.title}</p>
                    {(p.city || p.province) && (
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-brand-400 flex-shrink-0" />
                        <span className="text-xs text-ink-muted truncate">{[p.city, p.province].filter(Boolean).join(', ')}</span>
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.label} className={i % 2 === 0 ? 'bg-white' : 'bg-surface-soft'}>
                  <td className="px-5 py-3.5 border-r border-gray-100">
                    <div className="flex items-center gap-2 text-ink-muted">
                      <span className="text-brand-400">{row.icon}</span>
                      <span className="text-xs font-medium">{row.label}</span>
                    </div>
                  </td>
                  {comparisons.map((p) => (
                    <td key={p.id} className="px-5 py-3.5 text-sm font-medium text-ink border-r border-gray-100 last:border-r-0">
                      {row.getValue(p)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end flex-shrink-0">
          <button onClick={onClose} className="btn-outline">Cerrar</button>
        </div>

      </div>
    </Overlay>
  );
}
