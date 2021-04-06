import nats from "node-nats-streaming";

console.clear();

const stan = nats.connect("ticketing", "123", {
  url: "http://localhost:4222",
});

stan.on("connect", () => {
  console.log("Listener connected to NATS");

  const subscription = stan.subscribe("ticket:created");

  // With most other librarier, we'd have this directly in a callback function to the first function above (`stan.subscribe`), but not with this library.
  // So, we first create the subscription, and then listen for a message.
  // `msg` below is not just raw data (as opposed to the msg that gets sent to the NATS streaming server by the publisher)
  subscription.on("message", (msg) => {
    console.log("Message received");
  });
});
