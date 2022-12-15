import cors from 'cors'
import express from 'express';
import { createServer } from 'http'
import { Server } from 'socket.io'
import { IUser } from '../../types/auth';
import { IRoom } from '../../types/room';
import { ServerEmits, ClientEmits, IRequestToCreateRoom } from '../../types/socket';
import { leaveRoom, nextSong, requestToCreateRoom, requestToJoinRoom, sendRoomUpdates, startGame, userGuessed } from '../utils/sockets';
import { validateExists } from '../utils/validation';

const port = 5000;
const app = express()
app.use(cors())
const httpServer = createServer(app)

export const io = new Server(httpServer, {
	path: '/ws',
	cors: {
		origin: '*',
		methods: ['GET', 'POST'],
	},
})

const rooms = [] as IRoom[];
export const getRooms = () => rooms;

app.get('/', (req, res) => {
	res.send('Hey this is still in development!');
});

io.on('connection', (socket) => {
	socket.on(ClientEmits.REQUEST_TO_JOIN_ROOM, ({roomCode, user, token}: {roomCode: string, user: IUser, token: string}) => {
		if(!roomCode || !user || !token) {
			socket.emit(ServerEmits.REQUEST_TO_JOIN_ROOM_REJECTED);
			socket.emit('error', 'Missing information', "Make sure you didn't miss any fields");
			return;
		}
		requestToJoinRoom(socket, rooms, {roomCode, user, token});
	})

	socket.on(ClientEmits.REQUEST_TO_CREATE_ROOM, ({roomCode, user, timeRange, songsPerUser, token}: IRequestToCreateRoom) => {
		if(validateExists({roomCode, user, timeRange, songsPerUser, token}).length > 0) {
			socket.emit(ServerEmits.REQUEST_TO_CREATE_ROOM_REJECTED);
			socket.emit('error', 'Missing information', "Make sure you didn't miss any fields");
			return;
		}
		requestToCreateRoom(socket, {roomCode, user, timeRange, songsPerUser, token});
	})

	socket.on(ClientEmits.GUESS, ({roomCode, guess, user, currentSongIndex}: {roomCode: string, guess: string, user: IUser, currentSongIndex: number}) => {
		userGuessed({roomCode, guess, user, currentSongIndex});
	})

	socket.on(ClientEmits.REQUEST_ROOM_UPDATE, (roomCode: string) => {
		const room = rooms.find((room) => room.roomCode === roomCode);
		if (!room) {
			return;
		}
		sendRoomUpdates(roomCode);
	})

	socket.on(ClientEmits.LEAVE_ROOM, ({roomCode, user}: {roomCode: string, user: IUser}) => {
		leaveRoom(socket, {roomCode, user});
	})

	socket.on(ClientEmits.START_GAME, ({roomCode}: {roomCode: string}) => {
		startGame({roomCode})
	})

	socket.on(ClientEmits.NEXT_SONG, ({roomCode}: {roomCode: string}) => {
		nextSong({roomCode})
	})

	// socket.on('addNonAuthUser', ({roomCode, nonAuthUser, songs}: {roomCode: string, nonAuthUser: IUser, songs: SongItem[]}) => {
	// 	const room = rooms.find((room) => room.roomCode === roomCode);
	// 	if (!room) {
	// 		return;
	// 	}

	// 	const nonAuthUserSongs = songs.map((song) => ({
	// 		song,
	// 		player: nonAuthUser,
	// 	}));

	// 	room.players = [...room.players, nonAuthUser];
	// 	room.songs = [...room.songs, ...nonAuthUserSongs];

	// 	sendRoomUpdates(roomCode);
	// })

  socket.on(ClientEmits.DISCONNECT, () => {
		//
	})
})

httpServer.listen(port, '0.0.0.0')
