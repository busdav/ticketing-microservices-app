import express, { Request, Response } from "express";
// Remember: this is a method that's going to be used as a middleware, to validate incoming data on the body of this POST request. 
import { body } from "express-validator";

import { validateRequest } from "../middlewares/validate-request";

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
validateRequest,
(req: Request, res: Response) => {
});

export { router as signinRouter };
