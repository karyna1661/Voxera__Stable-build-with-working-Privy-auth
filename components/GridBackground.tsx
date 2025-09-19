import React, { useMemo, useState } from 'react';
import { View, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';

interface GridBackgroundProps {
  children: React.ReactNode;
  style?: any;
  mode?: 'shader' | 'gradient';
  shaderUrl?: string;
  testID?: string;
}

export function GridBackground({ children, style, mode = 'shader', shaderUrl, testID }: GridBackgroundProps) {
  const { width, height } = useWindowDimensions();
  const vGap = 16;
  const hGap = 24;
  const vCount = Math.ceil(width / vGap);
  const hCount = Math.ceil(height / hGap);

  const [shaderFailed, setShaderFailed] = useState<boolean>(false);

  const animatedUrl = useMemo(() => {
    const fallback = 'https://www.shadergradient.co/api/export?animate=on&axesHelper=off&brightness=1.2&cAzimuthAngle=170&cDistance=4.4&cPolarAngle=70&cameraZoom=1&color1=%2394ffd1&color2=%236bf5ff&color3=%23ffffff&destination=onCanvas&embedMode=off&envPreset=city&format=gif&fov=45&frameRate=10&gizmoHelper=hide&grain=off&lightType=3d&pixelDensity=1.2&positionX=0&positionY=0.9&positionZ=-0.3&range=disabled&rangeEnd=40&rangeStart=0&reflection=0.1&rotationX=45&rotationY=0&rotationZ=0&shader=defaults&toggleAxis=false&type=plane&uAmplitude=3.3&uDensity=3.3&uFrequency=0&uSpeed=1.1&uStrength=4.6&uTime=0&wireframe=false&zoomOut=true';
    return shaderUrl ?? fallback;
  }, [shaderUrl]);

  const useShader = mode === 'shader' && !shaderFailed && Platform.select({ web: true, default: true });

  return (
    <View style={[styles.container, style]} testID={testID ?? 'grid-background'}>
      {useShader ? (
        <Image
          source={{ uri: animatedUrl }}
          style={styles.background}
          contentFit="cover"
          accessibilityLabel="Animated shader background"
          testID="shader-background"
          onError={(_e) => {
            console.warn('Shader background failed to load, falling back to gradient');
            setShaderFailed(true);
          }}
        />
      ) : (
        <LinearGradient
          colors={["#94ffd1", "#6bf5ff", "#ffffff"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.background}
        />
      )}

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
  container: { flex: 1, position: 'relative', backgroundColor: '#0b1120' },
  background: { ...StyleSheet.absoluteFillObject },
  linesContainer: { ...StyleSheet.absoluteFillObject },
  horizontalLines: { ...StyleSheet.absoluteFillObject },
  verticalLines: { ...StyleSheet.absoluteFillObject },
  hLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  vLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  content: { flex: 1, position: 'relative', zIndex: 2 },
});