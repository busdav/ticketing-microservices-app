import nats, { Message } from "node-nats-streaming";
import { randomBytes } from "crypto";

console.clear();

const stan = nats.connect("ticketing", randomBytes(4).toString("hex"), {
  url: "http://localhost:4222",
});

stan.on("connect", () => {
  console.log("Listener connected to NATS");

  // With most other JS libraries, you would expect to be able to pass in a configurations object, but not here:
  // We chain the options on as additional method calls. One important one is: manual acknowledgment mode. This makes sure that we don't use the default behavior there.
  // Default behavior: as soon as the library has received an event, it will tell the NATS streaming server "all good here" - but what if in the message handler,
  // something goes wrong (e.g. connection to the DB was lost)? So, we need to be able to acknowledge manually.
  // (If we don't acknowledge, then NATS will send the event again after e.g. 30s, or will send it to another member of the queue group)
  const options = stan.subscriptionOptions().setManualAckMode(true);

  const subscription = stan.subscribe(
    "ticket:created",
    "orders-service-queue-group",
    options
  );

  // With most other librarier, we'd have this directly in a callback function to the first function above (`stan.subscribe`), but not with this library.
  // So, we first create the subscription, and then listen for a message.
  // `msg` below is not just raw data (as opposed to the msg that gets sent to the NATS streaming server by the publisher)
  subscription.on("message", (msg: Message) => {
    const data = msg.getData();

    if (typeof data === "string") {
      console.log(`Received event #${msg.getSequence()}, with data: ${data}`);
    }

    msg.ack();
  });
});
