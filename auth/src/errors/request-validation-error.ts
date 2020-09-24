// Differentiate between `ValidationError` from express-vaidator and our self-made `RequestValidationError`
import { ValidationError } from "express-validator";

export class RequestValidationError extends Error {
  /*
  Note that here we are using TS parameter properties. Paramater properties let us create and initialize class member variables in one place. 
  It is a shorthand for creating member variables. So, instead of, outside the constructor, putting the type definition 
  `private _errors: ValidationError[]` (read: "ValidationError array"), then
  having the constructur be `constructor(errors: ValidationError[])` (i.e. defining arguments including defining their type) and, 
  inside the constructor, putting `this._errors = errors`, 
  we simply put the keyword `private` directly in the parameters of the constructor in order to make user of parameter properties:  
  `constructor(private _errors: ValidationError[])`. 
  With either, what we are doing is, we are taking the property `_errors`, and assigning it as a property to the overall class.
  Note: if you look at DatabaseConnectionError, there, outside the constructor, we have a hard-coded property `reason`. Note the difference there:
  This is an *assignment* of a class member variable. It being hard-coded, we do not need any argument/parameter input from the constructor; 
  therefore, we are defining and assigning this member variable OUTSIDE the constructor. Also, we're making use of TS type inference there:
  we're not explicitly defining `reason` as a string - we're just ASSIGNING a string directly. 
  Note: I really need to differentiate between variable assignment with `=` (applies also within classes), 
  object property assignment with `:`
  and TS type definition with `:`
  */
  constructor(public errors: ValidationError[]) {
    super();

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
}
