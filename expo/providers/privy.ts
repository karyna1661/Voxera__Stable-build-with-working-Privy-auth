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
      console.log('Privy login not implemented - authentication disabled');
    },
    logout: async () => {
      console.log('Privy logout not implemented');
    },
    getAccessToken: async () => '',
  }), []);
}
