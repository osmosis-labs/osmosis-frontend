import type { Chain } from "@chain-registry/types";
import { OfflineDirectSigner, OfflineSigner } from "@cosmjs/proto-signing";
import { StdFee } from "@cosmjs/stargate";
import {
  ChainName,
  Endpoints,
  ExtendedHttpEndpoint,
  Logger,
} from "@cosmos-kit/core";

export interface TxFee extends StdFee {
  /**
   * If set to true, the fee will be used as it is and will not undergo any estimation process.
   */
  force?: boolean;
}

interface AccountMsgOpt {
  shareCoinDecimals?: number;
  /**
   * In cases where fee estimation isn't supported, gas can be included as a fallback option.
   * This proves particularly beneficial for accounts like CosmosAccount that depend on external chains.
   */
  gas?: number;
  messageComposer?: any;
}

export const createMsgOpts = <
  Dict extends Record<
    string,
    AccountMsgOpt | ((param: number) => AccountMsgOpt)
  >
>(
  dict: Dict
) => dict;

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

/**
 * Change decimal string to proto bytes. This is necessary to handle decimals
 * in the proto messages.
 
 * @param decStr string
 * @returns string
 */
export function changeDecStringToProtoBz(decStr: string): string {
  let r = decStr;
  while (r.length >= 2 && (r.startsWith(".") || r.startsWith("0"))) {
    r = r.slice(1);
  }

  return r;
}

export const CosmosKitAccountsLocalStorageKey = "cosmos-kit@1:core//accounts";
export const CosmosKitWalletLocalStorageKey =
  "cosmos-kit@1:core//current-wallet";
