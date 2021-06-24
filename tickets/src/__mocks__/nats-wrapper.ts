// How did we know that this fake natsWrapper (used for Jest) needs to export an object? Well if we check in the actual nats-wrapper.ts file,
// that exports a `const natsWrapper = new NatsWrapper();`, so an instance of a class, or essentially, an object.
// We then looked at what the natsWrapper has, and what of it the TicketCreatedPublisher actually uses (so that the test can pass).
// We realized that it only uses the `client` property, and that `client` actually gets used in the BasePublisher, where essentially
// the `publish` method is being called upon, and that method is used inside a promise which expects to call a callback function to
// be resolved, so in the fake implementation below, we call that callback function as soon as we can. Tests should now pass.

export const natsWrapper = {
  client: {
    // MOCK function: (can be called from anywhere, internally keeps track of whether it has been called, what arguments it has been provided, etc.)
    // i.e. we can put the following in a test: `  expect(natsWrapper.client.publish).toHaveBeenCalled();`
    // Difference to fake function: with mock, you can actually create expectations arount it etc. - it gets executed, as opposed to fake function.
    // Before this, we had a FAKE function only, i.e. purely `(subject: string, data: string, callback: () => void) => {callback()` assigned to the `publish` property.
    // `mockImplementation()` is the actual function that will be invoked when someone tries to run publish.
    // It's important to reset this mock function before each test (see `jest.clearAllMocks()` in the setup file), because this function is going to be used by all tests,
    // and we don't want the `haveBeenCalled` from the prior test to pollute the current test.
    publish: jest
      .fn()
      .mockImplementation(
        (subject: string, data: string, callback: () => void) => {
          callback();
        }
      ),
  },
};
