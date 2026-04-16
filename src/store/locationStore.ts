import { create } from 'zustand';
import { Store } from '../types';

interface LocationState {
  userLocation: {
    latitude: number;
    longitude: number;
  } | null;
  stores: Store[];
  selectedStore: Store | null;
  isLoading: boolean;
  error: string | null;
  setUserLocation: (location: { latitude: number; longitude: number }) => void;
  setStores: (stores: Store[]) => void;
  setSelectedStore: (store: Store | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  calculateDistances: () => void;
}

const mockStores: Store[] = [
  {
    id: 'store1',
    name: 'ShopVerse Downtown',
    address: '123 Main Street, Downtown',
    latitude: 37.7749,
    longitude: -122.4194,
    rating: 4.8,
    products: [],
  },
  {
    id: 'store2',
    name: 'ShopVerse Mall',
    address: '456 Shopping Center, West Side',
    latitude: 37.7849,
    longitude: -122.4094,
    rating: 4.5,
    products: [],
  },
  {
    id: 'store3',
    name: 'ShopVerse Plaza',
    address: '789 Plaza Road, North District',
    latitude: 37.7649,
    longitude: -122.4294,
    rating: 4.6,
    products: [],
  },
  {
    id: 'store4',
    name: 'ShopVerse Harbor',
    address: '321 Harbor View, Waterfront',
    latitude: 37.7949,
    longitude: -122.3994,
    rating: 4.7,
    products: [],
  },
];

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const useLocationStore = create<LocationState>((set, get) => ({
  userLocation: null,
  stores: mockStores,
  selectedStore: null,
  isLoading: false,
  error: null,

  setUserLocation: (location) => {
    set({ userLocation: location });
    get().calculateDistances();
  },

  setStores: (stores) => set({ stores }),
  setSelectedStore: (store) => set({ selectedStore: store }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  calculateDistances: () => {
    const { userLocation, stores } = get();
    if (!userLocation) return;

    const storesWithDistance = stores.map((store) => ({
      ...store,
      distance: calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        store.latitude,
        store.longitude
      ),
    }));

    set({ stores: storesWithDistance });
  },
}));