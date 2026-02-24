import { useMusic } from '@/contexts/music-context';
import { useAppColors, useThemeColors } from '@/hooks/use-theme-color';
import type { Playlist } from '@/types/music';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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

export default function PlaylistsScreen() {
  const { playlists, createPlaylist, deletePlaylist, playPlaylist, getSongById } = useMusic();
  const colors = useAppColors();
  const themeColors = useThemeColors();
  const router = useRouter();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      Alert.alert('Error', 'Please enter a playlist name');
      return;
    }

    await createPlaylist(newPlaylistName.trim(), newPlaylistDesc.trim() || undefined);
    setNewPlaylistName('');
    setNewPlaylistDesc('');
    setShowCreateModal(false);
  };

  const handleDeletePlaylist = (playlist: Playlist) => {
    Alert.alert(
      'Delete Playlist',
      `Are you sure you want to delete "${playlist.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deletePlaylist(playlist.id),
        },
      ]
    );
  };

  const handlePlayPlaylist = (playlist: Playlist) => {
    if (playlist.songs.length === 0) {
      Alert.alert('Empty Playlist', 'Add some songs to this playlist first');
      return;
    }
    playPlaylist(playlist);
    router.push('/player');
  };

  const getPlaylistCover = (playlist: Playlist) => {
    if (playlist.songs.length === 0) return null;
    const firstSong = getSongById(playlist.songs[0]);
    return firstSong?.albumArt;
  };

  const renderPlaylistItem = ({ item }: { item: Playlist }) => {
    const coverArt = getPlaylistCover(item);

    return (
      <View style={[styles.playlistItem, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={styles.playlistTouchable}
          onPress={() => router.push(`/playlist/${item.id}` as any)}
        >
          {coverArt ? (
            <Image source={{ uri: coverArt }} style={styles.coverArt} />
          ) : (
            <View style={[styles.coverArtPlaceholder, { backgroundColor: colors.icon + '30' }]}>
              <Ionicons name="list" size={32} color={colors.icon} />
            </View>
          )}

          <View style={styles.playlistInfo}>
            <Text style={[styles.playlistName, { color: colors.text }]} numberOfLines={1}>
              {item.name}
            </Text>
            {item.description && (
              <Text style={[styles.playlistDesc, { color: colors.icon }]} numberOfLines={1}>
                {item.description}
              </Text>
            )}
            <Text style={[styles.songCount, { color: colors.icon }]}>
              {item.songs.length} {item.songs.length === 1 ? 'song' : 'songs'}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            handlePlayPlaylist(item);
          }}
          style={styles.playButton}
        >
          <Ionicons name="play-circle" size={44} color={themeColors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            handleDeletePlaylist(item);
          }}
          style={styles.deleteButton}
        >
          <Ionicons name="trash" size={22} color="#E74C3C" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Playlists</Text>
        <TouchableOpacity
          onPress={() => setShowCreateModal(true)}
          style={[styles.addButton, { backgroundColor: themeColors.primary }]}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addButtonText}>New Playlist</Text>
        </TouchableOpacity>
      </View>

      {playlists.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="list-outline" size={64} color={colors.icon} />
          <Text style={[styles.emptyText, { color: colors.icon }]}>
            No playlists yet
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.icon }]}>
            Tap the + button to create your first playlist
          </Text>
        </View>
      ) : (
        <FlatList
          data={playlists}
          keyExtractor={(item) => item.id}
          renderItem={renderPlaylistItem}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Create Playlist Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Create Playlist
            </Text>

            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.icon }]}
              placeholder="Playlist Name"
              placeholderTextColor={colors.icon}
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
              autoFocus
            />

            <TextInput
              style={[styles.input, styles.textArea, { color: colors.text, borderColor: colors.icon }]}
              placeholder="Description (Optional)"
              placeholderTextColor={colors.icon}
              value={newPlaylistDesc}
              onChangeText={setNewPlaylistDesc}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowCreateModal(false);
                  setNewPlaylistName('');
                  setNewPlaylistDesc('');
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.createButton, { backgroundColor: themeColors.primary }]}
                onPress={handleCreatePlaylist}
              >
                <Text style={styles.buttonText}>Create</Text>
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
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  playlistTouchable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  coverArt: {
    width: 72,
    height: 72,
    borderRadius: 4,
  },
  coverArtPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playlistInfo: {
    flex: 1,
    marginLeft: 12,
  },
  playlistName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  playlistDesc: {
    fontSize: 14,
    marginBottom: 4,
  },
  songCount: {
    fontSize: 12,
  },
  playButton: {
    marginRight: 8,
    padding: 4,
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
    textAlign: 'center',
    paddingHorizontal: 32,
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
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
  createButton: {
    // backgroundColor will be set dynamically
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
