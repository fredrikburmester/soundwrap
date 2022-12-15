import { IUser } from "./auth";

export const enum ClientEmits {
  REQUEST_TO_JOIN_ROOM = "requestToJoinRoom",
  REQUEST_TO_CREATE_ROOM = "requestToCreateRoom",
  JOIN_ROOM = "joinRoom",
  GUESS = "guess",
  LEAVE_ROOM = "leaveRoom",
  START_GAME = "startGame",
  NEXT_SONG = "nextSong",
  DISCONNECT = "disconnect",
  REQUEST_ROOM_UPDATE = "requestRoomUpdate"
}

export const enum ServerEmits {
  REQUEST_TO_JOIN_ROOM_ACCEPTED = "requestToJoinRoomAccepted",
  REQUEST_TO_JOIN_ROOM_REJECTED = "requestToJoinRoomRejected",
  REQUEST_TO_CREATE_ROOM_ACCEPTED = "requestToCreateRoomAccepted",
  REQUEST_TO_CREATE_ROOM_REJECTED = "requestToCreateRoomRejected",
  NO_SONGS_AVAILABLE = "noSongsAvailable",
  ROOM_UPDATED = "roomUpdated",
  PLAYER_MADE_A_GUESS = "playerMadeAGuess",
}


export type REQUEST_TO_JOIN_ROOM = {
  roomCode: string;
  user: IUser;
}

export type IRequestToCreateRoom = {
  user: IUser;
  roomCode: string;
  timeRange: string;
  songsPerUser: number;
  token: string;
}

export type IRequestToJoinRoom = {
  user: IUser;
  roomCode: string;
  token: string;
}

export type IGuess = {
  roomCode: string,
  guess: string,
  user: IUser,
  currentSongIndex: number,
}