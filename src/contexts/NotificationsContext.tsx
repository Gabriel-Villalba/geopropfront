import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { notificationApi } from '../services/api';
import { useAuth } from './AuthContext';

interface NotificationsContextValue {
  unreadCount: number | null;
  refreshUnread: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

const POLL_MS = 30000;

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number | null>(null);

  const refreshUnread = useCallback(async () => {
    try {
      const count = await notificationApi.getUnreadCount();
      setUnreadCount(count);
    } catch {
      setUnreadCount(null);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(null);
      return;
    }

    let mounted = true;
    const safeRefresh = async () => {
      try {
        const count = await notificationApi.getUnreadCount();
        if (mounted) setUnreadCount(count);
      } catch {
        if (mounted) setUnreadCount(null);
      }
    };

    void safeRefresh();
    const timer = setInterval(safeRefresh, POLL_MS);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [isAuthenticated]);

  const value = useMemo(
    () => ({
      unreadCount,
      refreshUnread,
    }),
    [refreshUnread, unreadCount],
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}
