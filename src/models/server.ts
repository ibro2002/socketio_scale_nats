import { Socket } from "socket.io";

export class Server {
  serverName: string;
  users: User[] = [];

  constructor(serverName: string) {
    this.serverName = serverName;
  }
}

export class User {
  socketId: string;
  socket?: Socket | null;

  constructor(socketId: string, socket?: Socket | null) {
    this.socketId = socketId;
    this.socket = socket;
  }
}
