import * as Location from 'expo-location';
import { useLocationStore } from '../../store/locationStore';

class LocationService {
  private watchSubscription: Location.LocationSubscription | null = null;

  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('[Location] Permission error:', error);
      return false;
    }
  }

  async getCurrentLocation(): Promise<{ latitude: number; longitude: number } | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        useLocationStore.getState().setError('Location permission denied');
        return null;
      }

      useLocationStore.getState().setLoading(true);
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      useLocationStore.getState().setUserLocation(coords);
      useLocationStore.getState().setLoading(false);
      
      return coords;
    } catch (error) {
      console.error('[Location] Get current location error:', error);
      useLocationStore.getState().setError('Failed to get location');
      useLocationStore.getState().setLoading(false);
      return null;
    }
  }

  async startWatching(): Promise<void> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        useLocationStore.getState().setError('Location permission denied');
        return;
      }

      this.watchSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (location) => {
          const coords = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
          useLocationStore.getState().setUserLocation(coords);
        }
      );

      console.log('[Location] Started watching location');
    } catch (error) {
      console.error('[Location] Watch error:', error);
      useLocationStore.getState().setError('Failed to watch location');
    }
  }

  stopWatching(): void {
    if (this.watchSubscription) {
      this.watchSubscription.remove();
      this.watchSubscription = null;
      console.log('[Location] Stopped watching location');
    }
  }
}

export const locationService = new LocationService();