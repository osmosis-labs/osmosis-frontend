import type { Chain } from "@chain-registry/types";
import type { AminoMsg } from "@cosmjs/amino/build/signdoc";
import type { StdFee } from "@cosmjs/stargate";
import {
  ChainName,
  Endpoints,
  ExtendedHttpEndpoint,
  Logger,
} from "@cosmos-kit/core";

import { StdSignDoc } from "./types";

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

// Creates the document to be signed from given parameters.
export async function makeSignDocAmino(
  msgs: readonly AminoMsg[],
  fee: StdFee,
  chainId: string,
  memo: string | undefined,
  accountNumber: number | string,
  sequence: number | string,
  timeout_height?: bigint
): Promise<StdSignDoc> {
  const { Uint53 } = await import("@cosmjs/math");
  return {
    chain_id: chainId,
    account_number: Uint53.fromString(accountNumber.toString()).toString(),
    sequence: Uint53.fromString(sequence.toString()).toString(),
    fee: fee,
    msgs: msgs,
    memo: memo || "",
    ...(timeout_height && { timeout_height: timeout_height.toString() }),
  };
}

export function getPublicKeyTypeUrl({
  chainId,
  chainFeatures,
}: {
  chainId: string;
  chainFeatures: string[];
}) {
  const chainIsInjective = chainId.startsWith("injective");
  const chainIsStratos = chainId.startsWith("stratos");
  const useEthereumSign = chainFeatures.includes("eth-key-sign");

  if (!useEthereumSign) {
    return "/cosmos.crypto.secp256k1.PubKey";
  }

  if (chainIsInjective) {
    return "/injective.crypto.v1beta1.ethsecp256k1.PubKey";
  }

  if (chainIsStratos) {
    return "/stratos.crypto.v1.ethsecp256k1.PubKey";
  }

  return "/ethermint.crypto.v1.ethsecp256k1.PubKey";
}

export const DefaultGasPriceStep: {
  low: number;
  average: number;
  high: number;
} = {
  low: 0.01,
  average: 0.025,
  high: 0.04,
};

export const CosmosKitAccountsLocalStorageKey = "cosmos-kit@2:core//accounts";
export const CosmosKitWalletLocalStorageKey =
  "cosmos-kit@2:core//current-wallet";

export class InsufficientFeeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InsufficientFeeError";
  }
}
export const OneClickTradingLocalStorageKey = "one-click-trading";
export const UseOneClickTradingLocalStorageKey = "use-one-click-enabled";
export const HasUsedOneClickTradingLocalStorageKey = "has-used-one-click";

// The number of heights from current before transaction times out.
// 75 heights * 2 second block time = 150 seconds before transaction
// timeout and mempool eviction.
const defaultTimeoutHeightOffset = 75;

export const NEXT_TX_TIMEOUT_HEIGHT_OFFSET: bigint = BigInt(
  process.env.TIMEOUT_HEIGHT_OFFSET
    ? process.env.TIMEOUT_HEIGHT_OFFSET
    : defaultTimeoutHeightOffset
);

export class AccountStoreNoBroadcastErrorEvent extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AccountStoreNoBroadcastErrorEvent";
  }
}
