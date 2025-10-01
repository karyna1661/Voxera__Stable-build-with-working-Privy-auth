import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StorageProvider } from "@/providers/storage";
import { AuthProvider } from "@/providers/auth";
import { trpc, trpcClient } from "@/lib/trpc";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
    mutations: {
      retry: 1,
    },
  },
});

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="survey/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="demo/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="qr/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="record" options={{ presentation: "modal", headerShown: false }} />
      <Stack.Screen name="create-survey" options={{ presentation: "modal", headerShown: false }} />
    </Stack>
  );
}

// Error Boundary Component
class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error Boundary caught an error:', error?.message || 'Unknown error', errorInfo?.componentStack || 'No stack');
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Something went wrong</Text>
          <Text style={styles.errorDetails}>
            {this.state.error?.message || 'Unknown error'}
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function RootLayout() {
  useEffect(() => {
    const hideSplash = async () => {
      try {
        await SplashScreen.hideAsync();
      } catch (error) {
        console.error('Failed to hide splash screen:', error);
      }
    };
    
    // Delay splash screen hiding to ensure providers are ready
    const timer = setTimeout(hideSplash, 100);
    return () => clearTimeout(timer);
  }, []);

  const PrivyWrapper = ({ children }: { children: React.ReactNode }) => <>{children}</>;
  const privyProps = {};

  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <PrivyWrapper {...privyProps}>
          <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <StorageProvider>
              <AuthProvider>
                <GestureHandlerRootView style={styles.container}>
                  <RootLayoutNav />
                </GestureHandlerRootView>
              </AuthProvider>
            </StorageProvider>
          </trpc.Provider>
        </PrivyWrapper>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  errorDetails: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});