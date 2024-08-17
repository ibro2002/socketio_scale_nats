import { Server, User } from "./models/server";
import Nats from "./nats";
class NatsFunctions {
  static servers: Server[] = [];
  static socketObjects: any = [];

  static addServer(server: Server) {
    if (NatsFunctions.servers.find((s) => s.serverName === server.serverName)) {
      console.log("Server already exists", server.serverName);
      return;
    }
    NatsFunctions.servers.push(server);

    console.log(
      `## i am ${process.env.HOSTNAME} ,  Server added`,
      NatsFunctions.servers
    );
  }

  static addUserToServer(serverName: string, socketId: string) {
    // get server by name
    const serverEntity = NatsFunctions.servers.find(
      (server) => server.serverName === serverName
    );
    console.log("Server entity", serverEntity);

    // check if server and user exists
    if (serverEntity !== undefined) {
      if (serverEntity.users.find((user) => user.socketId === socketId)) {
        console.log("User already exists in server", serverName, socketId);
      } else {
        console.log(`User ${socketId} added to server ${serverName}`);
        let socketObject = null;
        if (process.env.HOSTNAME === serverName) {
          console.log(
            `### i am ${process.env.HOSTNAME} Socket object added to server ${serverName}`
          );

          socketObject = NatsFunctions.socketObjects[socketId];
          delete NatsFunctions.socketObjects[socketId];
        }
        serverEntity.users.push(new User(socketId, socketObject));
      }
    } else {
      // add server and user
      var server = new Server(serverName);
      server.users.push(new User(socketId, null));
      this.addServer(server);
      console.log(`Server ${serverName} created and user ${socketId} added`);
    }
  }

  static removeUserFromServer(serverName: string, socketId: string) {
    // get server by name
    const serverEntity = NatsFunctions.servers.find(
      (server) => server.serverName === serverName
    );
    // check if server and user exists
    if (serverEntity) {
      if (serverEntity.users.find((u) => u.socketId == socketId)) {
        serverEntity.users = serverEntity.users.filter(
          (user) => user.socketId !== socketId
        );
        console.log("User removed from server", serverName, socketId);

        // notify other servers that user has left
        Nats.s.publish(
          "userLeft",
          JSON.parse(JSON.stringify({ serverName, socketId }))
        );
      } else {
        console.log(`User ${socketId} does not exist in server ${serverName}`);
      }
    } else {
      console.log("Server does not exist", serverName);
    }
  }

  static getServer(serverName: string) {
    return NatsFunctions.servers.find(
      (server) => server.serverName === serverName
    );
  }

  static getAllUsers() {
    let users: User[] = [];
    NatsFunctions.servers.forEach((server) => {
      users = users.concat(server.users);
    });
    return users;
  }

  static sendMessageToUser(
    fromSocketId: string,
    toSocketId: string,
    message: any
  ) {
    // search which server user in
    let serverName: string | null = null;
    NatsFunctions.servers.every((server) => {
      if (server.users.find((user) => user.socketId === toSocketId)) {
        if (process.env.HOSTNAME === server.serverName) {
          server.users
            .find((u) => u.socketId == toSocketId)
            ?.socket?.emit("message", message);
        } else {
          serverName = server.serverName;
          return;
        }
        return false;
      } else {
        return true;
      }
    });
    if (serverName !== null)
      Nats.s.publish("message", {
        serverName,
        fromSocketId,
        toSocketId,
        message,
      });
  }
}

export default NatsFunctions;
