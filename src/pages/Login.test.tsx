import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Login } from './Login';

const mockUseAuth = vi.fn();
const forgotPasswordMock = vi.fn();

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('../services/api', () => ({
  authApi: {
    forgotPassword: (...args: unknown[]) => forgotPasswordMock(...args),
  },
}));

describe('Login page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    forgotPasswordMock.mockResolvedValue({ message: 'ok' });
  });

  it('calls login with normalized values', async () => {
    const loginFn = vi.fn().mockResolvedValue(undefined);
    mockUseAuth.mockReturnValue({ login: loginFn, register: vi.fn() });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/email/i), '  TEST@Example.com  ');
    await user.type(screen.getByLabelText(/contrasen/i), '  secret  ');
    await user.click(screen.getByRole('button', { name: /iniciar sesion/i }));

    await waitFor(() => {
      expect(loginFn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'secret',
      });
    });
  }, 10000);

  it('switches to register mode and sends trimmed payload with default role', async () => {
    const registerFn = vi.fn().mockResolvedValue(undefined);
    mockUseAuth.mockReturnValue({ login: vi.fn(), register: registerFn });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }));

    await user.type(screen.getByLabelText(/nombre/i), '  Gabriel  ');
    await user.type(screen.getByLabelText(/email/i), '  G@E.COM  ');
    await user.type(screen.getByLabelText(/contrasen/i), '  password123  ');
    await user.click(screen.getByRole('button', { name: /crear cuenta$/i }));

    await waitFor(() => {
      expect(registerFn).toHaveBeenCalledWith({
        name: 'Gabriel',
        email: 'g@e.com',
        password: 'password123',
        clientName: 'Gabriel',
        role: 'agent',
      });
    });
  }, 10000);

  it('displays backend error message when registration fails', async () => {
    const registerFn = vi.fn().mockRejectedValue(new Error('existing email'));
    mockUseAuth.mockReturnValue({ login: vi.fn(), register: registerFn });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }));
    await user.type(screen.getByLabelText(/nombre/i), 'Foo');
    await user.type(screen.getByLabelText(/email/i), 'foo@test.com');
    await user.type(screen.getByLabelText(/contrasen/i), '1234');
    await user.click(screen.getByRole('button', { name: /crear cuenta$/i }));

    expect(await screen.findByText(/existing email/i)).toBeInTheDocument();
  });

  it('sends forgot-password request with normalized email and shows neutral message', async () => {
    mockUseAuth.mockReturnValue({ login: vi.fn(), register: vi.fn() });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /olvide mi contrasena/i }));
    await user.type(screen.getByLabelText(/email/i), '  TEST@Example.com  ');
    await user.click(screen.getByRole('button', { name: /enviar enlace de recuperacion/i }));

    await waitFor(() => {
      expect(forgotPasswordMock).toHaveBeenCalledWith('test@example.com');
    });

    expect(await screen.findByText(/revisa tu correo si la cuenta existe/i)).toBeInTheDocument();
  });
});
