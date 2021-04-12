import nats, { Message } from "node-nats-streaming";
import { randomBytes } from "crypto";

console.clear();

const stan = nats.connect("ticketing", randomBytes(4).toString("hex"), {
  url: "http://localhost:4222",
});

stan.on("connect", () => {
  console.log("Listener connected to NATS");

  // Even though we have the "heartbeat" healthchecks (see depl file), those checks generally take too long - we want to inform NATS more quickly of when a client
  // is shutting down, so that NATS doesn't wait around trying to still send that client a (then delayed) message. So, we're writing event handlers
  // that will tell NATS immediately that this client is about to shut down and should no longer be sent any messages. See handlers at the bottom.
  stan.on("close", () => {
    console.log("NATS connection closed!");
    process.exit();
  });

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

/* 
See above - these are event handlers that are watching for interrupt or terminate signals. These are signals that are sent to this process any time that 
TS node dev tries to restart the program, or any time we hit ctrl+c at terminal. And any time that happens, we're going to intercept those interrup or terminate
requests to our program, and  we'll be trying to close the stan (i.e. the client)
first. Essentially, the stan says "Don't kill us just yet - I need to first close my connection." By calling stan.close(), we're telling client 
to reach out to NATS streaming server and tell it, "I'm closing, don't send me any more messages". 
After it closes down, it will then do a console.log and manually exit our program entirely (see above).
Note that if you're on windows, this might not work - windows does not always use the same kind of sigint and sigterm. 
Also, if we forecable kill these processes (rather than gracefully), e.g. through activity monitor through macOS, the below handlers don't have a chance to run. In such case, we have to 
continue to rely on the hearbeat health check, which will of course have some delay, during which the NATS streaming server will think that a client who is, in fact, 
dead, is still alive and subscribed, and is supposed to get messages. 
*/
process.on("SIGINT", () => stan.close());
process.on("SIGTERM", () => stan.close());
