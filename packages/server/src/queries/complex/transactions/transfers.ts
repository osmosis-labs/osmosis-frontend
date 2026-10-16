import { AssetList, Chain } from "@osmosis-labs/types";
import { EthereumChainInfo } from "@osmosis-labs/utils";
import { getAddress } from "viem";

import { Message, Transaction } from "../../../queries/data-services";
import { getAsset } from "../assets";

const MSG_TRANSFER = "/ibc.applications.transfer.v1.MsgTransfer";
const MSG_RECV_PACKET = "/ibc.core.channel.v1.MsgRecvPacket";
const MSG_EXECUTE_CONTRACT = "/cosmwasm.wasm.v1.MsgExecuteContract";
const MSG_ACKNOWLEDGEMENT = "/ibc.core.channel.v1.MsgAcknowledgement";
const MSG_TIMEOUT = "/ibc.core.channel.v1.MsgTimeout";

/** Relayer txs that settle an IBC transfer sent from Osmosis. */
export const IBC_OUTCOME_MESSAGE_TYPES = [MSG_ACKNOWLEDGEMENT, MSG_TIMEOUT];

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
  /**
   * Deposits: the IBC packet it arrived in (`<destination channel>/<sequence>`).
   * A relayer tx can deliver several packets, to several users or to the
   * same one, so a deposit is keyed by tx hash and packet.
   */
  packetId?: string;
  /** Deposits are final once they arrive; withdrawals still need resolving. */
  status: "success" | "pending" | "failed" | "refunded";
  fromAddress: string;
  toAddress: string;
  osmoBech32Address: string;
  fromChain: TransferChain;
  toChain: TransferChain;
  fromAsset: TransferAsset & { amount: string };
  toAsset: TransferAsset & {
    amount?: string;
    /**
     * Deposits: the alloyed asset (minimal denom) the arriving asset is a
     * variant of. A deposit made in this app can convert into it on
     * arrival (e.g. USDC into allUSDC), recording the alloy as received.
     */
    alloy?: string;
  };
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
  packetId?: string;
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
      const osmosisChain = chainList.find((c) => c.chain_id === tx.chainId);
      if (!osmosisChain) continue;
      const osmosis = toCosmosChain(osmosisChain);

      for (const route of parseRoutes(tx, address, chainList)) {
        if (!route.counterparty) continue;

        const fromAsset = toTransferAsset(assetLists, route.fromDenom);
        const toAsset = toTransferAsset(assetLists, route.toDenom);
        if (!fromAsset || !toAsset) continue;

        const createdAtUnix = Math.floor(
          new Date(tx.blockTimestamp).getTime() / 1000
        );
        const isWithdraw = route.direction === "withdraw";

        // a deposit's tx (MsgRecvPacket) is signed and paid for by a relayer
        const fee = isWithdraw ? tx.fee?.[0] : undefined;
        const networkFee = fee
          ? toTransferAsset(assetLists, fee.denom)
          : undefined;
        const osmosisTxPage = osmosisChain.explorers?.[0]?.txPage;

        transfers.push({
          type: "bridge-transfer",
          direction: route.direction,
          provider: route.provider,
          statusProvider: isWithdraw ? "Skip" : undefined,
          createdAtUnix,
          estimatedArrivalUnix: createdAtUnix,
          sendTxHash: tx.hash,
          packetId: route.packetId,
          status: tx.code !== 0 ? "failed" : isWithdraw ? "pending" : "success",
          fromAddress: route.fromAddress,
          toAddress: route.toAddress,
          osmoBech32Address: address,
          fromChain: isWithdraw ? osmosis : route.counterparty,
          toChain: isWithdraw ? route.counterparty : osmosis,
          fromAsset: { ...fromAsset, amount: route.fromAmount },
          toAsset: {
            ...toAsset,
            amount: route.toAmount,
            alloy: isWithdraw
              ? undefined
              : findAlloy(assetLists, route.toDenom),
          },
          networkFee:
            networkFee && fee
              ? { ...networkFee, amount: fee.amount }
              : undefined,
          explorerUrl:
            !isWithdraw && osmosisTxPage
              ? osmosisTxPage.replace("{txHash}", tx.hash)
              : undefined,
        });
      }
    } catch (e) {
      // a malformed or unexpected tx shape must not break the whole page
      continue;
    }
  }

  return transfers;
}

/**
 * The user's transfers in a tx: the withdrawal they signed, or the deposits
 * a relayer delivered to them (one per packet; a relayer bundles packets for
 * several users, and the index lists the tx under each receiver).
 */
function parseRoutes(
  tx: Transaction,
  address: string,
  chainList: Chain[]
): ParsedRoute[] {
  const ibcMetadata =
    tx.metadata?.find((m) => m.type === "osmosis-ui")?.value ?? [];
  const ibcSend = ibcMetadata.find((v) => v.txType === "ibc_send");
  const deposits: ParsedRoute[] = [];

  const messages = tx.messages ?? [];
  for (const [index, message] of messages.entries()) {
    switch (message["@type"]) {
      case MSG_EXECUTE_CONTRACT: {
        if (message.sender !== address) continue;
        const route =
          parseSkipContract(message, chainList) ??
          parseSquidMulticall(message, chainList);
        if (route) return [route];
        continue;
      }
      case MSG_TRANSFER: {
        if (message.sender !== address) continue;
        const route = parseMsgTransfer(
          message,
          chainList,
          ibcSend?.txInfo.chain_to
        );
        return route ? [route] : [];
      }
      case MSG_RECV_PACKET: {
        // each packet's metadata is at its message's index
        const received = ibcMetadata.find(
          (v) => v.txType === "ibc_received" && v.txMessageIndex === index
        );
        const deposit = received
          ? parseRecvPacket(message, received.txInfo, address, chainList)
          : undefined;
        if (deposit) deposits.push(deposit);
        continue;
      }
    }
  }
  return deposits;
}

/** A packet delivered to Osmosis, if it was sent to `address`. */
function parseRecvPacket(
  message: Message,
  info: { token?: { denom: string; amount: string }; chain_from?: string },
  address: string,
  chainList: Chain[]
): ParsedRoute | undefined {
  const token = info.token;
  const packet = asRecord(message.packet);
  const packetData = decodePacketData(message);
  if (!token || !packet || !packetData) return;
  if (!isPacketForAddress(packetData, address)) return;

  const previousHop = info.chain_from
    ? findCosmosChainByName(chainList, info.chain_from)
    : undefined;

  // Axelar GMP deposits (Skip, Squid) arrive from Axelar with the bridge
  // contract as sender. The memo names the real source chain; the user's
  // source address is looked up afterwards (`resolveAxelarTransfers`).
  const gmp = findKey(packetData.memo, "source_chain");
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
    fromAddress: sourceChain ? "" : (packetData.sender ?? ""),
    // the packet receiver may be a contract (ibc hooks) that forwards the
    // funds to the user
    toAddress: address,
    counterparty: sourceChain ?? previousHop,
    packetId: `${packet.destination_channel}/${packet.sequence}`,
  };
}

/**
 * Whether a packet was sent to `address`: as its receiver, or through an
 * ibc-hooks contract (e.g. Skip's entry point) whose memo names the user as
 * the recipient of the funds.
 */
function isPacketForAddress(packetData: PacketData, address: string) {
  if (packetData.receiver === address) return true;
  if (
    typeof packetData.receiver !== "string" ||
    !isContractAddress(packetData.receiver)
  ) {
    return false;
  }

  // Skip's entry point pays the post-swap action's recipient. The user can
  // also appear only as the recovery address, or as the fallback of an
  // `ibc_transfer` that sends the funds on from Osmosis: neither is a
  // deposit to them.
  const skipCall = findKey(packetData.memo, "post_swap_action");
  if (skipCall) {
    const action = asRecord(skipCall.post_swap_action);
    return asRecord(action?.transfer)?.to_address === address;
  }

  const memo =
    typeof packetData.memo === "string"
      ? packetData.memo
      : JSON.stringify(packetData.memo ?? "");
  return memo.includes(address);
}

/** Cosmos contract addresses are 32 bytes; accounts are 20. */
function isContractAddress(address: string) {
  // bech32: prefix, "1", 52 data chars + 6 checksum chars for 32 bytes
  return address.length - address.lastIndexOf("1") - 1 > 39;
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
    // in the payload. Unknown ("") if the payload can't be decoded, rather
    // than showing the contract as the recipient.
    const receiver = decodeGmpRecipient(gmp) ?? "";
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

function isEvmAddress(address: string) {
  return /^0x[0-9a-fA-F]{40}$/.test(address);
}

function isSquidRouter(address: unknown) {
  return (
    typeof address === "string" && SQUID_EVM_ROUTERS.has(address.toLowerCase())
  );
}

/**
 * The final recipient of an Axelar GMP withdrawal, from the GMP payload
 * (`destination_address` is only the bridge's contract):
 * - Squid router: the payout of the multicall it runs (see
 *   `decodeSquidRecipient`). Not the route's refund recipient, which can
 *   differ from the recipient.
 * - Skip's Axelar handler: `abi.encode(uint8 command, bytes data)`, where
 *   `data` is `(address recipient)` for sends (commands 0, 1) and
 *   `(address token, address recipient, ...)` for swap-and-sends.
 * Undefined when the payload doesn't say: shown as unknown.
 */
export function decodeGmpRecipient(
  gmp: Record<string, unknown>
): string | undefined {
  const bytes = toBytes(gmp.payload);
  if (!bytes) return;
  const word = (index: number) => bytes.slice(index * 32, (index + 1) * 32);

  if (isSquidRouter(gmp.destination_address)) {
    return decodeSquidRecipient(bytes);
  }

  const command = wordToNumber(word(0));
  const offset = wordToNumber(word(1));
  if (command === undefined || offset === undefined || offset % 32 !== 0) {
    return;
  }
  // `data` starts after its length word
  const data = offset / 32 + 1;
  return wordToAddress(word(command <= 1 ? data : data + 1));
}

/** Squid's multicall, which holds funds between the route's calls. */
const SQUID_MULTICALL = "0xad6cea45f98444a922a2b4fe96b8c90f0862d2f4";

/** Squid multicall call types (`ISquidMulticall.CallType`). */
const SQUID_CALL_FULL_NATIVE_BALANCE = 2;

/**
 * Payout calls by selector, and the argument (32-byte word after the
 * selector) holding the recipient.
 */
const SQUID_PAYOUT_RECIPIENT_ARG: Record<string, number> = {
  // ERC-20 transfer(address to, uint256 amount)
  a9059cbb: 0,
  // Uniswap V3 SwapRouter02 exactInputSingle((tokenIn, tokenOut, fee,
  // recipient, amountIn, amountOutMinimum, sqrtPriceLimitX96))
  "04e45aaf": 3,
  // Uniswap V3 SwapRouter exactInputSingle((tokenIn, tokenOut, fee,
  // recipient, deadline, amountIn, amountOutMinimum, sqrtPriceLimitX96))
  "414bf389": 3,
};

/**
 * The recipient of a Squid route: whoever its last call pays out to. The
 * payload is `abi.encode(Call[] calls, address refundRecipient)` with
 * `Call = (uint8 callType, address target, uint256 value, bytes callData,
 * bytes payload)`; the multicall holds the funds until the last call moves
 * them out by sending the native balance (target is the recipient), an
 * ERC-20 transfer, or a swap paying out directly. Anything else is unknown.
 */
function decodeSquidRecipient(bytes: Uint8Array): string | undefined {
  const wordAt = (offset: number) => bytes.slice(offset, offset + 32);
  const numberAt = (offset: number) => wordToNumber(wordAt(offset));

  const callsOffset = numberAt(0);
  if (callsOffset === undefined) return;
  const count = numberAt(callsOffset);
  if (!count) return;

  // offsets of the dynamic tuples are relative to the start of the array data
  const arrayStart = callsOffset + 32;
  const lastOffset = numberAt(arrayStart + (count - 1) * 32);
  if (lastOffset === undefined) return;
  const call = arrayStart + lastOffset;

  const callType = numberAt(call);
  const target = wordToAddress(wordAt(call + 32));
  let recipient: string | undefined;

  if (callType === SQUID_CALL_FULL_NATIVE_BALANCE) {
    recipient = target;
  } else {
    const callDataOffset = numberAt(call + 96);
    if (callDataOffset === undefined) return;
    const callDataStart = call + callDataOffset;
    const callDataLength = numberAt(callDataStart);
    if (!callDataLength || callDataLength < 4) return;
    const callData = bytes.slice(
      callDataStart + 32,
      callDataStart + 32 + callDataLength
    );
    const selector = Array.from(callData.slice(0, 4), (b) =>
      b.toString(16).padStart(2, "0")
    ).join("");
    const arg = SQUID_PAYOUT_RECIPIENT_ARG[selector];
    if (arg === undefined) return;
    recipient = wordToAddress(callData.slice(4 + arg * 32, 4 + (arg + 1) * 32));
  }

  // paying back into the multicall isn't a payout
  if (!recipient || recipient.toLowerCase() === SQUID_MULTICALL) return;
  return recipient;
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
 * Settled GMP calls by Osmosis tx hash (and packet, for deposits); they never
 * change. Unsettled calls and calls Axelarscan hasn't indexed yet aren't
 * cached, so they're looked up again on a later request.
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

      const gmp = await lookupAxelarGmp(transfer, env, timeoutMs);
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

type AxelarGmpRecord = {
  simplified_status?: string;
  call?: {
    transactionHash?: string;
    transaction?: { from?: string };
    returnValues?: { amount?: string; payload?: string };
  };
};

/** Relayer txs can execute several GMP calls; enough to find the user's. */
const AXELAR_GMP_SEARCH_SIZE = 25;

async function lookupAxelarGmp(
  transfer: FormattedTransfer,
  env: "mainnet" | "testnet",
  timeoutMs: number
): Promise<AxelarGmp | undefined> {
  const key = `${env}:${transfer.sendTxHash}:${transfer.packetId ?? ""}`;
  const cached = axelarGmpCache.get(key);
  if (cached) return cached;

  try {
    const response = await fetch(`${AXELARSCAN_API[env]}/gmp/searchGMP`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        txHash: transfer.sendTxHash,
        size: AXELAR_GMP_SEARCH_SIZE,
      }),
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!response.ok) return;
    const json = (await response.json()) as { data?: AxelarGmpRecord[] };
    const record = findGmpRecord(json.data ?? [], transfer);
    const call = record?.call;
    // not indexed yet: look again on a later request
    if (!call?.transactionHash) return;

    // the source account: an EVM address for deposits, but the Osmosis
    // account (`osmo1...`) for withdrawals, which getAddress would reject
    const from = call.transaction?.from;
    const gmp: AxelarGmp = {
      sender: from && isEvmAddress(from) ? getAddress(from) : undefined,
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

/**
 * The transfer's GMP call among those its Osmosis tx took part in. A
 * withdrawal's tx is the user's own; a deposit's relayer tx can execute
 * calls for several users, so match the amount and the user's address in
 * the payload. Undefined when that can't single one out, rather than
 * showing another user's call.
 */
function findGmpRecord(
  records: AxelarGmpRecord[],
  transfer: FormattedTransfer
): AxelarGmpRecord | undefined {
  if (transfer.direction === "withdraw") return records[0];
  if (records.length <= 1) {
    // a lone record can still be another user's call, indexed before the
    // user's; its amount must match (the payload needn't name the user)
    const [only] = records;
    const amount = only?.call?.returnValues?.amount;
    return amount === undefined || amount === transfer.fromAsset.amount
      ? only
      : undefined;
  }
  const addressHex = Array.from(
    new TextEncoder().encode(transfer.osmoBech32Address),
    (b) => b.toString(16).padStart(2, "0")
  ).join("");
  const matches = records.filter(
    (r) =>
      r.call?.returnValues?.amount === transfer.fromAsset.amount &&
      Boolean(r.call?.returnValues?.payload?.toLowerCase().includes(addressHex))
  );
  return matches.length === 1 ? matches[0] : undefined;
}

/**
 * Pending IBC withdrawals sent from the user's account whose outcome is in
 * `outcomes` (the relayer's acknowledgement / timeout txs, which the index
 * lists under the packet's sender). Skip can't trace transfers to every chain,
 * and its tracking can't settle old ones, so settle them from the index:
 * a successful ack is delivered; an error ack or a timeout is refunded.
 *
 * Sends and packets are matched on channel, receiver and amount (the index
 * doesn't give a send's packet sequence), each packet at most once, earliest
 * after the send first. Identical sends (same channel, receiver and amount)
 * can't be told apart, so a send is only settled when every packet that could
 * be its outcome agrees; otherwise it stays pending (and is tracked client
 * side).
 */
export function settleIbcWithdrawals({
  transfers,
  transactions,
  outcomes,
  address,
}: {
  transfers: FormattedTransfer[];
  /** The index txs the transfers were parsed from. */
  transactions: Transaction[];
  outcomes: Transaction[];
  address: string;
}): FormattedTransfer[] {
  const packets = outcomes.flatMap((tx) =>
    (tx.messages ?? []).flatMap((message) => {
      const type = message["@type"];
      if (type !== MSG_ACKNOWLEDGEMENT && type !== MSG_TIMEOUT) return [];
      const packet = asRecord(message.packet);
      const data = decodePacketData(message) as
        (PacketData & { amount?: string }) | undefined;
      if (!packet || data?.sender !== address) return [];
      return [
        {
          channel: packet.source_channel,
          receiver: data.receiver,
          amount: data.amount,
          at: new Date(tx.blockTimestamp).getTime(),
          status:
            type === MSG_TIMEOUT || isErrorAcknowledgement(message)
              ? ("refunded" as const)
              : ("success" as const),
        },
      ];
    })
  );
  packets.sort((a, b) => a.at - b.at);
  const used = new Set<(typeof packets)[number]>();

  return transfers.map((transfer) => {
    if (
      transfer.direction !== "withdraw" ||
      transfer.status !== "pending" ||
      transfer.toChain.chainType !== "cosmos"
    ) {
      return transfer;
    }
    const tx = transactions.find((t) => t.hash === transfer.sendTxHash);
    const send = tx?.messages?.find(
      (m) => m["@type"] === MSG_TRANSFER && m.sender === address
    );
    const token = asRecord(send?.token);
    if (!tx || !send || !token) return transfer;

    const sentAt = new Date(tx.blockTimestamp).getTime();
    const candidates = packets.filter(
      (p) =>
        !used.has(p) &&
        p.at >= sentAt &&
        p.channel === send.source_channel &&
        p.receiver === send.receiver &&
        p.amount === token.amount
    );
    const [packet] = candidates;
    if (!packet) return transfer;
    // ambiguous: an identical send could own a packet with another outcome
    if (candidates.some((p) => p.status !== packet.status)) return transfer;
    used.add(packet);
    return { ...transfer, status: packet.status };
  });
}

/** The ack is `{ result }` on success and `{ error }` on failure, decoded by
 *  the index or as raw base64 JSON. */
function isErrorAcknowledgement(message: Message) {
  let ack: unknown = message.acknowledgement;
  if (typeof ack === "string") {
    try {
      ack = JSON.parse(atob(ack));
    } catch {
      return false;
    }
  }
  return Boolean(asRecord(ack)?.error);
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

/** The alloyed asset `denom` is a variant of, if any. */
function findAlloy(assetLists: AssetList[], denom: string): string | undefined {
  try {
    const { variantGroupKey } = getAsset({ assetLists, anyDenom: denom });
    if (!variantGroupKey || variantGroupKey === denom) return;
    const canonical = getAsset({ assetLists, anyDenom: variantGroupKey });
    return canonical.isAlloyed ? canonical.coinMinimalDenom : undefined;
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
