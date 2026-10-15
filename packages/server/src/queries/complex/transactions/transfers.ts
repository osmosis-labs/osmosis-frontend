import { AssetList, Chain } from "@osmosis-labs/types";
import { EthereumChainInfo } from "@osmosis-labs/utils";
import { getAddress } from "viem";

import { Message, Transaction } from "../../../queries/data-services";
import { getAsset } from "../assets";

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

/** Squid's router on EVM chains (same address on every chain). */
const SQUID_EVM_ROUTERS = new Set([
  "0xce16f69375520ab01377ce7b88f5ba8c48f8d666",
]);

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
  /**
   * Explorer link for transfers whose `sendTxHash` (the Osmosis tx) isn't on
   * `fromChain`, i.e. deposits: the Osmosis tx, or the source tx on Axelarscan.
   */
  explorerUrl?: string;
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
      const osmosisTxPage = osmosisChain.explorers?.[0]?.txPage;

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
        explorerUrl:
          !isWithdraw && osmosisTxPage
            ? osmosisTxPage.replace("{txHash}", tx.hash)
            : undefined,
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
        const previousHop = ibcMetadata.txInfo.chain_from
          ? findCosmosChainByName(chainList, ibcMetadata.txInfo.chain_from)
          : undefined;

        // Axelar GMP deposits (Skip, Squid) arrive from Axelar with the bridge
        // contract as sender. The memo names the real source chain; the
        // user's source address is looked up afterwards
        // (`resolveAxelarDepositSenders`).
        const gmp = findKey(packetData?.memo, "source_chain");
        const sourceChain =
          typeof gmp?.source_chain === "string"
            ? findEvmChainByAxelarName(gmp.source_chain)
            : undefined;

        return {
          provider: sourceChain
            ? isSquidRouter(gmp?.source_address)
              ? "Squid"
              : "Skip"
            : "IBC",
          direction: "deposit",
          fromDenom: token.denom,
          fromAmount: token.amount,
          toDenom: token.denom,
          toAmount: token.amount,
          fromAddress: sourceChain ? "" : (packetData?.sender ?? ""),
          // the packet receiver may be a contract (ibc hooks) that forwards
          // the funds to the user
          toAddress: address,
          counterparty: sourceChain ?? previousHop,
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
  const gmp = findKey(memo, "destination_chain");
  const isGmp = Boolean(gmp);
  const isForward = Boolean(findKey(memo, "forward"));

  // Plain transfers resolve the next hop from the index's chain name, which
  // is more reliable than the receiver's bech32 prefix (shared by forks).
  const counterparty =
    !isGmp && !isForward && nextHopChainName
      ? (findCosmosChainByName(chainList, nextHopChainName) ??
        destination.chain)
      : destination.chain;

  return {
    provider: isGmp
      ? isSquidRouter(gmp?.destination_address)
        ? "Squid"
        : "Skip"
      : isForward
        ? "Skip"
        : "IBC",
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
    // destination_address is the bridge's contract; the user's address is
    // in the payload
    const receiver =
      decodeGmpRecipient(gmp) ??
      (typeof gmp.destination_address === "string"
        ? gmp.destination_address
        : firstHopReceiver);
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

function isSquidRouter(address: unknown) {
  return (
    typeof address === "string" && SQUID_EVM_ROUTERS.has(address.toLowerCase())
  );
}

/**
 * The final recipient of an Axelar GMP withdrawal, from the GMP payload
 * (`destination_address` is only the bridge's contract):
 * - Squid router: `abi.encode(Call[] calls, address refundRecipient, ...)`;
 *   the refund recipient is the user.
 * - Skip's Axelar handler: `abi.encode(uint8 command, bytes data)`, where
 *   `data` is `(address recipient)` for sends (commands 0, 1) and
 *   `(address token, address recipient, ...)` for swap-and-sends.
 */
export function decodeGmpRecipient(
  gmp: Record<string, unknown>
): string | undefined {
  const bytes = toBytes(gmp.payload);
  if (!bytes) return;
  const word = (index: number) => bytes.slice(index * 32, (index + 1) * 32);

  if (isSquidRouter(gmp.destination_address)) return wordToAddress(word(1));

  const command = wordToNumber(word(0));
  const offset = wordToNumber(word(1));
  if (command === undefined || offset === undefined || offset % 32 !== 0) {
    return;
  }
  // `data` starts after its length word
  const data = offset / 32 + 1;
  return wordToAddress(word(command <= 1 ? data : data + 1));
}

function toBytes(payload: unknown): Uint8Array | undefined {
  if (Array.isArray(payload)) return Uint8Array.from(payload as number[]);
  if (typeof payload !== "string" || payload.length === 0) return;
  const hex = payload.replace(/^0x/, "");
  if (/^[0-9a-fA-F]+$/.test(hex) && hex.length % 2 === 0) {
    return Uint8Array.from(hex.match(/../g) ?? [], (b) => parseInt(b, 16));
  }
  try {
    return Uint8Array.from(atob(payload), (c) => c.charCodeAt(0));
  } catch {
    return;
  }
}

function wordToAddress(word: Uint8Array): string | undefined {
  if (word.length !== 32) return;
  if (word.slice(0, 12).some((b) => b !== 0)) return;
  const body = word.slice(12);
  if (body.every((b) => b === 0)) return;
  return getAddress(
    "0x" + Array.from(body, (b) => b.toString(16).padStart(2, "0")).join("")
  );
}

function wordToNumber(word: Uint8Array): number | undefined {
  if (word.length !== 32) return;
  // anything wider than 6 bytes isn't a command or an offset
  if (word.slice(0, 26).some((b) => b !== 0)) return;
  return word.slice(26).reduce((n, b) => n * 256 + b, 0);
}

const AXELARSCAN_API = {
  mainnet: "https://api.axelarscan.io",
  testnet: "https://testnet.api.axelarscan.io",
};
const AXELARSCAN = {
  mainnet: "https://axelarscan.io",
  testnet: "https://testnet.axelarscan.io",
};

type AxelarGmp = {
  /** The EVM account that sent the GMP call (deposits). */
  sender?: string;
  sourceTxHash: string;
  status: "success" | "failed" | "pending";
};

/**
 * Settled GMP calls by Osmosis tx hash; they never change. Unsettled calls
 * and calls Axelarscan hasn't indexed yet aren't cached, so they're looked
 * up again on a later request.
 */
const axelarGmpCache = new Map<string, AxelarGmp>();
const AXELAR_GMP_CACHE_MAX = 5_000;

/**
 * Fill in what only Axelarscan knows about Axelar GMP transfers (looked up
 * by the Osmosis tx hash). Best effort: on failure a transfer is returned as
 * is.
 * - Deposits carry the bridge contract as sender: show the user's source
 *   address and link the source tx.
 * - Withdrawals: their final status, since Skip can't trace every GMP route
 *   (e.g. Squid's multicall).
 */
export async function resolveAxelarTransfers(
  transfers: FormattedTransfer[],
  {
    env = "mainnet",
    timeoutMs = 4_000,
  }: { env?: "mainnet" | "testnet"; timeoutMs?: number } = {}
): Promise<FormattedTransfer[]> {
  return Promise.all(
    transfers.map(async (transfer) => {
      const isGmpDeposit =
        transfer.direction === "deposit" &&
        transfer.fromChain.chainType === "evm" &&
        !transfer.fromAddress;
      const isPendingGmpWithdrawal =
        transfer.direction === "withdraw" &&
        transfer.toChain.chainType === "evm" &&
        transfer.status === "pending";
      if (!isGmpDeposit && !isPendingGmpWithdrawal) return transfer;

      const gmp = await lookupAxelarGmp(transfer.sendTxHash, env, timeoutMs);
      if (!gmp) return transfer;

      if (isGmpDeposit) {
        return gmp.sender
          ? {
              ...transfer,
              fromAddress: gmp.sender,
              explorerUrl: `${AXELARSCAN[env]}/gmp/${gmp.sourceTxHash}`,
            }
          : transfer;
      }
      return { ...transfer, status: gmp.status };
    })
  );
}

async function lookupAxelarGmp(
  osmosisTxHash: string,
  env: "mainnet" | "testnet",
  timeoutMs: number
): Promise<AxelarGmp | undefined> {
  const key = `${env}:${osmosisTxHash}`;
  const cached = axelarGmpCache.get(key);
  if (cached) return cached;

  try {
    const response = await fetch(`${AXELARSCAN_API[env]}/gmp/searchGMP`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ txHash: osmosisTxHash, size: 1 }),
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!response.ok) return;
    const json = (await response.json()) as {
      data?: {
        simplified_status?: string;
        call?: { transactionHash?: string; transaction?: { from?: string } };
      }[];
    };
    const record = json.data?.[0];
    const call = record?.call;
    // not indexed yet: look again on a later request
    if (!call?.transactionHash) return;

    const from = call.transaction?.from;
    const gmp: AxelarGmp = {
      sender: from ? getAddress(from) : undefined,
      sourceTxHash: call.transactionHash,
      status:
        record?.simplified_status === "received"
          ? "success"
          : record?.simplified_status === "failed"
            ? "failed"
            : "pending",
    };

    if (gmp.status !== "pending") {
      if (axelarGmpCache.size >= AXELAR_GMP_CACHE_MAX) {
        const oldest = axelarGmpCache.keys().next().value;
        if (oldest !== undefined) axelarGmpCache.delete(oldest);
      }
      axelarGmpCache.set(key, gmp);
    }
    return gmp;
  } catch {
    // network error or timeout: retried on a later request
    return;
  }
}

type PacketData = { sender?: string; receiver?: string; memo?: unknown };

function decodePacketData(message: Message): PacketData | undefined {
  const data = asRecord(message.packet)?.data;
  // the index decodes packet data; fall back to raw base64 JSON
  if (typeof data !== "string") {
    return asRecord(data) as PacketData | undefined;
  }
  try {
    // atob, not Buffer: this runs on the edge runtime
    const json = atob(data);
    return asRecord(JSON.parse(json)) as PacketData | undefined;
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
