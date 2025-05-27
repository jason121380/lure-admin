
import { useState, useCallback } from 'react';

interface Notification {
  id: string;
  type: 'edit' | 'upload' | 'delete' | 'create';
  message: string;
  timestamp: Date;
  customerName?: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((
    type: Notification['type'],
    message: string,
    customerName?: string
  ) => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date(),
      customerName,
    };

    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.length;

  return {
    notifications,
    addNotification,
    clearAllNotifications,
    unreadCount,
  };
};
