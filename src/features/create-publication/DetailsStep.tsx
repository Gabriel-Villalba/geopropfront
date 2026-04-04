import type { City } from '../../types';
import { CitySelectField } from '../../components';
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

function supportsCoveredArea(propertyType?: CreatePublicationPropertyType): boolean {
  return propertyType === 'casa' || propertyType === 'departamento' || propertyType === 'comercial' || propertyType === 'galpon-deposito';
}

function supportsRooms(propertyType?: CreatePublicationPropertyType): boolean {
  return propertyType !== 'lote';
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
            <span className="text-sm font-medium text-slate-700">Baños</span>
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

        {supportsCoveredArea(state.propertyType) && (
          <label className="grid gap-1.5">
            <span className="text-sm font-medium text-slate-700">Metros cuadrados cubiertos</span>
            <input
              type="number"
              min={0}
              value={state.metrosCubiertos ?? ''}
              onChange={(event) => updateField('metrosCubiertos', toNumberOrUndefined(event.target.value))}
              className=" border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
            />
            <span className="text-xs text-slate-500">
              Sumá los m² de todos los niveles techados (PB + PA, etc.).
            </span>
          </label>
        )}

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

        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-slate-700">Moneda</span>
          <select
            value={state.moneda}
            onChange={(event) => updateField('moneda', event.target.value as 'USD' | 'ARS')}
            className=" border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
          >
            <option value="USD">USD</option>
            <option value="ARS">ARS</option>
          </select>
        </label>

        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-slate-700">Estado del inmueble</span>
          <select
            value={state.estadoInmueble ?? ''}
            onChange={(event) => {
              if (!event.target.value) {
                updateField('estadoInmueble', undefined);
                return;
              }
              updateField('estadoInmueble', event.target.value as 'a_estrenar' | 'usado' | 'a_refaccionar');
            }}
            className=" border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
          >
            <option value="">Seleccionar</option>
            <option value="a_estrenar">A estrenar</option>
            <option value="usado">Usado</option>
            <option value="a_refaccionar">A refaccionar</option>
          </select>
        </label>

        {supportsRooms(state.propertyType) && (
          <label className="grid gap-1.5">
            <span className="text-sm font-medium text-slate-700">Ambientes</span>
            <input
              type="number"
              min={0}
              value={state.ambientes ?? ''}
              onChange={(event) => updateField('ambientes', toNumberOrUndefined(event.target.value))}
              className=" border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
            />
          </label>
        )}

        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-slate-700">Antiguedad (años)</span>
          <input
            type="number"
            min={0}
            value={state.antiguedad ?? ''}
            onChange={(event) => updateField('antiguedad', toNumberOrUndefined(event.target.value))}
            className=" border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
          />
        </label>

        {state.operation === 'alquiler' && (
          <label className="grid gap-1.5">
            <span className="text-sm font-medium text-slate-700">Expensas mensuales</span>
            <input
              type="number"
              min={0}
              value={state.expensas ?? ''}
              onChange={(event) => updateField('expensas', toNumberOrUndefined(event.target.value))}
              className=" border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
            />
          </label>
        )}
        <CitySelectField
          value={state.cityId}
          cities={cities}
          isLoading={isLoadingCities}
          error={citiesError}
          onRetry={onRetryCities}
          onChange={(nextCityId, selectedCity) => {
            updateField('cityId', nextCityId);
            updateField('ciudad', selectedCity?.name ?? '');
          }}
        />

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

