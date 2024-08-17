import natsFunc from "./nats-func";
import Nats from "./nats";
import { ServerDTO } from "./models/serverDTO";
import { Server } from "./models/server";

class NatsEvents {
  static publish(topic: string, json: any) {
    Nats.s.publish(topic, json);
  }
  static subscribe() {
    Nats.s.subscribeJsonResult("newServer", (subject, data: any) => {
      let serverDTO = ServerDTO.fromJson(data);

      console.log(
        `## subject ${subject}, i am ${process.env.HOSTNAME} Received serverName : ${serverDTO.server} , socketId : ${serverDTO.socketId}`
      );
      natsFunc.addServer(new Server(serverDTO.server));
    });
    Nats.s.subscribeJsonResult("newUser", (subject, data) => {
      let serverDTO = ServerDTO.fromJson(data);
      console.log(
        `## subject ${subject}, i am ${process.env.HOSTNAME} Received serverName : ${serverDTO.server} , socketId : ${serverDTO.socketId}`
      );
      natsFunc.addUserToServer(serverDTO.server, serverDTO.socketId);
    });
    Nats.s.subscribeJsonResult("userLeft", (subject, data) => {
      let serverDTO = ServerDTO.fromJson(data);
      console.log(
        `## subject ${subject}, i am ${process.env.HOSTNAME} Received serverName : ${serverDTO.server} , socketId : ${serverDTO.socketId}`
      );
      natsFunc.removeUserFromServer(serverDTO.server, serverDTO.socketId);
    });
    Nats.s.subscribeJsonResult("message", (subject, data) => {
      if (data.serverName !== process.env.HOSTNAME) {
        console.log(
          `i am not the server ${data.serverName} who has the user ${data.toSocketId}`
        );
        return;
      }
      natsFunc.sendMessageToUser(
        data.fromSocketId,
        data.toSocketId,
        data.message
      );
    });
  }
}

export default NatsEvents;
