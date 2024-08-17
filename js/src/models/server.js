"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.Server = void 0;
class Server {
    constructor(serverName) {
        this.users = [];
        this.serverName = serverName;
    }
}
exports.Server = Server;
class User {
    constructor(socketId, socket) {
        this.socketId = socketId;
        this.socket = socket;
    }
}
exports.User = User;
