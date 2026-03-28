import { useState, useRef, useCallback } from 'react';
import { Audio as ExpoAudio } from 'expo-av';
import { Platform } from 'react-native';

export interface AudioPlayerState {
  isPlaying: boolean;
  isLoading: boolean;
  duration: number;
  position: number;
  progress: number;
}

export function useAudioPlayer() {
  const [state, setState] = useState<AudioPlayerState>({
    isPlaying: false,
    isLoading: false,
    duration: 0,
    position: 0,
    progress: 0,
  });
  
  const soundRef = useRef<ExpoAudio.Sound | null>(null);
  const webAudioRef = useRef<HTMLAudioElement | null>(null as any);
  const currentUrl = useRef<string | null>(null);

  const play = useCallback(async (url: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      if (Platform.OS === 'web') {
        if (webAudioRef.current && currentUrl.current === url) {
          await webAudioRef.current.play();
          setState(prev => ({ ...prev, isPlaying: true, isLoading: false }));
          return;
        }
        if (webAudioRef.current) {
          try { webAudioRef.current.pause(); } catch {}
        }
        const audio = new Audio(url);
        audio.onended = () => setState(prev => ({ ...prev, isPlaying: false, position: 0, progress: 0 }));
        webAudioRef.current = audio;
        currentUrl.current = url;
        await audio.play();
        setState(prev => ({ ...prev, isPlaying: true, isLoading: false }));
        return;
      }

      await ExpoAudio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      if (soundRef.current && currentUrl.current === url) {
        await soundRef.current.playAsync();
        setState(prev => ({ ...prev, isPlaying: true, isLoading: false }));
        return;
      }

      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      const { sound } = await ExpoAudio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true },
        (status) => {
          if (status.isLoaded) {
            setState(prev => ({
              ...prev,
              duration: status.durationMillis || 0,
              position: status.positionMillis || 0,
              progress: status.durationMillis ? (status.positionMillis || 0) / status.durationMillis : 0,
              isPlaying: status.isPlaying || false,
            }));
          }
        }
      );

      soundRef.current = sound;
      currentUrl.current = url;
      setState(prev => ({ ...prev, isPlaying: true, isLoading: false }));
    } catch (error) {
      console.error('Error playing audio:', error);
      setState(prev => ({ ...prev, isLoading: false, isPlaying: false }));
    }
  }, []);

  const pause = useCallback(async () => {
    if (Platform.OS === 'web') {
      if (webAudioRef.current) {
        try { webAudioRef.current.pause(); } catch {}
        setState(prev => ({ ...prev, isPlaying: false }));
      }
      return;
    }
    if (soundRef.current) {
      await soundRef.current.pauseAsync();
      setState(prev => ({ ...prev, isPlaying: false }));
    }
  }, []);

  const stop = useCallback(async () => {
    if (Platform.OS === 'web') {
      if (webAudioRef.current) {
        try { webAudioRef.current.pause(); } catch {}
        try { webAudioRef.current.currentTime = 0; } catch {}
        setState(prev => ({ ...prev, isPlaying: false, position: 0, progress: 0 }));
      }
      return;
    }
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      setState(prev => ({ ...prev, isPlaying: false, position: 0, progress: 0 }));
    }
  }, []);

  return {
    ...state,
    play,
    pause,
    stop,
  };
}