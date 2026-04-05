import { useCallback, useEffect, useState } from 'react';
import { locationApi } from '../services/api';
import type { City, Province } from '../types';

export function useLocations(selectedProvinceSlug?: string) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [provincesError, setProvincesError] = useState<string | null>(null);
  const [citiesError, setCitiesError] = useState<string | null>(null);

  const loadProvinces = useCallback(async () => {
    setIsLoadingProvinces(true);
    setProvincesError(null);
    try {
      const data = await locationApi.getProvinces();
      setProvinces(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setProvinces([]);
      setProvincesError('No se pudieron cargar las provincias.');
    } finally {
      setIsLoadingProvinces(false);
    }
  }, []);

  const loadCities = useCallback(async (provinceSlug?: string) => {
    if (!provinceSlug) {
      setCities([]);
      setCitiesError(null);
      return;
    }

    setIsLoadingCities(true);
    setCitiesError(null);
    try {
      const data = await locationApi.getCitiesByProvinceSlug(provinceSlug);
      setCities(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setCities([]);
      setCitiesError('No se pudieron cargar las ciudades.');
    } finally {
      setIsLoadingCities(false);
    }
  }, []);

  useEffect(() => {
    void loadProvinces();
  }, [loadProvinces]);

  useEffect(() => {
    void loadCities(selectedProvinceSlug);
  }, [loadCities, selectedProvinceSlug]);

  return {
    provinces,
    cities,
    isLoadingProvinces,
    isLoadingCities,
    provincesError,
    citiesError,
    reloadProvinces: loadProvinces,
    reloadCities: () => loadCities(selectedProvinceSlug),
  };
}
