/* 
`{ Request, Response }`: needed to import that from the @types/express package. Reason: after inserting the express-validator
middleware function, typescript couldn't do the type inference anymore for `req` and `res`, so threw an error. Therefore, we needed to put
explicit type annotations. 
*/
import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { User } from "../models/user";
import { RequestValidationError } from "../errors/request-validation-error";

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
      .withMessage("Password myst be between 4 and 20 characters"),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw new RequestValidationError(errors.array());
    }

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
      console.log("Email in use");
      return res.send({});
    }

    const user = User.build({ email, password });
    await user.save();

    res.status(201).send(user);
  }
);

export { router as signupRouter };
