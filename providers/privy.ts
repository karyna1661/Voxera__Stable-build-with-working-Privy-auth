import { Platform } from 'react-native';

export type UsePrivyReturn = {
  ready: boolean;
  authenticated: boolean;
  user: any | null;
  login?: () => Promise<void>;
  logout?: () => Promise<void>;
  getAccessToken?: () => Promise<string>;
};

if (Platform.OS === 'web') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  module.exports = require('./privy.web');
} else {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { usePrivy: useExpoPrivy } = require('@privy-io/expo');
  module.exports = { usePrivy: useExpoPrivy };
}
