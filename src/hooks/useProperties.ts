import { useCallback, useState } from 'react';
import { propertyApi } from '../services/api';


import type { Property, PropertyFilters } from '../types';

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  
  const fetchProperties = useCallback(async (filters: PropertyFilters) => {
    setIsLoading(true);
    setIsRetrying(false);
    setError(null);
    setHasFetched(true);

    try {
      const data = await propertyApi.filter(filters, {
        onRetry: () => setIsRetrying(true),
      });
      setProperties(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError('Error al buscar propiedades.');
      setProperties([]);
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
    }
  }, []);
const resetProperties = () => {
  setProperties([]);
  setHasFetched(false);
  setError(null);
};
  return {
    properties,
    isLoading,
    isRetrying,
    error,
    hasFetched,
    fetchProperties,
    resetProperties,
  };
}
