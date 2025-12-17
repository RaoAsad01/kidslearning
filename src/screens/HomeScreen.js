import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { videoService } from '../services/videoService';
import { learningService } from '../services/learningService';

// Thumbnail Card Component with error handling
function ThumbnailCard({ video, onPress }) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handlePress = () => {
    console.log('👆 ThumbnailCard TouchableOpacity pressed!');
    if (onPress) {
      console.log('📞 Calling onPress handler...');
      onPress();
    } else {
      console.error('❌ ThumbnailCard: onPress handler is missing!');
    }
  };

  return (
    <TouchableOpacity
      style={styles.featuredCard}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.featuredThumbnailContainer}>
        {imageLoading && !imageError && (
          <View style={styles.imageLoader}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        )}
        {imageError ? (
          <View style={[styles.featuredThumbnail, styles.imageErrorContainer]}>
            <Text style={styles.imageErrorIcon}>🎬</Text>
            <Text style={styles.imageErrorText}>Video</Text>
          </View>
        ) : (
          <Image
            source={{ uri: video.thumbnail }}
            style={styles.featuredThumbnail}
            onError={handleImageError}
            onLoad={handleImageLoad}
            resizeMode="cover"
            pointerEvents="none"
          />
        )}
      </View>
      <Text style={styles.featuredTitle}>{video.title}</Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }) {
  console.log('🏠 HomeScreen rendered, navigation:', navigation ? 'exists' : 'missing');
  
  useEffect(() => {
    console.log('🏠 HomeScreen mounted');
    if (!navigation) {
      console.error('❌ HomeScreen: navigation prop is missing!');
    }
  }, [navigation]);

  const videoCategories = videoService.getAllCategories();
  const learningCategories = learningService.getLearningCategories();

  const featuredVideos = [
    {
      id: 'f1',
      title: 'Funny Kids Adventure',
      thumbnail: 'https://picsum.photos/400/300?random=1',
      category: 'funny',
    },
    {
      id: 'f2',
      title: 'Cocomelon Fun Time',
      thumbnail: 'https://picsum.photos/400/300?random=2',
      category: 'cocomelon',
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={[colors.primary, colors.primaryLight]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>👶 Kids Learning App</Text>
        <Text style={styles.headerSubtitle}>Fun & Educational Content</Text>
      </LinearGradient>

      {/* Featured Videos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🌟 Featured Videos</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {featuredVideos.map((video) => (
            <ThumbnailCard
              key={video.id}
              video={video}
              onPress={() => {
                console.log('🎬 ThumbnailCard onPress handler called! Video:', video.title, 'Category:', video.category);
                console.log('📍 Navigation object:', navigation ? 'exists' : 'missing');
                console.log('📍 Navigation methods:', navigation ? Object.keys(navigation) : 'N/A');
                
                if (!navigation) {
                  console.error('❌ Cannot navigate: navigation object is missing!');
                  return;
                }

                try {
                  console.log('🚀 Attempting to navigate to Videos with category:', video.category);
                  // Try using navigate first
                  if (navigation.navigate) {
                    navigation.navigate('Videos', { category: video.category });
                    console.log('✅ navigation.navigate() called successfully');
                  } else {
                    console.error('❌ navigation.navigate is not a function!');
                  }
                } catch (error) {
                  console.error('❌ Navigation error:', error);
                  console.error('Error stack:', error.stack);
                }
              }}
            />
          ))}
        </ScrollView>
      </View>

      {/* Video Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎬 Watch Videos</Text>
        <View style={styles.grid}>
          {videoCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[styles.categoryCard, { backgroundColor: colors.primaryLight }]}
              onPress={() => navigation.navigate('Videos', { category: category.id })}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={styles.categoryName}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Learning Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📚 Learn & Play</Text>
        <View style={styles.grid}>
          {learningCategories.slice(0, 4).map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[styles.categoryCard, { backgroundColor: category.color + '30' }]}
              onPress={() => navigation.navigate('LearningDetail', { categoryId: category.id })}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={styles.categoryName}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          style={styles.seeMoreButton}
          onPress={() => navigation.navigate('Learn')}
        >
          <Text style={styles.seeMoreText}>See All Learning Topics →</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  header: {
    padding: 30,
    paddingTop: 50,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.white,
    opacity: 0.9,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 15,
  },
  horizontalScroll: {
    marginHorizontal: -5,
  },
  featuredCard: {
    width: 280,
    marginRight: 15,
    backgroundColor: colors.white,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  featuredThumbnailContainer: {
    width: '100%',
    height: 180,
    backgroundColor: colors.lightGray,
    position: 'relative',
    overflow: 'hidden',
  },
  featuredThumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.lightGray,
  },
  imageLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
  },
  imageErrorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
  },
  imageErrorIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  imageErrorText: {
    fontSize: 14,
    color: colors.textDark,
    fontWeight: '600',
  },
  featuredTitle: {
    padding: 15,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textDark,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  categoryIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textDark,
    textAlign: 'center',
  },
  seeMoreButton: {
    marginTop: 10,
    padding: 15,
    alignItems: 'center',
  },
  seeMoreText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
});

