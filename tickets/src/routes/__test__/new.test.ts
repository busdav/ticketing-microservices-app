import request from "supertest";
import { app } from "../../app";

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
it("can only be accessed if the user is signed in", async () => {});
it("returns an error if an invalid title is provided", async () => {});
it("returns an error if an invalid price is provided", async () => {});
it("creates a ticket with valid inputs", async () => {});
