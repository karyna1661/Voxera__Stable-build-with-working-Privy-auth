const NEYNAR_API_KEY = '93111B1D-3CD1-48A1-A7BC-4CABE2F46DBD';
const NEYNAR_CLIENT_ID = '29f89098-0baf-4d35-ba99-424265c43a19';
const NEYNAR_BASE_URL = 'https://api.neynar.com/v2';

export interface FarcasterUser {
  fid: number;
  username: string;
  display_name: string;
  bio?: string;
  follower_count: number;
  following_count: number;
  pfp_url?: string;
  verified_addresses?: {
    eth_addresses: string[];
  };
}

class FarcasterService {
  private async makeRequest<T>(endpoint: string): Promise<T | null> {
    try {
      const response = await fetch(`${NEYNAR_BASE_URL}${endpoint}`, {
        headers: {
          'Accept': 'application/json',
          'api_key': NEYNAR_API_KEY,
        },
      });

      if (!response.ok) {
        if (response.status === 402) {
          console.warn('Neynar API quota exceeded or payment required - continuing without Farcaster data');
          return null; // Return null instead of throwing to allow graceful degradation
        }
        if (response.status === 404) {
          console.log('Farcaster user not found - this is normal for many users');
          return null;
        }
        throw new Error(`Neynar API error: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error && error.message.includes('quota exceeded')) {
        throw error;
      }
      console.error('Network error accessing Neynar API:', error);
      throw new Error('Failed to connect to Farcaster service');
    }
  }

  async getUserByFid(fid: number): Promise<FarcasterUser | null> {
    try {
      const response = await this.makeRequest<{ users: FarcasterUser[] }>(`/user/bulk?fids=${fid}`);
      return response?.users?.[0] || null;
    } catch (error) {
      console.error('Failed to fetch Farcaster user by FID:', error);
      return null;
    }
  }

  async getUserByUsername(username: string): Promise<FarcasterUser | null> {
    try {
      const response = await this.makeRequest<{ user: FarcasterUser }>(`/user/by_username?username=${username}`);
      return response?.user || null;
    } catch (error) {
      console.error('Failed to fetch Farcaster user by username:', error);
      return null;
    }
  }

  async getUserByAddress(address: string): Promise<FarcasterUser | null> {
    try {
      const response = await this.makeRequest<{ users: FarcasterUser[] }>(`/user/bulk-by-address?addresses=${address.toLowerCase()}`);
      return response?.users?.[0] || null;
    } catch (error) {
      console.error('Failed to fetch Farcaster user by address:', error);
      return null;
    }
  }

  // Convert Neynar user to our User farcaster field
  formatFarcasterData(farcasterUser: FarcasterUser) {
    return {
      fid: farcasterUser.fid,
      username: farcasterUser.username,
      displayName: farcasterUser.display_name,
      bio: farcasterUser.bio,
      followerCount: farcasterUser.follower_count,
      followingCount: farcasterUser.following_count,
      pfpUrl: farcasterUser.pfp_url,
    };
  }
}

export const farcasterService = new FarcasterService();
export default farcasterService;