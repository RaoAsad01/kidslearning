import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import { videoService } from '../services/videoService';

export default function VideoCard({ video, onPress }) {
  const [downloaded, setDownloaded] = useState(false);
  const [downloading, setDownloading] = useState(false);

  React.useEffect(() => {
    checkDownloaded();
  }, []);

  const checkDownloaded = async () => {
    const isDownloaded = await videoService.isVideoDownloaded(video.id);
    setDownloaded(isDownloaded);
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    setDownloading(true);
    try {
      const result = await videoService.downloadVideo(video);
      if (result.success) {
        setDownloaded(true);
        alert('Video downloaded successfully!');
      } else {
        alert('Download failed: ' + result.error);
      }
    } catch (error) {
      alert('Error downloading video');
    } finally {
      setDownloading(false);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.thumbnailContainer}>
        <Image source={{ uri: video.thumbnail }} style={styles.thumbnail} />
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{formatDuration(video.duration)}</Text>
        </View>
        {downloaded && (
          <View style={styles.downloadedBadge}>
            <Text style={styles.downloadedText}>✓</Text>
          </View>
        )}
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{video.title}</Text>
        <TouchableOpacity
          style={styles.downloadButton}
          onPress={handleDownload}
          disabled={downloading || downloaded}
        >
          {downloading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : downloaded ? (
            <Text style={styles.downloadButtonText}>✓ Downloaded</Text>
          ) : (
            <Text style={styles.downloadButtonText}>⬇ Download</Text>
          )}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  thumbnailContainer: {
    position: 'relative',
    width: '100%',
    height: 120,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.lightGray,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  durationText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '600',
  },
  downloadedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.success,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadedText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: 8,
  },
  downloadButton: {
    paddingVertical: 6,
    alignItems: 'center',
  },
  downloadButtonText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
});


