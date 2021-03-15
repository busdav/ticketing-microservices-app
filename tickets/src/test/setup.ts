import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import { app } from "../app";

declare global {
  namespace NodeJS {
    interface Global {
      // signin method returns a Promise, which will eventually resolve itself with a cookie, which, as we can see from hovering on
      // `cookie` below, is an array of strings - so, that's what we indicate:
      signin(): Promise<string[]>;
    }
  }
}

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
global.signin = async () => {
  // Build a JWT payload. { id, email }
  // Create the JWT
  // Build session Object { jwt: MY_JWT }
  // Turn that sessio into JSON
  // Take JSON and and encode it as base64
  // Return a string that's the cookie with the encoded data
};

express: sess = eyJqd3QiOiJleUpoYkdjaU9pSklVekkxTmlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKcFpDSTZJall3TVdRd05qbGtPR1F6WWpjd01EQXhPR1ZsTm1JM1pTSXNJbVZ0WVdsc0lqb2lZWE5rYkdacmFtRnpaR1pzYTJwQVlYTmtiR1pyYWk1amIyMGlMQ0pwWVhRaU9qRTJNVEkxTVRRNU56TjkuV016UU1fN0o3NnRhbS1iM2RzSVNmOUx4cXB1MC1PUWo2OTFaYzUtRkQ1TSJ9;
