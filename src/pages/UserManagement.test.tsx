import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { UserManagement } from './UserManagement';
import type { UserRecord } from '../types';

const mockUseAuth = vi.fn();
const mockUseUsers = vi.fn();

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('../hooks/useUsers', () => ({
  useUsers: () => mockUseUsers(),
}));

function baseUsersState(overrides?: Partial<ReturnType<typeof mockUseUsers>>) {
  const entry: UserRecord = {
    id: 'u1',
    name: 'Admin One',
    email: 'admin1@test.com',
    roleId: 'admin',
    clientId: 'c1',
    active: true,
    role: 'admin',
    client: { id: 'c1', name: 'Client A' },
    plan: 'FREE',
    planSource: 'client',
    planOverride: null,
    planExpiresAt: null,
    subscriptionStatus: null,
  };

  return {
    users: [entry],
    roles: [
      { id: 'admin', name: 'admin' },
      { id: 'agent', name: 'agent' },
    ],
    clients: [
      { id: 'c1', name: 'Client A' },
      { id: 'c2', name: 'Client B' },
    ],
    isLoading: false,
    error: null,
    getUsers: vi.fn().mockResolvedValue(undefined),
    createUser: vi.fn().mockResolvedValue(undefined),
    updateUser: vi.fn().mockResolvedValue(undefined),
    toggleUserStatus: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('UserManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirige a dashboard si no es admin', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: '2', name: 'Viewer', email: 'viewer@test.com', role: 'viewer' },
      isLoading: false,
    });
    mockUseUsers.mockReturnValue(baseUsersState());

    render(
      <MemoryRouter initialEntries={['/users']}>
        <Routes>
          <Route path="/users" element={<UserManagement />} />
          <Route path="/dashboard" element={<div>Dashboard Page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText('Dashboard Page')).toBeInTheDocument();
  });

  it('crea usuario desde modal', async () => {
    const usersState = baseUsersState();
    mockUseAuth.mockReturnValue({
      user: { id: '1', name: 'Admin', email: 'admin@test.com', role: 'admin' },
      isLoading: false,
    });
    mockUseUsers.mockReturnValue(usersState);

    render(
      <MemoryRouter>
        <UserManagement />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(usersState.getUsers).toHaveBeenCalledTimes(1);
    });

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /^Crear Usuario$/ }));

    await user.type(screen.getByLabelText(/nombre/i), 'New Agent');
    await user.type(screen.getByLabelText(/email/i), 'newagent@test.com');
    await user.type(screen.getByLabelText(/contrasena/i), 'password123');
    await user.selectOptions(screen.getByLabelText(/^rol$/i), 'agent');
    await user.click(screen.getByRole('button', { name: /^Crear usuario$/ }));

    await waitFor(() => {
      expect(usersState.createUser).toHaveBeenCalledWith({
        name: 'New Agent',
        email: 'newagent@test.com',
        password: 'password123',
        roleId: 'agent',
        active: true,
        plan: null,
        planExpiresAt: null,
        subscriptionStatus: null,
      });
    });
  }, 15000);

  it('edita usuario sin cambiar password', async () => {
    const usersState = baseUsersState();
    mockUseAuth.mockReturnValue({
      user: { id: '1', name: 'Admin', email: 'admin@test.com', role: 'admin' },
      isLoading: false,
    });
    mockUseUsers.mockReturnValue(usersState);

    render(
      <MemoryRouter>
        <UserManagement />
      </MemoryRouter>,
    );

    const user = userEvent.setup();
    await user.click(screen.getAllByRole('button', { name: /editar/i })[0]);

    expect(screen.getByLabelText(/contrasena/i)).toBeInTheDocument();

    const nameInput = screen.getByLabelText(/nombre/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Admin Updated');
    await user.selectOptions(screen.getByLabelText(/^rol$/i), 'agent');
    await user.click(screen.getByRole('button', { name: /guardar cambios/i }));

    await waitFor(() => {
      expect(usersState.updateUser).toHaveBeenCalledWith('u1', {
        name: 'Admin Updated',
        email: 'admin1@test.com',
        roleId: 'agent',
        active: true,
        plan: null,
        planExpiresAt: null,
        subscriptionStatus: null,
      });
    });
  }, 15000);

  it('confirma antes de desactivar usuario', async () => {
    const usersState = baseUsersState();
    mockUseAuth.mockReturnValue({
      user: { id: '1', name: 'Admin', email: 'admin@test.com', role: 'admin' },
      isLoading: false,
    });
    mockUseUsers.mockReturnValue(usersState);

    render(
      <MemoryRouter>
        <UserManagement />
      </MemoryRouter>,
    );

    const user = userEvent.setup();
    await user.click(screen.getAllByRole('button', { name: /desactivar/i })[0]);

    expect(screen.getByText(/desactivar usuario/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /confirmar/i }));

    await waitFor(() => {
      expect(usersState.toggleUserStatus).toHaveBeenCalledWith(expect.objectContaining({ id: 'u1' }));
    });
  });
});
