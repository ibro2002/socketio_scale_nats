"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nats_func_1 = __importDefault(require("./nats-func"));
const nats_1 = __importDefault(require("./nats"));
const serverDTO_1 = require("./models/serverDTO");
const server_1 = require("./models/server");
class NatsEvents {
    static publish(topic, json) {
        nats_1.default.s.publish(topic, json);
    }
    static subscribe() {
        nats_1.default.s.subscribeJsonResult("newServer", (subject, data) => {
            let serverDTO = serverDTO_1.ServerDTO.fromJson(data);
            console.log(`## subject ${subject}, i am ${process.env.HOSTNAME} Received serverName : ${serverDTO.server} , socketId : ${serverDTO.socketId}`);
            nats_func_1.default.addServer(new server_1.Server(serverDTO.server));
        });
        nats_1.default.s.subscribeJsonResult("newUser", (subject, data) => {
            let serverDTO = serverDTO_1.ServerDTO.fromJson(data);
            console.log(`## subject ${subject}, i am ${process.env.HOSTNAME} Received serverName : ${serverDTO.server} , socketId : ${serverDTO.socketId}`);
            nats_func_1.default.addUserToServer(serverDTO.server, serverDTO.socketId);
        });
        nats_1.default.s.subscribeJsonResult("userLeft", (subject, data) => {
            let serverDTO = serverDTO_1.ServerDTO.fromJson(data);
            console.log(`## subject ${subject}, i am ${process.env.HOSTNAME} Received serverName : ${serverDTO.server} , socketId : ${serverDTO.socketId}`);
            nats_func_1.default.removeUserFromServer(serverDTO.server, serverDTO.socketId);
        });
        nats_1.default.s.subscribeJsonResult("message", (subject, data) => {
            if (data.serverName !== process.env.HOSTNAME) {
                console.log(`i am not the server ${data.serverName} who has the user ${data.toSocketId}`);
                return;
            }
            nats_func_1.default.sendMessageToUser(data.fromSocketId, data.toSocketId, data.message);
        });
    }
}
exports.default = NatsEvents;
