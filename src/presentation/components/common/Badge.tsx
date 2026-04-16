import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../../utils/theme';

interface BadgeProps {
  text: string;
  variant?: 'primary' | 'success' | 'warning' | 'error';
  size?: 'small' | 'medium';
}

export const Badge: React.FC<BadgeProps> = ({
  text,
  variant = 'primary',
  size = 'small',
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'success':
        return { backgroundColor: Colors.success };
      case 'warning':
        return { backgroundColor: Colors.warning };
      case 'error':
        return { backgroundColor: Colors.error };
      default:
        return { backgroundColor: Colors.accent };
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'warning':
        return Colors.primary;
      default:
        return Colors.textPrimary;
    }
  };

  return (
    <View style={[styles.badge, getVariantStyle(), size === 'medium' && styles.mediumBadge]}>
      <Text style={[styles.text, { color: getTextColor() }]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  mediumBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  text: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
});