// How did we know that this fake natsWrapper (used for Jest) needs to export an object? Well if we check in the actual nats-wrapper.ts file,
// that exports a `const natsWrapper = new NatsWrapper();`, so an instance of a class, or essentially, an object.

export const natsWrapper = {};
