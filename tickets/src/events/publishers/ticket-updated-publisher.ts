import {
  Publisher,
  Subjects,
  TicketUpdatedEvent,
} from "@db-udemy-microservices-ticketing/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}
