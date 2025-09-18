import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';

interface GridBackgroundProps {
  children: React.ReactNode;
  style?: any;
}

export function GridBackground({ children, style }: GridBackgroundProps) {
  return (
    <View style={[styles.container, style]}>
      {Platform.OS === 'web' && <View style={styles.gridOverlay} />}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#ffffff',
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    ...(Platform.OS === 'web' ? {
      // Web-specific grid pattern
      backgroundImage: `
        linear-gradient(to right, rgba(79, 79, 79, 0.18) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(79, 79, 79, 0.18) 1px, transparent 1px)
      `,
      backgroundSize: '14px 24px',
      maskImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, black 70%, transparent 110%)',
      WebkitMaskImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, black 70%, transparent 110%)',
    } : {}),
  },
  content: {
    flex: 1,
    position: 'relative',
    zIndex: 1,
  },
});