import axios from 'axios';
import type {
  AuthResponse,
  City,
  CreatePaymentPreferencePayload,
  CreateInquiryPayload,
  DashboardSummary,
  ExpiringProperty,
  InquiryListParams,
  LoginCredentials,
  PaginatedResponse,
  PaymentPreference,
  Property,
  PropertyFilters,
  PropertyInquiry,
  PropertyPerformanceMetric,
  Province,
  RegisterCredentials,
  RenewListingPayload,
  NotificationItem,
  User,
  UpdateUserPayload,
  UserPlan,
  UserRecord,
  ZonePriceStat,
  ApiResponse,
  BulkImportSummary,
} from '../types';
import {
  type BackendAlert,
  type BackendApiResponse,
  type BackendMe,
  type BackendProperty,
  extractApiData,
} from './backend';

interface SearchPropertyResponse extends Omit<Property, 'image' | 'images'> {
  image?: string | string[] | null;
  images?: string[] | null;
}

interface MyPropertiesExtendedResponse {
  properties: BackendProperty[];
  expiringSoon: ExpiringProperty[];
}

function extractCollection<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (payload && typeof payload === 'object') {
    const maybeWrapped = payload as {
      success?: boolean;
      error?: string | null;
      data?: unknown;
      results?: unknown;
    };

    if (typeof maybeWrapped.success === 'boolean' && !maybeWrapped.success) {
      throw new Error(maybeWrapped.error ?? 'No se pudo completar la operacion.');
    }

    if (Array.isArray(maybeWrapped.results)) {
      return maybeWrapped.results as T[];
    }

    if (Array.isArray(maybeWrapped.data)) {
      return maybeWrapped.data as T[];
    }

    if (maybeWrapped.data && typeof maybeWrapped.data === 'object') {
      const nested = maybeWrapped.data as { results?: unknown };
      if (Array.isArray(nested.results)) {
        return nested.results as T[];
      }
    }
  }

  return [];
}

function normalizeSearchProperty(property: SearchPropertyResponse): Property {
  const imageList = Array.isArray(property.images)
    ? property.images.filter((item): item is string => typeof item === 'string' && item.trim() !== '')
    : Array.isArray(property.image)
      ? property.image.filter((item): item is string => typeof item === 'string' && item.trim() !== '')
      : typeof property.image === 'string' && property.image.trim() !== ''
        ? [property.image]
        : [];

  return {
    ...property,
    image: imageList[0] ?? null,
    images: imageList,
  };
}

const API_TIMEOUT_MS = 15000;
const DEFAULT_RETRY_COUNT = 2;
const DEFAULT_RETRY_DELAY_MS = 1000;

type RetryMeta = {
  attempt: number;
  maxRetries: number;
  delayMs: number;
  error: unknown;
};

export type RetryOptions = {
  retries?: number;
  delayMs?: number;
  include5xx?: boolean;
  onRetry?: (meta: RetryMeta) => void;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableError(error: unknown, include5xx: boolean): boolean {
  if (!axios.isAxiosError(error)) {
    return false;
  }

  if (error.code === 'ERR_CANCELED') {
    return false;
  }

  if (error.code === 'ECONNABORTED' || (typeof error.message === 'string' && error.message.toLowerCase().includes('timeout'))) {
    return true;
  }

  if (!error.response) {
    return true;
  }

  if (include5xx) {
    const status = error.response.status;
    return status >= 500 && status < 600;
  }

  return false;
}

export async function requestWithRetry<T>(
  requestFn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const {
    retries = DEFAULT_RETRY_COUNT,
    delayMs = DEFAULT_RETRY_DELAY_MS,
    include5xx = true,
    onRetry,
  } = options;

  let attempt = 0;

  while (true) {
    try {
      return await requestFn();
    } catch (error) {
      const shouldRetry = attempt < retries && isRetryableError(error, include5xx);
      if (!shouldRetry) {
        throw error;
      }

      attempt += 1;
      onRetry?.({ attempt, maxRetries: retries, delayMs, error });

      if (delayMs > 0) {
        await sleep(delayMs);
      }
    }
  }
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
  timeout: API_TIMEOUT_MS,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// helper to massage the data that will travel over the wire. the backend
// has historically been a little picky about formats (snake case, lowercased
// emails, etc.) so we centralise the logic here instead of scattering it
// across pages/components.
type AuthPayload = {
  email?: string;
  password?: string;
  name?: string;
  role?: string;
  phone?: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
};

function normalizeAuthPayload<T extends AuthPayload>(p: T): T {
  const base: Partial<AuthPayload> = {};

  if (p.email) {
    base.email = p.email.trim().toLowerCase();
  }

  if (p.password) {
    base.password = p.password.trim();
  }

  if (p.name) {
    base.name = p.name.trim();
  }

  if (p.role) {
    base.role = p.role;
  }

  if (p.phone) {
    base.phone = p.phone.trim();
  }

  if (p.clientName) {
    base.clientName = p.clientName.trim();
  }

  if (p.clientEmail) {
    base.clientEmail = p.clientEmail.trim().toLowerCase();
  }

  if (p.clientPhone) {
    base.clientPhone = p.clientPhone.trim();
  }

  return base as T;
}

function normalizeInquiryPayload(payload: CreateInquiryPayload): CreateInquiryPayload {
  const normalized: CreateInquiryPayload = { ...payload };

  if (typeof payload.name === 'string') {
    normalized.name = payload.name.trim();
  }

  if (typeof payload.email === 'string') {
    normalized.email = payload.email.trim().toLowerCase();
  }

  if (typeof payload.phone === 'string') {
    normalized.phone = payload.phone.trim();
  }

  if (typeof payload.message === 'string') {
    normalized.message = payload.message.trim();
  }

  if (typeof payload.source === 'string') {
    const source = payload.source.trim();
    normalized.source = source ? source : undefined;
  }

  return normalized;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const payload = normalizeAuthPayload(credentials) as LoginCredentials;
    const response = await requestWithRetry(() => api.post<BackendApiResponse<AuthResponse>>('/auth/login', payload));
    return extractApiData(response);
  },
  register: async (payload: RegisterCredentials): Promise<AuthResponse> => {
    // normalizeAuthPayload generic return type follows the input; cast to unknown
    // before sending so axios is happy and we can continue to add/remove keys
    const normalized = normalizeAuthPayload(payload) as unknown;
    const response = await requestWithRetry(() => api.post<BackendApiResponse<AuthResponse>>('/auth/register', normalized));
    return extractApiData(response);
  },
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const normalizedEmail = email.trim().toLowerCase();
    const response = await requestWithRetry(() =>
      api.post<BackendApiResponse<{ message: string }>>('/auth/forgot-password', {
      email: normalizedEmail,
      }),
    );
    return extractApiData(response);
  },
  resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    const response = await requestWithRetry(() =>
      api.post<BackendApiResponse<{ message: string }>>('/auth/reset-password', {
      token: token.trim(),
      newPassword: newPassword.trim(),
      }),
    );
    return extractApiData(response);
  },
};

export const meApi = {
  getMe: async (): Promise<User> => {
    const response = await requestWithRetry(() => api.get<BackendApiResponse<BackendMe>>('/me'));
    const me = extractApiData(response);

      return {
        id: me.id,
        clientId: me.clientId,
        roleId: me.roleId,
        role: me.role ?? undefined,
        active: me.active,
        name: me.name,
        email: me.email,
        instagramUrl: me.instagramUrl ?? null,
        phone: me.phone ?? null,
        plan: me.plan,
        planExpiresAt: me.planExpiresAt,
        subscriptionStatus: me.subscriptionStatus,
    };
  },
  getMyProperties: async (): Promise<BackendProperty[]> => {
    const response = await requestWithRetry(() =>
      api.get<BackendApiResponse<BackendProperty[]>>('/me/properties'),
    );
    return extractApiData(response);
  },
  getDashboardSummary: async (): Promise<DashboardSummary> => {
    const response = await requestWithRetry(() =>
      api.get<BackendApiResponse<DashboardSummary>>('/me/dashboard-summary'),
    );
    return extractApiData(response);
  },
  getPropertyPerformance: async (): Promise<PropertyPerformanceMetric[]> => {
    const response = await requestWithRetry(() =>
      api.get<BackendApiResponse<PropertyPerformanceMetric[]>>('/me/properties/metrics'),
    );
    return extractApiData(response);
  },
  getZonePriceStats: async (): Promise<ZonePriceStat[]> => {
    const response = await requestWithRetry(() =>
      api.get<BackendApiResponse<ZonePriceStat[]>>('/me/zone-stats'),
    );
    return extractApiData(response);
  },
};

export const userApi = {
  update: async (id: string, payload: UpdateUserPayload): Promise<UserRecord> => {
    const response = await requestWithRetry(() => api.put<ApiResponse<UserRecord>>(`/users/${id}`, payload));
    return response.data.data;
  },
};

export const clientApi = {
  updateMe: async (payload: { plan?: UserPlan; planExpiresAt?: string | null; subscriptionStatus?: string | null }) => {
    const response = await requestWithRetry(() =>
      api.put<ApiResponse<{ id: string; plan?: UserPlan }>>('/clients/me', payload),
    );
    return response.data.data;
  },
};

export const propertyApi = {
  filter: async (filters: PropertyFilters, retryOptions?: RetryOptions): Promise<Property[]> => {
    const response = await requestWithRetry(
      () =>
        api.get<unknown>('/search', {
          params: filters,
        }),
      retryOptions,
    );

    const results = extractCollection<SearchPropertyResponse>(response.data);
    return results.map(normalizeSearchProperty);
  },
  listMine: async (): Promise<BackendProperty[]> => {
    const response = await requestWithRetry(() =>
      api.get<BackendApiResponse<BackendProperty[]>>('/properties'),
    );
    return extractApiData(response);
  },
  getMyPropertiesExtended: async (): Promise<MyPropertiesExtendedResponse> => {
    const response = await requestWithRetry(() =>
      api.get<BackendApiResponse<MyPropertiesExtendedResponse>>('/properties/my'),
    );
    return extractApiData(response);
  },
  create: async (payload: Record<string, unknown>): Promise<BackendProperty> => {
    const response = await requestWithRetry(() =>
      api.post<BackendApiResponse<BackendProperty>>('/properties', payload),
    );
    return extractApiData(response);
  },
  createWithActivation: async (
    payload: Record<string, unknown>,
  ): Promise<{ property: BackendProperty; message?: string | null; activation?: { isActive: boolean; activeCountBeforeCreate?: number; plan?: string } | null }> => {
    const response = await requestWithRetry(() =>
      api.post<
        BackendApiResponse<BackendProperty> & {
          message?: string | null;
          activation?: { isActive: boolean; activeCountBeforeCreate?: number; plan?: string } | null;
        }
      >('/properties', payload),
    );

    return {
      property: extractApiData(response),
      message: response.data.message ?? null,
      activation: response.data.activation ?? null,
    };
  },
  uploadImage: async (
    propertyId: string,
    imageFile: File,
  ): Promise<{
    id: string;
    propertyId: string;
    imageUrl: string;
    displayOrder: number;
    publicId: string;
    isPrimary: boolean;
    createdAt: string;
  }> => {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await requestWithRetry(() =>
      api.post<
        BackendApiResponse<{
          id: string;
          propertyId: string;
          imageUrl: string;
          displayOrder: number;
          publicId: string;
          isPrimary: boolean;
          createdAt: string;
        }>
      >(`/properties/${propertyId}/images`, formData),
    );
    return extractApiData(response);
  },
  deleteImage: async (propertyId: string, imageId: string): Promise<{ id: string; propertyId: string }> => {
    const response = await requestWithRetry(() =>
      api.delete<BackendApiResponse<{ id: string; propertyId: string }>>(
        `/properties/${propertyId}/images/${imageId}`,
      ),
    );
    return extractApiData(response);
  },
  update: async (id: string, payload: Record<string, unknown>): Promise<BackendProperty> => {
    const response = await requestWithRetry(() =>
      api.put<BackendApiResponse<BackendProperty>>(`/properties/${id}`, payload),
    );
    return extractApiData(response);
  },
  renewProperty: async (id: string, payload: RenewListingPayload): Promise<BackendProperty> => {
    const response = await requestWithRetry(() =>
      api.post<BackendApiResponse<BackendProperty>>(`/properties/${id}/renew`, payload),
    );
    return extractApiData(response);
  },
  createPaymentPreference: async (payload: CreatePaymentPreferencePayload): Promise<PaymentPreference> => {
    const response = await requestWithRetry(() =>
      api.post<BackendApiResponse<PaymentPreference>>('/payments/create-preference', payload),
    );
    return extractApiData(response);
  },
  activate: async (id: string): Promise<void> => {
    await requestWithRetry(() =>
      api.patch<BackendApiResponse<{ id: string }>>(`/properties/${id}/activate`),
    );
  },
  deactivate: async (id: string): Promise<void> => {
    await requestWithRetry(() =>
      api.patch<BackendApiResponse<{ id: string }>>(`/properties/${id}/deactivate`),
    );
  },
  approve: async (id: string): Promise<void> => {
    await requestWithRetry(() =>
      api.patch<BackendApiResponse<{ id: string }>>(`/properties/${id}/approve`),
    );
  },
  trackView: async (id: string): Promise<{ id: string; views: number }> => {
    const response = await requestWithRetry(
      () =>
        api.post<BackendApiResponse<{ id: string; views: number }>>(`/properties/${id}/views`),
      { retries: 0, include5xx: false },
    );
    return extractApiData(response);
  },
  remove: async (id: string): Promise<void> => {
    await requestWithRetry(() => api.delete<BackendApiResponse<{ id: string }>>(`/properties/${id}`));
  },
};

export const inquiryApi = {
  createForProperty: async (propertyId: string, payload: CreateInquiryPayload): Promise<PropertyInquiry> => {
    const normalized = normalizeInquiryPayload(payload);
    const response = await requestWithRetry(() =>
      api.post<BackendApiResponse<PropertyInquiry>>(`/properties/${propertyId}/inquiries`, normalized),
    );
    return extractApiData(response);
  },
  create: async (payload: CreateInquiryPayload): Promise<PropertyInquiry> => {
    const normalized = normalizeInquiryPayload(payload);
    const response = await requestWithRetry(() =>
      api.post<BackendApiResponse<PropertyInquiry>>('/inquiries', normalized),
    );
    return extractApiData(response);
  },
  list: async (params?: InquiryListParams): Promise<{ items: PropertyInquiry[]; pagination: PaginatedResponse<PropertyInquiry[]>['pagination'] }> => {
    const response = await requestWithRetry(() =>
      api.get<PaginatedResponse<PropertyInquiry[]>>('/inquiries', { params }),
    );

    if (!response.data.success) {
      throw new Error(response.data.error ?? 'No se pudo completar la operacion.');
    }

    return {
      items: response.data.data ?? [],
      pagination: response.data.pagination,
    };
  },
  listByProperty: async (
    propertyId: string,
    params?: InquiryListParams,
  ): Promise<{ items: PropertyInquiry[]; pagination: PaginatedResponse<PropertyInquiry[]>['pagination'] }> => {
    const response = await requestWithRetry(() =>
      api.get<PaginatedResponse<PropertyInquiry[]>>(`/properties/${propertyId}/inquiries`, { params }),
    );

    if (!response.data.success) {
      throw new Error(response.data.error ?? 'No se pudo completar la operacion.');
    }

    return {
      items: response.data.data ?? [],
      pagination: response.data.pagination,
    };
  },
};

export const notificationApi = {
  list: async (params?: InquiryListParams): Promise<{ items: NotificationItem[]; pagination: PaginatedResponse<NotificationItem[]>['pagination'] }> => {
    const response = await requestWithRetry(() =>
      api.get<PaginatedResponse<NotificationItem[]>>('/notifications', { params }),
    );

    if (!response.data.success) {
      throw new Error(response.data.error ?? 'No se pudo completar la operacion.');
    }

    return {
      items: response.data.data ?? [],
      pagination: response.data.pagination,
    };
  },
  getUnreadCount: async (): Promise<number> => {
    const response = await requestWithRetry(() => api.get<ApiResponse<{ count: number }>>('/notifications/unread-count'));
    if (!response.data.success) {
      throw new Error(response.data.error ?? 'No se pudo completar la operacion.');
    }
    return response.data.data?.count ?? 0;
  },
  markRead: async (id: string): Promise<void> => {
    await requestWithRetry(() =>
      api.patch<ApiResponse<{ id: string }>>(`/notifications/${id}/read`),
    );
  },
  markAllRead: async (): Promise<void> => {
    await requestWithRetry(() =>
      api.post<ApiResponse<{ count: number }>>('/notifications/read-all'),
    );
  },
};

export const alertApi = {
  list: async (): Promise<BackendAlert[]> => {
    const response = await requestWithRetry(() => api.get<BackendApiResponse<BackendAlert[]>>('/alerts'));
    return extractApiData(response);
  },
  create: async (payload: Record<string, unknown>): Promise<BackendAlert> => {
    const response = await requestWithRetry(() =>
      api.post<BackendApiResponse<BackendAlert>>('/alerts', payload),
    );
    return extractApiData(response);
  },
  deactivate: async (id: string): Promise<void> => {
    await requestWithRetry(() =>
      api.patch<BackendApiResponse<{ id: string }>>(`/alerts/${id}/deactivate`),
    );
  },
};

export const importApi = {
  bulkImport: async (payload: { file: File; mapping: Record<string, string | null> }): Promise<BulkImportSummary> => {
    const formData = new FormData();
    formData.append('file', payload.file);
    formData.append('mapping', JSON.stringify(payload.mapping ?? {}));

    const response = await requestWithRetry(() =>
      api.post<BackendApiResponse<BulkImportSummary>>('/import/bulk', formData),
    );
    return extractApiData(response);
  },
};

export const locationApi = {
  getProvinces: async (retryOptions?: RetryOptions): Promise<Province[]> => {
    const response = await requestWithRetry(() => api.get<unknown>('/locations/provinces'), retryOptions);
    return extractCollection<Province>(response.data);
  },
  getCitiesByProvinceSlug: async (slug: string, retryOptions?: RetryOptions): Promise<City[]> => {
    const response = await requestWithRetry(
      () =>
        api.get<unknown>('/locations/cities', {
          params: { province: slug },
        }),
      retryOptions,
    );
    return extractCollection<City>(response.data);
  },
};

export default api;
