import { useMemo } from 'react';

export type UsePrivyReturn = {
  ready: boolean;
  authenticated: boolean;
  user: any | null;
  login?: () => Promise<void>;
  logout?: () => Promise<void>;
  getAccessToken?: () => Promise<string>;
};

export function usePrivy(): UsePrivyReturn {
  return useMemo(() => ({
    ready: true,
    authenticated: false,
    user: null,
    login: async () => {
      console.log('Web login not implemented - use native app');
    },
    logout: async () => {
      console.log('Web logout not implemented');
    },
    getAccessToken: async () => '',
  }), []);
}
