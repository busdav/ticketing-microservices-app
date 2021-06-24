import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import { app } from "../app";
import jwt from "jsonwebtoken";

declare global {
  namespace NodeJS {
    interface Global {
      /* 
      What we had in the setup file for the auth microservice (see bottom of file): 
      The global signin method below returned a Promise, which will eventually resolve itself with a cookie, which, as we can see from hovering on
      `cookie` below, is an array of strings - so, we had to indicate `signin(): Promise<string[]>;`
      However, as from the tickets microservice, we don't have access to ("/api/users/signup"), and we don't want to introduce a cross-microservice
      dependency, we're going to fake a cookie and a session object (see below). This means that the global signing method at the bottom 
      does no longer return a Promise, so we'll amend it to `signin(): string[];`, and we have to remove the async keywork on the signin method. 
      */
      signin(): string[];
    }
  }
}

// We also want to tell jest to use a few mocks instead of the real files, for instance for the natsWrapper, because we don't
// want to rely on an actual connected NATS client for our tests. (otherwise we'd always have to have a NATS connection running
// on our local machine). The path for the below is to the file we want to fake, so the original one, not the fake one
// in the __mocks__ directory.
// Rather than putting this line into each test file individually, we put it here.
jest.mock("../nats-wrapper");

// We need to define this outside of the scope of beforeAll, as we also need to reference it in afterAll
let mongo: any;

beforeAll(async () => {
  process.env.JWT_KEY = "asdfasdf";
  mongo = new MongoMemoryServer();
  const mongoUri = await mongo.getUri();

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

beforeEach(async () => {
  jest.clearAllMocks();
  // We tell mongoose to look at all the different connections that exist inside the `mongo` we defined above, established through
  // the `mongoose.connect` command inside of the `beforeAll` hook, and delete all associated collections.
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  // We stop running the MongoMemoryServer
  await mongo.stop();
  // We tell mongoose to disconnect from it
  await mongoose.connection.close();
});

/*
We are using a globally scoped helper function here so we can easily access it from any file. You could also e.g. move this function to
a separate file but then you'd have to import it wherever you want to use it.
Also note that because we put it in this `setup.ts` file, it will only be available in the test environment. 
Now, TS is telling us that there is no `signin` property on the `global` object, so we need to add a type definition for it. 
That's what we've done with the `declare global` statement at the top. 
*/
global.signin = () => {
  // Build a JWT payload. { id, email }
  const payload = {
    id: new mongoose.Types.ObjectId().toHexString(),
    email: "test@test.com",
  };

  // Create the JWT
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  // Build session Object { jwt: MY_JWT }
  const session = { jwt: token };

  // Turn that sessio into JSON
  const sessionJSON = JSON.stringify(session);

  // Take JSON and and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString("base64");

  // Return a string that's the cookie with the encoded data
  // (We have to return it as an array as supertest is expecting all cookies etc. in an array)
  return [`express:sess=${base64}`];
};

// For reference: the original signin method:

// global.signin = async () => {
//   const email = "test@test.com";
//   const password = "password";

//   const response = await request(app)
//     .post("/api/users/signup")
//     .send({
//       email,
//       password,
//     })
//     .expect(201);

//   const cookie = response.get("Set-Cookie");

//   return cookie;
// };
