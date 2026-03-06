import type { CreatePublicationPropertyType, StepProps } from './types';

const options: Array<{ value: CreatePublicationPropertyType; title: string }> = [
  { value: 'casa', title: 'Casa' },
  { value: 'departamento', title: 'Departamento' },
  { value: 'lote', title: 'Lote' },
  { value: 'comercial', title: 'Local Comercial' },
  { value: 'galpon-deposito', title: 'Galpon-Deposito' },
];

export function PropertyTypeStep({ state, updateField }: StepProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-slate-900">Tipo de propiedad</h2>
      <p className="text-sm text-slate-600">Elige el tipo para adaptar los campos del siguiente paso.</p>

      <div className="grid gap-3">
        {options.map((option) => {
          const selected = state.propertyType === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => updateField('propertyType', option.value)}
              className={` border p-4 text-left transition ${
                selected
                  ? 'border-blue-500 bg-blue-50 text-blue-900'
                  : 'border-slate-200 bg-white text-slate-800 hover:border-blue-300'
              }`}
            >
              <p className="text-base font-semibold">{option.title}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
