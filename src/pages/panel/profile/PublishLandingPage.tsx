import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../../components';
import { Footer } from '../../../components/Footer';
import {
  ArrowRight,
  MapPin,
  FileText,
  ImagePlus,
  Rocket,
  Users,
  MessageSquare,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';

const STATS = [
  { icon: Users,        value: '2.000+',  label: 'usuarios activos en la plataforma' },
  { icon: MessageSquare,value: '850+',    label: 'consultas mensuales a anunciantes' },
  { icon: KeyRound,     value: '500+',    label: 'propiedades publicadas hasta hoy' },
];

const STEPS = [
  {
    number: 1,
    icon: MapPin,
    title: 'Ubicá tu propiedad',
    description: 'Seleccioná la ciudad y localidad donde se encuentra el inmueble.',
  },
  {
    number: 2,
    icon: FileText,
    title: 'Contanos cómo es',
    description: 'Completá tipo, operación, precio, superficie y características principales.',
  },
  {
    number: 3,
    icon: ImagePlus,
    title: 'Subí tus fotos',
    description: 'Agregá imágenes de calidad. Las propiedades con fotos reciben 3x más consultas.',
  },
  {
    number: 4,
    icon: Rocket,
    title: 'Publicá y listo',
    description: 'Tu propiedad queda visible al instante. Podés destacarla para llegar a más personas.',
  },
];

const BENEFITS = [
  'Sin comisiones ocultas',
  'Visible desde el primer día',
  'Editable en cualquier momento',
  'Contacto directo con interesados',
  'Panel de gestión incluido',
];

export default function PublishLandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-surface-soft">
      <Navbar />

      {/* ── HERO ── */}
      <section className="pt-16">
        <div className="grid md:grid-cols-2 min-h-[420px]">

          {/* Left — dark */}
          <div className="bg-ink flex items-center px-8 py-16 sm:px-14 lg:px-20">
            <div className="max-w-md space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/10 text-brand-400 text-xs font-semibold px-3 py-1.5 rounded-full border border-white/10">
                <Rocket className="w-3.5 h-3.5" />
                Publicación gratuita
              </div>

              <h1 className="font-display font-bold text-4xl sm:text-5xl text-white leading-tight tracking-tight">
                Publicá tu propiedad{' '}
                <span className="text-brand-400">rápido</span>{' '}
                y sin vueltas.
              </h1>

              <p className="text-gray-400 text-base leading-relaxed">
                Te conectamos con personas que están buscando su próximo hogar en Rafaela y zona.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => navigate('/panel/properties/create')}
                  className="btn-primary py-3 px-6 text-base"
                >
                  Publicar ahora
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate('/panel')}
                  className="inline-flex items-center justify-center gap-2 border border-white/20 text-white hover:bg-white/10 font-medium text-sm px-6 py-3 rounded-xl transition-all duration-150"
                >
                  Ver mi panel
                </button>
              </div>
            </div>
          </div>

          {/* Right — visual */}
          <div className="bg-surface-muted flex items-center justify-center px-8 py-14 relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-brand-100 opacity-60" />
            <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-brand-200 opacity-40" />

            {/* Card mockup */}
            <div className="relative z-10 bg-white rounded-2xl shadow-card-hover border border-gray-100 p-6 w-72">
              <div className="h-32 rounded-xl bg-surface-muted mb-4 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center">
                  <svg width="48" height="48" viewBox="0 0 16 16" fill="none" className="opacity-40">
                    <path d="M8 1L2 6v8h4v-4h4v4h4V6L8 1z" fill="#f97316"/>
                  </svg>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-surface-muted rounded-full w-3/4" />
                <div className="h-3 bg-surface-muted rounded-full w-1/2" />
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                  <div className="h-2.5 bg-brand-200 rounded-full w-1/3" />
                  <div className="h-2.5 bg-surface-muted rounded-full w-1/4" />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-lg">Activa</span>
                <span className="text-xs text-ink-faint">Tu propiedad</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:divide-x divide-gray-100">
            {STATS.map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-4 sm:px-8 first:pl-0 last:pr-0">
                <div className="w-11 h-11 rounded-xl bg-ink flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-brand-400" />
                </div>
                <div>
                  <p className="font-display font-bold text-2xl text-ink">{value}</p>
                  <p className="text-xs text-ink-muted leading-snug">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STEPS ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20 w-full">
        <div className="text-center mb-14">
          <h2 className="font-display font-bold text-3xl text-ink tracking-tight">
            Publicá en 4 simples pasos
          </h2>
          <p className="text-ink-muted mt-2 text-sm">Sin formularios interminables. En minutos tu propiedad está visible.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">

          {/* Steps list */}
          <div className="space-y-2">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isLast = index === STEPS.length - 1;
              return (
                <div key={step.number} className="relative flex gap-4">
                  {/* Connector line */}
                  {!isLast && (
                    <div className="absolute left-5 top-12 w-0.5 h-full bg-gray-100 -z-0" />
                  )}
                  {/* Step circle */}
                  <div className="w-10 h-10 rounded-full bg-ink flex items-center justify-center flex-shrink-0 z-10 shadow-sm">
                    <span className="font-display font-bold text-sm text-brand-400">{step.number}</span>
                  </div>
                  {/* Content */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 flex-1 mb-2">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-brand-500" />
                      </div>
                      <h3 className="font-display font-semibold text-base text-ink">{step.title}</h3>
                    </div>
                    <p className="text-sm text-ink-muted leading-relaxed">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Benefits card */}
          <div className="sticky top-24">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-7">
              <h3 className="font-display font-bold text-lg text-ink mb-1">¿Por qué publicar en GeoProp?</h3>
              <p className="text-sm text-ink-muted mb-6">Sin intermediarios, sin burocracia.</p>
              <ul className="space-y-3">
                {BENEFITS.map((b) => (
                  <li key={b} className="flex items-center gap-3 text-sm text-ink">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>

              <div className="mt-8 p-4 bg-brand-50 rounded-xl border border-brand-100">
                <p className="text-sm font-semibold text-ink mb-0.5">Plan Free incluido</p>
                <p className="text-xs text-ink-muted">Tu primera publicación es completamente gratuita. Podés upgradear cuando quieras.</p>
              </div>
            </div>
          </div>

        </div>

        {/* CTA final */}
        <div className="mt-14 text-center">
          <button
            onClick={() => navigate('/panel/properties/create')}
            className="btn-primary py-4 px-10 text-base"
          >
            Publicar mi propiedad gratis
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-xs text-ink-faint mt-3">Sin tarjeta de crédito. Sin compromiso.</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
