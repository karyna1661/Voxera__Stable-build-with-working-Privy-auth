import { useState, useRef } from 'react';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';

export interface RecordingState {
  isRecording: boolean;
  isLoading: boolean;
  duration: number;
  uri: string | null;
}

export function useAudioRecorder() {
  const [state, setState] = useState<RecordingState>({
    isRecording: false,
    isLoading: false,
    duration: 0,
    uri: null,
  });
  
  const recordingRef = useRef<Audio.Recording | null>(null);

  const startRecording = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      if (Platform.OS === 'web') {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              sampleRate: 44100
            } 
          });
          
          const mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'audio/webm;codecs=opus'
          });
          
          const chunks: BlobPart[] = [];
          mediaRecorder.ondataavailable = (event) => {
            if (event.data && event.data.size > 0) chunks.push(event.data);
          };
          
          mediaRecorder.start(100);
          recordingRef.current = { mediaRecorder, stream, startTime: Date.now(), chunks } as any;
          
          const updateDuration = () => {
            if (recordingRef.current && (recordingRef.current as any).startTime) {
              const elapsed = Date.now() - (recordingRef.current as any).startTime;
              setState(prev => ({ ...prev, duration: elapsed }));
            }
          };
          const intervalId = setInterval(updateDuration, 100);
          (recordingRef.current as any).intervalId = intervalId;
          
          setState(prev => ({ ...prev, isRecording: true, isLoading: false }));
        } catch (webError) {
          console.error('Web recording error:', webError);
          throw new Error('Microphone access denied or not available');
        }
      } else {
        // Native implementation
        const permission = await Audio.requestPermissionsAsync();
        if (permission.status !== 'granted') {
          throw new Error('Permission to access microphone is required!');
        }

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const recording = new Audio.Recording();
        await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);

        recording.setOnRecordingStatusUpdate((status) => {
          if (status.isRecording) {
            setState(prev => ({
              ...prev,
              duration: status.durationMillis || 0,
            }));
          }
        });

        await recording.startAsync();
        recordingRef.current = recording;
        setState(prev => ({ ...prev, isRecording: true, isLoading: false }));
      }
    } catch (error) {
      console.error('Failed to start recording:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current) return null;

    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      if (Platform.OS === 'web') {
        const { mediaRecorder, stream, intervalId, chunks, startTime } = recordingRef.current as any;
        if (intervalId) clearInterval(intervalId);

        const blobPromise: Promise<string> = new Promise((resolve) => {
          mediaRecorder.addEventListener('stop', () => {
            const blob = new Blob(chunks, { type: 'audio/webm;codecs=opus' });
            const url = URL.createObjectURL(blob);
            setState(prev => ({ ...prev, uri: url }));
            resolve(url);
          });
        });

        mediaRecorder.stop();
        if (stream) stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());

        const url = await blobPromise;

        const finalDuration = startTime ? Date.now() - startTime : state.duration;
        setState(prev => ({ 
          ...prev, 
          isRecording: false, 
          isLoading: false,
          duration: finalDuration,
        }));
        recordingRef.current = null;
        return url;
      } else {
        await recordingRef.current.stopAndUnloadAsync();
        const uri = recordingRef.current.getURI();
        
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
        });

        setState(prev => ({ 
          ...prev, 
          isRecording: false, 
          isLoading: false,
          uri 
        }));
        
        recordingRef.current = null;
        return uri;
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      return null;
    }
  };

  const resetRecording = () => {
    setState({
      isRecording: false,
      isLoading: false,
      duration: 0,
      uri: null,
    });
  };

  return {
    ...state,
    startRecording,
    stopRecording,
    resetRecording,
  };
}