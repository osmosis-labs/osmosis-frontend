import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import { Dec, PricePretty } from "@osmosis-labs/unit";
import { apiClient, getSolanaExplorerUrl, shorten } from "@osmosis-labs/utils";
import type {
  Keypair,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import { FunctionComponent, useCallback, useEffect, useState } from "react";

import { Spinner } from "~/components/loaders";
import { formatPretty } from "~/utils/formatter";

import {
  type AvailableSuiWallet,
  connectSuiWallet,
  executeSuiRedeem,
  getCoinTypeForSuiVAA,
  listAvailableSuiWallets,
  subscribeToAvailableSuiWallets,
  SUI_WALLET_REGISTRY,
  SuiRedeemError,
  type SuiWalletConnection,
  type SuiWalletId,
} from "./wormhole-sui";

const WORMHOLESCAN_API = "https://api.wormholescan.io/api/v1";
const WORMHOLESCAN_UI = "https://wormholescan.io";
const SOLANA_RPC = "https://solana-rpc.publicnode.com";

// Wormhole gateway channel from Osmosis -> Wormchain (the IBC translator).
// MsgTransfer's source_channel on Osmosis is `channel-2186`; on Wormchain
// the corresponding `dst_channel` is `channel-3`.
const OSMOSIS_WORMHOLE_GATEWAY_CHANNEL = "channel-2186";

// LCD fallbacks for Osmosis tx lookup. Individual providers flake (503/404
// for txs older than their pruning window); we try them in order on
// non-200 responses.
const OSMOSIS_LCDS = [
  "https://rest.cosmos.directory/osmosis",
  "https://osmosis-rest.publicnode.com",
  "https://lcd.osmosis.zone",
];

// Wormchain RPC fallbacks. Same rationale as `OSMOSIS_LCDS`: a single
// provider going down would otherwise break recovery for every user.
const WORMCHAIN_RPCS = [
  "https://wormchain-rpc.polkachu.com",
  "https://wormchain-rpc.publicnode.com",
];

const FETCH_TIMEOUT_MS = 5000;

/**
 * `fetch` with a hard timeout. A hung LCD/RPC would otherwise block the
 * whole resolution path and leave the widget stuck in `looking_up`.
 */
async function fetchWithTimeout(
  url: string,
  {
    timeoutMs = FETCH_TIMEOUT_MS,
    ...init
  }: RequestInit & {
    timeoutMs?: number;
  } = {}
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

const TOKEN_BRIDGE_PROGRAM_ID = "wormDTUJ6AWPNvk59vGQbDvGJmqbDTdgWgAqcLBCgUb";

// Wormhole chain IDs we render explicitly. See
// https://docs.wormhole.com/wormhole/reference/constants
const CHAIN_ID = {
  solana: 1,
  sui: 21,
} as const;

const CHAIN_LABEL: Record<number, string> = {
  1: "Solana",
  2: "Ethereum",
  4: "BSC",
  5: "Polygon",
  6: "Avalanche",
  10: "Fantom",
  14: "Celo",
  16: "Moonbeam",
  19: "Injective",
  20: "Osmosis",
  21: "Sui",
  22: "Aptos",
  23: "Arbitrum",
  24: "Optimism",
  30: "Base",
  32: "Sei",
  3104: "Wormchain",
};

function getChainLabel(chainId: number): string {
  return CHAIN_LABEL[chainId] ?? `chain ${chainId}`;
}

interface OperationData {
  id: string;
  emitterChain: number;
  emitterAddress: { hex: string; native: string };
  sequence: string;
  vaa: { raw: string; guardianSetIndex: number };
  content: {
    payload: {
      payloadType: number;
      amount: string;
      tokenAddress: string;
      tokenChain: number;
      toAddress: string;
      toChain: number;
      fee: string;
    };
    standarizedProperties: {
      appIds: string[];
      fromChain: number;
      fromAddress: string;
      toChain: number;
      toAddress: string;
      tokenChain: number;
      tokenAddress: string;
      amount: string;
      fee: string;
    };
  };
  sourceChain: {
    chainId: number;
    timestamp: string;
    transaction: { txHash: string; secondTxHash?: string };
    from: string;
    status: string;
    attribute?: {
      type: string;
      value?: {
        originAddress?: string;
        originChainId?: number;
        originTxHash?: string;
      };
    };
  };
  targetChain?: {
    chainId: number;
    timestamp: string;
    transaction: { txHash: string };
    status: string;
  };
  data: {
    symbol: string;
    tokenAmount: string;
    usdAmount: string;
  };
}

type RedeemStatus =
  | "idle"
  | "looking_up"
  | "already_redeemed"
  | "checking_solana"
  | "ready"
  | "signing"
  | "submitting"
  | "success"
  | "error";

const PHANTOM_DOWNLOAD_URL = "https://phantom.app/";

type RedeemError =
  | { type: "phantom_not_installed" }
  | { type: "sui_wallet_not_installed" }
  | { type: "generic"; message: string }
  | null;

// 64-char hex (e.g. an Osmosis/Wormchain tx hash). Solana sigs are base58
// and therefore won't match this pattern, so we can safely use it to
// decide whether to attempt the Osmosis LCD fallback.
const COSMOS_TX_HASH_RE = /^[0-9a-fA-F]{64}$/;

interface OsmosisSendPacket {
  sequence: string;
  srcChannel: string;
  dstChannel: string;
  destinationChain?: number;
  recipientBase64?: string;
}

interface CosmosTxEvent {
  type: string;
  attributes: { key: string; value: string }[];
}

interface CosmosTxResponse {
  tx_response?: {
    events?: CosmosTxEvent[];
  };
}

interface WormchainTxSearchResponse {
  result?: {
    txs?: { hash: string }[];
    total_count?: string;
  };
}

const getAttr = (event: CosmosTxEvent, key: string): string | undefined =>
  event.attributes.find((a) => a.key === key)?.value;

/**
 * Parse the gateway memo embedded in an Osmosis -> Wormchain MsgTransfer.
 * Returns the destination Wormhole chain id and base64 recipient when present.
 */
function parseGatewayMemo(
  memo: string | undefined
): Pick<OsmosisSendPacket, "destinationChain" | "recipientBase64"> {
  if (!memo) return {};
  try {
    const parsed = JSON.parse(memo);
    const payload =
      parsed?.gateway_ibc_token_bridge_payload?.gateway_transfer ?? {};
    return {
      destinationChain:
        typeof payload.chain === "number" ? payload.chain : undefined,
      recipientBase64:
        typeof payload.recipient === "string" ? payload.recipient : undefined,
    };
  } catch {
    return {};
  }
}

/**
 * Look up an Osmosis transaction and extract the Wormhole gateway IBC packet
 * (sequence + channels + memo). Returns null if no Wormhole gateway transfer
 * was found in the tx. Tries multiple LCD providers because individual
 * endpoints frequently 404/503 on older blocks.
 */
export async function lookupOsmosisIbcPacket(
  osmosisTxHash: string,
  lcds: readonly string[] = OSMOSIS_LCDS
): Promise<OsmosisSendPacket | null> {
  let seenNotFound = false;
  let lastError: unknown = null;
  for (const lcd of lcds) {
    try {
      const res = await fetchWithTimeout(
        `${lcd}/cosmos/tx/v1beta1/txs/${encodeURIComponent(osmosisTxHash)}`
      );
      if (res.status === 404) {
        // Could be a wrong/unknown hash, or this provider has simply pruned
        // older blocks. Try the next LCD before deciding it's truly missing.
        seenNotFound = true;
        continue;
      }
      if (!res.ok) {
        lastError = new Error(`${lcd} returned ${res.status}`);
        continue;
      }
      const json = (await res.json()) as CosmosTxResponse;
      const events = json.tx_response?.events ?? [];

      // Only accept a send_packet that actually uses the Wormhole gateway
      // channel. Any other IBC transfer in this tx is unrelated and would
      // resolve to a different (irrelevant) Wormchain packet.
      const sendPackets = events.filter((e) => e.type === "send_packet");
      const gatewayPacket = sendPackets.find(
        (e) =>
          getAttr(e, "packet_src_channel") === OSMOSIS_WORMHOLE_GATEWAY_CHANNEL
      );
      if (!gatewayPacket) return null;

      const sequence = getAttr(gatewayPacket, "packet_sequence");
      const srcChannel = getAttr(gatewayPacket, "packet_src_channel");
      const dstChannel = getAttr(gatewayPacket, "packet_dst_channel");
      if (!sequence || !srcChannel || !dstChannel) return null;

      // The user-supplied memo is also surfaced as an attribute on the
      // `ibc_transfer` event; fall back to parsing `packet_data` if that
      // event is missing in this LCD's response format.
      const ibcTransfer = events.find((e) => e.type === "ibc_transfer");
      let memo = ibcTransfer ? getAttr(ibcTransfer, "memo") : undefined;
      if (!memo) {
        const packetData = getAttr(gatewayPacket, "packet_data");
        if (packetData) {
          try {
            memo = JSON.parse(packetData)?.memo;
          } catch {
            // ignore
          }
        }
      }

      return {
        sequence,
        srcChannel,
        dstChannel,
        ...parseGatewayMemo(memo),
      };
    } catch (err) {
      lastError = err;
    }
  }
  // If every LCD we tried returned 404 and nothing else failed, the tx
  // genuinely does not exist (or none of the configured providers retain
  // it). Surface a tx-not-found error rather than a generic provider
  // outage so the user can correct the hash.
  if (!lastError && seenNotFound) {
    throw new Error(
      "Osmosis transaction not found. Double-check the hash and that it was broadcast on Osmosis mainnet."
    );
  }
  if (lastError) {
    throw new Error(
      `Could not fetch Osmosis tx from any LCD: ${
        lastError instanceof Error ? lastError.message : String(lastError)
      }`
    );
  }
  return null;
}

/**
 * Find the Wormchain `recv_packet` tx that corresponds to an Osmosis
 * send_packet. Wormholescan indexes Wormhole VAAs under this tx hash
 * (the Osmosis hash is never indexed for gateway transfers).
 *
 * Iterates the configured Wormchain RPCs and returns on the first
 * provider that responds successfully, so a single endpoint outage
 * doesn't break recovery. Throws only if every provider fails.
 */
export async function findWormchainRecvTx({
  sequence,
  srcChannel,
  wormchainRpcs = WORMCHAIN_RPCS,
}: {
  sequence: string;
  srcChannel: string;
  wormchainRpcs?: readonly string[];
}): Promise<string | null> {
  // Tendermint RPC requires the query value to be a quoted string.
  const query = `"recv_packet.packet_sequence='${sequence}' AND recv_packet.packet_src_channel='${srcChannel}'"`;
  let lastError: unknown = null;
  for (const rpc of wormchainRpcs) {
    try {
      const url = `${rpc}/tx_search?query=${encodeURIComponent(query)}`;
      const res = await fetchWithTimeout(url);
      if (!res.ok) {
        lastError = new Error(`${rpc} returned ${res.status}`);
        continue;
      }
      const json = (await res.json()) as WormchainTxSearchResponse;
      return json.result?.txs?.[0]?.hash ?? null;
    } catch (err) {
      lastError = err;
    }
  }
  throw new Error(
    `Could not query Wormchain RPC: ${
      lastError instanceof Error ? lastError.message : String(lastError)
    }`
  );
}

interface ResolvedOperation {
  operation: OperationData;
  /** The Wormchain (or other emitter chain) tx hash that Wormholescan
   *  indexed the VAA under. Useful for deep links. */
  resolvedTxHash: string;
  /** True when we had to derive the wormchain hash from an Osmosis tx. */
  derivedFromOsmosis: boolean;
}

async function fetchOperation(txHash: string): Promise<OperationData | null> {
  const json = await apiClient<{ operations?: OperationData[] }>(
    `${WORMHOLESCAN_API}/operations?txHash=${encodeURIComponent(txHash)}`
  );
  return json.operations?.[0] ?? null;
}

/**
 * Resolve a user-supplied tx hash to a Wormhole operation. The hash may be
 * either the actual Wormhole emitter tx (e.g. a Wormchain hash) — in which
 * case Wormholescan indexes it directly — or an Osmosis tx hash, in which
 * case we follow the IBC packet to the Wormchain receive tx first.
 */
export async function resolveOperation(
  userHash: string
): Promise<ResolvedOperation> {
  const direct = await fetchOperation(userHash);
  if (direct) {
    return {
      operation: direct,
      resolvedTxHash: userHash,
      derivedFromOsmosis: false,
    };
  }

  if (!COSMOS_TX_HASH_RE.test(userHash)) {
    throw new Error(
      "Transaction not found. Make sure this is a Wormhole bridge transaction hash."
    );
  }

  // The hash format alone can't tell us whether this is an Osmosis tx or
  // an as-yet-unindexed Wormchain receive — they're both 64-char hex.
  // Catch the "not found on Osmosis" path and surface both possibilities
  // so the user can wait-and-retry rather than thinking they typed the
  // wrong hash.
  let packet: OsmosisSendPacket | null;
  try {
    packet = await lookupOsmosisIbcPacket(userHash);
  } catch (err) {
    if (
      err instanceof Error &&
      err.message.startsWith("Osmosis transaction not found")
    ) {
      throw new Error(
        "Transaction not found on Wormholescan and no matching Osmosis transaction was located. If this is a Wormchain receive hash, the guardians may still be signing — try again in a minute. Otherwise, double-check the hash."
      );
    }
    throw err;
  }
  if (!packet) {
    throw new Error(
      "Transaction not found on Wormholescan and no Wormhole gateway IBC transfer was found in this Osmosis transaction."
    );
  }

  const wormchainHash = await findWormchainRecvTx({
    sequence: packet.sequence,
    srcChannel: packet.srcChannel,
  });
  if (!wormchainHash) {
    throw new Error(
      "Found the Osmosis send packet but the corresponding Wormchain receive has not been relayed yet. Try again in a minute."
    );
  }

  const op = await fetchOperation(wormchainHash);
  if (!op) {
    throw new Error(
      `Found the Wormchain receive (${wormchainHash}) but Wormholescan has not indexed a VAA for it yet. The guardians may still be signing — try again in a minute.`
    );
  }

  return {
    operation: op,
    resolvedTxHash: wormchainHash,
    derivedFromOsmosis: true,
  };
}

function getDestinationExplorerUrl(
  toChain: number,
  hash: string
): string | null {
  switch (toChain) {
    case CHAIN_ID.solana:
      return getSolanaExplorerUrl({ hash });
    case CHAIN_ID.sui:
      return `https://suiscan.xyz/mainnet/tx/${encodeURIComponent(hash)}`;
    default:
      return null;
  }
}

/**
 * Generic fallback panel for destinations we don't natively support
 * here (EVM chains, etc.) and for Sui transfers carrying token types
 * the native redeem path doesn't know about. Surfaces the resolved
 * VAA and deep-links to Wormholescan's multi-chain redeem UI.
 */
const NonSolanaRedeemPanel: FunctionComponent<{
  operation: OperationData;
  wormholescanHash: string;
  onCopy: (value: string, hint: string) => void;
  copyHint: string | null;
}> = ({ operation, wormholescanHash, onCopy, copyHint }) => {
  const toChainId = operation.content.payload.toChain;
  const chainLabel = getChainLabel(toChainId);
  const vaa = operation.vaa.raw;
  const recipient = operation.content.standarizedProperties.toAddress;
  const wormholescanUrl = `${WORMHOLESCAN_UI}/#/tx/${encodeURIComponent(
    wormholescanHash
  )}?network=Mainnet`;

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-ammelia-600 bg-ammelia-600/10 p-3 text-sm text-ammelia-200">
        VAA is signed and ready. To redeem on {chainLabel}, open this operation
        on Wormholescan and connect a {chainLabel} wallet. Wormholescan&apos;s
        redeem flow supports Sui Wallet, Suiet, Backpack, and other Wallet
        Standard wallets.
      </div>

      <div className="rounded-lg bg-osmoverse-900 p-3 text-sm">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-osmoverse-400">Recipient ({chainLabel})</span>
          <button
            onClick={() => onCopy(recipient, "recipient")}
            className="text-xs text-wosmongton-300 underline"
          >
            {copyHint === "recipient" ? "Copied" : "Copy"}
          </button>
        </div>
        <div className="break-all font-mono text-xs text-white-full">
          {recipient}
        </div>
      </div>

      <div className="rounded-lg bg-osmoverse-900 p-3 text-sm">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-osmoverse-400">VAA (base64)</span>
          <button
            onClick={() => onCopy(vaa, "vaa")}
            className="text-xs text-wosmongton-300 underline"
          >
            {copyHint === "vaa" ? "Copied" : "Copy"}
          </button>
        </div>
        <div className="max-h-24 overflow-y-auto break-all font-mono text-[10px] text-osmoverse-300">
          {vaa}
        </div>
      </div>

      <a
        href={wormholescanUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full rounded-lg bg-wosmongton-700 px-4 py-3 text-center text-sm font-medium text-white-full transition-colors hover:bg-wosmongton-600"
      >
        Open on Wormholescan to redeem
      </a>
    </div>
  );
};

/**
 * Native Sui redemption panel. Speaks the Sui Wallet Standard directly
 * via `@mysten/wallet-standard`, with no React adapter / dApp-kit
 * dependency. Detects allowlisted Sui wallets (Slush + Phantom) and
 * lets the user pick which one to connect. If the token type isn't in
 * the known mapping we fall through to `NonSolanaRedeemPanel`.
 */
const SuiRedeemPanel: FunctionComponent<{
  operation: OperationData;
  wormholescanHash: string;
  onCopy: (value: string, hint: string) => void;
  copyHint: string | null;
  availableSuiWallets: AvailableSuiWallet[];
  connection: SuiWalletConnection | null;
  onConnect: (walletId: SuiWalletId) => Promise<void>;
  onRedeem: () => Promise<void>;
  isLoading: boolean;
  status: RedeemStatus;
}> = ({
  operation,
  wormholescanHash,
  onCopy,
  copyHint,
  availableSuiWallets,
  connection,
  onConnect,
  onRedeem,
  isLoading,
  status,
}) => {
  const recipient = operation.content.standarizedProperties.toAddress;
  const tokenChain = operation.content.payload.tokenChain;
  const tokenAddress = operation.content.payload.tokenAddress;

  // If we don't recognize the token type we fall back to the generic
  // Wormholescan-link panel: the on-chain CoinType lookup requires
  // a chain-specific dynamic-field walk we deliberately don't ship.
  try {
    getCoinTypeForSuiVAA(tokenChain, tokenAddress);
  } catch (err) {
    if (err instanceof SuiRedeemError && err.code === "unsupported_token") {
      return (
        <NonSolanaRedeemPanel
          operation={operation}
          wormholescanHash={wormholescanHash}
          onCopy={onCopy}
          copyHint={copyHint}
        />
      );
    }
    throw err;
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-ammelia-600 bg-ammelia-600/10 p-3 text-sm text-ammelia-200">
        VAA is signed and ready. Connect a Sui wallet (Slush or Phantom) to
        redeem natively on Sui.
      </div>

      <div className="rounded-lg bg-osmoverse-900 p-3 text-sm">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-osmoverse-400">Recipient (Sui)</span>
          <button
            onClick={() => onCopy(recipient, "recipient")}
            className="text-xs text-wosmongton-300 underline"
          >
            {copyHint === "recipient" ? "Copied" : "Copy"}
          </button>
        </div>
        <div className="break-all font-mono text-xs text-white-full">
          {recipient}
        </div>
      </div>

      {!connection ? (
        availableSuiWallets.length === 0 ? (
          <div className="rounded-lg border border-osmoverse-600 bg-osmoverse-900 p-3 text-sm text-osmoverse-200">
            <div className="mb-2">
              No supported Sui wallet detected. Install one to redeem natively:
            </div>
            <div className="flex flex-col gap-1">
              {SUI_WALLET_REGISTRY.map((descriptor) => (
                <a
                  key={descriptor.id}
                  href={descriptor.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-wosmongton-300 underline"
                >
                  Install {descriptor.displayName}
                </a>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {availableSuiWallets.map((w) => (
              <button
                key={w.id}
                onClick={() => onConnect(w.id)}
                disabled={isLoading}
                className="w-full rounded-lg bg-wosmongton-700 px-4 py-3 text-sm font-medium text-white-full transition-colors hover:bg-wosmongton-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Connect {w.displayName}
              </button>
            ))}
          </div>
        )
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-osmoverse-900 p-3 text-sm">
            <span className="text-osmoverse-400">
              Connected {connection.displayName} account
            </span>
            <span className="font-mono text-xs text-white-full">
              {shorten(connection.address)}
            </span>
          </div>
          <button
            onClick={onRedeem}
            disabled={isLoading}
            className="w-full rounded-lg bg-wosmongton-700 px-4 py-3 text-sm font-medium text-white-full transition-colors hover:bg-wosmongton-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === "signing"
              ? `Confirm in ${connection.displayName}...`
              : status === "submitting"
              ? "Submitting on Sui..."
              : "Redeem on Sui"}
          </button>
        </div>
      )}
    </div>
  );
};

export const WormholeRedeem: FunctionComponent = () => {
  const [txHash, setTxHash] = useState("");
  const [status, setStatus] = useState<RedeemStatus>("idle");
  const [operation, setOperation] = useState<OperationData | null>(null);
  const [error, setError] = useState<RedeemError>(null);
  const [solanaWallet, setSolanaWallet] = useState<string | null>(null);
  const [redeemTxHashes, setRedeemTxHashes] = useState<string[]>([]);
  const [lookedUpTxHash, setLookedUpTxHash] = useState("");
  // The Wormhole emitter-chain tx hash Wormholescan indexed the VAA under.
  // Equals `lookedUpTxHash` when the user pasted the emitter hash directly;
  // set to the discovered Wormchain hash when we resolved an Osmosis tx.
  const [resolvedTxHash, setResolvedTxHash] = useState<string | null>(null);
  const [derivedFromOsmosis, setDerivedFromOsmosis] = useState(false);
  const [copyHint, setCopyHint] = useState<string | null>(null);

  const [phantom, setPhantom] = useState<any>(null);
  const [suiConnection, setSuiConnection] =
    useState<SuiWalletConnection | null>(null);
  const [availableSuiWallets, setAvailableSuiWallets] = useState<
    AvailableSuiWallet[]
  >(() => listAvailableSuiWallets());
  const [suiRedeemTxDigest, setSuiRedeemTxDigest] = useState<string | null>(
    null
  );

  useEffect(() => {
    const detect = () =>
      (window as any).phantom?.solana ?? (window as any).solana ?? null;

    const provider = detect();
    if (provider) {
      setPhantom(provider);
      return;
    }

    const onProviderReady = () => setPhantom(detect());
    window.addEventListener("load", onProviderReady);
    const timer = setTimeout(() => setPhantom(detect()), 1000);
    return () => {
      window.removeEventListener("load", onProviderReady);
      clearTimeout(timer);
    };
  }, []);

  // Wallet Standard registers asynchronously; subscribe so wallets that
  // load after this component mounts are picked up without a refresh.
  useEffect(() => subscribeToAvailableSuiWallets(setAvailableSuiWallets), []);

  const lookupTransaction = useCallback(async () => {
    const hash = txHash.trim();
    if (!hash) return;

    setStatus("looking_up");
    setOperation(null);
    setError(null);
    setRedeemTxHashes([]);
    setSuiRedeemTxDigest(null);
    setLookedUpTxHash(hash);
    setResolvedTxHash(null);
    setDerivedFromOsmosis(false);

    try {
      const {
        operation: op,
        resolvedTxHash: wormHash,
        derivedFromOsmosis: derived,
      } = await resolveOperation(hash);

      if (!op.vaa?.raw) {
        throw new Error(
          "VAA not yet available. The Wormhole guardians may still be processing this transaction."
        );
      }

      setOperation(op);
      setResolvedTxHash(wormHash);
      setDerivedFromOsmosis(derived);

      // Already-redeemed detection is generic across destination chains:
      // Wormholescan reports `targetChain.status === "completed"` once the
      // VAA has been replayed on the destination chain.
      if (op.targetChain?.status === "completed") {
        setStatus("already_redeemed");
        return;
      }

      // The on-chain claim-PDA check is Solana-specific. For other chains
      // we rely on Wormholescan's targetChain status above and fall
      // straight through to the ready state.
      if (op.content.payload.toChain === CHAIN_ID.solana) {
        setStatus("checking_solana");
        const redeemed = await checkIfRedeemed(op);
        setStatus(redeemed ? "already_redeemed" : "ready");
        return;
      }

      setStatus("ready");
    } catch (err: unknown) {
      setError({
        type: "generic",
        message:
          err instanceof Error ? err.message : "Failed to look up transaction",
      });
      setStatus("error");
    }
  }, [txHash]);

  const copyToClipboard = useCallback(async (value: string, hint: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopyHint(hint);
      setTimeout(() => setCopyHint(null), 2000);
    } catch {
      // ignore - clipboard may be unavailable in some environments
    }
  }, []);

  const connectWallet = useCallback(async () => {
    if (!phantom) {
      setError({ type: "phantom_not_installed" });
      return;
    }
    try {
      const resp = await phantom.connect();
      setSolanaWallet(resp.publicKey.toString());
    } catch (err: unknown) {
      setError({
        type: "generic",
        message:
          err instanceof Error ? err.message : "Failed to connect wallet",
      });
    }
  }, [phantom]);

  useEffect(() => {
    if (!phantom) return;
    const onAccountChanged = (publicKey: { toString(): string } | null) => {
      setSolanaWallet(publicKey ? publicKey.toString() : null);
    };
    phantom.on?.("accountChanged", onAccountChanged);
    return () => phantom.off?.("accountChanged", onAccountChanged);
  }, [phantom]);

  const connectSui = useCallback(
    async (walletId: SuiWalletId) => {
      setError(null);
      try {
        // Pass the VAA recipient so multi-account wallets can land on
        // the right Sui account on first try, skipping the
        // wallet_mismatch round-trip.
        const recipient = operation?.content.standarizedProperties.toAddress;
        const conn = await connectSuiWallet(walletId, recipient);
        setSuiConnection(conn);
      } catch (err) {
        if (
          err instanceof SuiRedeemError &&
          err.code === "wallet_not_installed"
        ) {
          setError({ type: "sui_wallet_not_installed" });
          return;
        }
        // `no_sui_account` falls through to the generic branch so the
        // user sees the specific "create a Sui account in <wallet>"
        // message rather than the dual install-link copy.
        setError({
          type: "generic",
          message:
            err instanceof Error
              ? err.message
              : "Failed to connect Sui wallet.",
        });
      }
    },
    [operation]
  );

  const executeSuiRedeemFlow = useCallback(async () => {
    if (!operation || !suiConnection) return;
    setError(null);
    setSuiRedeemTxDigest(null);

    try {
      setStatus("signing");
      const digest = await executeSuiRedeem({
        vaaBase64: operation.vaa.raw,
        recipient: operation.content.standarizedProperties.toAddress,
        tokenChain: operation.content.payload.tokenChain,
        tokenAddressHex: operation.content.payload.tokenAddress,
        connection: suiConnection,
      });
      setStatus("submitting");
      setSuiRedeemTxDigest(digest);
      setStatus("success");
    } catch (err) {
      setError({
        type: "generic",
        message: err instanceof Error ? err.message : "Sui redeem failed",
      });
      setStatus("error");
    }
  }, [operation, suiConnection]);

  const executeRedeem = useCallback(async () => {
    if (!operation || !solanaWallet || !phantom) return;

    setError(null);

    try {
      setStatus("signing");

      const { Connection, PublicKey } = await import("@solana/web3.js");
      const connection = new Connection(SOLANA_RPC);

      const { Wormhole } = await import("@wormhole-foundation/sdk-connect");
      const { SolanaPlatform, isVersionedTransaction } = await import(
        "@wormhole-foundation/sdk-solana"
      );
      await import("@wormhole-foundation/sdk-solana-tokenbridge");
      const { deserialize } = await import(
        "@wormhole-foundation/sdk-definitions"
      );

      const wh = new Wormhole("Mainnet", [SolanaPlatform], {
        chains: { Solana: { rpc: SOLANA_RPC } },
      });
      const solanaCtx = wh.getChain("Solana");
      const tb = await solanaCtx.getTokenBridge();

      const vaaBytes = Uint8Array.from(atob(operation.vaa.raw), (c) =>
        c.charCodeAt(0)
      );
      const vaa = deserialize("TokenBridge:Transfer", vaaBytes);

      const payer = new PublicKey(solanaWallet);
      const senderAddress = Wormhole.chainAddress("Solana", solanaWallet);
      const recipient = operation.content.standarizedProperties.toAddress;
      const isRecipient = solanaWallet === recipient;
      const isNativeUnwrap =
        isRecipient &&
        operation.content.payload.tokenChain === 1 &&
        operation.data.symbol === "WSOL";

      for await (const unsignedTx of tb.redeem(
        senderAddress.address,
        vaa,
        isNativeUnwrap
      )) {
        const latestBlockhash = await connection.getLatestBlockhash(
          "confirmed"
        );
        const innerTx = unsignedTx.transaction.transaction as
          | Transaction
          | VersionedTransaction;
        const signers = unsignedTx.transaction.signers as Keypair[] | undefined;
        const PLACEHOLDER_BLOCKHASH = "11111111111111111111111111111111";

        if (isVersionedTransaction(innerTx)) {
          if (
            !innerTx.message.recentBlockhash ||
            innerTx.message.recentBlockhash === PLACEHOLDER_BLOCKHASH
          ) {
            innerTx.message.recentBlockhash = latestBlockhash.blockhash;
          }
          if (signers?.length) {
            innerTx.sign(signers);
          }
        } else {
          const tx = innerTx;
          if (
            !tx.recentBlockhash ||
            tx.recentBlockhash === PLACEHOLDER_BLOCKHASH
          ) {
            tx.recentBlockhash = latestBlockhash.blockhash;
          }
          if (!tx.feePayer) {
            tx.feePayer = payer;
          }
          if (signers?.length) {
            tx.partialSign(...signers);
          }
        }

        setStatus("signing");
        const signed = await phantom.signTransaction(innerTx);

        setStatus("submitting");
        const sig = await connection.sendRawTransaction(signed.serialize(), {
          skipPreflight: true,
        });

        let confirmed = false;
        for (let attempt = 0; attempt < 60; attempt++) {
          await new Promise((r) => setTimeout(r, 2000));
          const { value } = await connection.getSignatureStatuses([sig]);
          const s = value?.[0];
          if (s?.err) {
            throw new Error(
              `Transaction failed on-chain: ${JSON.stringify(s.err)}`
            );
          }
          if (
            s?.confirmationStatus === "confirmed" ||
            s?.confirmationStatus === "finalized"
          ) {
            confirmed = true;
            break;
          }
        }
        if (!confirmed) {
          throw new Error(
            "Transaction confirmation timed out after 120s. Check Solscan for status: " +
              sig
          );
        }
        setRedeemTxHashes((prev) => [...prev, sig]);
      }

      setStatus("success");
    } catch (err: unknown) {
      setError({
        type: "generic",
        message: err instanceof Error ? err.message : "Redeem failed",
      });
      setStatus("error");
    }
  }, [operation, solanaWallet, phantom]);

  const isLoading = [
    "looking_up",
    "checking_solana",
    "signing",
    "submitting",
  ].includes(status);

  return (
    <div className="mx-auto mt-6 max-w-2xl px-4 pb-40">
      <div className="rounded-2xl border border-osmoverse-600 bg-osmoverse-800 p-6">
        <h2 className="mb-4 text-lg font-semibold text-white-full">
          Redeem a stuck Wormhole transfer
        </h2>
        <p className="mb-4 text-sm text-osmoverse-300">
          If you have a Wormhole bridge transfer from Osmosis that is stuck,
          paste the Osmosis transaction hash below to look it up and complete
          the redemption on Solana (Phantom) or Sui (Slush or Phantom).
        </p>

        {/* TX Hash Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={txHash}
            onChange={(e) => setTxHash(e.target.value)}
            placeholder="Osmosis transaction hash..."
            className="flex-1 rounded-lg border border-osmoverse-600 bg-osmoverse-900 px-4 py-2 text-sm text-white-full placeholder:text-osmoverse-500 focus:border-wosmongton-300 focus:outline-none"
            disabled={isLoading}
          />
          <button
            onClick={lookupTransaction}
            disabled={isLoading || !txHash.trim()}
            className="rounded-lg bg-wosmongton-700 px-4 py-2 text-sm font-medium text-white-full transition-colors hover:bg-wosmongton-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === "looking_up" ? (
              <Spinner className="h-4 w-4" />
            ) : (
              "Lookup"
            )}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 rounded-lg border border-rust-600 bg-rust-800/20 p-3 text-sm text-rust-200">
            {error.type === "phantom_not_installed" ? (
              <>
                Phantom wallet not detected.{" "}
                <a
                  href={PHANTOM_DOWNLOAD_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Install Phantom
                </a>{" "}
                to redeem.
              </>
            ) : error.type === "sui_wallet_not_installed" ? (
              <>
                No supported Sui wallet detected. Install{" "}
                {SUI_WALLET_REGISTRY.map((descriptor, idx) => (
                  <span key={descriptor.id}>
                    <a
                      href={descriptor.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      {descriptor.displayName}
                    </a>
                    {idx < SUI_WALLET_REGISTRY.length - 1 ? " or " : ""}
                  </span>
                ))}{" "}
                to redeem on Sui.
              </>
            ) : (
              error.message
            )}
          </div>
        )}

        {/* Operation Details */}
        {operation && status !== "idle" && status !== "looking_up" && (
          <div className="mt-4 space-y-3">
            <div className="rounded-lg bg-osmoverse-900 p-4">
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <span className="text-osmoverse-400">Token</span>
                <span className="text-right text-white-full">
                  {operation.data.tokenAmount} {operation.data.symbol}
                </span>

                <span className="text-osmoverse-400">Value</span>
                <span className="text-right text-white-full">
                  ~
                  {formatPretty(
                    new PricePretty(
                      DEFAULT_VS_CURRENCY,
                      new Dec(operation.data.usdAmount)
                    )
                  )}
                </span>

                <span className="text-osmoverse-400">From</span>
                <span className="text-right font-mono text-xs text-white-full">
                  {shorten(
                    operation.sourceChain.attribute?.value?.originAddress ||
                      operation.sourceChain.from,
                    { prefixLength: 8, suffixLength: 8 }
                  )}
                </span>

                <span className="text-osmoverse-400">
                  To ({getChainLabel(operation.content.payload.toChain)})
                </span>
                <span className="text-right font-mono text-xs text-white-full">
                  {shorten(operation.content.standarizedProperties.toAddress, {
                    prefixLength: 8,
                    suffixLength: 8,
                  })}
                </span>

                <span className="text-osmoverse-400">Date</span>
                <span className="text-right text-white-full">
                  {new Date(
                    operation.sourceChain.timestamp
                  ).toLocaleDateString()}
                </span>

                {derivedFromOsmosis && resolvedTxHash && (
                  <>
                    <span className="text-osmoverse-400">
                      Wormchain receive
                    </span>
                    <span className="text-right">
                      <a
                        href={`${WORMHOLESCAN_UI}/#/tx/${encodeURIComponent(
                          resolvedTxHash
                        )}?network=Mainnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs text-wosmongton-300 underline"
                      >
                        {shorten(resolvedTxHash, {
                          prefixLength: 8,
                          suffixLength: 8,
                        })}
                      </a>
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Status Badges */}
            {status === "checking_solana" && (
              <div className="flex items-center gap-2 text-sm text-osmoverse-300">
                <Spinner className="h-4 w-4" />
                Checking Solana for redemption status...
              </div>
            )}

            {status === "already_redeemed" &&
              (() => {
                const toChainId = operation.content.payload.toChain;
                const destHash = operation.targetChain?.transaction?.txHash;
                const destExplorerUrl = destHash
                  ? getDestinationExplorerUrl(toChainId, destHash)
                  : null;
                const wormholescanHash =
                  resolvedTxHash ||
                  operation.sourceChain.attribute?.value?.originTxHash ||
                  lookedUpTxHash;
                return (
                  <div className="rounded-lg border border-bullish-600 bg-bullish-600/10 p-3 text-sm text-bullish-200">
                    This transfer has already been redeemed on{" "}
                    {getChainLabel(toChainId)}.
                    {destExplorerUrl ? (
                      <a
                        href={destExplorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-1 underline"
                      >
                        View on{" "}
                        {toChainId === CHAIN_ID.solana ? "Solscan" : "Suiscan"}
                      </a>
                    ) : (
                      <a
                        href={`${WORMHOLESCAN_UI}/#/tx/${encodeURIComponent(
                          wormholescanHash
                        )}?network=Mainnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-1 underline"
                      >
                        View on Wormholescan
                      </a>
                    )}
                  </div>
                );
              })()}

            {status === "ready" &&
              operation.content.payload.toChain === CHAIN_ID.solana && (
                <>
                  {!solanaWallet && (
                    <div className="space-y-3">
                      <div className="rounded-lg border border-ammelia-600 bg-ammelia-600/10 p-3 text-sm text-ammelia-200">
                        VAA is signed and ready. Connect your Solana wallet to
                        redeem.
                      </div>
                      <button
                        onClick={connectWallet}
                        className="w-full rounded-lg bg-wosmongton-700 px-4 py-3 text-sm font-medium text-white-full transition-colors hover:bg-wosmongton-600"
                      >
                        {phantom
                          ? "Connect Phantom Wallet"
                          : "Install Phantom Wallet"}
                      </button>
                    </div>
                  )}

                  {solanaWallet && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between rounded-lg bg-osmoverse-900 p-3 text-sm">
                        <span className="text-osmoverse-400">
                          Connected Wallet
                        </span>
                        <span className="font-mono text-xs text-white-full">
                          {shorten(solanaWallet)}
                        </span>
                      </div>

                      <button
                        onClick={executeRedeem}
                        disabled={isLoading}
                        className="w-full rounded-lg bg-wosmongton-700 px-4 py-3 text-sm font-medium text-white-full transition-colors hover:bg-wosmongton-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Redeem on Solana
                      </button>
                    </div>
                  )}
                </>
              )}

            {status !== "already_redeemed" &&
              status !== "success" &&
              operation.content.payload.toChain === CHAIN_ID.sui &&
              resolvedTxHash && (
                <SuiRedeemPanel
                  operation={operation}
                  wormholescanHash={resolvedTxHash}
                  onCopy={copyToClipboard}
                  copyHint={copyHint}
                  availableSuiWallets={availableSuiWallets}
                  connection={suiConnection}
                  onConnect={connectSui}
                  onRedeem={executeSuiRedeemFlow}
                  isLoading={isLoading}
                  status={status}
                />
              )}

            {status === "ready" &&
              operation.content.payload.toChain !== CHAIN_ID.solana &&
              operation.content.payload.toChain !== CHAIN_ID.sui &&
              resolvedTxHash && (
                <NonSolanaRedeemPanel
                  operation={operation}
                  wormholescanHash={resolvedTxHash}
                  onCopy={copyToClipboard}
                  copyHint={copyHint}
                />
              )}

            {suiRedeemTxDigest && (
              <div
                className={`rounded-lg border p-3 text-sm ${
                  status === "success"
                    ? "border-bullish-600 bg-bullish-600/10 text-bullish-200"
                    : "border-ammelia-600 bg-ammelia-600/10 text-ammelia-200"
                }`}
              >
                {status === "success"
                  ? "Transfer redeemed on Sui."
                  : "Redeem submitted to Sui."}
                <a
                  href={`https://suiscan.xyz/mainnet/tx/${encodeURIComponent(
                    suiRedeemTxDigest
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 underline"
                >
                  View on Suiscan
                </a>
              </div>
            )}

            {(status === "signing" || status === "submitting") && (
              <div className="flex items-center gap-2 text-sm text-osmoverse-300">
                <Spinner className="h-4 w-4" />
                {(() => {
                  const isSui =
                    operation.content.payload.toChain === CHAIN_ID.sui;
                  if (status === "signing") {
                    if (isSui) {
                      return suiConnection
                        ? `Waiting for ${suiConnection.displayName} signature...`
                        : "Waiting for your Sui wallet signature...";
                    }
                    return "Waiting for wallet signature...";
                  }
                  return isSui
                    ? "Submitting transaction to Sui..."
                    : "Submitting transaction to Solana...";
                })()}
              </div>
            )}

            {redeemTxHashes.length > 0 && (
              <div
                className={`rounded-lg border p-3 text-sm ${
                  status === "success"
                    ? "border-bullish-600 bg-bullish-600/10 text-bullish-200"
                    : "border-ammelia-600 bg-ammelia-600/10 text-ammelia-200"
                }`}
              >
                {status === "success"
                  ? "Transfer redeemed successfully!"
                  : `${redeemTxHashes.length} of the redeem transactions confirmed before the error:`}
                {redeemTxHashes.map((hash, i) => (
                  <a
                    key={hash}
                    href={getSolanaExplorerUrl({ hash })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-1 underline"
                  >
                    {redeemTxHashes.length > 1
                      ? `View tx ${i + 1} on Solscan`
                      : "View on Solscan"}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export async function checkIfRedeemed(op: OperationData): Promise<boolean> {
  try {
    const { PublicKey } = await import("@solana/web3.js");

    const emitterChain = op.emitterChain;
    const emitterAddress = Buffer.from(op.emitterAddress.hex, "hex");
    const sequence = BigInt(op.sequence);

    const emitterChainBuf = Buffer.alloc(2);
    emitterChainBuf.writeUInt16BE(emitterChain);

    const sequenceBuf = Buffer.alloc(8);
    sequenceBuf.writeBigUInt64BE(sequence);

    const [claimKey] = PublicKey.findProgramAddressSync(
      [emitterAddress, emitterChainBuf, sequenceBuf],
      new PublicKey(TOKEN_BRIDGE_PROGRAM_ID)
    );

    const res = await fetch(SOLANA_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getAccountInfo",
        params: [claimKey.toBase58(), { encoding: "base64" }],
      }),
    });

    if (!res.ok) return false;
    const json = await res.json();
    return json.result?.value != null;
  } catch {
    return false;
  }
}
