import mongoose from "mongoose";
import { Password } from "../services/password";

/* 
An interface that descibes the properties that are required to create a new user. We need this because TS and mongoose do not work 
together really well - even though we installed the @types/mongoose file, TS has no idea, after creating the userSchema, 
that we are expecting two properties for a new user, email and password, and that they're both strings (note that the `String`
in the userSchema has nothing to do with TS - it refers to the JS string constructor and is required by mongoose).
*/
interface UserAttrs {
  email: string;
  password: string;
}

/*
An interface that describes the properties that a User model has. We need to add this so that, under TS, we can add a custom method 
User.build() to the Model, via userSchema. See comment below as to why we want to do that. 
Essentially, we're taking all the properties that a mongoose Model has (`extends`) and add one more method. 
*/
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

/*
An interface that descibres the properties that a User Document has. This is important because again, TS doesn't know about it, because 
mongoose is not telling TS about it. So, any prop we want to access on a user, including the props that mongoose adds automatically
upon creation, such as createdAt, we must specify here, so that TS doesn't complain when we're trying to call the props on a user. 
*/
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  }
}, { 
  /*
  Just as with error messages, we want to make sure that our frontend always gets the same formatting from all microservices, i.e.
  we want to implement common response properties for all of our microservices. 
  To do so, we can define how mongoose (and also JS) convert an object to JSON. 
  In JS: `JSON.stringify(foobarObject)` by default converts keys and values into strings. However, we can override that by defining
  a `toJSON()` funtion inside the object, like so: `const person = { name: "alex", toJSON() { return 1; } };`. If we run 
  `JSON.stringify(person)`, we get back 1. 
  The same is possible with mongoose, just implemented a little differently: we don't define a function, but an object with config
  options, that's going to help mongoose to take our user document and turn it into JSON. Remember, you get to the TS type
  definitions (and therefore the documentation) by command clicking on toJSON and then documentToObjectOptions. 
  Note that doing this in the model file is not very common, as this (in MVC) is a view related task. But we're doing it here. 
  */
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.password;
      // Alternatively to the below, we could also set the versionKey property to false
      delete ret.__v;
    }
  }
});

/*
Below is a middleware function implemented in mongoose. Anytime we're going to attempt to save a user to our db, we're going to implement
this function. 
What is `done`? Mongoose doesn't yet have great support OOTB of async await, so, is still doing things a bit the 
old way. That's why, when we want to run any asynchronous code inside the callback function that is a parameter to 
`.pre()`, we get the `done` argument. We are responsible to tell mongoose when we've done all the work we wanted to do inside 
this callback function by calling `done()`. 
Why are we not using arrow function, i.e. `async (done) => {}`? Reason: anytime we put together a mognoose middleware function, we
get access to the document that is being saved, so the actual user we're trying to persist to the db, as `this` inside of the 
callback function. If we used an arrow function, then the value of `this` inside the callback would be overridden, and would be instaed
equal to the context of this entire file (`user.ts`), as opposed to the user document - which is not what we want. 
*/
userSchema.pre("save", async function (done) {
  /* 
  We want to check for the case where we retrieve a user from the db and then save it back to db, without changes to the password
  (e.g. change email). If we ran this middleware in such case, we would rehash a password that's already hashed - not what we want.
  (Mongoose will also qualify a password being supplied for the first time as `modified`.)
  */
  if (this.isModified("password")) {
    const hashed = await Password.toHash(this.get("password"));
    this.set("password", hashed);
  }
  done();
});

/*
Related to what we mentioned above - trick to make TS and mongoose work together. Everytime we want to create a new user, instead of 
calling `new User()`, we're going to call the below builder function `User.buildUser`, just so that we can have TS check that we're 
passing the right attributes. The `User.buildUser` we add through `.statics`, and TS ALLOWS us to do so because we told TS
about the `build` property in the interface above, see above. 
*/
userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

/*
The part in angle brackets: this is TS's `generic syntax` or `generics`. This is essentially "functions for types". 
You can think of the two items as "arguments to the function of `model`". But instead of being a dataype or an actual value, 
it is a TYPE. So, you can think of these as types being provided to a function as arguments, allowing us to customize the 
types being used inside a function, a class, or an interface. 
If we command-click on .model, we get to the type definition for the .model function. We can see that we can pass 
two generics to the function, `T extends Document`, and `U extends Model`. We also see that U is being used to indicate
what the function will return. So, below we're specifying that the .model function's return value should be of type `UserModel`. 
*/
const User = mongoose.model<UserDoc, UserModel>("User", userSchema);

export { User };
