// How did we know that this fake natsWrapper (used for Jest) needs to export an object? Well if we check in the actual nats-wrapper.ts file,
// that exports a `const natsWrapper = new NatsWrapper();`, so an instance of a class, or essentially, an object.
// We then looked at what the natsWrapper has, and what of it the TicketCreatedPublisher actually uses (so that the test can pass).
// We realized that it only uses the `client` property, and that `client` actually gets used in the BasePublisher, where essentially
// the `publish` method is being called upon, and that method is used inside a promise which expects to call a callback function to
// be resolved, so in the fake implementation below, we call that callback function as soon as we can. Tests should now pass.

export const natsWrapper = {
  client: {
    publish: (subject: string, data: string, callback: () => void) => {
      callback();
    },
  },
};
