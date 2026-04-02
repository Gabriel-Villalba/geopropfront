import { Navbar } from '../components';

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-surface-soft pt-16">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8">
        <header className="py-10">
          <h1 className="font-display font-bold text-3xl text-ink">Guía rápida para publicar</h1>
          <p className="mt-2 text-sm text-ink-muted">
            Respuestas claras para cargar propiedades sin errores.
          </p>
        </header>

        <section className="space-y-8">
          <article className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
            <h2 className="font-display font-semibold text-lg text-ink">¿Qué es m² total y m² cubierto?</h2>
            <p className="mt-3 text-sm text-ink-muted leading-relaxed">
              <strong>m² total</strong> es la superficie del terreno. <strong>m² cubierto</strong> es la suma de
              todos los metros techados construidos (todos los niveles).
            </p>
            <div className="mt-4 rounded-xl border border-gray-100 bg-surface-soft p-4 text-sm text-ink-muted">
              Ejemplo: casa de 8m x 6m con dos plantas.
              <br />
              Planta baja: 48 m², planta alta: 48 m².
              <br />
              m² cubierto = 96 m².
            </div>
          </article>

          <article className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
            <h2 className="font-display font-semibold text-lg text-ink">¿Cómo se calcula el precio por m²?</h2>
            <p className="mt-3 text-sm text-ink-muted leading-relaxed">
              Mostramos el precio por m² total siempre que esté informado el m² total. En casas, locales y galpones
              también mostramos el precio por m² cubierto si existe el dato.
            </p>
          </article>

          <article className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
            <h2 className="font-display font-semibold text-lg text-ink">Moneda y expensas</h2>
            <p className="mt-3 text-sm text-ink-muted leading-relaxed">
              Seleccioná la moneda correcta (ARS o USD). Si la operación es alquiler, podés cargar expensas mensuales
              para que el comprador tenga una referencia completa.
            </p>
          </article>

          <article className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
            <h2 className="font-display font-semibold text-lg text-ink">Fotos mínimas</h2>
            <p className="mt-3 text-sm text-ink-muted leading-relaxed">
              Se requieren al menos 3 fotos para publicar. Las propiedades con fotos completas reciben más consultas.
            </p>
          </article>
        </section>
      </main>
    </div>
  );
}
