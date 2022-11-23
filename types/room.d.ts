export interface IRoom {
	roomCode: string;
	host: IUser;
	players: IUser[];
}