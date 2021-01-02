import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// We add this interface so that we can define precislely what the `payload` (see below) is, rather than TS only knowing
// that it is `object | string`.
interface UserPayload {
  id: string;
  email: string;
}

// This is how we can reach into an existing type definition and make a modification to it. We did this so we can assign the new property
// `currentUser` to the Request object. Notice that we did not have to *extend* the existing `Request` object - we can just add like so.
declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload;
    }
  }
}

export const currentUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  /*
  The below is TS shorthand for `if (!req.session || !req.session.jwt)`. We need the first check in order to "prove" to TS that we're
  addressing the case where req.session could be `null`. So, this if statement says "If there is no req.session object, OR, 
  if there is one but the `jwt` property is not defined, then...".
  */
  if (!req.session?.jwt) {
    // In the above case, we want to return, and move on to the next middleware inside of our chain.
    return next();
  }

  // If someone has altered the JWT, then `jwt.verify` will throw an error. We need to make sure to capture that error.
  // -> try/catch
  try {
    const payload = jwt.verify(
      req.session.jwt,
      process.env.JWT_KEY!
    ) as UserPayload;
    req.currentUser = payload;
  } catch (err) {}

  // We're calling `next()` here outside of the `catch` because, whether or not we decode the JWT successfully, we always
  // want to continue on to the next middleware in our chain (so, in either case: success or error)
  next();
};
