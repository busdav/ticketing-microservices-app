import { ValidationError } from "express-validator";

export class RequestValidationError extends Error {
  /*
  Note that putting modifier `private` in `private errors:...` is equivalent to saying, inside the constructor, `this.errors: errors`, 
  defining at the same time, outside the constructor, `errors: ValidationError[]` (read: ValidationError array), in other words:
  taking the property errors, and assigning it as a property to the overall class. It's probably shorthand. 
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
