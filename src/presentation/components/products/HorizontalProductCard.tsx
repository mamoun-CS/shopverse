import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Product } from '../../../types';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../../utils/theme';
import { Badge } from '../common';

const { width } = Dimensions.get('window');

interface HorizontalProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const HorizontalProductCard: React.FC<HorizontalProductCardProps> = memo(({ 
  product, 
  onPress, 
  onAddToCart 
}) => {
  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => onPress(product)}
      activeOpacity={0.8}
    >
      <Image 
        source={{ uri: product.image }} 
        style={styles.image}
        resizeMode="cover"
      />
      
      <View style={styles.content}>
        {product.discount && (
          <Badge text={`-${product.discount}%`} variant="error" />
        )}
        
        <Text style={styles.category}>{product.category}</Text>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        
        <View style={styles.priceContainer}>
          <Text style={styles.price}>${product.price.toFixed(2)}</Text>
          {product.originalPrice && (
            <Text style={styles.originalPrice}>
              ${product.originalPrice.toFixed(2)}
            </Text>
          )}
        </View>
        
        <TouchableOpacity 
          style={[styles.addButton, !product.inStock && styles.addButtonDisabled]}
          onPress={() => product.inStock && onAddToCart(product)}
          disabled={!product.inStock}
        >
          <Text style={styles.addButtonText}>
            {product.inStock ? 'Add' : 'Out'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    width: width * 0.4,
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.md,
  },
  image: {
    width: '100%',
    height: 120,
    backgroundColor: Colors.tertiary,
  },
  content: {
    padding: Spacing.sm,
  },
  category: {
    fontSize: FontSizes.xs,
    color: Colors.accent,
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  name: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  price: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  originalPrice: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
    marginLeft: Spacing.xs,
  },
  addButton: {
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: Colors.tertiary,
  },
  addButtonText: {
    color: Colors.textPrimary,
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
});