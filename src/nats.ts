import * as nats from "nats";

class Nats {
  static connection: nats.NatsConnection;
  static lock: boolean = false;

  static async connect() {
    if (Nats.connection == null && !Nats.lock) {
      Nats.lock = true;
      Nats.connection = await nats.connect({ servers: "nats://nats:4222" });
      // console.log(`Connected to NATS ${Nats.connection.getServer()} `);
    }
  }

  static async subscribeJsonResult(
    subject: string,
    callback: (subject: String, data: any) => void
  ) {
    const sub = Nats.connection.subscribe(subject);
    (async () => {
      for await (const m of sub) {
        const result = JSON.parse(nats.StringCodec().decode(m.data));
        callback(m.subject, result);
      }
    })();

    return sub;
  }
  static async subscribeUint8ArrayResult(
    subject: string,
    callback: (subject: String, data: Uint8Array) => void
  ) {
    const sub = Nats.connection.subscribe(subject);
    (async () => {
      for await (const m of sub) {
        console.log("Received a message:", m.subject, m.data);
        callback(m.subject, m.data);
      }
    })();

    return sub;
  }

  static async publish(subject: string, data: Object) {
    let msg = "";
    if (data instanceof Object) {
      msg = JSON.stringify(data);
    }
    Nats.connection.publish(subject, nats.StringCodec().encode(msg));
  }
}

export default {
  s: Nats,
  n: new Nats(),
};
