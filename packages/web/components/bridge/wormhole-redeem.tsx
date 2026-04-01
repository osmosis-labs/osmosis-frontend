import {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Spinner } from "~/components/loaders";

const WORMHOLESCAN_API = "https://api.wormholescan.io/api/v1";
const SOLANA_RPC = "https://solana-rpc.publicnode.com";

const TOKEN_BRIDGE_PROGRAM_ID = "wormDTUJ6AWPNvk59vGQbDvGJmqbDTdgWgAqcLBCgUb";

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
  | "found"
  | "already_redeemed"
  | "checking_solana"
  | "ready"
  | "signing"
  | "submitting"
  | "success"
  | "error";

function truncateAddress(addr: string, chars = 6): string {
  if (addr.length <= chars * 2 + 3) return addr;
  return `${addr.slice(0, chars)}...${addr.slice(-chars)}`;
}

function formatUsd(val: string): string {
  const n = parseFloat(val);
  if (isNaN(n)) return val;
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });
}

export const WormholeRedeem: FunctionComponent = () => {
  const [txHash, setTxHash] = useState("");
  const [status, setStatus] = useState<RedeemStatus>("idle");
  const [operation, setOperation] = useState<OperationData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [solanaWallet, setSolanaWallet] = useState<string | null>(null);
  const [redeemTxHash, setRedeemTxHash] = useState<string | null>(null);

  const phantom = useMemo(() => {
    if (typeof window === "undefined") return null;
    return (window as any).phantom?.solana ?? (window as any).solana ?? null;
  }, []);

  const lookupTransaction = useCallback(async () => {
    const hash = txHash.trim();
    if (!hash) return;

    setStatus("looking_up");
    setOperation(null);
    setErrorMsg("");
    setRedeemTxHash(null);

    try {
      const res = await fetch(`${WORMHOLESCAN_API}/operations?txHash=${hash}`);
      if (!res.ok) throw new Error(`API returned ${res.status}`);

      const json = await res.json();
      if (!json.operations?.length) {
        throw new Error(
          "Transaction not found. Make sure this is a Wormhole bridge transaction hash."
        );
      }

      const op = json.operations[0] as OperationData;

      if (!op.vaa?.raw) {
        throw new Error(
          "VAA not yet available. The Wormhole guardians may still be processing this transaction."
        );
      }

      if (op.content.payload.toChain !== 1) {
        throw new Error(
          `This transfer's destination is chain ${op.content.payload.toChain}, not Solana (1). This tool only supports Solana redemptions.`
        );
      }

      setOperation(op);

      if (op.targetChain?.status === "completed") {
        setStatus("already_redeemed");
        return;
      }

      setStatus("checking_solana");
      const redeemed = await checkIfRedeemed(op);
      if (redeemed) {
        setStatus("already_redeemed");
      } else {
        setStatus("ready");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to look up transaction");
      setStatus("error");
    }
  }, [txHash]);

  const connectWallet = useCallback(async () => {
    if (!phantom) {
      setErrorMsg(
        "Phantom wallet not detected. Please install Phantom to redeem."
      );
      return;
    }
    try {
      const resp = await phantom.connect();
      setSolanaWallet(resp.publicKey.toString());
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to connect wallet");
    }
  }, [phantom]);

  useEffect(() => {
    if (!phantom) return;
    phantom.on?.("accountChanged", (publicKey: any) => {
      setSolanaWallet(publicKey ? publicKey.toString() : null);
    });
  }, [phantom]);

  const executeRedeem = useCallback(async () => {
    if (!operation || !solanaWallet || !phantom) return;

    setErrorMsg("");

    try {
      setStatus("signing");

      const { Connection, PublicKey } = await import("@solana/web3.js");
      const connection = new Connection(SOLANA_RPC);

      const { wormhole, Wormhole } = await import(
        "@wormhole-foundation/sdk-connect"
      );
      const { default: solana } = await import(
        "@wormhole-foundation/sdk-solana"
      );
      const { deserialize } = await import(
        "@wormhole-foundation/sdk-definitions"
      );

      const wh = await wormhole("Mainnet", [solana], {
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
      const isRecipient =
        solanaWallet.toLowerCase() === recipient.toLowerCase();
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
        const tx = unsignedTx.transaction.transaction as any;
        if (
          !tx.recentBlockhash ||
          tx.recentBlockhash === "11111111111111111111111111111111"
        ) {
          tx.recentBlockhash = latestBlockhash.blockhash;
        }
        if (!tx.feePayer) {
          tx.feePayer = payer;
        }
        const signers = unsignedTx.transaction.signers as any[] | undefined;
        if (signers?.length) {
          for (const signer of signers) {
            if (typeof tx.partialSign === "function") {
              tx.partialSign(signer);
            }
          }
        }

        setStatus("signing");
        const signed = await phantom.signTransaction(tx);

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
        setRedeemTxHash(sig);
      }

      setStatus("success");
    } catch (err: any) {
      setErrorMsg(err.message || "Redeem failed");
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
          the redemption on Solana.
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
        {errorMsg && (
          <div className="mt-4 rounded-lg border border-rust-600 bg-rust-800/20 p-3 text-sm text-rust-200">
            {errorMsg}
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
                  ~{formatUsd(operation.data.usdAmount)}
                </span>

                <span className="text-osmoverse-400">From</span>
                <span className="text-right font-mono text-xs text-white-full">
                  {truncateAddress(
                    operation.sourceChain.attribute?.value?.originAddress ||
                      operation.sourceChain.from,
                    8
                  )}
                </span>

                <span className="text-osmoverse-400">To (Solana)</span>
                <span className="text-right font-mono text-xs text-white-full">
                  {truncateAddress(
                    operation.content.standarizedProperties.toAddress,
                    8
                  )}
                </span>

                <span className="text-osmoverse-400">Date</span>
                <span className="text-right text-white-full">
                  {new Date(
                    operation.sourceChain.timestamp
                  ).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Status Badges */}
            {status === "checking_solana" && (
              <div className="flex items-center gap-2 text-sm text-osmoverse-300">
                <Spinner className="h-4 w-4" />
                Checking Solana for redemption status...
              </div>
            )}

            {status === "already_redeemed" && (
              <div className="rounded-lg border border-bullish-600 bg-bullish-600/10 p-3 text-sm text-bullish-200">
                This transfer has already been redeemed on Solana.
                {operation.targetChain?.transaction?.txHash ? (
                  <a
                    href={`https://solscan.io/tx/${operation.targetChain.transaction.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-1 underline"
                  >
                    View on Solscan
                  </a>
                ) : (
                  <a
                    href={`https://wormholescan.io/#/tx/${encodeURIComponent(
                      operation.sourceChain.attribute?.value?.originTxHash ||
                        txHash
                    )}?network=Mainnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-1 underline"
                  >
                    View on Wormholescan
                  </a>
                )}
              </div>
            )}

            {status === "ready" && !solanaWallet && (
              <div className="space-y-3">
                <div className="rounded-lg border border-ammelia-600 bg-ammelia-600/10 p-3 text-sm text-ammelia-200">
                  VAA is signed and ready. Connect your Solana wallet to redeem.
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

            {status === "ready" && solanaWallet && (
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-osmoverse-900 p-3 text-sm">
                  <span className="text-osmoverse-400">Connected Wallet</span>
                  <span className="font-mono text-xs text-white-full">
                    {truncateAddress(solanaWallet, 6)}
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

            {(status === "signing" || status === "submitting") && (
              <div className="flex items-center gap-2 text-sm text-osmoverse-300">
                <Spinner className="h-4 w-4" />
                {status === "signing"
                  ? "Waiting for wallet signature..."
                  : "Submitting transaction to Solana..."}
              </div>
            )}

            {status === "success" && redeemTxHash && (
              <div className="rounded-lg border border-bullish-600 bg-bullish-600/10 p-3 text-sm text-bullish-200">
                Transfer redeemed successfully!{" "}
                <a
                  href={`https://solscan.io/tx/${redeemTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  View on Solscan
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

async function checkIfRedeemed(op: OperationData): Promise<boolean> {
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
