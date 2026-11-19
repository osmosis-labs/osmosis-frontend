import { TRPCError } from "@trpc/server";

import { onTrpcError, redactUrls } from "../trpc-error-log";

describe("redactUrls", () => {
  it("keeps only the origin of each URL", () => {
    expect(
      redactUrls(
        "fetch https://rpc.example.com/v2/SECRET?key=abc failed, then http://x.io/a"
      )
    ).toBe("fetch https://rpc.example.com/… failed, then http://x.io/…");
  });
});

describe("redactUrls edge cases", () => {
  it("redacts URLs whatever their case", () => {
    expect(redactUrls("HTTPS://RPC.EXAMPLE.COM/v2/SECRET")).toBe(
      "https://rpc.example.com/…"
    );
  });

  it("redacts websocket URLs", () => {
    expect(redactUrls("wss://rpc.example.com/ws/SECRET closed")).toBe(
      "wss://rpc.example.com/… closed"
    );
  });

  it("bounds the message length", () => {
    expect(redactUrls("x".repeat(1000))).toHaveLength(301);
  });
});

describe("onTrpcError in production", () => {
  const env = process.env.NODE_ENV;
  let log: jest.SpyInstance;

  beforeEach(() => {
    (process.env as Record<string, string>).NODE_ENV = "production";
    log = jest.spyOn(console, "error").mockImplementation(() => undefined);
  });
  afterEach(() => {
    (process.env as Record<string, string | undefined>).NODE_ENV = env;
    log.mockRestore();
  });

  it("logs a server failure as one redacted JSON line", () => {
    onTrpcError({
      path: "assets.getAssetPrice",
      error: new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message:
          "upstream https://sqs.example.com/tokens/prices?base=x timed out",
      }),
    });

    expect(log).toHaveBeenCalledTimes(1);
    expect(JSON.parse(log.mock.calls[0][0])).toEqual({
      event: "trpc_error",
      path: "assets.getAssetPrice",
      code: "INTERNAL_SERVER_ERROR",
      message: "upstream https://sqs.example.com/… timed out",
      cause: null,
    });
  });

  it("skips expected outcomes such as a missing SQS price", () => {
    const cause = new Error("No SQS price result for uion and USDC");
    cause.name = "NoSqsPriceError";
    onTrpcError({
      path: "assets.getAssetPrice",
      error: new TRPCError({ code: "INTERNAL_SERVER_ERROR", cause }),
    });

    expect(log).not.toHaveBeenCalled();
  });

  it("skips errors caused by the request", () => {
    onTrpcError({
      path: "assets.getAssetPrice",
      error: new TRPCError({ code: "BAD_REQUEST", message: "invalid input" }),
    });

    expect(log).not.toHaveBeenCalled();
  });
});
