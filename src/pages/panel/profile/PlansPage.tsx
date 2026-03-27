import { ArrowLeft, BadgeCheck, Shield, Check, Zap, Building2, TrendingUp } from 'lucide-react';
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
  highlightColor?: string;
  icon: React.ComponentType<{ className?: string }>;
  accentClass: string;
  features: string[];
};

const PLAN_CARDS: PlanCard[] = [
  {
    value: 'FREE',
    label: 'Free',
    title: 'Acceso básico',
    description: 'Ideal para usuarios particulares que quieren publicar su propiedad.',
    price: '$0',
    priceSuffix: '/mes',
    icon: Zap,
    accentClass: 'bg-gray-50 text-ink-muted',
    features: [
      '1 publicación activa',
      'Publicación destacada (con costo extra)',
      'Alertas básicas',
    ],
  },
  {
    value: 'INMOBILIARIA',
    label: 'Agencia',
    title: 'Para equipos inmobiliarios',
    description: 'Más capacidad y herramientas para gestionar cartera completa.',
    price: '$29.900',
    priceSuffix: '/mes',
    highlight: 'Más elegido',
    highlightColor: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Building2,
    accentClass: 'bg-brand-50 text-brand-600',
    features: [
      'Publicaciones ilimitadas',
      'Todas activas',
      '3 destacados incluidos',
      'Hasta 5 usuarios',
      'Estadísticas de precios por zona',
      'Soporte prioritario',
    ],
  },
  {
    value: 'BROKER',
    label: 'Broker Pro',
    title: 'Máximo alcance',
    description: 'El plan más completo para alto volumen e inteligencia de mercado.',
    price: '$59.900',
    priceSuffix: '/mes',
    highlight: 'Premium',
    highlightColor: 'bg-violet-50 text-violet-700 border-violet-200',
    icon: TrendingUp,
    accentClass: 'bg-violet-50 text-violet-600',
    features: [
      'Publicaciones ilimitadas',
      'Todas activas',
      '10 destacados incluidos',
      'Usuarios ilimitados',
      'Estadísticas de precios por zona',
      'Soporte total',
      'Scraper por zona',
      'GeoRadar inteligente',
      'Alertas de oportunidades de inversión',
      'Estudio de factibilidad de compra-venta',
    ],
  },
];

export default function PlansPage() {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const { profile, isLoading, isSavingProfile, message, loadPanel, updateProfile } = useOwnerPanel();
  const [plan, setPlan] = useState<UserPlan>('FREE');

  useEffect(() => { void loadPanel(); }, [loadPanel]);
  useEffect(() => { setPlan(profile?.plan ?? 'FREE'); }, [profile]);

  const currentPlanLabel = useMemo(() => {
    return PLAN_CARDS.find((c) => c.value === (profile?.plan ?? 'FREE'))?.label ?? profile?.plan ?? 'FREE';
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

        {/* Back */}
        <button type="button" onClick={() => navigate('/panel/profile')}
          className="mb-6 inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink transition-colors font-medium">
          <ArrowLeft className="h-4 w-4" />
          Volver al perfil
        </button>

        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-600 text-xs font-semibold px-3 py-1.5 rounded-full border border-brand-100 mb-3">
            <Shield className="w-3.5 h-3.5" />
            Planes y suscripción
          </div>
          <h1 className="font-display font-bold text-3xl text-ink tracking-tight">
            Elegí tu plan
          </h1>
          <p className="text-ink-muted text-sm mt-1.5">
            Plan actual: <span className="font-semibold text-ink">{currentPlanLabel}</span>
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-8 px-4 py-3 rounded-xl text-sm border ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
              : 'bg-red-50 border-red-100 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Plan cards */}
            <section className="grid gap-5 md:grid-cols-3">
              {PLAN_CARDS.map((card) => {
                const isSelected = plan === card.value;
                const isCurrent  = profile?.plan === card.value;
                const Icon = card.icon;

                return (
                  <div
                    key={card.value}
                    onClick={() => setPlan(card.value)}
                    className={`relative flex flex-col rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden
                      ${isSelected
                        ? 'border-brand-400 bg-white shadow-card-hover ring-2 ring-brand-200 -translate-y-0.5'
                        : 'border-gray-100 bg-white shadow-card hover:border-brand-200 hover:shadow-card-hover'
                      }`}
                  >
                    {/* Top accent bar */}
                    {isSelected && (
                      <div className="h-1 w-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-t-2xl" />
                    )}

                    <div className="p-6 flex flex-col flex-1">

                      {/* Header row */}
                      <div className="flex items-start justify-between gap-2 mb-5">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.accentClass}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        {card.highlight && (
                          <span className={`inline-flex items-center gap-1 rounded-full text-xs font-semibold px-2.5 py-1 border ${card.highlightColor}`}>
                            <BadgeCheck className="w-3 h-3" />
                            {card.highlight}
                          </span>
                        )}
                      </div>

                      {/* Plan name & description */}
                      <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">{card.label}</p>
                      <h2 className="mt-1 font-display font-bold text-lg text-ink leading-tight">{card.title}</h2>
                      <p className="mt-2 text-sm text-ink-muted leading-relaxed">{card.description}</p>

                      {/* Price */}
                      <div className="mt-5 flex items-end gap-1.5 pb-5 border-b border-gray-100">
                        <span className="font-display font-bold text-3xl text-ink">{card.price}</span>
                        {card.priceSuffix && (
                          <span className="text-sm text-ink-muted mb-0.5">{card.priceSuffix}</span>
                        )}
                      </div>

                      {/* Features */}
                      <ul className="mt-5 space-y-2.5 flex-1">
                        {card.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2.5 text-sm text-ink">
                            <span className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                              isSelected ? 'bg-brand-100 text-brand-600' : 'bg-surface-muted text-ink-muted'
                            }`}>
                              <Check className="w-2.5 h-2.5" strokeWidth={3} />
                            </span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {/* CTA */}
                      <div className="mt-6">
                        {isCurrent ? (
                          <div className="w-full rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5 text-center text-sm font-semibold text-brand-600">
                            Plan actual
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setPlan(card.value); }}
                            className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-150
                              ${isSelected
                                ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-sm'
                                : 'bg-surface-muted hover:bg-surface-card border border-gray-200 text-ink hover:border-brand-300'
                              }`}
                          >
                            {isSelected ? 'Seleccionado' : 'Seleccionar'}
                          </button>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })}
            </section>

            {/* Save */}
            <button type="button" onClick={handleSave} disabled={isSavingProfile}
              className="mt-8 btn-primary w-full justify-center py-3 disabled:opacity-60 disabled:cursor-not-allowed">
              {isSavingProfile
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando…</>
                : 'Guardar cambios'
              }
            </button>
          </>
        )}
      </main>
    </div>
  );
}