import { useCallback, useState } from 'react';
import { propertyApi } from '../services/api';


import type { Property, PropertyFilters } from '../types';

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  
  const fetchProperties = useCallback(async (filters: PropertyFilters) => {
    setIsLoading(true);
    setError(null);
    setHasFetched(true);

    try {
      const data = await propertyApi.filter(filters);
      setProperties(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError('Error al buscar propiedades.');
      setProperties([]);
    } finally {
      setIsLoading(false);
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
    error,
    hasFetched,
    fetchProperties,
    resetProperties,
  };
}
