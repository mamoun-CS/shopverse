import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  Alert,
  Share,
  TouchableOpacity,
  Animated,
  Dimensions
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Colors } from '../src/utils/theme';
import { useLocationStore } from '../src/store/locationStore';
import { generateCityHTML } from '../src/utils/cityHTMLGenerator';
import type { Shop, WebViewMessage } from '../src/types/city.types';

const { width, height } = Dimensions.get('window');

export default function CityScreen() {
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);
  
  const webviewRef = useRef<WebView>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const { stores } = useLocationStore();
  
  const htmlContent = generateCityHTML();
  
  // Generate shops data from stores
  const generateShopsData = useCallback((): Shop[] => {
    return stores.map((store, index) => ({
      id: index,
      name: store.name,
      type: store.category || store.address.split(',')[0].trim(),
      category: store.category || 'Lifestyle',
      color: [0x1565C0, 0xAD1457, 0x4E342E, 0x2E7D32, 0xBF360C, 0x00695C, 0x4527A0, 0x00838F][index % 8],
      accent: [0x42A5F5, 0xF48FB1, 0xA1887F, 0x81C784, 0xFF8A50, 0x80CBC4, 0xB39DDB, 0x4DD0E1][index % 8],
      height: 40 + (store.rating || 4) * 5,
      icon: ['⚡', '👗', '☕', '🥬', '📚', '💊', '🍕', '💎', '🎮', '🎨'][index % 10],
      rating: store.rating || 4.0 + Math.random() * 0.9,
      price: ['$', '$$', '$$$', '$$$$'][Math.floor(Math.random() * 4)],
      description: store.description || store.address,
      address: store.address
    }));
  }, [stores]);
  
  // Inject shops data into WebView
  const injectShopsData = useCallback(() => {
    const shopsData = generateShopsData();
    const script = `
      try {
        window.STORES_FROM_APP = ${JSON.stringify(shopsData)};
        console.log('✅ Injected ${shopsData.length} shops into city');
        if (typeof window.refreshCityShops === 'function') {
          window.refreshCityShops(${JSON.stringify(shopsData)});
        }
      } catch(e) {
        if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', error: 'Caught Error in injectShopsData: ' + e.message }));
      }
      true;
    `;
    webviewRef.current?.injectJavaScript(script);
  }, [generateShopsData]);
  
  // Handle messages from WebView
  const handleMessage = useCallback((event: any) => {
    try {
      const message: WebViewMessage = JSON.parse(event.nativeEvent.data);
      console.log('📨 WebView message:', message);
      
      if (message.type === 'error') {
        setError(message.error || 'Unknown error occurred');
        setLoading(false);
      }
      
      if (message.type === 'shop_selected' && message.shop) {
        const shop = message.shop;
        Alert.alert(
          shop.icon + ' ' + shop.name,
          `${shop.type}\n\n${shop.description}\n\n⭐ Rating: ${shop.rating}/5\n💰 Price: ${shop.price}`,
          [
            { text: 'Close', style: 'cancel' },
            {
              text: 'Share',
              onPress: () => {
                Share.share({
                  message: `Check out ${shop.name} at ShopVerse City!\n\n${shop.description}\nRating: ${shop.rating}⭐`,
                  title: shop.name,
                });
              }
            },
            {
              text: 'Navigate',
              onPress: () => {
                // Handle navigation to shop details
                Alert.alert('Navigation', `Navigating to ${shop.name}...`);
              }
            }
          ]
        );
      }
    } catch (err) {
      console.error('Message parsing error:', err);
    }
  }, []);
  
  // Handle WebView load events
  const handleLoadStart = useCallback(() => {
    console.log('🚀 WebView loading started');
    setLoading(true);
    setLoadingProgress(10);
    Animated.spring(fadeAnim, { toValue: 1, useNativeDriver: true }).start();
  }, []);
  
  const handleLoadProgress = useCallback((event: any) => {
    const progress = Math.round(event.nativeEvent.progress * 100);
    setLoadingProgress(progress);
    if (progress === 100) {
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true
        }).start(() => setLoading(false));
      }, 500);
    }
  }, []);
  
  const handleLoadEnd = useCallback(() => {
    console.log('✅ WebView loaded successfully');
    setLoadingProgress(100);
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true
    }).start(() => setLoading(false));

    setTimeout(() => {
      injectShopsData();
    }, 1000);
  }, [injectShopsData]);
  
  const handleError = useCallback((event: any) => {
    console.error('❌ WebView error:', event.nativeEvent.description);
    setError('Failed to load 3D city: ' + event.nativeEvent.description);
    setLoading(false);
  }, []);
  
  const retryLoad = useCallback(() => {
    setError(null);
    setLoading(true);
    setLoadingProgress(0);
    webviewRef.current?.reload();
  }, []);
  
  // Auto-hide controls after 3 seconds of inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const resetTimer = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 3000);
    };
    
    resetTimer();
    return () => clearTimeout(timeout);
  }, []);
  
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorContent}>
          <Text style={styles.errorIcon}>🏗️</Text>
          <Text style={styles.errorTitle}>Construction Error</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={retryLoad}>
            <Text style={styles.retryText}>🔄 Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Animated.View style={[styles.loadingOverlay, { opacity: fadeAnim, pointerEvents: loading ? 'auto' : 'none' }]}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color={Colors.accent} />
          <Text style={styles.loadingTitle}>Building City</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${loadingProgress}%` }]} />
          </View>
          <Text style={styles.loadingText}>{`${loadingProgress}% Complete`}</Text>
          <Text style={styles.loadingSubtext}>Loading 3D assets...</Text>
        </View>
      </Animated.View>
      
      <WebView
        ref={webviewRef}
        style={styles.webview}
        source={{ html: htmlContent }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        scalesPageToFit={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        onMessage={handleMessage}
        onLoadStart={handleLoadStart}
        onLoadProgress={handleLoadProgress}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
      />
      
      {!loading && (
        <TouchableOpacity
          style={[styles.controlToggle, !showControls && styles.controlToggleHidden]}
          onPress={() => setShowControls(!showControls)}
          activeOpacity={0.8}
        >
          <Text style={styles.controlToggleText}>🎮</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a2a',
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 10, 42, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingCard: {
    backgroundColor: 'rgba(30, 30, 60, 0.9)',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: width * 0.8,
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.3)',
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
    marginBottom: 20,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 2,
  },
  loadingText: {
    color: Colors.accent,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  loadingSubtext: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a2a',
  },
  errorContent: {
    alignItems: 'center',
    padding: 20,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  errorText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
    maxWidth: width * 0.8,
  },
  retryButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  controlToggle: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(15, 15, 30, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.5)',
    zIndex: 100,
  },
  controlToggleHidden: {
    opacity: 0.5,
  },
  controlToggleText: {
    fontSize: 24,
  },
});