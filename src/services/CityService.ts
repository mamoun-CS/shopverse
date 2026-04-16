import { Shop, CityConfig, CityMetrics } from '../types/city.types';

export class CityService {
  private static instance: CityService;
  private metrics: CityMetrics = {
    totalShops: 0,
    exploredArea: 0,
    timeSpent: 0,
    interactionsCount: 0
  };
  private startTime: number = Date.now();

  static getInstance(): CityService {
    if (!CityService.instance) {
      CityService.instance = new CityService();
    }
    return CityService.instance;
  }

  generateShopColors(): { color: number; accent: number } {
    const colors = [
      { color: 0x1565C0, accent: 0x42A5F5 }, // Blue
      { color: 0xAD1457, accent: 0xF48FB1 }, // Pink
      { color: 0x4E342E, accent: 0xA1887F }, // Brown
      { color: 0x2E7D32, accent: 0x81C784 }, // Green
      { color: 0xBF360C, accent: 0xFF8A50 }, // Orange
      { color: 0x00695C, accent: 0x80CBC4 }, // Teal
      { color: 0x4527A0, accent: 0xB39DDB }, // Purple
      { color: 0x00838F, accent: 0x4DD0E1 }  // Cyan
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  generateShopIcon(category: string): string {
    const icons: Record<string, string[]> = {
      'Electronics': ['⚡', '💻', '📱', '🎮'],
      'Fashion': ['👗', '👕', '👖', '👠'],
      'Food': ['🍕', '☕', '🍔', '🍜'],
      'Books': ['📚', '📖', '📓', '📕'],
      'Health': ['💊', '🏥', '💉', '❤️'],
      default: ['🏪', '🛍️', '🎁', '✨']
    };
    const categoryIcons = icons[category] || icons.default;
    return categoryIcons[Math.floor(Math.random() * categoryIcons.length)];
  }

  calculateShopHeight(rating: number): number {
    return 40 + rating * 5;
  }

  getCityConfig(): CityConfig {
    return {
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
      maxZoom: 900
    };
  }

  updateMetrics(shopId: number, interactionType: string): void {
    this.metrics.interactionsCount++;
    this.metrics.timeSpent = (Date.now() - this.startTime) / 1000;
    
    // Track explored area based on interactions
    this.metrics.exploredArea = Math.min(100, this.metrics.exploredArea + 2);
    
    console.log(`City Metrics Updated:`, this.metrics);
  }

  getMetrics(): CityMetrics {
    return {
      ...this.metrics,
      timeSpent: (Date.now() - this.startTime) / 1000
    };
  }

  resetMetrics(): void {
    this.metrics = {
      totalShops: 0,
      exploredArea: 0,
      timeSpent: 0,
      interactionsCount: 0
    };
    this.startTime = Date.now();
  }

  setTotalShops(count: number): void {
    this.metrics.totalShops = count;
  }
}