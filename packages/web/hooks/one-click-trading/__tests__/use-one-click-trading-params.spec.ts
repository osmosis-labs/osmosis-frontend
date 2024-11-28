import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import { OneClickTradingInfo } from "@osmosis-labs/stores";
import {
  OneClickTradingHumanizedSessionPeriod,
  OneClickTradingTransactionParams,
} from "@osmosis-labs/types";
import { Dec, PricePretty } from "@osmosis-labs/unit";
import {
  OneClickTradingMaxGasLimit,
  unixSecondsToNanoSeconds,
} from "@osmosis-labs/utils";
import { act, renderHook } from "@testing-library/react";
import dayjs from "dayjs";

import {
  getParametersFromOneClickTradingInfo,
  useOneClickTradingParams,
} from "~/hooks/one-click-trading/use-one-click-trading-params";

// Default values from TRPC router
const DEFAULT_SPEND_LIMIT = 5_000;
const DEFAULT_SESSION_PERIOD: OneClickTradingHumanizedSessionPeriod = "1hour";
const DEFAULT_USDC_DECIMALS = 6;

const defaultOneClickTradingInfo: OneClickTradingInfo = {
  networkFeeLimit: "100000",
  humanizedSessionPeriod:
    "1hour" satisfies OneClickTradingHumanizedSessionPeriod,
  spendLimit: {
    amount: "1000000",
    decimals: DEFAULT_USDC_DECIMALS,
  },
  authenticatorId: "test-id",
  publicKey: "test-key",
  sessionKey: "test-session",
  userOsmoAddress: "test-address",
  sessionStartedAtUnix: Date.now(),
  allowedMessages: [],
  hasSeenExpiryToast: false,
  sessionPeriod: {
    end: unixSecondsToNanoSeconds(dayjs().add(1, "hour").unix()),
  },
};

const defaultApiResponse: Pick<
  OneClickTradingTransactionParams,
  "networkFeeLimit" | "spendLimit" | "sessionPeriod"
> & {
  spendLimitTokenDecimals: number;
} = {
  spendLimit: new PricePretty(
    DEFAULT_VS_CURRENCY,
    new Dec(DEFAULT_SPEND_LIMIT)
  ),
  spendLimitTokenDecimals: DEFAULT_USDC_DECIMALS,
  networkFeeLimit: OneClickTradingMaxGasLimit,
  sessionPeriod: {
    end: DEFAULT_SESSION_PERIOD,
  },
};

// msw-trpc did not deserialize the spendLimit prop, so we mock it here
jest.mock("~/utils/trpc", () => ({
  api: {
    local: {
      oneClickTrading: {
        getParameters: {
          useQuery: () => ({
            data: defaultApiResponse,
            isLoading: false,
            isError: false,
          }),
        },
      },
    },
  },
}));

describe("useOneClickTradingParams", () => {
  describe("initialization", () => {
    it("should initialize with default TRPC params when no oneClickTradingInfo provided", async () => {
      const { result } = renderHook(() => useOneClickTradingParams());

      expect(
        result.current.transaction1CTParams
      ).toEqual<OneClickTradingTransactionParams>({
        ...defaultApiResponse,
        isOneClickEnabled: false,
      });
      expect(
        result.current.initialTransaction1CTParams
      ).toEqual<OneClickTradingTransactionParams>({
        ...defaultApiResponse,
        isOneClickEnabled: false,
      });
      expect(result.current.changes).toHaveLength(0);
      expect(result.current.spendLimitTokenDecimals).toBe(
        DEFAULT_USDC_DECIMALS
      );
    });

    it("should initialize with provided oneClickTradingInfo", () => {
      const { result } = renderHook(() =>
        useOneClickTradingParams({
          oneClickTradingInfo: defaultOneClickTradingInfo,
          defaultIsOneClickEnabled: true,
        })
      );

      expect(
        result.current.transaction1CTParams
      ).toEqual<OneClickTradingTransactionParams>(
        getParametersFromOneClickTradingInfo({
          oneClickTradingInfo: defaultOneClickTradingInfo,
          defaultIsOneClickEnabled: true,
        })
      );

      expect(
        result.current.initialTransaction1CTParams
      ).toEqual<OneClickTradingTransactionParams>(
        getParametersFromOneClickTradingInfo({
          oneClickTradingInfo: defaultOneClickTradingInfo,
          defaultIsOneClickEnabled: true,
        })
      );
    });
  });

  describe("parameter changes", () => {
    it("should track spend limit changes", () => {
      const { result } = renderHook(() => useOneClickTradingParams());

      act(() => {
        result.current.setTransaction1CTParams({
          ...result.current.transaction1CTParams!,
          spendLimit: new PricePretty(DEFAULT_VS_CURRENCY, new Dec(1000)),
        });
      });

      expect(result.current.changes).toContain("spendLimit");
    });

    it("should track session period changes", () => {
      const { result } = renderHook(() => useOneClickTradingParams());

      act(() => {
        result.current.setTransaction1CTParams({
          ...result.current.transaction1CTParams!,
          sessionPeriod: { end: "12hours" },
        });
      });

      expect(result.current.changes).toContain("sessionPeriod");
    });

    it("should track isOneClickEnabled changes", () => {
      const { result } = renderHook(() => useOneClickTradingParams());

      act(() => {
        result.current.setTransaction1CTParams({
          ...result.current.transaction1CTParams!,
          isOneClickEnabled: true,
        });
      });

      expect(result.current.changes).toContain("isEnabled");
    });

    it("should not duplicate change types in changes array", () => {
      const { result } = renderHook(() => useOneClickTradingParams());

      act(() => {
        result.current.setTransaction1CTParams({
          ...result.current.transaction1CTParams!,
          spendLimit: new PricePretty(DEFAULT_VS_CURRENCY, new Dec(1000)),
        });
      });

      act(() => {
        result.current.setTransaction1CTParams({
          ...result.current.transaction1CTParams!,
          spendLimit: new PricePretty(DEFAULT_VS_CURRENCY, new Dec(2000)),
        });
      });

      expect(result.current.changes).toEqual(["spendLimit"]);
      expect(result.current.changes.length).toBe(1);
    });

    it("should reset to default API response values", () => {
      const { result } = renderHook(() => useOneClickTradingParams());

      act(() => {
        result.current.setTransaction1CTParams({
          ...result.current.transaction1CTParams!,
          networkFeeLimit: "200000",
          sessionPeriod: { end: "12hours" },
        });
      });

      expect(result.current.changes).toHaveLength(2);

      act(() => {
        result.current.reset();
      });

      expect(result.current.changes).toHaveLength(0);
      expect(
        result.current.transaction1CTParams
      ).toEqual<OneClickTradingTransactionParams>({
        ...defaultApiResponse,
        isOneClickEnabled: false,
      });
    });

    it("should reset to provided oneClickTradingInfo values", () => {
      const modifiedOneClickTradingInfo = {
        ...defaultOneClickTradingInfo,
        networkFeeLimit: "200000",
        humanizedSessionPeriod:
          "12hours" as OneClickTradingHumanizedSessionPeriod,
      };

      const { result } = renderHook(() =>
        useOneClickTradingParams({
          oneClickTradingInfo: modifiedOneClickTradingInfo,
          defaultIsOneClickEnabled: true,
        })
      );

      act(() => {
        result.current.setTransaction1CTParams({
          ...result.current.transaction1CTParams!,
          networkFeeLimit: "300000",
          sessionPeriod: { end: "3hours" },
        });
      });

      expect(result.current.changes).toHaveLength(2);

      act(() => {
        result.current.reset();
      });

      expect(result.current.changes).toHaveLength(0);
      expect(result.current.transaction1CTParams).toEqual(
        getParametersFromOneClickTradingInfo({
          oneClickTradingInfo: modifiedOneClickTradingInfo,
          defaultIsOneClickEnabled: true,
        })
      );
      expect(result.current.initialTransaction1CTParams).toEqual(
        getParametersFromOneClickTradingInfo({
          oneClickTradingInfo: modifiedOneClickTradingInfo,
          defaultIsOneClickEnabled: true,
        })
      );
    });
  });
});
