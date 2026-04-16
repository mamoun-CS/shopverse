import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useProductStore } from '../src/store/productStore';
import { useCartStore } from '../src/store/cartStore';
import { useNotificationStore } from '../src/store/notificationStore';
import { wsService } from '../src/services/websocket/wsService';
import { Colors, Spacing, FontSizes, BorderRadius } from '../src/utils/theme';
import { Card } from '../src/presentation/components/common';
import { HorizontalProductCard } from '../src/presentation/components/products';
import { ToastContainer } from '../src/presentation/components/common/ToastContainer';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { products, featuredProducts } = useProductStore();
  const { addItem } = useCartStore();
  const notifications = useNotificationStore((state) => state.notifications);

  useEffect(() => {
    wsService.connect();
    return () => wsService.disconnect();
  }, []);

  const handleProductPress = (product: any) => {
    router.push({
      pathname: '/product-detail',
      params: { productId: product.id },
    });
  };

  const handleAddToCart = (product: any) => {
    addItem(product);
  };

  return (
    <View style={styles.container}>
      <ToastContainer />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome to</Text>
          <Text style={styles.appName}>ShopVerse</Text>
          <Text style={styles.subtitle}>Your Virtual Shopping Experience</Text>
        </View>

        

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Products</Text>
            <TouchableOpacity onPress={() => router.push('/products')}>
              <Text style={styles.seeAll}>See All →</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            horizontal
            data={featuredProducts}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            renderItem={({ item }) => (
              <HorizontalProductCard
                product={item}
                onPress={handleProductPress}
                onAddToCart={handleAddToCart}
              />
            )}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.categoriesGrid}>
            {['Electronics', 'Sports', 'Fashion', 'Home', 'Beauty'].map((category, index) => (
              <TouchableOpacity
                key={category}
                style={styles.categoryItem}
                onPress={() => router.push({ pathname: '/products', params: { category } })}
              >
                <Text style={styles.categoryEmoji}>
                  {['📱', '⚽', '👗', '🏠', '💄'][index]}
                </Text>
                <Text style={styles.categoryName}>{category}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          <View style={styles.statsRow}>
            <Card style={styles.statCard}>
              <Text style={styles.statValue}>{products.length}</Text>
              <Text style={styles.statLabel}>Products</Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={styles.statValue}>{notifications.length}</Text>
              <Text style={styles.statLabel}>Live Updates</Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={styles.statValue}>24/7</Text>
              <Text style={styles.statLabel}>Support</Text>
            </Card>
          </View>
        </View>

        <View style={styles.promoSection}>
          <Card style={styles.promoCard}>
            <Text style={styles.promoTitle}>🔥 Flash Sales</Text>
            <Text style={styles.promoText}>Get up to 50% off on selected items!</Text>
            <TouchableOpacity 
              style={styles.promoButton}
              onPress={() => router.push('/products')}
            >
              <Text style={styles.promoButtonText}>Shop Now</Text>
            </TouchableOpacity>
          </Card>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: Spacing.lg,
    paddingTop: Spacing.xxl,
  },
  greeting: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  appName: {
    fontSize: FontSizes.xxxl,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  experienceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.accent,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerEmoji: {
    fontSize: 40,
    marginRight: Spacing.md,
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  bannerSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textPrimary,
    opacity: 0.8,
    marginTop: 2,
  },
  bannerArrow: {
    fontSize: 24,
    color: Colors.textPrimary,
  },
  section: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  seeAll: {
    fontSize: FontSizes.md,
    color: Colors.accent,
    fontWeight: '600',
  },
  horizontalList: {
    paddingRight: Spacing.lg,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Spacing.md,
  },
  categoryItem: {
    width: '20%',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  categoryEmoji: {
    fontSize: 28,
    marginBottom: Spacing.xs,
  },
  categoryName: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: Spacing.xs,
    paddingVertical: Spacing.lg,
  },
  statValue: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.accent,
  },
  statLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  promoSection: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  promoCard: {
    backgroundColor: Colors.tertiary,
    padding: Spacing.lg,
  },
  promoTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  promoText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  promoButton: {
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignSelf: 'flex-start',
  },
  promoButtonText: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 100,
  },
});