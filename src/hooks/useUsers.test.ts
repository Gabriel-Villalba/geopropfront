import { act, renderHook, waitFor } from '@testing-library/react';
import { useUsers } from './useUsers';

const mockedApi = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}));

vi.mock('../services/api', () => ({
  default: mockedApi,
}));

describe('useUsers', () => {
  beforeEach(() => {
    mockedApi.get.mockReset();
    mockedApi.post.mockReset();
    mockedApi.put.mockReset();
    mockedApi.delete.mockReset();
  });

  it('carga usuarios y cliente con getUsers', async () => {
    mockedApi.get
      .mockResolvedValueOnce({
        data: {
          success: true,
          data: [
            {
              id: 'u1',
              name: 'Admin User',
              email: 'admin@test.com',
              roleId: 'r1',
              role: 'admin',
              clientId: 'c1',
              active: true,
            },
          ],
          error: null,
        },
      })
      .mockResolvedValueOnce({
        data: {
          success: true,
          data: { id: 'c1', name: 'Client A' },
          error: null,
        },
      })
      .mockResolvedValueOnce({
        data: {
          success: true,
          data: [
            { id: 'r1', name: 'admin' },
            { id: 'r2', name: 'agent' },
          ],
          error: null,
        },
      });

    const { result } = renderHook(() => useUsers());

    await act(async () => {
      await result.current.getUsers();
    });

    await waitFor(() => {
      expect(result.current.users).toHaveLength(1);
    });

    expect(result.current.roles).toEqual([
      { id: 'r1', name: 'admin' },
      { id: 'r2', name: 'agent' },
    ]);
    expect(result.current.clients).toEqual([{ id: 'c1', name: 'Client A' }]);
    expect(result.current.error).toBeNull();
  });

  it('crea, actualiza y alterna estado de usuario', async () => {
    mockedApi.get
      .mockResolvedValueOnce({
        data: {
          success: true,
          data: [
            {
              id: 'u1',
              name: 'Viewer',
              email: 'viewer@test.com',
              roleId: 'viewer-role',
              role: 'viewer',
              clientId: 'c1',
              active: true,
            },
          ],
          error: null,
        },
      })
      .mockResolvedValueOnce({
        data: {
          success: true,
          data: { id: 'c1', name: 'Client A' },
          error: null,
        },
      })
      .mockResolvedValueOnce({
        data: {
          success: true,
          data: [
            { id: 'viewer-role', name: 'viewer' },
            { id: 'agent-role', name: 'agent' },
          ],
          error: null,
        },
      });

    mockedApi.post.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          id: 'u2',
          name: 'New User',
          email: 'new@test.com',
          roleId: 'agent-role',
          role: 'agent',
          clientId: 'c1',
          active: true,
        },
        error: null,
      },
    });

    mockedApi.put
      .mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            id: 'u1',
            name: 'Viewer Updated',
            email: 'viewer-updated@test.com',
            roleId: 'agent-role',
            role: 'agent',
            clientId: 'c1',
            active: true,
          },
          error: null,
        },
      })
      .mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            id: 'u1',
            active: false,
          },
          error: null,
        },
      });

    mockedApi.delete.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          id: 'u1',
          active: false,
        },
        error: null,
      },
    });

    const { result } = renderHook(() => useUsers());

    await act(async () => {
      await result.current.getUsers();
    });

    await act(async () => {
      await result.current.createUser({
        name: 'New User',
        email: 'new@test.com',
        password: 'password123',
        roleId: 'agent-role',
      });
    });

    expect(result.current.users[0].id).toBe('u2');

    await act(async () => {
      await result.current.updateUser('u1', {
        name: 'Viewer Updated',
        email: 'viewer-updated@test.com',
        roleId: 'agent-role',
      });
    });

    const updatedUser = result.current.users.find((entry) => entry.id === 'u1');
    expect(updatedUser?.name).toBe('Viewer Updated');

    await act(async () => {
      if (!updatedUser) {
        throw new Error('User was not updated in state');
      }
      await result.current.toggleUserStatus(updatedUser);
    });

    const toggled = result.current.users.find((entry) => entry.id === 'u1');
    expect(toggled?.active).toBe(false);
    expect(mockedApi.delete).toHaveBeenCalledWith('/users/u1');
  });

  it('setea error legible cuando la carga falla', async () => {
    mockedApi.get.mockRejectedValueOnce({
      isAxiosError: true,
      response: { data: { error: 'Invalid or expired token' } },
    });

    const { result } = renderHook(() => useUsers());

    await act(async () => {
      await result.current.getUsers();
    });

    expect(result.current.error).toBe('Tu sesion expiro. Inicia sesion nuevamente.');
    expect(result.current.users).toEqual([]);
  });
});
