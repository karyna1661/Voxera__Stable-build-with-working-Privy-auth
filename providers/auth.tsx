import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Platform, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { PrivyProvider, usePrivy, useLogin } from '@privy-io/react-auth';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import createContextHook from '@nkzw/create-context-hook';
import { AuthState, User } from '@/types/survey';
import { apiService } from '@/services/api';
import { useAuthStorage } from '@/providers/storage';
import { farcasterService } from '@/services/farcaster';

// Privy configuration
const getPrivyAppId = (): string => {
  const extra = (Constants?.expoConfig?.extra ?? {}) as Record<string, unknown>;
  const envAppId = (extra.EXPO_PUBLIC_PRIVY_APP_ID as string | undefined) ?? (process.env.EXPO_PUBLIC_PRIVY_APP_ID as string | undefined);
  return envAppId ?? 'cmf6o0wqr01j7jo0c2f1qfufc';
};

const getRedirectUri = (): string => {
  try {
    const url = Linking.createURL('auth');
    console.log('[Auth] redirectUri', url);
    return url;
  } catch (e) {
    console.warn('[Auth] Failed to build redirect URI, falling back to custom scheme');
    return 'myapp://auth';
  }
};

// Enhanced authentication context with Privy integration
const [AuthContextProvider, useAuthContext] = createContextHook(() => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const authStorage = useAuthStorage();
  const { user: privyUser, authenticated, ready, logout } = usePrivy();
  const { login } = useLogin();

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

  // Convert Privy user to our User type
  const convertPrivyUser = useCallback(async (rawPrivyUser: any): Promise<User> => {
    try {
      console.log('[Auth] Raw Privy user', JSON.stringify(rawPrivyUser ?? {}, null, 2));
    } catch {}

    const linked = Array.isArray(rawPrivyUser?.linkedAccounts) ? rawPrivyUser.linkedAccounts : [];

    const walletFromRoot = rawPrivyUser?.wallet?.address as string | undefined;
    const walletFromArray = linked.find((acc: any) => acc?.type === 'wallet')?.address as string | undefined;
    const walletFromWallets = Array.isArray(rawPrivyUser?.wallets) ? (rawPrivyUser.wallets[0]?.address as string | undefined) : undefined;

    const walletAddress = (walletFromRoot || walletFromArray || walletFromWallets)?.toLowerCase();

    if (!walletAddress) {
      throw new Error('No wallet address found');
    }

    const walletClientTypeRaw = (rawPrivyUser?.wallet?.walletClientType as string | undefined)
      ?? (linked.find((acc: any) => acc?.type === 'wallet')?.walletClientType as string | undefined);

    const toWalletType = (t?: string): User['walletType'] => {
      const x = (t ?? '').toLowerCase();
      if (x.includes('metamask')) return 'metamask';
      if (x.includes('coinbase')) return 'coinbase';
      if (x.includes('walletconnect') || x.includes('wc')) return 'walletconnect';
      if (x.includes('farcaster')) return 'farcaster';
      if (x.includes('email')) return 'email';
      return undefined;
    };

    const walletClientType = toWalletType(walletClientTypeRaw);

    const farcasterAccount: any | undefined = linked.find((acc: any) => acc?.type === 'farcaster');

    let fc = undefined as
      | {
          fid?: number;
          username?: string;
          displayName?: string;
          bio?: string;
          pfpUrl?: string;
          followerCount?: number;
          followingCount?: number;
        }
      | undefined;

    if (farcasterAccount) {
      const profile = (farcasterAccount.profile ?? farcasterAccount) as Record<string, any>;
      fc = {
        fid: (farcasterAccount.fid as number | undefined) ?? (profile.fid as number | undefined),
        username: (farcasterAccount.username as string | undefined) ?? (profile.username as string | undefined),
        displayName: (profile.displayName as string | undefined) ?? (profile.display_name as string | undefined),
        bio: (profile.bio?.text as string | undefined) ?? (profile.bio as string | undefined),
        pfpUrl: (profile.pfp?.url as string | undefined) ?? (profile.pfpUrl as string | undefined) ?? (profile.pfp_url as string | undefined),
        followerCount: (profile.followerCount as number | undefined) ?? (profile.follower_count as number | undefined),
        followingCount: (profile.followingCount as number | undefined) ?? (profile.following_count as number | undefined),
      };

      if ((!fc.username || !fc.displayName || !fc.pfpUrl) && typeof farcasterAccount.fid === 'number') {
        try {
          const neynar = await farcasterService.getUserByFid(farcasterAccount.fid as number);
          if (neynar) {
            fc = {
              fid: neynar.fid,
              username: neynar.username ?? fc.username,
              displayName: neynar.display_name ?? fc.displayName,
              bio: neynar.bio ?? fc.bio,
              pfpUrl: neynar.pfp_url ?? fc.pfpUrl,
              followerCount: neynar.follower_count ?? fc.followerCount,
              followingCount: neynar.following_count ?? fc.followingCount,
            };
          }
        } catch (err) {
          console.warn('[Auth] Neynar fallback failed, continuing without Farcaster enrichment');
        }
      }
    }

    const user: User = {
      id: String(rawPrivyUser?.id ?? walletAddress),
      address: walletAddress,
      createdAt: (rawPrivyUser?.createdAt as string | undefined) ?? new Date().toISOString(),
      walletType: walletClientType,
      name:
        (fc?.displayName && fc.displayName.trim().length > 0 ? fc.displayName : undefined)
        ?? (rawPrivyUser?.email?.address as string | undefined)
        ?? `User ${walletAddress.slice(0, 6)}`,
      email: rawPrivyUser?.email?.address as string | undefined,
      farcaster: fc
        ? {
            fid: (fc.fid ?? 0) as number,
            username: (fc.username ?? '') as string,
            displayName: (fc.displayName ?? '') as string,
            bio: fc.bio,
            pfpUrl: fc.pfpUrl,
            followerCount: (fc.followerCount ?? 0) as number,
            followingCount: (fc.followingCount ?? 0) as number,
          }
        : undefined,
    };

    return user;
  }, []);

  // Handle Privy authentication state changes
  useEffect(() => {
    if (!ready) return;

    const handlePrivyAuth = async () => {
      if (authenticated && privyUser) {
        try {
          setAuthState(prev => ({ ...prev, isLoading: true }));
          const user = await convertPrivyUser(privyUser);
          const token = `privy_${user.id}_${Date.now()}`;
          await saveAuth(token, user);
        } catch (error) {
          console.error('Failed to process Privy user:', error);
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
      } else {
        await clearAuth();
      }
    };

    handlePrivyAuth();
  }, [ready, authenticated, privyUser, convertPrivyUser, saveAuth, clearAuth]);

  // Load stored auth on mount
  useEffect(() => {
    if (ready && !authenticated) {
      loadStoredAuth();
    }
  }, [ready, authenticated, loadStoredAuth]);

  const signIn = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      await login();
    } catch (error) {
      console.error('Failed to sign in:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, [login]);

  const signOut = useCallback(async () => {
    try {
      await logout();
      await clearAuth();
    } catch (error) {
      console.error('Failed to sign out:', error);
      await clearAuth(); // Fallback to clear local auth
    }
  }, [logout, clearAuth]);

  return useMemo(() => ({
    ...authState,
    signIn,
    signOut,
    saveAuth,
    isLoading: authState.isLoading || !ready,
  }), [authState, signIn, signOut, saveAuth, ready]);
});

// Authentication provider with Privy integration
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={getPrivyAppId()}
      config={{
        loginMethods: ['wallet', 'email', 'farcaster'],
        appearance: {
          theme: 'light',
          accentColor: '#000000',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
      }}
    >
      <AuthContextProvider>
        {children}
      </AuthContextProvider>
    </PrivyProvider>
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