import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GridBackgroundProps {
  children: React.ReactNode;
  style?: any;
}

export function GridBackground({ children, style }: GridBackgroundProps) {
  const { width, height } = useWindowDimensions();
  const vGap = 16;
  const hGap = 24;
  const vCount = Math.ceil(width / vGap);
  const hCount = Math.ceil(height / hGap);

  return (
    <View style={[styles.container, style]} testID="grid-background">
      <LinearGradient
        colors={[
          '#052e26',
          '#064e3b',
          '#065f46',
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />

      <View pointerEvents="none" style={styles.linesContainer}>
        <View style={styles.horizontalLines}>
          {Array.from({ length: hCount }).map((_, i) => (
            <View key={`h-${i}`} style={[styles.hLine, { top: i * hGap }]} />
          ))}
        </View>
        <View style={styles.verticalLines}>
          {Array.from({ length: vCount }).map((_, i) => (
            <View key={`v-${i}`} style={[styles.vLine, { left: i * vGap }]} />
          ))}
        </View>
      </View>

      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, position: 'relative', backgroundColor: '#052e26' },
  gradient: { ...StyleSheet.absoluteFillObject },
  linesContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  horizontalLines: {
    ...StyleSheet.absoluteFillObject,
  },
  verticalLines: {
    ...StyleSheet.absoluteFillObject,
  },
  hLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  vLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  content: { flex: 1, position: 'relative', zIndex: 2 },
});