import nats from "node-nats-streaming";

// We're building a client from the node-nats-streaming library. The client will be what will actually connect to the nats streaming server
// that's running in our cluster and exchange some information with it.
// In nats terminology (and documentation), the clients are called `stan`.
const stan = nats.connect("ticketing", "abc", {
  url: "http://localhost:4222",
});

// Next, we want to wait for the stan to connect to the nats streaming server. Unfortuantely, with this library we can't use async/await syntax;
// instead we have to take a primarily event-driven approach. After the client has successfully connected, the nats streaming server  will
// emit a `connect` event. We're going to listen for the `connect` event, with a function as the second argument.
stan.on("connect", () => {
  console.log("Publisher connected to NATS");
});
