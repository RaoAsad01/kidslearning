import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

const iconMap = {
  home: '🏠',
  'play-circle': '▶️',
  book: '📚',
  download: '⬇️',
  settings: '⚙️',
};

export default function TabIcon({ name, color, size }) {
  return (
    <View style={styles.container}>
      <Text style={[styles.icon, { fontSize: size }]}>
        {iconMap[name] || '📱'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    textAlign: 'center',
  },
});


