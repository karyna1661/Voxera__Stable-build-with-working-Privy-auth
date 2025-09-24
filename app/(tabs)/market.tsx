import React from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GridBackground } from '@/components/GridBackground';
import { ThreeDHeading } from '@/components/ThreeDHeading';
import { PrivySignInButton } from '@/providers/auth';
import { Play, MessageCircle, TrendingUp, Upload, Repeat, X } from 'lucide-react-native';
import { mockDemoVideos } from '@/mocks/surveys';
import { DemoVideo } from '@/types/survey';
import { router } from 'expo-router';
import { scale, spacing, fontScale, radius } from '@/lib/responsive';

export default function MarketScreen() {
  const insets = useSafeAreaInsets();

  const renderDemo = ({ item }: { item: DemoVideo }) => (
    <DemoVideoCard demo={item} />
  );

  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: insets.top + 24 }]}>
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <ThreeDHeading title="Demo Market" textList={["Demo Market","For You","Trending","Launch","Products","Feedback"]} />
        </View>
        <View style={styles.signInContainer}>
          <PrivySignInButton compact={true} />
        </View>
      </View>
      <Text style={styles.subtitle}>Discover and share product demos</Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>No demos available</Text>
      <Text style={styles.emptySubtext}>Be the first to upload one</Text>
    </View>
  );

  const handleUploadDemo = () => {
    console.log('Upload demo pressed');
  };

  return (
    <GridBackground style={styles.container} testID="market-grid-bg">
      <FlatList
        data={mockDemoVideos}
        renderItem={renderDemo}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      />
      <TouchableOpacity style={styles.uploadButton} onPress={handleUploadDemo} testID="upload-demo-fab">
        <Upload size={24} color="#ffffff" />
      </TouchableOpacity>
    </GridBackground>
  );
}

function DemoVideoCard({ demo }: { demo: DemoVideo }) {
  const handlePress = () => {
    router.push(`/demo/${demo.id}`);
  };

  const handleFeedbackPress = () => {
    router.push(`/demo/${demo.id}`);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={cardStyles.container} testID="demo-video-card">
      <TouchableOpacity onPress={handlePress} style={cardStyles.videoContainer}>
        <Image source={{ uri: demo.thumbnailUrl || demo.videoUrl }} style={cardStyles.thumbnail} />
        <View style={cardStyles.playOverlay}>
          <View style={cardStyles.playButton}>
            <Play size={24} color="#ffffff" fill="#ffffff" />
          </View>
        </View>
        <View style={cardStyles.durationBadge}>
          <Text style={cardStyles.durationText}>{formatDuration(demo.duration)}</Text>
        </View>
      </TouchableOpacity>

      <View style={cardStyles.content}>
        <View style={cardStyles.header}>
          <Image source={{ uri: demo.creator.avatar }} style={cardStyles.avatar} />
          <View style={cardStyles.creatorInfo}>
            <Text style={cardStyles.creatorName}>{demo.creator.name}</Text>
            <Text style={cardStyles.timestamp}>{new Date(demo.createdAt).toLocaleDateString()}</Text>
          </View>
          <View style={cardStyles.resonanceScore}>
            <TrendingUp size={14} color="#10b981" strokeWidth={1.5} />
            <Text style={cardStyles.resonanceText}>{demo.resonanceScore}</Text>
          </View>
        </View>

        <Text style={cardStyles.title}>{demo.title}</Text>
        <Text style={cardStyles.description} numberOfLines={2}>{demo.description}</Text>

        {demo.tags && demo.tags.length > 0 && (
          <View style={cardStyles.tagsContainer}>
            {demo.tags.map((tag, index) => (
              <View key={`tag-${index}`} style={cardStyles.tag}>
                <Text style={cardStyles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={cardStyles.footer}>
          <TouchableOpacity style={cardStyles.feedbackButton} onPress={handleFeedbackPress}>
            <MessageCircle size={16} color="#6366f1" strokeWidth={1.5} />
            <Text style={cardStyles.feedbackText}>{demo.responseCount} voice responses</Text>
          </TouchableOpacity>

          <View style={cardStyles.actions}>
            <TouchableOpacity 
              style={cardStyles.actionButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              testID="demo-boost"
            >
              <TrendingUp size={16} color="#6b7280" strokeWidth={1.5} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={cardStyles.actionButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              testID="demo-echo"
            >
              <Repeat size={16} color="#6b7280" strokeWidth={1.5} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={cardStyles.actionButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              testID="demo-mute"
            >
              <X size={16} color="#6b7280" strokeWidth={1.5} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing(140),
  },
  header: {
    paddingHorizontal: spacing(24),
    paddingBottom: spacing(28),
  },
  title: {
    fontSize: fontScale(32),
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: fontScale(16),
    color: '#64748b',
    fontWeight: '500',
    lineHeight: 24,
  },
  empty: {
    alignItems: 'center',
    paddingTop: spacing(100),
    paddingHorizontal: spacing(24),
  },
  emptyText: {
    fontSize: fontScale(18),
    fontWeight: '700',
    color: '#334155',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: fontScale(14),
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
  },
  signInContainer: {
    alignItems: 'flex-end',
  },
  uploadButton: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

const cardStyles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: radius(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  videoContainer: {
    position: 'relative',
    aspectRatio: 16 / 9,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f3f4f6',
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  playButton: {
    width: scale(56),
    height: scale(56),
    borderRadius: radius(28),
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: spacing(8),
    right: spacing(8),
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: spacing(8),
    paddingVertical: spacing(4),
    borderRadius: radius(4),
  },
  durationText: {
    color: '#ffffff',
    fontSize: fontScale(12),
    fontWeight: '600',
  },
  content: {
    padding: spacing(14),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: scale(32),
    height: scale(32),
    borderRadius: radius(16),
    marginRight: spacing(10),
  },
  creatorInfo: { flex: 1 },
  creatorName: {
    fontSize: fontScale(14),
    fontWeight: '600',
    color: '#1f2937',
  },
  timestamp: {
    fontSize: fontScale(12),
    color: '#6b7280',
    marginTop: 2,
  },
  title: {
    fontSize: fontScale(18),
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
    lineHeight: 24,
  },
  description: {
    fontSize: fontScale(14),
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    marginTop: 4,
  },
  feedbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  feedbackText: {
    fontSize: fontScale(14),
    fontWeight: '500',
    color: '#6366f1',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing(12),
  },
  actionButton: {
    width: scale(42),
    height: scale(42),
    borderRadius: radius(12),
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  resonanceScore: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  resonanceText: {
    fontSize: fontScale(12),
    fontWeight: '600',
    color: '#10b981',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing(12),
  },
  tag: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: spacing(8),
    paddingVertical: spacing(4),
    borderRadius: radius(6),
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tagText: {
    fontSize: fontScale(12),
    color: '#64748b',
    fontWeight: '500',
  },
});
