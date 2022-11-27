// // @ts-nocheck
import { io } from "socket.io-client";

const socket = io("https://soundcheckgame-ts-ws-backend.fdrive.se", {
  path: '/ws',
  autoConnect: true,
  transports: ['websocket'],
});

export default socket;