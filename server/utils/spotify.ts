import { IUser } from "../../types/auth"
import { SongItem, SpotifyTopTracksResult } from "../../types/spotify"

export const getTopSongsForUser = async (timeRange: string, songsPerUser: number, token: string, user: IUser): Promise<{song: SongItem, player: IUser}[]> => {
  return new Promise<{song: SongItem, player: IUser}[]>(async function(resolve, reject) {
    await fetch(
      `https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=${songsPerUser}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    ).then((response) => {
      if (response.status === 200) {
        return response.json();
      } else if (response.status === 201) {
        reject(201)
      } else {
        reject(response.status)
      }
    }).then((data: SpotifyTopTracksResult) => {
      const result: {song: SongItem, player: IUser}[] = data.items.map((item) => ({
        song: item,
        player: user,
      }));
      if (result.length === 0) {
        reject(400)
      } else {
        resolve(result);
      }
    })
  });
};