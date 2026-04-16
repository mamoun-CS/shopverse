import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Shop, 
  EnhancedShop,
  CityConfig, 
  AvatarPosition, 
  CityState,
  RealTimeUpdate,
  WebSocketConfig,
  UserPreferences,
  UserProgress,
  Achievement,
  Badge,
  ShopStatusIndicator,
  WaitTimeLevel,
  DynamicEvent,
  CityZone,
  NavigationPath,
  ShopDistance
} from '../types/city.types';

interface UseThreeCityProps {
  shops: Shop[];
  config?: Partial<CityConfig>;
  autoStart?: boolean;
  enableRealTime?: boolean;
  userId?: string;
}

interface UseThreeCityReturn {
  isLoaded: boolean;
  loadingProgress: number;
  error: string | null;
  selectedShop: Shop | null;
  avatarPosition: AvatarPosition;
  cameraPosition: { x: number; y: number; z: number };
  followMode: boolean;
  startCity: () => void;
  stopCity: () => void;
  selectShop: (shop: Shop | null) => void;
  toggleFollowMode: () => void;
  moveAvatar: (direction: { x: number; z: number }) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetCamera: () => void;
  getMetrics: () => {
    totalShops: number;
    exploredArea: number;
    timeSpent: number;
    interactionsCount: number;
  };
  // New real-time features
  realTimeUpdates: Map<number, ShopStatusIndicator>;
  connectRealTime: () => void;
  disconnectRealTime: () => void;
  // User progress
  userProgress: UserProgress;
  addExperience: (points: number) => void;
  unlockAchievement: (achievementId: string) => void;
  // Shop interactions
  toggleFavorite: (shopId: number) => void;
  markVisited: (shopId: number) => void;
  getFavoriteShops: () => Shop[];
  getVisitedShops: () => Shop[];
  // Events
  activeEvents: DynamicEvent[];
  // Navigation
  calculatePath: (toShopId: number) => NavigationPath | null;
  getNearbyShops: (maxDistance: number) => ShopDistance[];
}

const defaultConfig: CityConfig = {
  blockWidth: 60,
  blockDepth: 60,
  roadWidth: 28,
  cols: 4,
  rows: 4,
  cameraRadius: 420,
  cameraTheta: -Math.PI / 4,
  cameraPhi: Math.PI / 3.8,
  avatarSpeed: 3.5,
  minZoom: 80,
  maxZoom: 900,
};

const defaultUserProgress: UserProgress = {
  level: 1,
  experiencePoints: 0,
  achievements: [],
  badges: [],
  unlockedAreas: ['main'],
  totalVisits: 0,
  totalDistance: 0,
  favoriteCount: 0,
};

const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_visit', name: 'First Steps', description: 'Visit your first shop', icon: '👣', requirement: { type: 'visits', value: 1 }, reward: { type: 'points', value: 10 } },
  { id: 'explorer_10', name: 'City Explorer', description: 'Visit 10 different shops', icon: '🗺️', requirement: { type: 'visits', value: 10 }, reward: { type: 'points', value: 50 } },
  { id: 'foodie_5', name: 'Foodie', description: 'Visit 5 food courts', icon: '🍕', requirement: { type: 'categories', value: 5 }, reward: { type: 'badge', value: 'foodie_badge' } },
  { id: 'walker_1km', name: 'Marathon Runner', description: 'Walk 1km in the city', icon: '🏃', requirement: { type: 'distance', value: 1000 }, reward: { type: 'points', value: 100 } },
];

const CITY_ZONES: CityZone[] = [
  { id: 'main', name: 'Main Plaza', theme: 'entertainment', shops: [0, 1, 2, 3], unlockLevel: 1, isUnlocked: true, description: 'The heart of ShopVerse City' },
  { id: 'tech', name: 'Tech District', theme: 'tech', shops: [4, 5, 6, 7], unlockLevel: 1, isUnlocked: true, description: 'Latest gadgets and electronics' },
  { id: 'fashion', name: 'Fashion Avenue', theme: 'fashion', shops: [8, 9, 10, 11], unlockLevel: 2, isUnlocked: false, description: 'Premium fashion brands' },
  { id: 'food', name: 'Food Court', theme: 'food', shops: [12, 13, 14, 15], unlockLevel: 1, isUnlocked: true, description: 'Restaurants and cafes' },
];

// Helper to get wait time level
const getWaitTimeLevel = (waitTime: number): WaitTimeLevel => {
  if (waitTime < 5) return 'low';
  if (waitTime < 15) return 'medium';
  return 'high';
};

export const useThreeCity = ({
  shops,
  config = {},
  autoStart = true,
  enableRealTime = true,
  userId,
}: UseThreeCityProps): UseThreeCityReturn => {
  const [state, setState] = useState<CityState>({
    isLoaded: false,
    shops: shops,
    selectedShop: null,
    avatarPosition: { x: 0, z: 0, rotation: 0 },
    cameraPosition: { x: 0, y: 0, z: 0 },
    loadingProgress: 0,
    error: null,
  });

  const [followMode, setFollowMode] = useState(false);
  const [metrics, setMetrics] = useState({
    totalShops: shops.length,
    exploredArea: 0,
    timeSpent: 0,
    interactionsCount: 0,
  });

  // Real-time state
  const [realTimeUpdates, setRealTimeUpdates] = useState<Map<number, ShopStatusIndicator>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // User progress
  const [userProgress, setUserProgress] = useState<UserProgress>(defaultUserProgress);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    favoriteShops: [],
    visitedShops: [],
    searchHistory: [],
    preferredCategories: [],
    priceRange: [],
  });

  // Active events
  const [activeEvents, setActiveEvents] = useState<DynamicEvent[]>([]);

  const cityConfig = { ...defaultConfig, ...config };
  const startTimeRef = useRef(Date.now());
  const animationFrameRef = useRef<number>();
  const webViewRef = useRef<any>(null);

  // Calculate city dimensions
  const STEP_X = cityConfig.blockWidth + cityConfig.roadWidth;
  const STEP_Z = cityConfig.blockDepth + cityConfig.roadWidth;
  const CITY_W = cityConfig.cols * STEP_X + cityConfig.roadWidth;
  const CITY_D = cityConfig.rows * STEP_Z + cityConfig.roadWidth;
  const CENTER_X = CITY_W / 2;
  const CENTER_Z = CITY_D / 2;

  // Initialize city
  const startCity = useCallback(() => {
    setState(prev => ({ ...prev, isLoaded: true, loadingProgress: 100 }));
    startTimeRef.current = Date.now();
    
    setState(prev => ({
      ...prev,
      avatarPosition: { x: CENTER_X, z: CENTER_Z, rotation: 0 },
    }));
  }, [CENTER_X, CENTER_Z]);

  // Stop city and cleanup
  const stopCity = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
    }
    setState(prev => ({ ...prev, isLoaded: false }));
  }, []);

  // Real-time connection
  const connectRealTime = useCallback(() => {
    if (!enableRealTime) return;
    
    // Simulated real-time updates (in production, connect to actual WebSocket)
    const interval = setInterval(() => {
      // Generate random updates for shops
      const updates = new Map<number, ShopStatusIndicator>();
      shops.forEach(shop => {
        const waitTime = Math.floor(Math.random() * 30);
        const visitors = Math.floor(Math.random() * 25);
        const isOpen = Math.random() > 0.2;
        
        updates.set(shop.id, {
          status: isOpen ? 'open' : 'closed',
          waitTime,
          waitLevel: getWaitTimeLevel(waitTime),
          currentVisitors: visitors,
          lastUpdated: Date.now(),
        });
      });
      setRealTimeUpdates(updates);
    }, 5000); // Update every 5 seconds

    setIsConnected(true);

    return () => {
      clearInterval(interval);
      setIsConnected(false);
    };
  }, [enableRealTime, shops]);

  const disconnectRealTime = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    setIsConnected(false);
  }, []);

  // Select a shop
  const selectShop = useCallback((shop: Shop | null) => {
    setState(prev => ({ ...prev, selectedShop: shop }));
    if (shop) {
      setMetrics(prev => ({
        ...prev,
        interactionsCount: prev.interactionsCount + 1,
      }));
      // Mark as visited
      markVisited(shop.id);
    }
  }, []);

  // Toggle follow mode
  const toggleFollowMode = useCallback(() => {
    setFollowMode(prev => !prev);
  }, []);

  // Move avatar
  const moveAvatar = useCallback((direction: { x: number; z: number }) => {
    setState(prev => {
      const speed = cityConfig.avatarSpeed;
      let newX = prev.avatarPosition.x + direction.x * speed * 0.016;
      let newZ = prev.avatarPosition.z + direction.z * speed * 0.016;
      
      const boundary = cityConfig.roadWidth / 2 + 10;
      newX = Math.max(boundary, Math.min(CITY_W - boundary, newX));
      newZ = Math.max(boundary, Math.min(CITY_D - boundary, newZ));
      
      let newRotation = prev.avatarPosition.rotation;
      if (direction.x !== 0 || direction.z !== 0) {
        newRotation = Math.atan2(direction.x, direction.z);
        
        // Update total distance
        const distance = Math.sqrt(direction.x * direction.x + direction.z * direction.z) * speed * 0.016;
        setUserProgress(prev => ({
          ...prev,
          totalDistance: prev.totalDistance + distance,
        }));
      }
      
      const exploredArea = Math.min(100, prev.avatarPosition.x / CITY_W * 100);
      
      setMetrics(m => ({ ...m, exploredArea }));
      
      return {
        ...prev,
        avatarPosition: { x: newX, z: newZ, rotation: newRotation },
      };
    });
  }, [cityConfig.avatarSpeed, cityConfig.roadWidth, CITY_W, CITY_D]);

  // Zoom controls
  const zoomIn = useCallback(() => {
    setState(prev => ({
      ...prev,
      cameraPosition: {
        ...prev.cameraPosition,
        y: Math.max(cityConfig.minZoom, prev.cameraPosition.y - 40),
      },
    }));
  }, [cityConfig.minZoom]);

  const zoomOut = useCallback(() => {
    setState(prev => ({
      ...prev,
      cameraPosition: {
        ...prev.cameraPosition,
        y: Math.min(cityConfig.maxZoom, prev.cameraPosition.y + 40),
      },
    }));
  }, [cityConfig.maxZoom]);

  // Reset camera
  const resetCamera = useCallback(() => {
    setState(prev => ({
      ...prev,
      cameraPosition: {
        x: CENTER_X,
        y: cityConfig.cameraRadius,
        z: CENTER_Z,
      },
    }));
    setFollowMode(false);
  }, [CENTER_X, CENTER_Z, cityConfig.cameraRadius]);

  // Get metrics
  const getMetrics = useCallback(() => {
    const timeSpent = (Date.now() - startTimeRef.current) / 1000;
    return {
      ...metrics,
      timeSpent,
    };
  }, [metrics]);

  // User progress - add experience
  const addExperience = useCallback((points: number) => {
    setUserProgress(prev => {
      const newXP = prev.experiencePoints + points;
      const newLevel = Math.floor(newXP / 100) + 1;
      return {
        ...prev,
        experiencePoints: newXP,
        level: newLevel,
      };
    });
  }, []);

  // Unlock achievement
  const unlockAchievement = useCallback((achievementId: string) => {
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) return;

    setUserProgress(prev => {
      if (prev.achievements.includes(achievementId)) return prev;
      
      // Add achievement and reward
      const newAchievements = [...prev.achievements, achievementId];
      let newXP = prev.experiencePoints;
      let newBadges = [...prev.badges];
      
      if (achievement.reward.type === 'points') {
        newXP += achievement.reward.value as number;
      } else if (achievement.reward.type === 'badge') {
        newBadges.push(achievement.reward.value as string);
      }
      
      return {
        ...prev,
        achievements: newAchievements,
        experiencePoints: newXP,
        badges: newBadges,
        level: Math.floor(newXP / 100) + 1,
      };
    });
  }, []);

  // Toggle favorite
  const toggleFavorite = useCallback((shopId: number) => {
    setUserPreferences(prev => {
      const isFavorite = prev.favoriteShops.includes(shopId);
      const newFavorites = isFavorite
        ? prev.favoriteShops.filter(id => id !== shopId)
        : [...prev.favoriteShops, shopId];
      
      setUserProgress(p => ({
        ...p,
        favoriteCount: newFavorites.length,
      }));
      
      return {
        ...prev,
        favoriteShops: newFavorites,
      };
    });
  }, []);

  // Mark shop as visited
  const markVisited = useCallback((shopId: number) => {
    setUserPreferences(prev => {
      if (prev.visitedShops.includes(shopId)) return prev;
      
      const newVisited = [...prev.visitedShops, shopId];
      
      // Add experience for visiting
      setUserProgress(p => ({
        ...p,
        totalVisits: p.totalVisits + 1,
      }));
      
      // Check for achievements
      if (newVisited.length === 1) {
        unlockAchievement('first_visit');
      } else if (newVisited.length >= 10) {
        unlockAchievement('explorer_10');
      }
      
      return {
        ...prev,
        visitedShops: newVisited,
      };
    });
  }, [unlockAchievement]);

  // Get favorite shops
  const getFavoriteShops = useCallback(() => {
    return shops.filter(shop => userPreferences.favoriteShops.includes(shop.id));
  }, [shops, userPreferences.favoriteShops]);

  // Get visited shops
  const getVisitedShops = useCallback(() => {
    return shops.filter(shop => userPreferences.visitedShops.includes(shop.id));
  }, [shops, userPreferences.visitedShops]);

  // Calculate path to shop
  const calculatePath = useCallback((toShopId: number): NavigationPath | null => {
    const targetShop = shops.find(s => s.id === toShopId);
    if (!targetShop) return null;

    const currentPos = state.avatarPosition;
    const targetX = targetShop.coordinates?.x || (toShopId % 4) * 88 + 44;
    const targetZ = targetShop.coordinates?.z || Math.floor(toShopId / 4) * 88 + 44;

    // Simple path (in production, use A* pathfinding)
    const waypoints = [
      { x: currentPos.x, z: currentPos.z },
      { x: targetX, z: targetZ },
    ];

    const distance = Math.sqrt(
      Math.pow(targetX - currentPos.x, 2) + 
      Math.pow(targetZ - currentPos.z, 2)
    );

    const estimatedTime = distance / 50; // Assuming 50 units per second walk speed

    return {
      shopId: toShopId,
      waypoints,
      totalDistance: distance,
      estimatedTime,
    };
  }, [shops, state.avatarPosition]);

  // Get nearby shops
  const getNearbyShops = useCallback((maxDistance: number): ShopDistance[] => {
    const currentPos = state.avatarPosition;
    
    return shops
      .map(shop => {
        const shopX = shop.coordinates?.x || (shop.id % 4) * 88 + 44;
        const shopZ = shop.coordinates?.z || Math.floor(shop.id / 4) * 88 + 44;
        
        const distance = Math.sqrt(
          Math.pow(shopX - currentPos.x, 2) + 
          Math.pow(shopZ - currentPos.z, 2)
        );
        
        // Calculate direction
        const dx = shopX - currentPos.x;
        const dz = shopZ - currentPos.z;
        let direction = '';
        if (Math.abs(dx) > Math.abs(dz)) {
          direction = dx > 0 ? 'East' : 'West';
        } else {
          direction = dz > 0 ? 'South' : 'North';
        }
        
        return {
          shopId: shop.id,
          distance,
          direction,
          estimatedWalkTime: Math.ceil(distance / 50),
        };
      })
      .filter(s => s.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance);
  }, [shops, state.avatarPosition]);

  // Auto-start effect
  useEffect(() => {
    if (autoStart) {
      startCity();
    }
    return () => {
      stopCity();
    };
  }, [autoStart, startCity, stopCity]);

  // Connect to real-time updates
  useEffect(() => {
    if (enableRealTime && autoStart) {
      const cleanup = connectRealTime();
      return cleanup;
    }
  }, [enableRealTime, autoStart, connectRealTime]);

  // Update metrics periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        timeSpent: (Date.now() - startTimeRef.current) / 1000,
      }));
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Simulate loading progress
  useEffect(() => {
    if (!state.isLoaded && state.loadingProgress < 100) {
      const interval = setInterval(() => {
        setState(prev => ({
          ...prev,
          loadingProgress: Math.min(100, prev.loadingProgress + 10),
        }));
      }, 200);
      
      return () => clearInterval(interval);
    }
  }, [state.isLoaded, state.loadingProgress]);

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      let direction = { x: 0, z: 0 };
      
      switch (key) {
        case 'w':
        case 'arrowup':
          direction.z = -1;
          break;
        case 's':
        case 'arrowdown':
          direction.z = 1;
          break;
        case 'a':
        case 'arrowleft':
          direction.x = -1;
          break;
        case 'd':
        case 'arrowright':
          direction.x = 1;
          break;
        case 'f':
          toggleFollowMode();
          return;
        default:
          return;
      }
      
      if (direction.x !== 0 || direction.z !== 0) {
        moveAvatar(direction);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveAvatar, toggleFollowMode]);

  return {
    isLoaded: state.isLoaded,
    loadingProgress: state.loadingProgress,
    error: state.error,
    selectedShop: state.selectedShop,
    avatarPosition: state.avatarPosition,
    cameraPosition: state.cameraPosition,
    followMode,
    startCity,
    stopCity,
    selectShop,
    toggleFollowMode,
    moveAvatar,
    zoomIn,
    zoomOut,
    resetCamera,
    getMetrics,
    // Real-time
    realTimeUpdates,
    connectRealTime,
    disconnectRealTime,
    // User progress
    userProgress,
    addExperience,
    unlockAchievement,
    // Shop interactions
    toggleFavorite,
    markVisited,
    getFavoriteShops,
    getVisitedShops,
    // Events
    activeEvents,
    // Navigation
    calculatePath,
    getNearbyShops,
  };
};

// Hook for shop filtering
export const useShopFilter = (shops: Shop[]) => {
  const [filters, setFilters] = useState({
    category: 'all' as string,
    openNow: false,
    hasPromotions: false,
    minRating: 0,
    maxWaitTime: 30,
    sortBy: 'name' as 'name' | 'rating' | 'distance' | 'popularity',
  });

  const filteredShops = shops.filter(shop => {
    if (filters.category !== 'all' && shop.category !== filters.category) return false;
    if (filters.minRating > 0 && shop.rating < filters.minRating) return false;
    return true;
  });

  const sortedShops = [...filteredShops].sort((a, b) => {
    switch (filters.sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'rating':
        return b.rating - a.rating;
      case 'popularity':
        return (b as any).popularity - (a as any).popularity;
      default:
        return 0;
    }
  });

  return {
    filteredShops: sortedShops,
    setFilters,
    filters,
  };
};

// Hook for performance monitoring
export const usePerformanceMonitor = () => {
  const [fps, setFps] = useState(60);
  const [frameTime, setFrameTime] = useState(16.67);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(Date.now());

  useEffect(() => {
    let animationFrame: number;
    
    const measurePerformance = () => {
      frameCountRef.current++;
      const now = Date.now();
      const delta = now - lastTimeRef.current;
      
      if (delta >= 1000) {
        const currentFps = (frameCountRef.current * 1000) / delta;
        setFps(Math.round(currentFps));
        setFrameTime(delta / frameCountRef.current);
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }
      
      animationFrame = requestAnimationFrame(measurePerformance);
    };
    
    lastTimeRef.current = Date.now();
    animationFrame = requestAnimationFrame(measurePerformance);
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  return { fps, frameTime };
};