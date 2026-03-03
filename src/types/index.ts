export interface Publisher {
  type: 'inmobiliaria' | 'particular';
  name: string;
  phone: string | null;
}

export interface Property {
  id: string | number;
  title: string;
  subtitle?: string | null;
  operation?: 'venta' | 'alquiler' | null;
  type?: 'casa' | 'departamento' | 'lote' | 'comercial' | 'galpon-deposito' |null;
  price?: {
    amount?: number | null;
    currency?: string | null;
    raw?: string | null;
  };
  description?: string | null;
  descriptionShort?: string | null;
  location?: {
    city?: string | null;
    locality?: string | null;
  };
  specs?: {
    totalArea?: number | null;
    bedrooms?: number | null;
    bathrooms?: number | null;
    parking?: number | null;
  };
  image?: string | null;
  images?: string[];
  publisher?: Publisher;
}

export interface PropertyFilters {
  city?: string;
 operation?: 'venta' | 'alquiler' | null;
 type?: 'casa' | 'departamento' | 'lote' | 'comercial' | 'galpon-deposito' | null;
  sizeCategory?: 'small' | 'medium' | 'large';
  minArea?: number;
  maxArea?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  maxBathrooms?: number;
  minParking?: number;
  maxParking?: number;
  minPrice?: number;
  maxPrice?: number;
  currency?: string;
  locality?: string;
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  publisherType?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'agent' | 'viewer';
  phone?: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  name: string;
  clientId?: string;
  roleId?: string;
  role?: string;
  active?: boolean;
  plan?: 'FREE' | 'INMOBILIARIA' | 'BROKER';
  planExpiresAt?: string | null;
  subscriptionStatus?: string | null;
  client?: {
    id: string;
    name: string;
  };
}

export interface UserRole {
  id: string;
  name: string;
}

export interface UserClient {
  id: string;
  name: string;
}

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  roleId: string;
  clientId: string;
  active: boolean;
  created_by?: string;
  role?: UserRole | string;
  client?: UserClient;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  roleId: string;
  active?: boolean;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  roleId?: string;
  active?: boolean;
  password?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: string | null;
}
