import { useEffect, useMemo, useState } from 'react';
import { propertyApi } from '../../services/api';
import { getApiErrorMessage } from '../../services/backend';
import type { CreatePublicationPropertyType, CreatePublicationState } from './types';

const TOTAL_STEPS = 5;

const initialState: CreatePublicationState = {
  operation: undefined,
  propertyType: undefined,
  moneda: 'USD',
  estadoInmueble: undefined,
  antiguedad: undefined,
  ambientes: undefined,
  dormitorios: undefined,
  banos: undefined,
  cochera: undefined,
  metrosCuadrados: undefined,
  metrosCubiertos: undefined,
  expensas: undefined,
  precio: null,
  descripcion: '',
  provinciaSlug: 'santa-fe',
  cityId: '',
  ciudad: '',
  direccion: '',
  telefonoContacto: '',
  imagenes: [],
};

function mapOperationToBackend(operation: CreatePublicationState['operation']): 'sale' | 'rent' | undefined {
  if (operation === 'venta') return 'sale';
  if (operation === 'alquiler') return 'rent';
  return undefined;
}

function mapPropertyTypeToBackend(
  propertyType: CreatePublicationState['propertyType'],
): 'house' | 'apartment' | 'land' | 'local_commercial' | 'galpon_deposito' | undefined {
  if (propertyType === 'casa') return 'house';
  if (propertyType === 'departamento') return 'apartment';
  if (propertyType === 'lote') return 'land';
  if (propertyType === 'comercial') return 'local_commercial';
  if (propertyType === 'galpon-deposito') return 'galpon_deposito';
  return undefined;
}

function sanitizeDetailsByType(nextType: CreatePublicationPropertyType | undefined): Partial<CreatePublicationState> {
  if (nextType === 'casa' || nextType === 'departamento') {
    return {};
  }

  if (nextType === 'lote') {
    return {
      ambientes: undefined,
      dormitorios: undefined,
      banos: undefined,
      cochera: undefined,
      metrosCubiertos: undefined,
    };
  }

  if (nextType === 'comercial' || nextType === 'galpon-deposito') {
    return {
      ambientes: undefined,
      dormitorios: undefined,
      cochera: undefined,
    };
  }

  return {
    dormitorios: undefined,
    banos: undefined,
    cochera: undefined,
    metrosCuadrados: undefined,
    metrosCubiertos: undefined,
  };
}

function hasStepThreeRequiredFields(state: CreatePublicationState): boolean {
  const commonOk =
    typeof state.metrosCuadrados === 'number' &&
    state.metrosCuadrados > 0 &&
    typeof state.precio === 'number' &&
    state.precio > 0 &&
    state.descripcion.trim().length > 0 &&
    state.provinciaSlug.trim().length > 0 &&
    state.cityId.trim().length > 0 &&
    state.ciudad.trim().length > 0 &&
    Boolean(state.moneda);

  if (!commonOk || !state.propertyType) {
    return false;
  }

  if (state.propertyType === 'casa' || state.propertyType === 'departamento') {
    return (
      typeof state.dormitorios === 'number' &&
      state.dormitorios >= 0 &&
      typeof state.banos === 'number' &&
      state.banos >= 0 &&
      typeof state.cochera === 'boolean'
    );
  }

  if (state.propertyType === 'lote') {
    return true;
  }

  return typeof state.banos === 'number' && state.banos >= 0;
}

type PublicationMode = 'create' | 'edit';

interface UseCreatePublicationOptions {
  mode?: PublicationMode;
  initialState?: Partial<CreatePublicationState>;
  propertyId?: string;
}

export function useCreatePublication(options?: UseCreatePublicationOptions) {
  const mode: PublicationMode = options?.mode ?? 'create';
  const mergedInitialState = useMemo<CreatePublicationState>(() => {
    return {
      ...initialState,
      ...options?.initialState,
      imagenes: options?.initialState?.imagenes ?? [],
    };
  }, [options?.initialState]);

  const [currentStep, setCurrentStep] = useState(1);
  const [state, setState] = useState<CreatePublicationState>(mergedInitialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitWarning, setSubmitWarning] = useState<string | null>(null);
  const [createdPropertyId, setCreatedPropertyId] = useState<string | null>(null);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    if (hasHydrated || !options?.initialState) return;
    setState(mergedInitialState);
    setHasHydrated(true);
  }, [hasHydrated, mergedInitialState, options?.initialState]);

  const updateField = <K extends keyof CreatePublicationState>(field: K, value: CreatePublicationState[K]) => {
    setState((prev) => {
      if (field === 'propertyType') {
        const nextType = value as CreatePublicationPropertyType | undefined;
        return {
          ...prev,
          propertyType: nextType,
          ...sanitizeDetailsByType(nextType),
        };
      }

      return {
        ...prev,
        [field]: value,
      };
    });
  };

  const isCurrentStepValid = useMemo(() => {
    if (currentStep === 1) return Boolean(state.operation);
    if (currentStep === 2) return Boolean(state.propertyType);
    if (currentStep === 3) return hasStepThreeRequiredFields(state);
    if (currentStep === 4) {
      return mode === 'create' ? state.imagenes.length >= 3 : true;
    }
    return true;
  }, [currentStep, state, mode]);

  const nextStep = () => {
    setCurrentStep((prev) => (prev >= TOTAL_STEPS ? TOTAL_STEPS : prev + 1));
  };

  const prevStep = () => {
    setCurrentStep((prev) => (prev <= 1 ? 1 : prev - 1));
  };

  const reset = () => {
    setCurrentStep(1);
    setState(mergedInitialState);
    setIsSubmitting(false);
    setSubmitError(null);
    setSubmitWarning(null);
    setCreatedPropertyId(null);
  };

  const submit = async (ownerName?: string) => {
    if (!state.operation || !state.propertyType || !hasStepThreeRequiredFields(state)) {
      setSubmitError('Faltan datos obligatorios para crear la publicacion.');
      return false;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitWarning(null);

    const normalizedOwner = ownerName?.trim() || 'Propietario';
    const normalizedProvinceSlug = state.provinciaSlug.trim();
    const normalizedCityId = state.cityId.trim();
    const normalizedCity = state.ciudad.trim();
    const normalizedAddress = state.direccion.trim();
    const normalizedPhone = state.telefonoContacto.trim();
    const title = `${state.propertyType} ${state.operation} - ${normalizedCity}`;
    const mappedOperation = mapOperationToBackend(state.operation);
    const mappedPropertyType = mapPropertyTypeToBackend(state.propertyType);

    if (!mappedOperation || !mappedPropertyType) {
      setSubmitError('No se pudo mapear operacion o tipo de propiedad para backend.');
      setIsSubmitting(false);
      return false;
    }

    if (!normalizedProvinceSlug || !normalizedCityId) {
      setSubmitError('Debes seleccionar provincia y ciudad.');
      setIsSubmitting(false);
      return false;
    }

    const payload: Record<string, unknown> = {
      operation: mappedOperation,
      propertyType: mappedPropertyType,
      title,
      description: state.descripcion.trim(),
      price: state.precio,
      currency: state.moneda,
      area: state.metrosCuadrados,
      coveredArea: state.metrosCubiertos,
      rooms: state.ambientes ?? null,
      bedrooms: state.dormitorios ?? null,
      bathrooms: state.banos ?? null,
      parking: state.cochera === true ? 1 : 0,
      ageYears: state.antiguedad ?? null,
      condition: state.estadoInmueble ?? null,
      expenses: state.expensas ?? null,
      ownerType: 'particular',
      contactName: normalizedOwner,
      contactPhone: normalizedPhone || undefined,
      cityId: normalizedCityId,
      address: normalizedAddress || undefined,
      source: 'internal',
    };

    try {
      const warnings: string[] = [];
      const propertyId = options?.propertyId;

      if (mode === 'edit') {
        if (!propertyId) {
          setSubmitError('No se encontro la propiedad a editar.');
          return false;
        }

        const updated = await propertyApi.update(propertyId, payload);
        setCreatedPropertyId(updated.id ?? propertyId);

        if (state.imagenes.length > 0) {
          const uploads = await Promise.allSettled(
            state.imagenes.map((file) => propertyApi.uploadImage(propertyId, file)),
          );
          const failedUploads = uploads.filter((result) => result.status === 'rejected').length;

          if (failedUploads > 0) {
            warnings.push(
              `La propiedad se actualizo, pero ${failedUploads} de ${state.imagenes.length} imagen(es) no se pudieron subir.`,
            );
          }
        }

        if (warnings.length > 0) {
          setSubmitWarning(warnings.join(' '));
        }

        return true;
      }

      const created = await propertyApi.createWithActivation(payload);
      setCreatedPropertyId(created.property.id);

      if (created.message) {
        warnings.push(created.message);
      }

      if (state.imagenes.length > 0) {
        const uploads = await Promise.allSettled(
          state.imagenes.map((file) => propertyApi.uploadImage(created.property.id, file)),
        );
        const failedUploads = uploads.filter((result) => result.status === 'rejected').length;

        if (failedUploads > 0) {
          warnings.push(
            `La propiedad se creo, pero ${failedUploads} de ${state.imagenes.length} imagen(es) no se pudieron subir.`,
          );
        }
      }

      if (warnings.length > 0) {
        setSubmitWarning(warnings.join(' '));
      }

      return true;
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    currentStep,
    totalSteps: TOTAL_STEPS,
    state,
    isCurrentStepValid,
    isSubmitting,
    submitError,
    submitWarning,
    createdPropertyId,
    nextStep,
    prevStep,
    updateField,
    reset,
    submit,
  };
}
