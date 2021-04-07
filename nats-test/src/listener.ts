import nats, { Message } from "node-nats-streaming";
import { randomBytes } from "crypto";

console.clear();

const stan = nats.connect("ticketing", randomBytes(4).toString("hex"), {
  url: "http://localhost:4222",
});

stan.on("connect", () => {
  console.log("Listener connected to NATS");

  const subscription = stan.subscribe(
    "ticket:created",
    "orders-service-queue-group"
  );

  // With most other librarier, we'd have this directly in a callback function to the first function above (`stan.subscribe`), but not with this library.
  // So, we first create the subscription, and then listen for a message.
  // `msg` below is not just raw data (as opposed to the msg that gets sent to the NATS streaming server by the publisher)
  subscription.on("message", (msg: Message) => {
    const data = msg.getData();

    if (typeof data === "string") {
      console.log(`Received event #${msg.getSequence()}, with data: ${data}`);
    }
  });
});
