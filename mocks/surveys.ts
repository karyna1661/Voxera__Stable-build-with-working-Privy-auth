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
    surveyId: '1', // Link to Base Chain Adoption survey
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
    surveyId: '2', // Link to Farcaster vs Twitter survey
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
    surveyId: '3', // Link to DeFi on Base survey
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
    surveyId: '4', // Link to Onchain Social Future survey
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
    title: 'Base Chain Adoption',
    question: 'What\'s the biggest barrier preventing mainstream adoption of Base chain? Is it UX, gas fees, or something else?',
    creator: {
      id: 'user1',
      name: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b',
    },
    createdAt: '2025-01-13T10:00:00Z',
    responseCount: 28,
    resonanceScore: 142,
    responses: [
      {
        id: 'resp1',
        vaultId: 'vault-legacy-1',
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
        transcript: 'I think the biggest barrier is definitely UX. Most people still find wallet interactions confusing and intimidating.',
        createdAt: '2025-01-13T11:15:00Z',
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
        transcript: 'Gas fees are still a concern for smaller transactions, even though Base is much cheaper than mainnet.',
        createdAt: '2025-01-13T12:30:00Z',
        resonanceScore: 31,
        interactions: {
          boosts: 18,
          echoes: 11,
          mutes: 2,
        },
      }
    ],
    tags: ['Base', 'Blockchain', 'UX'],
  },
  {
    id: '2',
    title: 'Farcaster vs Twitter',
    question: 'How has your experience on Farcaster compared to traditional social media? What keeps you coming back?',
    creator: {
      id: 'user1',
      name: 'Alex Rivera',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
    },
    createdAt: '2025-01-12T15:30:00Z',
    responseCount: 34,
    resonanceScore: 156,
    responses: [
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
        transcript: 'Farcaster feels more authentic. The community is smaller but more engaged, and I love the crypto-native features.',
        createdAt: '2025-01-12T16:45:00Z',
        resonanceScore: 19,
        interactions: {
          boosts: 9,
          echoes: 7,
          mutes: 0,
        },
      }
    ],
    tags: ['Farcaster', 'Social Media', 'Web3'],
  },
  {
    id: '3',
    title: 'DeFi on Base',
    question: 'Which DeFi protocols on Base have impressed you the most? What makes them stand out from Ethereum mainnet alternatives?',
    creator: {
      id: 'user2',
      name: 'Marcus Johnson',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    },
    createdAt: '2025-01-11T08:30:00Z',
    responseCount: 41,
    resonanceScore: 124,
    responses: [],
    tags: ['DeFi', 'Base', 'Protocols'],
  },
  {
    id: '4',
    title: 'Onchain Social Future',
    question: 'Do you think onchain social networks like Farcaster will eventually replace Web2 platforms? What needs to happen first?',
    creator: {
      id: 'user3',
      name: 'Emma Thompson',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      address: '0xA0b86a33E6441e8e421b7b4c4b4c4b4c4b4c4b4c',
    },
    createdAt: '2025-01-10T14:20:00Z',
    responseCount: 52,
    resonanceScore: 189,
    responses: [],
    tags: ['Social Networks', 'Web3', 'Future'],
  },
  {
    id: '5',
    title: 'Base Ecosystem Growth',
    question: 'What type of dApps or projects would you most like to see built on Base? Gaming, social, DeFi, or something else entirely?',
    creator: {
      id: 'user4',
      name: 'David Park',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      address: '0xB1f8e55c7f64d203C1400B9D8555d050F94aDF81',
    },
    createdAt: '2025-01-09T11:45:00Z',
    responseCount: 29,
    resonanceScore: 98,
    responses: [],
    tags: ['Base', 'dApps', 'Gaming'],
  },
  {
    id: '6',
    title: 'Farcaster Frames Innovation',
    question: 'What\'s the most creative or useful Farcaster Frame you\'ve encountered? How do you see Frames evolving?',
    creator: {
      id: 'user5',
      name: 'Luna Martinez',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    },
    createdAt: '2025-01-08T16:10:00Z',
    responseCount: 37,
    resonanceScore: 167,
    responses: [],
    tags: ['Farcaster', 'Frames', 'Innovation'],
  },
  {
    id: '7',
    title: 'Crypto UX Challenges',
    question: 'What\'s the most frustrating UX issue you face when using crypto apps? How would you fix it?',
    creator: {
      id: 'user6',
      name: 'Jordan Kim',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    },
    createdAt: '2025-01-07T09:25:00Z',
    responseCount: 45,
    resonanceScore: 203,
    responses: [],
    tags: ['Crypto', 'UX', 'Design'],
  },
  {
    id: '8',
    title: 'Base vs L2 Competition',
    question: 'How does Base stack up against other L2s like Arbitrum and Optimism? What are Base\'s unique advantages?',
    creator: {
      id: 'user7',
      name: 'Riley Chen',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    },
    createdAt: '2025-01-06T13:40:00Z',
    responseCount: 31,
    resonanceScore: 134,
    responses: [],
    tags: ['Base', 'Layer 2', 'Comparison'],
  },
  {
    id: '9',
    title: 'DEGEN Token Usage',
    question: 'How do you currently use $DEGEN with DEGEN tipping gone?',
    creator: {
      id: 'user8',
      name: 'Crypto Degen',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
      address: '0xDEGEN123456789012345678901234567890123456',
    },
    createdAt: '2025-01-05T10:15:00Z',
    responseCount: 67,
    resonanceScore: 178,
    responses: [],
    tags: ['DEGEN', 'Token', 'Usage'],
  },
  {
    id: '10',
    title: 'DEGEN Holding Strategy',
    question: 'What would make you hold DEGEN longer instead of selling quickly?',
    creator: {
      id: 'user9',
      name: 'Token Hodler',
      avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop&crop=face',
      address: '0xHODLER789012345678901234567890123456789',
    },
    createdAt: '2025-01-04T14:30:00Z',
    responseCount: 89,
    resonanceScore: 245,
    responses: [],
    tags: ['DEGEN', 'Holding', 'Strategy'],
  },
  {
    id: '11',
    title: 'HIGHER Direction',
    question: 'Which direction should HIGHER focus on: creator tools, community events?',
    creator: {
      id: 'user10',
      name: 'Higher Vision',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
      address: '0xHIGHER456789012345678901234567890123456',
    },
    createdAt: '2025-01-03T09:45:00Z',
    responseCount: 54,
    resonanceScore: 167,
    responses: [],
    tags: ['HIGHER', 'Direction', 'Community'],
  },
  {
    id: '12',
    title: 'HIGHER Missing Features',
    question: 'What\'s missing today that would make HIGHER indispensable to you?',
    creator: {
      id: 'user11',
      name: 'Community Builder',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
      address: '0xBUILDER234567890123456789012345678901234',
    },
    createdAt: '2025-01-02T16:20:00Z',
    responseCount: 42,
    resonanceScore: 198,
    responses: [],
    tags: ['HIGHER', 'Features', 'Product'],
  },
  {
    id: '13',
    title: 'HIGHER Early Believers',
    question: 'How should HIGHER reward its earliest believers?',
    creator: {
      id: 'user12',
      name: 'Early Adopter',
      avatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face',
      address: '0xEARLY567890123456789012345678901234567890',
    },
    createdAt: '2025-01-01T12:00:00Z',
    responseCount: 73,
    resonanceScore: 289,
    responses: [],
    tags: ['HIGHER', 'Rewards', 'Community'],
  },
  {
    id: '14',
    title: 'FALSENINE Fan Experience',
    question: 'What fan experience would you want most with FALSENINE: live match polls, fantasy leagues, or fan rewards? What feature would keep you engaging during the off-season?',
    creator: {
      id: 'user13',
      name: 'Sports Fan',
      avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=150&h=150&fit=crop&crop=face',
      address: '0xSPORTS890123456789012345678901234567890',
    },
    createdAt: '2024-12-31T18:30:00Z',
    responseCount: 91,
    resonanceScore: 234,
    responses: [],
    tags: ['FALSENINE', 'Sports', 'Fan Experience'],
  },
  {
    id: '15',
    title: 'REPLY Usage Patterns',
    question: 'How do you use REPLY: messaging, community coordination, or content engagement?',
    creator: {
      id: 'user14',
      name: 'Communication Pro',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      address: '0xREPLY123456789012345678901234567890123456',
    },
    createdAt: '2024-12-30T11:15:00Z',
    responseCount: 38,
    resonanceScore: 156,
    responses: [],
    tags: ['REPLY', 'Communication', 'Usage'],
  },
  {
    id: '16',
    title: 'QR Project Discovery',
    question: 'How should QR make it easier for you to discover and join new projects?',
    creator: {
      id: 'user15',
      name: 'Project Explorer',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      address: '0xEXPLORER678901234567890123456789012345678',
    },
    createdAt: '2024-12-29T15:45:00Z',
    responseCount: 29,
    resonanceScore: 142,
    responses: [],
    tags: ['QR', 'Discovery', 'Projects'],
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
  },
  {
    id: 'resp4',
    vaultId: 'vault-legacy-3',
    surveyId: '5', // Link to Base Ecosystem Growth survey
    userId: 'user10',
    user: {
      id: 'user10',
      name: 'Maya Patel',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    },
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    type: 'audio' as const,
    duration: 52000,
    transcript: 'I think gaming dApps on Base would be huge. The low fees make microtransactions actually viable.',
    createdAt: '2025-01-08T14:20:00Z',
    resonanceScore: 67,
    interactions: {
      boosts: 24,
      echoes: 12,
      mutes: 1,
    },
  },
  {
    id: 'resp5',
    vaultId: 'vault-legacy-4',
    surveyId: '6', // Link to Farcaster Frames Innovation survey
    userId: 'user11',
    user: {
      id: 'user11',
      name: 'Alex Thompson',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    },
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    type: 'audio' as const,
    duration: 41000,
    transcript: 'The prediction market frames are incredible. Being able to bet directly in the feed is revolutionary.',
    createdAt: '2025-01-07T16:45:00Z',
    resonanceScore: 89,
    interactions: {
      boosts: 31,
      echoes: 18,
      mutes: 0,
    },
  }
];