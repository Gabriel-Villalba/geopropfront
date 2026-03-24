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
  return {
    operation: mapBackendOperation(property.operation),
    propertyType: mapBackendPropertyType(property.propertyType),
    dormitorios: property.bedrooms ?? undefined,
    banos: property.bathrooms ?? undefined,
    cochera: typeof property.parking === 'number' ? property.parking > 0 : undefined,
    metrosCuadrados: property.area ?? undefined,
    precio: typeof property.price === 'number' ? property.price : null,
    descripcion: property.description ?? '',
    provinciaSlug: 'santa-fe',
    cityId: property.cityId ?? '',
    ciudad: property.city?.name ?? '',
    direccion: property.address ?? '',
    telefonoContacto: property.contactPhone ?? '',
    imagenes: [],
  };
}
