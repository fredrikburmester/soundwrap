import { IUser } from "../../types/auth"
import { IRoom } from "../../types/room"
import { IGuess, IRequestToCreateRoom, IRequestToJoinRoom, ServerEmits } from "../../types/socket";
import { SongItem } from "../../types/spotify"
import { logMessage } from "./logging"
import { getTopSongsForUser } from "./spotify";
import { getRooms, io } from "../src/index"
import * as fs from 'fs'

export const sendRoomUpdates = (roomCode: string) => {
	const room = getRooms().find((room) => room.roomCode === roomCode);
	if (room) {
		io.to(roomCode).emit(ServerEmits.ROOM_UPDATED, room);
	}
};

export const requestToCreateRoom = (socket: any, {roomCode, user, timeRange, songsPerUser, token}: IRequestToCreateRoom) => {
  const rooms = getRooms();
  const room = rooms.find((room: IRoom) => room.roomCode === roomCode);
  if (!room) {
    // Get user top songs
    getTopSongsForUser(timeRange, songsPerUser, token, user).then((songs: {song: SongItem, player: IUser}[]) => {
      const newRoom: IRoom = {
        roomCode,
        host: user,
        players: [user],
        gamePosition: 0,
        songs,
        songsPerUser,
        currentSongIndex: 0,
        timeRange
      };
      rooms.push(newRoom);
      logMessage(`${user.name} created room ${roomCode} with ${songs.length} songs`, 'info');
      socket.join(roomCode.trim().toUpperCase())
      socket.emit(ServerEmits.REQUEST_TO_CREATE_ROOM_ACCEPTED, newRoom);
      logMessage(`${user.name} created room ${roomCode}`, 'info');
    }).catch((err) => {
      if(err === 201) {
        socket.emit('logout')
        socket.emit('error', 'Token expired', 'Log in again');
      } else if (err === 400) {
        logMessage(`${user.name} tried to create room ${roomCode} but doesn't have any songs`, 'error');
        socket.emit('error', 'No top songs', 'You need top songs to play. Try another time range.');
      } else {
        logMessage(`${user.name} tried to create room ${roomCode} but got error ${err}`, 'error');
        socket.emit('error', 'Something went wrong', 'Try again later');
      }
    });
  } else {
    // if user in room, join room
    if (room.players.find((player) => player.id === user.id)) {
      socket.emit(ServerEmits.REQUEST_TO_CREATE_ROOM_ACCEPTED, room);
      logMessage(`${user.name} re-joined room ${roomCode}`, 'info');
      return;
    }
    socket.emit(ServerEmits.REQUEST_TO_CREATE_ROOM_REJECTED);
    logMessage(`${user.name} tried to create room ${roomCode} but it already exists`, 'error');
    socket.emit('error', 'Room already exists', 'Use another code');
  }
}

export const requestToJoinRoom = (socket: any, rooms: IRoom[], {roomCode, user, token}: IRequestToJoinRoom) => {
  /*
    This function will try to join a user into a room.
    The user can not join if: the game has started or ended, the game has a
    user with the same name, the user has no top songs, or the room does not exist.

    @param socket: Socket - the socket of the user
    @param rooms: IRoom[] - the rooms array
    @param roomCode: string - the room code
    @param user: IUser - the user
    @param token: string - the user's access token

    @returns void
  */
  const room = rooms.find((room: IRoom) => room.roomCode === roomCode);
  if (!room) {
    socket.emit(ServerEmits.REQUEST_TO_JOIN_ROOM_REJECTED);
    socket.emit('error', 'Wrong room code', 'Try another room or create one!');
    return;
  }

  // check if user with same name is already in room
  const userAlreadyInRoom = room.players.find((player) => player.name === user.name);

  if (userAlreadyInRoom) {
    socket.emit(ServerEmits.REQUEST_TO_JOIN_ROOM_REJECTED);
    socket.emit('error', 'Name already taken', 'Try another name');
    return;
  }

  if (room.gamePosition === 0) {
    // Get top songs for user
    getTopSongsForUser(room.timeRange, room.songsPerUser, token, user).then((songs: {song: SongItem, player: IUser}[]) => {
      room.players = [...room.players, user];
      room.songs = [...room.songs, ...songs];
      socket.join(roomCode)
      socket.emit(ServerEmits.REQUEST_TO_JOIN_ROOM_ACCEPTED, room);
      sendRoomUpdates(roomCode);
    }).catch((err: string) => {
      logMessage('Error getting top songs', 'error');
    });
    return;
  } else {
    socket.emit(ServerEmits.REQUEST_TO_JOIN_ROOM_REJECTED);
  }
}

export const userGuessed = ({roomCode, guess, user, currentSongIndex}: IGuess) => {
  /*
    This function will check if the guess by a user is correct and update the room accordingly.

    @param roomCode: string - the room code
    @param guess: string - a username of the player that was guessd on, NOT the player who made the guess
    @param user: IUser - the user who made the guess
    @param currentSongIndex: number - the index of the song which was played during the guess

    @returns void
  */

  const rooms = getRooms();
  const room = rooms.find((room: IRoom) => room.roomCode === roomCode);

  if(!room) {
    return;
  }

  if (room.gamePosition === 1) {
    const player = room.players.find((player) => player.id === user.id) as IUser;
    if (!player) {
      return;
    }

    const currentGuess = player.guesses.find((guess) => guess.currentSongIndex === currentSongIndex);
    const answer = room.songs[currentSongIndex].player.name;
    const correct = answer === guess;

    logMessage(`${user.id} guessed ${guess} on ${room.songs[currentSongIndex].player.name} for song ${currentSongIndex} and it was ${correct ? 'correct' : 'incorrect'}`, 'info');

    // If guess already exists AND the new guess differs
    if (currentGuess && currentGuess.guess !== guess) {
      // If the old guess was correct, remove a point from the player
      if(currentGuess.guess === answer && !correct) {
        player.score--
      // If the old guess was incorrect, and this guess is correct, add a point to the player
      } else if (currentGuess.guess !== answer && correct) {
        player.score++
      }
      currentGuess.guess = guess;
    } else if(currentGuess && currentGuess.guess === guess ) {
      // Do nothing
    } else {	// New guess
      player.guesses.push({guess, currentSongIndex});
      if(correct) player.score++
    }
    sendRoomUpdates(roomCode);
  }
}

export const nextSong = ({roomCode}: {roomCode: string}) => {
  const rooms = getRooms()
  const room = rooms.find(room => room.roomCode === roomCode)
		if (room) {
			if(room.currentSongIndex >= room.songs.length - 1) {
				room.gamePosition = 2
				logMessage(`Game ended in ${roomCode}`, 'info')

				// save room to file
				const roomData = JSON.stringify(room, null, 2)
				fs.writeFile
				(`./rooms/${roomCode}.json`, roomData, (err) => {
					if (err) {
						logMessage(`Error saving room ${roomCode} to file`, 'error')
						return
					}
				})

			} else {
				room.currentSongIndex += 1
			}
			sendRoomUpdates(roomCode)
		}
}

export const startGame = ({roomCode}: {roomCode: string}) => {
  const shuffle = (songs: {song: SongItem, player: IUser}[]): {song: SongItem, player: IUser}[] => {
    const shuffledSongs = songs.map(song => ({sort: Math.random(), value: song}))
      .sort((a, b) => a.sort - b.sort)
      .map(song => song.value)

    return shuffledSongs
  }

  const rooms = getRooms()

  const room = rooms.find(room => room.roomCode === roomCode)

  if (room) {
    room.gamePosition = 1
    logMessage(`${room.host.name} started a game in ${roomCode}`, 'info')

    // Shuffle songs
    room.songs = shuffle(room.songs)
    sendRoomUpdates(roomCode)
  }
}

export const leaveRoom = (socket: any, {roomCode, user}: {roomCode: string, user: IUser}) => {
  const rooms = getRooms()

  const room = rooms.find(room => room.roomCode === roomCode)
		if (room) {
			const playerIndex = room.players.findIndex(player => player.id === user.id)
			if (playerIndex !== -1) {
				// Only remove player if in lobby
        if (room.players.length === 1) {
          rooms.splice(rooms.findIndex(room => room.roomCode === roomCode), 1)
          logMessage(`${user.name} left ${roomCode}. The room closed since they were the last player in the room.`, 'info')
        } else if(room.gamePosition === 0) {
					// Remove player from room
          room.players.splice(playerIndex, 1)
					// Remove players songs from room
          room.songs = room.songs.filter(song => song.player.id !== user.id)
					// Set new host
          if(room.host.id === user.id) {
						room.host = room.players[0]
					}
          logMessage(`${user.name} left ${roomCode} with users ${room?.players.map(user => user.name)}`, 'info')
				}
			}
		}
		socket.leave(roomCode.trim().toUpperCase())
		sendRoomUpdates(roomCode)
}