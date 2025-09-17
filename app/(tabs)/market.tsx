import React from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSurveys } from '@/hooks/use-surveys';
import { SurveyCard } from '@/components/SurveyCard';
import { RecordButton } from '@/components/RecordButton';
import { DemoVideo } from '@/types/survey';
import { PrivySignInButton } from '@/providers/auth';
import { Play, MessageCircle, TrendingUp, Upload } from 'lucide-react-native';
import { mockDemoVideos } from '@/mocks/surveys';
import { router } from 'expo-router';

export default function MarketScreen() {
  const { data: surveys, isLoading, refetch } = useSurveys('newest');
  const insets = useSafeAreaInsets();

  const renderDemo = ({ item }: { item: DemoVideo }) => (
    <DemoVideoCard demo={item} />
  );

  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: insets.top + 24 }]}>
      {/* Header with title and sign in aligned */}
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Demo Market</Text>
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
    router.push('/upload-demo');
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={mockDemoVideos}
        renderItem={renderDemo}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onRefresh={refetch}
        refreshing={isLoading}
      />
      <TouchableOpacity style={styles.uploadButton} onPress={handleUploadDemo}>
        <Upload size={24} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
}

// Demo Video Card Component
function DemoVideoCard({ demo }: { demo: DemoVideo }) {
  const handlePress = () => {
    router.push(`/demo/${demo.id}`);
  };

  const handleFeedbackPress = () => {
    router.push(`/vault/${demo.feedbackVaultId}`);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={demoStyles.container}>
      <TouchableOpacity onPress={handlePress} style={demoStyles.videoContainer}>
        <Image source={{ uri: demo.thumbnailUrl || demo.videoUrl }} style={demoStyles.thumbnail} />
        <View style={demoStyles.playOverlay}>
          <View style={demoStyles.playButton}>
            <Play size={24} color="#ffffff" fill="#ffffff" />
          </View>
        </View>
        <View style={demoStyles.durationBadge}>
          <Text style={demoStyles.durationText}>{formatDuration(demo.duration)}</Text>
        </View>
      </TouchableOpacity>
      
      <View style={demoStyles.content}>
        <View style={demoStyles.header}>
          <Image source={{ uri: demo.creator.avatar }} style={demoStyles.avatar} />
          <View style={demoStyles.creatorInfo}>
            <Text style={demoStyles.creatorName}>{demo.creator.name}</Text>
            <Text style={demoStyles.timestamp}>{new Date(demo.createdAt).toLocaleDateString()}</Text>
          </View>
          <View style={demoStyles.categoryBadge}>
            <Text style={demoStyles.categoryText}>{demo.category}</Text>
          </View>
        </View>
        
        <Text style={demoStyles.title}>{demo.title}</Text>
        <Text style={demoStyles.description} numberOfLines={2}>{demo.description}</Text>
        
        <View style={demoStyles.tags}>
          {demo.tags.slice(0, 3).map((tag: string, index: number) => (
            <View key={`${demo.id}-tag-${tag}`} style={demoStyles.tag}>
              <Text style={demoStyles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
        
        <View style={demoStyles.footer}>
          <TouchableOpacity style={demoStyles.feedbackButton} onPress={handleFeedbackPress}>
            <MessageCircle size={16} color="#6366f1" />
            <Text style={demoStyles.feedbackText}>{demo.responseCount} voice responses</Text>
          </TouchableOpacity>
          
          <View style={demoStyles.resonanceScore}>
            <TrendingUp size={16} color="#10b981" />
            <Text style={demoStyles.resonanceText}>{demo.resonanceScore}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const demoStyles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  durationText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  creatorInfo: {
    flex: 1,
  },
  creatorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  timestamp: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  categoryBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
    lineHeight: 24,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  tag: {
    backgroundColor: '#ede9fe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#7c3aed',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  feedbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  feedbackText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6366f1',
  },
  resonanceScore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resonanceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    paddingBottom: 160,
  },
  header: {
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    color: '#64748b',
    fontWeight: '500',
    lineHeight: 24,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 120,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
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
    bottom: 100,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366f1',
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