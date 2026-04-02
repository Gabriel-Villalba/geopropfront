import { useCallback, useEffect, useState } from 'react';
import type { Property } from '../types';

const STORAGE_KEY = 'geoprop:favorites';
const UPDATE_EVENT = 'geoprop:favorites:updated';

function readFavorites(): Property[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Property[]) : [];
  } catch {
    return [];
  }
}

function writeFavorites(items: Property[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(UPDATE_EVENT));
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Property[]>(() => readFavorites());

  useEffect(() => {
    const handle = () => setFavorites(readFavorites());
    window.addEventListener(UPDATE_EVENT, handle);
    return () => window.removeEventListener(UPDATE_EVENT, handle);
  }, []);

  const isFavorite = useCallback((id: Property['id']) => {
    return favorites.some((item) => String(item.id) === String(id));
  }, [favorites]);

  const toggleFavorite = useCallback((property: Property) => {
    setFavorites((prev) => {
      const exists = prev.some((item) => String(item.id) === String(property.id));
      const next = exists
        ? prev.filter((item) => String(item.id) !== String(property.id))
        : [property, ...prev];
      writeFavorites(next);
      return next;
    });
  }, []);

  const removeFavorite = useCallback((id: Property['id']) => {
    setFavorites((prev) => {
      const next = prev.filter((item) => String(item.id) !== String(id));
      writeFavorites(next);
      return next;
    });
  }, []);

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    removeFavorite,
  };
}
