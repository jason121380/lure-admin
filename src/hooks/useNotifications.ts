
import { useState, useCallback } from 'react';

interface Notification {
  id: string;
  type: 'edit' | 'upload' | 'delete' | 'create';
  message: string;
  timestamp: Date;
  customerName?: string;
  isRead: boolean;
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
      isRead: false,
    };

    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(notification => ({
      ...notification,
      isRead: true
    })));
  }, []);

  const unreadCount = notifications.filter(notification => !notification.isRead).length;

  return {
    notifications,
    addNotification,
    markAllAsRead,
    unreadCount,
  };
};
