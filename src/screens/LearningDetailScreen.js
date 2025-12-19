import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { colors } from '../theme/colors';
import { learningService } from '../services/learningService';
import { animalSounds, animalSoundUrls } from '../services/animalSounds';

const { width } = Dimensions.get('window');

// Animated Animal Image Component
function AnimatedAnimalImage({ emoji }) {
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Create continuous bounce animation
    const bounceAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    // Create subtle rotation animation
    const rotateAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    bounceAnimation.start();
    rotateAnimation.start();

    return () => {
      bounceAnimation.stop();
      rotateAnimation.stop();
    };
  }, []);

  const translateY = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15], // Bounce up and down
  });

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-5deg', '5deg'], // Slight rotation
  });

  return (
    <Animated.View
      style={{
        transform: [{ translateY }, { rotate }],
      }}
    >
      <Text style={styles.animalImage}>{emoji}</Text>
    </Animated.View>
  );
}

export default function LearningDetailScreen({ route, navigation }) {
  const { categoryId } = route.params;
  const [category, setCategory] = useState(null);
  const [content, setContent] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const scrollViewRef = useRef(null);
  const currentSoundRef = useRef(null); // Track current audio sound
  const timeoutRefs = useRef([]); // Track all timeouts

  useEffect(() => {
    const categories = learningService.getLearningCategories();
    const cat = categories.find(c => c.id === categoryId);
    setCategory(cat);
    
    const learningContent = learningService.getLearningContent(categoryId);
    setContent(learningContent);
    if (learningContent.length > 0) {
      setSelectedItem(learningContent[0]);
    }
  }, [categoryId]);

  if (!category) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // Stop all previous speech and audio
  const stopAllSounds = () => {
    try {
      // Stop any ongoing speech
      Speech.stop();
      
      // Stop and unload current audio
      if (currentSoundRef.current) {
        currentSoundRef.current.unloadAsync().catch(() => {});
        currentSoundRef.current = null;
      }
      
      // Clear all pending timeouts
      timeoutRefs.current.forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
      timeoutRefs.current = [];
    } catch (error) {
      console.error('Error stopping sounds:', error);
    }
  };

  const speakText = (text, options = {}) => {
    try {
      Speech.speak(text, {
        language: options.language || (categoryId === 'urdu' ? 'ur' : 'en'),
        pitch: 1.0,
        rate: 0.8,
        ...options,
      });
    } catch (error) {
      console.error('Error speaking text:', error);
    }
  };

  const playAnimalSound = async (item) => {
    try {
      // Stop any previous audio first
      if (currentSoundRef.current) {
        try {
          await currentSoundRef.current.unloadAsync();
        } catch (e) {
          // Ignore errors when stopping
        }
        currentSoundRef.current = null;
      }

      // Set audio mode for playback
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      // Try local sound file first (from animalSounds.js)
      const localSound = animalSounds[item.id];
      
      if (localSound) {
        try {
          console.log('🎵 Playing local sound for:', item.name, item.id);
          // Create and play sound from local file
          const { sound } = await Audio.Sound.createAsync(
            localSound,
            { shouldPlay: true, volume: 1.0 }
          );

          // Store reference to current sound
          currentSoundRef.current = sound;

          // Clean up when sound finishes
          sound.setOnPlaybackStatusUpdate((status) => {
            if (status.didJustFinish) {
              sound.unloadAsync();
              if (currentSoundRef.current === sound) {
                currentSoundRef.current = null;
              }
            }
          });
          console.log('✅ Sound playing successfully');
          return; // Successfully played local sound
        } catch (audioError) {
          console.log('❌ Local audio file error:', audioError);
          // Fall through to try URL or fallback
        }
      } else {
        console.log('⚠️ No local sound file found for:', item.id, '- checking URLs...');
      }

      // Try online URL if local file not available
      const soundUrl = animalSoundUrls[item.id];
      if (soundUrl) {
        try {
          // Create and play sound from URL
          const { sound } = await Audio.Sound.createAsync(
            { uri: soundUrl },
            { shouldPlay: true, volume: 1.0 }
          );

          // Store reference to current sound
          currentSoundRef.current = sound;

          // Clean up when sound finishes
          sound.setOnPlaybackStatusUpdate((status) => {
            if (status.didJustFinish) {
              sound.unloadAsync();
              if (currentSoundRef.current === sound) {
                currentSoundRef.current = null;
              }
            }
          });
          return; // Successfully played URL sound
        } catch (urlError) {
          console.log('URL audio file error:', urlError);
          // Fall through to fallback
        }
      }

      // Fallback to enhanced text-to-speech if no sound file available
      console.log('No sound file found for:', item.id, '- using text-to-speech fallback');
      playEnhancedAnimalSound(item);
    } catch (error) {
      console.error('Error playing animal sound:', error);
      // Final fallback
      playEnhancedAnimalSound(item);
    }
  };

  const playEnhancedAnimalSound = (item) => {
    // Enhanced text-to-speech with realistic animal sound effects
    const soundEffects = {
      'lion': { pitch: 0.3, rate: 0.5 },
      'tiger': { pitch: 0.4, rate: 0.5 },
      'elephant': { pitch: 0.2, rate: 0.4 },
      'dog': { pitch: 0.7, rate: 0.8 },
      'cat': { pitch: 1.2, rate: 1.0 },
      'cow': { pitch: 0.5, rate: 0.6 },
      'pig': { pitch: 0.8, rate: 0.9 },
      'sheep': { pitch: 1.0, rate: 0.7 },
      'horse': { pitch: 0.6, rate: 0.7 },
      'duck': { pitch: 1.3, rate: 1.1 },
      'chicken': { pitch: 1.2, rate: 1.0 },
      'rooster': { pitch: 0.9, rate: 0.8 },
      'owl': { pitch: 0.6, rate: 0.5 },
      'frog': { pitch: 0.7, rate: 0.6 },
      'bird': { pitch: 1.5, rate: 1.2 },
      'monkey': { pitch: 1.0, rate: 1.1 },
      'bear': { pitch: 0.3, rate: 0.5 },
      'rabbit': { pitch: 1.1, rate: 1.0 },
      'mouse': { pitch: 1.4, rate: 1.1 },
      'snake': { pitch: 0.5, rate: 0.4 },
      'whale': { pitch: 0.2, rate: 0.3 },
      'dolphin': { pitch: 1.3, rate: 1.0 },
    };
    const effect = soundEffects[item.id] || { pitch: 0.8, rate: 0.7 };
    speakText(item.sound, { pitch: effect.pitch, rate: effect.rate });
  };

  const handleItemPress = (item) => {
    // Stop all previous sounds and clear timeouts FIRST
    stopAllSounds();
    
    setSelectedItem(item);
    
    // Scroll to top to show the selected item
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
    
    // Speak the letter/number AND the word when clicked
    if (categoryId === 'abc') {
      // Speak letter first, then word
      speakText(item.letter);
      const timeout = setTimeout(() => {
        speakText(item.word);
      }, 500);
      timeoutRefs.current.push(timeout);
    } else if (categoryId === '123') {
      // Speak number with count (e.g., "2 apples")
      const count = item.count || parseInt(item.number);
      const emoji = item.image && item.image.length > 0 ? item.image[0] : '🍎';
      const itemName = count === 1 ? 'apple' : 'apples';
      speakText(`${item.number} ${itemName}`);
    } else if (categoryId === 'urdu') {
      // Speak name first (Alif, Bay), then word
      speakText(item.name);
      const timeout = setTimeout(() => {
        speakText(item.word, { language: 'ur' });
      }, 500);
      timeoutRefs.current.push(timeout);
    } else if (categoryId === 'shapes') {
      // Speak shape name
      speakText(item.name);
    } else if (categoryId === 'colors') {
      // Speak color name
      speakText(item.name);
    } else if (categoryId === 'animals') {
      // Speak animal name, then play animal sound
      speakText(item.name);
      const timeout = setTimeout(() => {
        playAnimalSound(item);
      }, 600);
      timeoutRefs.current.push(timeout);
    } else if (categoryId === 'fruits') {
      // Speak fruit/vegetable name
      speakText(item.name);
    } else if (categoryId === 'phonics') {
      // Speak sound first, then word
      speakText(item.sound);
      const timeout = setTimeout(() => {
        speakText(item.word);
      }, 500);
      timeoutRefs.current.push(timeout);
    }
  };

  const renderContentItem = (item) => {
    if (categoryId === 'abc') {
      return (
        <TouchableOpacity 
          style={styles.abcCard}
          onPress={() => {
            stopAllSounds();
            speakText(item.letter);
            const timeout = setTimeout(() => {
              speakText(item.word);
            }, 500);
            timeoutRefs.current.push(timeout);
          }}
          activeOpacity={0.8}
        >
          <View style={styles.cardContent}>
            <Text style={styles.abcLetter}>{item.letter || 'A'}</Text>
            <Text style={styles.abcImage}>{item.image || '🍎'}</Text>
            <Text style={styles.abcWord}>{item.word || 'Apple'}</Text>
          </View>
        </TouchableOpacity>
      );
    } else if (categoryId === '123') {
      // Generate correct number of emojis based on count
      const count = item.count || parseInt(item.number) || 1;
      // Extract first emoji from image string (handle cases where image has multiple emojis)
      let baseEmoji = '🍎';
      if (item.image && item.image.length > 0) {
        // Use the first emoji from the string (works for both single and multiple emojis)
        // Match emoji pattern (covers most emojis)
        const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}]/u;
        const match = item.image.match(emojiRegex);
        baseEmoji = match ? match[0] : '🍎';
      }
      const emojis = baseEmoji.repeat(count);
      
      return (
        <TouchableOpacity 
          style={styles.numberCard}
          onPress={() => {
            stopAllSounds();
            const itemName = count === 1 ? 'apple' : 'apples';
            speakText(`${item.number} ${itemName}`);
          }}
          activeOpacity={0.8}
        >
          <View style={styles.cardContent}>
            <Text style={styles.number}>{item.number || '1'}</Text>
            <Text style={styles.numberWord}>{item.word || 'One'}</Text>
            <Text style={styles.numberImage}>{emojis}</Text>
          </View>
        </TouchableOpacity>
      );
    } else if (categoryId === 'urdu') {
      return (
        <TouchableOpacity 
          style={styles.urduCard}
          onPress={() => {
            stopAllSounds();
            speakText(item.name);
            const timeout = setTimeout(() => {
              speakText(item.word, { language: 'ur' });
            }, 500);
            timeoutRefs.current.push(timeout);
          }}
          activeOpacity={0.8}
        >
          <View style={styles.cardContent}>
            <Text style={styles.urduLetter}>{item.letter || 'ا'}</Text>
            <Text style={styles.urduName}>{item.name || 'Alif'}</Text>
            <Text style={styles.urduWord}>{item.word || 'آدمی'}</Text>
            <Text style={styles.urduImage}>{item.image || '👤'}</Text>
          </View>
        </TouchableOpacity>
      );
    } else if (categoryId === 'shapes') {
      return (
        <TouchableOpacity 
          style={styles.shapeCard}
          onPress={() => {
            stopAllSounds();
            speakText(item.name);
          }}
          activeOpacity={0.8}
        >
          <View style={styles.cardContent}>
            <Text style={styles.shapeIcon}>{item.shape}</Text>
            <Text style={styles.shapeName}>{item.name}</Text>
          </View>
        </TouchableOpacity>
      );
    } else if (categoryId === 'colors') {
      return (
        <TouchableOpacity 
          style={styles.colorCard}
          onPress={() => {
            stopAllSounds();
            speakText(item.name);
          }}
          activeOpacity={0.8}
        >
          <View style={styles.cardContent}>
            <View style={[styles.colorCircle, { backgroundColor: item.color }]} />
            <Text style={styles.colorName}>{item.name}</Text>
            <View style={styles.colorExamples}>
              {item.examples.map((emoji, idx) => (
                <Text key={idx} style={styles.colorExampleEmoji}>{emoji}</Text>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      );
    } else if (categoryId === 'animals') {
      return (
        <TouchableOpacity 
          style={styles.animalCard}
          onPress={() => {
            stopAllSounds();
            speakText(item.name);
            const timeout = setTimeout(() => {
              playAnimalSound(item);
            }, 600);
            timeoutRefs.current.push(timeout);
          }}
          activeOpacity={0.8}
        >
          <View style={styles.cardContent}>
            <AnimatedAnimalImage emoji={item.image} />
            <Text style={styles.animalName}>{item.name}</Text>
            <Text style={styles.animalSound}>{item.sound}</Text>
          </View>
        </TouchableOpacity>
      );
    } else if (categoryId === 'fruits') {
      return (
        <TouchableOpacity 
          style={styles.fruitCard}
          onPress={() => {
            stopAllSounds();
            speakText(item.name);
          }}
          activeOpacity={0.8}
        >
          <View style={styles.cardContent}>
            <Text style={styles.fruitImage}>{item.image}</Text>
            <Text style={styles.fruitName}>{item.name}</Text>
          </View>
        </TouchableOpacity>
      );
    } else if (categoryId === 'phonics') {
      return (
        <TouchableOpacity 
          style={styles.phonicsCard}
          onPress={() => {
            stopAllSounds();
            speakText(item.sound);
            const timeout = setTimeout(() => {
              speakText(item.word);
            }, 500);
            timeoutRefs.current.push(timeout);
          }}
          activeOpacity={0.8}
        >
          <View style={styles.cardContent}>
            <Text style={styles.phonicsSound}>{item.sound}</Text>
            <Text style={styles.phonicsWord}>{item.word}</Text>
            <Text style={styles.phonicsImage}>{item.image}</Text>
          </View>
        </TouchableOpacity>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: category.color }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{category.icon} {category.name}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {selectedItem && (
          <View style={styles.selectedItemContainer}>
            {renderContentItem(selectedItem)}
          </View>
        )}

        <View style={styles.itemsGrid}>
          {content.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.itemButton,
                selectedItem?.id === item.id && styles.itemButtonActive,
              ]}
              onPress={() => handleItemPress(item)}
            >
              {categoryId === 'abc' && (
                <Text style={styles.itemButtonText}>{item.letter}</Text>
              )}
              {categoryId === '123' && (
                <Text style={styles.itemButtonText}>{item.number}</Text>
              )}
              {categoryId === 'urdu' && (
                <Text style={styles.itemButtonText}>{item.letter}</Text>
              )}
              {categoryId === 'shapes' && (
                <Text style={styles.itemButtonText}>{item.shape}</Text>
              )}
              {categoryId === 'colors' && (
                <View style={[styles.colorDot, { backgroundColor: item.color }]} />
              )}
              {categoryId === 'animals' && (
                <Text style={styles.itemButtonText}>{item.image}</Text>
              )}
              {categoryId === 'fruits' && (
                <Text style={styles.itemButtonText}>{item.image}</Text>
              )}
              {categoryId === 'phonics' && (
                <Text style={styles.itemButtonText}>{item.sound}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    justifyContent: 'space-between',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  backButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.white,
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  selectedItemContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  cardContent: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  abcCard: {
    width: width - 80,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  abcLetter: {
    fontSize: 120,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 20,
    textAlign: 'center',
    includeFontPadding: false,
    lineHeight: 140,
  },
  abcImage: {
    fontSize: 80,
    marginBottom: 15,
    textAlign: 'center',
  },
  abcWord: {
    fontSize: 32,
    fontWeight: '600',
    color: colors.textDark,
    textAlign: 'center',
  },
  numberCard: {
    width: width - 80,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    elevation: 5,
  },
  number: {
    fontSize: 120,
    fontWeight: 'bold',
    color: colors.secondary,
    marginBottom: 20,
    textAlign: 'center',
    includeFontPadding: false,
    lineHeight: 140,
  },
  numberWord: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: 15,
    textAlign: 'center',
  },
  numberImage: {
    fontSize: 60,
    textAlign: 'center',
  },
  urduCard: {
    width: width - 80,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    elevation: 5,
  },
  urduLetter: {
    fontSize: 100,
    fontWeight: 'bold',
    color: colors.accent,
    marginBottom: 15,
    textAlign: 'center',
    includeFontPadding: false,
    lineHeight: 120,
    fontFamily: 'System', // Use Arabic font if available
  },
  urduName: {
    fontSize: 24,
    color: colors.textLight,
    marginBottom: 10,
    textAlign: 'center',
  },
  urduWord: {
    fontSize: 32,
    color: colors.textDark,
    marginBottom: 15,
    textAlign: 'center',
    fontFamily: 'System',
  },
  urduImage: {
    fontSize: 60,
    textAlign: 'center',
  },
  shapeCard: {
    width: width - 80,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    elevation: 5,
  },
  shapeIcon: {
    fontSize: 100,
    marginBottom: 20,
  },
  shapeName: {
    fontSize: 32,
    fontWeight: '600',
    color: colors.textDark,
  },
  colorCard: {
    width: width - 80,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  colorCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: colors.lightGray,
  },
  colorName: {
    fontSize: 32,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: 15,
  },
  colorExamples: {
    flexDirection: 'row',
    gap: 15,
  },
  colorExampleEmoji: {
    fontSize: 40,
  },
  animalCard: {
    width: width - 80,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    elevation: 5,
  },
  animalImage: {
    fontSize: 100,
    marginBottom: 20,
  },
  animalName: {
    fontSize: 32,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: 10,
  },
  animalSound: {
    fontSize: 24,
    color: colors.textLight,
  },
  fruitCard: {
    width: width - 80,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    elevation: 5,
  },
  fruitImage: {
    fontSize: 100,
    marginBottom: 20,
  },
  fruitName: {
    fontSize: 32,
    fontWeight: '600',
    color: colors.textDark,
  },
  phonicsCard: {
    width: width - 80,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    elevation: 5,
  },
  phonicsSound: {
    fontSize: 100,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 20,
  },
  phonicsWord: {
    fontSize: 32,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: 15,
  },
  phonicsImage: {
    fontSize: 60,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  itemButton: {
    width: (width - 60) / 4,
    aspectRatio: 1,
    backgroundColor: colors.white,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  itemButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '30',
  },
  itemButtonText: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textDark,
    paddingBottom: 15,
  },
  colorDot: {
    width: 30,
    height: 30,
    borderRadius: 20,
    marginBottom: 15
  },
});


