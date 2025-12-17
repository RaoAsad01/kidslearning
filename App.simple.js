// SUPER SIMPLE TEST - Replace App.js with this to test
import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { colors } from './src/theme/colors';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    console.log('=== SIMPLE APP: Starting ===');
    
    async function prepare() {
      try {
        console.log('=== SIMPLE APP: Waiting 1 second ===');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('=== SIMPLE APP: Hiding splash ===');
        await SplashScreen.hideAsync();
        
        console.log('=== SIMPLE APP: Setting ready ===');
        setReady(true);
        
        console.log('=== SIMPLE APP: Ready! ===');
      } catch (e) {
        console.error('=== SIMPLE APP ERROR ===', e);
        setReady(true);
      }
    }
    
    prepare();
  }, []);

  if (!ready) {
    console.log('=== SIMPLE APP: Not ready yet ===');
    return null;
  }

  console.log('=== SIMPLE APP: Rendering main view ===');
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>✅ SUCCESS!</Text>
      <Text style={styles.subtitle}>App is working!</Text>
      <Text style={styles.debug}>If you see this, React Native is working.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 20,
    color: colors.white,
    marginBottom: 10,
  },
  debug: {
    fontSize: 16,
    color: colors.white,
    opacity: 0.8,
    marginTop: 20,
    textAlign: 'center',
  },
});


