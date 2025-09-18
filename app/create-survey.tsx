import React, { useState, useMemo } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, TextInput, ScrollView, Switch, Alert, Platform, Modal, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Mic, Info, ArrowLeft, Share2, QrCode, ExternalLink, User as UserIcon, PlusCircle, CheckCircle2, Copy, Play, Pause } from 'lucide-react-native';
import { useAudioRecorder } from '@/hooks/use-audio-recorder';
import { useAudioPlayer } from '@/hooks/use-audio-player';
import { useCreateSurvey } from '@/hooks/use-surveys';
import { useAuth } from '@/providers/auth';
import { CreateSurveyRequest } from '@/types/survey';
import { GridBackground } from '@/components/GridBackground';
import * as Linking from 'expo-linking';

type Category = 'Career & Business' | 'Technology' | 'Personal Growth' | 'Relationships' | 'Health & Wellness' | 'Education' | 'Society & Culture' | 'Other';

const categories: Category[] = [
  'Career & Business',
  'Technology', 
  'Personal Growth',
  'Relationships',
  'Health & Wellness',
  'Education',
  'Society & Culture',
  'Other'
];

export default function CreateSurveyScreen() {
  const { isAuthenticated, user } = useAuth();
  const createSurveyMutation = useCreateSurvey();
  
  const [title, setTitle] = useState<string>('');
  const [question, setQuestion] = useState<string>('');
  const [additionalContext, setAdditionalContext] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [allowAnonymous, setAllowAnonymous] = useState<boolean>(true);
  const [enableTips, setEnableTips] = useState<boolean>(true);
  const [voicePromptUri, setVoicePromptUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [confirmationVisible, setConfirmationVisible] = useState<boolean>(false);
  const [createdSurveyId, setCreatedSurveyId] = useState<string | null>(null);

  
  const { 
    isRecording, 
    isLoading: recordingLoading, 
    duration, 
    startRecording, 
    stopRecording, 
    resetRecording 
  } = useAudioRecorder();
  
  const { 
    isPlaying, 
    isLoading: playerLoading, 
    play, 
    pause 
  } = useAudioPlayer();



  const handleRecordVoicePrompt = async () => {
    if (isRecording) {
      try {
        const uri = await stopRecording();
        if (uri) {
          setVoicePromptUri(uri);
        }
      } catch (error) {
        console.error('Failed to stop recording:', error);
      }
    } else {
      try {
        await startRecording();
      } catch (error) {
        console.error('Failed to start recording:', error);
      }
    }
  };

  const handlePlayVoicePrompt = () => {
    if (!voicePromptUri) return;
    
    if (isPlaying) {
      pause();
    } else {
      play(voicePromptUri);
    }
  };

  const handleRemoveVoicePrompt = () => {
    setVoicePromptUri(null);
    resetRecording();
  };

  const handleSaveDraft = () => {
    console.log('Survey saved as draft');
    router.back();
  };

  const getSurveyUrl = (sid: string) => Linking.createURL(`survey/${sid}`);

  const handlePublishSurvey = async () => {
    if (!isAuthenticated || !user) {
      Alert.alert('Authentication Required', 'Please connect your wallet to create a survey.');
      return;
    }

    if (!title.trim() || !question.trim() || !selectedCategory) {
      Alert.alert('Missing Information', 'Please fill in the title, question, and select a category.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let voicePromptFile: File | { uri: string; name: string; type: string } | undefined;
      
      if (voicePromptUri) {
        if (Platform.OS === 'web') {
          try {
            const response = await fetch(voicePromptUri);
            const blob = await response.blob();
            voicePromptFile = new File([blob], 'voice-prompt.webm', { type: 'audio/webm' });
          } catch (error) {
            console.error('Failed to convert voice prompt to file:', error);
          }
        } else {
          const uriParts = voicePromptUri.split('.');
          const fileType = uriParts[uriParts.length - 1] || 'wav';
          voicePromptFile = {
            uri: voicePromptUri,
            name: `voice-prompt.${fileType}`,
            type: `audio/${fileType}`,
          };
        }
      }
      
      const surveyData: CreateSurveyRequest = {
        title: title.trim(),
        question: question.trim(),
        category: selectedCategory,
        additionalContext: additionalContext.trim() || undefined,
        allowAnonymous,
        enableTips,
        voicePromptFile,
      };
      
      console.log('Creating survey for user:', user.address);
      const createdSurvey = await createSurveyMutation.mutateAsync({ ...surveyData, user });
      
      console.log('Survey created successfully:', createdSurvey.id);
      setCreatedSurveyId(createdSurvey.id);
      setConfirmationVisible(true);
    } catch (error) {
      console.error('Failed to create survey:', error);
      
      if (Platform.OS === 'web') {
        alert('❌ Creation Failed\n\nThere was an error creating your survey. Please try again.');
      } else {
        Alert.alert(
          '❌ Creation Failed', 
          'There was an error creating your survey. Please try again.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleShareToFarcaster = async () => {
    if (!createdSurveyId) return;
    const url = getSurveyUrl(createdSurveyId);
    const text = encodeURIComponent('I just created a new voice survey. Share your thoughts!');
    const composeUrl = `https://warpcast.com/~/compose?text=${text}&embeds[]=${encodeURIComponent(url)}`;
    try {
      await Linking.openURL(composeUrl);
    } catch (e) {
      console.error('Failed to open Farcaster compose:', e);
    }
  };

  const handleCopyLink = async () => {
    if (!createdSurveyId) return;
    const url = getSurveyUrl(createdSurveyId);
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        await Share.share({ message: url, url });
      }
    } catch (e) {
      console.error('Failed to copy/share link:', e);
    }
  };

  const handleSystemShare = async () => {
    if (!createdSurveyId) return;
    const url = getSurveyUrl(createdSurveyId);
    try {
      await Share.share({ message: url, url });
    } catch (e) {
      console.error('Share failed:', e);
    }
  };

  const handleOpenQr = async () => {
    if (!createdSurveyId) return;
    setConfirmationVisible(false);
    router.push(`/qr/${createdSurveyId}`);
  };

  const handleViewSurvey = () => {
    if (!createdSurveyId) return;
    setConfirmationVisible(false);
    router.push(`/survey/${createdSurveyId}`);
  };

  const handleCreateAnother = () => {
    setConfirmationVisible(false);
    setTitle('');
    setQuestion('');
    setAdditionalContext('');
    setSelectedCategory(null);
    setVoicePromptUri(null);
    resetRecording();
  };

  return (
    <GridBackground>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <ArrowLeft size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Survey</Text>
          <View style={styles.headerSpacer} />
        </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {!isAuthenticated && (
            <View style={styles.authWarning}>
              <Text style={styles.authWarningText}>
                ⚠️ Connect your wallet to create surveys
              </Text>
            </View>
          )}
          
          <View style={styles.section}>
            <Text style={styles.label}>
              Survey Title <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="Give your survey a catchy title..."
              placeholderTextColor="#9ca3af"
              value={title}
              onChangeText={setTitle}
              editable={isAuthenticated}
            />
            <Text style={styles.hint}>
              A clear, engaging title helps attract more responses.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>
              Survey Question <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="What question would you like the community to respond to with their voice?"
              placeholderTextColor="#9ca3af"
              value={question}
              onChangeText={setQuestion}
              multiline
              numberOfLines={3}
              editable={isAuthenticated}
            />
            <Text style={styles.hint}>
              Keep it open-ended and thought-provoking. Great surveys invite personal stories and diverse perspectives.
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Voice Prompt (Optional)</Text>
              <Info size={16} color="#6b7280" />
            </View>
            
            {!voicePromptUri ? (
              <TouchableOpacity 
                style={[
                  styles.recordPromptButton,
                  isRecording && styles.recordPromptButtonActive
                ]} 
                onPress={handleRecordVoicePrompt}
                disabled={recordingLoading || !isAuthenticated}
              >
                <View style={[
                  styles.recordPromptIcon,
                  isRecording && styles.recordPromptIconActive
                ]}>
                  <Mic size={24} color={isRecording ? "#ffffff" : "#374151"} />
                </View>
                <Text style={[
                  styles.recordPromptText,
                  isRecording && styles.recordPromptTextActive
                ]}>
                  {isRecording ? 'Recording...' : 'Record Voice Prompt'}
                </Text>
                {isRecording && (
                  <Text style={styles.recordingDuration}>
                    {formatDuration(duration)}
                  </Text>
                )}
              </TouchableOpacity>
            ) : (
              <View style={styles.voicePromptPreview}>
                <TouchableOpacity 
                  style={styles.playButton} 
                  onPress={handlePlayVoicePrompt}
                  disabled={playerLoading}
                  testID="voice-prompt-play"
                  accessibilityRole="button"
                  accessibilityLabel="Play or pause your recorded voice prompt"
                >
                  {isPlaying ? (
                    <Pause size={20} color="#111827" />
                  ) : (
                    <Play size={20} color="#111827" />
                  )}
                </TouchableOpacity>
                <View style={styles.voicePromptInfo}>
                  <Text style={styles.voicePromptLabel}>Voice Prompt Recorded</Text>
                  <Text style={styles.voicePromptDuration}>{formatDuration(duration)}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={handleRemoveVoicePrompt}
                >
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            )}
            
            <Text style={styles.hint}>
              Add a personal voice message to provide context
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Additional Context (Optional)</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Provide any additional context or background for your question..."
              placeholderTextColor="#9ca3af"
              value={additionalContext}
              onChangeText={setAdditionalContext}
              multiline
              numberOfLines={4}
              editable={isAuthenticated}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryGrid}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category && styles.categoryButtonSelected
                  ]}
                  onPress={() => isAuthenticated && setSelectedCategory(category)}
                  disabled={!isAuthenticated}
                >
                  <Text style={[
                    styles.categoryButtonText,
                    selectedCategory === category && styles.categoryButtonTextSelected
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Survey Settings</Text>
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Allow Anonymous Responses</Text>
                <Text style={styles.settingDescription}>
                  Let users respond without revealing their identity
                </Text>
              </View>
              <Switch
                value={allowAnonymous}
                onValueChange={setAllowAnonymous}
                trackColor={{ false: '#f3f4f6', true: '#111827' }}
                thumbColor={allowAnonymous ? '#ffffff' : '#9ca3af'}
                disabled={!isAuthenticated}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Enable Tips</Text>
                <Text style={styles.settingDescription}>
                  Allow users to tip responses they find valuable
                </Text>
              </View>
              <Switch
                value={enableTips}
                onValueChange={setEnableTips}
                trackColor={{ false: '#f3f4f6', true: '#111827' }}
                thumbColor={enableTips ? '#ffffff' : '#9ca3af'}
                disabled={!isAuthenticated}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.draftButton} onPress={handleSaveDraft}>
          <Text style={styles.draftButtonText}>Save Draft</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.publishButton,
            (!title.trim() || !question.trim() || !selectedCategory || !isAuthenticated || isSubmitting) && styles.publishButtonDisabled
          ]} 
          onPress={handlePublishSurvey}
          disabled={!title.trim() || !question.trim() || !selectedCategory || !isAuthenticated || isSubmitting}
        >
          <Text style={[
            styles.publishButtonText,
            (!title.trim() || !question.trim() || !selectedCategory || !isAuthenticated || isSubmitting) && styles.publishButtonTextDisabled
          ]}>
            {isSubmitting ? 'Publishing...' : 'Publish Survey'}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={confirmationVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setConfirmationVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <CheckCircle2 size={28} color="#10b981" />
              <Text style={styles.modalTitle}>Survey Published</Text>
              <Text style={styles.modalSubtitle}>Share it and start collecting voice responses</Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalActionButton} onPress={handleShareToFarcaster} testID="share-farcaster">
                <Share2 size={20} color="#111827" />
                <Text style={styles.modalActionText}>Share to Farcaster</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalActionButton} onPress={handleSystemShare} testID="system-share">
                <ExternalLink size={20} color="#111827" />
                <Text style={styles.modalActionText}>Share Link</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalActionButton} onPress={handleCopyLink} testID="copy-link">
                <Copy size={20} color="#111827" />
                <Text style={styles.modalActionText}>Copy Link</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalActionButton} onPress={handleOpenQr} testID="open-qr">
                <QrCode size={20} color="#111827" />
                <Text style={styles.modalActionText}>View QR</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.secondaryButton} onPress={handleCreateAnother} testID="create-another">
                <PlusCircle size={18} color="#111827" />
                <Text style={styles.secondaryButtonText}>Create Another</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryButton} onPress={handleViewSurvey} testID="view-survey">
                <UserIcon size={18} color="#ffffff" />
                <Text style={styles.primaryButtonText}>View Survey</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      </SafeAreaView>
    </GridBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSpacer: {
    width: 40,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },

  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  section: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  required: {
    color: '#dc2626',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1f2937',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  textArea: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1f2937',
    textAlignVertical: 'top',
    minHeight: 100,
  },
  hint: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    lineHeight: 20,
  },
  recordPromptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    gap: 12,
  },
  recordPromptButtonActive: {
    backgroundColor: '#111827',
    borderColor: '#111827',
    borderStyle: 'solid',
  },
  recordPromptIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordPromptIconActive: {
    backgroundColor: '#374151',
  },
  recordPromptText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  recordPromptTextActive: {
    color: '#ffffff',
  },
  recordingDuration: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 'auto',
  },
  voicePromptPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  voicePromptInfo: {
    flex: 1,
  },
  voicePromptLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  voicePromptDuration: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  removeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc2626',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryButtonSelected: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  categoryButtonTextSelected: {
    color: '#ffffff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 24,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  draftButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  draftButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  publishButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#111827',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  publishButtonDisabled: {
    backgroundColor: '#9ca3af',
    shadowOpacity: 0,
    elevation: 0,
  },
  publishButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  publishButtonTextDisabled: {
    color: '#d1d5db',
  },
  authWarning: {
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#f59e0b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  authWarningText: {
    fontSize: 14,
    color: '#92400e',
    fontWeight: '600',
    textAlign: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    gap: 16,
  },
  modalHeader: {
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  modalActions: {
    gap: 10,
  },
  modalActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  modalActionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#111827',
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
});