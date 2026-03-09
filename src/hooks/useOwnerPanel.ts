import { useCallback, useState } from 'react';
import { alertApi, meApi, propertyApi } from '../services/api';
import type { BackendAlert, BackendMe, BackendProperty } from '../services/backend';
import { getApiErrorMessage } from '../services/backend';
import type { CreatePaymentPreferencePayload, ExpiringProperty, RenewListingPayload } from '../types';

interface PanelMessage {
  type: 'success' | 'error';
  text: string;
}

export function useOwnerPanel() {
  const [profile, setProfile] = useState<BackendMe | null>(null);
  const [myProperties, setMyProperties] = useState<BackendProperty[]>([]);
  const [expiringSoon, setExpiringSoon] = useState<ExpiringProperty[]>([]);
  const [alerts, setAlerts] = useState<BackendAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingProperty, setIsSavingProperty] = useState(false);
  const [isSavingAlert, setIsSavingAlert] = useState(false);
  const [listingActionPropertyId, setListingActionPropertyId] = useState<string | null>(null);
  const [message, setMessage] = useState<PanelMessage | null>(null);

  const loadPanel = useCallback(async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const [me, propertiesData, userAlerts] = await Promise.all([
        meApi.getMe(),
        propertyApi.getMyPropertiesExtended(),
        alertApi.list(),
      ]);

      setProfile({
        id: me.id,
        clientId: me.clientId ?? '',
        roleId: me.roleId,
        role: me.role ?? null,
        name: me.name,
        email: me.email,
        active: Boolean(me.active),
        plan: me.plan ?? 'FREE',
        planExpiresAt: me.planExpiresAt,
        subscriptionStatus: me.subscriptionStatus,
      });
      setMyProperties(propertiesData.properties);
      setExpiringSoon(propertiesData.expiringSoon.filter((item) => item.daysLeft <= 3));
      setAlerts(userAlerts);
    } catch (error) {
      setMessage({ type: 'error', text: getApiErrorMessage(error) });
      setProfile(null);
      setMyProperties([]);
      setExpiringSoon([]);
      setAlerts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createProperty = useCallback(
    async (payload: Record<string, unknown>) => {
      setIsSavingProperty(true);
      setMessage(null);

      try {
        await propertyApi.create(payload);
        await loadPanel();
        setMessage({ type: 'success', text: 'Propiedad creada correctamente.' });
      } catch (error) {
        setMessage({ type: 'error', text: getApiErrorMessage(error) });
        throw error;
      } finally {
        setIsSavingProperty(false);
      }
    },
    [loadPanel],
  );

  const updateProperty = useCallback(
    async (id: string, payload: Record<string, unknown>) => {
      setIsSavingProperty(true);
      setMessage(null);

      try {
        await propertyApi.update(id, payload);
        await loadPanel();
        setMessage({ type: 'success', text: 'Propiedad actualizada correctamente.' });
      } catch (error) {
        setMessage({ type: 'error', text: getApiErrorMessage(error) });
        throw error;
      } finally {
        setIsSavingProperty(false);
      }
    },
    [loadPanel],
  );

  const activateProperty = useCallback(
    async (id: string) => {
      setMessage(null);
      try {
        await propertyApi.activate(id);
        await loadPanel();
        setMessage({ type: 'success', text: 'Propiedad activada.' });
      } catch (error) {
        setMessage({ type: 'error', text: getApiErrorMessage(error) });
      }
    },
    [loadPanel],
  );

  const deactivateProperty = useCallback(
    async (id: string) => {
      setMessage(null);
      try {
        await propertyApi.deactivate(id);
        await loadPanel();
        setMessage({ type: 'success', text: 'Propiedad desactivada.' });
      } catch (error) {
        setMessage({ type: 'error', text: getApiErrorMessage(error) });
      }
    },
    [loadPanel],
  );

  const approveProperty = useCallback(
    async (id: string) => {
      setMessage(null);
      try {
        await propertyApi.approve(id);
        await loadPanel();
        setMessage({ type: 'success', text: 'Propiedad aprobada.' });
      } catch (error) {
        setMessage({ type: 'error', text: getApiErrorMessage(error) });
      }
    },
    [loadPanel],
  );

  const deleteProperty = useCallback(
    async (id: string) => {
      setMessage(null);
      try {
        await propertyApi.remove(id);
        await loadPanel();
        setMessage({ type: 'success', text: 'Propiedad desactivada correctamente.' });
      } catch (error) {
        setMessage({ type: 'error', text: getApiErrorMessage(error) });
      }
    },
    [loadPanel],
  );

  const deletePropertyImage = useCallback(
    async (propertyId: string, imageId: string) => {
      setMessage(null);
      try {
        await propertyApi.deleteImage(propertyId, imageId);
        await loadPanel();
        setMessage({ type: 'success', text: 'Imagen eliminada correctamente.' });
      } catch (error) {
        setMessage({ type: 'error', text: getApiErrorMessage(error) });
      }
    },
    [loadPanel],
  );

  const renewPropertyListing = useCallback(
    async (propertyId: string, payload: RenewListingPayload) => {
      setMessage(null);
      setListingActionPropertyId(propertyId);
      try {
        await propertyApi.renewProperty(propertyId, payload);
        await loadPanel();
        setMessage({ type: 'success', text: 'Publicacion renovada correctamente.' });
      } catch (error) {
        setMessage({ type: 'error', text: getApiErrorMessage(error) });
        throw error;
      } finally {
        setListingActionPropertyId(null);
      }
    },
    [loadPanel],
  );

  const createPreferenceAndRedirect = useCallback(async (payload: CreatePaymentPreferencePayload) => {
    setMessage(null);
    setListingActionPropertyId(payload.propertyId);
    try {
      const payment = await propertyApi.createPaymentPreference(payload);
      const checkoutUrl = payment.initPoint || payment.sandboxInitPoint;

      if (!checkoutUrl) {
        throw new Error('No se recibio una URL valida de Mercado Pago.');
      }

      window.location.href = checkoutUrl;
    } catch (error) {
      setMessage({ type: 'error', text: getApiErrorMessage(error) });
      throw error;
    } finally {
      setListingActionPropertyId(null);
    }
  }, []);

  const createAlert = useCallback(
    async (payload: Record<string, unknown>) => {
      setIsSavingAlert(true);
      setMessage(null);

      try {
        await alertApi.create(payload);
        await loadPanel();
        setMessage({ type: 'success', text: 'Alerta creada correctamente.' });
      } catch (error) {
        setMessage({ type: 'error', text: getApiErrorMessage(error) });
        throw error;
      } finally {
        setIsSavingAlert(false);
      }
    },
    [loadPanel],
  );

  const deactivateAlert = useCallback(
    async (id: string) => {
      setMessage(null);
      try {
        await alertApi.deactivate(id);
        await loadPanel();
        setMessage({ type: 'success', text: 'Alerta desactivada.' });
      } catch (error) {
        setMessage({ type: 'error', text: getApiErrorMessage(error) });
      }
    },
    [loadPanel],
  );

  return {
    profile,
    myProperties,
    expiringSoon,
    alerts,
    isLoading,
    isSavingProperty,
    isSavingAlert,
    listingActionPropertyId,
    message,
    loadPanel,
    createProperty,
    updateProperty,
    activateProperty,
    deactivateProperty,
    approveProperty,
    deleteProperty,
    deletePropertyImage,
    renewPropertyListing,
    createPreferenceAndRedirect,
    createAlert,
    deactivateAlert,
  };
}
