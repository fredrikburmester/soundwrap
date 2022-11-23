import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import express, { Express, Request, Response } from 'express';
import { IUser } from '../../types/auth';
import { IRoom } from '../../types/room';

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

io.on('connection', (socket) => {
  console.log('connected')

  socket.on('hey', () => {
		console.log("hey")
	})

	socket.on('joinRoom', ({roomCode, songsPerUser, user}: {roomCode: string, songsPerUser: number, user: IUser}) => {
		console.log(roomCode, songsPerUser, user)

		const room = rooms.find(room => room.roomCode === roomCode)

		if (room) {
			if (!room.players.find(player => player.id === user.id)) {
				room.players.push(user)
			}
			socket.join(roomCode)
			socket.emit('joinedRoom', {room})
		} else {
			const newRoom = {
				roomCode,
				host: user,
				players: [user]
			} 
			rooms.push(newRoom)
			socket.join(roomCode)
			socket.emit('roomCreated', {newRoom})
		}
	})

  socket.on('disconnect', () => {
    console.log('disconnected')
  })
})

httpServer.listen(port, '0.0.0.0')