import React, { useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';

interface GridBackgroundProps {
  children: React.ReactNode;
  style?: any;
}

export function GridBackground({ children, style }: GridBackgroundProps) {
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Inject CSS animation for shader gradient
      const styleElement = document.createElement('style');
      styleElement.textContent = `
        @keyframes shaderFlow {
          0% {
            transform: translateX(-10px) translateY(-5px) scale(1.02);
            filter: hue-rotate(0deg) brightness(1.1);
          }
          50% {
            transform: translateX(5px) translateY(3px) scale(1.05);
            filter: hue-rotate(10deg) brightness(1.2);
          }
          100% {
            transform: translateX(-5px) translateY(-2px) scale(1.03);
            filter: hue-rotate(-5deg) brightness(1.15);
          }
        }
      `;
      document.head.appendChild(styleElement);
      
      return () => {
        document.head.removeChild(styleElement);
      };
    }
  }, []);

  return (
    <View style={[styles.container, style]}>
      {/* Shader gradient background */}
      {Platform.OS === 'web' && <View style={styles.shaderGradient} />}
      {/* Grid overlay */}
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
    backgroundColor: '#94ffd1', // Fallback color for mobile
  },
  shaderGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    ...(Platform.OS === 'web' ? {
      background: `
        radial-gradient(ellipse 80% 50% at 50% 0%, 
          rgba(148, 255, 209, 0.8) 0%, 
          rgba(107, 245, 255, 0.6) 40%, 
          rgba(255, 255, 255, 0.3) 70%, 
          transparent 100%
        ),
        linear-gradient(135deg, 
          rgba(148, 255, 209, 0.4) 0%, 
          rgba(107, 245, 255, 0.3) 50%, 
          rgba(255, 255, 255, 0.2) 100%
        )
      `,
      animation: 'shaderFlow 8s ease-in-out infinite alternate',
    } : {}),
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    ...(Platform.OS === 'web' ? {
      backgroundImage: `
        linear-gradient(to right, rgba(79, 79, 79, 0.12) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(79, 79, 79, 0.12) 1px, transparent 1px)
      `,
      backgroundSize: '14px 24px',
      maskImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, black 70%, transparent 110%)',
      WebkitMaskImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, black 70%, transparent 110%)',
      zIndex: 1,
    } : {}),
  },
  content: {
    flex: 1,
    position: 'relative',
    zIndex: 2,
  },
});