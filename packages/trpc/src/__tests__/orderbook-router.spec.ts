import { getOrderbookPools, queryTx } from "@osmosis-labs/server";

import {
  createCallerFactory,
  createInnerTRPCContext,
  createTRPCRouter,
} from "..";
import { orderbookRouter } from "../orderbook-router";

let mockIsTestnet = false;

jest.mock("@osmosis-labs/server", () => {
  const actual = jest.requireActual("@osmosis-labs/server");
  const mocked = {
    ...actual,
    getOrderbookPools: jest.fn(),
    queryTx: jest.fn(),
  };
  // Defined separately: a getter inside the spread literal compiles to
  // Object.assign, which reads it once instead of on every access.
  Object.defineProperty(mocked, "IS_TESTNET", { get: () => mockIsTestnet });
  return mocked;
});

const mockedGetOrderbookPools = jest.mocked(getOrderbookPools);
const mockedQueryTx = jest.mocked(queryTx);

// ATOM
const BASE_DENOM =
  "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2";
const QUOTE_DENOM =
  "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4";
const OTHER_DENOM = "uosmo";

const POOL = {
  baseDenom: BASE_DENOM,
  quoteDenom: QUOTE_DENOM,
  contractAddress: "osmo1abc",
  poolId: "1234",
};

function makeCaller() {
  const router = createTRPCRouter({ orderbooks: orderbookRouter });
  return createCallerFactory(router)(
    createInnerTRPCContext({ assetLists: [], chainList: [] })
  );
}

describe("orderbookRouter.verifyOrderbookCreation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns orderbookExists: false and endpointFunctional: false when getOrderbookPools throws", async () => {
    mockedGetOrderbookPools.mockRejectedValue(new Error("network error"));

    const caller = makeCaller();
    const result = await caller.orderbooks.verifyOrderbookCreation({
      baseDenom: BASE_DENOM,
      quoteDenom: QUOTE_DENOM,
    });

    expect(result).toEqual({
      orderbookExists: false,
      endpointFunctional: false,
    });
  });

  it("returns orderbookExists: false and endpointFunctional: true when endpoint succeeds but pair is absent", async () => {
    mockedGetOrderbookPools.mockResolvedValue([POOL]);

    const caller = makeCaller();
    const result = await caller.orderbooks.verifyOrderbookCreation({
      baseDenom: OTHER_DENOM,
      quoteDenom: QUOTE_DENOM,
    });

    expect(result).toEqual({
      orderbookExists: false,
      endpointFunctional: true,
    });
  });

  it("returns orderbookExists: true when base/quote match exactly", async () => {
    mockedGetOrderbookPools.mockResolvedValue([POOL]);

    const caller = makeCaller();
    const result = await caller.orderbooks.verifyOrderbookCreation({
      baseDenom: BASE_DENOM,
      quoteDenom: QUOTE_DENOM,
    });

    expect(result).toEqual({ orderbookExists: true, endpointFunctional: true });
  });

  it("returns orderbookExists: true when base and quote are reversed (symmetric match)", async () => {
    mockedGetOrderbookPools.mockResolvedValue([POOL]);

    const caller = makeCaller();
    const result = await caller.orderbooks.verifyOrderbookCreation({
      baseDenom: QUOTE_DENOM,
      quoteDenom: BASE_DENOM,
    });

    expect(result).toEqual({ orderbookExists: true, endpointFunctional: true });
  });

  it("treats an empty pools list as non-functional on mainnet", async () => {
    // SQS serves [] before ingest completes; reading that as "no orderbook
    // for any pair" would offer a paid duplicate creation everywhere.
    mockedGetOrderbookPools.mockResolvedValue([]);

    const caller = makeCaller();
    const result = await caller.orderbooks.verifyOrderbookCreation({
      baseDenom: BASE_DENOM,
      quoteDenom: QUOTE_DENOM,
    });

    expect(result).toEqual({
      orderbookExists: false,
      endpointFunctional: false,
    });
  });

  it("treats an empty pools list as functional on testnet", async () => {
    mockIsTestnet = true;
    try {
      mockedGetOrderbookPools.mockResolvedValue([]);

      const caller = makeCaller();
      const result = await caller.orderbooks.verifyOrderbookCreation({
        baseDenom: BASE_DENOM,
        quoteDenom: QUOTE_DENOM,
      });

      expect(result).toEqual({
        orderbookExists: false,
        endpointFunctional: true,
      });
    } finally {
      mockIsTestnet = false;
    }
  });
});

describe("orderbookRouter.getCreateOrderbookTxStatus", () => {
  const TX_HASH = "AB".repeat(32);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns delivered for a tx with code 0", async () => {
    mockedQueryTx.mockResolvedValue({
      tx_response: { code: 0 },
    } as Awaited<ReturnType<typeof queryTx>>);

    const caller = makeCaller();
    const result = await caller.orderbooks.getCreateOrderbookTxStatus({
      txHash: TX_HASH,
    });

    expect(result).toEqual({ status: "delivered" });
  });

  it("returns failed with code and raw log for a delivered tx with a non-zero code", async () => {
    mockedQueryTx.mockResolvedValue({
      tx_response: { code: 5, raw_log: "out of gas" },
    } as Awaited<ReturnType<typeof queryTx>>);

    const caller = makeCaller();
    const result = await caller.orderbooks.getCreateOrderbookTxStatus({
      txHash: TX_HASH,
    });

    expect(result).toEqual({ status: "failed", code: 5, rawLog: "out of gas" });
  });

  it("returns notFound only for an authoritative not-found response", async () => {
    mockedQueryTx.mockRejectedValue(
      new Error("rpc error: code = NotFound desc = tx not found")
    );

    const caller = makeCaller();
    const result = await caller.orderbooks.getCreateOrderbookTxStatus({
      txHash: TX_HASH,
    });

    expect(result).toEqual({ status: "notFound" });
  });

  it("returns unavailable for any other lookup failure", async () => {
    // An outage or timeout proves nothing about the tx; it must not read as
    // authoritative absence.
    mockedQueryTx.mockRejectedValue(new Error("connect ECONNREFUSED"));

    const caller = makeCaller();
    const result = await caller.orderbooks.getCreateOrderbookTxStatus({
      txHash: TX_HASH,
    });

    expect(result).toEqual({ status: "unavailable" });
  });

  it("returns unavailable for a malformed body instead of delivered", async () => {
    mockedQueryTx.mockResolvedValue({} as Awaited<ReturnType<typeof queryTx>>);

    const caller = makeCaller();
    const result = await caller.orderbooks.getCreateOrderbookTxStatus({
      txHash: TX_HASH,
    });

    expect(result).toEqual({ status: "unavailable" });
  });

  it("rejects a txHash that is not 64 hex characters", async () => {
    const caller = makeCaller();
    await expect(
      caller.orderbooks.getCreateOrderbookTxStatus({ txHash: "../evil" })
    ).rejects.toThrow();
    expect(mockedQueryTx).not.toHaveBeenCalled();
  });
});
