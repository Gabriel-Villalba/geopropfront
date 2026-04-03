import { Bell, Building2, ChevronRight, Clock, MessageCircle, UserCog, Sparkles, Plus } from 'lucide-react';
import type { ComponentType } from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationsContext';
import { meApi } from '../../services/api';
import type { DashboardSummary } from '../../types';

interface PanelActionCard {
  id: string;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  to: string;
  accent: string;
}

const cards: PanelActionCard[] = [
  {
    id: 'properties',
    title: 'Mis propiedades',
    description: 'Gestioná el estado, aprobación y visibilidad de tus publicaciones.',
    icon: Building2,
    to: '/panel/properties',
    accent: 'bg-blue-50 text-blue-600',
  },
  {
    id: 'inquiries',
    title: 'Consultas',
    description: 'Revisá las consultas recibidas por tus propiedades.',
    icon: MessageCircle,
    to: '/panel/inquiries',
    accent: 'bg-emerald-50 text-emerald-600',
  },
  {
    id: 'notifications',
    title: 'Notificaciones',
    description: 'Consultas y novedades recientes de tus propiedades.',
    icon: Bell,
    to: '/panel/notifications',
    accent: 'bg-amber-50 text-amber-600',
  },
  {
    id: 'alerts',
    title: 'Crear alerta',
    description: 'Configurá alertas para recibir oportunidades de compra o alquiler.',
    icon: Bell,
    to: '/panel/alerts',
    accent: 'bg-violet-50 text-violet-600',
  },
  {
    id: 'profile',
    title: 'Editar perfil',
    description: 'Actualizá tus datos de cuenta y visualizá tu plan actual.',
    icon: UserCog,
    to: '/panel/profile',
    accent: 'bg-gray-50 text-gray-500',
  },
];

export default function PanelDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    let active = true;
    meApi
      .getDashboardSummary()
      .then((data) => { if (active) setSummary(data); })
      .catch(() => null);
    return () => { active = false; };
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-surface-soft pt-16">
      <Navbar />

      <main className="mx-auto w-full max-w-4xl px-4 pb-16 sm:px-6 pt-10 space-y-6">

        {/* ── 1. Profile banner ── */}
        <div className="bg-ink rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-brand-500 flex items-center justify-center font-display font-bold text-xl text-white flex-shrink-0">
            {getInitials(user?.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-gray-400 text-sm">Bienvenido de vuelta</p>
            <h1 className="font-display font-bold text-xl text-white truncate">
              {user?.name ?? 'Usuario'}
            </h1>
            <div className="mt-1.5 inline-flex items-center gap-1.5 bg-white/10 text-white text-xs font-medium px-2.5 py-1 rounded-full">
              <Sparkles className="w-3 h-3 text-brand-400" />
              Plan {user?.plan ?? 'FREE'}
            </div>
          </div>
          <button
            onClick={() => navigate('/panel/properties/publish')}
            className="flex-shrink-0 inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nueva publicación
          </button>
        </div>

        {/* ── 2. Stats ── */}
        {summary && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
                <Building2 className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-xs text-ink-muted">Propiedades activas</p>
              <p className="mt-1 font-display font-bold text-2xl text-ink">{summary.activeProperties}</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center mb-3">
                <MessageCircle className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xs text-ink-muted">Consultas esta semana</p>
              <p className="mt-1 font-display font-bold text-2xl text-ink">{summary.inquiriesThisWeek}</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center mb-3">
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-xs text-ink-muted">Próximas a vencer</p>
              <p className="mt-1 font-display font-bold text-2xl text-ink">{summary.expiringSoon}</p>
            </div>
          </div>
        )}

        {/* ── 3. Action cards ── */}
        <div className="grid gap-4 sm:grid-cols-2">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => navigate(card.to)}
                className="group relative bg-white rounded-2xl border border-gray-100 p-5 text-left shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                {card.id === 'notifications' && unreadCount && unreadCount > 0 && (
                  <span className="absolute top-4 right-10 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
                <div className="flex items-start justify-between gap-3">
                  <div className={`p-2.5 rounded-xl ${card.accent}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <ChevronRight className="h-4 w-4 text-ink-faint mt-0.5 group-hover:text-ink-muted group-hover:translate-x-0.5 transition-all" />
                </div>
                <h2 className="mt-4 font-display font-semibold text-base text-ink">{card.title}</h2>
                <p className="mt-1.5 text-sm text-ink-muted leading-relaxed">{card.description}</p>
              </button>
            );
          })}
        </div>

      </main>
    </div>
  );
}
