import { useMusic } from '@/contexts/music-context';
import { useAppColors, useThemeColors } from '@/hooks/use-theme-color';
import type { Song } from '@/types/music';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function LibraryScreen() {
  const { songs, addSong, deleteSong, playSong } = useMusic();
  const colors = useAppColors();
  const themeColors = useThemeColors();

  const [isUploading, setIsUploading] = useState(false);
  const [showMetadataModal, setShowMetadataModal] = useState(false);
  const [tempFileUri, setTempFileUri] = useState('');
  const [metadata, setMetadata] = useState({
    title: '',
    artist: '',
    album: '',
  });

  const pickAudioFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      
      // Extract filename without extension for default title
      const fileName = file.name.replace(/\.[^/.]+$/, '');
      
      setTempFileUri(file.uri);
      setMetadata({
        title: fileName,
        artist: 'Unknown Artist',
        album: '',
      });
      setShowMetadataModal(true);
    } catch (error) {
      console.error('Error picking file:', error);
      Alert.alert('Error', 'Failed to pick audio file');
    }
  };

  const saveAudioFile = async () => {
    if (!tempFileUri || !metadata.title) {
      Alert.alert('Error', 'Please provide at least a title');
      return;
    }

    setIsUploading(true);
    try {
      // Create a permanent location for the file
      const fileExtension = tempFileUri.split('.').pop();
      const fileName = `${Date.now()}.${fileExtension}`;
      const permanentUri = `${FileSystem.documentDirectory}${fileName}`;

      // Copy file to permanent location
      await FileSystem.copyAsync({
        from: tempFileUri,
        to: permanentUri,
      });

      // Get file info for duration (simplified - in production, use a library like expo-av)
      const fileInfo = await FileSystem.getInfoAsync(permanentUri);
      
      const newSong: Song = {
        id: Date.now().toString(),
        title: metadata.title,
        artist: metadata.artist,
        album: metadata.album,
        duration: 0, // Would need audio metadata parsing
        uri: permanentUri,
        addedAt: Date.now(),
      };

      await addSong(newSong);
      
      setShowMetadataModal(false);
      setTempFileUri('');
      setMetadata({ title: '', artist: '', album: '' });
    } catch (error) {
      console.error('Error saving file:', error);
      Alert.alert('Error', 'Failed to save audio file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteSong = (song: Song) => {
    Alert.alert(
      'Delete Song',
      `Are you sure you want to delete "${song.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete the file
              await FileSystem.deleteAsync(song.uri, { idempotent: true });
              await deleteSong(song.id);
            } catch (error) {
              console.error('Error deleting song:', error);
              Alert.alert('Error', 'Failed to delete song');
            }
          },
        },
      ]
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderSongItem = ({ item }: { item: Song }) => (
    <View style={[styles.songItem, { backgroundColor: colors.background }]}>
      {item.albumArt ? (
        <Image source={{ uri: item.albumArt }} style={styles.albumArt} />
      ) : (
        <View style={[styles.albumArtPlaceholder, { backgroundColor: colors.icon + '30' }]}>
          <Ionicons name="musical-notes" size={24} color={colors.icon} />
        </View>
      )}

      <TouchableOpacity
        style={styles.songInfo}
        onPress={() => playSong(item, songs, songs.indexOf(item))}
      >
        <Text style={[styles.songTitle, { color: colors.text }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[styles.songArtist, { color: colors.icon }]} numberOfLines={1}>
          {item.artist}
        </Text>
      </TouchableOpacity>

      <Text style={[styles.duration, { color: colors.icon }]}>
        {formatTime(item.duration)}
      </Text>

      <TouchableOpacity
        onPress={() => playSong(item, songs, songs.indexOf(item))}
        style={styles.playButton}
      >
        <Ionicons name="play-circle" size={36} color={themeColors.primary} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={(e) => {
          e.stopPropagation();
          handleDeleteSong(item);
        }}
        style={styles.deleteButton}
      >
        <Ionicons name="trash" size={22} color="#E74C3C" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Library</Text>
        <TouchableOpacity
          onPress={pickAudioFile}
          style={[styles.addButton, { backgroundColor: themeColors.primary }]}
          disabled={isUploading}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Add Song</Text>
        </TouchableOpacity>
      </View>

      {songs.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="musical-notes-outline" size={64} color={colors.icon} />
          <Text style={[styles.emptyText, { color: colors.icon }]}>
            No songs in your library
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.icon }]}>
            Tap the + button to add songs
          </Text>
        </View>
      ) : (
        <FlatList
          data={songs}
          keyExtractor={(item) => item.id}
          renderItem={renderSongItem}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Metadata Modal */}
      <Modal
        visible={showMetadataModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMetadataModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Song Details</Text>

            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.icon }]}
              placeholder="Song Title"
              placeholderTextColor={colors.icon}
              value={metadata.title}
              onChangeText={(text) => setMetadata({ ...metadata, title: text })}
            />

            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.icon }]}
              placeholder="Artist"
              placeholderTextColor={colors.icon}
              value={metadata.artist}
              onChangeText={(text) => setMetadata({ ...metadata, artist: text })}
            />

            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.icon }]}
              placeholder="Album (Optional)"
              placeholderTextColor={colors.icon}
              value={metadata.album}
              onChangeText={(text) => setMetadata({ ...metadata, album: text })}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowMetadataModal(false);
                  setTempFileUri('');
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, { backgroundColor: themeColors.primary }]}
                onPress={saveAudioFile}
                disabled={isUploading}
              >
                <Text style={styles.buttonText}>
                  {isUploading ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    gap: 6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  albumArt: {
    width: 56,
    height: 56,
    borderRadius: 4,
  },
  albumArtPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  songInfo: {
    flex: 1,
    marginLeft: 12,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  songArtist: {
    fontSize: 14,
  },
  duration: {
    fontSize: 12,
    marginRight: 12,
    minWidth: 40,
  },
  playButton: {
    padding: 4,
    marginRight: 8,
  },
  deleteButton: {
    padding: 6,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    borderRadius: 12,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  saveButton: {
    // backgroundColor will be set dynamically
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
