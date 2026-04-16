export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  category: string;
  inStock: boolean;
  stockCount: number;
  rating: number;
  reviews: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  avatarColor?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface Store {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distance?: number;
  rating: number;
  products: Product[];
}

export interface Notification {
  id: string;
  type: 'price_update' | 'flash_sale' | 'stock_change' | 'promotion';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  data?: {
    productId?: string;
    oldPrice?: number;
    newPrice?: number;
    discount?: number;
  };
}

export interface AvatarState {
  position: [number, number, number];
  rotation: number;
  isMoving: boolean;
  direction: {
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
  };
}

export interface AvatarCustomization {
  color: string;
  avatarUrl: string;
}

export interface JoystickState {
  active: boolean;
  angle: number;
  force: number;
  position: {
    x: number;
    y: number;
  };
}

export interface ThreeDProduct {
  id: string;
  product: Product;
  position: [number, number, number];
  rotation: number;
  shelfId: string;
}