import React, { useEffect } from 'react';
import { View, StyleSheet, Platform, ImageBackground } from 'react-native';

interface GridBackgroundProps {
  children: React.ReactNode;
  style?: any;
}

export function GridBackground({ children, style }: GridBackgroundProps) {
  useEffect(() => {
    if (Platform.OS === 'web') {
      const styleElement = document.createElement('style');
      styleElement.textContent = `
        @keyframes shaderFlow {
          0% { transform: translateX(-10px) translateY(-5px) scale(1.02); filter: hue-rotate(0deg) brightness(1.1); }
          50% { transform: translateX(5px) translateY(3px) scale(1.05); filter: hue-rotate(10deg) brightness(1.2); }
          100% { transform: translateX(-5px) translateY(-2px) scale(1.03); filter: hue-rotate(-5deg) brightness(1.15); }
        }
      `;
      document.head.appendChild(styleElement);
      return () => {
        document.head.removeChild(styleElement);
      };
    }
  }, []);

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.shaderGradient} />
        <View style={styles.gridOverlay} />
        <View style={styles.content}>{children}</View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?q=80&w=1600&auto=format&fit=crop' }}
        style={styles.nativeBg}
        resizeMode="cover"
        imageStyle={styles.nativeBgImage}
      >
        <View style={styles.nativeOverlay} />
        <View style={styles.content}>{children}</View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, position: 'relative', backgroundColor: '#0ea5e9' },
  nativeBg: { flex: 1 },
  nativeBgImage: { opacity: 0.45 },
  nativeOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(148, 255, 209, 0.35)',
  },
  shaderGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    ...(Platform.OS === 'web'
      ? {
          background: `radial-gradient(ellipse 80% 50% at 50% 0%, rgba(148, 255, 209, 0.8) 0%, rgba(107, 245, 255, 0.6) 40%, rgba(255, 255, 255, 0.3) 70%, transparent 100%), linear-gradient(135deg, rgba(148, 255, 209, 0.4) 0%, rgba(107, 245, 255, 0.3) 50%, rgba(255, 255, 255, 0.2) 100%)`,
          animation: 'shaderFlow 8s ease-in-out infinite alternate',
        }
      : {}),
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    ...(Platform.OS === 'web'
      ? {
          backgroundImage: `linear-gradient(to right, rgba(79, 79, 79, 0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(79, 79, 79, 0.12) 1px, transparent 1px)`,
          backgroundSize: '14px 24px',
          maskImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, black 70%, transparent 110%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, black 70%, transparent 110%)',
          zIndex: 1,
        }
      : {}),
  },
  content: { flex: 1, position: 'relative', zIndex: 2 },
});