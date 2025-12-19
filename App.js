import 'react-native-gesture-handler';
import 'react-native-reanimated';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import VideosScreen from './src/screens/VideosScreen';
import LearningScreen from './src/screens/LearningScreen';
import DownloadsScreen from './src/screens/DownloadsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import VideoPlayerScreen from './src/screens/VideoPlayerScreen';
import LearningDetailScreen from './src/screens/LearningDetailScreen';
import PinLockScreen from './src/screens/PinLockScreen';

// Components
import TabIcon from './src/components/TabIcon';

// Theme
import { theme } from './src/theme/theme';
import { colors } from './src/theme/colors';

// Context
import { ParentalControlProvider, useParentalControl } from './src/context/ParentalControlContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

function MainTabs() {
  console.log('🟢 MainTabs component rendering...');
  const { startSession, endSession } = useParentalControl();
  
  React.useEffect(() => {
    console.log('✅ MainTabs mounted');
    // Start tracking app usage when tabs are active
    startSession();
    
    return () => {
      // End tracking when tabs unmount
      endSession();
    };
  }, []);

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 1,
          borderTopColor: colors.lightGray,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Videos" 
        component={VideosScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="play-circle" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Learn" 
        component={LearningScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="book" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Downloads" 
        component={DownloadsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="download" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="settings" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Wrapper component to handle lock state
function AppContent() {
  const { isLocked, isReady } = useParentalControl();
  const [appIsReady, setAppIsReady] = useState(false);
  const [appError, setAppError] = useState(null);
  const [debugInfo, setDebugInfo] = useState('Initializing...');

  useEffect(() => {
    console.log('🔵 App component mounted');
    
    // IMMEDIATELY hide splash and show app - no delays, no waiting
    (async () => {
      try {
        console.log('🟢 Hiding splash screen NOW...');
        await SplashScreen.hideAsync();
        console.log('✅ Splash hidden!');
      } catch (e) {
        console.error('❌ Splash hide error:', e);
      }
      
      // Set ready immediately - don't wait for anything
      setAppIsReady(true);
      setDebugInfo('App ready');
      console.log('✅ App marked as ready');
    })();

    // Backup timeout - force ready after 500ms
    const timeout = setTimeout(() => {
      console.log('⏰ Backup timeout - forcing ready');
      SplashScreen.hideAsync().catch(() => {});
      setAppIsReady(true);
    }, 500);

    return () => clearTimeout(timeout);
  }, []);

  console.log('🔵 App render - appIsReady:', appIsReady, 'isLocked:', isLocked, 'isReady:', isReady);
  
  // Log when lock state changes
  useEffect(() => {
    console.log('🔒 Lock state changed:', isLocked ? 'LOCKED' : 'UNLOCKED');
  }, [isLocked]);

  if (!appIsReady || !isReady) {
    console.log('⏳ Waiting for app to be ready...');
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
        <Text style={styles.debugText}>{debugInfo}</Text>
      </View>
    );
  }

  if (appError) {
    console.log('❌ Showing error screen');
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {appError.message}</Text>
        <Text style={styles.errorSubtext}>Check console for details</Text>
        <Text style={styles.errorSubtext}>Debug: {debugInfo}</Text>
      </View>
    );
  }

  console.log('✅ Rendering main app...');

  // Wrap in try-catch to catch any render errors
  try {
    console.log('🟢 Rendering SafeAreaProvider...');
    return (
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <NavigationContainer
            onReady={() => {
              console.log('✅✅✅ NavigationContainer ready!');
            }}
            onStateChange={(state) => {
              console.log('✅ Navigation state changed:', state ? 'has state' : 'no state');
            }}
            onError={(error) => {
              console.error('❌ NavigationContainer error:', error);
            }}
            fallback={
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text>Loading navigation...</Text>
              </View>
            }
          >
            <StatusBar style="auto" />
            <Stack.Navigator
              screenOptions={{
                headerShown: false,
                cardStyle: { backgroundColor: colors.white },
              }}
            >
              <Stack.Screen 
                name="MainTabs" 
                component={MainTabs}
                listeners={{
                  focus: () => console.log('✅ MainTabs screen focused'),
                }}
              />
              <Stack.Screen 
                name="VideoPlayer" 
                component={VideoPlayerScreen}
                options={{ presentation: 'modal' }}
              />
              <Stack.Screen 
                name="LearningDetail" 
                component={LearningDetailScreen}
              />
              <Stack.Screen 
                name="PinLock" 
                component={PinLockScreen}
                options={{ presentation: 'modal' }}
              />
            </Stack.Navigator>
            {/* Show PinLockScreen as overlay when app is locked */}
            {isLocked && (
              <View style={styles.lockOverlay}>
                <PinLockScreen 
                  route={{ params: {} }} 
                  navigation={{ 
                    goBack: () => {},
                    navigate: (screen, params) => {
                      // Allow navigation to Settings even when locked
                      if (screen === 'MainTabs') {
                        // This will be handled by the navigator
                      }
                    }
                  }}
                />
              </View>
            )}
          </NavigationContainer>
        </PaperProvider>
      </SafeAreaProvider>
    );
  } catch (renderError) {
    console.error('❌❌❌ Render error:', renderError);
    console.error('Stack:', renderError.stack);
    // Force hide splash even on render error
    SplashScreen.hideAsync().catch(() => {});
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Render Error: {renderError.message}</Text>
        <Text style={styles.errorSubtext}>Stack: {renderError.stack}</Text>
        <Text style={styles.errorSubtext}>Debug: {debugInfo}</Text>
        <Text style={styles.errorSubtext}>Check console for full error details</Text>
      </View>
    );
  }
}

// TabIcon is imported from components

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <ParentalControlProvider>
          <AppContent />
        </ParentalControlProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.textDark,
  },
  debugText: {
    marginTop: 5,
    fontSize: 12,
    color: colors.textLight,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 20,
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  errorSubtext: {
    color: colors.textLight,
    fontSize: 14,
    textAlign: 'center',
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
});

