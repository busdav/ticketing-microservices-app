import nats, { Stan } from "node-nats-streaming";

class NatsWrapper {
  // If we don't put the '?' below, TS gives error: "Property '_client' has no initializer and is not definitely assigned in the constructor".
  // But, we're running our constructor with `new NatsWrapper()` during export, and during that time it's too early to assign _client. We only want to do it
  // once we initialize the nats client (i.e. the stan) in our index.ts file. So we put the `?` to tell TS that _client might be undefined for some periods of time.
  private _client?: Stan;

  connect(clusterId: string, clientId: string, url: string) {
    this._client = nats.connect(clusterId, clientId, { url });

    return new Promise<void>((resolve, reject) => {
      this._client!.on("connect", () => {
        console.log("Connected to NATS");
        resolve();
      });
      this._client!.on("error", (err) => {
        reject(err);
      });
    });
  }
}

// In order to replicate the OOTB behavior of e.g. mongoose (which nats does NOT have), we export an INSTANCE of the NatsWrapper class here, NOT the class itself.
// Why? So that within the whole application, we then share the same natsWrapper instance THAT IS ALREADY CONNECTED (just like mongoose does it OOTB).
export const natsWrapper = new NatsWrapper();
