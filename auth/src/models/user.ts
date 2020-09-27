import mongoose from "mongoose";

/* 
An interface that descibes the properties that are required to create a new user. We need this because TS and mongoose do not work 
together really well - even though we installed the @types/mongoose file, mongoose has no idea, after creating the userSchema, 
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
  },
});

/*
Related to what we mentioned above - trick to make TS and mongoose work together. Everytime we want to create a new user, instead of 
calling `new User()`, we're going to call the below builder function `User.buildUser`, just so that we can have TS check that we're 
passing the right attributes. 
*/
userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>("User", userSchema);

export { User };
