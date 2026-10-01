import "@testing-library/jest-dom";

import { fireEvent, render, screen } from "@testing-library/react";

import { OrderTypeSelector } from "~/components/swap-tool/order-type-selector";

const HASH =
  "ibc/CE5BFF1D9BADA03BB5CCA5F56939392A761B53A10FBD03B37506669C3218D3B2";
const ATOM =
  "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2";
const USDC_NOBLE =
  "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4";
const ALL_USDC =
  "factory/osmo147h5x9pcj7lm0cttlaefx6sqq5vdfnmwfcqxkmjd7exqm9gc7grqhr75m0/alloyed/allUSDC";

const mockQueryState: Record<string, string> = {};
const mockSetters: Record<string, jest.Mock> = {};
const mockOpenCreation = jest.fn();
let mockVerification:
  | { orderbookExists: boolean; endpointFunctional: boolean }
  | undefined;

jest.mock("nuqs", () => {
  const parser = (defaultValue: unknown) => ({
    defaultValue,
    withOptions() {
      return this;
    },
  });
  return {
    parseAsString: { withDefault: parser },
    parseAsStringLiteral: () => ({ withDefault: parser }),
    useQueryState: (
      key: string,
      { defaultValue }: { defaultValue: unknown }
    ) => {
      mockSetters[key] ??= jest.fn();
      return [mockQueryState[key] ?? defaultValue, mockSetters[key]];
    },
  };
});

jest.mock("~/hooks/limit-orders/use-orderbook", () => ({
  useOrderbookSelectableDenoms: () => ({
    // Only HASH has an orderbook, and only against USDC.noble; ATOM has none.
    selectableBaseAssets: [{ coinMinimalDenom: HASH }],
    selectableQuoteDenoms: { [HASH]: [{ coinMinimalDenom: USDC_NOBLE }] },
    isLoading: false,
  }),
}));

jest.mock("~/hooks", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock("~/hooks/limit-orders/use-create-orderbook", () => ({
  wasOrderbookJustCreated: () => false,
  clearJustCreatedOrderbook: jest.fn(),
}));

jest.mock("~/hooks/limit-orders/use-orderbook-creation-flow", () => ({
  useOrderbookCreationFlow: () => ({
    isOpen: false,
    open: mockOpenCreation,
    close: jest.fn(),
    modalProps: {},
  }),
}));

jest.mock("~/hooks/limit-orders/use-orderbook-ratio-guard", () => ({
  useOrderbookRatioGuard: () => ({ isBlocked: false }),
}));

jest.mock("~/modals/create-orderbook", () => ({
  CreateOrderbookModal: () => null,
}));

jest.mock("~/utils/trpc", () => ({
  api: {
    edge: {
      assets: {
        getUserAsset: {
          useQuery: () => ({ data: { coinDenom: "HASH", coinDecimals: 9 } }),
        },
      },
      orderbooks: {
        verifyOrderbookCreation: {
          useQuery: () => ({
            data: mockVerification,
            isLoading: false,
            fetchStatus: "idle",
          }),
        },
      },
    },
  },
}));

jest.mock("~/components/tooltip/generic-disclaimer", () => ({
  GenericDisclaimer: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

describe("OrderTypeSelector", () => {
  beforeEach(() => {
    for (const key of Object.keys(mockQueryState)) delete mockQueryState[key];
    for (const key of Object.keys(mockSetters)) delete mockSetters[key];
    mockOpenCreation.mockReset();
    mockVerification = undefined;
    mockQueryState.type = "market";
    mockQueryState.from = HASH;
  });

  it("switches to an orderbook quote in the same click as selecting Limit", () => {
    mockQueryState.quote = ALL_USDC;
    render(<OrderTypeSelector initialBaseDenom={HASH} />);

    fireEvent.click(screen.getByText("limitOrders.limit"));

    expect(mockSetters.quote).toHaveBeenCalledWith(USDC_NOBLE);
    expect(mockSetters.type).toHaveBeenCalledWith("limit");
    // The quote must be set before the type so the tool never renders a
    // limit order with a quote the base's orderbooks don't support.
    expect(mockSetters.quote.mock.invocationCallOrder[0]).toBeLessThan(
      mockSetters.type.mock.invocationCallOrder[0]
    );
  });

  it("keeps a quote the base's orderbooks already support", () => {
    mockQueryState.quote = USDC_NOBLE;
    render(<OrderTypeSelector initialBaseDenom={HASH} />);

    fireEvent.click(screen.getByText("limitOrders.limit"));

    expect(mockSetters.quote).not.toHaveBeenCalled();
    expect(mockSetters.type).toHaveBeenCalledWith("limit");
  });

  it("keeps a supported quote given in symbol form (?quote=USDC.noble)", () => {
    // The URL may carry a symbol: it must resolve to the supported minimal
    // denom rather than look unsupported and be replaced.
    mockQueryState.quote = "USDC.noble";
    render(<OrderTypeSelector initialBaseDenom={HASH} />);

    fireEvent.click(screen.getByText("limitOrders.limit"));

    expect(mockSetters.quote).not.toHaveBeenCalled();
    expect(mockSetters.type).toHaveBeenCalledWith("limit");
  });

  it("leaves the quote alone when selecting Market", () => {
    mockQueryState.type = "limit";
    mockQueryState.quote = USDC_NOBLE;
    render(<OrderTypeSelector initialBaseDenom={HASH} />);

    fireEvent.click(screen.getByText("limitOrders.market"));

    expect(mockSetters.quote).not.toHaveBeenCalled();
    expect(mockSetters.type).toHaveBeenCalledWith("market");
  });

  it("opens the creation modal instead of selecting Limit for a pair without an orderbook", () => {
    mockQueryState.from = ATOM;
    mockQueryState.quote = USDC_NOBLE;
    mockVerification = { orderbookExists: false, endpointFunctional: true };
    render(<OrderTypeSelector initialBaseDenom={ATOM} />);

    fireEvent.click(screen.getByText("limitOrders.limit"));

    expect(mockOpenCreation).toHaveBeenCalledTimes(1);
    expect(mockSetters.type).not.toHaveBeenCalled();
  });

  it("does not offer creation when the verification endpoint is not functional", () => {
    mockQueryState.from = ATOM;
    mockQueryState.quote = USDC_NOBLE;
    mockVerification = { orderbookExists: false, endpointFunctional: false };
    render(<OrderTypeSelector initialBaseDenom={ATOM} />);

    fireEvent.click(screen.getByText("limitOrders.limit"));

    expect(mockOpenCreation).not.toHaveBeenCalled();
  });
});
