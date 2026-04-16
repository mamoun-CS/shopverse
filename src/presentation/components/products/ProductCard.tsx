import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Product } from '../../../types';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '../../../utils/theme';
import { Badge } from '../common';

interface ProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = memo(({ product, onPress, onAddToCart }) => {
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(product.rating);
    
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Text key={i} style={styles.star}>
          {i < fullStars ? '★' : '☆'}
        </Text>
      );
    }
    return stars;
  };

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => onPress(product)}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: product.image }} 
          style={styles.image}
          resizeMode="cover"
        />
        {!product.inStock && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}
        {product.discount && (
          <Badge text={`-${product.discount}%`} variant="error" />
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.category}>{product.category}</Text>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        
        <View style={styles.ratingContainer}>
          <View style={styles.stars}>{renderStars()}</View>
          <Text style={styles.reviews}>({product.reviews})</Text>
        </View>
        
        <View style={styles.priceContainer}>
          <Text style={styles.price}>${product.price.toFixed(2)}</Text>
          {product.originalPrice && (
            <Text style={styles.originalPrice}>
              ${product.originalPrice.toFixed(2)}
            </Text>
          )}
        </View>
        
        <View style={styles.stockContainer}>
          <View style={[styles.stockIndicator, { 
            backgroundColor: product.inStock ? Colors.success : Colors.error 
          }]} />
          <Text style={styles.stockText}>
            {product.inStock ? `${product.stockCount} in stock` : 'Out of stock'}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.addButton, !product.inStock && styles.addButtonDisabled]}
          onPress={() => product.inStock && onAddToCart(product)}
          disabled={!product.inStock}
        >
          <Text style={styles.addButtonText}>
            {product.inStock ? 'Add to Cart' : 'Unavailable'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    ...Shadows.medium,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    backgroundColor: Colors.tertiary,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  outOfStockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockText: {
    color: Colors.textPrimary,
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
  content: {
    padding: Spacing.md,
  },
  category: {
    fontSize: FontSizes.xs,
    color: Colors.accent,
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  name: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  stars: {
    flexDirection: 'row',
    marginRight: Spacing.xs,
  },
  star: {
    color: Colors.warning,
    fontSize: FontSizes.sm,
  },
  reviews: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  price: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  originalPrice: {
    fontSize: FontSizes.md,
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
    marginLeft: Spacing.sm,
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  stockIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.xs,
  },
  stockText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  addButton: {
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: Colors.tertiary,
  },
  addButtonText: {
    color: Colors.textPrimary,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
});