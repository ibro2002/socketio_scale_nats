"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerDTO = void 0;
class ServerDTO {
    get isServerOnly() {
        return this.socketId == null;
    }
    constructor(server, socketId) {
        this.server = server;
        this.socketId = socketId;
    }
    static fromJson(json) {
        return new ServerDTO(json["serverName"], json["socketId"]);
    }
}
exports.ServerDTO = ServerDTO;
