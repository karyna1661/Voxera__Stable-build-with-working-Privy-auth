import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated } from 'react-native';
import { router } from 'expo-router';
import { Survey } from '@/types/survey';
import { MessageCircle, TrendingUp, Repeat, X } from 'lucide-react-native';
import { useResonanceInteraction } from '@/hooks/use-surveys';

interface SurveyCardProps {
  survey: Survey;
}

export function SurveyCard({ survey }: SurveyCardProps) {
  const [isPressed, setIsPressed] = useState<boolean>(false);
  const resonanceMutation = useResonanceInteraction();
  const scaleAnim = new Animated.Value(1);

  const handlePress = () => {
    router.push(`/survey/${survey.id}`);
  };

  const handleResonance = (type: 'boost' | 'echo' | 'mute', event: any) => {
    event.stopPropagation();
    
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    resonanceMutation.mutate({
      type,
      targetId: survey.id,
      targetType: 'survey',
      userId: 'current-user',
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'now';
    if (diffInHours < 24) return `${diffInHours}h`;
    return `${Math.floor(diffInHours / 24)}d`;
  };

  return (
    <TouchableOpacity 
      style={[styles.card, isPressed && styles.cardPressed]} 
      onPress={handlePress} 
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      activeOpacity={1}
    >
      <View style={styles.header}>
        <View style={styles.creatorInfo}>
          <Image source={{ uri: survey.creator.avatar }} style={styles.avatar} />
          <View style={styles.creatorText}>
            <Text style={styles.creatorName}>{survey.creator.name}</Text>
            <Text style={styles.timeAgo}>{formatTimeAgo(survey.createdAt)}</Text>
          </View>
        </View>
        <View style={styles.resonanceScore}>
          <TrendingUp size={14} color="#10b981" strokeWidth={1.5} />
          <Text style={styles.scoreText}>{survey.resonanceScore}</Text>
        </View>
      </View>
      
      <Text style={styles.title}>{survey.title}</Text>
      <Text style={styles.question} numberOfLines={3}>{survey.question}</Text>
      
      {survey.tags && survey.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {survey.tags.map((tag, index) => (
            <View key={`tag-${index}`} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
      
      <View style={styles.footer}>
        <TouchableOpacity style={styles.responseCount} onPress={(e) => {
          e.stopPropagation();
          // Navigate to responses view - for now just handle the press
          console.log('Navigate to responses for survey:', survey.id);
        }}>
          <MessageCircle size={16} color="#6366f1" strokeWidth={1.5} />
          <Text style={styles.responseText}>{survey.responseCount} voice responses</Text>
        </TouchableOpacity>
        
        <View style={styles.actions} testID="survey-actions">
          <TouchableOpacity
            style={styles.actionButton}
            onPress={(e) => handleResonance('boost', e)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <TrendingUp size={16} color="#6b7280" strokeWidth={1.5} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={(e) => handleResonance('echo', e)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Repeat size={16} color="#6b7280" strokeWidth={1.5} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={(e) => handleResonance('mute', e)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <X size={16} color="#6b7280" strokeWidth={1.5} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 0,
    transform: [{ scale: 1 }],
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    shadowOpacity: 0.12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  creatorText: {
    flex: 1,
  },
  creatorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  timeAgo: {
    fontSize: 12,
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
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    lineHeight: 24,
  },
  question: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 22,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tagText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
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
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
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
});