import { AuthContextType } from "../types/auth"
import { AuthContext } from "../context/authContext"
import { useContext } from "react"
import { ArtistItem, SongItem, SpotifyMeResult, SpotifyMyPlaylistsResult, SpotifySearchResponse, SpotifyTopArtistsResult,SpotifyTopTracksResult, Tracks2 } from "../types/spotify"

export const useSpotify = () => {
  const { logout } = useContext(AuthContext) as AuthContextType;

  const getTopSongs = async (token: string, timeRange: string, offset = 0, limit = 25) => {
    const response = await fetch(`https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&offset=${offset}&limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    if(response.status === 401) {
      logout()
      return { items: [] as SongItem[] } as SpotifyTopTracksResult;
    }
  
    return response.json() as Promise<SpotifyTopTracksResult>;
  }

  const getTopArtists = async (token: string, timeRange: string) => {
    const response = await fetch(`https://api.spotify.com/v1/me/top/artists?time_range=${timeRange}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if(response.status === 401) {
      logout()
      return { items: [] as ArtistItem[] } as SpotifyTopArtistsResult;
    }

    return response.json() as Promise<SpotifyTopArtistsResult>;
  }
  
  const getUserPlaylists = async (token: string) => {
    const response = await fetch("https://api.spotify.com/v1/me/playlists", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = response.json()
    return data as Promise<SpotifyMyPlaylistsResult>;
  }

  const createPlaylist = async (token: string, name: string) => {
    const response = await fetch("https://api.spotify.com/v1/me/playlists", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
      }),
    });
    return response.json();
  }

  const addSongsToPlaylist = async (token: string, playlistId: string, songIds: string[]) => {
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uris: songIds,
      }),
    });
    return response.json();
  }

  const createAndAddSongsToPlaylist = async (token: string, name: string, songs: SongItem[]) => {
    console.log(token, name, songs);
    const songIds = songs.map((song) => song.uri);
    const { id } = await createPlaylist(token, name);
    await addSongsToPlaylist(token, id, songIds);
  }

  const searchForTracks = async (token: string, query: string, limit = 50) => {
    const response = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=track&limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    return response.json() as Promise<SpotifySearchResponse>;
  }

  return {
    getTopSongs,
    getTopArtists,
    getUserPlaylists,
    createPlaylist,
    addSongsToPlaylist,
    createAndAddSongsToPlaylist,
    searchForTracks,
  };
}