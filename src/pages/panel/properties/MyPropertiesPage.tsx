import { ArrowLeft, Heart, MessageCircle, Plus, TrendingUp, UploadCloud, FileSpreadsheet, FileText, CheckCircle2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../../components';
import { PropertyComparator, ZonePriceStats } from '../../../components';
import { useAuth } from '../../../contexts/AuthContext';
import { ExpiringPropertiesAlert, RenewListingModal } from '../../../features/listings';
import { useFavorites } from '../../../hooks/useFavorites';
import { useOwnerPanel } from '../../../hooks/useOwnerPanel';
import { importApi, meApi } from '../../../services/api';
import type { BulkImportSummary, PropertyPerformanceMetric, ZonePriceStat } from '../../../types';
import type { RenewListingPayload } from '../../../types';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

function statusBadge(status: string): string {
  if (status === 'active' || status === 'approved') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (status === 'draft' || status === 'pending') return 'bg-amber-50 text-amber-700 border-amber-200';
  if (status === 'expired') return 'bg-slate-100 text-slate-700 border-slate-200';
  if (status === 'rejected') return 'bg-rose-50 text-rose-700 border-rose-200';
  return 'bg-rose-50 text-rose-700 border-rose-200';
}

function resolveImageUrl(rawUrl?: string | null): string | null {
  if (!rawUrl || !rawUrl.trim()) return null;
  if (/^https?:\/\//i.test(rawUrl)) return rawUrl;
  if (rawUrl.startsWith('data:')) return rawUrl;

  const apiBase = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';
  const base = apiBase.replace(/\/api\/?$/i, '');
  if (rawUrl.startsWith('/')) return `${base}${rawUrl}`;
  return `${base}/${rawUrl}`;
}

type PanelImageItem = {
  id?: string;
  imageUrl?: string | null;
  order?: number;
  isPrimary?: boolean;
};

const IMPORT_FIELDS = [
  { key: 'title', label: 'Titulo' },
  { key: 'price', label: 'Precio' },
  { key: 'operation', label: 'Operacion' },
  { key: 'type', label: 'Tipo' },
  { key: 'city', label: 'Ciudad' },
  { key: 'province', label: 'Provincia' },
  { key: 'address', label: 'Direccion' },
  { key: 'bedrooms', label: 'Dormitorios' },
  { key: 'bathrooms', label: 'Baños' },
  { key: 'totalArea', label: 'm2 total' },
  { key: 'coveredArea', label: 'm2 cubiertos' },
  { key: 'images', label: 'Imagenes (URLs)' },
  { key: 'publisherName', label: 'Inmobiliaria' },
  { key: 'publisherPhone', label: 'Telefono' },
  { key: 'sourceUrl', label: 'URL origen' },
  { key: 'description', label: 'Descripcion' },
];

const HEADER_ALIASES: Record<string, string[]> = {
  title: ['titulo', 'title', 'propiedad', 'nombre'],
  price: ['precio', 'price', 'importe', 'valor'],
  operation: ['operacion', 'operation', 'tipo_operacion'],
  type: ['tipo', 'type', 'tipo_propiedad', 'property_type'],
  city: ['ciudad', 'city', 'localidad', 'municipio'],
  province: ['provincia', 'province', 'state'],
  address: ['direccion', 'address', 'domicilio'],
  bedrooms: ['dormitorios', 'bedrooms', 'habitaciones'],
  bathrooms: ['banos', 'baños', 'bathrooms'],
  totalArea: ['sup_total', 'superficie_total', 'area_total', 'm2_total'],
  coveredArea: ['sup_cubierta', 'superficie_cubierta', 'area_cubierta', 'm2_cubiertos'],
  images: ['imagenes', 'fotos', 'images', 'images_urls'],
  publisherName: ['inmobiliaria', 'publisher', 'publisher_name', 'agencia'],
  publisherPhone: ['telefono', 'phone', 'publisher_phone'],
  sourceUrl: ['url', 'link', 'source', 'source_url'],
  description: ['descripcion', 'description', 'detalle', 'detalles'],
};

function normalizeHeader(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '');
}

function buildAutoMapping(headers: string[]) {
  const mapping: Record<string, string> = {};

  IMPORT_FIELDS.forEach((field) => {
    const aliases = HEADER_ALIASES[field.key] ?? [];
    const match = headers.find((header) =>
      aliases.some((alias) => normalizeHeader(alias) === normalizeHeader(header)),
    );
    if (match) mapping[field.key] = match;
  });

  return mapping;
}

function normalizePanelImages(images: unknown): Array<PanelImageItem & { canDelete: boolean }> {
  if (!Array.isArray(images)) return [];

  return images
    .map((item, index) => {
      if (typeof item === 'string') {
        return {
          id: `image-${index}`,
          imageUrl: item,
          order: index,
          isPrimary: index === 0,
          canDelete: false,
        };
      }

      if (item && typeof item === 'object') {
        const image = item as PanelImageItem;
        return {
          id: image.id,
          imageUrl: image.imageUrl ?? null,
          order: typeof image.order === 'number' ? image.order : index,
          isPrimary: Boolean(image.isPrimary),
          canDelete: Boolean(image.id),
        };
      }

      return {
        id: `image-${index}`,
        imageUrl: null,
        order: index,
        isPrimary: false,
        canDelete: false,
      };
    })
    .filter((image) => Boolean(image.imageUrl));
}

function BulkImportPanel({ onImported }: { onImported: () => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'parsing' | 'ready' | 'importing' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [summary, setSummary] = useState<BulkImportSummary | null>(null);

  const resetState = () => {
    setFile(null);
    setHeaders([]);
    setRows([]);
    setMapping({});
    setStatus('idle');
    setMessage(null);
    setSummary(null);
  };

  const parseFile = async (selected: File) => {
    setStatus('parsing');
    setMessage(null);
    setSummary(null);

    const isCsv =
      selected.name.toLowerCase().endsWith('.csv') ||
      selected.type.includes('csv');

    try {
      if (isCsv) {
        Papa.parse(selected, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const parsedRows = (results.data ?? []) as Record<string, unknown>[];
            const parsedHeaders = results.meta?.fields ?? Object.keys(parsedRows[0] ?? {});
            setHeaders(parsedHeaders);
            setRows(parsedRows.slice(0, 5));
            setMapping(buildAutoMapping(parsedHeaders));
            setFile(selected);
            setStatus('ready');
          },
          error: (error) => {
            setStatus('error');
            setMessage(error.message || 'No se pudo leer el CSV.');
          },
        });
      } else {
        const buffer = await selected.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parsedRows = XLSX.utils.sheet_to_json(sheet, { defval: '' }) as Record<string, unknown>[];
        const parsedHeaders = parsedRows.length ? Object.keys(parsedRows[0]) : [];
        setHeaders(parsedHeaders);
        setRows(parsedRows.slice(0, 5));
        setMapping(buildAutoMapping(parsedHeaders));
        setFile(selected);
        setStatus('ready');
      }
    } catch (error) {
      setStatus('error');
      setMessage((error as Error).message || 'No se pudo leer el archivo.');
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (!selected) return;
    void parseFile(selected);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const dropped = event.dataTransfer.files?.[0];
    if (!dropped) return;
    void parseFile(dropped);
  };

  const handleImport = async () => {
    if (!file) return;
    setStatus('importing');
    setMessage(null);

    try {
      const payloadMapping = Object.fromEntries(
        Object.entries(mapping).filter(([, value]) => Boolean(value)),
      );
      const result = await importApi.bulkImport({ file, mapping: payloadMapping });
      setSummary(result);
      setStatus('done');
      onImported();
    } catch (error) {
      setStatus('error');
      setMessage((error as Error).message || 'No se pudo importar el archivo.');
    }
  };

  return (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">Importar CSV/Excel</p>
          <p className="text-xs text-slate-500">Arrastra un archivo o selecciona uno para previsualizar.</p>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <UploadCloud className="h-4 w-4" />
          Elegir archivo
        </button>
      </div>

      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
        className="mt-3 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-xs text-slate-500"
      >
        <div className="flex items-center gap-2 text-slate-600">
          <FileSpreadsheet className="h-4 w-4" />
          <FileText className="h-4 w-4" />
          <span>{file ? file.name : 'CSV o Excel (XLSX)'}</span>
        </div>
        <p className="mt-1 text-[11px]">Hasta 5 filas de preview. Mapping editable antes de confirmar.</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        className="hidden"
        onChange={handleFileChange}
      />

      {status === 'parsing' && (
        <p className="mt-3 text-xs text-slate-500">Leyendo archivo...</p>
      )}

      {message && (
        <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {message}
        </div>
      )}

      {status !== 'idle' && headers.length > 0 && (
        <div className="mt-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {IMPORT_FIELDS.map((field) => (
              <label key={field.key} className="text-xs text-slate-600">
                {field.label}
                <select
                  value={mapping[field.key] ?? ''}
                  onChange={(event) =>
                    setMapping((prev) => ({
                      ...prev,
                      [field.key]: event.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs text-slate-700"
                >
                  <option value="">Sin asignar</option>
                  {headers.map((header) => (
                    <option key={`${field.key}-${header}`} value={header}>
                      {header}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>

          {rows.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-[600px] w-full text-xs">
                <thead className="bg-slate-100 text-slate-500">
                  <tr>
                    {headers.map((header) => (
                      <th key={header} className="px-3 py-2 text-left font-semibold">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-slate-700">
                  {rows.map((row, index) => (
                    <tr key={`row-${index}`} className="border-t border-slate-200">
                      {headers.map((header) => (
                        <td key={`${index}-${header}`} className="px-3 py-2">
                          {String(row[header] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleImport}
              disabled={status === 'importing' || !file}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-300"
            >
              <UploadCloud className="h-4 w-4" />
              {status === 'importing' ? 'Importando...' : 'Confirmar importacion'}
            </button>
            <button
              type="button"
              onClick={resetState}
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Limpiar
            </button>
          </div>

          {summary && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="h-4 w-4" />
                Importacion completa
              </div>
              <p className="mt-1">Total: {summary.total} | Creados: {summary.creados} | Actualizados: {summary.actualizados}</p>
              {summary.errores?.length > 0 && (
                <ul className="mt-2 list-disc pl-4">
                  {summary.errores.slice(0, 5).map((error, index) => (
                    <li key={`${error.row}-${index}`}>
                      Fila {error.row}: {error.message}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MyPropertiesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [renewModalPropertyId, setRenewModalPropertyId] = useState<string | null>(null);
  const [renewModalTitle, setRenewModalTitle] = useState('');
  const [renewModalType, setRenewModalType] = useState<'normal' | 'featured'>('normal');
  const [renewModalDuration, setRenewModalDuration] = useState<15 | 30 | 60>(30);
  const [integrationMessage, setIntegrationMessage] = useState<string | null>(null);
  const { isFavorite } = useFavorites();
  const [metrics, setMetrics] = useState<Record<string, PropertyPerformanceMetric>>({});
  const [selectedCompare, setSelectedCompare] = useState<string[]>([]);
  const [showComparator, setShowComparator] = useState(false);
  const [zoneStats, setZoneStats] = useState<ZonePriceStat[]>([]);
  const {
    profile,
    myProperties,
    expiringSoon,
    isLoading,
    listingActionPropertyId,
    message,
    loadPanel,
    activateProperty,
    deactivateProperty,
    approveProperty,
    deleteProperty,
    deletePropertyImage,
    renewPropertyListing,
    createPreferenceAndRedirect,
  } = useOwnerPanel();

  useEffect(() => {
    void loadPanel();
  }, [loadPanel]);

  useEffect(() => {
    let active = true;
    meApi
      .getPropertyPerformance()
      .then((data) => {
        if (!active) return;
        const map: Record<string, PropertyPerformanceMetric> = {};
        data.forEach((item) => {
          map[item.id] = item;
        });
        setMetrics(map);
      })
      .catch(() => null);

    meApi
      .getZonePriceStats()
      .then((data) => {
        if (active) setZoneStats(data);
      })
      .catch(() => null);

    return () => {
      active = false;
    };
  }, []);

  const isAdmin = useMemo(() => {
    const role = (profile?.role ?? user?.role ?? '').toLowerCase();
    return role === 'admin';
  }, [profile?.role, user?.role]);

  const plan = useMemo(() => {
    return (profile?.plan ?? user?.plan ?? 'FREE').toUpperCase();
  }, [profile?.plan, user?.plan]);

  const hasBulkIntegrations = plan === 'INMOBILIARIA' || plan === 'BROKER';
  const hasZoneStats = plan === 'INMOBILIARIA' || plan === 'BROKER';

  const toggleCompare = (propertyId: string) => {
    setSelectedCompare((prev) => {
      if (prev.includes(propertyId)) {
        return prev.filter((id) => id !== propertyId);
      }
      if (prev.length >= 3) return prev;
      return [...prev, propertyId];
    });
  };

  const compareItems = selectedCompare
    .map((id) => metrics[id])
    .filter((item): item is PropertyPerformanceMetric => Boolean(item));

  const formatMoney = (value?: number | null, currency?: string | null) => {
    if (value == null || !currency) return '-';
    return `${currency} ${Number(value).toLocaleString('es-AR')}`;
  };

  const pricePerM2 = (price?: number, area?: number | null) => {
    if (!price || !area || area <= 0) return null;
    return Math.round(price / area);
  };

  const openRenewModal = (
    property: { id: string; title: string; listing?: { listingType?: 'normal' | 'featured'; listingDuration?: 15 | 30 | 60 } },
    forcedType?: 'normal' | 'featured',
  ) => {
    setRenewModalPropertyId(property.id);
    setRenewModalTitle(property.title);
    setRenewModalType(forcedType ?? property.listing?.listingType ?? 'normal');
    setRenewModalDuration(property.listing?.listingDuration ?? 30);
  };

  const closeRenewModal = () => {
    setRenewModalPropertyId(null);
    setRenewModalTitle('');
    setRenewModalType('normal');
    setRenewModalDuration(30);
  };

  const handleConfirmRenew = async (selection: RenewListingPayload) => {
    if (!renewModalPropertyId) return;

    if (selection.listingType === 'featured') {
      await createPreferenceAndRedirect({
        propertyId: renewModalPropertyId,
        type: selection.listingType,
        duration: selection.listingDuration,
      });
      return;
    }

    await renewPropertyListing(renewModalPropertyId, selection);
    closeRenewModal();
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20 sm:pt-24">
      <Navbar />

      <main className="mx-auto w-full max-w-5xl px-4 pb-10 sm:px-6">
        <ExpiringPropertiesAlert
          items={expiringSoon}
          renewingPropertyId={listingActionPropertyId}
          onRenew={(item) => {
            const sourceProperty = myProperties.find((property) => property.id === item.propertyId);
            openRenewModal(
              {
                id: item.propertyId,
                title: item.title,
                listing: sourceProperty?.listing,
              },
              item.listingType,
            );
          }}
        />

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate('/panel')}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al panel
          </button>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => navigate('/panel/inquiries')}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <MessageCircle className="h-4 w-4" />
              Ver consultas
            </button>
            <button
              type="button"
              onClick={() => navigate('/panel/properties/publish')}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Nueva publicacion
            </button>
          </div>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">Mis propiedades</h1>
          <p className="mt-1 text-sm text-slate-600">Administra tus publicaciones activas y en revision.</p>

          {hasBulkIntegrations && (
            <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
              <p className="font-semibold">Integraciones para {plan}</p>
              <p className="mt-1 text-xs text-blue-800">
                Puedes conectar tu sistema o importar un CSV/Excel con mapeo de columnas.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setIntegrationMessage('Integracion solicitada. Te contactaremos para configurar la API.')}
                  className="rounded-lg border border-blue-300 bg-white px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                >
                  Conectar sistema
                </button>
              </div>
              {integrationMessage && <p className="mt-2 text-xs text-blue-800">{integrationMessage}</p>}

              <BulkImportPanel
                onImported={() => {
                  void loadPanel();
                }}
              />
            </div>
          )}

          {message && (
            <div
              className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
                message.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-rose-200 bg-rose-50 text-rose-700'
              }`}
            >
              {message.text}
            </div>
          )}

          {isLoading ? (
            <p className="mt-6 text-sm text-slate-600">Cargando propiedades...</p>
          ) : myProperties.length === 0 ? (
            <p className="mt-6 text-sm text-slate-600">No tenes propiedades registradas.</p>
          ) : (
            <div className="mt-6 space-y-3">
              {myProperties.map((entry) => (
                <article key={entry.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-base font-semibold text-slate-900">{entry.title}</h2>
                      <p className="text-sm text-slate-600">{entry.city?.name ?? entry.cityId}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {isFavorite(entry.id) && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-600">
                          <Heart className="h-3 w-3" />
                          Favorito
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => toggleCompare(entry.id)}
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold transition ${
                          selectedCompare.includes(entry.id)
                            ? 'border-brand-200 bg-brand-50 text-brand-700'
                            : 'border-slate-200 bg-slate-100 text-slate-600'
                        }`}
                      >
                        Comparar
                      </button>
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusBadge(entry.listing?.status ?? entry.status)}`}>
                        {entry.listing?.status ?? entry.status}
                      </span>
                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                          (entry.listing?.isActive ?? entry.isActive)
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-slate-200 bg-slate-100 text-slate-600'
                        }`}
                      >
                        {(entry.listing?.isActive ?? entry.isActive) ? 'Activa' : 'Inactiva'}
                      </span>
                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                          entry.listing?.isFeatured || entry.isFeatured
                            ? 'border-amber-200 bg-amber-50 text-amber-700'
                            : 'border-slate-200 bg-slate-100 text-slate-600'
                        }`}
                      >
                        {entry.listing?.isFeatured || entry.isFeatured ? 'Destacado' : 'Normal'}
                      </span>
                    </div>
                  </div>

                  {entry.listing?.listingExpiresAt && (
                    <p className="mt-2 text-xs text-slate-600">
                      Vence: {new Date(entry.listing.listingExpiresAt).toLocaleDateString('es-AR')}
                    </p>
                  )}
                  {metrics[entry.id] && (
                    <div className="mt-3 grid gap-2 sm:grid-cols-3 text-xs text-slate-600">
                      <div className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2">
                        <p className="text-[11px] text-slate-500">Vistas esta semana</p>
                        <p className="text-sm font-semibold text-slate-900">{metrics[entry.id].viewsCurrent}</p>
                        <p className="text-[11px] text-slate-500">Semana anterior: {metrics[entry.id].viewsPrevious}</p>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2">
                        <p className="text-[11px] text-slate-500">Consultas esta semana</p>
                        <p className="text-sm font-semibold text-slate-900">{metrics[entry.id].inquiriesCurrent}</p>
                        <p className="text-[11px] text-slate-500">Semana anterior: {metrics[entry.id].inquiriesPrevious}</p>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 flex items-center justify-between">
                        <div>
                          <p className="text-[11px] text-slate-500">ConversiÃ³n total</p>
                          <p className="text-sm font-semibold text-slate-900">
                            {(metrics[entry.id].conversion * 100).toFixed(1)}%
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Semana vs anterior: {metrics[entry.id].changePercent >= 0 ? '+' : ''}
                            {metrics[entry.id].changePercent}%
                          </p>
                        </div>
                        <TrendingUp className={`h-4 w-4 ${metrics[entry.id].changePercent >= 0 ? 'text-emerald-500' : 'text-rose-500'}`} />
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/panel/properties/${entry.id}/edit`)}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/panel/properties/${entry.id}/inquiries`, { state: { propertyTitle: entry.title } })}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Consultas
                    </button>
                    <button
                      type="button"
                      onClick={() => void activateProperty(entry.id)}
                      className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500"
                    >
                      Activar
                    </button>
                    <button
                      type="button"
                      onClick={() => void deactivateProperty(entry.id)}
                      className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-amber-400"
                    >
                      Desactivar
                    </button>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => void approveProperty(entry.id)}
                        className="rounded-lg bg-cyan-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-cyan-500"
                      >
                        Aprobar
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => void deleteProperty(entry.id)}
                      className="rounded-lg border border-rose-300 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
                    >
                      Eliminar
                    </button>
                    <button
                      type="button"
                      onClick={() => openRenewModal(entry)}
                      className="rounded-lg border border-blue-300 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-50"
                    >
                      Renovar
                    </button>
                    <button
                      type="button"
                      onClick={() => openRenewModal(entry, 'featured')}
                      className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-amber-400"
                    >
                      Destacar propiedad
                    </button>
                  </div>

                  <div className="mt-4">
                    {normalizePanelImages(entry.images).length > 0 ? (
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {normalizePanelImages(entry.images)
                          .slice()
                          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                          .map((image) => {
                            const resolvedImageUrl = resolveImageUrl(image.imageUrl);

                            return (
                              <article key={image.id} className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                                {resolvedImageUrl ? (
                                  <img
                                    src={resolvedImageUrl}
                                    alt={`Imagen de ${entry.title}`}
                                    className="h-24 w-full rounded-md object-cover"
                                  />
                                ) : (
                                  <div className="flex h-24 w-full items-center justify-center rounded-md border border-dashed border-slate-300 bg-white text-xs text-slate-500">
                                    Imagen no disponible
                                  </div>
                                )}
                                {image.canDelete && image.id ? (
                                  <button
                                    type="button"
                                    onClick={() => void deletePropertyImage(entry.id, image.id)}
                                    className="mt-2 w-full rounded-md border border-rose-300 px-2 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
                                  >
                                    Eliminar imagen
                                  </button>
                                ) : (
                                  <p className="mt-2 text-center text-[11px] text-slate-500">Imagen cargada</p>
                                )}
                              </article>
                            );
                          })}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">Sin imagenes cargadas.</p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {compareItems.length >= 2 && (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Comparador de propiedades</h2>
            <p className="text-xs text-slate-600 mb-4">SeleccionÃ¡ hasta 3 propiedades para comparar.</p>
            <div className="overflow-x-auto">
              <table className="min-w-[700px] w-full text-xs">
                <thead>
                  <tr className="text-left text-slate-500">
                    <th className="py-2">Campo</th>
                    {compareItems.map((item) => (
                      <th key={item.id} className="py-2">{item.title}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-slate-700">
                  <tr className="border-t">
                    <td className="py-2">Precio</td>
                    {compareItems.map((item) => (
                      <td key={item.id} className="py-2">{formatMoney(item.price, item.currency)}</td>
                    ))}
                  </tr>
                  <tr className="border-t">
                    <td className="py-2">mÂ² total</td>
                    {compareItems.map((item) => (
                      <td key={item.id} className="py-2">{item.totalArea ?? '-'}</td>
                    ))}
                  </tr>
                  <tr className="border-t">
                    <td className="py-2">mÂ² cubierto</td>
                    {compareItems.map((item) => (
                      <td key={item.id} className="py-2">{item.coveredArea ?? '-'}</td>
                    ))}
                  </tr>
                  <tr className="border-t">
                    <td className="py-2">Precio / mÂ²</td>
                    {compareItems.map((item) => (
                      <td key={item.id} className="py-2">
                        {pricePerM2(item.price, item.totalArea)
                          ? `${item.currency} ${pricePerM2(item.price, item.totalArea)?.toLocaleString('es-AR')}`
                          : '-'}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t">
                    <td className="py-2">UbicaciÃ³n</td>
                    {compareItems.map((item) => (
                      <td key={item.id} className="py-2">{item.location ?? '-'}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        )}

        {hasZoneStats && zoneStats.length > 0 && (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Precio promedio por zona</h2>
            <p className="text-xs text-slate-600 mb-4">Rango actual estimado (no histÃ³rico).</p>
            <div className="overflow-x-auto">
              <table className="min-w-[600px] w-full text-xs">
                <thead>
                  <tr className="text-left text-slate-500">
                    <th className="py-2">Ciudad</th>
                    <th className="py-2">Promedio / mÂ²</th>
                    <th className="py-2">MÃ­nimo</th>
                    <th className="py-2">MÃ¡ximo</th>
                  </tr>
                </thead>
                <tbody className="text-slate-700">
                  {zoneStats.map((stat) => (
                    <tr key={stat.cityId} className="border-t">
                      <td className="py-2">{stat.cityName}</td>
                      <td className="py-2">
                        {stat.avgPricePerM2 ? `USD ${Math.round(stat.avgPricePerM2).toLocaleString('es-AR')}` : '-'}
                      </td>
                      <td className="py-2">
                        {stat.minPricePerM2 ? `USD ${Math.round(stat.minPricePerM2).toLocaleString('es-AR')}` : '-'}
                      </td>
                      <td className="py-2">
                        {stat.maxPricePerM2 ? `USD ${Math.round(stat.maxPricePerM2).toLocaleString('es-AR')}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      <RenewListingModal
        open={Boolean(renewModalPropertyId)}
        propertyTitle={renewModalTitle}
        initialType={renewModalType}
        initialDuration={renewModalDuration}
        isSubmitting={Boolean(listingActionPropertyId)}
        error={
          message?.type === 'error' && listingActionPropertyId === renewModalPropertyId
            ? message.text
            : null
        }
        onClose={closeRenewModal}
        onConfirm={handleConfirmRenew}
      />

      {showComparator && (
        <PropertyComparator
          propertyIds={selectedCompare}
          onClose={() => setShowComparator(false)}
        />
      )}
    </div>
  );
}
