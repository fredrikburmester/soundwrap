// // @ts-nocheck
import { io } from "socket.io-client";

const url = "https://soundcheckgame-ts-ws-backend.fdrive.se"
const devurl = "http://localhost:5000"

const socket = io(url, {
  path: '/ws',
  autoConnect: true,
  transports: ['websocket'],
});

export default socket;