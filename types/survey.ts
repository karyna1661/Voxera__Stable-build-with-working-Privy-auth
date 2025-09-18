export interface DemoVideo {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number;
  creator: {
    id: string;
    name: string;
    avatar: string;
    address?: string;
  };
  createdAt: string;
  category: string;
  tags: string[];
  responseCount: number;
  resonanceScore: number;
  qrCodeUrl?: string;
  feedbackVaultId: string;
  allowAnonymous?: boolean;
  enableTips?: boolean;
}

export interface FeedbackVault {
  id: string;
  title: string;
  description?: string;
  type: 'demo' | 'external'; // demo = hosted on Voxera, external = podcast/livestream etc
  demoVideoId?: string; // if type is 'demo'
  externalUrl?: string; // if type is 'external'
  creator: {
    id: string;
    name: string;
    avatar: string;
    address?: string;
  };
  createdAt: string;
  responseCount: number;
  resonanceScore: number;
  responses: VoiceResponse[];
  category?: string;
  allowAnonymous?: boolean;
  enableTips?: boolean;
}

// Keep Survey for backward compatibility but mark as deprecated
/** @deprecated Use DemoVideo and FeedbackVault instead */
export interface Survey {
  id: string;
  title: string;
  question: string;
  creator: {
    id: string;
    name: string;
    avatar: string;
    address?: string;
  };
  createdAt: string;
  expiresAt?: string;
  responseCount: number;
  resonanceScore: number;
  audioUrl?: string;
  duration?: number;
  responses: VoiceResponse[];
  pinataCid?: string;
  category?: string;
  tags?: string[];
  additionalContext?: string;
  allowAnonymous?: boolean;
  enableTips?: boolean;
}

export interface VoiceResponse {
  id: string;
  vaultId: string; // Changed from surveyId to vaultId
  surveyId?: string; // Keep for backward compatibility
  parentResponseId?: string; // For nested responses
  userId: string;
  user: {
    id: string;
    name: string;
    avatar: string;
    address?: string;
  };
  audioUrl: string;
  duration: number;
  transcript?: string;
  createdAt: string;
  resonanceScore: number;
  interactions: {
    boosts: number;
    echoes: number;
    mutes: number;
  };
  pinataCid?: string;
  type: 'text' | 'audio';
  content?: string;
}

export interface ResonanceInteraction {
  type: 'boost' | 'echo' | 'mute';
  targetId: string;
  targetType: 'survey' | 'response' | 'demo' | 'vault';
  userId: string;
}

export interface ListeningProgress {
  contentId: string;
  userId: string;
  duration: number;
  totalDuration: number;
  percentage: number;
  completed: boolean;
}

export interface User {
  id: string;
  address: string;
  name?: string;
  avatar?: string;
  createdAt: string;
  farcaster?: {
    fid: number;
    username: string;
    displayName: string;
    bio?: string;
    followerCount: number;
    followingCount: number;
    pfpUrl?: string;
  };
  email?: string;
  walletType?: 'metamask' | 'coinbase' | 'walletconnect' | 'farcaster' | 'email';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface CreateDemoVideoRequest {
  title: string;
  description: string;
  category: string;
  tags: string[];
  videoFile: File | { uri: string; name: string; type: string };
  thumbnailFile?: File | { uri: string; name: string; type: string };
  allowAnonymous?: boolean;
  enableTips?: boolean;
}

export interface CreateFeedbackVaultRequest {
  title: string;
  description?: string;
  type: 'external';
  externalUrl: string;
  category?: string;
  allowAnonymous?: boolean;
  enableTips?: boolean;
}

export interface CreateResponseRequest {
  vaultId: string;
  surveyId?: string; // Keep for backward compatibility
  type: 'text' | 'audio';
  content?: string;
  audioFile?: File | { uri: string; name: string; type: string };
  duration?: number;
}

// Keep for backward compatibility
/** @deprecated Use CreateDemoVideoRequest or CreateFeedbackVaultRequest instead */
export interface CreateSurveyRequest {
  title: string;
  question: string;
  category: string;
  additionalContext?: string;
  allowAnonymous?: boolean;
  enableTips?: boolean;
  voicePromptFile?: File | { uri: string; name: string; type: string };
}