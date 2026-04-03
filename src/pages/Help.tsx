import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, BookOpen, ImagePlus, DollarSign, Maximize2, Home, AlertCircle } from 'lucide-react';
import { Navbar } from '../components';

interface FAQItem {
  q: string;
  a: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    icon: Maximize2,
    accent: 'bg-blue-50 text-blue-600',
    q: '¿Qué es m² total y m² cubierto?',
    a: (
      <>
        <p className="text-sm text-ink-muted leading-relaxed">
          <span className="font-semibold text-ink">m² total</span> es la superficie completa del terreno o parcela.{' '}
          <span className="font-semibold text-ink">m² cubierto</span> es la suma de todos los metros techados construidos,
          contando todos los niveles de la propiedad.
        </p>
        <div className="mt-4 bg-surface-muted rounded-xl border border-gray-100 p-4 text-sm text-ink-muted space-y-1">
          <p className="font-semibold text-ink text-xs uppercase tracking-wide mb-2">Ejemplo</p>
          <p>Casa de 8m × 6m con dos plantas:</p>
          <p>Planta baja: 48 m² · Planta alta: 48 m²</p>
          <p className="font-semibold text-ink mt-2">m² cubierto = 96 m²</p>
        </div>
      </>
    ),
  },
  {
    icon: DollarSign,
    accent: 'bg-brand-50 text-brand-600',
    q: '¿Cómo se calcula el precio por m²?',
    a: (
      <>
        <p className="text-sm text-ink-muted leading-relaxed">
          GeoProp calcula el precio por m² automáticamente a partir de los datos que cargás.
          Usamos el <span className="font-semibold text-ink">m² cubierto como referencia principal</span> — es el
          estándar del mercado inmobiliario argentino. Si no hay m² cubierto, usamos el m² total.
        </p>
        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          <div className="bg-surface-muted rounded-xl border border-gray-100 p-4 text-sm">
            <p className="font-semibold text-ink mb-1">Prioridad del cálculo</p>
            <ol className="text-ink-muted space-y-1 list-none">
              <li className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center flex-shrink-0">1</span>m² cubierto</li>
              <li className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-gray-100 text-ink-muted text-xs font-bold flex items-center justify-center flex-shrink-0">2</span>m² total</li>
              <li className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-gray-100 text-ink-faint text-xs font-bold flex items-center justify-center flex-shrink-0">—</span>Sin dato</li>
            </ol>
          </div>
          <div className="bg-brand-50 rounded-xl border border-brand-100 p-4 text-sm">
            <p className="font-semibold text-ink mb-1">Se muestra como</p>
            <p className="text-brand-700 font-semibold text-base">USD 1.350 / m² cub.</p>
            <p className="text-ink-muted text-xs mt-1">o USD 980 / m² tot. si no hay cubierto</p>
          </div>
        </div>
      </>
    ),
  },
  {
    icon: DollarSign,
    accent: 'bg-emerald-50 text-emerald-600',
    q: 'Moneda y expensas — ¿qué tengo que completar?',
    a: (
      <p className="text-sm text-ink-muted leading-relaxed">
        Seleccioná la moneda correcta: <span className="font-semibold text-ink">ARS</span> para pesos o{' '}
        <span className="font-semibold text-ink">USD</span> para dólares. Si la operación es{' '}
        <span className="font-semibold text-ink">alquiler</span>, completá también las expensas mensuales
        para que el interesado pueda calcular el costo total real. En departamentos y locales comerciales
        este dato es especialmente importante.
      </p>
    ),
  },
  {
    icon: Home,
    accent: 'bg-violet-50 text-violet-600',
    q: '¿Qué significa el estado del inmueble?',
    a: (
      <>
        <p className="text-sm text-ink-muted leading-relaxed mb-4">
          Indica la condición actual de la propiedad. Es uno de los datos más consultados antes de hacer una visita.
        </p>
        <div className="grid sm:grid-cols-3 gap-3 text-sm">
          {[
            { label: 'A estrenar', desc: 'Nunca habitada. Obra terminada lista para entrar.', color: 'bg-emerald-50 border-emerald-100 text-emerald-800' },
            { label: 'Usado', desc: 'Ya fue habitada, en buen estado general.', color: 'bg-blue-50 border-blue-100 text-blue-800' },
            { label: 'A refaccionar', desc: 'Requiere obras o reparaciones antes de habitar.', color: 'bg-amber-50 border-amber-100 text-amber-800' },
          ].map((item) => (
            <div key={item.label} className={`rounded-xl border p-3.5 ${item.color}`}>
              <p className="font-semibold mb-1">{item.label}</p>
              <p className="text-xs opacity-80 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    icon: ImagePlus,
    accent: 'bg-amber-50 text-amber-600',
    q: 'Fotos — ¿cuántas necesito y cuáles son las mejores?',
    a: (
      <>
        <p className="text-sm text-ink-muted leading-relaxed">
          Se requieren <span className="font-semibold text-ink">al menos 3 fotos</span> para publicar.
          Las propiedades con fotos completas reciben hasta <span className="font-semibold text-ink">3 veces más consultas</span> que las que no tienen imágenes.
        </p>
        <div className="mt-4 bg-amber-50 rounded-xl border border-amber-100 p-4 text-sm text-amber-800 space-y-1.5">
          <p className="font-semibold mb-2">Fotos recomendadas para mejores resultados</p>
          {[
            'Frente / fachada exterior',
            'Sala o living principal',
            'Cocina',
            'Dormitorio principal',
            'Baño',
            'Patio, jardín o terraza (si tiene)',
          ].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    icon: AlertCircle,
    accent: 'bg-red-50 text-red-500',
    q: '¿Por qué mi publicación aparece como "pendiente"?',
    a: (
      <p className="text-sm text-ink-muted leading-relaxed">
        Toda publicación nueva pasa por una revisión antes de aparecer en el buscador público.
        El proceso suele demorar menos de 24 horas hábiles. Podés ver el estado desde{' '}
        <span className="font-semibold text-ink">Panel → Mis propiedades</span>.
        Si después de 48 horas seguís en estado pendiente, contactanos por WhatsApp.
      </p>
    ),
  },
];

function FAQCard({ item }: { item: FAQItem }) {
  const [open, setOpen] = useState(false);
  const Icon = item.icon;

  return (
    <div className={`bg-white rounded-2xl border transition-all duration-200 shadow-card ${open ? 'border-brand-200' : 'border-gray-100 hover:border-gray-200'}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 p-5 text-left"
      >
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${item.accent}`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="font-display font-semibold text-base text-ink flex-1 leading-snug">
          {item.q}
        </span>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${open ? 'bg-brand-50 text-brand-600' : 'bg-surface-muted text-ink-faint'}`}>
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 pt-0 border-t border-gray-100">
          <div className="pt-4">{item.a}</div>
        </div>
      )}
    </div>
  );
}

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-surface-soft pt-16">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 pb-16 sm:px-6 lg:px-8">

        {/* Header */}
        <header className="py-10 sm:py-14">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center border border-brand-100">
              <HelpCircle className="w-5 h-5 text-brand-500" />
            </div>
            <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-600 text-xs font-semibold px-3 py-1.5 rounded-full border border-brand-100">
              <BookOpen className="w-3.5 h-3.5" />
              Centro de ayuda
            </div>
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-ink tracking-tight leading-tight">
            Guía para publicar
          </h1>
          <p className="mt-3 text-base text-ink-muted leading-relaxed max-w-lg">
            Respondemos las dudas más comunes para que tu propiedad quede bien cargada y reciba más consultas.
          </p>
        </header>

        {/* FAQ accordion */}
        <section className="space-y-3">
          {FAQ_ITEMS.map((item) => (
            <FAQCard key={item.q} item={item} />
          ))}
        </section>

        {/* Footer CTA */}
        <div className="mt-10 bg-ink rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-display font-bold text-white text-lg">¿Todavía tenés dudas?</p>
            <p className="text-gray-400 text-sm mt-1">Contactanos por WhatsApp y te ayudamos.</p>
          </div>
          <a
            href="https://wa.me/5493492588185"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold px-5 py-3 rounded-xl transition-colors"
          >
            Abrir WhatsApp
          </a>
        </div>

      </main>
    </div>
  );
}
