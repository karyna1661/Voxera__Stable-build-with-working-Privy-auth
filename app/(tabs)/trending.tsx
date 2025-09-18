import React from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSurveys } from '@/hooks/use-surveys';
import { SurveyCard } from '@/components/SurveyCard';
import { RecordButton } from '@/components/RecordButton';
import { GridBackground } from '@/components/GridBackground';
import { Survey } from '@/types/survey';
import { PrivySignInButton } from '@/providers/auth';
import { mockSurveys } from '@/mocks/surveys';
import { Plus } from 'lucide-react-native';
import { router } from 'expo-router';

export default function TrendingScreen() {
  const { isLoading, refetch } = useSurveys('trending');
  const insets = useSafeAreaInsets();

  // Show only surveys in trending page
  const trendingSurveys: Survey[] = React.useMemo(() => {
    // Sort by resonance score for trending
    return [...mockSurveys].sort((a, b) => b.resonanceScore - a.resonanceScore);
  }, []);

  const renderSurveyItem = ({ item }: { item: Survey }) => {
    return <SurveyCard survey={item} />;
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
      
      <Text style={styles.subtitle}>High-resonance surveys gaining momentum in the community</Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>No trending surveys</Text>
      <Text style={styles.emptySubtext}>Create or engage with surveys to see trends</Text>
    </View>
  );

  return (
    <GridBackground style={styles.container}>
      <FlatList
        data={trendingSurveys}
        renderItem={renderSurveyItem}
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