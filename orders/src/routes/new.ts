import mongoose from "mongoose";
import express, { Request, Response } from "express";
import {
  NotFoundError,
  requireAuth,
  validateRequest,
} from "@db-udemy-microservices-ticketing/common";
import { body } from "express-validator";
import { Ticket } from "../models/ticket";
import { Order } from "../models/order";

const router = express.Router();

router.post(
  "/api/orders",
  requireAuth,
  [
    body("ticketId")
      .not()
      .isEmpty()
      // The below step checks that the provided ID is not e.g. "123", but has the format of a mongoose ObjectId. Now, this is slightly problematic, because it means that
      // we do some subtle coupling between the Ticket service and this Order service (because, we are making assumption here in the Order service that an ID coming from
      // the Ticket service would have a certain format. What if we made changes to the Ticket service in the future, e.g. used no longer Mongodb but a different db?
      // Just to be aware of.)
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage("TicketId muust be provided"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;

    // Find the ticket the user is trying to order in the database
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError();
    }

    // Make sure that this ticket is not already reserved

    // Calculate an expiration date for this order

    // Build the order and save it to the database

    // Publish an event saying that an order was created

    res.send({});
  }
);

export { router as newOrderRouter };
