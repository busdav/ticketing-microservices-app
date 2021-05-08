import { Message, Stan } from "node-nats-streaming";

export abstract class Listener {
  // Abstract properties: means they must be defined by our subclasses
  abstract subject: string;
  abstract queueGroupName: string;
  abstract onMessage(data: any, msg: Message): void;
  // The below defines `this.client` - whereas the `constructor(client: Stan)` defines the ` = client`, i.e. the argument used inside the function.
  private client: Stan;
  // Protected: means subclass can define it if it wants to; 5 seconds
  protected ackWait = 5 * 1000;

  constructor(client: Stan) {
    this.client = client;
  }

  // With most other JS libraries, you would expect to be able to pass in a configurations object, but not here:
  // We chain the options on as additional method calls. One important one is: manual acknowledgment mode. This makes sure that we don't use the default behavior there.
  // Default behavior: as soon as the library has received an event, it will tell the NATS streaming server "all good here" - but what if in the message handler,
  // something goes wrong (e.g. connection to the DB was lost)? So, we need to be able to acknowledge manually.
  // If we don't acknowledge, then NATS will send the event again after e.g. 30s, or will send it to another member of the queue group.
  // Queue groups avoid double processing of one event by several instances of the same microservice (in case you are scaling horizontally by adding multiple instances +
  // load balancer, rather than vertically i.e. adding more compute power or memory) - NATS will only send an event to ONE member of a queue group at a time.
  // Through making sure that every object created by a microservice has an ID and sequential versioning, we make sure that for a given object, events are not
  // processed double, or out of order.
  subscriptionOptions() {
    return (
      this.client
        .subscriptionOptions()
        // setDeliverAllAvailable() is an option that sends ALL events that have ever been emitted to and by the NATS streaming server. We in principle need this in order to
        // make sure that if the respective microservice ever goes down, it can catch up once it comes back online. However, if you imagine that you could have millions of events, this
        // isn't feasible. So instead, we use setDurableName("<ID, i.e. serviceName>") that will create a durable subscription, i.e.,
        // it will have NATS keep track of WHICH events have been successfully processed by the microservice (through acknowledgment) that was subscribed with the respective ID,
        // and re-send ONLY THOSE that have not yet been marked as processed, once the microservice with that exact ID comes back online.
        // Why do we still also need setDeliverAllAvailable()? For the very first time that the respective microservice comes online.
        // The queue group below we also need for this, because it will make NATS maintain the durable subscription name even if the stan completely disconnects for some time.
        .setDeliverAllAvailable()
        .setManualAckMode(true)
        .setAckWait(this.ackWait)
        // We're going to use the queueGroupName both as the queue group name and as the durable name - usually makes sense to use the same one for both.
        .setDurableName(this.queueGroupName)
    );
  }

  listen() {
    const subscription = this.client.subscribe(
      this.subject,
      this.queueGroupName,
      this.subscriptionOptions()
    );

    // With most other libraries, we'd have this directly in a callback function to the first function above (`stan.subscribe`), but not with this library.
    // So, we first create the subscription, and then listen for a message.
    // `msg` below is not just raw data (as opposed to the msg that gets sent to the NATS streaming server by the publisher)
    subscription.on("message", (msg: Message) => {
      console.log(`Message received: ${this.subject} / ${this.queueGroupName}`);

      const parsedData = this.parseMessage(msg);
      this.onMessage(parsedData, msg);
    });
  }

  parseMessage(msg: Message) {
    const data = msg.getData();
    return typeof data === "string"
      ? JSON.parse(data)
      : // In case data is a Buffer: this is how we would parse a Buffer and get some JSON data our of it:
        JSON.parse(data.toString("utf8"));
  }
}
