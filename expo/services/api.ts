import { Platform } from 'react-native';
import { Survey, VoiceResponse, User, CreateSurveyRequest, CreateResponseRequest } from '@/types/survey';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

class ApiService {
  private authToken: string | null = null;

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  private getAuthToken(): string | null {
    return this.authToken;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getAuthToken();
    const url = `${API_BASE_URL}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  private async makeFormRequest<T>(
    endpoint: string,
    formData: FormData
  ): Promise<T> {
    const token = this.getAuthToken();
    const url = `${API_BASE_URL}${endpoint}`;

    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Auth endpoints
  async getSiweMessage(address: string): Promise<{ message: string; nonce: string }> {
    return this.makeRequest('/api/auth/siwe/message', {
      method: 'POST',
      body: JSON.stringify({ address }),
    });
  }

  async verifySiweSignature(message: string, signature: string): Promise<{ token: string; user: User }> {
    return this.makeRequest('/api/auth/siwe/verify', {
      method: 'POST',
      body: JSON.stringify({ message, signature }),
    });
  }

  async getCurrentUser(): Promise<User> {
    return this.makeRequest('/api/auth/me');
  }

  // Survey endpoints
  async getSurveys(filter?: 'trending' | 'newest'): Promise<Survey[]> {
    const params = filter ? `?filter=${filter}` : '';
    return this.makeRequest(`/api/surveys${params}`);
  }

  async getUserSurveys(userAddress: string): Promise<Survey[]> {
    return this.makeRequest(`/api/surveys/user/${encodeURIComponent(userAddress)}`);
  }

  async getSurvey(id: string): Promise<Survey> {
    return this.makeRequest(`/api/surveys/${id}`);
  }

  async createSurvey(data: CreateSurveyRequest): Promise<Survey> {
    const formData = new FormData();
    
    formData.append('title', data.title);
    formData.append('question', data.question);
    formData.append('category', data.category);
    
    if (data.additionalContext) {
      formData.append('additionalContext', data.additionalContext);
    }
    
    formData.append('allowAnonymous', String(data.allowAnonymous ?? true));
    formData.append('enableTips', String(data.enableTips ?? true));
    
    if (data.voicePromptFile) {
      if (Platform.OS === 'web') {
        formData.append('voicePrompt', data.voicePromptFile as File);
      } else {
        const file = data.voicePromptFile as { uri: string; name: string; type: string };
        formData.append('voicePrompt', file as any);
      }
    }

    return this.makeFormRequest('/api/surveys', formData);
  }

  // Response endpoints
  async getTrendingResponses(): Promise<VoiceResponse[]> {
    return this.makeRequest('/api/feedback/trending');
  }

  async getSurveyResponses(surveyId: string): Promise<VoiceResponse[]> {
    return this.makeRequest(`/api/surveys/${surveyId}/responses`);
  }

  async createResponse(data: CreateResponseRequest): Promise<VoiceResponse> {
    const formData = new FormData();
    
    formData.append('surveyId', data.surveyId);
    formData.append('type', data.type);
    
    if (data.content) {
      formData.append('content', data.content);
    }
    
    if (data.duration) {
      formData.append('duration', String(data.duration));
    }
    
    if (data.audioFile) {
      if (Platform.OS === 'web') {
        formData.append('audio', data.audioFile as File);
      } else {
        const file = data.audioFile as { uri: string; name: string; type: string };
        formData.append('audio', file as any);
      }
    }

    return this.makeFormRequest('/api/feedback', formData);
  }

  // Resonance interactions
  async submitResonanceInteraction(
    type: 'boost' | 'echo' | 'mute',
    targetId: string,
    targetType: 'survey' | 'response'
  ): Promise<void> {
    return this.makeRequest('/api/resonance', {
      method: 'POST',
      body: JSON.stringify({ type, targetId, targetType }),
    });
  }
}

export const apiService = new ApiService();
export default apiService;