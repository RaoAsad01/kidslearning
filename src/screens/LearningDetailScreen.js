import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { colors } from '../theme/colors';
import { learningService } from '../services/learningService';
import { animalSounds, animalSoundUrls } from '../services/animalSounds';

const { width } = Dimensions.get('window');

export default function LearningDetailScreen({ route, navigation }) {
  const { categoryId } = route.params;
  const [category, setCategory] = useState(null);
  const [content, setContent] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const scrollViewRef = useRef(null);

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

          // Clean up when sound finishes
          sound.setOnPlaybackStatusUpdate((status) => {
            if (status.didJustFinish) {
              sound.unloadAsync();
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

          // Clean up when sound finishes
          sound.setOnPlaybackStatusUpdate((status) => {
            if (status.didJustFinish) {
              sound.unloadAsync();
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
    setSelectedItem(item);
    
    // Scroll to top to show the selected item
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
    
    // Speak the letter/number AND the word when clicked
    if (categoryId === 'abc') {
      // Speak letter first, then word
      speakText(item.letter);
      setTimeout(() => {
        speakText(item.word);
      }, 500);
    } else if (categoryId === '123') {
      // Speak number with count (e.g., "2 apples")
      const count = item.count || parseInt(item.number);
      const emoji = item.image && item.image.length > 0 ? item.image[0] : '🍎';
      const itemName = count === 1 ? 'apple' : 'apples';
      speakText(`${item.number} ${itemName}`);
    } else if (categoryId === 'urdu') {
      // Speak name first (Alif, Bay), then word
      speakText(item.name);
      setTimeout(() => {
        speakText(item.word, { language: 'ur' });
      }, 500);
    } else if (categoryId === 'shapes') {
      // Speak shape name
      speakText(item.name);
    } else if (categoryId === 'colors') {
      // Speak color name
      speakText(item.name);
    } else if (categoryId === 'animals') {
      // Speak animal name, then play animal sound
      speakText(item.name);
      setTimeout(() => {
        playAnimalSound(item);
      }, 600);
    } else if (categoryId === 'fruits') {
      // Speak fruit/vegetable name
      speakText(item.name);
    } else if (categoryId === 'phonics') {
      // Speak sound first, then word
      speakText(item.sound);
      setTimeout(() => {
        speakText(item.word);
      }, 500);
    }
  };

  const renderContentItem = (item) => {
    if (categoryId === 'abc') {
      return (
        <TouchableOpacity 
          style={styles.abcCard}
          onPress={() => {
            speakText(item.letter);
            setTimeout(() => {
              speakText(item.word);
            }, 500);
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
            speakText(item.name);
            setTimeout(() => {
              speakText(item.word, { language: 'ur' });
            }, 500);
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
          onPress={() => speakText(item.name)}
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
          onPress={() => speakText(item.name)}
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
            speakText(item.name);
            setTimeout(() => {
              playAnimalSound(item);
            }, 600);
          }}
          activeOpacity={0.8}
        >
          <View style={styles.cardContent}>
            <Text style={styles.animalImage}>{item.image}</Text>
            <Text style={styles.animalName}>{item.name}</Text>
            <Text style={styles.animalSound}>{item.sound}</Text>
          </View>
        </TouchableOpacity>
      );
    } else if (categoryId === 'fruits') {
      return (
        <TouchableOpacity 
          style={styles.fruitCard}
          onPress={() => speakText(item.name)}
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
            speakText(item.sound);
            setTimeout(() => {
              speakText(item.word);
            }, 500);
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
          <Text style={styles.backButtonText}>← Back</Text>
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
    padding: 5,
  },
  backButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
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


