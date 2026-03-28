import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Platform, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { X, Mic, Square, Play, Pause, Send } from 'lucide-react-native';
import { useAudioRecorder } from '@/hooks/use-audio-recorder';
import { useAudioPlayer } from '@/hooks/use-audio-player';
import { useSubmitResponse } from '@/hooks/use-surveys';
import { useAuth } from '@/providers/auth';
import { GridBackground } from '@/components/GridBackground';

export default function RecordScreen() {
  const { surveyId } = useLocalSearchParams<{ surveyId?: string }>();
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [hasPreviewed, setHasPreviewed] = useState<boolean>(false);
  const [successVisible, setSuccessVisible] = useState<boolean>(false);
  const { isAuthenticated, user } = useAuth();
  
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
  
  const submitMutation = useSubmitResponse();

  const handleClose = () => {
    if (isRecording) {
      if (Platform.OS === 'web') {
        const confirmed = confirm('Stop Recording? Are you sure you want to stop recording and go back?');
        if (confirmed) router.back();
      } else {
        console.log('Recording in progress, please stop first');
      }
    } else {
      router.back();
    }
  };

  const handleStartRecording = async () => {
    try {
      await startRecording();
    } catch {
      if (Platform.OS === 'web') {
        alert('Failed to start recording. Please check microphone permissions.');
      } else {
        console.log('Failed to start recording');
      }
    }
  };

  const handleStopRecording = async () => {
    try {
      const uri = await stopRecording();
      if (uri) {
        setRecordedUri(uri);
      }
    } catch {
      if (Platform.OS === 'web') {
        alert('Failed to stop recording.');
      } else {
        console.log('Failed to stop recording');
      }
    }
  };

  const handlePlayPause = () => {
    if (!recordedUri) return;
    
    if (isPlaying) {
      pause();
    } else {
      if (!hasPreviewed) setHasPreviewed(true);
      play(recordedUri);
    }
  };

  const handleRetry = () => {
    setRecordedUri(null);
    setHasPreviewed(false);
    resetRecording();
  };

  const handleSubmit = async () => {
    if (!recordedUri) return;
    
    if (!isAuthenticated || !user) {
      if (Platform.OS === 'web') {
        alert('Please sign in to submit your response.');
      } else {
        console.log('Authentication required to submit response');
      }
      return;
    }
    
    try {
      await submitMutation.mutateAsync({
        surveyId: surveyId || 'general',
        audioUrl: recordedUri,
        duration: duration,
      });
      setSuccessVisible(true);
    } catch {
      if (Platform.OS === 'web') {
        alert('❌ Failed to submit your response. Please try again.');
      } else {
        console.log('Failed to submit response');
      }
    }
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <GridBackground>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <X size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Record Response</Text>
          <View style={styles.placeholder} />
        </View>

      <View style={styles.content}>
        {!isAuthenticated && (
          <View style={styles.authWarning}>
            <Text style={styles.authWarningText}>
              ⚠️ Please sign in to record and submit responses
            </Text>
          </View>
        )}
        
        <View style={styles.recordingSection} testID="recording-section">
          <Text style={styles.instruction}>
            {!recordedUri 
              ? (isRecording ? 'Recording your voice...' : 'Tap to start recording')
              : 'Review your recording'
            }
          </Text>
          
          <View style={styles.visualizer}>
            {isRecording && (
              <View style={styles.waveform}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <View 
                    key={`waveform-${i}`} 
                    style={[
                      styles.waveformBar,
                      { height: Math.random() * 40 + 20 }
                    ]} 
                  />
                ))}
              </View>
            )}
            
            {recordedUri && !isRecording && (
              <View style={styles.playbackControls}>
                <TouchableOpacity 
                  style={styles.playButton} 
                  onPress={handlePlayPause}
                  disabled={playerLoading}
                  testID="preview-playpause"
                  accessibilityRole="button"
                  accessibilityLabel="Play or pause your recording preview"
                >
                  {isPlaying ? (
                    <Pause size={32} color="#ffffff" />
                  ) : (
                    <Play size={32} color="#ffffff" />
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
          
          <Text style={styles.duration} testID="recording-duration">
            {formatDuration(duration)}
          </Text>
        </View>

        <View style={styles.controls}>
          {!recordedUri ? (
            <TouchableOpacity
              style={[
                styles.recordButton,
                isRecording && styles.recordButtonActive
              ]}
              onPress={isRecording ? handleStopRecording : handleStartRecording}
              disabled={recordingLoading}
            >
              {isRecording ? (
                <Square size={32} color="#ffffff" />
              ) : (
                <Mic size={32} color="#ffffff" />
              )}
            </TouchableOpacity>
          ) : (
            <View style={styles.reviewControls}>
              <TouchableOpacity style={styles.retryButton} onPress={handleRetry} testID="record-again">
                <Text style={styles.retryButtonText}>Record Again</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.submitButton, (!hasPreviewed || submitMutation.isPending) && styles.submitButtonDisabled]} 
                onPress={handleSubmit}
                disabled={!hasPreviewed || submitMutation.isPending}
                testID="submit-response"
                accessibilityRole="button"
                accessibilityLabel="Submit your voice response"
              >
                <Send size={20} color="#ffffff" />
                <Text style={styles.submitButtonText}>
                  {submitMutation.isPending ? 'Submitting...' : (hasPreviewed ? 'Submit' : 'Preview to enable Submit')}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <Modal
        visible={successVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSuccessVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Response Submitted</Text>
            <Text style={styles.modalSubtitle}>Your voice has been received</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalPrimary}
                onPress={() => {
                  setSuccessVisible(false);
                  router.back();
                }}
                testID="response-success-done"
              >
                <Text style={styles.modalPrimaryText}>Done</Text>
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
  closeButton: {
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
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  recordingSection: {
    alignItems: 'center',
    marginBottom: 80,
  },
  instruction: {
    fontSize: 20,
    fontWeight: '700',
    color: '#334155',
    textAlign: 'center',
    marginBottom: 64,
    letterSpacing: -0.3,
  },
  visualizer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 80,
  },
  waveformBar: {
    width: 4,
    backgroundColor: '#1f2937',
    marginHorizontal: 2,
    borderRadius: 2,
  },
  playbackControls: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
    fontWeight: '600',
  },
  playButton: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  duration: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  controls: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  recordButton: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  recordButtonActive: {
    backgroundColor: '#dc2626',
    shadowOpacity: 0.35,
  },
  reviewControls: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  retryButton: {
    width: '100%',
    maxWidth: 360,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  submitButton: {
    width: '100%',
    maxWidth: 360,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#111827',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: '#475569',
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
  authWarning: {
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#f59e0b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    marginHorizontal: 24,
  },
  authWarningText: {
    fontSize: 14,
    color: '#92400e',
    fontWeight: '600',
    textAlign: 'center' as const,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
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
  },
  modalButtons: {
    marginTop: 12,
    width: '100%',
    alignItems: 'center',
  },
  modalPrimary: {
    width: '100%',
    maxWidth: 320,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#111827',
    alignItems: 'center',
  },
  modalPrimaryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});