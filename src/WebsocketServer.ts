import { ClientToServerEvents } from "ClientToServerEvents";
import http = require("http");
import { InterServerEvents } from "InterServerEvents";
import { ServerToClientEvents } from "ServerToClientEvents";
import { Server } from "socket.io";
import { SocketData } from "SocketData";

export function createWebsocketInstance(server: http.Server) {
  type Client = ClientToServerEvents;
  type Server = ServerToClientEvents;
  type Inter = InterServerEvents;
  type Data = SocketData;

  const io = new Server
  <
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(
    server,
    {
      path: "/sock",
      cors: {
        origin: "*",
        methods: ['PUT', 'GET', 'POST', 'DELETE', 'OPTIONS'],
        credentials: false,
      }
    }
  );

  return io;
}