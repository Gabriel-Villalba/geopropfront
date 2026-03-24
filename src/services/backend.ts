import axios from 'axios';
import type { AxiosResponse } from 'axios';
import type { ListingDuration, ListingStatus, ListingType, Property } from '../types';

export interface BackendApiResponse<T> {
  success: boolean;
  data: T;
  error: string | null;
}

export interface BackendCity {
  id: string;
  name: string;
  province?: string | null;
  active?: boolean;
}

export interface BackendPropertyImage {
  id: string;
  imageUrl: string;
  order: number;
  isPrimary: boolean;
}

export interface BackendProperty {
  id: string;
  clientId: string;
  cityId: string;
  title: string;
  description: string | null;
  operation: 'sale' | 'rent';
  propertyType: 'house' | 'apartment' | 'land' | 'commercial' | 'local_commercial' | 'galpon_deposito';
  price: number;
  currency: string;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  parking: number | null;
  address: string | null;
  ownerType: 'particular' | 'inmobiliaria';
  contactName: string | null;
  contactPhone: string | null;
  isActive: boolean;
  isFeatured: boolean;
  source: string;
  status: 'pending' | 'approved' | 'rejected';
  createdBy: string;
  publishedAt: string | null;
  deactivatedAt: string | null;
  city?: BackendCity | null;
  images?: BackendPropertyImage[];
  listing?: {
    listingType: ListingType;
    listingDuration: ListingDuration;
    listingExpiresAt: string;
    isFeatured: boolean;
    featuredUntil: string | null;
    status: ListingStatus;
    isActive: boolean;
  };
}

export interface BackendAlert {
  id: string;
  userId: string;
  operation: 'sale' | 'rent';
  cityId: string;
  minPrice: number | null;
  maxPrice: number | null;
  propertyType: 'house' | 'apartment' | 'land' | 'commercial';
  rooms: number | null;
  active: boolean;
  expiresAt: string | null;
  city?: BackendCity | null;
}

export interface BackendMe {
  id: string;
  clientId: string;
  roleId?: string;
  role: string | null;
  name: string;
  email: string;
  active: boolean;
  plan: 'FREE' | 'INMOBILIARIA' | 'BROKER';
  planExpiresAt?: string | null;
  subscriptionStatus?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export function extractApiData<T>(response: AxiosResponse<BackendApiResponse<T>>): T {
  if (!response.data.success) {
    throw new Error(response.data.error ?? 'No se pudo completar la operacion.');
  }

  return response.data.data;
}

function mapBusinessMessage(rawMessage: string): string {
  if (rawMessage === 'FREE plan allows only 1 active property at a time') {
    return 'Plan FREE: solo podes tener 1 propiedad activa a la vez.';
  }

  if (rawMessage === 'FREE plan allows only 1 active alert') {
    return 'Plan FREE: solo podes tener 1 alerta activa.';
  }

  if (rawMessage === 'Propiedad en revisión') {
    return 'La propiedad esta en revision. Debe aprobarla un admin antes de activarse.';
  }

  if (rawMessage === 'Missing or invalid authorization token') {
    return 'Tu sesion expiro. Inicia sesion nuevamente.';
  }

  if (rawMessage === 'Invalid or expired token') {
    return 'Tu sesion expiro. Inicia sesion nuevamente.';
  }

  if (rawMessage === 'Endpoint not found') {
    return 'El backend actual no tiene este endpoint desplegado. Revisa VITE_API_URL o redeploy del backend.';
  }

  return rawMessage;
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { error?: string; message?: string } | undefined;
    const raw = data?.error ?? data?.message ?? 'No se pudo completar la operacion.';
    return mapBusinessMessage(raw);
  }

  if (error instanceof Error && error.message) {
    return mapBusinessMessage(error.message);
  }

  return 'No se pudo completar la operacion.';
}

function mapOperation(operation: BackendProperty['operation']): Property['operation'] {
  return operation === 'rent' ? 'alquiler' : 'venta';
}

function mapPropertyType(type: BackendProperty['propertyType']): Property['type'] {
  if (type === 'house') return 'casa';
  if (type === 'apartment') return 'departamento';
  if (type === 'land') return 'lote';
  if (type === 'galpon_deposito') return 'galpon-deposito';
  return 'comercial';
}

export function mapBackendPropertyToUi(property: BackendProperty): Property {
  const orderedImages = [...(property.images ?? [])].sort((a, b) => a.order - b.order);
  const imageUrls = orderedImages.map((image) => image.imageUrl).filter(Boolean);
  const primaryImage = orderedImages.find((image) => image.isPrimary)?.imageUrl ?? imageUrls[0] ?? null;

  return {
    id: property.id,
    title: property.title,
    subtitle: property.address,
    operation: mapOperation(property.operation),
    type: mapPropertyType(property.propertyType),
    price: {
      amount: Number(property.price),
      currency: property.currency,
      raw: null,
    },
    description: property.description,
    descriptionShort: property.description ? property.description.slice(0, 280) : null,
    location: {
      city: property.city?.name ?? null,
      locality: property.city?.province ?? null,
    },
    specs: {
      totalArea: property.area ? Number(property.area) : null,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      parking: property.parking ?? null,
    },
    image: primaryImage,
    images: imageUrls,
    publisher: {
      type: property.ownerType,
      name: property.contactName ?? 'GeoProp',
      phone: property.contactPhone ?? null,
    },
    listing: property.listing
      ? {
          listingType: property.listing.listingType,
          listingDuration: property.listing.listingDuration,
          listingExpiresAt: property.listing.listingExpiresAt,
          isFeatured: property.listing.isFeatured,
          featuredUntil: property.listing.featuredUntil,
          status: property.listing.status,
          isActive: property.listing.isActive,
        }
      : undefined,
  };
}
