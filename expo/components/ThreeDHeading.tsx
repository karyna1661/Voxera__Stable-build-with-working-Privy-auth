import React, { useMemo } from 'react';
import { Platform, View, StyleSheet, Text, Dimensions } from 'react-native';

interface ThreeDHeadingProps {
  title: string;
  textList?: string[];
  height?: number;
}

export function ThreeDHeading({ title, textList, height = 240 }: ThreeDHeadingProps) {
  const isWeb = Platform.OS === 'web';
  const { width } = Dimensions.get('window');
  const widthPx = `${Math.min(Math.max(Math.floor(width - 48), 320), 1000)}px` as const;
  const heightPx = `${height}px` as const;

  const words = useMemo(() => {
    const base = [title, 'Voxera', 'Voice', 'Resonance', 'Demos', 'Community', 'Feedback'];
    const list = textList && textList.length > 0 ? textList : base;
    return Array.from(new Set(list));
  }, [title, textList]);

  if (!isWeb) {
    return (
      <View style={styles.fallback} testID="three-d-heading-fallback">
        <Text style={styles.fallbackText}>{title}</Text>
      </View>
    );
  }

  let Sphere3DText: any = null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    Sphere3DText = require('react-3d-text').Sphere3DText;
  } catch (e) {
    console.warn('react-3d-text not available on this platform', e);
  }

  return (
    <View style={styles.container} testID="three-d-heading">
      {Sphere3DText ? (
        <Sphere3DText
          textList={words}
          width={widthPx}
          height={heightPx}
          radius={120}
          distance={320}
          fontSize={22}
          fontColor="#0f172a"
          autoRotate={true}
          defaultRotation={{ x: 15, y: 15, z: 0 }}
          alwaysFaceCamera={true}
        />
      ) : (
        <View style={styles.fallback}>
          <Text style={styles.fallbackText}>{title}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  fallback: {
    width: '100%',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  fallbackText: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: '#0f172a',
    letterSpacing: -0.5,
  },
});