import React, { useState, useMemo } from 'react';
import { TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Plus } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/providers/auth';

export function RecordButton() {
  const [isPressed, setIsPressed] = useState<boolean>(false);
  const scaleAnim = useMemo(() => new Animated.Value(1), []);
  const pulseAnim = useMemo(() => new Animated.Value(1), []);

  const { isAuthenticated } = useAuth();

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (!isAuthenticated) {
      console.log('Please sign in to create a survey');
      return;
    }

    router.push('/create-survey');
  };

  React.useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: Animated.multiply(scaleAnim, pulseAnim) }],
        },
      ]}
      testID="floating-create-button"
    >
      <TouchableOpacity
        style={[styles.button, isPressed && styles.buttonPressed]}
        onPress={handlePress}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        activeOpacity={1}
      >
        <Plus size={28} color="#ffffff" strokeWidth={2} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    zIndex: 1000,
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
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
  buttonPressed: {
    backgroundColor: '#374151',
    shadowOpacity: 0.35,
  },
});