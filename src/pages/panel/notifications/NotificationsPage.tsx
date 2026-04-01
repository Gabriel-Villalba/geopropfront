import { ArrowLeft, Bell, Calendar, Eye } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar, Pagination } from '../../../components';
import { useNotifications } from '../../../contexts/NotificationsContext';
import { notificationApi } from '../../../services/api';
import { getApiErrorMessage } from '../../../services/backend';
import type { PaginationMeta, NotificationItem } from '../../../types';

const DEFAULT_LIMIT = 20;

function formatDateLabel(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('es-AR');
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const { unreadCount, refreshUnread } = useNotifications();

  const total = pagination?.total ?? 0;
  const totalPages = pagination?.pages ?? 1;
  const hasUnread = useMemo(() => items.some((item) => !item.isRead), [items]);

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await notificationApi.list({ page, limit: DEFAULT_LIMIT });
      setItems(response.items);
      setPagination(response.pagination);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
      setItems([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    void refreshUnread();
  }, [refreshUnread]);

  const handleOpen = async (notification: NotificationItem) => {
    if (!notification.isRead) {
      await notificationApi.markRead(notification.id);
      setItems((previous) =>
        previous.map((item) => (item.id === notification.id ? { ...item, isRead: true } : item)),
      );
      void refreshUnread();
    }

    const propertyId = notification.metadata?.propertyId;
    const propertyTitle = notification.metadata?.propertyTitle;

    if (propertyId) {
      navigate(`/panel/properties/${propertyId}/inquiries`, { state: { propertyTitle } });
    }
  };

  const handleMarkAll = async () => {
    if (isMarkingAll || !hasUnread) return;
    setIsMarkingAll(true);
    try {
      await notificationApi.markAllRead();
      setItems((previous) => previous.map((item) => ({ ...item, isRead: true })));
      void refreshUnread();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsMarkingAll(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20 sm:pt-24">
      <Navbar />

      <main className="mx-auto w-full max-w-5xl px-4 pb-10 sm:px-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate('/panel')}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al panel
          </button>

          <button
            type="button"
            onClick={handleMarkAll}
            disabled={!hasUnread || isMarkingAll}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Eye className="h-4 w-4" />
            {isMarkingAll ? 'Marcando...' : 'Marcar todo como leÃ­do'}
          </button>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Notificaciones</h1>
              <p className="mt-1 text-sm text-slate-600">Consultas y alertas recientes de tus propiedades.</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
              Sin leer: {unreadCount ?? 0} | Total: {total}
            </div>
          </div>

          {error && (
            <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          {isLoading ? (
            <p className="mt-6 text-sm text-slate-600">Cargando notificaciones...</p>
          ) : items.length === 0 ? (
            <p className="mt-6 text-sm text-slate-600">No hay notificaciones para mostrar.</p>
          ) : (
            <div className="mt-6 space-y-3">
              {items.map((notification) => (
                <article
                  key={notification.id}
                  className={`rounded-xl border p-4 transition ${
                    notification.isRead
                      ? 'border-slate-200 bg-white'
                      : 'border-emerald-200 bg-emerald-50/60'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-emerald-600" />
                        <h2 className={`text-base font-semibold ${notification.isRead ? 'text-slate-900' : 'text-emerald-800'}`}>
                          {notification.title}
                        </h2>
                        {!notification.isRead && <span className="h-2 w-2 rounded-full bg-emerald-500" />}
                      </div>
                      <p className="mt-2 text-sm text-slate-700">{notification.body}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDateLabel(notification.createdAt)}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {notification.metadata?.propertyId && (
                      <button
                        type="button"
                        onClick={() => void handleOpen(notification)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        Ver consulta
                      </button>
                    )}
                    {!notification.metadata?.propertyId && !notification.isRead && (
                      <button
                        type="button"
                        onClick={() => void handleOpen(notification)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        Marcar como leÃ­da
                      </button>
                    )}
                  </div>
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
