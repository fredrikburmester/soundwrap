export const enum ClientEmits {
  REQUEST_TO_JOIN_ROOM = "requestToJoinRoom",
  REQUEST_TO_CREATE_ROOM = "requestToCreateRoom",
  JOIN_ROOM = "joinRoom",
  GUESS = "guess",
  LEAVE_ROOM = "leaveRoom",
  START_GAME = "startGame",
  NEXT_SONG = "nextSong",
  DISCONNECT = "disconnect",
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