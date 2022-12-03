// // @ts-nocheck
import { io } from "socket.io-client";
import { getEnvVars } from '../hooks/useEnviroment';

const env = getEnvVars();

const socket = io(env.wsurl, {
  path: '/ws',
  autoConnect: true,
  transports: ['websocket'],
});

export default socket;