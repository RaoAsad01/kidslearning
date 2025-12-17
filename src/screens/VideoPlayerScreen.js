import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { colors } from '../theme/colors';
import { useParentalControl } from '../context/ParentalControlContext';
import { videoService } from '../services/videoService';
// Using simple text icons instead of Ionicons

export default function VideoPlayerScreen({ route, navigation }) {
  const { video } = route.params;
  const { startSession, endSession } = useParentalControl();
  const [videoRef, setVideoRef] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [localUri, setLocalUri] = useState(null);

  useEffect(() => {
    startSession();
    checkDownloaded();

    return () => {
      endSession();
    };
  }, []);

  const checkDownloaded = async () => {
    const downloaded = await videoService.isVideoDownloaded(video.id);
    if (downloaded) {
      const downloadedVideos = await videoService.getDownloadedVideos();
      const downloadedVideo = downloadedVideos.find(v => v.id === video.id);
      if (downloadedVideo && downloadedVideo.localUri) {
        setLocalUri(downloadedVideo.localUri);
        setIsDownloaded(true);
      }
    }
  };

  const videoUri = isDownloaded && localUri ? localUri : video.url;

  const handleDownload = async () => {
    try {
      const result = await videoService.downloadVideo(video);
      if (result.success) {
        setIsDownloaded(true);
        Alert.alert('Success', 'Video downloaded for offline viewing!');
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to download video');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{video.title}</Text>
        <TouchableOpacity onPress={handleDownload} style={styles.downloadButton}>
          <Text style={styles.downloadButtonText}>{isDownloaded ? "✓" : "⬇"}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.videoContainer}>
        <Video
          ref={setVideoRef}
          source={{ uri: videoUri }}
          style={styles.video}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={isPlaying}
          isLooping
          useNativeControls
        />
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>{video.title}</Text>
        <Text style={styles.infoCategory}>Category: {video.category}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  backButton: {
    marginRight: 15,
    padding: 5,
  },
  backButtonText: {
    fontSize: 24,
    color: colors.white,
    fontWeight: 'bold',
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  downloadButton: {
    marginLeft: 10,
    padding: 5,
  },
  downloadButtonText: {
    fontSize: 24,
    color: colors.white,
    fontWeight: 'bold',
  },
  videoContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    padding: 20,
    backgroundColor: colors.white,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 5,
  },
  infoCategory: {
    fontSize: 14,
    color: colors.textLight,
    textTransform: 'capitalize',
  },
});

