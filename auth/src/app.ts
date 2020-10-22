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

// Curly braces necessary because we're doing a named export here. The app.ts file does NOT start up our express app, it
// JUST configures it. (needed to use supertest)
export { app };
