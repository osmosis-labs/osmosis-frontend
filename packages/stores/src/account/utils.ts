import type { Chain } from "@chain-registry/types";
import { OfflineDirectSigner, OfflineSigner } from "@cosmjs/proto-signing";
import {
  ChainName,
  Endpoints,
  ExtendedHttpEndpoint,
  Logger,
} from "@cosmos-kit/core";

interface AccountMsgOpt {
  shareCoinDecimals?: number;
  gas: number;
}

export const createMsgOpts = <Dict extends Record<string, AccountMsgOpt>>(
  dict: Dict
) => dict;

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const logger = new Logger("WARN");

export function getWalletEndpoints(chains: Chain[]) {
  return chains.reduce((endpoints, chain) => {
    const newEndpoints: Record<ChainName, Endpoints> = {
      ...endpoints,
      [chain.chain_name]: {
        rpc: chain.apis?.rpc?.map(({ address }) => address) ?? [],
        rest: chain.apis?.rest?.map(({ address }) => address) ?? [],
      },
    };
    return newEndpoints;
  }, {} as Record<ChainName, Endpoints>);
}

export function removeLastSlash(str: string) {
  return str.endsWith("/") ? str.slice(0, -1) : str;
}

export function getEndpointString(endpoint: string | ExtendedHttpEndpoint) {
  return typeof endpoint === "string" ? endpoint : endpoint.url;
}

export function isWalletOfflineDirectSigner(
  signer: OfflineSigner,
  walletName: string
): signer is OfflineDirectSigner &
  Record<
    string,
    {
      signDirect: (
        chainId: string,
        ...params: Parameters<OfflineDirectSigner["signDirect"]>
      ) => ReturnType<OfflineDirectSigner["signDirect"]>;
    }
  > {
  return (signer as Record<string, any>)[walletName]?.signDirect;
}

export function getWalletWindowName(walletName: string) {
  return walletName.split("-")[0];
}

export const CosmosKitAccountsLocalStorageKey = "cosmos-kit@1:core//accounts";
export const CosmosKitWalletLocalStorageKey =
  "cosmos-kit@1:core//current-wallet";
