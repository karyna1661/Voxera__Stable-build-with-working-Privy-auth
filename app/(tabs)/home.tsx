import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTrendingResponses } from '@/hooks/use-surveys';
import { VoiceResponseCard } from '@/components/VoiceResponseCard';
import { RecordButton } from '@/components/RecordButton';
import { GridBackground } from '@/components/GridBackground';
import { DemoVideo, VoiceResponse } from '@/types/survey';
import { PrivySignInButton, useAuth } from '@/providers/auth';
import { X, Play, MessageCircle, TrendingUp, Repeat } from 'lucide-react-native';
import { mockDemoVideos, mockVoiceResponses } from '@/mocks/surveys';
import { router } from 'expo-router';

type FeedItem = {
  id: string;
  type: 'demo' | 'response';
  data: DemoVideo | VoiceResponse;
};

export default function HomeScreen() {
  const { isLoading, refetch } = useTrendingResponses();
  const insets = useSafeAreaInsets();

  // Combine demo videos and voice responses for the feed
  const feedItems: FeedItem[] = React.useMemo(() => {
    const demoItems: FeedItem[] = mockDemoVideos.map(demo => ({
      id: `demo-${demo.id}`,
      type: 'demo' as const,
      data: demo
    }));
    
    const responseItems: FeedItem[] = mockVoiceResponses.map(response => ({
      id: `response-${response.id}`,
      type: 'response' as const,
      data: response
    }));
    
    // Interleave demos and responses for a mixed feed
    const combined = [...demoItems, ...responseItems];
    return combined.sort(() => Math.random() - 0.5); // Simple shuffle
  }, []);

  const renderFeedItem = ({ item }: { item: FeedItem }) => {
    if (item.type === 'demo') {
      return <DemoVideoCard demo={item.data as DemoVideo} />;
    } else {
      return <VoiceResponseCard response={item.data as VoiceResponse} showSurveyLink={true} />;
    }
  };

  const { isAuthenticated, user } = useAuth();
  const [showWelcome, setShowWelcome] = useState<boolean>(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      setShowWelcome(true);
      const timeout = setTimeout(() => {
        setShowWelcome(false);
      }, 3000);
      return () => clearTimeout(timeout);
    } else {
      setShowWelcome(false);
    }
  }, [isAuthenticated, user]);

  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: insets.top + 24 }]} testID="home-header">

      {/* Header with title and sign in aligned */}
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>For You</Text>
        </View>
        <View style={styles.signInContainer}>
          <PrivySignInButton compact={true} />
        </View>
      </View>
      
      <Text style={styles.subtitle}>Demo videos and voice feedback from the community</Text>
      
      {/* Welcome message for authenticated users */}
      {isAuthenticated && user && showWelcome && (
        <View style={styles.welcomeSection} testID="welcome-banner">
          <View style={styles.welcomeRow}>
            <Text style={styles.welcomeText}>Welcome back, {user?.farcaster?.displayName ?? (user?.farcaster?.username ? `@${user.farcaster.username}` : `${user.address.slice(0, 6)}...${user.address.slice(-4)}`)}!</Text>
            <TouchableOpacity
              accessibilityRole="button"
              testID="welcome-dismiss"
              onPress={() => setShowWelcome(false)}
              style={styles.dismissButton}
            >
              <X size={16} color="#065f46" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>No content yet</Text>
      <Text style={styles.emptySubtext}>Be the first to upload a demo or share your voice</Text>
    </View>
  );

  return (
    <GridBackground style={styles.container}>
      <FlatList
        data={feedItems}
        renderItem={renderFeedItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onRefresh={refetch}
        refreshing={isLoading}
      />
      <RecordButton />
    </GridBackground>
  );
}

// Demo Video Card Component
function DemoVideoCard({ demo }: { demo: DemoVideo }) {
  const handlePress = () => {
    // router.push(`/demo/${demo.id}`);
    console.log('Demo pressed:', demo.id);
  };

  const handleFeedbackPress = () => {
    // router.push(`/vault/${demo.feedbackVaultId}`);
    console.log('Feedback pressed:', demo.feedbackVaultId);
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
          <View style={demoStyles.resonanceScore}>
            <TrendingUp size={14} color="#10b981" strokeWidth={1.5} />
            <Text style={demoStyles.resonanceText}>{demo.resonanceScore}</Text>
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
            <MessageCircle size={16} color="#6366f1" strokeWidth={1.5} />
            <Text style={demoStyles.feedbackText}>{demo.responseCount} voice responses</Text>
          </TouchableOpacity>
          
          <View style={demoStyles.actions}>
            <TouchableOpacity 
              style={demoStyles.actionButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <TrendingUp size={16} color="#6b7280" strokeWidth={1.5} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={demoStyles.actionButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Repeat size={16} color="#6b7280" strokeWidth={1.5} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={demoStyles.actionButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={16} color="#6b7280" strokeWidth={1.5} />
            </TouchableOpacity>
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
    aspectRatio: 16 / 8.5,
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
    marginBottom: 8,
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
    fontSize: 14,
    fontWeight: '500',
    color: '#6366f1',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
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
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  welcomeSection: {
    marginTop: 16,
    padding: 16,
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#34d399',
  },
  welcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  dismissButton: {
    padding: 6,
    borderRadius: 8,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    flex: 1,
  },
});