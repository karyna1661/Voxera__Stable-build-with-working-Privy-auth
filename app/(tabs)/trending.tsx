import React from 'react';
import { View, StyleSheet, FlatList, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSurveys } from '@/hooks/use-surveys';
import { SurveyCard } from '@/components/SurveyCard';
import { RecordButton } from '@/components/RecordButton';
import { Survey } from '@/types/survey';
import { EthereumSignInButton } from '@/providers/auth';

export default function TrendingScreen() {
  const { data: surveys, isLoading, refetch } = useSurveys('trending');
  const insets = useSafeAreaInsets();

  const renderSurvey = ({ item }: { item: Survey }) => (
    <SurveyCard survey={item} />
  );

  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: insets.top + 24 }]}>
      {/* Header with title and sign in aligned */}
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Trending</Text>
        </View>
        <View style={styles.signInContainer}>
          <EthereumSignInButton compact={true} />
        </View>
      </View>
      
      <Text style={styles.subtitle}>High-resonance surveys gaining momentum</Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>No trending surveys</Text>
      <Text style={styles.emptySubtext}>Engage with content to see trends</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={surveys}
        renderItem={renderSurvey}
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
  signInContainer: {
    alignItems: 'flex-end',
  },
});