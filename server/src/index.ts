import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import express from 'express';
import { IUser } from '../../types/auth';
import { IRoom } from '../../types/room';
import { ServerEmits, ClientEmits } from '../../types/socket';
import { SongItem, SpotifyTopTracksResult } from '../../types/spotify';
import * as fs from 'fs';
import { ok } from 'assert'

const port = 5000;
const app = express()
app.use(cors())
const httpServer = createServer(app)

const io = new Server(httpServer, {
	path: '/ws',
	cors: {
		origin: '*',
		methods: ['GET', 'POST'],
	},
})


const rooms = [] as IRoom[];
const errors = [] as string[];

const logMessage = (message: string, type: 'info' | 'error') => {
	const dateTime = new Date().toLocaleString('sv-SE', {
		timeZone: 'Europe/Stockholm',
		});

	// Open logs/info.log or logs/error.log
	const logStream = fs.createWriteStream
		(`logs/${
			type === 'info' ? 'info' : 'error'
		}.log`, { flags: 'a' });

	// Write log
	logStream.write(`[${dateTime}] ${message}\n`);
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
		errors.push('Try logging in again');
		return [];
	}
};

app.get('/', (req, res) => {
	res.send('Hey this is still in development!');
});

const sendRoomUpdates = (roomCode: string) => {
	const room = rooms.find((room) => room.roomCode === roomCode);
	if (room) {
		io.to(roomCode).emit(ServerEmits.ROOM_UPDATED, room);
	}
};

io.on('connection', (socket) => {
	socket.on(ClientEmits.REQUEST_TO_JOIN_ROOM, ({roomCode, user, token}: {roomCode: string, user: IUser, token: string}) => {

		if(!roomCode) {
			socket.emit(ServerEmits.REQUEST_TO_JOIN_ROOM_REJECTED);
			socket.emit('error', "You forgot the code", 'No code, no room, no game...');
			return;
		}

		if(!user) {
			socket.emit(ServerEmits.REQUEST_TO_JOIN_ROOM_REJECTED);
			socket.emit('logout');
			return;
		}

		if(!token) {
			socket.emit(ServerEmits.REQUEST_TO_JOIN_ROOM_REJECTED);
			socket.emit('logout');
			return;
		}

		const room = rooms.find((room) => room.roomCode === roomCode);
		if (!room) {
			socket.emit(ServerEmits.REQUEST_TO_JOIN_ROOM_REJECTED);
			socket.emit('error', 'No such room', 'Try another room or create one');
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
			getTopSongsForUser(room.timeRange, room.songsPerUser, token, user).then((songs) => {
				if(errors.length > 0) {
					socket.emit(ServerEmits.REQUEST_TO_JOIN_ROOM_REJECTED);
					socket.emit('error', 'Error getting top songs', errors.pop());
					socket.emit('logout')
					return;
				}

				if(songs.length === 0) {
					socket.emit(ServerEmits.REQUEST_TO_JOIN_ROOM_REJECTED);
					socket.emit('error', 'No top songs', 'Do you even use Spotify?');
					socket.emit('logout')
					return;
				}

				room.players = [...room.players, user];
				room.songs = [...room.songs, ...songs];
				socket.join(roomCode)
				socket.emit(ServerEmits.REQUEST_TO_JOIN_ROOM_ACCEPTED, room);
				sendRoomUpdates(roomCode);
			}).catch((err) => {
				logMessage(err, 'Error getting top songs', 'error');
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

	socket.on('addNonAuthUser', ({roomCode, nonAuthUser, songs}: {roomCode: string, nonAuthUser: IUser, songs: SongItem[]}) => {
		const room = rooms.find((room) => room.roomCode === roomCode);
		if (!room) {
			return;
		}

		const nonAuthUserSongs = songs.map((song) => ({
			song,
			player: nonAuthUser,
		}));

		room.players = [...room.players, nonAuthUser];
		room.songs = [...room.songs, ...nonAuthUserSongs];

		sendRoomUpdates(roomCode);
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
					socket.emit('logout')
					return;
				}

				if(songs.length === 0) {
					socket.emit(ServerEmits.REQUEST_TO_CREATE_ROOM_REJECTED);
					socket.emit('error', 'No top songs', 'Logging in and out again might help');
					socket.emit('logout')
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
				logMessage(`${user.name} created room ${roomCode} with ${songs.length} songs`, 'info');
				socket.join(roomCode.trim().toUpperCase())
				socket.emit(ServerEmits.REQUEST_TO_CREATE_ROOM_ACCEPTED, newRoom);
				logMessage(`${user.name} created room ${roomCode}`, 'info');
			}).catch((err) => {
				logMessage(err, 'error');
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
			const answer = room.songs[currentSongIndex].player.name;
			const correct = answer === guess;

			logMessage(`${user.name} guessed ${guess} on ${room.songs[currentSongIndex].player.name} for song ${currentSongIndex} and it was ${correct ? 'correct' : 'incorrect'}`, 'info');

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
			} else {																				// New guess
				player.guesses.push({guess, currentSongIndex});
				if(correct) player.score++
			}

			sendRoomUpdates(roomCode);
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
				}
				logMessage(`${user.name} left ${roomCode} with users ${room?.players.map(user => user.name)}`, 'info')
			}
		}
		logMessage(`${user.name} left ${roomCode}`, 'info')
		socket.leave(roomCode.trim().toUpperCase())
		sendRoomUpdates(roomCode)
	})

	socket.on(ClientEmits.START_GAME, ({roomCode}: {roomCode: string}) => {
		const room = rooms.find(room => room.roomCode === roomCode)

		if (room) {
			room.gamePosition = 1
			logMessage(`${room.host.name} started a game in ${roomCode}`, 'info')

			// Shuffle songs
			room.songs = shuffle(room.songs)

			sendRoomUpdates(roomCode)
		}
	})

	socket.on(ClientEmits.NEXT_SONG, ({roomCode}: {roomCode: string}) => {
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
					// file written successfully
				})

			} else {
				room.currentSongIndex += 1
			}

			sendRoomUpdates(roomCode)
		}
	})

  socket.on(ClientEmits.DISCONNECT, () => {
		//
	})
})

httpServer.listen(port, '0.0.0.0')

function shuffle(songs: {song: SongItem, player: IUser}[]): {song: SongItem, player: IUser}[] {
	const shuffledSongs = songs.map(song => ({sort: Math.random(), value: song}))
		.sort((a, b) => a.sort - b.sort)
		.map(song => song.value)

	return shuffledSongs
}
