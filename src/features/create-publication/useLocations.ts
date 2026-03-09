import { useSantaFeCities } from '../../hooks/useSantaFeCities';

// Backward-compatible wrapper for previous imports in this feature.
export function useLocations() {
  const { cities, isLoadingCities, citiesError, reloadCities } = useSantaFeCities();

  return {
    provinces: [],
    cities,
    citiesProvinceSlug: 'santa-fe',
    isLoadingProvinces: false,
    isLoadingCities,
    provincesError: null,
    citiesError,
    loadProvinces: async () => {},
    loadCitiesByProvinceSlug: async () => {
      await reloadCities();
    },
    resolveProvinceByCityId: async () => null,
  };
}
