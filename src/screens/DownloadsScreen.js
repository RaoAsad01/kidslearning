import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import { videoService } from '../services/videoService';
import VideoCard from '../components/VideoCard';

export default function DownloadsScreen({ navigation }) {
  const [downloadedVideos, setDownloadedVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDownloadedVideos();
    const unsubscribe = navigation.addListener('focus', () => {
      loadDownloadedVideos();
    });
    return unsubscribe;
  }, [navigation]);

  const loadDownloadedVideos = async () => {
    setLoading(true);
    try {
      const videos = await videoService.getDownloadedVideos();
      setDownloadedVideos(videos);
    } catch (error) {
      Alert.alert('Error', 'Failed to load downloaded videos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (videoId, videoTitle) => {
    Alert.alert(
      'Delete Video',
      `Are you sure you want to delete "${videoTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await videoService.deleteDownloadedVideo(videoId);
            if (result.success) {
              loadDownloadedVideos();
            } else {
              Alert.alert('Error', result.error);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⬇️ Downloads</Text>
        <Text style={styles.headerSubtitle}>Your offline videos</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : downloadedVideos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📥</Text>
          <Text style={styles.emptyTitle}>No Downloads Yet</Text>
          <Text style={styles.emptyText}>
            Videos you download will appear here for offline viewing
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.navigate('Videos')}
          >
            <Text style={styles.browseButtonText}>Browse Videos</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.videosGrid}>
            {downloadedVideos.map((video) => (
              <View key={video.id} style={styles.videoWrapper}>
                <VideoCard
                  video={video}
                  onPress={() => navigation.navigate('VideoPlayer', { video })}
                />
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(video.id, video.title)}
                >
                  <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
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
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textLight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 30,
  },
  browseButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  browseButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  videosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 15,
    justifyContent: 'space-between',
  },
  videoWrapper: {
    width: '48%',
    marginBottom: 15,
  },
  deleteButton: {
    marginTop: 5,
    padding: 8,
    backgroundColor: colors.error + '20',
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: colors.error,
    fontSize: 12,
    fontWeight: '600',
  },
});


