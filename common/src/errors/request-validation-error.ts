// Differentiate between `ValidationError` from express-vaidator and our self-made `RequestValidationError`
import { ValidationError } from "express-validator";
import { CustomError } from "./custom-error";

/* 
An alternative to the approach used here with the Abstract Class would be to define an interface 
(ideally in a separate file in the errors directory)
that makes sure that your custom error class is implemented directly. The interface could be as below, and you'd then add, 
when declaring the class, `export class RequestValidationError extends Error implements CustomError {`
The interface would be: 
// interface CustomError {
//   statusCode: number;
//   serializeErrors(): {
//     message: string;
//     field?: string;
//   }[];
// }
Why are we using an Abstract Class here? Mainly, because we want to be able to use the `instanceof` check against its subclasses, see our 
error handler. Remember that TS interfaces just fall away when translated into JS (they do not exist there), whereas abstract classes
actually create a class in JS. So, abstract classes can be used, just like interfaces, to set up data structure requirements, but they 
also create a class when compiled to JS, which is useful in our circumstances. Further props of abstract classes: 
they cannot be instantiated, but, as said, can be used to set up requirements for subclasses. 
*/

export class RequestValidationError extends CustomError {
  statusCode = 400;
  /*
  Note that here we are using TS parameter properties. Paramater properties let us create and initialize class member variables in one place. 
  It is a shorthand for creating member variables. So, instead of saying
  `
  private _errors: ValidationError[]   // (read: "ValidationError array") 

  constructor(errors: ValidationError[]) {   // (i.e. defining constructor arguments including defining their type) 
    this._errors = errors;
  `
  , we simply put the keyword `private` (or `public` if we wanted to) directly in the parameters of the constructor 
  in order to make use of parameter properties, see below. 
  With either approach, what we are doing is, we are taking the property `_errors`, and assigning it as a property to the overall class.
  Note: if you look at DatabaseConnectionError, there, outside the constructor, we have a hard-coded property `reason`. Note the difference there:
  This is an *assignment* of a class member variable. It being hard-coded, we do not need any argument/parameter input from the constructor; 
  therefore, we are defining and assigning this member variable OUTSIDE the constructor. Also, we're making use of TS type inference there:
  we're not explicitly defining `reason` as a string - we're just ASSIGNING a string directly. 
  Note: I really need to differentiate between variable assignment with `=` (applies also within classes), 
  object property assignment with `:`
  and TS type definition with `:`
  */
  constructor(public errors: ValidationError[]) {
    // Because we're defining a subclass of `CustomError`, we must call super();
    super("Invalid request parameters");

    /* 
    Next line needed is needed to make our sub-class work correctly, ONLY needed because we are extending a BUILT IN class (Error). 
    It is only needed if in tsconfig.ts target is set to 'es5'. https://stackoverflow.com/a/41102306/6846049
    For those wondering why compiling to es5 will break prototype chain:
    https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html#support-for-newtarget
    Whenever we create a new error instance using RequestValidationError, it actually acts as an instance of Error not RequestValidationError 
    when compiling down to es5. So for every instance created using RequestValidationError we set its prototype explicitly using 
    Object.setPrototypeOf() to its actual class
    */
    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }

  serializeErrors() {
    /* 
    We know that a RequestValidationError has a prop of `errors` which is an array of objects (see above - in the constructor, we define 
    the `errors` property as an array of `ValidationError` objects). 
    What we are doing here is to map over that array, in other words, create and return a new array with the following entries:
    for each entry of the original array (there, each entry was an object) we're going to create an object with `message` and `field` properties. 
    I.e., we prepare the "inner" part of our common response structure for errors, i.e. an array of objects, 
    for the error handler to then be able to take that array, put it into the object with the `errors` property (i.e. assign the array 
    to such `errors` property) and then send the whole object back to the react app client, it then being a response in our 
    common response structure `{ errors: { message: string, field?: string }[] }`.
    */
    return this.errors.map((err) => {
      return { message: err.msg, field: err.param };
    });
  }
}
