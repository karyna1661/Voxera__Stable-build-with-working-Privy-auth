import React from 'react';
import { View, StyleSheet, FlatList, Text } from 'react-native';
import { spacing, fontScale } from '@/lib/responsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSurveys } from '@/hooks/use-surveys';
import { SurveyCard } from '@/components/SurveyCard';
import { RecordButton } from '@/components/RecordButton';
import { GridBackground } from '@/components/GridBackground';
import { ThreeDHeading } from '@/components/ThreeDHeading';
import { Survey } from '@/types/survey';
import { PrivySignInButton } from '@/providers/auth';
import { mockSurveys } from '@/mocks/surveys';


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



  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: insets.top + 24 }]}>
      {/* Header with title and sign in aligned */}
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <ThreeDHeading title="Trending" textList={["Trending","For You","Demo Market","Voices","Hot","Now"]} />
        </View>
        <View style={styles.headerActions}>
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
    <GridBackground style={styles.container} testID="trending-grid-bg">
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
        removeClippedSubviews
        windowSize={10}
        initialNumToRender={6}
        maxToRenderPerBatch={8}
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
    paddingBottom: spacing(140),
  },
  header: {
    paddingHorizontal: spacing(24),
    paddingBottom: spacing(28),
  },
  title: {
    fontSize: fontScale(32),
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: fontScale(16),
    color: '#64748b',
    fontWeight: '500',
    lineHeight: 24,
  },
  empty: {
    alignItems: 'center',
    paddingTop: spacing(100),
    paddingHorizontal: spacing(24),
  },
  emptyText: {
    fontSize: fontScale(18),
    fontWeight: '700',
    color: '#334155',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: fontScale(14),
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
});