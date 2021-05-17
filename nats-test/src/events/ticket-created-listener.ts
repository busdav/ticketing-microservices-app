import { Message } from "node-nats-streaming";
import { Listener } from "./base-listener";
import { TicketCreatedEvent } from "./ticket-created-event";
import { Subjects } from "./subjects";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  // Because we have assigned the `TicketCreatedEvent` as the type to this class, TS now helps us by showing errors if we do not implement the class correctly
  // (because we defined proprerties of the abstract class in the base-listener at the help of the assigned type)
  // (we have to both define the type of `subject` AND assign its value with `Subjects.TicketCreated`. Why also the type? because TS is afraid we might otherwise
  // change the type of `subject` later on, but it doesn't allow that, because in the base-listener, we say that the subject ALWAYS has to be in reference to the
  // type provided to the class as an argument (here `TicketCreatedEvent`)).
  // By defining `TciketcreatedEvent["data"]` as a type for `data`, TS also guides us in terms of what properties are available in this case on `data`.
  // (is in reference to the `TicketCreatedEvent` interface)
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
  queueGroupName = "payments-service";

  onMessage(data: TicketCreatedEvent["data"], msg: Message) {
    console.log("Event data!", data);

    console.log(data.id);

    msg.ack();
  }
}
