import { TxTracer, TxTraceTimeoutError } from "../tracer";

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
  reopen() {
    this.onOpen({} as Event);
  }
}

it("accepts an already indexed transaction while handling a failed subscription", async () => {
  const tracer = new TestTracer();
  jest.spyOn(tracer, "queryTx").mockResolvedValue({ code: 0 });
  jest
    .spyOn(tracer, "subscribeTx")
    .mockRejectedValue(new Error("subscription failed"));
  await expect(tracer.traceTx(Uint8Array.from([1]))).resolves.toEqual({
    code: 0,
  });
});

it("waits for an indexed transaction when the subscription fails first", async () => {
  const tracer = new TestTracer();
  let resolveQuery!: (result: unknown) => void;
  jest.spyOn(tracer, "queryTx").mockImplementation(
    () =>
      new Promise((resolve) => {
        resolveQuery = resolve;
      })
  );
  jest
    .spyOn(tracer, "subscribeTx")
    .mockRejectedValue(new Error("subscription failed"));
  const result = { code: 0, height: 123 };
  const pending = expect(tracer.traceTx(Uint8Array.from([1]))).resolves.toEqual(
    result
  );
  await Promise.resolve();
  resolveQuery(result);
  await pending;
});

it("accepts a live transaction without waiting for the query", async () => {
  const tracer = new TestTracer();
  let rejectQuery!: (error: Error) => void;
  jest.spyOn(tracer, "queryTx").mockImplementation(
    () =>
      new Promise((_resolve, reject) => {
        rejectQuery = reject;
      })
  );
  jest.spyOn(tracer, "subscribeTx").mockResolvedValue({ code: 0, height: 123 });
  await expect(tracer.traceTx(Uint8Array.from([1]))).resolves.toEqual({
    code: 0,
    height: 123,
  });
  rejectQuery(new Error("query failed after live success"));
});

describe("when the subscription fails", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("keeps looking the tx up until it is indexed", async () => {
    const tracer = new TestTracer();
    const result = { code: 0, height: 123 };
    const queryTx = jest
      .spyOn(tracer, "queryTx")
      .mockRejectedValueOnce(new Error("tx not found"))
      .mockResolvedValueOnce(result);
    jest
      .spyOn(tracer, "subscribeTx")
      .mockRejectedValue(new Error("subscription failed"));
    const pending = tracer.traceTx(Uint8Array.from([1]));
    await jest.advanceTimersByTimeAsync(3000);
    await expect(pending).resolves.toEqual(result);
    expect(queryTx).toHaveBeenCalledTimes(2);
  });

  it("rejects with a timeout error when the tx is not found in time", async () => {
    const tracer = new TestTracer();
    jest.spyOn(tracer, "queryTx").mockRejectedValue(new Error("tx not found"));
    jest
      .spyOn(tracer, "subscribeTx")
      .mockRejectedValue(new Error("subscription failed"));
    const pending = tracer.traceTx(Uint8Array.from([1]), { timeoutMs: 10000 });
    const assertion =
      expect(pending).rejects.toBeInstanceOf(TxTraceTimeoutError);
    await jest.advanceTimersByTimeAsync(10000);
    await assertion;
  });

  it("rejects once every endpoint has failed", async () => {
    const tracer = new TestTracer();
    const error = new Error("all RPC endpoints failed");
    jest.spyOn(tracer, "queryTx").mockRejectedValue(error);
    jest.spyOn(tracer, "subscribeTx").mockImplementation(() => {
      Object.assign(tracer, { giveUpError: error });
      return Promise.reject(error);
    });
    await expect(tracer.traceTx(Uint8Array.from([1]))).rejects.toBe(error);
  });
});

it("times out while waiting on a live subscription", async () => {
  jest.useFakeTimers();
  try {
    const tracer = new TestTracer();
    jest.spyOn(tracer, "queryTx").mockRejectedValue(new Error("tx not found"));
    jest
      .spyOn(tracer, "subscribeTx")
      .mockImplementation(() => new Promise(() => {}));
    const pending = tracer.traceTx(Uint8Array.from([1]), { timeoutMs: 10000 });
    const assertion =
      expect(pending).rejects.toBeInstanceOf(TxTraceTimeoutError);
    await jest.advanceTimersByTimeAsync(10000);
    await assertion;
  } finally {
    jest.useRealTimers();
  }
});

it("looks the tx up again after a reconnect", async () => {
  const tracer = new TestTracer();
  const result = { code: 0, height: 123 };
  const queryTx = jest
    .spyOn(tracer, "queryTx")
    .mockRejectedValueOnce(new Error("tx not found"))
    .mockResolvedValueOnce(result);
  // The tx lands while disconnected, so the live subscription never fires.
  jest
    .spyOn(tracer, "subscribeTx")
    .mockImplementation(() => new Promise(() => {}));
  const pending = tracer.traceTx(Uint8Array.from([1]));
  tracer.reopen();
  await expect(pending).resolves.toEqual(result);
  expect(queryTx).toHaveBeenCalledTimes(2);
  tracer.close();
});

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

it("rejects new lookups and subscriptions once every endpoint has failed", async () => {
  const tracer = new TestTracer();
  const error = new Error("all RPC endpoints failed");
  Object.assign(tracer, { giveUpError: error });
  await expect(tracer.queryTx(Uint8Array.from([1]))).rejects.toBe(error);
  await expect(tracer.subscribeTx(Uint8Array.from([1]))).rejects.toBe(error);
  tracer.close();
});
