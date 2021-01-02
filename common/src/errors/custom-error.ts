export abstract class CustomError extends Error {
  // By saying "abstract", it means that any sub-class MUST implement this property
  abstract statusCode: number;

  /*
  Why do we require that the constructor of a subclass implementing `CustomError` must call `super` with a message argument that is
  a string? Just because usually, with the built in error handling, for a new error, we create a new Error instance
  like so `throw new Error("X went wrong")`, and we pass a string that explains the error. 
  Such string which will be printed out in server logs. This is useful, and we want to keep that behavior. (The user will not ever see this). 
  So, calling `super(message)` is essentially the same as saying `throw new Error("X went wrong")`. Calling `super` here is equivalent to calling 
  `new Error`, more or less. 
  I believe the constructor below relates to *this* abstract class - it does therefore not say "subclass, YOUR constructor must have a 
  a constructor that has a message parameter". It DOES say however that "subclass, when you call super(), you must pass a string". 
  */

  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, CustomError.prototype);
  }

  // Remember that we're not actually defining a method here - we're defining a method *signature*
  abstract serializeErrors(): {
    message: string;
    field?: string;
  }[];
}
