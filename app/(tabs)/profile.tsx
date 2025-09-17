import React from 'react';
import { View, StyleSheet, ScrollView, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MessageCircle, TrendingUp, Settings, User, Plus, Calendar, Eye } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth, EthereumSignInButton } from '@/providers/auth';
import { useUserSurveys } from '@/hooks/use-surveys';


export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { isAuthenticated, user } = useAuth();
  const { data: userSurveys = [], isLoading: surveysLoading } = useUserSurveys(user?.address);
  
  const handleSettings = () => {
    router.push('/(tabs)/settings');
  };
  
  // Use real user data if authenticated, otherwise show placeholder
  const displayUser = isAuthenticated && user ? {
    name: user.farcaster?.displayName || user.name || `User ${user.address.slice(0, 6)}`,
    handle: user.farcaster?.username ? `@${user.farcaster.username}` : `@${user.address.slice(0, 8)}`,
    avatar: user.farcaster?.pfpUrl || user.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    address: user.address,
    bio: user.farcaster?.bio,
    followerCount: user.farcaster?.followerCount,
    followingCount: user.farcaster?.followingCount,
    walletType: user.walletType,
  } : {
    name: 'Connect Wallet',
    handle: '@anonymous',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    address: null,
  };
  
  const handleCreateSurvey = () => {
    if (!isAuthenticated) {
      console.log('Please connect your wallet first');
      return;
    }
    router.push('/create-survey');
  };

  const handleViewSurvey = (surveyId: string) => {
    router.push(`/survey/${surveyId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const calculateStats = () => {
    const surveysCreated = userSurveys.length;
    const totalResonance = userSurveys.reduce((sum, survey) => sum + survey.resonanceScore, 0);
    const totalResponses = userSurveys.reduce((sum, survey) => sum + survey.responseCount, 0);
    
    return {
      surveysCreated,
      responsesReceived: totalResponses,
      totalResonance,
    };
  };

  const stats = calculateStats();
  const statItems = [
    { label: 'Surveys Created', value: stats.surveysCreated.toString(), icon: MessageCircle },
    { label: 'Responses Received', value: stats.responsesReceived.toString(), icon: User },
    { label: 'Total Resonance', value: stats.totalResonance > 1000 ? `${(stats.totalResonance / 1000).toFixed(1)}k` : stats.totalResonance.toString(), icon: TrendingUp },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.header, { paddingTop: insets.top + 32 }]}>
          {/* Top bar with Settings button */}
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.settingsButton} onPress={handleSettings}>
              <Settings size={20} color="#6b7280" strokeWidth={1.5} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.profileSection}>
            <Image source={{ uri: displayUser.avatar }} style={styles.avatar} />
            <Text style={styles.name}>{displayUser.name}</Text>
            <Text style={styles.handle}>{displayUser.handle}</Text>
            
            {/* Farcaster bio instead of wallet address */}
            {isAuthenticated && user?.farcaster?.bio && (
              <View style={styles.walletSection}>
                <Text style={styles.walletLabel}>Bio</Text>
                <Text style={styles.walletAddress}>{user.farcaster.bio}</Text>
              </View>
            )}
            
            {/* Show sign in button if not authenticated */}
            {!isAuthenticated && (
              <View style={styles.signInSection}>
                <Text style={styles.signInPrompt}>Connect your wallet to get started</Text>
                <EthereumSignInButton />
              </View>
            )}
          </View>
        </View>

        <View style={styles.statsContainer}>
          {statItems.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <View key={stat.label} style={styles.statCard}>
                <IconComponent size={24} color="#6b7280" strokeWidth={1.5} />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Surveys</Text>
            {isAuthenticated && (
              <TouchableOpacity style={styles.createButton} onPress={handleCreateSurvey}>
                <Plus size={16} color="#ffffff" strokeWidth={2} />
                <Text style={styles.createButtonText}>Create</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {!isAuthenticated ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Connect your wallet</Text>
              <Text style={styles.emptySubtext}>Connect your wallet to create and manage surveys</Text>
            </View>
          ) : surveysLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#111827" />
              <Text style={styles.loadingText}>Loading your surveys...</Text>
            </View>
          ) : userSurveys.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No surveys yet</Text>
              <Text style={styles.emptySubtext}>Create your first survey to start collecting voice responses from the community</Text>
              <TouchableOpacity style={styles.emptyActionButton} onPress={handleCreateSurvey}>
                <Plus size={20} color="#111827" strokeWidth={2} />
                <Text style={styles.emptyActionText}>Create Survey</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.surveysContainer}>
              {userSurveys.map((survey) => (
                <TouchableOpacity 
                  key={survey.id} 
                  style={styles.surveyCard}
                  onPress={() => handleViewSurvey(survey.id)}
                >
                  <View style={styles.surveyHeader}>
                    <Text style={styles.surveyTitle} numberOfLines={2}>
                      {survey.title}
                    </Text>
                    <View style={styles.surveyMeta}>
                      <View style={styles.metaItem}>
                        <Calendar size={14} color="#6b7280" />
                        <Text style={styles.metaText}>{formatDate(survey.createdAt)}</Text>
                      </View>
                      {survey.category && (
                        <View style={styles.categoryTag}>
                          <Text style={styles.categoryTagText}>{survey.category}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  
                  <Text style={styles.surveyQuestion} numberOfLines={3}>
                    {survey.question}
                  </Text>
                  
                  <View style={styles.surveyStats}>
                    <View style={styles.statItem}>
                      <MessageCircle size={16} color="#6b7280" />
                      <Text style={styles.statText}>{survey.responseCount} responses</Text>
                    </View>
                    <View style={styles.statItem}>
                      <TrendingUp size={16} color="#6b7280" />
                      <Text style={styles.statText}>{survey.resonanceScore} resonance</Text>
                    </View>
                    <View style={styles.viewButton}>
                      <Eye size={16} color="#111827" />
                      <Text style={styles.viewButtonText}>View</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    paddingBottom: 120,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 32,
  },
  profileSection: {
    alignItems: 'center',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 16,
  },
  name: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  handle: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 48,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    minHeight: 120,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 8,
    marginBottom: 6,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.3,
    lineHeight: 14,
  },
  section: {
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  emptyState: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 48,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 48,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 16,
    fontWeight: '500',
  },
  emptyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#111827',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
  },
  emptyActionText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
  },
  surveysContainer: {
    gap: 16,
  },
  surveyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  surveyHeader: {
    marginBottom: 12,
  },
  surveyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
    lineHeight: 24,
  },
  surveyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  categoryTag: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryTagText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  surveyQuestion: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 16,
  },
  surveyStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  viewButtonText: {
    fontSize: 12,
    color: '#111827',
    fontWeight: '600',
  },
  walletSection: {
    marginTop: 16,
    alignItems: 'center',
  },
  walletLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  walletAddress: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '500',
  },
  signInSection: {
    marginTop: 24,
    alignItems: 'center',
  },
  signInPrompt: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 16,
    textAlign: 'center',
  },
});