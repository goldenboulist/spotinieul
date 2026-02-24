import { useMusic } from '@/contexts/music-context';
import { useAppColors, useThemeColors } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function HomeScreen() {
  const { songs, playlists, playbackState, playSong, playPlaylist, getSongById } = useMusic();
  const colors = useAppColors();
  const themeColors = useThemeColors();
  const router = useRouter();

  const recentSongs = songs.slice(-5).reverse();
  const recentPlaylists = playlists.slice(-3).reverse();

  const handlePlaySong = (song: any) => {
    playSong(song, songs, songs.indexOf(song));
    router.push('/player' as any);
  };

  const handlePlayPlaylist = (playlist: any) => {
    if (playlist.songs.length > 0) {
      playPlaylist(playlist);
      router.push('/player' as any);
    }
  };

  const getPlaylistCover = (playlist: any) => {
    if (playlist.songs.length === 0) return null;
    const firstSong = getSongById(playlist.songs[0]);
    return firstSong?.albumArt;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Welcome Back
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.icon }]}>
            {songs.length} songs • {playlists.length} playlists
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickActionCard, { backgroundColor: colors.icon + '15' }]}
            onPress={() => router.push('/library')}
          >
            <Ionicons name="musical-notes" size={32} color={themeColors.primary} />
            <Text style={[styles.quickActionText, { color: colors.text }]}>
              My Library
            </Text>
            <Text style={[styles.quickActionCount, { color: colors.icon }]}>
              {songs.length} songs
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionCard, { backgroundColor: colors.icon + '15' }]}
            onPress={() => router.push('/playlists')}
          >
            <Ionicons name="list" size={32} color={themeColors.primary} />
            <Text style={[styles.quickActionText, { color: colors.text }]}>
              Playlists
            </Text>
            <Text style={[styles.quickActionCount, { color: colors.icon }]}>
              {playlists.length} playlists
            </Text>
          </TouchableOpacity>
        </View>

        {/* Recently Added Songs */}
        {recentSongs.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Recently Added
              </Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/library')}>
                <Text style={[styles.seeAll, { color: themeColors.primary }]}>See All</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            >
              {recentSongs.map((song) => (
                <TouchableOpacity
                  key={song.id}
                  style={styles.songCard}
                  onPress={() => handlePlaySong(song)}
                >
                  <View style={styles.songCardImageContainer}>
                    {song.albumArt ? (
                      <Image source={{ uri: song.albumArt }} style={styles.songCardImage} />
                    ) : (
                      <View style={[styles.songCardPlaceholder, { backgroundColor: colors.icon + '15' }]}>
                        <Ionicons name="musical-notes" size={40} color={themeColors.primary} />
                      </View>
                    )}
                    <View style={styles.songCardPlayOverlay}>
                      <Ionicons name="play-circle" size={40} color={themeColors.primary} />
                    </View>
                  </View>
                  <Text style={[styles.songCardTitle, { color: colors.text }]} numberOfLines={2}>
                    {song.title}
                  </Text>
                  <Text style={[styles.songCardArtist, { color: colors.icon }]} numberOfLines={1}>
                    {song.artist}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Recent Playlists */}
        {recentPlaylists.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Your Playlists
              </Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/playlists')}>
                <Text style={[styles.seeAll, { color: themeColors.primary }]}>See All</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.playlistList}>
              {recentPlaylists.map((playlist) => {
                const coverArt = getPlaylistCover(playlist);
                return (
                  <TouchableOpacity
                    key={playlist.id}
                    style={[styles.playlistRow, { backgroundColor: colors.icon + '10' }]}
                    onPress={() => router.push(`/playlist/${playlist.id}` as any)}
                  >
                    {coverArt ? (
                      <Image source={{ uri: coverArt }} style={styles.playlistRowImage} />
                    ) : (
                      <View style={[styles.playlistRowPlaceholder, { backgroundColor: colors.icon + '30' }]}>
                        <Ionicons name="list" size={24} color={themeColors.primary} />
                      </View>
                    )}
                    <View style={styles.playlistRowInfo}>
                      <Text style={[styles.playlistRowTitle, { color: colors.text }]} numberOfLines={1}>
                        {playlist.name}
                      </Text>
                      <Text style={[styles.playlistRowCount, { color: colors.icon }]}>
                        {playlist.songs.length} songs
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        handlePlayPlaylist(playlist);
                      }}
                      style={styles.playlistPlayButton}
                    >
                      <Ionicons name="play-circle" size={40} color={themeColors.primary} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Empty State */}
        {songs.length === 0 && playlists.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="musical-notes-outline" size={80} color={colors.icon} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Start Your Music Journey
            </Text>
            <Text style={[styles.emptyText, { color: colors.icon }]}>
              Upload your first song or create a playlist to get started
            </Text>
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: themeColors.primary }]}
              onPress={() => router.push('/(tabs)/library')}
            >
              <Text style={styles.emptyButtonText}>Add Songs</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 140,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  quickActionCard: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  quickActionCount: {
    fontSize: 14,
    marginTop: 4,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    // color will be set dynamically
  },
  horizontalList: {
    paddingHorizontal: 16,
    gap: 16,
  },
  songCard: {
    width: 140,
  },
  songCardImageContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  songCardImage: {
    width: 140,
    height: 140,
    borderRadius: 8,
  },
  songCardPlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  songCardPlayOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0)',
    borderRadius: 20,
  },
  songCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  songCardArtist: {
    fontSize: 12,
  },
  playlistList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  playlistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  playlistRowImage: {
    width: 56,
    height: 56,
    borderRadius: 4,
  },
  playlistRowPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playlistRowInfo: {
    flex: 1,
    marginLeft: 12,
  },
  playlistRowTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  playlistRowCount: {
    fontSize: 13,
  },
  playlistPlayButton: {
    padding: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  emptyButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 24,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
