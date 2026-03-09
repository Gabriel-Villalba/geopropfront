import { useCallback, useEffect, useState } from 'react';
import { locationApi } from '../services/api';
import { getApiErrorMessage } from '../services/backend';
import type { City } from '../types';

const SANTA_FE_SLUG = 'santa-fe';

export function useSantaFeCities() {
  const [cities, setCities] = useState<City[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [citiesError, setCitiesError] = useState<string | null>(null);

  const loadCities = useCallback(async () => {
    setIsLoadingCities(true);
    setCitiesError(null);
    try {
      const data = await locationApi.getCitiesByProvinceSlug(SANTA_FE_SLUG);
      setCities(Array.isArray(data) ? data : []);
    } catch (error) {
      setCitiesError(getApiErrorMessage(error));
      setCities([]);
    } finally {
      setIsLoadingCities(false);
    }
  }, []);

  useEffect(() => {
    void loadCities();
  }, [loadCities]);

  return {
    cities,
    isLoadingCities,
    citiesError,
    reloadCities: loadCities,
  };
}
