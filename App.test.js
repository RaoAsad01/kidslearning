// Temporary test file to check if basic app works
import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { colors } from './src/theme/colors';

SplashScreen.preventAutoHideAsync();

export default function AppTest() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (e) {
        console.error(e);
      } finally {
        setReady(true);
        await SplashScreen.hideAsync();
      }
    }
    prepare();
  }, []);

  if (!ready) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>✅ App Loaded Successfully!</Text>
      <Text style={styles.subtitle}>If you see this, the basic app works.</Text>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.white,
    textAlign: 'center',
  },
});


