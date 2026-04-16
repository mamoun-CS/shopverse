import { create } from 'zustand';
import { Product } from '../types';

interface ProductState {
  products: Product[];
  featuredProducts: Product[];
  categories: string[];
  selectedCategory: string | null;
  isLoading: boolean;
  setProducts: (products: Product[]) => void;
  setFeaturedProducts: (products: Product[]) => void;
  setCategories: (categories: string[]) => void;
  setSelectedCategory: (category: string | null) => void;
  updateProductPrice: (productId: string, newPrice: number) => void;
  updateProductStock: (productId: string, stockCount: number) => void;
  setLoading: (isLoading: boolean) => void;
}

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Wireless Headphones Pro',
    description: 'Premium wireless headphones with noise cancellation',
    price: 199.99,
    originalPrice: 249.99,
    discount: 20,
    image: 'https://picsum.photos/seed/headphones/400/400',
    category: 'Electronics',
    inStock: true,
    stockCount: 45,
    rating: 4.8,
    reviews: 234,
  },
  {
    id: '2',
    name: 'Smart Watch Ultra',
    description: 'Advanced smartwatch with health monitoring',
    price: 349.99,
    originalPrice: 399.99,
    discount: 12,
    image: 'https://picsum.photos/seed/watch/400/400',
    category: 'Electronics',
    inStock: true,
    stockCount: 28,
    rating: 4.6,
    reviews: 189,
  },
  {
    id: '3',
    name: 'Running Shoes X1',
    description: 'High-performance running shoes',
    price: 129.99,
    image: 'https://picsum.photos/seed/shoes/400/400',
    category: 'Sports',
    inStock: true,
    stockCount: 67,
    rating: 4.7,
    reviews: 312,
  },
  {
    id: '4',
    name: 'Leather Backpack',
    description: 'Genuine leather backpack for everyday use',
    price: 89.99,
    originalPrice: 119.99,
    discount: 25,
    image: 'https://picsum.photos/seed/backpack/400/400',
    category: 'Fashion',
    inStock: true,
    stockCount: 34,
    rating: 4.5,
    reviews: 156,
  },
  {
    id: '5',
    name: 'Portable Speaker',
    description: 'Waterproof portable Bluetooth speaker',
    price: 79.99,
    originalPrice: 99.99,
    discount: 20,
    image: 'https://picsum.photos/seed/speaker/400/400',
    category: 'Electronics',
    inStock: false,
    stockCount: 0,
    rating: 4.4,
    reviews: 98,
  },
  {
    id: '6',
    name: 'Yoga Mat Premium',
    description: 'Non-slip yoga mat with carrying strap',
    price: 34.99,
    image: 'https://picsum.photos/seed/yoga/400/400',
    category: 'Sports',
    inStock: true,
    stockCount: 89,
    rating: 4.3,
    reviews: 245,
  },
  {
    id: '7',
    name: 'Coffee Maker Deluxe',
    description: 'Automatic coffee maker with timer',
    price: 149.99,
    originalPrice: 179.99,
    discount: 17,
    image: 'https://picsum.photos/seed/coffee/400/400',
    category: 'Home',
    inStock: true,
    stockCount: 23,
    rating: 4.6,
    reviews: 178,
  },
  {
    id: '8',
    name: 'Wireless Earbuds',
    description: 'True wireless earbuds with charging case',
    price: 59.99,
    image: 'https://picsum.photos/seed/earbuds/400/400',
    category: 'Electronics',
    inStock: true,
    stockCount: 156,
    rating: 4.2,
    reviews: 423,
  },
];

const categories = ['All', 'Electronics', 'Sports', 'Fashion', 'Home', 'Beauty'];

export const useProductStore = create<ProductState>((set) => ({
  products: mockProducts,
  featuredProducts: mockProducts.slice(0, 4),
  categories,
  selectedCategory: null,
  isLoading: false,

  setProducts: (products) => set({ products }),
  setFeaturedProducts: (products) => set({ featuredProducts: products }),
  setCategories: (categories) => set({ categories }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  
  updateProductPrice: (productId, newPrice) => set((state) => ({
    products: state.products.map((p) =>
      p.id === productId
        ? { ...p, price: newPrice, originalPrice: p.originalPrice ?? p.price }
        : p
    ),
  })),
  
  updateProductStock: (productId, stockCount) => set((state) => ({
    products: state.products.map((p) =>
      p.id === productId
        ? { ...p, stockCount, inStock: stockCount > 0 }
        : p
    ),
  })),
  
  setLoading: (isLoading) => set({ isLoading }),
}));