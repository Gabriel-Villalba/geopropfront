import type { StepProps } from './types';

function displayOperation(value?: string): string {
  if (value === 'venta') return 'Venta';
  if (value === 'alquiler') return 'Alquiler';
  return '-';
}

function displayPropertyType(value?: string): string {
  if (value === 'casa') return 'Casa';
  if (value === 'departamento') return 'Departamento';
  if (value === 'lote') return 'Lote';
  if (value === 'comercial') return 'Local Comercial';
  if (value === 'galpon-deposito') return 'Galpon-Deposito';
  return '-';
}

function displayNumber(value?: number | null): string {
  if (typeof value !== 'number') return '-';
  return `${value}`;
}

export function SummaryStep({ state }: StepProps) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Resumen</h2>
        <p className="text-sm text-slate-600">Revisa los datos antes de confirmar la publicacion.</p>
      </div>

      <div className="space-y-2  border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
        <p>
          <span className="font-semibold text-slate-900">Operacion:</span> {displayOperation(state.operation)}
        </p>
        <p>
          <span className="font-semibold text-slate-900">Tipo:</span> {displayPropertyType(state.propertyType)}
        </p>
        <p>
          <span className="font-semibold text-slate-900">Ciudad:</span> {state.ciudad || '-'}
        </p>
        <p>
          <span className="font-semibold text-slate-900">Direccion:</span> {state.direccion || '-'}
        </p>
        <p>
          <span className="font-semibold text-slate-900">Telefono contacto:</span> {state.telefonoContacto || '-'}
        </p>
        <p>
          <span className="font-semibold text-slate-900">Metros cuadrados:</span> {displayNumber(state.metrosCuadrados)}
        </p>
        <p>
          <span className="font-semibold text-slate-900">Precio:</span> {displayNumber(state.precio)}
        </p>
        {typeof state.dormitorios === 'number' && (
          <p>
            <span className="font-semibold text-slate-900">Dormitorios:</span> {state.dormitorios}
          </p>
        )}
        {typeof state.banos === 'number' && (
          <p>
            <span className="font-semibold text-slate-900">Banos:</span> {state.banos}
          </p>
        )}
        {typeof state.cochera === 'boolean' && (
          <p>
            <span className="font-semibold text-slate-900">Cochera:</span> {state.cochera ? 'Si' : 'No'}
          </p>
        )}
        <p>
          <span className="font-semibold text-slate-900">Descripcion:</span> {state.descripcion || '-'}
        </p>
        <p>
          <span className="font-semibold text-slate-900">Imagenes:</span> {state.imagenes.length}
        </p>
      </div>
    </section>
  );
}
