import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import MyPropertiesPage from './MyPropertiesPage';

const mockUseAuth = vi.fn();
const mockUseOwnerPanel = vi.fn();

vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('../../../hooks/useOwnerPanel', () => ({
  useOwnerPanel: () => mockUseOwnerPanel(),
}));

vi.mock('../../../components', () => ({
  Navbar: () => <div data-testid="navbar" />,
}));

describe('MyPropertiesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('dispara deleteImage al confirmar eliminar una imagen', async () => {
    const deletePropertyImage = vi.fn().mockResolvedValue(undefined);

    mockUseAuth.mockReturnValue({
      user: { id: 'u1', role: 'owner' },
    });

    mockUseOwnerPanel.mockReturnValue({
      profile: { role: 'owner' },
      myProperties: [
        {
          id: 'prop-1',
          cityId: 'city-1',
          title: 'Casa Centro',
          status: 'approved',
          isActive: true,
          city: { name: 'Cordoba' },
          images: [
            {
              id: 'img-1',
              imageUrl: 'https://cdn.test/img-1.jpg',
              order: 1,
              isPrimary: true,
            },
          ],
        },
      ],
      isLoading: false,
      message: null,
      loadPanel: vi.fn().mockResolvedValue(undefined),
      activateProperty: vi.fn().mockResolvedValue(undefined),
      deactivateProperty: vi.fn().mockResolvedValue(undefined),
      approveProperty: vi.fn().mockResolvedValue(undefined),
      deleteProperty: vi.fn().mockResolvedValue(undefined),
      deletePropertyImage,
    });

    render(
      <MemoryRouter>
        <MyPropertiesPage />
      </MemoryRouter>,
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /eliminar imagen/i }));

    await waitFor(() => {
      expect(deletePropertyImage).toHaveBeenCalledWith('prop-1', 'img-1');
    });
  });
});
