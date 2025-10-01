import { useMemo } from 'react';
import { Platform } from 'react-native';

export type UsePrivyReturn = {
  ready: boolean;
  authenticated: boolean;
  user: any | null;
  login?: () => Promise<void>;
  logout?: () => Promise<void>;
  getAccessToken?: () => Promise<string>;
};

export function usePrivy(): UsePrivyReturn {
  return useMemo(() => {
    if (Platform.OS === 'web') {
      return {
        ready: false,
        authenticated: false,
        user: null,
        login: async () => {},
        logout: async () => {},
        getAccessToken: async () => '',
      };
    }
    return {
      ready: false,
      authenticated: false,
      user: null,
      login: async () => {},
      logout: async () => {},
      getAccessToken: async () => '',
    };
  }, []);
}
