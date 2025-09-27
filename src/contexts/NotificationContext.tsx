'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Notification, NotificationProps } from '@/components/ui/Notification';

interface NotificationContextType {
  notifications: NotificationProps[];
  addNotification: (notification: Omit<NotificationProps, 'id'>) => void;
  removeNotification: (id: string) => void;
  showSuccess: (title: string, message: string, duration?: number) => void;
  showError: (title: string, message: string, duration?: number) => void;
  showWarning: (title: string, message: string, duration?: number) => void;
  showInfo: (title: string, message: string, duration?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);

  const addNotification = (notification: Omit<NotificationProps, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = { ...notification, id };

    // Prevenir notificaciones duplicadas con el mismo título y mensaje
    setNotifications(prev => {
      const isDuplicate = prev.some(notif =>
        notif.title === notification.title && notif.message === notification.message
      );

      if (isDuplicate) {
        return prev;
      }

      return [...prev, newNotification];
    });
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const showSuccess = (title: string, message: string, duration = 5000) => {
    addNotification({ type: 'success', title, message, duration });
  };

  const showError = (title: string, message: string, duration = 7000) => {
    addNotification({ type: 'error', title, message, duration });
  };

  const showWarning = (title: string, message: string, duration = 6000) => {
    addNotification({ type: 'warning', title, message, duration });
  };

  const showInfo = (title: string, message: string, duration = 5000) => {
    addNotification({ type: 'info', title, message, duration });
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo
      }}
    >
      {children}
      {/* Renderizar notificaciones */}
      <div className="fixed top-4 right-4 z-50">
        {notifications.map((notification, index) => (
          <div
            key={notification.id}
            className={`${index > 0 ? 'mt-2' : ''}`}
            style={{ transform: `translateY(${index * 10}px)` }}
          >
            <Notification
              {...notification}
              onClose={removeNotification}
            />
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications debe ser usado dentro de un NotificationProvider');
  }
  return context;
}
