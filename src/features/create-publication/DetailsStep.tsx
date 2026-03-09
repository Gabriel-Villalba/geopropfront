import type { City } from '../../types';
import type { CreatePublicationPropertyType, StepProps } from './types';

function toNumberOrUndefined(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function supportsBedrooms(propertyType?: CreatePublicationPropertyType): boolean {
  return propertyType === 'casa' || propertyType === 'departamento';
}

function supportsBathrooms(propertyType?: CreatePublicationPropertyType): boolean {
  return propertyType === 'casa' || propertyType === 'departamento' || propertyType === 'comercial' || propertyType === 'galpon-deposito';
}

function supportsParking(propertyType?: CreatePublicationPropertyType): boolean {
  return propertyType === 'casa' || propertyType === 'departamento';
}

interface DetailsStepExtendedProps extends StepProps {
  cities: City[];
  isLoadingCities: boolean;
  citiesError: string | null;
  onRetryCities: () => void;
}

export function DetailsStep({
  state,
  updateField,
  cities,
  isLoadingCities,
  citiesError,
  onRetryCities,
}: DetailsStepExtendedProps) {
  const isCitySelectDisabled = isLoadingCities || !!citiesError;
  const hasEmptyCities = !isLoadingCities && !citiesError && cities.length === 0;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Datos de la propiedad</h2>
        <p className="text-sm text-slate-600">Completa solo la informacion aplicable al tipo seleccionado.</p>
      </div>

      <div className="grid gap-3">
        {supportsBedrooms(state.propertyType) && (
          <label className="grid gap-1.5">
            <span className="text-sm font-medium text-slate-700">Dormitorios</span>
            <input
              type="number"
              min={0}
              value={state.dormitorios ?? ''}
              onChange={(event) => updateField('dormitorios', toNumberOrUndefined(event.target.value))}
              className=" border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
            />
          </label>
        )}

        {supportsBathrooms(state.propertyType) && (
          <label className="grid gap-1.5">
            <span className="text-sm font-medium text-slate-700">Banos</span>
            <input
              type="number"
              min={0}
              value={state.banos ?? ''}
              onChange={(event) => updateField('banos', toNumberOrUndefined(event.target.value))}
              className=" border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
            />
          </label>
        )}

        {supportsParking(state.propertyType) && (
          <label className="grid gap-1.5">
            <span className="text-sm font-medium text-slate-700">Cochera</span>
            <select
              value={typeof state.cochera === 'boolean' ? String(state.cochera) : ''}
              onChange={(event) => {
                if (!event.target.value) {
                  updateField('cochera', undefined);
                  return;
                }

                updateField('cochera', event.target.value === 'true');
              }}
              className=" border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
            >
              <option value="">Seleccionar</option>
              <option value="true">Si</option>
              <option value="false">No</option>
            </select>
          </label>
        )}

        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-slate-700">Metros cuadrados</span>
          <input
            type="number"
            min={1}
            value={state.metrosCuadrados ?? ''}
            onChange={(event) => updateField('metrosCuadrados', toNumberOrUndefined(event.target.value))}
            className=" border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
          />
        </label>

        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-slate-700">Precio</span>
          <input
            type="number"
            min={1}
            value={state.precio ?? ''}
            onChange={(event) => updateField('precio', toNumberOrUndefined(event.target.value) ?? null)}
            className=" border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
          />
        </label>

        <div className="grid gap-1.5">
          <span className="text-sm font-medium text-slate-700">Ciudad o localidad (Santa Fe)</span>
          <select
            value={state.cityId}
            onChange={(event) => {
              const nextCityId = event.target.value;
              updateField('cityId', nextCityId);
              const selectedCity = cities.find((city) => city.id === nextCityId);
              updateField('ciudad', selectedCity?.name ?? '');
            }}
            disabled={isCitySelectDisabled}
            className="border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            <option value="">
              {isLoadingCities ? 'Cargando ciudades...' : 'Seleccionar ciudad o localidad'}
            </option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
          {citiesError && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              <p>{citiesError}</p>
              <button
                type="button"
                onClick={onRetryCities}
                className="mt-2 rounded-md border border-rose-300 px-2 py-1 font-semibold transition hover:bg-rose-100"
              >
                Reintentar ciudades
              </button>
            </div>
          )}
          {hasEmptyCities && <p className="text-xs text-amber-700">No hay ciudades/localidades disponibles para Santa Fe.</p>}
        </div>

        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-slate-700">Direccion</span>
          <input
            value={state.direccion}
            onChange={(event) => updateField('direccion', event.target.value)}
            className=" border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
          />
        </label>

        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-slate-700">Telefono de contacto</span>
          <input
            value={state.telefonoContacto}
            onChange={(event) => updateField('telefonoContacto', event.target.value)}
            className=" border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
          />
        </label>

        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-slate-700">Descripcion</span>
          <textarea
            rows={4}
            value={state.descripcion}
            onChange={(event) => updateField('descripcion', event.target.value)}
            className=" border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
          />
        </label>
      </div>
    </section>
  );
}
