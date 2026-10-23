import { Int } from "@osmosis-labs/unit";
import { apiClient } from "@osmosis-labs/utils";

import { getSidecarRouter } from "../router";

jest.mock("@osmosis-labs/utils", () => ({
  ...jest.requireActual("@osmosis-labs/utils"),
  apiClient: jest.fn(),
}));

const mockApiClient = apiClient as jest.MockedFunction<typeof apiClient>;

/** An in-given-out response as SQS returns it: pools listed from the
 *  output side, amount_in a bare integer string. */
const inGivenOutResponse = {
  amount_out: { denom: "uusdc", amount: "10000000" },
  amount_in: "41234567",
  effective_fee: "0.001",
  price_impact: "-0.0042",
  in_base_out_quote_spot_price: "4.1",
  liquidity_cap: "29700",
  liquidity_cap_overflow: false,
  tokens: [],
  route: [
    {
      in_amount: "41234567",
      out_amount: "10000000",
      "has-cw-pool": false,
      pools: [
        {
          id: 1464,
          type: 2,
          balances: { denom: "", amount: "" },
          spread_factor: "0.0005",
          taker_fee: "0.001",
          token_in_denom: "uosmo",
        },
      ],
    },
  ],
};

describe("routeByTokenOut", () => {
  beforeEach(() => mockApiClient.mockReset());

  it("carries the route liquidity cap through, so exact-out quotes can pick a tier from it", async () => {
    mockApiClient.mockResolvedValueOnce(inGivenOutResponse);

    const quote = await getSidecarRouter().routeByTokenOut(
      { denom: "uusdc", amount: new Int("10000000") },
      "uosmo"
    );

    expect(quote.liquidityCap).toBe("29700");
    expect(quote.liquidityCapOverflow).toBe(false);
    // Adverse impact stays negative, as on exact-in.
    expect(quote.priceImpactTokenOut?.toString()).toBe("-0.004200000000000000");
    expect(quote.amount.toString()).toBe("41234567");
  });

  it("carries an overflowed cap through", async () => {
    mockApiClient.mockResolvedValueOnce({
      ...inGivenOutResponse,
      liquidity_cap: "0",
      liquidity_cap_overflow: true,
    });

    const quote = await getSidecarRouter().routeByTokenOut(
      { denom: "uusdc", amount: new Int("10000000") },
      "uosmo"
    );

    expect(quote.liquidityCapOverflow).toBe(true);
  });
});
