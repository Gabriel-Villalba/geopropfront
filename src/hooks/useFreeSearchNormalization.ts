import { useRef } from 'react';
import type { City, Province } from '../types';
import { DEFAULT_FILTERS, type FiltersFormState } from './useFilters';

type ManagedFreeSearchKey =
  | 'search'
  | 'operation'
  | 'type'
  | 'city'
  | 'province'
  | 'minBedrooms'
  | 'minPrice'
  | 'maxPrice'
  | 'minParking'
  | 'minArea'
  | 'maxArea'
  | 'publisherType';

type ManagedFreeSearchPatch = Partial<Pick<FiltersFormState, ManagedFreeSearchKey>>;

const NUMBER_WORDS: Record<string, number> = {
  un: 1,
  uno: 1,
  una: 1,
  dos: 2,
  tres: 3,
  cuatro: 4,
  cinco: 5,
  seis: 6,
  siete: 7,
  ocho: 8,
  nueve: 9,
  diez: 10,
};

const FILLER_WORDS = new Set([
  'busco',
  'buscar',
  'quiero',
  'necesito',
  'me',
  'gustaria',
  'gustaria',
  'un',
  'una',
  'unos',
  'unas',
  'el',
  'la',
  'los',
  'las',
  'de',
  'del',
  'en',
  'con',
  'para',
  'por',
  'que',
  'tipo',
]);

const MANAGED_DEFAULTS: Pick<FiltersFormState, ManagedFreeSearchKey> = {
  search: DEFAULT_FILTERS.search,
  operation: DEFAULT_FILTERS.operation,
  type: DEFAULT_FILTERS.type,
  city: DEFAULT_FILTERS.city,
  province: DEFAULT_FILTERS.province,
  minBedrooms: DEFAULT_FILTERS.minBedrooms,
  minPrice: DEFAULT_FILTERS.minPrice,
  maxPrice: DEFAULT_FILTERS.maxPrice,
  minParking: DEFAULT_FILTERS.minParking,
  minArea: DEFAULT_FILTERS.minArea,
  maxArea: DEFAULT_FILTERS.maxArea,
  publisherType: DEFAULT_FILTERS.publisherType,
};

function compactSpaces(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function safeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parseNumberish(value: string) {
  const cleanedValue = safeText(value).replace(/[^\d.,\s]/g, ' ').trim();
  if (!cleanedValue) return null;

  const normalized = cleanedValue
    .replace(/\s+/g, ' ')
    .replace(/\./g, '')
    .replace(',', '.');
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : null;
}

function parseMagnitudeNumber(value: string) {
  const normalized = safeText(value);
  const multiplier = normalized.includes('millon') ? 1_000_000 : normalized.includes('mil') ? 1_000 : 1;
  const numericSource = normalized.replace(/\b(?:mil|millones?|millon|usd|u\$s|dolares?|ars|pesos?)\b/g, ' ');
  const parsed = parseNumberish(numericSource);

  if (!Number.isFinite(parsed)) return null;
  return Math.round(parsed * multiplier);
}

function parseWordNumber(value: string) {
  const normalized = safeText(value).trim();
  if (normalized in NUMBER_WORDS) {
    return NUMBER_WORDS[normalized];
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function setStringValue(
  patch: ManagedFreeSearchPatch,
  keys: Set<ManagedFreeSearchKey>,
  key: ManagedFreeSearchKey,
  value: string | null,
) {
  if (typeof value !== 'string') return;
  const normalizedValue = compactSpaces(value);
  if (!normalizedValue) return;

  patch[key] = normalizedValue as FiltersFormState[ManagedFreeSearchKey];
  keys.add(key);
}

function consumePattern(source: string, pattern: RegExp) {
  const match = source.match(pattern);
  if (!match) {
    return { matched: null, next: source };
  }

  return {
    matched: match,
    next: compactSpaces(source.replace(pattern, ' ')),
  };
}

function consumeEntity(source: string, value: string) {
  const pattern = new RegExp(`\\b${escapeRegExp(value)}\\b`, 'i');
  return consumePattern(source, pattern);
}

function findBestNameMatch<T extends { name: string }>(query: string, items: T[]) {
  const normalizedQuery = safeText(query);

  return [...items]
    .sort((left, right) => right.name.length - left.name.length)
    .find((item) => normalizedQuery.includes(safeText(item.name)));
}

function cleanupSearchRemainder(value: string) {
  const withoutPunctuation = value.replace(/[.,;:()]+/g, ' ');
  const cleaned = compactSpaces(
    withoutPunctuation
      .split(/\s+/)
      .filter((token) => {
        const normalizedToken = safeText(token);
        return normalizedToken && !FILLER_WORDS.has(normalizedToken);
      })
      .join(' '),
  );

  return cleaned;
}

function extractRangeValue(source: string, unitPattern: string) {
  const betweenPattern = new RegExp(
    `\\b(?:entre|de)\\s+([^\\s]+(?:\\s+(?:mil|millones?|millon))?)\\s+(?:y|a)\\s+([^\\s]+(?:\\s+(?:mil|millones?|millon))?)\\s*${unitPattern}`,
    'i',
  );
  const minPattern = new RegExp(
    `\\b(?:desde|minimo|mínimo|mas\\s+de|m[aá]s\\s+de)\\s+([^\\s]+(?:\\s+(?:mil|millones?|millon))?)\\s*${unitPattern}`,
    'i',
  );
  const maxPattern = new RegExp(
    `\\b(?:hasta|maximo|máximo|menos\\s+de)\\s+([^\\s]+(?:\\s+(?:mil|millones?|millon))?)\\s*${unitPattern}`,
    'i',
  );

  return {
    betweenPattern,
    minPattern,
    maxPattern,
  };
}

function parseFreeSearchQuery(
  query: string,
  cities: City[],
  provinces?: Province[],
) {
  const patch: ManagedFreeSearchPatch = {};
  const appliedKeys = new Set<ManagedFreeSearchKey>();
  const originalQuery = compactSpaces(query);
  let remaining = originalQuery;

  const matchedProvince = provinces?.length ? findBestNameMatch(remaining, provinces) : null;
  if (matchedProvince) {
    setStringValue(patch, appliedKeys, 'province', matchedProvince.slug);
    remaining = consumeEntity(remaining, matchedProvince.name).next;
  }

  const matchedCity = cities.length ? findBestNameMatch(remaining, cities) : null;
  if (matchedCity) {
    setStringValue(patch, appliedKeys, 'city', matchedCity.name);
    remaining = consumeEntity(remaining, matchedCity.name).next;
  }

  const operationPatterns = [
    { value: 'alquiler', pattern: /\b(?:en\s+alquiler|alquiler|alquilar|alquilo|alquila)\b/i },
    { value: 'venta', pattern: /\b(?:en\s+venta|venta|comprar|compra|compro|vende|vendo)\b/i },
  ] as const;

  for (const operation of operationPatterns) {
    const result = consumePattern(remaining, operation.pattern);
    if (!result.matched) continue;

    setStringValue(patch, appliedKeys, 'operation', operation.value);
    remaining = result.next;
    break;
  }

  const publisherPatterns = [
    { value: 'particular', pattern: /\b(?:dueno\s+directo|dueño\s+directo|particular)\b/i },
    { value: 'inmobiliaria', pattern: /\binmobiliaria\b/i },
  ] as const;

  for (const publisherType of publisherPatterns) {
    const result = consumePattern(remaining, publisherType.pattern);
    if (!result.matched) continue;

    setStringValue(patch, appliedKeys, 'publisherType', publisherType.value);
    remaining = result.next;
    break;
  }

  const typePatterns = [
    { value: 'galpon-deposito', pattern: /\b(?:galpon|galp[oó]n|deposito|dep[oó]sito|nave\s+industrial)\b/i },
    { value: 'comercial', pattern: /\b(?:local\s+comercial|local|oficina|consultorio|comercial)\b/i },
    { value: 'departamento', pattern: /\b(?:departamento|depto|dpto|monoambiente|ph)\b/i },
    { value: 'lote', pattern: /\b(?:lote|terreno|campo|fraccion)\b/i },
    { value: 'casa', pattern: /\b(?:casa|chalet|duplex|d[uú]plex|vivienda)\b/i },
  ] as const;

  for (const propertyType of typePatterns) {
    const result = consumePattern(remaining, propertyType.pattern);
    if (!result.matched) continue;

    setStringValue(patch, appliedKeys, 'type', propertyType.value);
    remaining = result.next;
    break;
  }

  const bedroomResult = consumePattern(
    remaining,
    /\b(?:de\s+)?(\d+|un|uno|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)\s+(?:dormitorios?|dorms?|habitaciones?)\b/i,
  );
  if (bedroomResult.matched) {
    const parsedBedrooms = parseWordNumber(bedroomResult.matched[1]);
    if (Number.isFinite(parsedBedrooms) && parsedBedrooms !== null) {
      setStringValue(patch, appliedKeys, 'minBedrooms', String(parsedBedrooms));
      remaining = bedroomResult.next;
    }
  }

  const parkingResult = consumePattern(
    remaining,
    /\b(?:con\s+)?(\d+|un|uno|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)?\s*(?:cocheras?|garage|garaje)\b/i,
  );
  if (parkingResult.matched) {
    const parsedParking = parseWordNumber(parkingResult.matched[1] || '1');
    if (Number.isFinite(parsedParking) && parsedParking !== null) {
      setStringValue(patch, appliedKeys, 'minParking', String(parsedParking));
      remaining = parkingResult.next;
    }
  }

  const areaPatterns = extractRangeValue(remaining, '(?:m2|m²|mt2|mts2|metros?\\s+cuadrados?)');

  const betweenArea = consumePattern(remaining, areaPatterns.betweenPattern);
  if (betweenArea.matched) {
    const minArea = parseMagnitudeNumber(betweenArea.matched[1]);
    const maxArea = parseMagnitudeNumber(betweenArea.matched[2]);
    if (Number.isFinite(minArea) && minArea !== null) {
      setStringValue(patch, appliedKeys, 'minArea', String(minArea));
    }
    if (Number.isFinite(maxArea) && maxArea !== null) {
      setStringValue(patch, appliedKeys, 'maxArea', String(maxArea));
    }
    remaining = betweenArea.next;
  } else {
    const minArea = consumePattern(remaining, areaPatterns.minPattern);
    if (minArea.matched) {
      const parsedMinArea = parseMagnitudeNumber(minArea.matched[1]);
      if (Number.isFinite(parsedMinArea) && parsedMinArea !== null) {
        setStringValue(patch, appliedKeys, 'minArea', String(parsedMinArea));
        remaining = minArea.next;
      }
    }

    const maxArea = consumePattern(remaining, areaPatterns.maxPattern);
    if (maxArea.matched) {
      const parsedMaxArea = parseMagnitudeNumber(maxArea.matched[1]);
      if (Number.isFinite(parsedMaxArea) && parsedMaxArea !== null) {
        setStringValue(patch, appliedKeys, 'maxArea', String(parsedMaxArea));
        remaining = maxArea.next;
      }
    }
  }

  const priceUnit = '(?:usd|u\\$s|d[oó]lares?|ars|pesos?|\\$)?';
  const pricePatterns = extractRangeValue(remaining, priceUnit);

  const betweenPrice = consumePattern(remaining, pricePatterns.betweenPattern);
  if (betweenPrice.matched) {
    const minPrice = parseMagnitudeNumber(betweenPrice.matched[1]);
    const maxPrice = parseMagnitudeNumber(betweenPrice.matched[2]);
    if (Number.isFinite(minPrice) && minPrice !== null) {
      setStringValue(patch, appliedKeys, 'minPrice', String(minPrice));
    }
    if (Number.isFinite(maxPrice) && maxPrice !== null) {
      setStringValue(patch, appliedKeys, 'maxPrice', String(maxPrice));
    }
    remaining = betweenPrice.next;
  } else {
    const minPrice = consumePattern(remaining, pricePatterns.minPattern);
    if (minPrice.matched) {
      const parsedMinPrice = parseMagnitudeNumber(minPrice.matched[1]);
      if (Number.isFinite(parsedMinPrice) && parsedMinPrice !== null) {
        setStringValue(patch, appliedKeys, 'minPrice', String(parsedMinPrice));
        remaining = minPrice.next;
      }
    }

    const maxPrice = consumePattern(remaining, pricePatterns.maxPattern);
    if (maxPrice.matched) {
      const parsedMaxPrice = parseMagnitudeNumber(maxPrice.matched[1]);
      if (Number.isFinite(parsedMaxPrice) && parsedMaxPrice !== null) {
        setStringValue(patch, appliedKeys, 'maxPrice', String(parsedMaxPrice));
        remaining = maxPrice.next;
      }
    }
  }

  const cleanedSearch = cleanupSearchRemainder(remaining);
  const hasStructuredFilters = appliedKeys.size > 0;

  patch.search = hasStructuredFilters ? cleanedSearch : originalQuery;
  appliedKeys.add('search');

  return {
    patch,
    appliedKeys: Array.from(appliedKeys),
  };
}

function clearManagedFilters(
  filters: FiltersFormState,
  appliedKeys: ManagedFreeSearchKey[],
) {
  if (appliedKeys.length === 0) return filters;

  const nextFilters = { ...filters };
  for (const key of appliedKeys) {
    nextFilters[key] = MANAGED_DEFAULTS[key];
  }

  return nextFilters;
}

export function useFreeSearchNormalization(options: {
  cities?: City[];
  provinces?: Province[];
}) {
  const appliedKeysRef = useRef<ManagedFreeSearchKey[]>([]);
  const cities = options.cities ?? [];
  const provinces = options.provinces;

  const prepareFiltersForSubmit = (filters: FiltersFormState) => {
    const baseFilters = clearManagedFilters(filters, appliedKeysRef.current);
    const freeSearchQuery = compactSpaces(filters.search);

    if (!freeSearchQuery) {
      appliedKeysRef.current = [];
      return baseFilters;
    }

    const { patch, appliedKeys } = parseFreeSearchQuery(freeSearchQuery, cities, provinces);
    appliedKeysRef.current = appliedKeys;

    return {
      ...baseFilters,
      ...patch,
    };
  };

  const resetParsedFilters = () => {
    appliedKeysRef.current = [];
  };

  return {
    prepareFiltersForSubmit,
    resetParsedFilters,
  };
}
