import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useMemo } from 'react';

// Simple in-memory storage for now to avoid AsyncStorage lint issues
// In production, you'd want to use a proper storage solution
const memoryStorage = new Map<string, string>();

export const [StorageProvider, useStorage] = createContextHook(() => {
  const getItem = useCallback(async (key: string): Promise<string | null> => {
    if (!key?.trim() || key.length > 100) {
      console.error('Invalid storage key');
      return null;
    }
    
    try {
      return memoryStorage.get(key) || null;
    } catch (error) {
      console.error(`Failed to get item ${key}:`, error);
      return null;
    }
  }, []);

  const setItem = useCallback(async (key: string, value: string): Promise<void> => {
    if (!key?.trim() || key.length > 100) {
      throw new Error('Invalid storage key');
    }
    if (!value?.trim() || value.length > 10000) {
      throw new Error('Invalid storage value');
    }
    
    try {
      memoryStorage.set(key, value);
    } catch (error) {
      console.error(`Failed to set item ${key}:`, error);
      throw error;
    }
  }, []);

  const removeItem = useCallback(async (key: string): Promise<void> => {
    if (!key?.trim() || key.length > 100) {
      throw new Error('Invalid storage key');
    }
    
    try {
      memoryStorage.delete(key);
    } catch (error) {
      console.error(`Failed to remove item ${key}:`, error);
      throw error;
    }
  }, []);

  return useMemo(() => ({
    getItem,
    setItem,
    removeItem,
  }), [getItem, setItem, removeItem]);
});

// Helper hook for auth-specific storage
export function useAuthStorage() {
  const storage = useStorage();
  
  return useMemo(() => ({
    getAuthToken: () => storage.getItem('auth_token'),
    setAuthToken: (token: string) => storage.setItem('auth_token', token),
    removeAuthToken: () => storage.removeItem('auth_token'),
    getAuthUser: () => storage.getItem('auth_user'),
    setAuthUser: (user: string) => storage.setItem('auth_user', user),
    removeAuthUser: () => storage.removeItem('auth_user'),
  }), [storage]);
}