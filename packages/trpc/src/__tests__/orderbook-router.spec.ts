import { getOrderbookPools } from "@osmosis-labs/server";

import {
  createCallerFactory,
  createInnerTRPCContext,
  createTRPCRouter,
} from "..";
import { orderbookRouter } from "../orderbook-router";

jest.mock("@osmosis-labs/server", () => {
  const actual = jest.requireActual("@osmosis-labs/server");
  return {
    ...actual,
    getOrderbookPools: jest.fn(),
  };
});

const mockedGetOrderbookPools = jest.mocked(getOrderbookPools);

const BASE_DENOM = "uatom";
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

  it("returns orderbookExists: false and endpointFunctional: true when pools list is empty", async () => {
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
  });
});
