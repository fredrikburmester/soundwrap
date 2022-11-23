import { useContext } from "react"
import { SongItem, SpotifyMeResult, SpotifyMyPlaylistsResult, SpotifyTopArtistsResult,SpotifyTopTracksResult } from "../types/spotify"
import { AuthContext } from "../context/authContext"

interface IMe {
  id: string;
  name: string;
  email: string;
  images: Array<{ url: string }>;
  token: string;
}

export const getMe = async (token: string) => {
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

export const getTopSongs = async (token: string, timeRange: string, offset = 0, limit = 25) => {
  console.log(token)
  const response = await fetch(`https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&offset=${offset}&limit=${limit}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json() as Promise<SpotifyTopTracksResult>;
}

export const getTopArtists = async (token: string, timeRange: string) => {
  console.log(token)
  const response = await fetch(`https://api.spotify.com/v1/me/top/artists?time_range=${timeRange}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json() as Promise<SpotifyTopArtistsResult>;
}

export const getUserPlaylists = async (token: string) => {
  const response = await fetch("https://api.spotify.com/v1/me/playlists", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  console.log(response)
  const data = response.json()
  return data as Promise<SpotifyMyPlaylistsResult>;
}
  
export const createPlaylist = async (token: string, name: string) => {
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

export const addSongsToPlaylist = async (token: string, playlistId: string, songIds: string[]) => {
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
  console.log(response)
  return response.json();
}

export const createAndAddSongsToPlaylist = async (token: string, name: string, songs: SongItem[]) => {
  console.log(token, name, songs)
  const songIds = songs.map((song) => song.uri);
  console.log(songIds)
  const { id } = await createPlaylist(token, name);
  await addSongsToPlaylist(token, id, songIds);
}
