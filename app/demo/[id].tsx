import React from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Mic, TrendingUp, Repeat, X, Play } from 'lucide-react-native';
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
        <View style={styles.header}>
          <TouchableOpacity style={styles.backIcon} onPress={handleBack}>
            <ArrowLeft size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Demo</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  backIcon: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  placeholder: {
    width: 32,
  },
  content: {
    paddingBottom: 32,
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
    margin: 24,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 0,
  },
  videoContainer: {
    position: 'relative',
    aspectRatio: 16 / 8,
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
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  durationText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  demoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 32,
    paddingBottom: 20,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  creatorText: {
    flex: 1,
  },
  creatorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  timeAgo: {
    fontSize: 13,
    color: '#6b7280',
  },
  resonanceScore: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 16,
    lineHeight: 36,
    letterSpacing: -0.5,
    paddingHorizontal: 32,
  },
  description: {
    fontSize: 18,
    color: '#475569',
    lineHeight: 28,
    marginBottom: 24,
    fontWeight: '500',
    paddingHorizontal: 32,
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 32,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minWidth: 80,
  },
  actionText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 6,
    fontWeight: '500',
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
    marginHorizontal: 24,
    paddingVertical: 20,
    borderRadius: 16,
    marginBottom: 48,
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
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  responsesSection: {
    paddingTop: 16,
  },
  responsesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  responsesTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  viewAllText: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
  },
  noResponses: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  noResponsesText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  noResponsesSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});