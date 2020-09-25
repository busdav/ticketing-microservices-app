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

import { currentUserRouter } from "./routes/current-user";
import { signinRouter } from "./routes/signin";
import { signoutRouter } from "./routes/signout";
import { signupRouter } from "./routes/signup";
import { errorHandler } from "./middlewares/error-handler";
import { NotFoundError } from "./errors/not-found-error";

const app = express();
app.use(express.json());

app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);

app.all("*", async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
