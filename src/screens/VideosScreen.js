import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { colors } from '../theme/colors';
import { videoService } from '../services/videoService';
import VideoCard from '../components/VideoCard';

export default function VideosScreen({ route, navigation }) {
  const selectedCategory = route?.params?.category || null;
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState(selectedCategory || 'funny');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('📺 VideosScreen mounted, route params:', route?.params);
    loadCategories();
    loadVideos(selectedCat);
  }, []);

  // Update selected category when route params change
  useEffect(() => {
    if (route?.params?.category && route.params.category !== selectedCat) {
      console.log('🔄 Route params changed, updating category to:', route.params.category);
      setSelectedCat(route.params.category);
    }
  }, [route?.params?.category]);

  useEffect(() => {
    console.log('📹 Loading videos for category:', selectedCat);
    loadVideos(selectedCat);
  }, [selectedCat]);

  const loadCategories = () => {
    const cats = videoService.getAllCategories();
    setCategories(cats);
  };

  const loadVideos = async (category) => {
    console.log('🔄 loadVideos called with category:', category);
    setLoading(true);
    try {
      const videosData = await videoService.getVideosByCategory(category);
      console.log('✅ Videos loaded:', videosData.length, 'videos');
      setVideos(videosData);
    } catch (error) {
      console.error('❌ Error loading videos:', error);
      Alert.alert('Error', 'Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎬 Kids Videos</Text>
      </View>

      {/* Category Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryTabs}
        contentContainerStyle={styles.categoryTabsContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryTab,
              selectedCat === category.id && styles.categoryTabActive,
            ]}
            onPress={() => setSelectedCat(category.id)}
          >
            <Text style={[
              styles.categoryTabText,
              selectedCat === category.id && styles.categoryTabTextActive,
            ]}>
              {category.icon} {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Videos Grid */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView style={styles.videosContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.videosGrid}>
            {videos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onPress={() => navigation.navigate('VideoPlayer', { video })}
              />
            ))}
          </View>
          {videos.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No videos available</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  header: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textDark,
  },
  categoryTabs: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  categoryTabsContent: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  categoryTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: colors.lightGray,
  },
  categoryTabActive: {
    backgroundColor: colors.primary,
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textDark,
  },
  categoryTabTextActive: {
    color: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videosContainer: {
    flex: 1,
  },
  videosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 15,
    justifyContent: 'space-between',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textLight,
  },
});


