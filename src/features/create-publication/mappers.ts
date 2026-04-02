import type { BackendProperty } from '../../services/backend';
import type { CreatePublicationState } from './types';

function mapBackendOperation(operation: BackendProperty['operation']): CreatePublicationState['operation'] {
  return operation === 'rent' ? 'alquiler' : 'venta';
}

function mapBackendPropertyType(type: BackendProperty['propertyType']): CreatePublicationState['propertyType'] {
  if (type === 'house') return 'casa';
  if (type === 'apartment') return 'departamento';
  if (type === 'land') return 'lote';
  if (type === 'galpon_deposito') return 'galpon-deposito';
  return 'comercial';
}

export function mapBackendPropertyToFormState(property: BackendProperty): CreatePublicationState {
  const currency =
    (property.currency || (property as unknown as { price?: { currency?: string } })?.price?.currency || 'USD') as
      | 'USD'
      | 'ARS';
  const specs = (property as unknown as { specs?: Record<string, unknown> }).specs ?? {};
  const getSpecNumber = (key: string): number | undefined => {
    const value = (specs as Record<string, unknown>)[key];
    return typeof value === 'number' ? value : undefined;
  };

  return {
    operation: mapBackendOperation(property.operation),
    propertyType: mapBackendPropertyType(property.propertyType),
    moneda: currency,
    estadoInmueble: property.condition ?? undefined,
    antiguedad: property.ageYears ?? getSpecNumber('ageYears'),
    ambientes: property.rooms ?? getSpecNumber('rooms'),
    dormitorios: property.bedrooms ?? getSpecNumber('bedrooms'),
    banos: property.bathrooms ?? getSpecNumber('bathrooms'),
    cochera:
      typeof property.parking === 'number'
        ? property.parking > 0
        : typeof getSpecNumber('parking') === 'number'
          ? Number(getSpecNumber('parking')) > 0
          : undefined,
    metrosCuadrados: property.area ?? getSpecNumber('totalArea'),
    metrosCubiertos: property.coveredArea ?? getSpecNumber('coveredArea'),
    expensas: property.monthlyExpenses ?? getSpecNumber('expensesMonthly'),
    precio:
      typeof property.price === 'number'
        ? property.price
        : typeof (property as unknown as { price?: { amount?: number } })?.price?.amount === 'number'
          ? (property as unknown as { price?: { amount?: number } })?.price?.amount ?? null
          : null,
    descripcion: property.description ?? '',
    provinciaSlug: 'santa-fe',
    cityId: property.cityId ?? '',
    ciudad: property.city?.name ?? '',
    direccion: property.address ?? '',
    telefonoContacto: property.contactPhone ?? '',
    imagenes: [],
  };
}
