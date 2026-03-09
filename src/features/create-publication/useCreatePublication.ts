import { useMemo, useState } from 'react';
import { propertyApi } from '../../services/api';
import { getApiErrorMessage } from '../../services/backend';
import type { CreatePublicationPropertyType, CreatePublicationState } from './types';

const TOTAL_STEPS = 5;

const initialState: CreatePublicationState = {
  operation: undefined,
  propertyType: undefined,
  dormitorios: undefined,
  banos: undefined,
  cochera: undefined,
  metrosCuadrados: undefined,
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
      dormitorios: undefined,
      banos: undefined,
      cochera: undefined,
    };
  }

  if (nextType === 'comercial' || nextType === 'galpon-deposito') {
    return {
      dormitorios: undefined,
      cochera: undefined,
    };
  }

  return {
    dormitorios: undefined,
    banos: undefined,
    cochera: undefined,
    metrosCuadrados: undefined,
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
    state.ciudad.trim().length > 0;

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

export function useCreatePublication() {
  const [currentStep, setCurrentStep] = useState(1);
  const [state, setState] = useState<CreatePublicationState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitWarning, setSubmitWarning] = useState<string | null>(null);
  const [createdPropertyId, setCreatedPropertyId] = useState<string | null>(null);

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
    if (currentStep === 4) return true;
    return true;
  }, [currentStep, state]);

  const nextStep = () => {
    setCurrentStep((prev) => (prev >= TOTAL_STEPS ? TOTAL_STEPS : prev + 1));
  };

  const prevStep = () => {
    setCurrentStep((prev) => (prev <= 1 ? 1 : prev - 1));
  };

  const reset = () => {
    setCurrentStep(1);
    setState(initialState);
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
      area: state.metrosCuadrados,
      bedrooms: state.dormitorios ?? null,
      bathrooms: state.banos ?? null,
      parking: state.cochera === true ? 1 : 0,
      ownerType: 'particular',
      contactName: normalizedOwner,
      contactPhone: normalizedPhone || undefined,
      currency: 'USD',
      cityId: normalizedCityId,
      address: normalizedAddress || undefined,
      source: 'internal',
    };

    try {
      const created = await propertyApi.create(payload);
      setCreatedPropertyId(created.id);

      if (state.imagenes.length > 0) {
        const uploads = await Promise.allSettled(
          state.imagenes.map((file) => propertyApi.uploadImage(created.id, file)),
        );
        const failedUploads = uploads.filter((result) => result.status === 'rejected').length;

        if (failedUploads > 0) {
          setSubmitWarning(
            `La propiedad se creo, pero ${failedUploads} de ${state.imagenes.length} imagen(es) no se pudieron subir.`,
          );
        }
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
