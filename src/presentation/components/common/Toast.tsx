import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Notification } from '../../../types';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../../utils/theme';

const { width } = Dimensions.get('window');

interface ToastProps {
  notification: Notification;
  onDismiss: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ notification, onDismiss, duration = 4000 }) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      hideToast();
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => onDismiss());
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'flash_sale':
        return '🔥';
      case 'price_update':
        return '💰';
      case 'stock_change':
        return '📦';
      case 'promotion':
        return '🎁';
      default:
        return '📢';
    }
  };

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'flash_sale':
        return Colors.error;
      case 'price_update':
        return Colors.accent;
      case 'stock_change':
        return Colors.warning;
      default:
        return Colors.secondary;
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: getBackgroundColor() },
        { transform: [{ translateY }], opacity },
      ]}
    >
      <TouchableOpacity style={styles.content} onPress={hideToast}>
        <Text style={styles.icon}>{getIcon()}</Text>
        <Animated.View style={styles.textContainer}>
          <Text style={styles.title}>{notification.title}</Text>
          <Text style={styles.message} numberOfLines={2}>
            {notification.message}
          </Text>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: Spacing.md,
    right: Spacing.md,
    borderRadius: BorderRadius.lg,
    zIndex: 1000,
    bottom: 0,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  icon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  message: {
    fontSize: FontSizes.sm,
    color: Colors.textPrimary,
    opacity: 0.9,
  },
});