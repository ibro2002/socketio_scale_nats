import NatsEvents from "./src/nats-events";
import { Server } from "socket.io";
import nats from "./src/nats";
import NatsFunctions from "./src/nats-func";

(async () => {
  await nats.s.connect();
  NatsEvents.subscribe();
  const io = new Server(3000, { cors: { origin: "*" } });

  setTimeout(() => {
    NatsEvents.publish("newServer", { serverName: process.env.HOSTNAME! });
  }, 1000);

  io.on("connection", (socket) => {
    console.log("Socket connected", socket.id);
    NatsFunctions.socketObjects[socket.id] = socket;
    NatsEvents.publish("newUser", {
      serverName: process.env.HOSTNAME!,
      socketId: socket.id,
    });
    io.use((socket, next) => {
      console.log(" -------- Socket connected ", socket.id);
      next();
    });

    socket.on("getList", () => {
      socket.emit("getListDone", {
        myName: process.env.HOSTNAME,
        data: NatsFunctions.servers.map((server) => {
          return {
            serverName: server.serverName,
            users: server.users.map((user) => user.socketId),
          };
        }),
      });
    });

    socket.on("message", (data) => {
      NatsFunctions.sendMessageToUser(socket.id, data.socketId, data.message);
    });
    socket.on("disconnect", () => {
      NatsFunctions.removeUserFromServer(process.env.HOSTNAME!, socket.id);
      console.log("Socket disconnected", socket.id);
    });
  });
})();
