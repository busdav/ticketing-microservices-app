import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const currentUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.session?.jwt) {
    // In the above case, we want to return, and move on to the next middleware inside of our chain.
    return next();
  }
};
