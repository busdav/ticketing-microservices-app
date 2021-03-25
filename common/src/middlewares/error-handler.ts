import { Request, Response, NextFunction } from "express";
import { CustomError } from "../errors/custom-error";
/*
Given that our react app could receive error msg from many different services written in different languages, we need to make sure that 
all error messages coming out of a service have the same format and structure. Therefore, we pass any error in our Express app
to a custom error handler middleware that we're defining in here. 
Custom error handling middleware functions are defined in the same way as other middleware functions, except error-handling functions 
have four arguments instead of three: (err, req, res, next). If we write a function like that, then Express will know that it is
an error handler. If we now use somewhere else e.g. `throw new Error("Invalid email or password")` (for sync fx) or `next(error)` (for async fx), 
then our error handler will pick up the error. 
Our common response structure will be: `{ errors: { message: string, field?: string }[] }`, so:
an object with an errors property which will be an array of objects that each have one or two string properties. 
We're also going to create custom subclasses of the Error class (see directory `errors`), so that we can append more information to an error
(rather than just a string message). 
*/
export const errorHandler = (
  err: Error, // includes its subclasses, such as e.g. our RequestValidationError
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof CustomError) {
    /* 
    `Return` as we want to return and exit early. Here, we create the "outer" part of our common response structure, i.e., 
     we take the array objects `formattedErrors` and assign it as a property to the `errors` property of the object that we are going
     to send back to the client.
    */
    return res.status(err.statusCode).send({ errors: err.serializeErrors() });
  }

  console.error(err);
  res.status(400).send({
    errors: [{ message: "Something went wrong" }],
  });
};
