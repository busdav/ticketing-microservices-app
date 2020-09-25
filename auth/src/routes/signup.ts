/* 
`{ Request, Response }`: needed to import that from the @types/express package. Reason: after inserting the express-validator
middleware function, typescript couldn't do the type inference anymore for `req` and `res`, so threw an error. Therefore, we needed to put
explicit type annotations. 
*/
import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { RequestValidationError } from "../errors/request-validation-error";
import { DatabaseConnectionError } from "../errors/database-connection-error";

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

    const { email, password } = req.body;

    console.log("Creating a user...");
    throw new DatabaseConnectionError();

    res.send({});
  }
);

export { router as signupRouter };
