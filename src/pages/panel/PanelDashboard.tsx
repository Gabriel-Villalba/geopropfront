import { Bell, Building2, ChevronRight, Home, UserCog } from 'lucide-react';
import type { ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components';

interface PanelActionCard {
  id: string;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  to: string;
}

const cards: PanelActionCard[] = [
  {
    id: 'profile',
    title: 'Editar perfil',
    description: 'Actualiza tus datos de cuenta y visualiza tu plan actual.',
    icon: UserCog,
    to: '/panel/profile',
  },
  {
    id: 'properties',
    title: 'Ver mis propiedades',
    description: 'Gestiona estado, aprobacion y visibilidad de tus publicaciones.',
    icon: Building2,
    to: '/panel/properties',
  },
  {
    id: 'create',
    title: 'Crear publicacion',
    description: 'Inicia una nueva publicacion con flujo guiado paso a paso.',
    icon: Home,
    to: '/panel/properties/create',
  },
  {
    id: 'alerts',
    title: 'Crear alerta',
    description: 'Configura alertas para oportunidades de compra o alquiler.',
    icon: Bell,
    to: '/panel/alerts',
  },
];

export default function PanelDashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 pt-20 sm:pt-24">
      <Navbar />

      <main className="mx-auto w-full max-w-5xl px-4 pb-10 sm:px-6">
        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Panel propietario</h1>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">Selecciona una seccion para administrar tu cuenta.</p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <button
                key={card.id}
                type="button"
                onClick={() => navigate(card.to)}
                className="group  border border-orange-500 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className=" bg-blue-50 p-3 text-blue-600">
                    <Icon className="h-6 w-6" />
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400 transition group-hover:text-blue-500" />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-slate-900">{card.title}</h2>
                <p className="mt-2 text-sm text-slate-600">{card.description}</p>
              </button>
            );
          })}
        </section>
      </main>
    </div>
  );
}
