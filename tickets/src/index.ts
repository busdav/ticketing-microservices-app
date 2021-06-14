import mongoose from "mongoose";
import { app } from "./app";
// Note the lower case `natsWrapper` - because we're importing an INSTANCE of the class, NOT the class itself, see comment in nats-wrapper.ts
import { natsWrapper } from "./nats-wrapper";

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY must be defined");
  }
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI must be defined");
  }

  try {
    // The clusterId and url arguments of the natsWrapper.connect method refer back to our nats-deployment and respective service.
    await natsWrapper.connect("ticketing", "asldkjefh", "http://nats-srv:4222");
    // Even though we have the "heartbeat" healthchecks (see depl file), those checks generally take too long - we want to inform NATS more quickly of when a client
    // is shutting down, so that NATS doesn't wait around trying to still send that client a (then delayed) message. So, we're writing event handlers
    // that will tell NATS immediately that this client is about to shut down and should no longer be sent any messages. See handlers at the bottom.
    natsWrapper.client.on("close", () => {
      console.log("NATS connection closed!");
      process.exit();
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
    process.on("SIGINT", () => natsWrapper.client.close());
    process.on("SIGTERM", () => natsWrapper.client.close());

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error(err);
  }

  app.listen(3000, () => {
    console.log("Listening on port 3000");
  });
};

start();
