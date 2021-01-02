import express, { Request, Response } from "express";
// Remember: this is a method that's going to be used as a middleware, to validate incoming data on the body of this POST request.
import { body } from "express-validator";
import jwt from "jsonwebtoken";
import {
  validateRequest,
  BadRequestError,
} from "@db-udemy-microservices-ticketing/common";

import { Password } from "../services/password";
import { User } from "../models/user";

const router = express.Router();

router.post(
  "/api/users/signin",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("You must supply a password"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      throw new BadRequestError("Invalid credentials");
    }

    const passwordsMatch = await Password.compare(
      existingUser.password,
      password
    );
    if (!passwordsMatch) {
      throw new BadRequestError("Invalid Credentials");
    }

    // Generate JWT
    const userJwt = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email,
      },
      process.env.JWT_KEY!
    );
    //  Store JWT on session object.
    req.session = {
      jwt: userJwt,
    };

    // Status 200 (rather than 201) as we're no longer creating a new user.
    res.status(200).send(existingUser);
  }
);

export { router as signinRouter };
