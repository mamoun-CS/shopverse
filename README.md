# 🏙️ ShopVerse 

ShopVerse is a modern, hybrid React Native mobile application built with Expo. It seamlessly combines a traditional multi-page mobile application (Home, Products, Map, Profile) with an interactive, fully immersive **3D Shopping City**. 

Users can browse stores traditionally or transport their avatar into a shared Three.js-powered 3D city map to walk around, explore storefronts, and interact with shops visually!

---

## 🛠️ Technology Stack
- **Framework:** React Native & Expo (Expo Router)
- **3D Engine:** [Three.js](https://threejs.org/) (Injected dynamically into a WebView)
- **State Management:** Zustand
- **Styling:** React Native StyleSheet & CSS (within the 3D Web Environment)

---

## 🏗️ Architecture & Directory Structure

The project strictly follows a clean separation of concerns, routing through Expo Router while maintaining global logic in `src/`.

### `app/` (Expo Router Navigation)
This directory acts as the main routing layer equipped with a traditional Bottom Tab Navigator (`_layout.tsx`).
- **`index.tsx`**: The standard Home screen featuring categorized product listings.
- **`products.tsx`, `map.tsx`, `profile.tsx`**: Standard React Native application tabs.
- **`city.tsx`**: The core bridge component! This file mounts a `react-native-webview` that loads our 3D City. It generates the shops' data natively from Zustand, stringifies it, and injects it securely into the 3D world. It also listens dynamically for `postMessage` events when you click on stores inside the 3D view to popup native Modals and Share dialogs.

### `src/utils/` (The 3D Heart)
To bypass React Native's WebGL constraints and deliver a buttery-smooth 3D experience, the entire 3D city runs optimally using raw Three.js inside an HTML wrapper.
- **`cityHTMLGenerator.ts`**: The architectural scaffolding. This exports the raw `<!DOCTYPE html>` string, building the CSS layout for the Loading screen, the HUD buttons (Zoom, Follow Me), the Minimap canvas, and the interactive Joystick.
- **`threeJSLogic.ts`**: The sheer brains of the 3D environment. This file is parsed into a `<script>` tag and strictly governs:
  - **Environment Construction**: Generating the roads, grass, buildings (`createShopBuildings`), and street lights.
  - **Camera Logic**: Handling pan and tilt variables (`camTheta`, `camPhi`) based on touch events.
  - **Avatar Kinematics**: Checking bound limits and rendering walking animations.
  - **Interactions (Raycasting)**: Emitting mathematical lines (`THREE.Projector` & `THREE.Raycaster`) originating from the camera into the 3D space to resolve exactly what shop model the user clicks or hovers over.

### `src/store/`
- **`locationStore.ts`**: Contains our robust Zustand state hook. It holds the mock data arrays of our shops, user preferences, and overall UI state accessible globally across traditional React Native screens without prop-drilling.

---

## 🕹️ 3D Interactions & Controls

The 3D City does not just look pretty, it's a completely interactive video-game interface nested locally:
1. **Virtual Joystick:** Driven entirely by DOM Touch Events inside the WebView, it feeds kinematic parameters (W, A, S, D equivalents) into the animation loop (`animate()`) to move the avatar.
2. **Camera Panning:** A custom `setupCameraTouchControls` handler ensures swiping freely dynamically orbits the camera around the world, completely bypassing clipping or gimbal locking. 
3. **Pinch-To-Zoom:** Standard multi-touch zooming controls the camera radius (`camRadius`), interpolating closeness bounds.
4. **Native Bi-directional Communication:** When a store building is Raycast-clicked, an HTML dialog window opens. Uniquely, clicking `Visit Shop` dispatches a payload via `window.ReactNativeWebView.postMessage`. The parent `app/city.tsx` reads this JSON string and drops a native React Native Alert on screen!

---

## 🐛 Notable Workarounds
- **Three.js API Compatibility**: Early during building, the CDN import was tied to `r68` of Three.js. This demanded backwards-compatible geometry logic (utilizing `THREE.Object3D` instead of `THREE.Group`, `CubeGeometry` instead of `BoxGeometry`, and `Projector.unprojectVector` instead of modern `.unproject` shortcuts) to operate independently and fluidly without dropping frames inside older WebView shells.
- **WebView Loader Sync**: Implemented robust `try/catch` and `window.onerror` bounds on the inline WebView execution so that if the 3js initialization ever fails due to memory exceptions, it is printed precisely to the screen rather than obfuscated endlessly into "Loading 3D World...". 

---

## 🚀 Running the Project

1. Ensure dependencies are installed: `npm install`
2. Start the Expo server: `npx expo start -c`
3. Hit `a` for Android Emulator, `i` for iOS Simulator, or scan the QR Code on the Expo Go app.
