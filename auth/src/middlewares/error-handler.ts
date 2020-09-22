import { Request, Response, NextFunction } from "express";
import { RequestValidationError } from "../errors/request-validation-error";
import { DatabaseConnectionError } from "../errors/database-connection-error";
/*
Given that our react app could receive error msg from many different services written in different languages, we need to make sure that 
all error messages coming out of a service have the same format and structure. Therefore, we pass any error in our Express app
to a custom error handler middleware that we're defining in here. 
Custom error handling middleware functions are defined in the same way as other middleware functions, except error-handling functions 
have four arguments instead of three: (err, req, res, next). If we write a function like that, then Express will know that it is
an error handler. If we now use somewhere else e.g. `throw new Error("Invalid email or password")` (for sync fx) or `next(error)` (for async fx), 
then our error handler will pick up the error. 
We're also going to create custom subclasses of the Error class (see directory `errors`), so that we can append more information to an error
(rather than just a string message). 
*/
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof RequestValidationError) {
    console.log("Handling this error as a request validation error");
  }

  if (err instanceof DatabaseConnectionError) {
    console.log("Handling this error as a db conneciton error");
  }

  res.status(400).send({
    message: err.message,
  });
};
