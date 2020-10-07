import express from "express";
/*
We import the express-async-errors package so that we can continue using the `throw new Error()` syntax even with async functions
i.e. here, route handlers, rather than having to use next and having to say e.g. 
`app.all("*", async (req, res, next) => {
  next(new NotFoundError());
});`
We want to avoid that as `next` can be complex to understand. 
*/
import "express-async-errors";
import mongoose from "mongoose";
import cookieSession from "cookie-session";

import { currentUserRouter } from "./routes/current-user";
import { signinRouter } from "./routes/signin";
import { signoutRouter } from "./routes/signout";
import { signupRouter } from "./routes/signup";
import { errorHandler } from "./middlewares/error-handler";
import { NotFoundError } from "./errors/not-found-error";

const app = express();
/*
Traffic is being proxied to our app through ingress nginx, so we want to tell express app that that's okay: 
*/
app.set("trust proxy", true);
app.use(express.json());
app.use(
  cookieSession({
    /* 
    We'll turn off encryption of the cookie, because what we will put into the cookie, the JWT, is already encrypted, and we want all 
    microservices to be easily able to read the cookie without having to worry about the microservices (that may be built with 
    different languages) being able to decrypt correctly. 
    */
    signed: false,
    /*
    We will only allow cookies to be placed if the user is on an https connection: (if testing with Postman, remember to manually 
    put https, as Postman defaults to http)
    */
    secure: true,
  })
);

app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);

app.all("*", async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

const start = async () => {
  /*
  We only put all of this into a function because some versions of Node (maybe the ones we're running in our image) do not yet support 
  the `await` keyword at the top level i.e. outside of a function. So, we define it in a function, and then call it at the bottom of 
  the file. 
  */
  /*
  The connection URL usually takes the form of "mongodb://[DOMAIN]" (e.g. if running mongo locally: "mongodb://localhost"). 
  Here of course, we need to connect to our MongoDB instance running in the pod that our depl created, or rather, 
  to the clusterIP service belonging to that pod. We simply put the name of that service where we would normally put the domain, 
  plus the port, plus the name of the actual database inside there that we want to connect to (will be created if non-existant), 
  plus an options object.
  */
  try {
    await mongoose.connect("mongodb://auth-mongo-srv:27017/auth", {
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
