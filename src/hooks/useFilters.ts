import { useMemo, useState } from 'react';
import type { PropertyFilters } from '../types';

export interface FiltersFormState {
  city: string;
  operation?: 'venta' | 'alquiler' | null;
  type: 'casa' | 'departamento' | 'lote' | 'comercial' | 'galpon-deposito' | '';
  sizeCategory: string;
  minBedrooms: string;
  sortBy: string; 
  order: 'asc' | 'desc';
  search: string;
  minPrice: string;
  maxPrice: string;
  minParking: string;
  minArea: string;
  maxArea: string;
  publisherType: string;
}

const DEFAULT_FILTERS: FiltersFormState = {
  city: '',
  operation: null,
  type: '',
  sizeCategory: '',
  minBedrooms: '',
  sortBy: 'price',
  order: 'asc',
  search: '',
  minPrice: '',
  maxPrice: '',
  minParking: '',
  minArea: '',
  maxArea: '',
  publisherType: '',
};

const parseNumber = (value: string) => (value.trim() === '' ? undefined : Number(value));

const isBedroomsAllowed = (type: FiltersFormState['type']) => type === 'casa' || type === 'departamento';

export function useFilters(initialFilters = DEFAULT_FILTERS) {
  const [filters, setFilters] = useState<FiltersFormState>(initialFilters);

  const updateFilter = (key: keyof FiltersFormState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => setFilters(initialFilters);

  const params = useMemo<PropertyFilters>(() => {
    const base: PropertyFilters = {
      city: filters.city || undefined,
      operation: filters.operation || undefined,
      type: filters.type || undefined,
      sizeCategory: (filters.sizeCategory as 'small' | 'medium' | 'large') || undefined,
      search: filters.search || undefined,
      sortBy: filters.sortBy || undefined,
      order: filters.order || undefined,
      minBedrooms: isBedroomsAllowed(filters.type) ? parseNumber(filters.minBedrooms) : undefined,
      minPrice: parseNumber(filters.minPrice),
      maxPrice: parseNumber(filters.maxPrice),
      minParking: parseNumber(filters.minParking),
      minArea: parseNumber(filters.minArea),
      maxArea: parseNumber(filters.maxArea),
      publisherType: filters.publisherType || undefined,
    };

    return Object.fromEntries(Object.entries(base).filter(([, value]) => value !== undefined)) as PropertyFilters;
  }, [filters]);

  return {
    filters,
    params,
    updateFilter,
    resetFilters,
  };
}
