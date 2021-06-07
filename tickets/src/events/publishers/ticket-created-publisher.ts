import {
  Publisher,
  Subjects,
  TicketCreatedEvent,
} from "@db-udemy-microservices-ticketing/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
