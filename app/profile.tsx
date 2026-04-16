import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Modal, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useCartStore } from '../src/store/cartStore';
import { useAvatarCustomizationStore } from '../src/store/avatarStore';
import { Colors, Spacing, FontSizes, BorderRadius } from '../src/utils/theme';
import { Card } from '../src/presentation/components/common';
import { ToastContainer } from '../src/presentation/components/common/ToastContainer';

const AVATAR_COLORS = ['#6C5CE7', '#00CEC9', '#FDCB6E', '#E17055', '#00B894', '#FD79A8', '#A29BFE', '#74B9FF'];

export default function ProfileScreen() {
  const router = useRouter();
  const { items, totalItems, totalPrice } = useCartStore();
  const { color: avatarColor, avatarUrl, setAvatarColor, setAvatarUrl } = useAvatarCustomizationStore();
  
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [apiUrl, setApiUrl] = useState(avatarUrl);
  const [selectedColor, setSelectedColor] = useState(avatarColor);

  const handleSaveAvatar = () => {
    setAvatarColor(selectedColor);
    setAvatarUrl(apiUrl);
    setEditModalVisible(false);
  };

  const handleFetchAvatarFromApi = async () => {
    if (!apiUrl.trim()) {
      Alert.alert('Error', 'Please enter a valid API URL');
      return;
    }
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      if (data.avatarUrl) {
        setAvatarUrl(data.avatarUrl);
      } else {
        Alert.alert('Info', 'API response received but no avatar URL found. URL saved for future use.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch avatar from API. URL saved for future use.');
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const menuItems = [
    { icon: '👤', title: 'Account Settings', subtitle: 'Edit your profile', onPress: () => {} },
    { icon: '📦', title: 'Orders', subtitle: 'View order history', onPress: () => {} },
    { icon: '❤️', title: 'Wishlist', subtitle: 'Your saved items', onPress: () => {} },
    { icon: '💳', title: 'Payment Methods', subtitle: 'Manage payment options', onPress: () => {} },
    { icon: '🔔', title: 'Notifications', subtitle: 'Notification preferences', onPress: () => {} },
    { icon: '🌙', title: 'Appearance', subtitle: 'Dark mode enabled', onPress: () => {} },
    { icon: '❓', title: 'Help & Support', subtitle: 'Get help', onPress: () => {} },
    { icon: 'ℹ️', title: 'About', subtitle: 'App version 1.0.0', onPress: () => {} },
  ];

  return (
    <View style={styles.container}>
      <ToastContainer />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {avatarUrl ? (
              <Image 
                source={{ uri: avatarUrl }} 
                style={styles.avatarImage}
              />
            ) : (
              <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
                <Text style={styles.avatarText}>JD</Text>
              </View>
            )}
            <TouchableOpacity 
              style={styles.editAvatarButton}
              onPress={() => setEditModalVisible(true)}
            >
              <Text style={styles.editAvatarIcon}>✏️</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>John Doe</Text>
          <Text style={styles.userEmail}>john.doe@example.com</Text>
          <TouchableOpacity style={styles.editProfileButton}>
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalItems}</Text>
            <Text style={styles.statLabel}>Cart Items</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>${totalPrice.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Cart Total</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
        </View>

        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.menuIcon}>
                <Text style={styles.menuIconText}>{item.icon}</Text>
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Modal
          visible={editModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setEditModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Avatar</Text>
              
              <Text style={styles.modalLabel}>Avatar API URL</Text>
              <TextInput
                style={styles.apiInput}
                value={apiUrl}
                onChangeText={setApiUrl}
                placeholder="https://api.example.com/avatar"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="none"
                keyboardType="url"
              />
              
              <TouchableOpacity 
                style={styles.fetchButton}
                onPress={handleFetchAvatarFromApi}
              >
                <Text style={styles.fetchButtonText}>Fetch from API</Text>
              </TouchableOpacity>
              
              <Text style={styles.colorPickerLabel}>Avatar Color</Text>
              <View style={styles.colorPickerContainer}>
                {AVATAR_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      selectedColor === color && styles.colorOptionSelected,
                    ]}
                    onPress={() => setSelectedColor(color)}
                  />
                ))}
              </View>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setSelectedColor(avatarColor);
                    setApiUrl(avatarUrl);
                    setEditModalVisible(false);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleSaveAvatar}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <View style={styles.footer}>
          <Text style={styles.footerText}>ShopVerse v1.0.0</Text>
          <Text style={styles.footerText}>Made with ❤️</Text>
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
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: FontSizes.xxxl,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.accentSecondary,
    borderRadius: BorderRadius.full,
    padding: Spacing.sm,
  },
  editAvatarIcon: {
    fontSize: 14,
  },
  userName: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: Spacing.md,
  },
  userEmail: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  editProfileButton: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  editProfileText: {
    fontSize: FontSizes.md,
    color: Colors.accent,
    fontWeight: '600',
  },
  statsSection: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.secondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.accent,
  },
  statLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  menuSection: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIconText: {
    fontSize: 20,
  },
  menuContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  menuTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  menuSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  menuArrow: {
    fontSize: 24,
    color: Colors.textMuted,
  },
  logoutButton: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
    backgroundColor: Colors.error,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  footer: {
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  footerText: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
  },
  bottomPadding: {
    height: 100,
  },
  
  // Edit Avatar Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: Colors.secondary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
  modalTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  apiInput: {
    backgroundColor: Colors.tertiary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    color: Colors.textPrimary,
    fontSize: FontSizes.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  colorPickerLabel: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  colorPickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.lg,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: Colors.textPrimary,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.tertiary,
  },
  saveButton: {
    backgroundColor: Colors.accent,
  },
  cancelButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  saveButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  fetchButton: {
    backgroundColor: Colors.accentSecondary,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: -Spacing.md,
    marginBottom: Spacing.lg,
  },
  fetchButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
});