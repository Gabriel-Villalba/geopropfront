import axios from 'axios';
import type {
  AuthResponse,
  LoginCredentials,
  Property,
  PropertyFilters,
  RegisterCredentials,
  User,
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

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
  timeout: 10000,
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

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const payload = normalizeAuthPayload(credentials) as LoginCredentials;
    const response = await api.post<BackendApiResponse<AuthResponse>>('/auth/login', payload);
    return extractApiData(response);
  },
  register: async (payload: RegisterCredentials): Promise<AuthResponse> => {
    // normalizeAuthPayload generic return type follows the input; cast to unknown
    // before sending so axios is happy and we can continue to add/remove keys
    const normalized = normalizeAuthPayload(payload) as unknown;
    const response = await api.post<BackendApiResponse<AuthResponse>>('/auth/register', normalized);
    return extractApiData(response);
  },
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const normalizedEmail = email.trim().toLowerCase();
    const response = await api.post<BackendApiResponse<{ message: string }>>('/auth/forgot-password', {
      email: normalizedEmail,
    });
    return extractApiData(response);
  },
  resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    const response = await api.post<BackendApiResponse<{ message: string }>>('/auth/reset-password', {
      token: token.trim(),
      newPassword: newPassword.trim(),
    });
    return extractApiData(response);
  },
};

export const meApi = {
  getMe: async (): Promise<User> => {
    const response = await api.get<BackendApiResponse<BackendMe>>('/me');
    const me = extractApiData(response);

    return {
      id: me.id,
      clientId: me.clientId,
      roleId: me.roleId,
      role: me.role ?? undefined,
      active: me.active,
      name: me.name,
      email: me.email,
      plan: me.plan,
      planExpiresAt: me.planExpiresAt,
      subscriptionStatus: me.subscriptionStatus,
    };
  },
  getMyProperties: async (): Promise<BackendProperty[]> => {
    const response = await api.get<BackendApiResponse<BackendProperty[]>>('/me/properties');
    return extractApiData(response);
  },
};

export const propertyApi = {
  filter: async (filters: PropertyFilters): Promise<Property[]> => {
    const response = await api.get<{ success: boolean; results?: SearchPropertyResponse[] }>('/search', {
      params: filters,
    });

    const results = response.data.results ?? [];
    return results.map(normalizeSearchProperty);
  },
  listMine: async (): Promise<BackendProperty[]> => {
    const response = await api.get<BackendApiResponse<BackendProperty[]>>('/properties');
    return extractApiData(response);
  },
  create: async (payload: Record<string, unknown>): Promise<BackendProperty> => {
    const response = await api.post<BackendApiResponse<BackendProperty>>('/properties', payload);
    return extractApiData(response);
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

    const response = await api.post<
      BackendApiResponse<{
        id: string;
        propertyId: string;
        imageUrl: string;
        displayOrder: number;
        publicId: string;
        isPrimary: boolean;
        createdAt: string;
      }>
    >(`/properties/${propertyId}/images`, formData);
    return extractApiData(response);
  },
  deleteImage: async (propertyId: string, imageId: string): Promise<{ id: string; propertyId: string }> => {
    const response = await api.delete<BackendApiResponse<{ id: string; propertyId: string }>>(
      `/properties/${propertyId}/images/${imageId}`,
    );
    return extractApiData(response);
  },
  update: async (id: string, payload: Record<string, unknown>): Promise<BackendProperty> => {
    const response = await api.put<BackendApiResponse<BackendProperty>>(`/properties/${id}`, payload);
    return extractApiData(response);
  },
  activate: async (id: string): Promise<void> => {
    await api.patch<BackendApiResponse<{ id: string }>>(`/properties/${id}/activate`);
  },
  deactivate: async (id: string): Promise<void> => {
    await api.patch<BackendApiResponse<{ id: string }>>(`/properties/${id}/deactivate`);
  },
  approve: async (id: string): Promise<void> => {
    await api.patch<BackendApiResponse<{ id: string }>>(`/properties/${id}/approve`);
  },
  remove: async (id: string): Promise<void> => {
    await api.delete<BackendApiResponse<{ id: string }>>(`/properties/${id}`);
  },
};

export const alertApi = {
  list: async (): Promise<BackendAlert[]> => {
    const response = await api.get<BackendApiResponse<BackendAlert[]>>('/alerts');
    return extractApiData(response);
  },
  create: async (payload: Record<string, unknown>): Promise<BackendAlert> => {
    const response = await api.post<BackendApiResponse<BackendAlert>>('/alerts', payload);
    return extractApiData(response);
  },
  deactivate: async (id: string): Promise<void> => {
    await api.patch<BackendApiResponse<{ id: string }>>(`/alerts/${id}/deactivate`);
  },
};


export default api;
