import express, { Request, Response } from "express";
// Remember: this is a method that's going to be used as a middleware, to validate incoming data on the body of this POST request. 
import { body, validationResult } from "express-validator";

import { RequestValidationError } from "../errors/request-validation-error";

const router = express.Router();

router.post("/api/users/signin", 
[
  body("email")
    .isEmail()
    .withMessage("Email must be valid"),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("You must supply a password")
], 
(req: Request, res: Response) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new RequestValidationError(errors.array());
  }
});

export { router as signinRouter };
