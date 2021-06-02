/* 
So that users of our common module can put a simple import statement such as `import { BadRequestError } from "@db-udemy-microservices-ticketing/common"`, 
rather than having to know all the directories INSIDE the module, we import everything of the common module into its index.ts file, 
and then export the whole thing. We do this with the `export` statements below, which first import everything, and then immediately 
export it. 
We also must remember to install all dependencies we had in the `auth` microservice before we moved the common code over here, from there. 
Test change. 
*/
export * from "./errors/bad-request-error";
export * from "./errors/custom-error";
export * from "./errors/database-connection-error";
export * from "./errors/not-authorized-error";
export * from "./errors/not-found-error";
export * from "./errors/request-validation-error";

export * from "./middlewares/current-user";
export * from "./middlewares/error-handler";
export * from "./middlewares/require-auth";
export * from "./middlewares/validate-request";

export * from "./events/base-listener";
export * from "./events/base-publisher";
export * from "./events/subjects";
export * from "./events/ticket-created-event";
export * from "./events/ticket-updated-event";
