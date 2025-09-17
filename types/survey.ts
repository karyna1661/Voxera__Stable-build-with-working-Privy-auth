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
  additionalContext?: string;
  allowAnonymous?: boolean;
  enableTips?: boolean;
}

export interface VoiceResponse {
  id: string;
  surveyId: string;
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
  targetType: 'survey' | 'response';
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

export interface CreateSurveyRequest {
  title: string;
  question: string;
  category: string;
  additionalContext?: string;
  allowAnonymous?: boolean;
  enableTips?: boolean;
  voicePromptFile?: File | { uri: string; name: string; type: string };
}

export interface CreateResponseRequest {
  surveyId: string;
  type: 'text' | 'audio';
  content?: string;
  audioFile?: File | { uri: string; name: string; type: string };
  duration?: number;
}