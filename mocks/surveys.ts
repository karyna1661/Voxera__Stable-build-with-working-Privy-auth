import { Survey, VoiceResponse, DemoVideo, FeedbackVault } from '@/types/survey';

const mockUsers = [
  {
    id: '1',
    name: 'Alex Chen',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    address: '0x1234567890123456789012345678901234567890'
  },
  {
    id: '2', 
    name: 'Sarah Kim',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    address: '0x2345678901234567890123456789012345678901'
  },
  {
    id: '3',
    name: 'Marcus Johnson', 
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    address: '0x3456789012345678901234567890123456789012'
  },
  {
    id: '4',
    name: 'Elena Rodriguez',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', 
    address: '0x4567890123456789012345678901234567890123'
  },
  {
    id: '5',
    name: 'David Park',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    address: '0x5678901234567890123456789012345678901234'
  }
];

// Mock Demo Videos
export const mockDemoVideos: DemoVideo[] = [
  {
    id: 'demo-1',
    title: 'AI-Powered Code Review Tool',
    description: 'A revolutionary tool that uses machine learning to automatically review code and suggest improvements.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop',
    duration: 120,
    creator: mockUsers[0],
    createdAt: '2024-01-15T10:30:00Z',
    category: 'Technology',
    tags: ['AI', 'Developer Tools', 'Code Review'],
    responseCount: 23,
    resonanceScore: 87,
    feedbackVaultId: 'vault-demo-1',
    allowAnonymous: true,
    enableTips: true
  },
  {
    id: 'demo-2',
    title: 'Sustainable Fashion Marketplace',
    description: 'Connecting eco-conscious consumers with sustainable fashion brands through our innovative platform.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
    duration: 95,
    creator: mockUsers[1],
    createdAt: '2024-01-14T15:45:00Z',
    category: 'Business',
    tags: ['Sustainability', 'Fashion', 'Marketplace'],
    responseCount: 18,
    resonanceScore: 92,
    feedbackVaultId: 'vault-demo-2',
    allowAnonymous: true,
    enableTips: true
  },
  {
    id: 'demo-3',
    title: 'Mental Health Support App',
    description: 'A comprehensive mental health platform offering personalized support and professional guidance.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop',
    duration: 180,
    creator: mockUsers[2],
    createdAt: '2024-01-13T09:20:00Z',
    category: 'Health & Wellness',
    tags: ['Mental Health', 'Wellness', 'Support'],
    responseCount: 31,
    resonanceScore: 95,
    feedbackVaultId: 'vault-demo-3',
    allowAnonymous: true,
    enableTips: true
  }
];

// Mock Feedback Vaults
export const mockFeedbackVaults: FeedbackVault[] = [
  {
    id: 'vault-demo-1',
    title: 'AI-Powered Code Review Tool Feedback',
    description: 'Voice feedback for the AI code review demo',
    type: 'demo',
    demoVideoId: 'demo-1',
    creator: mockUsers[0],
    createdAt: '2024-01-15T10:30:00Z',
    responseCount: 23,
    resonanceScore: 87,
    responses: [],
    category: 'Technology',
    allowAnonymous: true,
    enableTips: true
  },
  {
    id: 'vault-demo-2',
    title: 'Sustainable Fashion Marketplace Feedback',
    description: 'Voice feedback for the sustainable fashion demo',
    type: 'demo',
    demoVideoId: 'demo-2',
    creator: mockUsers[1],
    createdAt: '2024-01-14T15:45:00Z',
    responseCount: 18,
    resonanceScore: 92,
    responses: [],
    category: 'Business',
    allowAnonymous: true,
    enableTips: true
  },
  {
    id: 'vault-external-1',
    title: 'Tech Talk Podcast Episode #42',
    description: 'Voice feedback for our discussion on the future of AI',
    type: 'external',
    externalUrl: 'https://example.com/podcast/episode-42',
    creator: mockUsers[3],
    createdAt: '2024-01-12T14:00:00Z',
    responseCount: 15,
    resonanceScore: 78,
    responses: [],
    category: 'Technology',
    allowAnonymous: true,
    enableTips: false
  }
];

// Mock Voice Responses (updated for vaults)
export const mockVoiceResponses: VoiceResponse[] = [
  {
    id: 'response-1',
    vaultId: 'vault-demo-1',
    surveyId: 'survey-1', // backward compatibility
    userId: '2',
    user: mockUsers[1],
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    duration: 45,
    transcript: 'This AI code review tool looks incredibly promising! I love how it integrates with existing workflows.',
    createdAt: '2024-01-15T11:15:00Z',
    resonanceScore: 89,
    interactions: {
      boosts: 12,
      echoes: 3,
      mutes: 0
    },
    type: 'audio'
  },
  {
    id: 'response-2',
    vaultId: 'vault-demo-2',
    surveyId: 'survey-2',
    userId: '3',
    user: mockUsers[2],
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    duration: 38,
    transcript: 'The sustainable fashion angle is brilliant. We need more platforms like this to drive change.',
    createdAt: '2024-01-14T16:30:00Z',
    resonanceScore: 92,
    interactions: {
      boosts: 15,
      echoes: 5,
      mutes: 1
    },
    type: 'audio'
  },
  {
    id: 'response-3',
    vaultId: 'vault-demo-3',
    surveyId: 'survey-3',
    userId: '4',
    user: mockUsers[3],
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    duration: 52,
    transcript: 'Mental health support is so important. The personalized approach you described could really help people.',
    createdAt: '2024-01-13T10:45:00Z',
    resonanceScore: 96,
    interactions: {
      boosts: 18,
      echoes: 7,
      mutes: 0
    },
    type: 'audio'
  },
  {
    id: 'response-4',
    vaultId: 'vault-external-1',
    userId: '5',
    user: mockUsers[4],
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    duration: 41,
    transcript: 'Great podcast episode! The AI discussion was really insightful and thought-provoking.',
    createdAt: '2024-01-12T15:20:00Z',
    resonanceScore: 84,
    interactions: {
      boosts: 9,
      echoes: 2,
      mutes: 0
    },
    type: 'audio'
  }
];

// Keep mock surveys for backward compatibility
export const mockSurveys: Survey[] = [
  {
    id: '1',
    title: 'REPLY Community Improvement',
    question: 'What\'s the #1 thing you\'d want REPLY to improve about online community chats?',
    creator: {
      id: 'user1',
      name: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b',
    },
    createdAt: '2025-01-13T10:00:00Z',
    responseCount: 28,
    resonanceScore: 142,
    responses: [],
  },
  {
    id: '2',
    title: 'Future of Remote Work',
    question: 'How do you think remote work will evolve in the next 5 years? What changes do you expect to see in workplace culture and productivity?',
    creator: {
      id: 'user1',
      name: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    },
    createdAt: '2025-01-09T10:00:00Z',
    responseCount: 23,
    resonanceScore: 87,
    responses: [],
  },
  {
    id: '3',
    title: 'AI in Creative Industries',
    question: 'What role should AI play in creative fields like music, art, and writing? Where do you draw the line between AI assistance and human creativity?',
    creator: {
      id: 'user2',
      name: 'Marcus Johnson',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    },
    createdAt: '2025-01-09T08:30:00Z',
    responseCount: 41,
    resonanceScore: 124,
    responses: [],
  }
];

// Legacy mock responses with vaultId added for backward compatibility
export const mockResponses: VoiceResponse[] = [
  {
    id: 'resp1',
    vaultId: 'vault-legacy-1', // Add vaultId for backward compatibility
    surveyId: '1',
    userId: 'user7',
    user: {
      id: 'user7',
      name: 'Jordan Lee',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
    },
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    type: 'audio' as const,
    duration: 45000,
    transcript: 'Better notification systems and real-time collaboration features would make REPLY the go-to for professional teams.',
    createdAt: '2025-01-09T11:15:00Z',
    resonanceScore: 23,
    interactions: {
      boosts: 12,
      echoes: 8,
      mutes: 1,
    },
  },
  {
    id: 'resp2',
    vaultId: 'vault-legacy-1',
    surveyId: '1',
    userId: 'user8',
    user: {
      id: 'user8',
      name: 'Taylor Swift',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    },
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    type: 'audio' as const,
    duration: 62000,
    transcript: 'Custom emoji reactions and better message formatting options would improve expression in REPLY chats.',
    createdAt: '2025-01-09T12:30:00Z',
    resonanceScore: 31,
    interactions: {
      boosts: 18,
      echoes: 11,
      mutes: 2,
    },
  },
  {
    id: 'resp3',
    vaultId: 'vault-legacy-2',
    surveyId: '2',
    userId: 'user9',
    user: {
      id: 'user9',
      name: 'Chris Evans',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
    },
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    type: 'audio' as const,
    duration: 38000,
    transcript: 'AI should be a tool that enhances human creativity, not replaces it entirely.',
    createdAt: '2025-01-09T09:45:00Z',
    resonanceScore: 19,
    interactions: {
      boosts: 9,
      echoes: 7,
      mutes: 0,
    },
  }
];