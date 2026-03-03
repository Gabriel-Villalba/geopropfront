import { useCallback, useState } from 'react';
import axios from 'axios';
import api from '../services/api';
import type { ApiResponse, CreateUserPayload, UpdateUserPayload, UserClient, UserRecord, UserRole } from '../types';

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ error?: string }>(error)) {
    return error.response?.data?.error ?? 'No se pudo completar la operacion.';
  }

  return 'No se pudo completar la operacion.';
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
      const message = getErrorMessage(requestError);
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
      const response = await api.post<ApiResponse<UserRecord>>('/users', payload);
      const created = response.data.data;
      setUsers((previous) => [created, ...previous]);
      return created;
    } catch (requestError) {
      const message = getErrorMessage(requestError);
      setError(message);
      throw new Error(message);
    }
  }, []);

  const updateUser = useCallback(async (id: string, payload: UpdateUserPayload) => {
    setError(null);

    try {
      const response = await api.put<ApiResponse<UserRecord>>(`/users/${id}`, payload);
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
      const message = getErrorMessage(requestError);
      setError(message);
      throw new Error(message);
    }
  }, []);

  const toggleUserStatus = useCallback(
    async (user: UserRecord) => {
      return updateUser(user.id, { active: !user.active });
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
