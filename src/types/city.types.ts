export interface Shop {
  id: number;
  name: string;
  type: string;
  category: string;
  color: number;
  accent: number;
  height: number;
  icon: string;
  rating: number;
  price: string;
  description: string;
  address?: string;
  position?: { x: number; z: number };
  coordinates?: {
    x: number;
    z: number;
    col: number;
    row: number;
  };
}

export interface BusinessHours {
  open: string;
  close: string;
  daysOpen: number[];
  is24Hours: boolean;
}

export interface ShopCoordinates {
  x: number;
  z: number;
  floor: number;
  section: string;
}

export interface Promotion {
  id: string;
  title: string;
  discount: number;
  validUntil: string;
  terms: string;
}

export interface Review {
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface SocialMediaLinks {
  instagram?: string;
  facebook?: string;
  twitter?: string;
}

export interface ContactInfo {
  phone: string;
  email: string;
  website: string;
}

export interface EnhancedShop extends Shop {
  businessHours: BusinessHours;
  coordinates: ShopCoordinates;
  promotions: Promotion[];
  visitedCount: number;
  isFavorite: boolean;
  lastVisited: string | null;
  userRating: number | null;
  reviews: Review[];
  images: string[];
  videoTour: string | null;
  virtualTour: string | null;
  currentVisitors: number;
  waitTime: number;
  popularity: number;
  isOpen: boolean;
  loyaltyPoints: number;
  hasSpecialOffer: boolean;
  membershipRequired: boolean;
  socialMediaLinks: SocialMediaLinks;
  contactInfo: ContactInfo;
}

export interface AvatarPosition {
  x: number;
  z: number;
  rotation: number;
  velocity?: {
    x: number;
    z: number;
  };
}

export interface CityConfig {
  blockWidth: number;
  blockDepth: number;
  roadWidth: number;
  cols: number;
  rows: number;
  cameraRadius: number;
  cameraTheta: number;
  cameraPhi: number;
  avatarSpeed: number;
  minZoom: number;
  maxZoom: number;
}

export interface WebViewMessage {
  type: 'shop_selected' | 'city_loaded' | 'avatar_moved' | 'error' | 'camera_moved';
  shop?: Shop | EnhancedShop;
  error?: string;
  position?: AvatarPosition;
  timestamp?: number;
}

export interface CityState {
  isLoaded: boolean;
  shops: Shop[];
  selectedShop: Shop | null;
  avatarPosition: AvatarPosition;
  cameraPosition: {
    x: number;
    y: number;
    z: number;
  };
  loadingProgress: number;
  error: string | null;
}

export interface ShopInteraction {
  type: 'hover' | 'click' | 'visit';
  shop: Shop;
  timestamp: number;
}

export interface CityMetrics {
  totalShops: number;
  exploredArea: number;
  timeSpent: number;
  interactionsCount: number;
}

export interface FilterOptions {
  category?: string;
  isOpen?: boolean;
  hasPromotions?: boolean;
  minRating?: number;
  maxWaitTime?: number;
}

export interface ShopFilter {
  categories: string[];
  sortBy: 'name' | 'rating' | 'distance' | 'popularity';
  sortOrder: 'asc' | 'desc';
  filters: FilterOptions;
}

// Real-time data types
export interface RealTimeUpdate {
  type: 'visitor_count' | 'wait_time' | 'promotion' | 'rating' | 'status';
  shopId: number;
  data: {
    currentVisitors?: number;
    waitTime?: number;
    isOpen?: boolean;
    promotions?: Promotion[];
    rating?: number;
  };
  timestamp: number;
}

export interface WebSocketConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
}

// User personalization types
export interface UserPreferences {
  favoriteShops: number[];
  visitedShops: number[];
  searchHistory: string[];
  preferredCategories: string[];
  priceRange: string[];
  dietaryRestrictions?: string[];
  accessibilityNeeds?: string[];
}

export interface UserProgress {
  level: number;
  experiencePoints: number;
  achievements: string[];
  badges: string[];
  unlockedAreas: string[];
  totalVisits: number;
  totalDistance: number;
  favoriteCount: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: {
    type: 'visits' | 'distance' | 'favorites' | 'categories' | 'special';
    value: number;
  };
  reward: {
    type: 'points' | 'badge' | 'unlock';
    value: number | string;
  };
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt?: string;
}

// Dynamic city zones
export interface CityZone {
  id: string;
  name: string;
  theme: 'luxury' | 'food' | 'tech' | 'entertainment' | 'fashion' | 'sports';
  shops: number[];
  unlockLevel: number;
  isUnlocked: boolean;
  description: string;
}

export interface DynamicEvent {
  id: string;
  name: string;
  type: 'sale' | 'festival' | 'competition' | 'special' | 'flash_sale';
  affectedShops: number[];
  timeRange: {
    start: string;
    end: string;
  };
  visualEffect: 'confetti' | 'glow' | 'particles' | 'banner' | 'none';
  discountMultiplier: number;
  description: string;
  isActive: boolean;
}

// Shop status indicators
export type WaitTimeLevel = 'low' | 'medium' | 'high';
export type ShopStatus = 'open' | 'closed' | 'busy' | 'closing_soon';

export interface ShopStatusIndicator {
  status: ShopStatus;
  waitTime: number;
  waitLevel: WaitTimeLevel;
  currentVisitors: number;
  lastUpdated: number;
}

// Navigation types
export interface NavigationPath {
  shopId: number;
  waypoints: Array<{ x: number; z: number }>;
  totalDistance: number;
  estimatedTime: number;
}

export interface ShopDistance {
  shopId: number;
  distance: number;
  direction: string;
  estimatedWalkTime: number;
}

// UI State types
export interface LoadingState {
  isLoading: boolean;
  progress: number;
  message: string;
}

export interface ErrorState {
  hasError: boolean;
  errorMessage: string;
  retryAction?: () => void;
}

// Filter & Sort types
export type SortOption = 'name' | 'rating' | 'distance' | 'popularity' | 'wait_time';
export type CategoryFilter = 'all' | 'Electronics' | 'Fashion' | 'Food' | 'Lifestyle' | 'Entertainment';

export interface AdvancedFilters {
  categories: CategoryFilter[];
  priceRange: string[];
  rating: number;
  openNow: boolean;
  hasPromotions: boolean;
  maxWaitTime: number;
}