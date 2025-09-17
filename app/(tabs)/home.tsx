import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTrendingResponses } from '@/hooks/use-surveys';
import { VoiceResponseCard } from '@/components/VoiceResponseCard';
import { RecordButton } from '@/components/RecordButton';
import { VoiceResponse } from '@/types/survey';
import { PrivySignInButton, useAuth } from '@/providers/auth';
import { X } from 'lucide-react-native';

export default function HomeScreen() {
  const { data: responses, isLoading, refetch } = useTrendingResponses();
  const insets = useSafeAreaInsets();

  const renderResponse = ({ item }: { item: VoiceResponse }) => (
    <VoiceResponseCard response={item} showSurveyLink={true} />
  );

  const { isAuthenticated, user } = useAuth();
  const [showWelcome, setShowWelcome] = useState<boolean>(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      setShowWelcome(true);
      const timeout = setTimeout(() => {
        setShowWelcome(false);
      }, 3000);
      return () => clearTimeout(timeout);
    } else {
      setShowWelcome(false);
    }
  }, [isAuthenticated, user]);

  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: insets.top + 24 }]} testID="home-header">

      {/* Header with title and sign in aligned */}
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>For You</Text>
        </View>
        <View style={styles.signInContainer}>
          <PrivySignInButton compact={true} />
        </View>
      </View>
      
      <Text style={styles.subtitle}>Trending voice responses from the community</Text>
      
      {/* Welcome message for authenticated users */}
      {isAuthenticated && user && showWelcome && (
        <View style={styles.welcomeSection} testID="welcome-banner">
          <View style={styles.welcomeRow}>
            <Text style={styles.welcomeText}>Welcome back, {user?.farcaster?.displayName ?? (user?.farcaster?.username ? `@${user.farcaster.username}` : `${user.address.slice(0, 6)}...${user.address.slice(-4)}`)}!</Text>
            <TouchableOpacity
              accessibilityRole="button"
              testID="welcome-dismiss"
              onPress={() => setShowWelcome(false)}
              style={styles.dismissButton}
            >
              <X size={16} color="#065f46" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>No voice responses yet</Text>
      <Text style={styles.emptySubtext}>Be the first to share your voice</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={responses}
        renderItem={renderResponse}
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
  welcomeSection: {
    marginTop: 16,
    padding: 16,
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#34d399',
  },
  welcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  dismissButton: {
    padding: 6,
    borderRadius: 8,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    flex: 1,
  },
});