import { useCallback, useState } from 'react';
import api from '../services/api';
import { getApiErrorMessage } from '../services/backend';
import type { ApiResponse, CreateUserPayload, UpdateUserPayload, UserClient, UserRecord, UserRole } from '../types';

function normalizeUserPayload<T extends Partial<CreateUserPayload & UpdateUserPayload>>(payload: T): T {
  const normalized: Record<string, unknown> = { ...payload };

  if (typeof payload.email === 'string') {
    normalized.email = payload.email.trim().toLowerCase();
  }

  if (typeof payload.name === 'string') {
    normalized.name = payload.name.trim();
  }

  if (typeof payload.password === 'string') {
    const trimmedPassword = payload.password.trim();
    if (trimmedPassword) {
      normalized.password = trimmedPassword;
    } else {
      delete normalized.password;
    }
  }

  if (typeof payload.subscriptionStatus === 'string') {
    const trimmedStatus = payload.subscriptionStatus.trim();
    normalized.subscriptionStatus = trimmedStatus === '' ? null : trimmedStatus;
  }

  if (payload.planExpiresAt === '') {
    normalized.planExpiresAt = null;
  }

  return normalized as T;
}

export function useUsers() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [clients, setClients] = useState<UserClient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [usersResponse, clientResponse, rolesResponse] = await Promise.all([
        api.get<ApiResponse<UserRecord[]>>('/users'),
        api.get<ApiResponse<UserClient>>('/clients/me'),
        api.get<ApiResponse<UserRole[]>>('/roles'),
      ]);

      const safeUsers = usersResponse.data.data ?? [];
      const client = clientResponse.data.data;
      const safeRoles = rolesResponse.data.data ?? [];

      setUsers(safeUsers);
      setRoles(safeRoles);
      setClients(client ? [{ id: client.id, name: client.name }] : []);
    } catch (requestError) {
      const message = getApiErrorMessage(requestError);
      setError(message);
      setUsers([]);
      setRoles([]);
      setClients([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createUser = useCallback(async (payload: CreateUserPayload) => {
    setError(null);

    try {
      const normalizedPayload = normalizeUserPayload(payload);
      const response = await api.post<ApiResponse<UserRecord>>('/users', normalizedPayload);
      const created = response.data.data;
      setUsers((previous) => [created, ...previous]);
      return created;
    } catch (requestError) {
      const message = getApiErrorMessage(requestError);
      setError(message);
      throw new Error(message);
    }
  }, []);

  const updateUser = useCallback(async (id: string, payload: UpdateUserPayload) => {
    setError(null);

    try {
      const normalizedPayload = normalizeUserPayload(payload);
      const response = await api.put<ApiResponse<UserRecord>>(`/users/${id}`, normalizedPayload);
      const updated = response.data.data;

      setUsers((previous) =>
        previous.map((user) => {
          if (user.id !== id) {
            return user;
          }

          return { ...user, ...updated };
        }),
      );

      return updated;
    } catch (requestError) {
      const message = getApiErrorMessage(requestError);
      setError(message);
      throw new Error(message);
    }
  }, []);

  const toggleUserStatus = useCallback(
    async (user: UserRecord) => {
      if (!user.active) {
        return updateUser(user.id, { active: true });
      }

      setError(null);

      try {
        const response = await api.delete<ApiResponse<UserRecord>>(`/users/${user.id}`);
        const updated = response.data.data;

        setUsers((previous) =>
          previous.map((entry) => {
            if (entry.id !== user.id) {
              return entry;
            }

            return { ...entry, ...updated };
          }),
        );

        return updated;
      } catch (requestError) {
        const message = getApiErrorMessage(requestError);
        setError(message);
        throw new Error(message);
      }
    },
    [updateUser],
  );

  return {
    users,
    roles,
    clients,
    isLoading,
    error,
    getUsers,
    createUser,
    updateUser,
    toggleUserStatus,
  };
}
