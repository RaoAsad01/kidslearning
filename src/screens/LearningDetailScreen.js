import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import * as Speech from 'expo-speech';
import { colors } from '../theme/colors';
import { learningService } from '../services/learningService';

const { width } = Dimensions.get('window');

export default function LearningDetailScreen({ route, navigation }) {
  const { categoryId } = route.params;
  const [category, setCategory] = useState(null);
  const [content, setContent] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

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

  const speakText = (text) => {
    try {
      Speech.speak(text, {
        language: categoryId === 'urdu' ? 'ur' : 'en',
        pitch: 1.0,
        rate: 0.8,
      });
    } catch (error) {
      console.error('Error speaking text:', error);
    }
  };

  const handleItemPress = (item) => {
    setSelectedItem(item);
    
    // Speak the letter/number when clicked
    if (categoryId === 'abc') {
      speakText(item.letter);
    } else if (categoryId === '123') {
      speakText(item.number);
    } else if (categoryId === 'urdu') {
      speakText(item.name); // Speak "Alif", "Bay", etc.
    }
  };

  const renderContentItem = (item) => {
    if (categoryId === 'abc') {
      return (
        <TouchableOpacity 
          style={styles.abcCard}
          onPress={() => speakText(item.letter)}
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
      return (
        <TouchableOpacity 
          style={styles.numberCard}
          onPress={() => speakText(item.number)}
          activeOpacity={0.8}
        >
          <View style={styles.cardContent}>
            <Text style={styles.number}>{item.number || '1'}</Text>
            <Text style={styles.numberWord}>{item.word || 'One'}</Text>
            <Text style={styles.numberImage}>{item.image || '🍎'}</Text>
          </View>
        </TouchableOpacity>
      );
    } else if (categoryId === 'urdu') {
      return (
        <TouchableOpacity 
          style={styles.urduCard}
          onPress={() => speakText(item.name)}
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
        <View style={styles.shapeCard}>
          <Text style={styles.shapeIcon}>{item.shape}</Text>
          <Text style={styles.shapeName}>{item.name}</Text>
        </View>
      );
    } else if (categoryId === 'colors') {
      return (
        <View style={[styles.colorCard, { backgroundColor: item.color + '30' }]}>
          <View style={[styles.colorCircle, { backgroundColor: item.color }]} />
          <Text style={styles.colorName}>{item.name}</Text>
          <View style={styles.colorExamples}>
            {item.examples.map((emoji, idx) => (
              <Text key={idx} style={styles.colorExampleEmoji}>{emoji}</Text>
            ))}
          </View>
        </View>
      );
    } else if (categoryId === 'animals') {
      return (
        <View style={styles.animalCard}>
          <Text style={styles.animalImage}>{item.image}</Text>
          <Text style={styles.animalName}>{item.name}</Text>
          <Text style={styles.animalSound}>{item.sound}</Text>
        </View>
      );
    } else if (categoryId === 'fruits') {
      return (
        <View style={styles.fruitCard}>
          <Text style={styles.fruitImage}>{item.image}</Text>
          <Text style={styles.fruitName}>{item.name}</Text>
        </View>
      );
    } else if (categoryId === 'phonics') {
      return (
        <View style={styles.phonicsCard}>
          <Text style={styles.phonicsSound}>{item.sound}</Text>
          <Text style={styles.phonicsWord}>{item.word}</Text>
          <Text style={styles.phonicsImage}>{item.image}</Text>
        </View>
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

      <ScrollView style={styles.content}>
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
    elevation: 5,
  },
  colorCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
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
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});


