import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { app } from "../app";

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
