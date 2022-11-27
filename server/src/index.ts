import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import express from 'express';
import { IUser } from '../../types/auth';
import { IRoom } from '../../types/room';
import { ServerEmits, ClientEmits } from '../../types/socket';
import { SongItem, SpotifyTopTracksResult } from '../../types/spotify';

const port = 5000;
const app = express()
const httpServer = createServer()

const io = new Server(httpServer, {
	cors: {
		origin: '*',
		methods: ['GET', 'POST'],
	},
	path: '/ws',
})

app.use(cors())

const rooms = [] as IRoom[];
const errors = [] as string[];

const sendRoomUpdates = (roomCode: string) => {
	const room = rooms.find((room) => room.roomCode === roomCode);
	if (room) {
		io.to(roomCode).emit(ServerEmits.ROOM_UPDATED, room);
	}
};

const createErrorString = (errorCode: number) => {
	if(errorCode === 401) {
		return 'Session expired. Please log in again.';
	}

	if(errorCode === 404) {
		return 'Room not found';
	}

	return 'Unknown error';
}

const getTopSongsForUser = async (timeRange: string, songsPerUser: number, token: string, user: IUser) => {
	const response = await fetch(
		`https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=${songsPerUser}`,
		{
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}
	);

	if(response.status === 200) {
		const data = (await response.json()) as SpotifyTopTracksResult;
		return data.items.map((item) => ({
			song: item,
			player: user,
		}));
	} else {
		errors.push(createErrorString(response.status));
		return [];
	}
};

io.on('connection', (socket) => {
  console.log('connected')

	socket.on(ClientEmits.REQUEST_TO_JOIN_ROOM, ({roomCode, user, token}: {roomCode: string, user: IUser, token: string}) => {
		if(!roomCode) {
			socket.emit(ServerEmits.REQUEST_TO_JOIN_ROOM_REJECTED);
			socket.emit('error', "You forgot the code", 'No code, no room, no game...');
			return;
		}

		if(!user) {
			socket.emit(ServerEmits.REQUEST_TO_JOIN_ROOM_REJECTED);
			socket.emit('error', 'No user provided', 'Try logging in again');
			return;
		}

		if(!token) {
			socket.emit(ServerEmits.REQUEST_TO_JOIN_ROOM_REJECTED);
			socket.emit('error', 'No token provided', 'Try logging in again');
			return;
		}

		const room = rooms.find((room) => room.roomCode === roomCode);
		if (!room) {
			socket.emit(ServerEmits.REQUEST_TO_JOIN_ROOM_REJECTED);
			socket.emit('error', 'No such room', 'Try another room or create one');
			return;
		}

		if (room.gamePosition === 0) {
			// Get top songs for user
			getTopSongsForUser(room.timeRange, room.songsPerUser, token, user).then((songs) => {
				if(songs.length === 0) {
					socket.emit(ServerEmits.REQUEST_TO_JOIN_ROOM_REJECTED);
					socket.emit('error', 'No top songs', 'Do you even use Spotify?');
					return;
				}

				room.players = [...room.players, user];
				room.songs = [...room.songs, ...songs];
				socket.join(roomCode)
				socket.emit(ServerEmits.REQUEST_TO_JOIN_ROOM_ACCEPTED, room);
				sendRoomUpdates(roomCode);
			});
		} else if (room.gamePosition === 1) {
			// check if user is already in room
			const userAlreadyInRoom = room.players.find((player) => player.id === user.id);

			if (userAlreadyInRoom) {
				socket.emit(ServerEmits.REQUEST_TO_JOIN_ROOM_ACCEPTED, room);
				return;
			}
		} else if (room.gamePosition === 2) {
			// check if user is already in room
			const userAlreadyInRoom = room.players.find((player) => player.id === user.id);

			if (userAlreadyInRoom) {
				socket.emit(ServerEmits.REQUEST_TO_JOIN_ROOM_ACCEPTED, room);
				return;
			}
		}
	})

	socket.on(ClientEmits.REQUEST_TO_CREATE_ROOM, ({roomCode, user, timeRange, songsPerUser, token}: {roomCode: string, user: IUser, timeRange: string, songsPerUser: number, token: string}) => {
		if (!roomCode || !user || !timeRange || !songsPerUser || !token) {
			socket.emit(ServerEmits.REQUEST_TO_CREATE_ROOM_REJECTED, "You're missing some information");
			socket.emit('error', 'Missing information', 'Please restart the app and try again');
			return;
		}

		const room = rooms.find((room) => room.roomCode === roomCode);
		if (!room) {
			// Get user top songs
			getTopSongsForUser(timeRange, songsPerUser, token, user).then((songs) => {

				if(errors.length !== 0) {
					socket.emit(ServerEmits.REQUEST_TO_CREATE_ROOM_REJECTED);
					socket.emit('error', "Error", errors.pop())
					return;
				}

				if(songs.length === 0) {
					socket.emit(ServerEmits.REQUEST_TO_CREATE_ROOM_REJECTED);
					socket.emit('error', 'No top songs', 'Logging in and out again might help');
					return;
				}
				// Create room
				const newRoom = {
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
				socket.join(roomCode)
				socket.emit(ServerEmits.REQUEST_TO_CREATE_ROOM_ACCEPTED, newRoom);
			}).catch((err) => {
				console.log("error!!",{err});
				socket.emit(ServerEmits.REQUEST_TO_CREATE_ROOM_REJECTED);
				socket.emit('error', 'Something went wrong', 'Plase log in and out again');
			});
		} else {
			// if user in room, join room
			if (room.players.find((player) => player.id === user.id)) {
				socket.emit(ServerEmits.REQUEST_TO_CREATE_ROOM_ACCEPTED, room);
				return;
			}
			socket.emit(ServerEmits.REQUEST_TO_CREATE_ROOM_REJECTED);
			socket.emit('error', 'Room already exists', 'Use another code');
		}
	})

	socket.on(ClientEmits.GUESS, ({roomCode, guess, user, currentSongIndex}: {roomCode: string, guess: string, user: IUser, currentSongIndex: number}) => {
		// Check if guess is correct
		//
		// guess: string - the userid of the person guessd on
		// user: IUser - the user who made the guess
		// currentSongIndex: number - the index of the song in the room.songs array
		//

		const room = rooms.find((room) => room.roomCode === roomCode);
		if (!room) {
			return;
		}

		if (room.gamePosition === 1) {
			const player = room.players.find((player) => player.id === user.id) as IUser;

			if (!player) {
				return;
			}

			const currentGuess = player.guesses.find((guess) => guess.currentSongIndex === currentSongIndex);
			const answer = room.songs[currentSongIndex].player.id;
			const correct = answer === guess;

			console.log(`${user.name} guessed ${guess} on ${room.songs[currentSongIndex].player.name} for song ${currentSongIndex} and it was ${correct ? 'correct' : 'incorrect'}`);

			// If guess already exists AND the new guess differs
			if (currentGuess && currentGuess.guess !== guess) {
				// If the old guess was correct, remove a point from the player
				if(currentGuess.guess === answer && !correct) {
					player.score--
				// If the old guess was incorrect, and this guess is correct, add a point to the player
				} else if (currentGuess.guess !== answer && correct) {
					player.score++
				}
			} else if(currentGuess && currentGuess.guess === guess ) {
				// Do nothing
			} else {																				// New guess
				player.guesses.push({guess, currentSongIndex});
				if(correct) player.score++
			}
		}
	})
	
	socket.on('requestRoomUpdate', (roomCode: string) => {
		const room = rooms.find((room) => room.roomCode === roomCode);
		if (!room) {
			return;
		}
		sendRoomUpdates(roomCode);
	})

	socket.on(ClientEmits.LEAVE_ROOM, ({roomCode, user}: {roomCode: string, user: IUser}) => {
		const room = rooms.find(room => room.roomCode === roomCode)
		if (room) {
			const playerIndex = room.players.findIndex(player => player.id === user.id)
			if (playerIndex !== -1) {
				// Only remove player if in lobby
				if(room.gamePosition === 0) {
					room.players.splice(playerIndex, 1)
					room.songs = room.songs.filter(song => song.player.id !== user.id)
					if(room.host.id === user.id) {
						room.host = room.players[0]
					}
					socket.leave(roomCode)
				}
				console.log(`${user.name} left ${roomCode} with users ${room?.players.map(user => user.name)}`)
			}
		}
		sendRoomUpdates(roomCode)
	})

	socket.on(ClientEmits.START_GAME, ({roomCode}: {roomCode: string}) => {
		console.log(`Game started in ${roomCode}`)
		const room = rooms.find(room => room.roomCode === roomCode)

		if (room) {
				room.gamePosition = 1

				// Shuffle songs
				room.songs = shuffle(room.songs)

				sendRoomUpdates(roomCode)
		}
	})

	socket.on(ClientEmits.NEXT_SONG, ({roomCode}: {roomCode: string}) => {
		console.log(`Next song in ${roomCode}`)
		const room = rooms.find(room => room.roomCode === roomCode)
		if (room) {
			if(room.currentSongIndex >= room.songs.length - 1) {
				room.gamePosition = 2
			} else {
				room.currentSongIndex += 1
			}
			sendRoomUpdates(roomCode)
		}
	})


  socket.on(ClientEmits.DISCONNECT, () => {
    console.log('disconnected')
  })
})

httpServer.listen(port, '0.0.0.0')

function shuffle(songs: {song: SongItem, player: IUser}[]): {song: SongItem, player: IUser}[] {
	const shuffledSongs = songs.map(song => ({sort: Math.random(), value: song}))
		.sort((a, b) => a.sort - b.sort)
		.map(song => song.value)

	return shuffledSongs
}
