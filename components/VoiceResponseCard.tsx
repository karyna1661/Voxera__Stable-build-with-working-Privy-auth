import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { VoiceResponse } from '@/types/survey';
import { Play, Pause, TrendingUp, Repeat, X, MessageSquare } from 'lucide-react-native';
import { useAudioPlayer } from '@/hooks/use-audio-player';
import { useResonanceInteraction, useSurvey } from '@/hooks/use-surveys';
import { router } from 'expo-router';
import { useAuth } from '@/providers/auth';

interface VoiceResponseCardProps {
  response: VoiceResponse;
  showSurveyLink?: boolean;
}

export function VoiceResponseCard({ response, showSurveyLink = true }: VoiceResponseCardProps) {
  const { isPlaying, play, pause } = useAudioPlayer();
  const resonanceMutation = useResonanceInteraction();
  const { data: survey } = useSurvey(response.surveyId || response.vaultId || '');
  const { isAuthenticated, user } = useAuth();

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
    const surveyId = response.surveyId || response.vaultId;
    if (surveyId) {
      router.push(`/survey/${surveyId}`);
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

      {showSurveyLink && (response.surveyId || response.vaultId) && (
        <TouchableOpacity style={styles.surveyLink} onPress={handleSurveyPress}>
          <MessageSquare size={14} color="#6b7280" />
          <Text style={styles.surveyLinkText} numberOfLines={2}>
            {survey ? `"${survey.title}"` : 'View original survey'}
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.actions} testID="response-actions">
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleResonance('boost')}
        >
          <TrendingUp size={16} color="#6b7280" />
          <Text style={styles.actionText}>{response.interactions.boosts}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleResonance('echo')}
        >
          <Repeat size={16} color="#6b7280" />
          <Text style={styles.actionText}>{response.interactions.echoes}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleResonance('mute')}
        >
          <X size={16} color="#6b7280" />
          <Text style={styles.actionText}>{response.interactions.mutes}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 24,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#f9fafb',
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
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 10,
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
    backgroundColor: '#f9fafb',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  scoreText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
    marginLeft: 3,
  },
  audioSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    width: 2,
    backgroundColor: '#d1d5db',
    marginRight: 2,
    borderRadius: 1,
  },
  duration: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    marginLeft: 12,
  },
  surveyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  surveyLinkText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
    marginLeft: 6,
    flex: 1,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingHorizontal: 8,
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
    minWidth: 72,
    flex: 1,
    marginHorizontal: 4,
  },
  actionText: {
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 6,
    fontWeight: '600',
  },
});