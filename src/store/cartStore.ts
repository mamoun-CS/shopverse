import { create } from 'zustand';
import { CartItem, Product } from '../types';

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  totalItems: 0,
  totalPrice: 0,

  addItem: (product: Product) => {
    const items = get().items;
    const existingItem = items.find((item) => item.id === product.id);

    if (existingItem) {
      const updatedItems = items.map((item) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      set({
        items: updatedItems,
        totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: updatedItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        ),
      });
    } else {
      const newItem: CartItem = { ...product, quantity: 1 };
      const updatedItems = [...items, newItem];
      set({
        items: updatedItems,
        totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: updatedItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        ),
      });
    }
  },

  removeItem: (productId: string) => {
    const updatedItems = get().items.filter((item) => item.id !== productId);
    set({
      items: updatedItems,
      totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
      totalPrice: updatedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      ),
    });
  },

  updateQuantity: (productId: string, quantity: number) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    const updatedItems = get().items.map((item) =>
      item.id === productId ? { ...item, quantity } : item
    );
    set({
      items: updatedItems,
      totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
      totalPrice: updatedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      ),
    });
  },

  clearCart: () => {
    set({ items: [], totalItems: 0, totalPrice: 0 });
  },
}));