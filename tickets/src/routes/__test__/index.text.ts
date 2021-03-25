import request from "supertest";
import { app } from "../../app";

it("can fetch a list of tickets", async () => {
  await request(app).post("/api/tickets").set("Cookie", global.signin()).send({
    title: "asdf",
    price: 20,
  });
  await request(app).post("/api/tickets").set("Cookie", global.signin()).send({
    title: "asdf",
    price: 20,
  });
});
