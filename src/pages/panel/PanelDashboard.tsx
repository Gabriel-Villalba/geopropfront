import { Bell, Building2, ChevronRight, Home, UserCog, Sparkles } from 'lucide-react';
import type { ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components';
import { useAuth } from '../../contexts/AuthContext';

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
    id: 'profile',
    title: 'Editar perfil',
    description: 'Actualizá tus datos de cuenta y visualizá tu plan actual.',
    icon: UserCog,
    to: '/panel/profile',
    accent: 'bg-violet-50 text-violet-600',
  },
  {
    id: 'properties',
    title: 'Mis propiedades',
    description: 'Gestioná el estado, aprobación y visibilidad de tus publicaciones.',
    icon: Building2,
    to: '/panel/properties',
    accent: 'bg-blue-50 text-blue-600',
  },
  {
    id: 'create',
    title: 'Crear publicación',
    description: 'Iniciá una nueva publicación con flujo guiado paso a paso.',
    icon: Home,
    to: '/panel/properties/publish',
    accent: 'bg-brand-50 text-brand-600',
  },
  {
    id: 'alerts',
    title: 'Crear alerta',
    description: 'Configurá alertas para recibir oportunidades de compra o alquiler.',
    icon: Bell,
    to: '/panel/alerts',
    accent: 'bg-emerald-50 text-emerald-600',
  },
];

export default function PanelDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const getInitials = (name?: string) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    return (parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '');
  };

  return (
    <div className="min-h-screen bg-surface-soft pt-16">
      <Navbar />

      <main className="mx-auto w-full max-w-4xl px-4 pb-16 sm:px-6 pt-10">

        {/* Profile banner */}
        <div className="bg-ink rounded-2xl p-6 sm:p-8 mb-8 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-brand-500 flex items-center justify-center font-display font-bold text-xl text-white flex-shrink-0">
            {getInitials(user?.name).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-gray-400 text-sm">Bienvenido de vuelta</p>
            <h1 className="font-display font-bold text-xl text-white truncate">{user?.name ?? 'Usuario'}</h1>
            <div className="mt-1.5 inline-flex items-center gap-1.5 bg-white/10 text-white text-xs font-medium px-2.5 py-1 rounded-full">
              <Sparkles className="w-3 h-3 text-brand-400" />
              Plan {user?.plan ?? 'FREE'}
            </div>
          </div>
        </div>

        {/* Action cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => navigate(card.to)}
                className="group bg-white rounded-2xl border border-gray-100 p-5 text-left shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
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
