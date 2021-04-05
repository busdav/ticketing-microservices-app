import nats from "node-nats-streaming";

/* 
We're building a client from the node-nats-streaming library. The client will be what will actually connect to the nats streaming server
that's running in our cluster and exchange some information with it.
In nats terminology (and documentation), the clients are called `stan`.
Architecture of the NATS streaming server setup: 
the stan (client) in the publisher is emitting an event with associated channel (i.e. subject). The NATS streaming server is publishing that event to everyone 
that's subscribed to the channel. The stan in the listener will have told the NATS streaming server prior that he wants so subscribe to a certain channel, 
so will receive that event from the NATS streaming server. 
*/
const stan = nats.connect("ticketing", "abc", {
  url: "http://localhost:4222",
});

/*
Next, we want to wait for the stan to connect to the nats streaming server. Unfortuantely, with this library we can't use async/await syntax;
instead we have to take a primarily event-driven approach. After the client has successfully connected, the nats streaming server  will
emit a `connect` event. We're going to listen for the `connect` event, with a function as the second argument.
We can only share plain strings as events (essentially just raw data). So we need to convert the `data` object to a string. 
JSON is a string, so we just convert the object to JSON.
*/
stan.on("connect", () => {
  console.log("Publisher connected to NATS");

  const data = JSON.stringify({
    id: "123",
    title: "concert",
    price: 20,
  });

  // First arg: subject name, second arg: event/data we want to share (in NATS world referred to as "message"). The third argument (callback function) is optional.
  stan.publish("ticket:created", data, () => {
    console.log("Event published");
  });
});
