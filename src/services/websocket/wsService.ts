import { useNotificationStore } from '../../store/notificationStore';
import { useProductStore } from '../../store/productStore';

class SimulatedWebSocketService {
  private intervalId: NodeJS.Timeout | null = null;
  private isConnected = false;

  connect(): void {
    if (this.isConnected) return;
    this.isConnected = true;
    this.startSimulation();
    console.log('[WS] Connected to simulated WebSocket');
  }

  disconnect(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isConnected = false;
    console.log('[WS] Disconnected from simulated WebSocket');
  }

  private startSimulation(): void {
    const notifications = useNotificationStore.getState();
    const products = useProductStore.getState();

    const events = [
      this.generatePriceUpdate.bind(this),
      this.generateFlashSale.bind(this),
      this.generateStockChange.bind(this),
      this.generatePromotion.bind(this),
    ];

    this.intervalId = setInterval(() => {
      const randomEvent = events[Math.floor(Math.random() * events.length)];
      randomEvent();
    }, 8000);
  }

  private generatePriceUpdate(): void {
    const { products, updateProductPrice } = useProductStore.getState();
    const product = products[Math.floor(Math.random() * products.length)];
    const variation = (Math.random() - 0.5) * 20;
    const newPrice = Math.max(10, Math.round((product.price + variation) * 100) / 100);
    
    updateProductPrice(product.id, newPrice);
    useNotificationStore.getState().addNotification({
      type: 'price_update',
      title: 'Price Update',
      message: `${product.name} is now $${newPrice.toFixed(2)}`,
      data: {
        productId: product.id,
        oldPrice: product.price,
        newPrice,
      },
    });
  }

  private generateFlashSale(): void {
    const { products } = useProductStore.getState();
    const product = products[Math.floor(Math.random() * products.length)];
    const discount = Math.floor(Math.random() * 30) + 20;

    useNotificationStore.getState().addNotification({
      type: 'flash_sale',
      title: '🔥 Flash Sale!',
      message: `${discount}% off ${product.name} - Limited time!`,
      data: {
        productId: product.id,
        discount,
      },
    });
  }

  private generateStockChange(): void {
    const { products, updateProductStock } = useProductStore.getState();
    const inStockProducts = products.filter((p) => p.inStock);
    
    if (inStockProducts.length === 0) return;
    
    const product = inStockProducts[Math.floor(Math.random() * inStockProducts.length)];
    const stockChange = Math.floor(Math.random() * 10) - 5;
    const newStock = Math.max(0, product.stockCount + stockChange);

    updateProductStock(product.id, newStock);
    
    useNotificationStore.getState().addNotification({
      type: 'stock_change',
      title: 'Stock Update',
      message: `${product.name} now has ${newStock} items in stock`,
      data: {
        productId: product.id,
      },
    });
  }

  private generatePromotion(): void {
    const promotions = [
      'New collection arrived! Check it out.',
      'Free shipping on orders over $50!',
      'Double points on weekend purchases.',
      'Bonus rewards for loyal customers!',
      'Limited edition items now available.',
    ];

    const message = promotions[Math.floor(Math.random() * promotions.length)];
    
    useNotificationStore.getState().addNotification({
      type: 'promotion',
      title: 'Special Offer',
      message,
    });
  }
}

export const wsService = new SimulatedWebSocketService();