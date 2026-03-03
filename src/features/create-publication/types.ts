import type { Property } from '../../types';

export type CreatePublicationOperation = NonNullable<Property['operation']>;
export type CreatePublicationPropertyType = NonNullable<Property['type']>;

export interface CreatePublicationState {
  operation?: CreatePublicationOperation;
  propertyType?: CreatePublicationPropertyType;
  dormitorios?: number;
  banos?: number;
  cochera?: boolean;
  metrosCuadrados?: number;
  precio: number | null;
  descripcion: string;
  ciudad: string;
  direccion: string;
  telefonoContacto: string;
  imagenes: File[];
}

export interface StepProps {
  state: CreatePublicationState;
  updateField: <K extends keyof CreatePublicationState>(field: K, value: CreatePublicationState[K]) => void;
}
