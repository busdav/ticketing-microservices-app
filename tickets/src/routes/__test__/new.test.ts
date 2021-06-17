import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";

// We also want to tell jest to use a few mocks instead of the real files, for instance for the natsWrapper, because we don't
// want to rely on an actual connected NATS client for our tests. (otherwise we'd always have to have a NATS connection running
// on our local machine). The path for the below is to the file we want to fake, so the original one, not the fake one
// in the __mocks__ directory.
jest.mock("../../nats-wrapper");

/* 
What do we want to test? Probably we want to make sure that there is actually a route handler present
at /api/tickets that responds to a POST request. We probably want to make sure that there is middleware
that validates the incoming request body (i.e. that there is a title and a price, and that they are of 
the correct type). We probably want to make sure that requests to this route handler are always authenticated, 
in other words, user must be signed into our app in order to access this route handler. And then we want 
to make sure we actually create a ticket, or something like that.
So, let's first begin by writing out a few "it" blocks of tests that we're probably going to need.  
*/

it("has a route handler listening to /api/tickets for post requests", async () => {
  const response = await request(app).post("/api/tickets").send({});

  expect(response.status).not.toEqual(404);
});

it("can only be accessed if the user is signed in", async () => {
  const response = await request(app).post("/api/tickets").send({});

  expect(response.status).toEqual(401);
});

it("returns a status other than 401 if the user is signed in", async () => {
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({});

  expect(response.status).not.toEqual(401);
});

it("returns an error if an invalid title is provided", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title: "",
      price: 10,
    })
    .expect(400);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      price: 10,
    })
    .expect(400);
});
it("returns an error if an invalid price is provided", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title: "asdflkj",
      price: -10,
    })
    .expect(400);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title: "asdflkj",
    })
    .expect(400);
});

it("creates a ticket with valid inputs", async () => {
  // We're using keyword `let` because we're going to reassign `tickets` further below.
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  const title = "testTitle";

  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title,
      price: 20,
    })
    .expect(201);

  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);
  expect(tickets[0].price).toEqual(20);
  expect(tickets[0].title).toEqual(title);
});
