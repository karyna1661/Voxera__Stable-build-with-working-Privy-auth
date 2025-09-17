import React from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Mic, TrendingUp, ArrowUp, Repeat, X } from 'lucide-react-native';
import { useSurvey, useResonanceInteraction } from '@/hooks/use-surveys';
import { VoiceResponseCard } from '@/components/VoiceResponseCard';
import { useAuth } from '@/providers/auth';

export default function SurveyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: survey, isLoading } = useSurvey(id!);
  const resonanceMutation = useResonanceInteraction();
  const { isAuthenticated, user } = useAuth();

  const handleBack = () => {
    router.back();
  };

  const handleResonance = (type: 'boost' | 'echo' | 'mute') => {
    if (!survey) return;
    
    if (!isAuthenticated || !user) {
      console.log('Please sign in to interact with surveys');
      return;
    }
    
    resonanceMutation.mutate({
      type,
      targetId: survey.id,
      targetType: 'survey',
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
    router.push(`/record?surveyId=${id}`);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading survey...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!survey) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.error}>
          <Text style={styles.errorText}>Survey not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backIcon} onPress={handleBack}>
          <ArrowLeft size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Survey</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.surveyCard}>
          <View style={styles.surveyHeader}>
            <View style={styles.creatorInfo}>
              <Image source={{ uri: survey.creator.avatar }} style={styles.avatar} />
              <View style={styles.creatorText}>
                <Text style={styles.creatorName}>{survey.creator.name}</Text>
                <Text style={styles.timeAgo}>{formatTimeAgo(survey.createdAt)}</Text>
              </View>
            </View>
            <View style={styles.resonanceScore}>
              <TrendingUp size={16} color="#6b7280" />
              <Text style={styles.scoreText}>{survey.resonanceScore}</Text>
            </View>
          </View>
          
          <Text style={styles.title}>{survey.title}</Text>
          <Text style={styles.question}>{survey.question}</Text>
          
          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => handleResonance('boost')}
            >
              <ArrowUp size={18} color="#6b7280" strokeWidth={1.5} />
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
          <Text style={styles.responsesTitle}>
            Responses ({survey.responses.length})
          </Text>
          
          {survey.responses.length === 0 ? (
            <View style={styles.noResponses}>
              <Text style={styles.noResponsesText}>No responses yet</Text>
              <Text style={styles.noResponsesSubtext}>Be the first to share your voice</Text>
            </View>
          ) : (
            survey.responses.map((response) => (
              <VoiceResponseCard key={response.id} response={response} showSurveyLink={false} />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
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
  surveyCard: {
    backgroundColor: '#ffffff',
    margin: 24,
    borderRadius: 24,
    padding: 32,
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
  surveyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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
    backgroundColor: '#f9fafb',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginLeft: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 16,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  question: {
    fontSize: 18,
    color: '#475569',
    lineHeight: 28,
    marginBottom: 32,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 32,
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
  responsesTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
    paddingHorizontal: 24,
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