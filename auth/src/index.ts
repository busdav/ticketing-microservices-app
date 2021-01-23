import mongoose from "mongoose";

import { app } from "./app";

const start = async () => {
  /*
  We only put all of this into a function because some versions of Node (maybe the ones we're running in our image) do not yet support 
  the `await` keyword at the top level i.e. outside of a function. So, we define it in a function, and then call it at the bottom of 
  the file. 
  */
  /*
  Here, we want to make sure that, as soon as the app starts up (rather than just upon deployment), if there are env vars missing, 
  an error is thrown. 
  */
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY must be defined");
  }
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI must be defined");
  }
  /*
  The connection URL usually takes the form of "mongodb://[DOMAIN]" (e.g. if running mongo locally: "mongodb://localhost"). 
  Here of course, we need to connect to our MongoDB instance running in the pod that our depl created, or rather, 
  to the clusterIP service belonging to that pod. We simply put the name of that service where we would normally put the domain, 
  plus the port, plus the name of the actual database inside there that we want to connect to (will be created if non-existant), 
  plus an options object.
  If we wanted to use this app in production, a hosted DB such as MongoDB Atlas would probably be better than the self-hosted
  solution we're building here, were DB is self-hosted within a container/pod. 
  */
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log("Connected to MongoDB");
  } catch (err) {
    /* 
    The mongoose.connect function will throw an error if unsuccessful. In order to be able to catch that error, we'll wrap the whole thing
    into a try catch block, and do a console.error passing on the actual error (`err`). 
    */
    console.error(err);
  }
  // If we make it past the try catch block, it is time for us to start listening to incoming traffic i.e. requests.
  app.listen(3000, () => {
    console.log("Listening on port 3000");
  });
};

start();
