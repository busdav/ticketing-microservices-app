import express, { Request, Response } from "express";
import { NotFoundError } from "@db-udemy-microservices-ticketing/common";
import { Ticket } from "../models/ticket";

const router = express.Router();

router.get("/api/tickets/:id", async (req: Request, res: Response) => {
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    throw new NotFoundError();
  }

  // Whenever we don't manually send a status code, it will default to 200, which will make our test pass, so we don't need to add this explicitly
  res.send(ticket);
});

export { router as showTicketRouter };
