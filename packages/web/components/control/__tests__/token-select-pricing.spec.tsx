import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import { CoinPretty, Dec, PricePretty } from "@osmosis-labs/unit";
import { render, renderHook, screen } from "@testing-library/react";

import { useBatchedPrices } from "~/hooks/queries/assets/use-prices";

import { TokenSelect } from "../token-select";

const mockPriceRequest = jest.fn();
jest.mock("~/utils/trpc", () => ({
  api: {
    useQueries: (
      build: (t: unknown) => unknown[],
      { combine }: { combine: (results: unknown[]) => unknown }
    ) => {
      build({ edge: { assets: { getAssetPrices: mockPriceRequest } } });
      return combine([
        {
          data: {
            a: new PricePretty(DEFAULT_VS_CURRENCY, new Dec(2)),
            b: new PricePretty(DEFAULT_VS_CURRENCY, new Dec(3)),
          },
          isLoading: false,
        },
      ]);
    },
  },
}));
jest.mock("~/components/assets", () => ({ Icon: () => null }));
jest.mock("~/components/ui/entity-image", () => ({ EntityImage: () => null }));
jest.mock("~/components/input", () => ({ SearchBox: () => null }));
jest.mock("~/components/privacy", () => ({
  PrivateText: ({ text }: { text: string }) => <span>{text}</span>,
}));
jest.mock("~/config/chain", () => ({
  getChainInfoFromCurrency: () => undefined,
}));
jest.mock("~/hooks", () => ({
  useWindowSize: () => ({ isMobile: false }),
  useBooleanWithWindowEvent: () => [false, jest.fn()],
  useFilteredData: (data: unknown[]) => ["", jest.fn(), data],
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock("~/modals", () => ({
  TokenSelectModal: jest.requireActual("../../../modals/token-select")
    .TokenSelectModal,
}));
jest.mock("~/modals/base", () => ({
  ModalBase: ({
    isOpen,
    children,
  }: {
    isOpen: boolean;
    children: React.ReactNode;
  }) => (isOpen ? <div>{children}</div> : null),
}));
jest.mock("~/utils/logo-uri", () => ({ getLogoURIs: () => [] }));
jest.mock("~/hooks/queries/assets/use-coin-fiat-value", () => ({
  useCoinFiatValue: () => {
    throw new Error("Rows must not request individual SQS prices");
  },
}));

const tokens = ["a", "b"].map(
  (denom) =>
    new CoinPretty(
      {
        coinMinimalDenom: denom,
        coinDenom: denom.toUpperCase(),
        coinDecimals: 6,
      },
      "2000000"
    )
);

describe("token list pricing", () => {
  beforeEach(() => mockPriceRequest.mockClear());

  it("does not enable price requests while closed and uses market snapshots when opened", () => {
    const props = {
      tokens,
      selectedTokenDenom: "A",
      sortByBalances: true,
      onSelect: jest.fn(),
    };
    const { rerender } = render(
      <TokenSelect {...props} dropdownOpen={false} />
    );
    expect(
      mockPriceRequest.mock.calls.every(
        ([, options]) => options.enabled === false
      )
    ).toBe(true);
    mockPriceRequest.mockClear();
    rerender(<TokenSelect {...props} dropdownOpen />);
    expect(
      mockPriceRequest.mock.calls.every(
        ([input, options]) => input.source === "market" && options.enabled
      )
    ).toBe(true);
    expect(screen.getByText("$6")).toBeInTheDocument();
  });

  it("chunks market requests without SQS and retains the default source for other callers", () => {
    renderHook(() =>
      useBatchedPrices(
        Array.from({ length: 800 }, (_, i) => `asset-${i}`),
        { source: "market" }
      )
    );
    expect(mockPriceRequest).toHaveBeenCalledTimes(8);
    expect(
      mockPriceRequest.mock.calls.every(
        ([input]) =>
          input.source === "market" && input.coinMinimalDenoms.length === 100
      )
    ).toBe(true);
    mockPriceRequest.mockClear();
    renderHook(() => useBatchedPrices(["a", "a", "gamm/pool/1"]));
    expect(mockPriceRequest).toHaveBeenCalledWith(
      { coinMinimalDenoms: ["a"], source: "sidecar" },
      expect.anything()
    );
  });
});
