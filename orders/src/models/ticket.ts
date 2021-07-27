import mongoose from "mongoose";
import { Order, OrderStatus } from "./order";

// We're not necessarily replicating ALL attributes of the ticket model from the Ticket microservice, as the Order microservice
// only needs to know about the specific attributes below. That's also why we wouldn't put this model into the common module.
interface TicketAttrs {
  title: string;
  price: number;
}

export interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  isReserved(): Promise<boolean>;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
}

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

// The `statics` object is how we add a new method directly to a model itself. If we want to add a new method to a DOCUMENT, then
// we we're going to add a method i.e. a property to the `methods` object.
ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket(attrs);
};
// It's super critical to us a `keyword function` here, i.e. write out the keyword `function`, instedad of an arrow function. Why?
// Mongoose is stuck in the old was of JS - we need to access `this`, and if we're using an arrow function, it's going to mess around with the
// `this` value inside the function.
ticketSchema.methods.isReserved = async function () {
  // Make sure that a ticket is not already reserved
  // Run query to look at all orders. Find an order where the ticket is the ticket we just found,
  // and the order's status is not cancelled. If we find an order from that it meanst the ticket is reserved.
  // this === the ticket document that we just called `isReserved` on
  const existingOrder = await Order.findOne({
    ticket: this,
    status: {
      // The status is "in" some set of values that we write in an array:
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete,
      ],
    },
  });

  // We're expecting a boolean in response to "isReserved", so we're saying: if there is no existingOrder, flip the "false" resulting from the expression and make it true;
  // if there is an existingOrder, again flip it the "true" resulting from the expression and make it false;
  return !!existingOrder;
};

const Ticket = mongoose.model<TicketDoc, TicketModel>("Ticket", ticketSchema);

export { Ticket };
