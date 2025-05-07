import { apiClient } from "@osmosis-labs/utils";
import bigInteger from "big-integer";
import cachified from "cachified";

import { BridgeProviderContext } from "../interface";

export const AgoricApiUrl = "https://main.api.agoric.net";
export const NobleToAgoricChannel = "channel-21";
export const NetworkConfigUrl = "https://main.agoric.net/network-config";
export const FastUsdcServiceUrl =
  "https://fastusdc-map.agoric-core.workers.dev/store";
export const NobleApiUrl = "https://noble-api.polkachu.com";

export interface FastUsdcFee {
  numerator: string;
  denominator: string;
  flatPortion: string;
}

export interface FastUsdcChainPolicy {
  chainId?: number;
  rateLimits?: {
    tx?: {
      digits?: string;
    };
  };
}

export interface FastUsdcChainPolicies {
  [chainName: string]: FastUsdcChainPolicy;
}

/** Fetches data from Agoric API endpoints related to Fast USDC. */
export class FastUsdcClient {
  constructor(protected readonly ctx: BridgeProviderContext) {}

  /**
   * Fetches the Fast USDC fee configuration.
   */
  async getFeeConfig(): Promise<FastUsdcFee> {
    return cachified({
      cache: this.ctx.cache,
      key: "FastUsdcFeeConfig",
      ttl:
        process.env.NODE_ENV === "test" ||
        process.env.NODE_ENV === "development"
          ? -1
          : 60 * 1000, // 60 seconds
      getFreshValue: async (): Promise<FastUsdcFee> => {
        try {
          const rawData = await apiClient<{ value: string }>(
            `${AgoricApiUrl}/agoric/vstorage/data/published.fastUsdc.feeConfig`
          );

          const nestedValue = JSON.parse(rawData.value);
          const latestValue = nestedValue?.values?.at(-1);
          if (!latestValue)
            throw new Error(
              "Could not find latest value in feeConfig response"
            );
          const parsedBody = JSON.parse(JSON.parse(latestValue).body.slice(1));

          const feeConfig = {
            numerator: parsedBody?.variableRate?.numerator?.value,
            denominator: parsedBody?.variableRate?.denominator?.value,
            flatPortion: parsedBody?.flat?.value,
          };

          if (
            typeof feeConfig.numerator !== "string" ||
            typeof feeConfig.denominator !== "string" ||
            typeof feeConfig.flatPortion !== "string"
          ) {
            throw new Error(
              "Invalid fee config structure parsed from Agoric API"
            );
          }

          return feeConfig;
        } catch (e) {
          console.error("Failed to fetch or parse Fast USDC fee config:", e);
          throw new Error("Failed to fetch or parse Fast USDC fee config");
        }
      },
    });
  }

  /**
   * Fetches the Fast USDC pool balance (available amount).
   */
  async getPoolBalance(): Promise<bigInteger.BigInteger> {
    return cachified({
      cache: this.ctx.cache,
      key: "FastUsdcPoolBalance",
      ttl:
        process.env.NODE_ENV === "test" ||
        process.env.NODE_ENV === "development"
          ? -1
          : 10 * 1000, // 10 seconds
      getFreshValue: async (): Promise<bigInteger.BigInteger> => {
        try {
          const rawData = await apiClient<{ value: string }>(
            `${AgoricApiUrl}/agoric/vstorage/data/published.fastUsdc.poolMetrics`
          );

          const nestedValue = JSON.parse(rawData.value);
          const latestValue = nestedValue?.values?.at(-1);
          if (!latestValue)
            throw new Error(
              "Could not find latest value in poolMetrics response"
            );
          const poolMetrics = JSON.parse(JSON.parse(latestValue).body.slice(1));

          const totalPoolBalanceStr = poolMetrics?.shareWorth?.numerator?.value;
          const encumberedBalanceStr = poolMetrics?.encumberedBalance?.value;

          const totalPoolBalance = bigInteger(totalPoolBalanceStr);
          const encumberedBalance = bigInteger(encumberedBalanceStr);
          const availableBalance = totalPoolBalance
            .minus(encumberedBalance)
            .minus(1);

          return availableBalance.isNegative()
            ? bigInteger(0)
            : availableBalance;
        } catch (e) {
          console.error("Failed to fetch or parse Fast USDC pool balance:", e);
          throw new Error("Failed to fetch or parse Fast USDC pool balance");
        }
      },
    });
  }

  /**
   * Fetches the chain policies for Fast USDC transfers.
   */
  async getChainPolicies(): Promise<FastUsdcChainPolicies> {
    return cachified({
      cache: this.ctx.cache,
      key: "FastUsdcChainPolicies",
      ttl:
        process.env.NODE_ENV === "test" ||
        process.env.NODE_ENV === "development"
          ? -1
          : 20 * 1000, // 20 seconds
      getFreshValue: async (): Promise<FastUsdcChainPolicies> => {
        try {
          const rawData = await apiClient<{ value: string }>(
            `${AgoricApiUrl}/agoric/vstorage/data/published.fastUsdc.feedPolicy`
          );

          const nestedValue = JSON.parse(rawData.value);
          const latestValue = nestedValue?.values?.at(-1);
          if (!latestValue)
            throw new Error(
              "Could not find latest value in feedPolicy response"
            );
          const parsedBody = JSON.parse(JSON.parse(latestValue).body);

          const chainPolicies = parsedBody?.chainPolicies;

          if (typeof chainPolicies !== "object" || chainPolicies === null) {
            throw new Error(
              "Invalid chain policies structure parsed from Agoric API"
            );
          }

          return chainPolicies as FastUsdcChainPolicies;
        } catch (e) {
          console.error(
            "Failed to fetch or parse Fast USDC chain policies:",
            e
          );
          throw new Error("Failed to fetch or parse Fast USDC chain policies");
        }
      },
    });
  }

  /**
   * Checks if Fast USDC is allowed in the network configuration.
   */
  async isAllowedInNetworkConfig(): Promise<boolean> {
    return cachified({
      cache: this.ctx.cache,
      key: "FastUsdcAllowedInNetworkConfig",
      ttl:
        process.env.NODE_ENV === "test" ||
        process.env.NODE_ENV === "development"
          ? -1
          : 10 * 1000, // 10 seconds
      getFreshValue: async (): Promise<boolean> => {
        try {
          const config = await apiClient<any>(NetworkConfigUrl);

          const fastUsdcAllowed = config?.fastUsdcAllowed;

          if (fastUsdcAllowed === undefined) {
            console.error(
              'Could not find key "fastUsdcAllowed" in network config, disabling feature.',
              NetworkConfigUrl,
              config
            );
            return false;
          }

          if (!fastUsdcAllowed) {
            console.warn(
              "Fast USDC is not allowed in network config, disabling feature.",
              NetworkConfigUrl,
              config
            );
          }

          return !!fastUsdcAllowed;
        } catch (e) {
          console.error(
            "Failed to fetch network config for Fast USDC allowance:",
            e
          );
          return false;
        }
      },
    });
  }

  /**
   * Gets the encoded agoric destination address for the given user destination address,
   * has a side effect of POSTing the address to the Fast USDC service when this function is called.
   */
  async getSkipRouteDestinationAddress(
    userDestinationAddress: string
  ): Promise<string> {
    return cachified({
      cache: this.ctx.cache,
      key: JSON.stringify({
        id: "FastUsdcSkipRouteDestinationAddress",
        address: userDestinationAddress,
      }),
      ttl:
        process.env.NODE_ENV === "test" ||
        process.env.NODE_ENV === "development"
          ? -1
          : Infinity,
      getFreshValue: async (): Promise<string> => {
        const { encodeAddressHook } = await import(
          "@agoric/cosmic-proto/address-hooks.js"
        );

        const vstorage = await fetch(
          `${AgoricApiUrl}/agoric/vstorage/data/published.fastUsdc`
        );
        const data = await vstorage.json();
        const settlementAccountAddress = JSON.parse(
          JSON.parse(data.value).values.at(-1)
        ).settlementAccount;
        const encodedAgoricAddress = encodeAddressHook(
          settlementAccountAddress,
          {
            EUD: userDestinationAddress,
          }
        );
        await fetch(FastUsdcServiceUrl, {
          method: "POST",
          headers: [["Content-Type", "application/json"]],
          body: JSON.stringify({
            channel: NobleToAgoricChannel,
            recipient: encodedAgoricAddress,
          }),
          mode: "no-cors",
        });
        return encodedAgoricAddress;
      },
    });
  }

  async getNobleForwardingAddress(agoricAddress: string): Promise<string> {
    return cachified({
      cache: this.ctx.cache,
      key: JSON.stringify({
        id: "FastUsdcNobleForwardingAddress",
        address: agoricAddress,
      }),
      ttl:
        process.env.NODE_ENV === "test" ||
        process.env.NODE_ENV === "development"
          ? -1
          : Infinity,
      getFreshValue: async (): Promise<string> => {
        const client = await apiClient<{ address: string; exists: boolean }>(
          NobleApiUrl +
            "/noble/forwarding/v1/address/" +
            NobleToAgoricChannel +
            "/" +
            agoricAddress +
            "/"
        );
        return client.address;
      },
    });
  }
}
