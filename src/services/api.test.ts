import api, { authApi, propertyApi } from './api';
import type { RegisterCredentials, LoginCredentials } from '../types';

vi.mock('./backend', () => ({
  // simulate the helper simply returning r.data.data, use a lightweight
  // interface so we don't lean on `any` and satisfy TS
  extractApiData: (r: { data: { data: unknown } }) => r.data.data,
}));

describe('authApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('normalizes login input before sending', async () => {
    const login: LoginCredentials = {
      email: '  Foo@Bar.COM ',
      password: '  secret  ',
    };
    const fakeResp = { data: { success: true, data: { token: 'x', user: {} } } };

    vi.spyOn(api, 'post').mockResolvedValue(fakeResp as unknown);
    await authApi.login(login);

    expect(api.post).toHaveBeenCalledWith('/auth/login', {
      email: 'foo@bar.com',
      password: 'secret',
    });
  });

  it('normalizes register payload and includes default agent role', async () => {
    const register: RegisterCredentials = {
      name: '  John Doe  ',
      email: ' JOHN@DOE.COM ',
      password: 'pass123',
      clientName: '  John  ',
      phone: ' 12345 ',
    };
    const fakeResp = { data: { success: true, data: { token: 'y', user: {} } } };
    vi.spyOn(api, 'post').mockResolvedValue(fakeResp as unknown);

    await authApi.register(register);

    expect(api.post).toHaveBeenCalledWith('/auth/register', {
      name: 'John Doe',
      email: 'john@doe.com',
      password: 'pass123',
      clientName: 'John',
      phone: '12345',
    });
  });

  it('normalizes email on forgot password', async () => {
    const fakeResp = { data: { success: true, data: { message: 'ok' } } };
    vi.spyOn(api, 'post').mockResolvedValue(fakeResp as unknown);

    await authApi.forgotPassword('  Foo@Bar.COM ');

    expect(api.post).toHaveBeenCalledWith('/auth/forgot-password', {
      email: 'foo@bar.com',
    });
  });

  it('trims token and new password on reset password', async () => {
    const fakeResp = { data: { success: true, data: { message: 'ok' } } };
    vi.spyOn(api, 'post').mockResolvedValue(fakeResp as unknown);

    await authApi.resetPassword('  token-value  ', '  secret123  ');

    expect(api.post).toHaveBeenCalledWith('/auth/reset-password', {
      token: 'token-value',
      newPassword: 'secret123',
    });
  });
});

describe('propertyApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('llama DELETE /properties/:id/images/:imageId para borrar imagen', async () => {
    vi.spyOn(api, 'delete').mockResolvedValue({
      data: {
        success: true,
        data: { id: 'img-1', propertyId: 'prop-1' },
        error: null,
      },
    } as unknown);

    await propertyApi.deleteImage('prop-1', 'img-1');

    expect(api.delete).toHaveBeenCalledWith('/properties/prop-1/images/img-1');
  });
});
