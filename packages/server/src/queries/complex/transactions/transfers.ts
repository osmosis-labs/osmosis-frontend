import { AssetList, Chain } from "@osmosis-labs/types";
import { EthereumChainInfo } from "@osmosis-labs/utils";

import { Message, Transaction } from "../../../queries/data-services";
import { getAsset } from "../assets";

/** Message types whose txs can be a bridge/IBC transfer into or out of Osmosis. */
export const TRANSFER_MESSAGE_TYPES = [
  "/ibc.applications.transfer.v1.MsgTransfer",
  "/ibc.core.channel.v1.MsgRecvPacket",
  "/cosmwasm.wasm.v1.MsgExecuteContract",
];

const MSG_TRANSFER = "/ibc.applications.transfer.v1.MsgTransfer";
const MSG_RECV_PACKET = "/ibc.core.channel.v1.MsgRecvPacket";
const MSG_EXECUTE_CONTRACT = "/cosmwasm.wasm.v1.MsgExecuteContract";

/**
 * Axelar chain names (as used in GMP memos' `destination_chain`) to EVM chain ids.
 * Names are matched case-insensitively.
 */
const AXELAR_EVM_CHAIN_IDS: Record<string, number> = {
  ethereum: 1,
  binance: 56,
  polygon: 137,
  avalanche: 43114,
  fantom: 250,
  moonbeam: 1284,
  arbitrum: 42161,
  optimism: 10,
  base: 8453,
  blast: 81457,
  linea: 59144,
  mantle: 5000,
  scroll: 534352,
  celo: 42220,
  kava: 2222,
  filecoin: 314,
  fraxtal: 252,
  immutable: 13371,
};

type TransferAsset = {
  /** Symbol, e.g. `USDC`. */
  denom: string;
  /** Minimal denom on Osmosis, e.g. `ibc/...`. */
  address: string;
  decimals: number;
  coinGeckoId?: string;
  imageUrl?: string;
};

type TransferChain =
  | {
      chainType: "cosmos";
      chainId: string;
      chainName?: string;
      prettyName: string;
    }
  | {
      chainType: "evm";
      chainId: number;
      chainName?: string;
      prettyName: string;
    };

/**
 * A bridge/IBC transfer derived from the historical data index, shaped like
 * the bridge package's `TxSnapshot` (which the server can't import) so the
 * client can feed it straight into transfer history.
 */
export interface FormattedTransfer {
  type: "bridge-transfer";
  direction: "deposit" | "withdraw";
  /**
   * Provider shown in the UI. Status of index-derived withdrawals is
   * resolved through Skip (`statusProvider`), which can trace any
   * IBC/Axelar route by its Osmosis tx hash.
   */
  provider: "IBC" | "Skip" | "Squid";
  statusProvider?: "Skip";
  createdAtUnix: number;
  estimatedArrivalUnix: number;
  /** Osmosis tx hash. */
  sendTxHash: string;
  /** Deposits are final once they arrive; withdrawals still need resolving. */
  status: "success" | "pending" | "failed";
  fromAddress: string;
  toAddress: string;
  osmoBech32Address: string;
  fromChain: TransferChain;
  toChain: TransferChain;
  fromAsset: TransferAsset & { amount: string };
  toAsset: TransferAsset & { amount?: string };
  networkFee?: TransferAsset & { amount: string };
}

type ParsedRoute = {
  provider: FormattedTransfer["provider"];
  direction: FormattedTransfer["direction"];
  fromDenom: string;
  fromAmount: string;
  toDenom: string;
  toAmount?: string;
  fromAddress: string;
  toAddress: string;
  /** Counterparty chain: destination for withdrawals, source for deposits. */
  counterparty: TransferChain | undefined;
};

/**
 * Parse the index's txs into transfers. Txs that aren't a recognisable
 * transfer for `address` (e.g. unrelated contract calls) are dropped, as are
 * transfers whose asset or counterparty chain can't be resolved.
 */
export function mapTransfers({
  transactions,
  address,
  assetLists,
  chainList,
}: {
  transactions: Transaction[];
  address: string;
  assetLists: AssetList[];
  chainList: Chain[];
}): FormattedTransfer[] {
  const transfers: FormattedTransfer[] = [];

  for (const tx of transactions) {
    try {
      const route = parseRoute(tx, address, chainList);
      if (!route?.counterparty) continue;

      const osmosisChain = chainList.find((c) => c.chain_id === tx.chainId);
      if (!osmosisChain) continue;
      const osmosis = toCosmosChain(osmosisChain);

      const fromAsset = toTransferAsset(assetLists, route.fromDenom);
      const toAsset = toTransferAsset(assetLists, route.toDenom);
      if (!fromAsset || !toAsset) continue;

      const fee = tx.fee?.[0];
      const networkFee = fee
        ? toTransferAsset(assetLists, fee.denom)
        : undefined;

      const createdAtUnix = Math.floor(
        new Date(tx.blockTimestamp).getTime() / 1000
      );
      const isWithdraw = route.direction === "withdraw";

      transfers.push({
        type: "bridge-transfer",
        direction: route.direction,
        provider: route.provider,
        statusProvider: isWithdraw ? "Skip" : undefined,
        createdAtUnix,
        estimatedArrivalUnix: createdAtUnix,
        sendTxHash: tx.hash,
        status: tx.code !== 0 ? "failed" : isWithdraw ? "pending" : "success",
        fromAddress: route.fromAddress,
        toAddress: route.toAddress,
        osmoBech32Address: address,
        fromChain: isWithdraw ? osmosis : route.counterparty,
        toChain: isWithdraw ? route.counterparty : osmosis,
        fromAsset: { ...fromAsset, amount: route.fromAmount },
        toAsset: { ...toAsset, amount: route.toAmount },
        networkFee:
          networkFee && fee ? { ...networkFee, amount: fee.amount } : undefined,
      });
    } catch (e) {
      // a malformed or unexpected tx shape must not break the whole page
      continue;
    }
  }

  return transfers;
}

function parseRoute(
  tx: Transaction,
  address: string,
  chainList: Chain[]
): ParsedRoute | undefined {
  const ibcMetadata = tx.metadata
    ?.find((m) => m.type === "osmosis-ui")
    ?.value?.find(
      (v) => v.txType === "ibc_send" || v.txType === "ibc_received"
    );

  for (const message of tx.messages ?? []) {
    switch (message["@type"]) {
      case MSG_EXECUTE_CONTRACT: {
        if (message.sender !== address) continue;
        const route =
          parseSkipContract(message, chainList) ??
          parseSquidMulticall(message, chainList);
        if (route) return route;
        continue;
      }
      case MSG_TRANSFER: {
        if (message.sender !== address) continue;
        return parseMsgTransfer(
          message,
          chainList,
          ibcMetadata?.txType === "ibc_send"
            ? ibcMetadata.txInfo.chain_to
            : undefined
        );
      }
      case MSG_RECV_PACKET: {
        if (ibcMetadata?.txType !== "ibc_received") continue;
        const token = ibcMetadata.txInfo.token;
        if (!token) continue;
        const packetData = decodePacketData(message);
        const counterparty = ibcMetadata.txInfo.chain_from
          ? findCosmosChainByName(chainList, ibcMetadata.txInfo.chain_from)
          : undefined;
        return {
          provider: "IBC",
          direction: "deposit",
          fromDenom: token.denom,
          fromAmount: token.amount,
          toDenom: token.denom,
          toAmount: token.amount,
          fromAddress: packetData?.sender ?? "",
          toAddress: packetData?.receiver ?? address,
          counterparty,
        };
      }
    }
  }
}

/** Skip Go entry point: `swap_and_action` / `action` ending in an IBC transfer. */
function parseSkipContract(
  message: Message,
  chainList: Chain[]
): ParsedRoute | undefined {
  const msg = asRecord(message.msg);
  const call = asRecord(msg?.swap_and_action) ?? asRecord(msg?.action);
  if (!call) return;

  const postAction =
    asRecord(call.post_swap_action) ?? asRecord(call.action) ?? undefined;
  const ibcInfo = asRecord(asRecord(postAction?.ibc_transfer)?.ibc_info);
  if (!ibcInfo) return;

  const funds = (message.funds as { denom: string; amount: string }[]) ?? [];
  const input = funds[0];
  if (!input) return;

  const minAsset = asRecord(asRecord(call.min_asset)?.native);
  const toDenom = typeof minAsset?.denom === "string" ? minAsset.denom : "";
  const firstHopReceiver =
    typeof ibcInfo.receiver === "string" ? ibcInfo.receiver : "";

  const destination = resolveMemoDestination(
    ibcInfo.memo,
    firstHopReceiver,
    chainList
  );

  return {
    provider: "Skip",
    direction: "withdraw",
    fromDenom: input.denom,
    fromAmount: input.amount,
    toDenom: toDenom || input.denom,
    toAmount:
      typeof minAsset?.amount === "string" ? minAsset.amount : undefined,
    fromAddress: message.sender ?? "",
    toAddress: destination.receiver,
    counterparty: destination.chain,
  };
}

/** Squid's Osmosis multicall contract, which ends in an IBC transfer to Axelar. */
function parseSquidMulticall(
  message: Message,
  chainList: Chain[]
): ParsedRoute | undefined {
  const calls = asRecord(asRecord(message.msg)?.multicall)?.calls;
  if (!Array.isArray(calls)) return;

  const transfer = calls
    .map((call) => asRecord(asRecord(asRecord(call)?.msg)?.stargate))
    .find((stargate) => stargate?.type_url === MSG_TRANSFER);
  const value = asRecord(transfer?.value);
  const token = asRecord(value?.token);
  if (!value || typeof token?.denom !== "string") return;

  const funds = (message.funds as { denom: string; amount: string }[]) ?? [];
  const input = funds[0];
  if (!input) return;

  const destination = resolveMemoDestination(
    value.memo,
    typeof value.receiver === "string" ? value.receiver : "",
    chainList
  );

  return {
    provider: "Squid",
    direction: "withdraw",
    fromDenom: input.denom,
    fromAmount: input.amount,
    toDenom: token.denom,
    fromAddress: message.sender ?? "",
    toAddress: destination.receiver,
    counterparty: destination.chain,
  };
}

function parseMsgTransfer(
  message: Message,
  chainList: Chain[],
  nextHopChainName: string | undefined
): ParsedRoute | undefined {
  const token = asRecord(message.token);
  if (typeof token?.denom !== "string" || typeof token.amount !== "string") {
    return;
  }
  const receiver = typeof message.receiver === "string" ? message.receiver : "";
  const memo = parseJson(message.memo);

  const destination = resolveMemoDestination(memo, receiver, chainList);
  const isGmp = Boolean(findKey(memo, "destination_chain"));
  const isForward = Boolean(findKey(memo, "forward"));

  // Plain transfers resolve the next hop from the index's chain name, which
  // is more reliable than the receiver's bech32 prefix (shared by forks).
  const counterparty =
    !isGmp && !isForward && nextHopChainName
      ? (findCosmosChainByName(chainList, nextHopChainName) ??
        destination.chain)
      : destination.chain;

  return {
    provider: isGmp ? "Squid" : isForward ? "Skip" : "IBC",
    direction: "withdraw",
    fromDenom: token.denom,
    fromAmount: token.amount,
    toDenom: token.denom,
    toAmount: token.amount,
    fromAddress: message.sender ?? "",
    toAddress: destination.receiver,
    counterparty,
  };
}

/**
 * Follow an IBC memo to the transfer's final destination:
 * - Axelar GMP (`destination_chain` / `destination_address`) → EVM chain
 * - packet-forward-middleware (`forward.receiver`, nested via `next`) → the
 *   last receiver's chain, by bech32 prefix
 * Falls back to the first hop's receiver.
 */
function resolveMemoDestination(
  rawMemo: unknown,
  firstHopReceiver: string,
  chainList: Chain[]
): { chain: TransferChain | undefined; receiver: string } {
  const memo = parseJson(rawMemo);

  const gmp = findKey(memo, "destination_chain");
  if (gmp && typeof gmp.destination_chain === "string") {
    const chain = findEvmChainByAxelarName(gmp.destination_chain);
    const receiver =
      typeof gmp.destination_address === "string"
        ? gmp.destination_address
        : firstHopReceiver;
    if (chain) return { chain, receiver };
  }

  let receiver = firstHopReceiver;
  let forward = asRecord(findKey(memo, "forward")?.forward);
  while (forward) {
    if (typeof forward.receiver === "string") receiver = forward.receiver;
    forward = asRecord(asRecord(parseJson(forward.next))?.forward);
  }

  return { chain: findCosmosChainByAddress(chainList, receiver), receiver };
}

function decodePacketData(
  message: Message
): { sender?: string; receiver?: string } | undefined {
  const data = asRecord(message.packet)?.data;
  // the index decodes packet data; fall back to raw base64 JSON
  if (typeof data !== "string") {
    return asRecord(data) as { sender?: string; receiver?: string } | undefined;
  }
  try {
    // atob, not Buffer: this runs on the edge runtime
    const json = atob(data);
    return asRecord(JSON.parse(json)) as
      { sender?: string; receiver?: string } | undefined;
  } catch {
    return;
  }
}

function toTransferAsset(
  assetLists: AssetList[],
  denom: string
): TransferAsset | undefined {
  try {
    const asset = getAsset({ assetLists, anyDenom: denom });
    return {
      denom: asset.coinDenom,
      address: asset.coinMinimalDenom,
      decimals: asset.coinDecimals,
      coinGeckoId: asset.coinGeckoId,
      imageUrl: asset.coinImageUrl,
    };
  } catch {
    return;
  }
}

function toCosmosChain(chain: Chain): TransferChain {
  return {
    chainType: "cosmos",
    chainId: chain.chain_id,
    chainName: chain.chain_name,
    prettyName: chain.prettyName,
  };
}

function findCosmosChainByName(
  chainList: Chain[],
  chainName: string
): TransferChain | undefined {
  const chain = chainList.find((c) => c.chain_name === chainName);
  return chain ? toCosmosChain(chain) : undefined;
}

function findCosmosChainByAddress(
  chainList: Chain[],
  address: string
): TransferChain | undefined {
  const separator = address.lastIndexOf("1");
  if (separator <= 0) return;
  const prefix = address.slice(0, separator);
  const chain = chainList.find((c) => c.bech32Prefix === prefix);
  return chain ? toCosmosChain(chain) : undefined;
}

function findEvmChainByAxelarName(
  axelarName: string
): TransferChain | undefined {
  const chainId = AXELAR_EVM_CHAIN_IDS[axelarName.toLowerCase()];
  if (!chainId) return;
  const info = EthereumChainInfo.find((c) => c.id === chainId);
  return {
    chainType: "evm",
    chainId,
    chainName: info?.name,
    prettyName: info?.name ?? capitalize(axelarName),
  };
}

/** Depth-first search for the first object containing `key`. */
function findKey(
  value: unknown,
  key: string,
  depth = 0
): Record<string, unknown> | undefined {
  const record = asRecord(parseJson(value));
  if (!record || depth > 8) return;
  if (key in record) return record;
  for (const child of Object.values(record)) {
    const found = findKey(child, key, depth + 1);
    if (found) return found;
  }
}

function parseJson(value: unknown): unknown {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed.startsWith("{")) return undefined;
  try {
    return JSON.parse(trimmed);
  } catch {
    return undefined;
  }
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
