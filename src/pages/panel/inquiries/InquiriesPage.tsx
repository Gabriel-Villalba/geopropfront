import { ArrowLeft, Building2, Calendar, Mail, Phone } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Navbar, Pagination } from '../../../components';
import { inquiryApi } from '../../../services/api';
import { getApiErrorMessage } from '../../../services/backend';
import type { InquiryListParams, PaginationMeta, PropertyInquiry } from '../../../types';

interface LocationState {
  propertyTitle?: string;
}

const DEFAULT_LIMIT = 20;

function toIsoStart(dateValue: string): string | undefined {
  if (!dateValue) return undefined;
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

function toIsoEnd(dateValue: string): string | undefined {
  if (!dateValue) return undefined;
  const date = new Date(`${dateValue}T23:59:59`);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

function formatDateLabel(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('es-AR');
}

export default function InquiriesPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const propertyId = id ?? null;

  const [items, setItems] = useState<PropertyInquiry[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const title = useMemo(() => {
    if (propertyId) {
      return state?.propertyTitle ? `Consultas de ${state.propertyTitle}` : 'Consultas de propiedad';
    }
    return 'Todas las consultas';
  }, [propertyId, state?.propertyTitle]);

  const subtitle = useMemo(() => {
    if (propertyId && !state?.propertyTitle) {
      return `Propiedad ID: ${propertyId}`;
    }
    return 'Visualiza los contactos recibidos segun tus permisos.';
  }, [propertyId, state?.propertyTitle]);

  const loadInquiries = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const params: InquiryListParams = {
      page,
      limit: DEFAULT_LIMIT,
    };

    const fromIso = toIsoStart(from);
    const toIso = toIsoEnd(to);
    if (fromIso) params.from = fromIso;
    if (toIso) params.to = toIso;

    try {
      const response = propertyId
        ? await inquiryApi.listByProperty(propertyId, params)
        : await inquiryApi.list(params);

      setItems(response.items);
      setPagination(response.pagination);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
      setItems([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, [from, page, propertyId, to]);

  useEffect(() => {
    void loadInquiries();
  }, [loadInquiries]);

  const handleClearFilters = () => {
    setFrom('');
    setTo('');
    setPage(1);
  };

  const total = pagination?.total ?? 0;
  const totalPages = pagination?.pages ?? 1;

  return (
    <div className="min-h-screen bg-slate-50 pt-20 sm:pt-24">
      <Navbar />

      <main className="mx-auto w-full max-w-5xl px-4 pb-10 sm:px-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate(propertyId ? '/panel/properties' : '/panel')}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al panel
          </button>

          <div className="flex flex-wrap gap-2">
            {propertyId && (
              <button
                type="button"
                onClick={() => navigate('/panel/inquiries')}
                className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Ver todas las consultas
              </button>
            )}
          </div>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
              <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
              Total: {total}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <div className="flex flex-col gap-1 text-xs text-slate-600">
              <label htmlFor="from">Desde</label>
              <input
                id="from"
                type="date"
                value={from}
                onChange={(event) => {
                  setFrom(event.target.value);
                  setPage(1);
                }}
                className="rounded-lg border border-slate-300 px-2.5 py-2 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1 text-xs text-slate-600">
              <label htmlFor="to">Hasta</label>
              <input
                id="to"
                type="date"
                value={to}
                onChange={(event) => {
                  setTo(event.target.value);
                  setPage(1);
                }}
                className="rounded-lg border border-slate-300 px-2.5 py-2 text-sm"
              />
            </div>
            {(from || to) && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="mt-auto rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Limpiar filtros
              </button>
            )}
          </div>

          {error && (
            <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          {isLoading ? (
            <p className="mt-6 text-sm text-slate-600">Cargando consultas...</p>
          ) : items.length === 0 ? (
            <p className="mt-6 text-sm text-slate-600">No hay consultas para mostrar.</p>
          ) : (
            <div className="mt-6 space-y-3">
              {items.map((inquiry) => (
                <article key={inquiry.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-base font-semibold text-slate-900">{inquiry.name ?? 'Consulta web'}</h2>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                        <span className="inline-flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5" />
                          {inquiry.email}
                        </span>
                        {inquiry.phone && (
                          <span className="inline-flex items-center gap-1">
                            <Phone className="h-3.5 w-3.5" />
                            {inquiry.phone}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDateLabel(inquiry.createdAt)}
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-slate-700 whitespace-pre-line">{inquiry.message}</p>

                  {!propertyId && inquiry.property && (
                    <div className="mt-3 inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600">
                      <Building2 className="h-3.5 w-3.5" />
                      {inquiry.property.title}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(nextPage) => {
              if (nextPage < 1 || nextPage > totalPages) return;
              setPage(nextPage);
            }}
          />
        </section>
      </main>
    </div>
  );
}
