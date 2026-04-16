import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../../utils/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
}) => {
  const getButtonStyle = (): StyleProp<ViewStyle> => {
    const baseStyles: StyleProp<ViewStyle>[] = [buttonStyles.base, buttonStyles[size]];
    
    switch (variant) {
      case 'secondary':
        baseStyles.push(buttonStyles.secondary);
        break;
      case 'outline':
        baseStyles.push(buttonStyles.outline);
        break;
      default:
        baseStyles.push(buttonStyles.primary);
    }
    
    if (disabled) baseStyles.push(buttonStyles.disabled);
    if (fullWidth) baseStyles.push(buttonStyles.fullWidth);
    
    return baseStyles;
  };

  const getTextStyle = (): StyleProp<TextStyle> => {
    const textStyles: StyleProp<TextStyle>[] = [buttonStyles.text, buttonStyles[`${size}Text`]];
    
    if (variant === 'outline') {
      textStyles.push(buttonStyles.outlineText);
    } else if (variant === 'secondary') {
      textStyles.push(buttonStyles.secondaryText);
    }
    
    if (disabled) textStyles.push(buttonStyles.disabledText);
    
    return textStyles;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={Colors.textPrimary} size="small" />
      ) : (
        <View style={buttonStyles.content}>
          {icon && <View style={buttonStyles.icon}>{icon}</View>}
          <Text style={getTextStyle()}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const buttonStyles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  small: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    minHeight: 36,
  },
  medium: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    minHeight: 48,
  },
  large: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    minHeight: 56,
  },
  primary: {
    backgroundColor: Colors.accent,
  },
  secondary: {
    backgroundColor: Colors.tertiary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  disabled: {
    opacity: 0.5,
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: Spacing.sm,
  },
  text: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  smallText: {
    fontSize: FontSizes.sm,
  },
  mediumText: {
    fontSize: FontSizes.md,
  },
  largeText: {
    fontSize: FontSizes.lg,
  },
  outlineText: {
    color: Colors.accent,
  },
  secondaryText: {
    color: Colors.textPrimary,
  },
  disabledText: {
    color: Colors.textMuted,
  },
});