import request from "supertest";
import { app } from "../../app";
import { signupRouter } from "../signup";

it("responds with details about the current user", async () => {
  // Global helper function we've defined setup.ts:
  const cookie = await global.signin();

  // Because supertest (unlike our browser or postman) will not automatically include the cookie we received from signing up/in in
  // follow-up requests, we need to manually set it ourselves.
  const response = await request(app)
    .get("/api/users/currentuser")
    .set("Cookie", cookie)
    .send()
    .expect(200);

  expect(response.body.currentUser.email).toEqual("test@test.com");
});

it("responds with null if not authenticated", async () => {
  const response = await request(app)
    .get("/api/users/currentuser")
    // We don't set the cookie, of course
    .send()
    .expect(200);

  expect(response.body.currentUser).toEqual(null);
});
