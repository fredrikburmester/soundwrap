// // @ts-nocheck
import { io } from "socket.io-client";
import { getEnvVars } from '../hooks/useEnviroment';

const url = "https://soundcheckgame-ts-ws-backend.fdrive.se"
const devurl = "http://localhost:5000"

const env = getEnvVars();

const socket = io(env.wsurl, {
  path: '/ws',
  autoConnect: true,
  transports: ['websocket'],
});

export default socket;