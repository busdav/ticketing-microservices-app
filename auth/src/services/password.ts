/* 
Crypto and util are built in Node libraries. 
Scrypt is a hashing function. It's great - downside is that it is callback based. We want to use async await though, that's why we also get 
promisify, so we can turn the scrypt as a callback based function into a promise based ipmlemention, which is compatible with async await. 
*/
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

export class Password {
  /* 
  Static methods are methods that we can access without creating an instance of the class. That means that we can instantly do 
  `Password.toHash()`, whereas with a regular class method, we'd first need to create a new instance, so, 
  `(new Password()).toHash()`. 
  */
  static async toHash(password: string) {
    const salt = randomBytes(8).toString("hex");
    // When we use scrypt, we get back a buffer (is kind of like an array with raw data inside of it)
    // We use `as Buffer` at the end because TS otherwise doesn't know what `buf` is
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;

    return `${buf.toString("hex")}.${salt}`;
  }

  static async compare(storedPassword: string, suppliedPassword: string) {
    const [hashedPassword, salt] = storedPassword.split(".");
    const buf = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer;

    return buf.toString("hex") === hashedPassword;
  }
}
