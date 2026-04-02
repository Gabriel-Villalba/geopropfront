import type { Property } from '../../types';

export type CreatePublicationOperation = NonNullable<Property['operation']>;
export type CreatePublicationPropertyType = NonNullable<Property['type']>;

export interface CreatePublicationState {
  operation?: CreatePublicationOperation;
  propertyType?: CreatePublicationPropertyType;
  moneda: 'USD' | 'ARS';
  estadoInmueble?: 'a_estrenar' | 'usado' | 'a_refaccionar';
  antiguedad?: number;
  ambientes?: number;
  dormitorios?: number;
  banos?: number;
  cochera?: boolean;
  metrosCuadrados?: number;
  metrosCubiertos?: number;
  expensas?: number;
  precio: number | null;
  descripcion: string;
  provinciaSlug: string;
  cityId: string;
  ciudad: string;
  direccion: string;
  telefonoContacto: string;
  imagenes: File[];
}

export interface StepProps {
  state: CreatePublicationState;
  updateField: <K extends keyof CreatePublicationState>(field: K, value: CreatePublicationState[K]) => void;
}
