import type { CreatePublicationOperation, StepProps } from './types';

const options: Array<{ value: CreatePublicationOperation; title: string; description: string }> = [
  {
    value: 'venta',
    title: 'Venta',
    description: 'Publica la propiedad para venta tradicional.',
  },
  {
    value: 'alquiler',
    title: 'Alquiler',
    description: 'Publica la propiedad para renta mensual.',
  },
];

export function OperationStep({ state, updateField }: StepProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-slate-900">Operacion</h2>
      <p className="text-sm text-slate-600">Selecciona el objetivo de la publicacion.</p>

      <div className="grid gap-3">
        {options.map((option) => {
          const selected = state.operation === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => updateField('operation', option.value)}
              className={` border p-4 text-left transition ${
                selected
                  ? 'border-orange-500 bg-orange-100 text-orange-900'
                  : 'border-orange-500 bg-white text-slate-800 hover:border-orange-300'
              }`}
            >
              <p className="text-base font-semibold">{option.title}</p>
              <p className="mt-1 text-sm opacity-80">{option.description}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
