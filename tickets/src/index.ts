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
