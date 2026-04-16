import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useNotificationStore } from '../../../store/notificationStore';
import { Toast } from './Toast';
import { Colors, Spacing } from '../../../utils/theme';

const { width } = Dimensions.get('window');

export const ToastContainer: React.FC = () => {
  const notifications = useNotificationStore((state) => state.notifications);
  const [visibleToasts, setVisibleToasts] = useState<string[]>([]);

  useEffect(() => {
    if (notifications.length > 0 && visibleToasts.length === 0) {
      const latestNotification = notifications[0];
      if (!visibleToasts.includes(latestNotification.id)) {
        setVisibleToasts([latestNotification.id]);
      }
    }
  }, [notifications]);

  const handleDismiss = useCallback((id: string) => {
    setVisibleToasts((prev) => prev.filter((toastId) => toastId !== id));
  }, []);

  if (visibleToasts.length === 0) return null;

  return (
    <View style={styles.container} pointerEvents="box-none">
      {visibleToasts.map((toastId) => {
        const notification = notifications.find((n) => n.id === toastId);
        if (!notification) return null;
        
        return (
          <Toast
            key={toastId}
            notification={notification}
            onDismiss={() => handleDismiss(toastId)}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
});