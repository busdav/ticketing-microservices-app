import { Subjects } from "./subjects";

// This is how we prescribe that any TicketCreatedEvent will have the `ticket:created` subject, and that its data contains id, title and price.
export interface TicketCreatedEvent {
  subject: Subjects.TicketCreated;
  data: {
    id: string;
    title: string;
    price: number;
  };
}
