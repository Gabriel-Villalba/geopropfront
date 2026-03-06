import { act, renderHook, waitFor } from '@testing-library/react';
import { useOwnerPanel } from './useOwnerPanel';

const mockedApi = vi.hoisted(() => ({
  meApi: {
    getMe: vi.fn(),
    getMyProperties: vi.fn(),
  },
  alertApi: {
    list: vi.fn(),
    create: vi.fn(),
    deactivate: vi.fn(),
  },
  propertyApi: {
    create: vi.fn(),
    update: vi.fn(),
    activate: vi.fn(),
    deactivate: vi.fn(),
    approve: vi.fn(),
    remove: vi.fn(),
    deleteImage: vi.fn(),
  },
}));

vi.mock('../services/api', () => ({
  meApi: mockedApi.meApi,
  alertApi: mockedApi.alertApi,
  propertyApi: mockedApi.propertyApi,
}));

describe('useOwnerPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedApi.meApi.getMe.mockResolvedValue({
      id: 'u1',
      clientId: 'c1',
      roleId: 'r1',
      role: 'owner',
      name: 'Owner',
      email: 'owner@test.com',
      active: true,
      plan: 'FREE',
      planExpiresAt: null,
      subscriptionStatus: null,
    });
    mockedApi.meApi.getMyProperties.mockResolvedValue([
      {
        id: 'prop-1',
        clientId: 'c1',
        cityId: 'city-1',
        title: 'Casa Centro',
        description: null,
        operation: 'sale',
        propertyType: 'house',
        price: 100000,
        currency: 'USD',
        bedrooms: 2,
        bathrooms: 1,
        area: 80,
        parking: 1,
        address: 'Calle 123',
        ownerType: 'particular',
        contactName: 'Owner',
        contactPhone: null,
        isActive: true,
        isFeatured: false,
        source: 'internal',
        status: 'approved',
        createdBy: 'u1',
        publishedAt: null,
        deactivatedAt: null,
        city: { id: 'city-1', name: 'Cordoba' },
        images: [
          {
            id: 'img-1',
            imageUrl: 'https://cdn.test/image-1.jpg',
            order: 1,
            isPrimary: true,
          },
        ],
      },
    ]);
    mockedApi.alertApi.list.mockResolvedValue([]);
  });

  it('elimina imagen de propiedad y recarga el panel', async () => {
    mockedApi.propertyApi.deleteImage.mockResolvedValue({ id: 'img-1', propertyId: 'prop-1' });

    const { result } = renderHook(() => useOwnerPanel());

    await act(async () => {
      await result.current.loadPanel();
    });

    await act(async () => {
      await result.current.deletePropertyImage('prop-1', 'img-1');
    });

    expect(mockedApi.propertyApi.deleteImage).toHaveBeenCalledWith('prop-1', 'img-1');
    expect(mockedApi.meApi.getMyProperties).toHaveBeenCalledTimes(2);

    await waitFor(() => {
      expect(result.current.message).toEqual({
        type: 'success',
        text: 'Imagen eliminada correctamente.',
      });
    });
  });
});
