import { useCallback, useState } from 'react';
import { alertApi, meApi, propertyApi } from '../services/api';
import type { BackendAlert, BackendMe, BackendProperty } from '../services/backend';
import { getApiErrorMessage } from '../services/backend';

interface PanelMessage {
  type: 'success' | 'error';
  text: string;
}

export function useOwnerPanel() {
  const [profile, setProfile] = useState<BackendMe | null>(null);
  const [myProperties, setMyProperties] = useState<BackendProperty[]>([]);
  const [alerts, setAlerts] = useState<BackendAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingProperty, setIsSavingProperty] = useState(false);
  const [isSavingAlert, setIsSavingAlert] = useState(false);
  const [message, setMessage] = useState<PanelMessage | null>(null);

  const loadPanel = useCallback(async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const [me, properties, userAlerts] = await Promise.all([
        meApi.getMe(),
        meApi.getMyProperties(),
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
      setMyProperties(properties);
      setAlerts(userAlerts);
    } catch (error) {
      setMessage({ type: 'error', text: getApiErrorMessage(error) });
      setProfile(null);
      setMyProperties([]);
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
    alerts,
    isLoading,
    isSavingProperty,
    isSavingAlert,
    message,
    loadPanel,
    createProperty,
    updateProperty,
    activateProperty,
    deactivateProperty,
    approveProperty,
    deleteProperty,
    deletePropertyImage,
    createAlert,
    deactivateAlert,
  };
}
