import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Survey, ResonanceInteraction, VoiceResponse, CreateSurveyRequest, CreateResponseRequest, User } from '@/types/survey';
import { apiService } from '@/services/api';
import { mockSurveys, mockResponses } from '@/mocks/surveys';
import { Platform } from 'react-native';

// Environment flag to use mock data or real API
const USE_MOCK_DATA = !process.env.EXPO_PUBLIC_API_URL;

export function useSurveys(filter?: 'trending' | 'newest') {
  return useQuery({
    queryKey: ['surveys', filter],
    queryFn: async (): Promise<Survey[]> => {
      if (USE_MOCK_DATA) {
        console.log('Using mock data for surveys');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Get surveys from storage if available, otherwise use mock data
        let surveys = [...mockSurveys];
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          const storedSurveys = localStorage.getItem('allSurveys');
          if (storedSurveys) {
            surveys = JSON.parse(storedSurveys);
          }
        }
        
        if (filter === 'trending') {
          surveys = surveys.filter(s => s.resonanceScore > 50).sort((a, b) => b.resonanceScore - a.resonanceScore);
        } else if (filter === 'newest') {
          surveys = surveys.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } else {
          surveys = surveys.sort((a, b) => b.resonanceScore - a.resonanceScore);
        }
        
        return surveys;
      }
      
      console.log('Fetching surveys from API...');
      return apiService.getSurveys(filter);
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useTrendingResponses() {
  return useQuery({
    queryKey: ['trending-responses'],
    queryFn: async (): Promise<VoiceResponse[]> => {
      if (USE_MOCK_DATA) {
        console.log('Using mock data for trending responses');
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Shuffle responses for random feed and sort by resonance score
        const shuffled = [...mockResponses].sort(() => Math.random() - 0.5);
        return shuffled.sort((a, b) => b.resonanceScore - a.resonanceScore);
      }
      
      console.log('Fetching trending responses from API...');
      return apiService.getTrendingResponses();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useSurvey(id: string) {
  return useQuery({
    queryKey: ['survey', id],
    queryFn: async (): Promise<Survey | null> => {
      if (USE_MOCK_DATA) {
        console.log('Using mock data for survey:', id);
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Check storage first, then fallback to mock data
        let allSurveys = [...mockSurveys];
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          const storedSurveys = localStorage.getItem('allSurveys');
          if (storedSurveys) {
            allSurveys = JSON.parse(storedSurveys);
          }
        }
        
        const survey = allSurveys.find(s => s.id === id);
        if (!survey) {
          console.log('Survey not found with id:', id);
          return null;
        }
        
        const responses = mockResponses.filter(r => r.surveyId === id);
        return { ...survey, responses };
      }
      
      console.log('Fetching survey from API:', id);
      return apiService.getSurvey(id);
    },
    enabled: !!id,
  });
}

export function useCreateSurvey() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateSurveyRequest & { user?: User }): Promise<Survey> => {
      if (USE_MOCK_DATA) {
        console.log('Mock creating survey for user:', data.user?.address);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (!data.user?.address) {
          throw new Error('User address is required to create a survey');
        }
        
        // Return a mock survey with proper user info
        const mockSurvey: Survey = {
          id: `survey-${Date.now()}`,
          title: data.title,
          question: data.question,
          creator: {
            id: data.user.id,
            name: data.user.farcaster?.displayName || data.user.name || `User ${data.user.address.slice(0, 6)}`,
            avatar: data.user.farcaster?.pfpUrl || data.user.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            address: data.user.address,
          },
          createdAt: new Date().toISOString(),
          responseCount: 0,
          resonanceScore: Math.floor(Math.random() * 20), // Random initial score
          responses: [],
          category: data.category,
          additionalContext: data.additionalContext,
          allowAnonymous: data.allowAnonymous,
          enableTips: data.enableTips,
        };
        
        // Store in storage for persistence in mock mode
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          // Store user-specific surveys
          const userSurveysKey = `userSurveys_${data.user.address.toLowerCase()}`;
          const existingUserSurveys = JSON.parse(localStorage.getItem(userSurveysKey) || '[]');
          existingUserSurveys.push(mockSurvey);
          localStorage.setItem(userSurveysKey, JSON.stringify(existingUserSurveys));
          
          // Add to global surveys for marketplace visibility
          const allSurveys = JSON.parse(localStorage.getItem('allSurveys') || JSON.stringify(mockSurveys));
          allSurveys.unshift(mockSurvey); // Add to beginning for newest first
          localStorage.setItem('allSurveys', JSON.stringify(allSurveys));
          
          console.log(`Survey created and stored for user ${data.user.address}`);
        }
        
        return mockSurvey;
      }
      
      console.log('Creating survey via API:', data);
      return apiService.createSurvey(data);
    },
    onSuccess: (survey, variables) => {
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      queryClient.invalidateQueries({ queryKey: ['user-surveys'] });
      if (variables.user?.address) {
        queryClient.invalidateQueries({ queryKey: ['user-surveys', variables.user.address] });
      }
      console.log('Survey creation successful, queries invalidated');
    },
  });
}

export function useResonanceInteraction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (interaction: ResonanceInteraction) => {
      if (USE_MOCK_DATA) {
        console.log('Mock resonance interaction:', interaction);
        await new Promise(resolve => setTimeout(resolve, 200));
        return;
      }
      
      console.log('Submitting resonance interaction:', interaction);
      return apiService.submitResonanceInteraction(
        interaction.type,
        interaction.targetId,
        interaction.targetType as 'survey' | 'response'
      );
    },
    onSuccess: (_, interaction) => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      queryClient.invalidateQueries({ queryKey: ['survey', interaction.targetId] });
      queryClient.invalidateQueries({ queryKey: ['trending-responses'] });
    }
  });
}

// Hook to get user-specific surveys
export function useUserSurveys(userAddress?: string) {
  return useQuery({
    queryKey: ['user-surveys', userAddress],
    queryFn: async (): Promise<Survey[]> => {
      if (!userAddress) return [];
      
      if (USE_MOCK_DATA) {
        console.log('Fetching user surveys for:', userAddress);
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Get surveys from storage in mock mode
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          // First try user-specific key
          const userSurveysKey = `userSurveys_${userAddress.toLowerCase()}`;
          const userSpecificSurveys = JSON.parse(localStorage.getItem(userSurveysKey) || '[]');
          
          if (userSpecificSurveys.length > 0) {
            return userSpecificSurveys;
          }
          
          // Fallback to checking all surveys
          const allSurveys = JSON.parse(localStorage.getItem('allSurveys') || JSON.stringify(mockSurveys));
          return allSurveys.filter((survey: Survey) => 
            survey.creator.address?.toLowerCase() === userAddress.toLowerCase()
          );
        }
        
        // Fallback to mock surveys that match the user
        return mockSurveys.filter(survey => 
          survey.creator.address?.toLowerCase() === userAddress.toLowerCase()
        );
      }
      
      console.log('Fetching user surveys from API for:', userAddress);
      return apiService.getUserSurveys(userAddress);
    },
    enabled: !!userAddress,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useSubmitResponse() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ surveyId, audioUrl, duration }: { surveyId: string; audioUrl: string; duration: number }) => {
      if (USE_MOCK_DATA) {
        console.log('Mock submitting response:', { surveyId, audioUrl, duration });
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { success: true };
      }
      
      console.log('Submitting response via API:', { surveyId, audioUrl, duration });
      
      // Convert audio URL to file for API submission
      let audioFile: File | { uri: string; name: string; type: string } | undefined;
      
      if (audioUrl) {
        if (Platform.OS === 'web') {
          // For web, convert blob URL to File
          try {
            const response = await fetch(audioUrl);
            const blob = await response.blob();
            audioFile = new File([blob], 'recording.webm', { type: 'audio/webm' });
          } catch (error) {
            console.error('Failed to convert audio URL to file:', error);
          }
        } else {
          // For mobile, use the URI directly
          const uriParts = audioUrl.split('.');
          const fileType = uriParts[uriParts.length - 1] || 'wav';
          audioFile = {
            uri: audioUrl,
            name: `recording.${fileType}`,
            type: `audio/${fileType}`,
          };
        }
      }
      
      const requestData: CreateResponseRequest = {
        vaultId: surveyId, // Use surveyId as vaultId for backward compatibility
        surveyId,
        type: 'audio',
        audioFile,
        duration,
      };
      
      return apiService.createResponse(requestData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      queryClient.invalidateQueries({ queryKey: ['trending-responses'] });
      queryClient.invalidateQueries({ queryKey: ['user-surveys'] });
    }
  });
}