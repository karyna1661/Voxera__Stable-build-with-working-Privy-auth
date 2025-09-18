import React from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Image, Platform } from 'react-native';
import { spacing, fontScale, scale, radius } from '@/lib/responsive';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Mic, TrendingUp, Repeat, X, Play } from 'lucide-react-native';
import { useResonanceInteraction } from '@/hooks/use-surveys';
import { VoiceResponseCard } from '@/components/VoiceResponseCard';
import { GridBackground } from '@/components/GridBackground';
import { useAuth } from '@/providers/auth';
import { mockDemoVideos, mockFeedbackVaults, mockVoiceResponses } from '@/mocks/surveys';

export default function DemoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const resonanceMutation = useResonanceInteraction();
  const { isAuthenticated, user } = useAuth();

  // Find the demo video
  const demo = mockDemoVideos.find(d => d.id === id);
  
  // Find the associated feedback vault
  const vault = demo ? mockFeedbackVaults.find(v => v.demoVideoId === demo.id) : null;
  
  // Find responses for this vault
  const responses = vault ? mockVoiceResponses.filter(r => r.vaultId === vault.id) : [];

  const handleBack = () => {
    router.back();
  };

  const handleResonance = (type: 'boost' | 'echo' | 'mute') => {
    if (!demo) return;
    
    if (!isAuthenticated || !user) {
      console.log('Please sign in to interact with demos');
      return;
    }
    
    resonanceMutation.mutate({
      type,
      targetId: demo.id,
      targetType: 'demo',
      userId: user.id,
    });
  };

  const handleRecord = () => {
    if (!isAuthenticated) {
      if (Platform.OS === 'web') {
        alert('Please sign in to record a response');
      } else {
        console.log('Authentication required to record response');
      }
      return;
    }
    if (vault) {
      router.push(`/record?vaultId=${vault.id}`);
    }
  };

  const handlePlayDemo = () => {
    console.log('Play demo video:', demo?.videoUrl);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!demo) {
    return (
      <GridBackground>
        <SafeAreaView style={styles.container}>
          <View style={styles.error}>
            <Text style={styles.errorText}>Demo not found</Text>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </GridBackground>
    );
  }

  return (
    <GridBackground>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Demo Header */}
          <View style={styles.pageHeader}>
            <Text style={styles.pageTitle}>Demo</Text>
          </View>
          
          <View style={styles.demoCard}>
            {/* Video Section */}
            <TouchableOpacity onPress={handlePlayDemo} style={styles.videoContainer}>
              <Image source={{ uri: demo.thumbnailUrl || demo.videoUrl }} style={styles.thumbnail} />
              <View style={styles.playOverlay}>
                <View style={styles.playButton}>
                  <Play size={32} color="#ffffff" fill="#ffffff" />
                </View>
              </View>
              <View style={styles.durationBadge}>
                <Text style={styles.durationText}>{formatDuration(demo.duration)}</Text>
              </View>
            </TouchableOpacity>
            
            {/* Demo Header */}
            <View style={styles.demoHeader}>
              <View style={styles.creatorInfo}>
                <Image source={{ uri: demo.creator.avatar }} style={styles.avatar} />
                <View style={styles.creatorText}>
                  <Text style={styles.creatorName}>{demo.creator.name}</Text>
                  <Text style={styles.timeAgo}>{formatTimeAgo(demo.createdAt)}</Text>
                </View>
              </View>
              <View style={styles.resonanceScore}>
                <TrendingUp size={16} color="#10b981" strokeWidth={1.5} />
                <Text style={styles.scoreText}>{demo.resonanceScore}</Text>
              </View>
            </View>
            
            <Text style={styles.title}>{demo.title}</Text>
            <Text style={styles.description}>{demo.description}</Text>
            

            
            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={() => handleResonance('boost')}
              >
                <TrendingUp size={18} color="#6b7280" strokeWidth={1.5} />
                <Text style={styles.actionText}>Boost</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={() => handleResonance('echo')}
              >
                <Repeat size={18} color="#6b7280" strokeWidth={1.5} />
                <Text style={styles.actionText}>Echo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={() => handleResonance('mute')}
              >
                <X size={18} color="#6b7280" strokeWidth={1.5} />
                <Text style={styles.actionText}>Mute</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.recordButton} onPress={handleRecord}>
            <Mic size={20} color="#ffffff" />
            <Text style={styles.recordButtonText}>Record Response</Text>
          </TouchableOpacity>

          <View style={styles.responsesSection}>
            <TouchableOpacity style={styles.responsesHeader} onPress={() => {
              router.push(`/demo/${demo.id}`);
            }}>
              <Text style={styles.responsesTitle}>
                Responses ({responses.length})
              </Text>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
            
            {responses.length === 0 ? (
              <View style={styles.noResponses}>
                <Text style={styles.noResponsesText}>No responses yet</Text>
                <Text style={styles.noResponsesSubtext}>Be the first to share your voice</Text>
              </View>
            ) : (
              responses.map((response) => (
                <VoiceResponseCard key={response.id} response={response} showSurveyLink={false} />
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </GridBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    paddingBottom: spacing(32),
    paddingTop: spacing(8),
  },
  error: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#1f2937',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  demoCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: spacing(16),
    marginVertical: spacing(12),
    borderRadius: radius(16),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 0,
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
    width: scale(64),
    height: scale(64),
    borderRadius: radius(32),
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: spacing(10),
    right: spacing(10),
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: spacing(10),
    paddingVertical: spacing(6),
    borderRadius: radius(6),
  },
  durationText: {
    color: '#ffffff',
    fontSize: fontScale(14),
    fontWeight: '600',
  },
  demoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing(16),
    paddingTop: spacing(16),
    paddingBottom: spacing(12),
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: scale(36),
    height: scale(36),
    borderRadius: radius(18),
    marginRight: spacing(10),
  },
  creatorText: {
    flex: 1,
  },
  creatorName: {
    fontSize: fontScale(16),
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: spacing(2),
  },
  timeAgo: {
    fontSize: fontScale(13),
    color: '#6b7280',
  },
  resonanceScore: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: spacing(10),
    paddingVertical: spacing(6),
    borderRadius: radius(8),
    gap: 4,
  },
  scoreText: {
    fontSize: fontScale(14),
    fontWeight: '600',
    color: '#10b981',
  },
  title: {
    fontSize: fontScale(22),
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: spacing(10),
    lineHeight: fontScale(28),
    letterSpacing: -0.5,
    paddingHorizontal: spacing(16),
  },
  description: {
    fontSize: fontScale(14),
    color: '#475569',
    lineHeight: fontScale(20),
    marginBottom: spacing(16),
    fontWeight: '500',
    paddingHorizontal: spacing(16),
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing(16),
    paddingTop: spacing(16),
    paddingBottom: spacing(16),
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: spacing(10),
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing(12),
    paddingVertical: spacing(10),
    borderRadius: radius(12),
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minWidth: scale(84),
  },
  actionText: {
    fontSize: fontScale(14),
    color: '#6b7280',
    marginLeft: 6,
    fontWeight: '500',
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
    marginHorizontal: spacing(16),
    paddingVertical: spacing(14),
    borderRadius: radius(12),
    marginBottom: spacing(28),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  recordButtonText: {
    color: '#ffffff',
    fontSize: fontScale(16),
    fontWeight: '600',
    marginLeft: spacing(8),
  },
  responsesSection: {
    paddingTop: 16,
  },
  responsesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing(16),
    marginBottom: spacing(14),
  },
  responsesTitle: {
    fontSize: fontScale(16),
    fontWeight: '700',
    color: '#111827',
  },
  viewAllText: {
    fontSize: fontScale(14),
    color: '#6366f1',
    fontWeight: '500',
  },
  noResponses: {
    alignItems: 'center',
    paddingVertical: spacing(40),
    paddingHorizontal: spacing(20),
  },
  noResponsesText: {
    fontSize: fontScale(16),
    fontWeight: '600',
    color: '#374151',
    marginBottom: spacing(8),
  },
  noResponsesSubtext: {
    fontSize: fontScale(14),
    color: '#6b7280',
    textAlign: 'center',
  },
  pageHeader: {
    paddingHorizontal: spacing(20),
    paddingTop: spacing(14),
    paddingBottom: spacing(8),
  },
  pageTitle: {
    fontSize: fontScale(28),
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
});