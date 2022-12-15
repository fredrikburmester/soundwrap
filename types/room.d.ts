import { SongItem } from "./spotify"

export type IRoom = {
	roomCode: string;
	host: IUser;
	players: IUser[];
	gamePosition: number;
	songs: {song: SongItem, player: IUser}[]
	songsPerUser: number;
	currentSongIndex: number;
	timeRange: string;
}