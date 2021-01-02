/* 
`{ Request, Response }`: these are TYPES. needed to import that from the @types/express package. 
Reason: after inserting the express-validator middleware function, typescript couldn't do the type inference 
anymore for `req` and `res`, so threw an error. Therefore, we needed to put explicit type annotations. 
*/
import express, { Request, Response } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";
import {
  validateRequest,
  BadRequestError,
} from "@db-udemy-microservices-ticketing/common";

import { User } from "../models/user";

const router = express.Router();

/* 
express-validator is a middleware - "in the middle" after request and before our callback function i.e. request handler. The way it works is: 
It inspects, validates and sanitizes the email and password properties of the request object, and if there is an error, it will 
append an error object to the request object. This error prop can then be called upon in our request handler, through `validationResult`. 
*/
router.post(
  "/api/users/signup",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Password must be between 4 and 20 characters"),
  ],
  /*
  Following the above validation, we now call our custom validation middleware that we abstracted into validate-request.ts 
  `validateRequest` will throw an error where appropriate, depending on the express-validator's `validationResult`.
  */
  validateRequest,
  async (req: Request, res: Response) => {
    /* 
    Desctructuring assignment syntax. What we extract is the key + value, i.e. `{ email: 'test@test.com' }`. 
    This is what is printed out if we console.log `{ email }`.
    If we console.log({ email, password }), then printed out is `{ email: 'test@test.com', password: 'mypassword' }`. 
    We can also just console.log `email` and get the string `test@test.com`. 
    Destructuring assignment syntax also works with arrays, and with nested objects/arrays. 
    Of course, with mongoose, we want to send an object, e.g. `User.findOne({ email })`, meaning "find me a user where `email` is 
    `test@test.com`" - just a string as in "test@test.com" obviously won't work. 
    */
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new BadRequestError("Email in use");
    }

    const user = User.build({ email, password });
    await user.save();

    // Generate JWT
    const userJwt = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      // We use a bang below to ignore a TS error we would otherwise get. (see onenote notes on why).
      process.env.JWT_KEY!
    );
    /*
    Store JWT on session object. The cookieSession library is going to take the `.jwt` object, 
    serialize it, and then send it back to the user's browser. 
    Because we're using TS, we can't just define a new property on the req.session object, such as 
    `req.session.jwt = userJwt`. The @types/jsonwebtoken is telling TS that there is `req.session`, but doesn't tell it about `.jwt`, 
    since that's custom, coming from us. Therefore, we're just redefining the whole object in this case, and set it on `req.session`.  
    */
    req.session = {
      jwt: userJwt,
    };

    res.status(201).send(user);
  }
);

export { router as signupRouter };
