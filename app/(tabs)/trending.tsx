import React from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSurveys } from '@/hooks/use-surveys';
import { SurveyCard } from '@/components/SurveyCard';
import { VoiceResponseCard } from '@/components/VoiceResponseCard';
import { RecordButton } from '@/components/RecordButton';
import { Survey, VoiceResponse } from '@/types/survey';
import { PrivySignInButton } from '@/providers/auth';
import { mockSurveys, mockResponses } from '@/mocks/surveys';
import { Plus } from 'lucide-react-native';
import { router } from 'expo-router';

type FeedItem = {
  id: string;
  type: 'survey' | 'response';
  data: Survey | VoiceResponse;
};

export default function TrendingScreen() {
  const { isLoading, refetch } = useSurveys('trending');
  const insets = useSafeAreaInsets();

  // Combine surveys and responses for the trending feed
  const feedItems: FeedItem[] = React.useMemo(() => {
    const surveyItems: FeedItem[] = mockSurveys.map(survey => ({
      id: `survey-${survey.id}`,
      type: 'survey' as const,
      data: survey
    }));
    
    const responseItems: FeedItem[] = mockResponses.map(response => ({
      id: `response-${response.id}`,
      type: 'response' as const,
      data: response
    }));
    
    // Interleave surveys and responses for a mixed feed
    const combined = [...surveyItems, ...responseItems];
    return combined.sort(() => Math.random() - 0.5); // Simple shuffle
  }, []);

  const renderFeedItem = ({ item }: { item: FeedItem }) => {
    if (item.type === 'survey') {
      return <SurveyCard survey={item.data as Survey} />;
    } else {
      return <VoiceResponseCard response={item.data as VoiceResponse} showSurveyLink={true} />;
    }
  };

  const handleCreateSurvey = () => {
    router.push('/create-survey');
  };

  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: insets.top + 24 }]}>
      {/* Header with title, create button, and sign in aligned */}
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Trending</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.createButton} 
            onPress={handleCreateSurvey}
            testID="create-survey-button"
          >
            <Plus size={18} color="#ffffff" strokeWidth={2} />
            <Text style={styles.createButtonText}>Create</Text>
          </TouchableOpacity>
          <PrivySignInButton compact={true} />
        </View>
      </View>
      
      <Text style={styles.subtitle}>High-resonance surveys and voice responses gaining momentum</Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>No trending content</Text>
      <Text style={styles.emptySubtext}>Engage with surveys and responses to see trends</Text>
    </View>
  );

  return (
    <View style={styles.container}>
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
    </View>
  );
}

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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});