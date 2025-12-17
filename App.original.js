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
import { ParentalControlProvider } from './src/context/ParentalControlContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

function MainTabs() {
  console.log('🟢 MainTabs component rendering...');
  
  React.useEffect(() => {
    console.log('✅ MainTabs mounted');
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

// TabIcon is imported from components

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [appError, setAppError] = useState(null);
  const [debugInfo, setDebugInfo] = useState('Initializing...');

  useEffect(() => {
    console.log('🔵 App component mounted');
    setDebugInfo('Component mounted, starting initialization...');

    async function prepare() {
      try {
        console.log('🟢 Step 1: Starting initialization...');
        setDebugInfo('Step 1: Starting initialization');
        
        // Initialize any async resources
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('🟢 Step 2: Initialization complete, setting ready state');
        setDebugInfo('Step 2: Ready, hiding splash...');
        setAppIsReady(true);
        
        console.log('🟢 Step 3: App is ready');
      } catch (e) {
        console.error('❌ App initialization error:', e);
        setAppError(e);
        setAppIsReady(true);
      } finally {
        // Hide splash screen
        try {
          console.log('🟢 Step 4: Hiding splash screen...');
          await SplashScreen.hideAsync();
          console.log('✅ Step 5: Splash screen hidden successfully!');
          setDebugInfo('Splash hidden, rendering app...');
        } catch (e) {
          console.error('❌ Error hiding splash screen:', e);
          // Force hide after delay
          setTimeout(async () => {
            try {
              await SplashScreen.hideAsync();
              console.log('✅ Splash screen force-hidden');
            } catch (err) {
              console.error('❌ Force hide also failed:', err);
            }
          }, 2000);
        }
      }
    }

    prepare();
  }, []);

  console.log('🔵 App render - appIsReady:', appIsReady, 'appError:', appError);

  if (!appIsReady) {
    console.log('⏳ Waiting for app to be ready...');
    // Return a transparent view instead of null to ensure component tree exists
    return <View style={{ position: 'absolute', width: 0, height: 0 }} />;
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
        {(() => {
          console.log('🟢 Rendering PaperProvider...');
          return (
            <PaperProvider theme={theme}>
              {(() => {
                console.log('🟢 Rendering ParentalControlProvider...');
                return (
                  <ParentalControlProvider>
                    {(() => {
                      console.log('🟢 Rendering NavigationContainer...');
                      return (
                        <NavigationContainer
                          onReady={() => {
                            console.log('✅✅✅ NavigationContainer ready!');
                          }}
                          onStateChange={(state) => {
                            console.log('✅ Navigation state changed:', state ? 'has state' : 'no state');
                          }}
                        >
                          <StatusBar style="auto" />
                          {(() => {
                            console.log('🟢 Rendering Stack.Navigator...');
                            return (
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
                                />
                              </Stack.Navigator>
                            );
                          })()}
                        </NavigationContainer>
                      );
                    })()}
                  </ParentalControlProvider>
                );
              })()}
            </PaperProvider>
          );
        })()}
      </SafeAreaProvider>
    );
  } catch (renderError) {
    console.error('❌❌❌ Render error:', renderError);
    console.error('Stack:', renderError.stack);
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Render Error: {renderError.message}</Text>
        <Text style={styles.errorSubtext}>Stack: {renderError.stack}</Text>
        <Text style={styles.errorSubtext}>Debug: {debugInfo}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
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
});

