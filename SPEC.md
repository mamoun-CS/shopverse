# ShopVerse - 3D Shopping Experience Mobile App

## 1. Project Overview

**Project Name:** ShopVerse  
**Project Type:** React Native Mobile Application (Expo)  
**Core Functionality:** A modern e-commerce mobile app with an immersive 3D shopping room where users control an animated avatar to browse products in a virtual environment.

## 2. Technology Stack & Choices

| Category | Choice |
|----------|--------|
| Framework | Expo SDK 52 with React Native |
| Language | TypeScript (strict mode) |
| 3D Engine | React Three Fiber + Drei |
| Navigation | Expo Router (file-based routing) |
| State Management | Zustand |
| Maps | Mapbox GL (expo-map) |
| Real-time | Custom WebSocket simulation |
| UI Components | Custom + React Native Paper |
| Icons | @expo/vector-icons |

### Architecture Pattern
Clean Architecture with 3-layer separation:
- **Presentation Layer**: Screens, Components, Hooks
- **Domain Layer**: Entities, Use Cases, Interfaces
- **Data Layer**: Repositories, Data Sources, Models

## 3. Feature List

### Core App Screens
- [x] Home Screen - Dashboard with featured products and promotions
- [x] Products Screen - Grid/List view with filters, search, categories
- [x] Map Screen - Live location tracking, nearby stores, routes
- [x] Profile Screen - User info, settings, order history

### 3D Experience Screen
- [x] 3D Shopping Room Environment (single room)
- [x] Animated 3D Avatar with joystick controls
- [x] Third-person camera following avatar
- [x] Interactive product zones/shelves in 3D space
- [x] Product approach detection for info display

### Real-Time System
- [x] Simulated WebSocket for live updates
- [x] Price change notifications
- [x] Flash sale alerts
- [x] Stock change notifications
- [x] Toast notification system

### Products System
- [x] Product listing with FlatList optimization
- [x] Horizontal scroll cards (Featured)
- [x] Vertical product cards (Grid)
- [x] Discount badges
- [x] Add to cart functionality
- [x] Stock availability indicator

### State Management (Zustand)
- [x] Avatar position/rotation state
- [x] Cart state (items, quantities, totals)
- [x] Products data state
- [x] Live notifications queue
- [x] User location state
- [x] Map stores data

## 4. UI/UX Design Direction

### Visual Style
- Modern, clean, minimalist design
- Dark mode primary with accent colors
- Glassmorphism effects for overlays
- Smooth animations and transitions

### Color Scheme
| Element | Color |
|---------|-------|
| Primary Background | #0D0D0F (near black) |
| Secondary Background | #1A1A1E |
| Accent Primary | #6C5CE7 (purple) |
| Accent Secondary | #00CEC9 (teal) |
| Success | #00B894 |
| Warning | #FDCB6E |
| Error | #E17055 |
| Text Primary | #FFFFFF |
| Text Secondary | #A0A0A0 |

### Layout Approach
- Tab-based navigation (4 main tabs + 3D tab)
- Bottom tab bar with 5 items
- Stack navigation within each tab
- Modal for cart, notifications, product details

### 3D Room Design
- Single large room (20x20 units)
- Floor: Dark gradient with grid pattern
- Walls: Subtle metallic texture
- Shelves: 4 product display shelves around room
- Lighting: Ambient + spotlights on products
- Products: 3D representations with floating UI labels

## 5. Project Structure

```
src/
├── presentation/
│   ├── screens/
│   │   ├── home/
│   │   ├── products/
│   │   ├── map/
│   │   ├── profile/
│   │   └── three-d/
│   ├── components/
│   │   ├── common/
│   │   ├── products/
│   │   ├── map/
│   │   └── three-d/
│   └── navigation/
├── domain/
│   ├── entities/
│   ├── interfaces/
│   └── usecases/
├── data/
│   ├── repositories/
│   ├── datasources/
│   └── models/
├── services/
│   ├── websocket/
│   └── location/
├── hooks/
├── store/
├── types/
└── utils/
```

## 6. Build Configuration

### Environment Variables (.env)
```
MAPBOX_TOKEN=your_mapbox_token
API_BASE_URL=https://api.example.com
WS_ENDPOINT=wss://ws.example.com
```

### Build Targets
- Android: APK with bundled JS
- iOS: IPA (requires Mac)