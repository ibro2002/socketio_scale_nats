export class ServerDTO {
  server: string;
  socketId: string;
  get isServerOnly(): boolean {
    return this.socketId == null;
  }

  constructor(server: string, socketId: string) {
    this.server = server;
    this.socketId = socketId;
  }

  static fromJson(json: any): ServerDTO {
    return new ServerDTO(json["serverName"], json["socketId"]);
  }
}
