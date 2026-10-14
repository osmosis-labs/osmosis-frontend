import { TxTracer } from "../tracer";

it("rejects tracing when the subscription fails without an unhandled rejection", async () => {
  const tracer = Object.create(TxTracer.prototype) as TxTracer;
  jest.spyOn(tracer, "queryTx").mockRejectedValue(new Error("not indexed yet"));
  jest
    .spyOn(tracer, "subscribeTx")
    .mockRejectedValue(new Error("all RPC endpoints failed"));
  await expect(tracer.traceTx(Uint8Array.from([1]))).rejects.toThrow(
    "all RPC endpoints failed"
  );
});

it("accepts an already indexed transaction while handling a failed subscription", async () => {
  const tracer = Object.create(TxTracer.prototype) as TxTracer;
  jest.spyOn(tracer, "queryTx").mockResolvedValue({ code: 0 });
  jest
    .spyOn(tracer, "subscribeTx")
    .mockRejectedValue(new Error("subscription failed"));
  await expect(tracer.traceTx(Uint8Array.from([1]))).resolves.toEqual({
    code: 0,
  });
});

class FakeSocket {
  readyState = 1;
  onopen = null;
  onmessage = null;
  onclose = null;
  onerror = null;
  send = jest.fn();
  close = jest.fn();
}
class TestTracer extends TxTracer {
  constructor() {
    super("http://localhost:26657", "/websocket", {
      wsObject: FakeSocket as unknown as typeof WebSocket,
    });
  }
  firstSubscriptionId() {
    return [...this.txSubscribes.keys()][0];
  }
  receive(message: unknown) {
    this.onMessage({ data: JSON.stringify(message) } as MessageEvent);
  }
}

it("rejects JSON-RPC subscription errors without waiting for a transaction event", async () => {
  const tracer = new TestTracer();
  const pending = tracer.subscribeTx(Uint8Array.from([1]));
  tracer.receive({
    id: tracer.firstSubscriptionId(),
    error: { message: "subscription unavailable" },
  });
  await expect(pending).rejects.toThrow("subscription unavailable");
  tracer.close();
});

it("preserves the inclusion height from live transaction subscriptions", async () => {
  const tracer = new TestTracer();
  const pending = tracer.subscribeTx(Uint8Array.from([1]));
  tracer.receive({
    id: tracer.firstSubscriptionId(),
    result: {
      data: {
        type: "tendermint/event/Tx",
        value: {
          TxResult: { height: "12", result: { code: 0, gas_used: "10" } },
        },
      },
    },
  });
  await expect(pending).resolves.toEqual({
    height: 12,
    code: 0,
    gas_used: "10",
  });
  tracer.close();
});
