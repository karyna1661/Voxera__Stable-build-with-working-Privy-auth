import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { GridBackground } from '@/components/GridBackground';
import * as Linking from 'expo-linking';

export default function QrScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const surveyUrl = Linking.createURL(`survey/${id}`);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(surveyUrl)}`;

  return (
    <GridBackground>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} testID="qr-back">
            <ArrowLeft size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan to Respond</Text>
          <View style={styles.headerSpacer} />
        </View>

      <View style={styles.content}>
        <Text style={styles.title}>Scan, Speak, Connect</Text>
        <Text style={styles.subtitle}>Open the camera on your phone to scan the QR and answer with your voice.</Text>

        <View style={styles.qrWrapper}>
          <Image source={{ uri: qrUrl }} style={styles.qr} resizeMode="contain" />
        </View>

        <View style={styles.captionBox}>
          <Text style={styles.caption}>• Scan the code
• Sign in with Farcaster to reply
• Record your voice response</Text>
        </View>
      </View>
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 8,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  qrWrapper: {
    width: '100%',
    maxWidth: 360,
    aspectRatio: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  qr: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  captionBox: {
    marginTop: 16,
    backgroundColor: '#ecfeff',
    borderWidth: 1,
    borderColor: '#cffafe',
    padding: 12,
    borderRadius: 12,
    maxWidth: 360,
  },
  caption: {
    color: '#164e63',
    textAlign: 'center',
    fontWeight: '600',
  },
});