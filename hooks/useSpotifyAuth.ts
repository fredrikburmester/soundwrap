import { SpotifyMeResult } from "../types/spotify"

export const useSpotifyAuth = () => {
  const getMe = async (token: string) => {
    const response = await fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    if(response.status !== 200) {
      throw new Error("Failed to fetch user data");
    }
  
    return response.json() as Promise<SpotifyMeResult>;
  }

  const getTokenStatus = async (token: string) => {
    const response = await fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    return response.status;
  }

  return {
    getMe,
    getTokenStatus,
  };
}