import { ArrowLeft, BadgeCheck, Shield } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../../components';
import { useAuth } from '../../../contexts/AuthContext';
import { useOwnerPanel } from '../../../hooks/useOwnerPanel';
import type { UserPlan } from '../../../types';

type PlanCard = {
  value: UserPlan;
  label: string;
  title: string;
  description: string;
  price: string;
  priceSuffix?: string;
  highlight?: string;
  features: string[];
};

const PLAN_CARDS: PlanCard[] = [
  {
    value: 'FREE',
    label: 'Free',
    title: 'Acceso basico',
    description: 'Ideal para usuarios particulares.',
    price: '$0',
    priceSuffix: '/mes',
    features: [
      'Ideal para usuarios particulares',
      '1 publicacion activa',
      'Publicacion destacada (con costo extra)',
      'Alertas basicas',
    ],
  },
  {
    value: 'INMOBILIARIA',
    label: 'Agencia',
    title: 'Para equipos inmobiliarios',
    description: 'Mas capacidad y herramientas para gestionar cartera.',
    price: '$29.900',
    priceSuffix: '/mes',
    highlight: 'Mas elegido',
    features: [
      'Publicaciones ilimitadas',
      'Todas activas',
      '3 destacados (pueden ser mas, con costo extra)',
      'Hasta 5 usuarios',
      'Acceso a estadisticas de costos por zona',
      'Soporte total',
    ],
  },
  {
    value: 'BROKER',
    label: 'Broker Pro',
    title: 'Maximo alcance',
    description: 'El plan mas completo para alto volumen.',
    price: '$59.900',
    priceSuffix: '/mes',
    highlight: 'Premium',
    features: [
       'Publicaciones ilimitadas',
      'Todas activas',
      '10 destacados (pueden ser mas, con costo extra)',
      'Usuarios ilimitados',
      'Acceso a estadisticas de costos por zona',
      'Soporte total',
      'Acceso a scraper por zona',
      'GeoRadar inteligente',
      'Alerta de oportunidades de inversion',
      'Estudio de factibilidad de compra-venta o alquiler de una propiedad',
    ],
  },
];

export default function PlansPage() {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const { profile, isLoading, isSavingProfile, message, loadPanel, updateProfile } = useOwnerPanel();
  const [plan, setPlan] = useState<UserPlan>('FREE');

  useEffect(() => {
    void loadPanel();
  }, [loadPanel]);

  useEffect(() => {
    setPlan(profile?.plan ?? 'FREE');
  }, [profile]);

  const currentPlanLabel = useMemo(() => {
    const entry = PLAN_CARDS.find((card) => card.value === (profile?.plan ?? 'FREE'));
    return entry?.label ?? profile?.plan ?? 'FREE';
  }, [profile?.plan]);

  const handleSave = async () => {
    if (!profile) return;
    const updated = await updateProfile({
      name: profile.name,
      email: profile.email,
      phone: profile.phone ?? null,
      plan,
    });
    if (updated) updateUser(updated);
  };

  return (
    <div className="min-h-screen bg-surface-soft pt-16">
      <Navbar />

      <main className="mx-auto w-full max-w-5xl px-4 pb-16 sm:px-6 pt-10">
        <button
          type="button"
          onClick={() => navigate('/panel/profile')}
          className="mb-6 inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink transition-colors font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al perfil
        </button>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-brand-50 text-brand-600 text-xs font-semibold px-3 py-1.5 border border-brand-100">
              <Shield className="w-3.5 h-3.5" />
              PLANES Y SUSCRIPCION
            </p>
            <h1 className="mt-3 font-display font-bold text-2xl text-ink tracking-tight">Planes disponibles</h1>
            <p className="text-sm text-ink-muted">
              Plan actual: <span className="font-semibold text-ink">{currentPlanLabel}</span>
            </p>
          </div>
        </div>

        {message && (
          <div
            className={`mt-6 px-4 py-3 rounded-xl text-sm border ${
              message.type === 'success'
                ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                : 'bg-red-50 border-red-100 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <section className="mt-8 grid gap-5 md:grid-cols-3">
              {PLAN_CARDS.map((card) => {
                const isSelected = plan === card.value;
                return (
                  <div
                    key={card.value}
                    onClick={() => setPlan(card.value)}
                    className={`text-left rounded-2xl border shadow-card p-5 transition-all cursor-pointer flex flex-col h-full ${
                      isSelected
                        ? 'border-brand-400 bg-white ring-2 ring-brand-200'
                        : 'border-gray-100 bg-white hover:border-brand-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">{card.label}</p>
                        <h2 className="mt-2 text-lg font-semibold text-ink">{card.title}</h2>
                      </div>
                      {card.highlight && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold px-2.5 py-1">
                          <BadgeCheck className="w-3.5 h-3.5" />
                          {card.highlight}
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex items-end gap-2">
                      <span className="text-3xl font-bold text-ink">{card.price}</span>
                      {card.priceSuffix && (
                        <span className="text-sm font-semibold text-ink-muted">{card.priceSuffix}</span>
                      )}
                    </div>

                    <p className="mt-3 text-sm text-ink-muted">{card.description}</p>
                    <ul className="mt-4 space-y-2 text-sm text-ink flex-1">
                      {card.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-brand-500"></span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-6">
                      {isSelected ? (
                        <span className="text-xs font-semibold uppercase tracking-widest text-brand-600">Seleccionado</span>
                      ) : (
                        <span className="text-xs text-ink-faint">Seleccionar plan</span>
                      )}
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setPlan(card.value);
                        }}
                        className="mt-3 w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
                      >
                        Comprar
                      </button>
                    </div>
                  </div>
                );
              })}
            </section>
{/* 
            <div className="mt-6 rounded-2xl border border-gray-100 bg-white shadow-card p-5">
              <p className="text-xs text-ink-faint">Cambiar de plan no genera cobros en esta fase.</p>
            </div> */}

            <button
              type="button"
              onClick={handleSave}
              disabled={isSavingProfile}
              className="mt-6 btn-primary w-full justify-center py-3 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSavingProfile ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando...
                </>
              ) : (
                'Guardar cambios'
              )}
            </button>
          </>
        )}
      </main>
    </div>
  );
}
