import express from "express";
import "express-async-errors";
import cookieSession from "cookie-session";
import {
  errorHandler,
  NotFoundError,
  currentUser,
} from "@db-udemy-microservices-ticketing/common";
import { createTicketRouter } from "./routes/new";
import { showTicketRouter } from "./routes/show";

const app = express();
app.set("trust proxy", true);
app.use(express.json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== "test",
  })
);

// Makes it so that whenever user is authenticated, that will set the req.currentUser property
app.use(currentUser);

app.use(createTicketRouter);
app.use(showTicketRouter);

app.all("*", async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
