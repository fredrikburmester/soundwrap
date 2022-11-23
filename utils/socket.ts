// // @ts-nocheck
import { io } from "socket.io-client";

const socket = io("ws://localhost:5000", {
  path: '/ws',
  autoConnect: true,
  transports: ['websocket'],
});

export default socket;