"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nats_events_1 = __importDefault(require("./src/nats-events"));
const socket_io_1 = require("socket.io");
const nats_1 = __importDefault(require("./src/nats"));
const nats_func_1 = __importDefault(require("./src/nats-func"));
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield nats_1.default.s.connect();
    nats_events_1.default.subscribe();
    const io = new socket_io_1.Server(3000, { cors: { origin: "*" } });
    setTimeout(() => {
        nats_events_1.default.publish("newServer", { serverName: process.env.HOSTNAME });
    }, 1000);
    io.on("connection", (socket) => {
        console.log("Socket connected", socket.id);
        nats_func_1.default.socketObjects[socket.id] = socket;
        nats_events_1.default.publish("newUser", {
            serverName: process.env.HOSTNAME,
            socketId: socket.id,
        });
        io.use((socket, next) => {
            console.log(" -------- Socket connected ", socket.id);
            next();
        });
        socket.on("getList", () => {
            socket.emit("getListDone", {
                myName: process.env.HOSTNAME,
                data: nats_func_1.default.servers.map((server) => {
                    return {
                        serverName: server.serverName,
                        users: server.users.map((user) => user.socketId),
                    };
                }),
            });
        });
        socket.on("message", (data) => {
            nats_func_1.default.sendMessageToUser(socket.id, data.socketId, data.message);
        });
        socket.on("disconnect", () => {
            nats_func_1.default.removeUserFromServer(process.env.HOSTNAME, socket.id);
            console.log("Socket disconnected", socket.id);
        });
    });
}))();
