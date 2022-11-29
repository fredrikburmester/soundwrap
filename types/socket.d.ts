export interface REQUEST_TO_JOIN_ROOM {
  roomCode: string;
  user: IUser;
}

export interface REQUEST_TO_CREATE_ROOM {
  user: IUser;
  roomCode: string;
  timeRange: string;
  songsPerUser: number;
}