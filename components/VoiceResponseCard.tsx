import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { scale, fontScale, spacing, radius } from '@/lib/responsive';
import { VoiceResponse } from '@/types/survey';
import { Play, Pause, TrendingUp, Repeat, X, MessageSquare } from 'lucide-react-native';
import { useAudioPlayer } from '@/hooks/use-audio-player';
import { useResonanceInteraction } from '@/hooks/use-surveys';
import { router } from 'expo-router';
import { useAuth } from '@/providers/auth';
import { mockSurveys, mockDemoVideos, mockFeedbackVaults, mockVoiceResponses } from '@/mocks/surveys';

interface VoiceResponseCardProps {
  response: VoiceResponse;
  showSurveyLink?: boolean;
}

export function VoiceResponseCard({ response, showSurveyLink = true }: VoiceResponseCardProps) {
  const { isPlaying, play, pause } = useAudioPlayer();
  const resonanceMutation = useResonanceInteraction();
  const { isAuthenticated, user } = useAuth();

  // Get the original content (survey, demo video, or feedback vault) that this response is for
  const getOriginalContent = () => {
    // First try to find a survey
    if (response.surveyId) {
      const foundSurvey = mockSurveys.find(s => s.id === response.surveyId);
      if (foundSurvey) {
        return { type: 'survey', content: foundSurvey, id: response.surveyId };
      }
    }
    
    // Then try to find a feedback vault
    if (response.vaultId) {
      const vault = mockFeedbackVaults.find(v => v.id === response.vaultId);
      if (vault) {
        if (vault.type === 'demo' && vault.demoVideoId) {
          // If it's a demo vault, get the demo video
          const demoVideo = mockDemoVideos.find(d => d.id === vault.demoVideoId);
          if (demoVideo) {
            return { type: 'demo', content: demoVideo, id: vault.demoVideoId };
          }
        }
        return { type: 'vault', content: vault, id: response.vaultId };
      }
    }
    
    return null;
  };

  const originalContent = getOriginalContent();

  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play(response.audioUrl);
    }
  };

  const handleResonance = (type: 'boost' | 'echo' | 'mute') => {
    if (!isAuthenticated || !user) {
      console.log('Please sign in to interact with responses');
      return;
    }
    
    resonanceMutation.mutate({
      type,
      targetId: response.id,
      targetType: 'response',
      userId: user.id,
    });
  };

  const handleSurveyPress = () => {
    if (!originalContent) return;
    
    if (originalContent.type === 'survey') {
      router.push(`/survey/${originalContent.id}`);
    } else if (originalContent.type === 'demo') {
      // For demo videos, we could navigate to a demo detail page
      // For now, let's navigate to the survey page if it exists
      if (response.surveyId) {
        router.push(`/survey/${response.surveyId}`);
      }
    } else if (originalContent.type === 'vault') {
      // For external vaults, we could show the external URL or vault details
      // For now, let's navigate to the survey page if it exists
      if (response.surveyId) {
        router.push(`/survey/${response.surveyId}`);
      }
    }
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image source={{ uri: response.user.avatar }} style={styles.avatar} />
          <View style={styles.userText}>
            <Text style={styles.userName}>{response.user.name}</Text>
            <Text style={styles.timeAgo}>{formatTimeAgo(response.createdAt)}</Text>
          </View>
        </View>
        <View style={styles.resonanceScore}>
          <TrendingUp size={14} color="#6b7280" />
          <Text style={styles.scoreText}>{response.resonanceScore}</Text>
        </View>
      </View>

      <View style={styles.audioSection}>
        <TouchableOpacity style={styles.playButton} onPress={handlePlayPause}>
          {isPlaying ? (
            <Pause size={20} color="#ffffff" />
          ) : (
            <Play size={20} color="#ffffff" />
          )}
        </TouchableOpacity>
        
        <View style={styles.waveform}>
          <View style={styles.waveformBars}>
            {Array.from({ length: 20 }).map((_, i) => (
              <View 
                key={`waveform-${i}`} 
                style={[
                  styles.waveformBar,
                  { height: Math.random() * 20 + 8 }
                ]} 
              />
            ))}
          </View>
          <Text style={styles.duration}>{formatDuration(response.duration)}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.transcriptSection}>
        <Text style={styles.transcriptText}>Show Transcript</Text>
        <Text style={styles.readMoreText}>read more</Text>
      </TouchableOpacity>

      {showSurveyLink && originalContent && (
        <TouchableOpacity style={styles.surveyLink} onPress={handleSurveyPress}>
          <MessageSquare size={14} color="#6b7280" />
          <Text style={styles.surveyLinkText} numberOfLines={2}>
            {originalContent.content.title}
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.responseCount}
          onPress={() => {
            if (!originalContent) return;
            if (originalContent.type === 'survey') {
              router.push(`/survey/${originalContent.id}`);
              return;
            }
            if (originalContent.type === 'demo') {
              router.push(`/demo/${originalContent.id}`);
              return;
            }
            if (response.surveyId) {
              router.push(`/survey/${response.surveyId}`);
              return;
            }
            const nestedResponses = mockVoiceResponses.filter(r => r.parentResponseId === response.id);
            if (nestedResponses.length > 0) {
              console.log(`Navigate to ${nestedResponses.length} nested responses for response:`, response.id);
            }
          }}
          testID="response-count-button"
        >
          <MessageSquare size={16} color="#6366f1" strokeWidth={1.5} />
          <Text style={styles.responseText}>{mockVoiceResponses.filter(r => r.parentResponseId === response.id).length || response.interactions.boosts + response.interactions.echoes} voice responses</Text>
        </TouchableOpacity>
        
        <View style={styles.actions} testID="response-actions">
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleResonance('boost')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <TrendingUp size={16} color="#6b7280" strokeWidth={1.5} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleResonance('echo')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Repeat size={16} color="#6b7280" strokeWidth={1.5} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleResonance('mute')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <X size={16} color="#6b7280" strokeWidth={1.5} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: radius(16),
    padding: spacing(16),
    marginHorizontal: spacing(12),
    marginVertical: spacing(8),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: scale(28),
    height: scale(28),
    borderRadius: radius(14),
    marginRight: spacing(10),
  },
  userText: {
    flex: 1,
  },
  userName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 1,
  },
  timeAgo: {
    fontSize: 11,
    color: '#6b7280',
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
  scoreText: {
    fontSize: fontScale(12),
    fontWeight: '600',
    color: '#10b981',
  },
  audioSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  playButton: {
    width: scale(40),
    height: scale(40),
    borderRadius: radius(20),
    backgroundColor: '#1f2937',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  waveform: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  waveformBars: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    height: 24,
  },
  waveformBar: {
    width: scale(2),
    backgroundColor: '#d1d5db',
    marginRight: 2,
    borderRadius: 1,
  },
  duration: {
    fontSize: fontScale(12),
    color: '#6b7280',
    fontWeight: '500',
    marginLeft: 12,
  },
  transcriptSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 4,
  },
  transcriptText: {
    fontSize: fontScale(14),
    color: '#374151',
    fontWeight: '500',
  },
  readMoreText: {
    fontSize: fontScale(12),
    color: '#6b7280',
    fontWeight: '400',
  },
  surveyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: spacing(12),
    paddingVertical: spacing(8),
    borderRadius: radius(8),
    marginBottom: spacing(12),
  },
  surveyLinkText: {
    fontSize: fontScale(13),
    color: '#475569',
    fontWeight: '500',
    marginLeft: 6,
    flex: 1,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing(14),
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    marginTop: 8,
  },
  responseCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  responseText: {
    fontSize: fontScale(14),
    color: '#6366f1',
    fontWeight: '500',
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
  actionText: {
    fontSize: fontScale(12),
    color: '#6b7280',
    fontWeight: '600',
  },

});