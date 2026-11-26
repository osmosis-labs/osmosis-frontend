import { findOrderbookByDenoms } from "~/hooks/limit-orders/use-orderbook";

jest.mock("~/config/generated/client-asset-lists", () => ({
  ClientAssetLists: [],
}));
jest.mock("~/hooks/use-feature-flags", () => ({ useFeatureFlags: jest.fn() }));
jest.mock("~/hooks/use-swap", () => ({ useSwapAsset: jest.fn() }));
jest.mock("~/hooks/use-wallet", () => ({ useWallet: jest.fn() }));
jest.mock("~/utils/trpc", () => ({ api: {} }));

// Two USDC assets share the symbol "USDC" but are different denoms.
const USDC_NOBLE =
  "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4";
const ALL_USDC =
  "factory/osmo147h5x9pcj7lm0cttlaefx6sqq5vdfnmwfcqxkmjd7exqm9gc7grqhr75m0/alloyed/allUSDC";
const ATOM =
  "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2";

const orderbooks = [
  { poolId: "1931", baseDenom: ATOM, quoteDenom: USDC_NOBLE },
  { poolId: "3526", baseDenom: ATOM, quoteDenom: ALL_USDC },
];

describe("findOrderbookByDenoms", () => {
  it("finds the book for the exact base and quote denoms", () => {
    expect(findOrderbookByDenoms(orderbooks, ATOM, ALL_USDC)?.poolId).toBe(
      "3526"
    );
    expect(findOrderbookByDenoms(orderbooks, ATOM, USDC_NOBLE)?.poolId).toBe(
      "1931"
    );
  });

  it("never matches by symbol, even when two assets share one", () => {
    expect(findOrderbookByDenoms(orderbooks, "ATOM", "USDC")).toBeUndefined();
    expect(findOrderbookByDenoms(orderbooks, ATOM, "USDC")).toBeUndefined();
  });

  it("does not match the reverse orientation or a missing denom", () => {
    expect(findOrderbookByDenoms(orderbooks, ALL_USDC, ATOM)).toBeUndefined();
    expect(findOrderbookByDenoms(orderbooks, ATOM, undefined)).toBeUndefined();
  });
});
