import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DOWNLOADS_DIR = `${FileSystem.documentDirectory}downloads/`;
const DOWNLOADS_KEY = 'downloaded_videos';

// Mock API - Replace with your actual API endpoint
const API_BASE_URL = 'https://your-api.com/api/videos';

export const videoService = {
  // Get videos by category
  async getVideosByCategory(category) {
    try {
      // Mock data - Replace with actual API call
      const categories = {
        funny: [
          {
            id: '1',
            title: 'Funny Kids Video 1',
            thumbnail: 'https://via.placeholder.com/300x200?text=Funny+Video+1',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            duration: 120,
            category: 'funny',
          },
          {
            id: '2',
            title: 'Funny Kids Video 2',
            thumbnail: 'https://via.placeholder.com/300x200?text=Funny+Video+2',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            duration: 90,
            category: 'funny',
          },
        ],
        cartoons: [
          {
            id: '3',
            title: 'Cartoon Adventure',
            thumbnail: 'https://via.placeholder.com/300x200?text=Cartoon+1',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            duration: 150,
            category: 'cartoons',
          },
        ],
        poems: [
          {
            id: '4',
            title: 'ABC Song',
            thumbnail: 'https://via.placeholder.com/300x200?text=ABC+Song',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
            duration: 180,
            category: 'poems',
          },
        ],
        cocomelon: [
          {
            id: '5',
            title: 'Cocomelon Song',
            thumbnail: 'https://via.placeholder.com/300x200?text=Cocomelon',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
            duration: 200,
            category: 'cocomelon',
          },
        ],
      };

      return categories[category] || [];
    } catch (error) {
      console.error('Error fetching videos:', error);
      return [];
    }
  },

  // Get all video categories
  getAllCategories() {
    return [
      { id: 'funny', name: 'Funny Videos', icon: '😂' },
      { id: 'cartoons', name: 'Cartoons', icon: '🎨' },
      { id: 'poems', name: 'Poems & Songs', icon: '🎵' },
      { id: 'cocomelon', name: 'Cocomelon', icon: '🌟' },
    ];
  },

  // Download video for offline viewing
  async downloadVideo(video) {
    try {
      // Ensure downloads directory exists
      const dirInfo = await FileSystem.getInfoAsync(DOWNLOADS_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(DOWNLOADS_DIR, { intermediates: true });
      }

      // Create unique filename
      const fileExtension = video.url.split('.').pop().split('?')[0];
      const fileName = `${video.id}.${fileExtension}`;
      const fileUri = `${DOWNLOADS_DIR}${fileName}`;

      // Download the video
      const downloadResumable = FileSystem.createDownloadResumable(
        video.url,
        fileUri
      );

      const result = await downloadResumable.downloadAsync();

      if (result) {
        // Save video metadata
        const downloadedVideos = await this.getDownloadedVideos();
        downloadedVideos.push({
          ...video,
          localUri: result.uri,
          downloadedAt: new Date().toISOString(),
        });
        await AsyncStorage.setItem(DOWNLOADS_KEY, JSON.stringify(downloadedVideos));
        
        return { success: true, uri: result.uri };
      }

      return { success: false, error: 'Download failed' };
    } catch (error) {
      console.error('Error downloading video:', error);
      return { success: false, error: error.message };
    }
  },

  // Get all downloaded videos
  async getDownloadedVideos() {
    try {
      const data = await AsyncStorage.getItem(DOWNLOADS_KEY);
      if (data) {
        const videos = JSON.parse(data);
        // Verify files still exist
        const verifiedVideos = [];
        for (const video of videos) {
          if (video.localUri) {
            const fileInfo = await FileSystem.getInfoAsync(video.localUri);
            if (fileInfo.exists) {
              verifiedVideos.push(video);
            }
          }
        }
        // Update storage if some files were deleted
        if (verifiedVideos.length !== videos.length) {
          await AsyncStorage.setItem(DOWNLOADS_KEY, JSON.stringify(verifiedVideos));
        }
        return verifiedVideos;
      }
      return [];
    } catch (error) {
      console.error('Error getting downloaded videos:', error);
      return [];
    }
  },

  // Delete downloaded video
  async deleteDownloadedVideo(videoId) {
    try {
      const downloadedVideos = await this.getDownloadedVideos();
      const video = downloadedVideos.find(v => v.id === videoId);
      
      if (video && video.localUri) {
        await FileSystem.deleteAsync(video.localUri, { idempotent: true });
      }

      const updatedVideos = downloadedVideos.filter(v => v.id !== videoId);
      await AsyncStorage.setItem(DOWNLOADS_KEY, JSON.stringify(updatedVideos));
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting video:', error);
      return { success: false, error: error.message };
    }
  },

  // Check if video is downloaded
  async isVideoDownloaded(videoId) {
    const downloadedVideos = await this.getDownloadedVideos();
    return downloadedVideos.some(v => v.id === videoId);
  },
};


