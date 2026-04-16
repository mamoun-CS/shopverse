import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert, Platform } from 'react-native';
import { useLocationStore } from '../src/store/locationStore';
import { locationService } from '../src/services/location/locationService';
import { Colors, Spacing, FontSizes, BorderRadius } from '../src/utils/theme';
import { Card } from '../src/presentation/components/common';
import { ToastContainer } from '../src/presentation/components/common/ToastContainer';

const { height } = Dimensions.get('window');

const INITIAL_REGION = {
  latitude: 37.7749,
  longitude: -122.4194,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const mapDarkStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1a1a1e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#666666' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a1e' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#333333' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0d0d0f' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#252529' }] },
];

export default function MapScreen() {
  if (Platform.OS !== 'web') {
    return <NativeMapView />;
  }
  return <WebMapView />;
}

function NativeMapView() {
  const MapView = require('react-native-maps').default;
  const Marker = require('react-native-maps').Marker;
  const PROVIDER_GOOGLE = require('react-native-maps').PROVIDER_GOOGLE;
  
  const mapRef = useRef<any>(null);
  const { userLocation, stores, selectedStore, setSelectedStore } = useLocationStore();

  useEffect(() => {
    const init = async () => {
      const hasPermission = await locationService.requestPermissions();
      if (hasPermission) {
        await locationService.getCurrentLocation();
        await locationService.startWatching();
      }
    };
    init();
    return () => { locationService.stopWatching(); };
  }, []);

  const handleMarkerPress = (store: typeof stores[number]) => {
    setSelectedStore(store);
    mapRef.current?.animateToRegion(
      { latitude: store.latitude, longitude: store.longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 },
      500
    );
  };

  const sortedStores = [...stores].sort((a, b) => (a.distance || 0) - (b.distance || 0));

  return (
    <View style={styles.container}>
      <ToastContainer />
      <View style={styles.header}>
        <Text style={styles.title}>Nearby Stores</Text>
        <Text style={styles.subtitle}>{sortedStores.length} stores found</Text>
      </View>
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={INITIAL_REGION}
          showsUserLocation
          showsMyLocationButton={false}
          customMapStyle={mapDarkStyle}
        >
          {stores.map((store) => (
            <Marker
              key={store.id}
              coordinate={{ latitude: store.latitude, longitude: store.longitude }}
              onPress={() => handleMarkerPress(store)}
            >
              <View style={styles.markerContainer}><Text style={styles.markerText}>📍</Text></View>
            </Marker>
          ))}
        </MapView>
        <TouchableOpacity style={styles.locationButton} onPress={async () => {
          if (userLocation) {
            mapRef.current?.animateToRegion({ ...userLocation, latitudeDelta: 0.05, longitudeDelta: 0.05 }, 500);
          } else {
            await locationService.getCurrentLocation();
          }
        }}>
          <Text style={styles.locationIcon}>🎯</Text>
        </TouchableOpacity>
      </View>
      {selectedStore && (
        <View style={styles.storeInfo}>
          <Card style={styles.storeCard}>
            <View style={styles.storeHeader}>
              <Text style={styles.storeName}>{selectedStore.name}</Text>
              <TouchableOpacity onPress={() => setSelectedStore(null)}><Text style={styles.closeButton}>✕</Text></TouchableOpacity>
            </View>
            <Text style={styles.storeAddress}>{selectedStore.address}</Text>
            <TouchableOpacity style={styles.navigateButton} onPress={() => Alert.alert('Navigation', `Navigating to ${selectedStore.name}`)}>
              <Text style={styles.navigateButtonText}>Get Directions</Text>
            </TouchableOpacity>
          </Card>
        </View>
      )}
      <View style={styles.storesList}>
        <Text style={styles.listTitle}>All Stores</Text>
        {sortedStores.slice(0, 3).map((store) => (
          <TouchableOpacity key={store.id} style={[styles.storeListItem, selectedStore?.id === store.id && styles.storeListItemActive]} onPress={() => handleMarkerPress(store)}>
            <View style={styles.storeListIcon}><Text style={styles.storeListEmoji}>🏪</Text></View>
            <View style={styles.storeListInfo}>
              <Text style={styles.storeListName}>{store.name}</Text>
              <Text style={styles.storeListAddress}>{store.address}</Text>
            </View>
            <Text style={styles.storeListDistance}>{store.distance ? `${store.distance.toFixed(1)} km` : '-'}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function WebMapView() {
  const { stores, selectedStore, setSelectedStore } = useLocationStore();
  
  return (
    <View style={styles.container}>
      <ToastContainer />
      <View style={styles.header}>
        <Text style={styles.title}>Nearby Stores</Text>
        <Text style={styles.subtitle}>{stores.length} stores found</Text>
      </View>
      <View style={styles.webMapFallback}>
        <Text style={styles.webMapText}>🗺️ Map View</Text>
        <Text style={styles.webMapSubtext}>Map is available on mobile devices</Text>
      </View>
      <View style={styles.storesList}>
        <Text style={styles.listTitle}>All Stores</Text>
        {stores.slice(0, 5).map((store) => (
          <TouchableOpacity key={store.id} style={styles.storeListItem} onPress={() => setSelectedStore(store)}>
            <View style={styles.storeListIcon}><Text style={styles.storeListEmoji}>🏪</Text></View>
            <View style={styles.storeListInfo}>
              <Text style={styles.storeListName}>{store.name}</Text>
              <Text style={styles.storeListAddress}>{store.address}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xxl, paddingBottom: Spacing.md },
  title: { fontSize: FontSizes.xxxl, fontWeight: '800', color: Colors.textPrimary },
  subtitle: { fontSize: FontSizes.md, color: Colors.textSecondary, marginTop: Spacing.xs },
  mapContainer: { height: height * 0.4, marginHorizontal: Spacing.lg, borderRadius: BorderRadius.lg, overflow: 'hidden' },
  map: { flex: 1 },
  markerContainer: { backgroundColor: Colors.accent, borderRadius: BorderRadius.full, padding: Spacing.sm, borderWidth: 2, borderColor: Colors.textPrimary },
  markerText: { fontSize: 16 },
  locationButton: { position: 'absolute', right: Spacing.md, bottom: Spacing.md, backgroundColor: Colors.accent, borderRadius: BorderRadius.full, padding: Spacing.md, zIndex: 10 },
  locationIcon: { fontSize: 20 },
  webMapFallback: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.secondary, marginHorizontal: Spacing.lg, borderRadius: BorderRadius.lg, marginBottom: Spacing.lg },
  webMapText: { fontSize: FontSizes.xxl, fontWeight: '700', color: Colors.textPrimary },
  webMapSubtext: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: Spacing.sm },
  storeInfo: { position: 'absolute', top: 140, left: Spacing.lg, right: Spacing.lg },
  storeCard: { backgroundColor: Colors.secondary },
  storeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  storeName: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.textPrimary },
  closeButton: { fontSize: FontSizes.lg, color: Colors.textSecondary, padding: Spacing.xs },
  storeAddress: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: Spacing.xs },
  navigateButton: { backgroundColor: Colors.accent, paddingVertical: Spacing.sm, borderRadius: BorderRadius.md, alignItems: 'center', marginTop: Spacing.md },
  navigateButtonText: { color: Colors.textPrimary, fontSize: FontSizes.md, fontWeight: '600' },
  storesList: { flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },
  listTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.md },
  storeListItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.secondary, borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  storeListItemActive: { borderColor: Colors.accent },
  storeListIcon: { width: 40, height: 40, borderRadius: BorderRadius.md, backgroundColor: Colors.tertiary, justifyContent: 'center', alignItems: 'center' },
  storeListEmoji: { fontSize: 20 },
  storeListInfo: { flex: 1, marginLeft: Spacing.md },
  storeListName: { fontSize: FontSizes.md, fontWeight: '600', color: Colors.textPrimary },
  storeListAddress: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 2 },
  storeListDistance: { fontSize: FontSizes.sm, color: Colors.accent, fontWeight: '600' },
});
