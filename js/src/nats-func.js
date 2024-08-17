"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./models/server");
const nats_1 = __importDefault(require("./nats"));
class NatsFunctions {
    static addServer(server) {
        if (NatsFunctions.servers.find((s) => s.serverName === server.serverName)) {
            console.log("Server already exists", server.serverName);
            return;
        }
        NatsFunctions.servers.push(server);
        console.log(`## i am ${process.env.HOSTNAME} ,  Server added`, NatsFunctions.servers);
    }
    static addUserToServer(serverName, socketId) {
        // get server by name
        const serverEntity = NatsFunctions.servers.find((server) => server.serverName === serverName);
        console.log("Server entity", serverEntity);
        // check if server and user exists
        if (serverEntity !== undefined) {
            if (serverEntity.users.find((user) => user.socketId === socketId)) {
                console.log("User already exists in server", serverName, socketId);
            }
            else {
                console.log(`User ${socketId} added to server ${serverName}`);
                let socketObject = null;
                if (process.env.HOSTNAME === serverName) {
                    console.log(`### i am ${process.env.HOSTNAME} Socket object added to server ${serverName}`);
                    socketObject = NatsFunctions.socketObjects[socketId];
                    delete NatsFunctions.socketObjects[socketId];
                }
                serverEntity.users.push(new server_1.User(socketId, socketObject));
            }
        }
        else {
            // add server and user
            var server = new server_1.Server(serverName);
            server.users.push(new server_1.User(socketId, null));
            this.addServer(server);
            console.log(`Server ${serverName} created and user ${socketId} added`);
        }
    }
    static removeUserFromServer(serverName, socketId) {
        // get server by name
        const serverEntity = NatsFunctions.servers.find((server) => server.serverName === serverName);
        // check if server and user exists
        if (serverEntity) {
            if (serverEntity.users.find((u) => u.socketId == socketId)) {
                serverEntity.users = serverEntity.users.filter((user) => user.socketId !== socketId);
                console.log("User removed from server", serverName, socketId);
                // notify other servers that user has left
                nats_1.default.s.publish("userLeft", JSON.parse(JSON.stringify({ serverName, socketId })));
            }
            else {
                console.log(`User ${socketId} does not exist in server ${serverName}`);
            }
        }
        else {
            console.log("Server does not exist", serverName);
        }
    }
    static getServer(serverName) {
        return NatsFunctions.servers.find((server) => server.serverName === serverName);
    }
    static getAllUsers() {
        let users = [];
        NatsFunctions.servers.forEach((server) => {
            users = users.concat(server.users);
        });
        return users;
    }
    static sendMessageToUser(fromSocketId, toSocketId, message) {
        // search which server user in
        let serverName = null;
        NatsFunctions.servers.every((server) => {
            var _a, _b;
            if (server.users.find((user) => user.socketId === toSocketId)) {
                if (process.env.HOSTNAME === server.serverName) {
                    (_b = (_a = server.users
                        .find((u) => u.socketId == toSocketId)) === null || _a === void 0 ? void 0 : _a.socket) === null || _b === void 0 ? void 0 : _b.emit("message", message);
                }
                else {
                    serverName = server.serverName;
                    return;
                }
                return false;
            }
            else {
                return true;
            }
        });
        if (serverName !== null)
            nats_1.default.s.publish("message", {
                serverName,
                fromSocketId,
                toSocketId,
                message,
            });
    }
}
NatsFunctions.servers = [];
NatsFunctions.socketObjects = [];
exports.default = NatsFunctions;
