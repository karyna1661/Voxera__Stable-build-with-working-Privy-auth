import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Platform, TouchableOpacity, Text, StyleSheet } from 'react-native';



import createContextHook from '@nkzw/create-context-hook';
import { AuthState, User } from '@/types/survey';
import { apiService } from '@/services/api';
import { useAuthStorage } from '@/providers/storage';




// Enhanced authentication context with Privy integration
const [AuthContextProvider, useAuthContext] = createContextHook(() => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const authStorage = useAuthStorage();
  const ready = true;

  const clearAuth = useCallback(async () => {
    try {
      await authStorage.removeAuthToken();
      await authStorage.removeAuthUser();
      apiService.setAuthToken(null);
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to clear auth:', error);
    }
  }, [authStorage]);

  const saveAuth = useCallback(async (token: string, user: User) => {
    if (!token?.trim() || token.length > 1000) {
      throw new Error('Invalid token');
    }
    if (!user?.id?.trim() || !user?.address?.trim()) {
      throw new Error('Invalid user data');
    }
    
    try {
      const sanitizedToken = token.trim();
      const sanitizedUserStr = JSON.stringify(user);
      
      await authStorage.setAuthToken(sanitizedToken);
      await authStorage.setAuthUser(sanitizedUserStr);
      apiService.setAuthToken(sanitizedToken);
      setAuthState({
        user,
        token: sanitizedToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to save auth:', error);
      throw error;
    }
  }, [authStorage]);

  const loadStoredAuth = useCallback(async () => {
    try {
      const token = await authStorage.getAuthToken();
      const userStr = await authStorage.getAuthUser();
      
      if (token && userStr) {
        const user = JSON.parse(userStr) as User;
        apiService.setAuthToken(token);
        setAuthState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Failed to load stored auth:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, [authStorage]);



  // Handle Privy authentication state changes
  useEffect(() => {
    loadStoredAuth();
  }, [loadStoredAuth]);

  // Load stored auth on mount


  const signIn = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      const now = Date.now();
      const user: User = {
        id: `guest_${now}`,
        address: `0x${now.toString(16).padStart(8, '0')}`,
        name: `Guest ${String(now).slice(-4)}`,
        createdAt: new Date().toISOString(),
      };
      const token = `guest_${now}`;
      await saveAuth(token, user);
    } catch (error) {
      console.error('Failed to sign in:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, [saveAuth]);

  const signOut = useCallback(async () => {
    try {
      await clearAuth();
    } catch (error) {
      console.error('Failed to sign out:', error);
      await clearAuth();
    }
  }, [clearAuth]);

  return useMemo(() => ({
    ...authState,
    signIn,
    signOut,
    saveAuth,
    isLoading: authState.isLoading,
  }), [authState, signIn, signOut, saveAuth]);
});

// Authentication provider with Privy integration
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthContextProvider>
      {children}
    </AuthContextProvider>
  );
}

// Privy sign-in button with full authentication options
export function PrivySignInButton({ compact = false }: { compact?: boolean }) {
  const auth = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);
  
  const handleConnect = useCallback(async () => {
    try {
      setIsConnecting(true);
      await auth.signIn();
    } catch (error) {
      console.error('Failed to sign in:', error);
    } finally {
      setIsConnecting(false);
    }
  }, [auth]);
  
  const handleDisconnect = useCallback(async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  }, [auth]);
  
  // Show loading state
  if (isConnecting || auth.isLoading) {
    return (
      <TouchableOpacity testID="privy-connecting" style={[compact ? styles.compactButton : styles.loadingButton]} disabled>
        <Text style={[compact ? styles.compactText : styles.loadingText]}>Connecting...</Text>
      </TouchableOpacity>
    );
  }
  
  if (auth.isAuthenticated && auth.user) {
    const authUser = auth.user;
    let displayText = '';
    
    if (authUser.farcaster?.username) {
      displayText = `@${authUser.farcaster.username}`;
    } else if (authUser.name) {
      displayText = authUser.name;
    } else {
      const address = authUser.address;
      displayText = `${address.slice(0, 6)}...${address.slice(-4)}`;
    }
    
    return (
      <TouchableOpacity 
        testID="privy-authenticated"
        style={[compact ? styles.compactAuthenticatedButton : styles.authenticatedButton]}
        onPress={handleDisconnect}
      >
        <Text style={[compact ? styles.compactAuthenticatedText : styles.authenticatedText]}>
          {displayText}
        </Text>
      </TouchableOpacity>
    );
  }
  
  return (
    <TouchableOpacity 
      testID="privy-sign-in"
      style={[compact ? styles.compactButton : styles.connectButton]}
      onPress={handleConnect}
    >
      <Text style={[compact ? styles.compactText : styles.buttonText]}>
        {compact ? 'Sign In' : 'Sign In'}
      </Text>
    </TouchableOpacity>
  );
}

// Export the auth hook
export const useAuth = useAuthContext;

// Backward compatibility aliases
export const EthereumSignInButton = PrivySignInButton;
export const EthereumLoginButton = PrivySignInButton;
export const PrivyLoginButton = PrivySignInButton;

const styles = StyleSheet.create({
  loadingButton: {
    padding: 16,
    backgroundColor: '#ccc',
    borderRadius: 8,
  },
  loadingText: {
    color: '#666',
    textAlign: 'center' as const,
  },
  connectButton: {
    padding: 16,
    backgroundColor: '#000000',
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center' as const,
    fontWeight: 'bold' as const,
  },
  compactButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#000000',
    borderRadius: 6,
    minWidth: 80,
  },
  compactAuthenticatedButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#000000',
    borderRadius: 6,
    minWidth: 100,
  },
  compactText: {
    color: 'white',
    textAlign: 'center' as const,
    fontWeight: '600' as const,
    fontSize: 14,
  },
  compactAuthenticatedText: {
    color: 'white',
    textAlign: 'center' as const,
    fontWeight: '600' as const,
    fontSize: 13,
  },
  authenticatedButton: {
    padding: 16,
    backgroundColor: '#000000',
    borderRadius: 8,
  },
  authenticatedText: {
    color: 'white',
    textAlign: 'center' as const,
    fontWeight: 'bold' as const,
  },
});