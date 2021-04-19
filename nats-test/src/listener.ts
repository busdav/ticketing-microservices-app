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
  // If we don't acknowledge, then NATS will send the event again after e.g. 30s, or will send it to another member of the queue group.
  // Queue groups avoid double processing of one event by several instances of the same microservice (in case you are scaling horizontally by adding multiple instances +
  // load balancer, rather than vertically i.e. adding more compute power or memory) - NATS will only send an event to ONE member of a queue group at a time.
  // Through making sure that every object created by a microservice has an ID and sequential versioning, we make sure that for a given object, events are not
  // processed double, or out of order.
  const options = stan
    .subscriptionOptions()
    .setManualAckMode(true)
    // setDeliverAllAvailable() is an option that sends ALL events that have ever been emitted to and by the NATS streaming server. We in principle need this in order to
    // make sure that if the respective microservice ever goes down, it can catch up once it comes back online. However, if you imagine that you could have millions of events, this
    // isn't feasible. So instead, we use setDurableName("<ID, i.e. serviceName>") that will create a durable subscription, i.e.,
    // it will have NATS keep track of WHICH events have been successfully processed by the microservice (through acknowledgment) that was subscribed with the respective ID,
    // and re-send ONLY THOSE that have not yet been marked as processed, once the microservice with that exact ID comes back online.
    // Why do we still also need setDeliverAllAvailable()? For the very first time that the respective microservice comes online.
    // The queue group below we also need for this, because it will make NATS maintain the durable subscription name even if the stan completely disconnects for some time.
    .setDeliverAllAvailable()
    .setDurableName("accounting-service");

  const subscription = stan.subscribe(
    "ticket:created",
    "queue-group-name",
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
