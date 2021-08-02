import mongoose from "mongoose";
import express, { Request, Response } from "express";
import {
  BadRequestError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequest,
} from "@db-udemy-microservices-ticketing/common";
import { body } from "express-validator";
import { Ticket } from "../models/ticket";
import { Order } from "../models/order";

const router = express.Router();

// Big like that just because it is an important parameter that we don't want to bury in some route handler below. (as it affects user so directly)
// You could even extract this into an environment variable so you don't have to redeploy your whole application when you want to change this.
// You could get even fancier and save this as a record to the database and add some web UI to it so you can allow an internal admin to change it on the fly.
// Could even be on a per user basis. But for now we'll just leave it like this.
const EXPIRATION_WINDOW_SECONDS = 15 * 60;

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
    const isReserved = await ticket.isReserved();
    if (isReserved) {
      throw new BadRequestError("Ticket is already reserved");
    }

    // Calculate an expiration date for this order
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    // Build the order and save it to the database
    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      // condense `ticket: ticket` into `ticket`
      ticket,
    });
    await order.save();

    // Publish an event saying that an order was created

    res.status(201).send(order);
  }
);

export { router as newOrderRouter };
