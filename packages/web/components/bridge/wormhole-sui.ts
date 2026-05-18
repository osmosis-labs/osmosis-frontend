/**
 * Native Sui redemption for Wormhole token-bridge transfers.
 *
 * We deliberately avoid pulling in `@wormhole-foundation/sdk-sui` or any
 * dApp-kit dependencies so the attack surface stays small. The flow is
 * the same five Move calls the official SDK builds:
 *
 *   1. wormhole::vaa::parse_and_verify
 *   2. token_bridge::vaa::verify_only_once
 *   3. token_bridge::complete_transfer::authorize_transfer<CoinType>
 *   4. token_bridge::complete_transfer::redeem_relayer_payout<CoinType>
 *   5. token_bridge::coin_utils::return_nonzero<CoinType>
 *
 * Package IDs are resolved dynamically from each state object's
 * `upgrade_cap.fields.package`, so we don't have to redeploy this
 * widget on Wormhole contract upgrades.
 *
 * Wallet integration is Slush-only via the Wallet Standard protocol
 * (`@mysten/wallet-standard`). Slush is the rebrand of the Mysten Labs
 * "Sui Wallet" extension; older builds still register under the legacy
 * name so we accept both.
 */

import type { WalletWithRequiredFeatures } from "@mysten/wallet-standard";
import { getWallets } from "@mysten/wallet-standard";

export const SUI_RPC = "https://fullnode.mainnet.sui.io:443";
export const SUI_MAINNET_CHAIN = "sui:mainnet" as const;
export const SUI_CLOCK_OBJECT_ID = "0x6";

/**
 * Wormhole Sui mainnet state object IDs.
 * Verified against https://wormhole.com/docs/products/reference/contract-addresses
 * (Core Bridge & Token Bridge / Wrapped Token Transfers rows for Sui mainnet).
 *
 * Package IDs are read from these state objects at runtime so this
 * widget keeps working across Wormhole contract upgrades.
 */
export const WORMHOLE_SUI_CORE_STATE =
  "0xaeab97f96cf9877fee2883315d459552b2b921edc16d7ceac6eab944dd88919c";
export const WORMHOLE_SUI_TOKEN_BRIDGE_STATE =
  "0xc57508ee0d4595e5a8728974a4a93a787d38f339757230d441e895422c07aba9";

/**
 * Wormhole-canonical 32-byte representation of known native Sui coin
 * types. The token bridge stores a mapping from these to the actual
 * Move CoinType under a dynamic field on the bridge state, but the
 * forward lookup requires a non-trivial RPC dance and is rarely needed:
 * almost every Osmosis→Sui gateway transfer is unwrapping SUI itself.
 *
 * For other tokens we degrade gracefully: the user is told this widget
 * only supports SUI native redemption and is sent back to the generic
 * Wormholescan-link panel.
 *
 * To add a new token here, look up its `tokenAddress` in the
 * Wormholescan operation payload and the matching Sui CoinType.
 */
export const KNOWN_SUI_COIN_TYPES: Record<string, string> = {
  "0x9258181f5ceac8dbffb7030890243caed69a9599d2886d957a9cb7656af3bdb3":
    "0x2::sui::SUI",
};

const SLUSH_WALLET_NAMES = new Set([
  "Slush",
  "Slush — A Sui wallet",
  "Sui Wallet",
]);

export class SuiRedeemError extends Error {
  /** Stable error code so the UI can branch without string-matching. */
  readonly code:
    | "slush_not_installed"
    | "unsupported_token"
    | "wallet_mismatch"
    | "wallet_rejected"
    | "rpc_error";

  constructor(
    code:
      | "slush_not_installed"
      | "unsupported_token"
      | "wallet_mismatch"
      | "wallet_rejected"
      | "rpc_error",
    message: string
  ) {
    super(message);
    this.code = code;
    this.name = "SuiRedeemError";
  }
}

export interface SuiPackageIds {
  corePackageId: string;
  tokenBridgePackageId: string;
}

/**
 * Minimal structural type so the tests can stub the Sui client without
 * importing all of `@mysten/sui`. The real `SuiClient` satisfies this.
 */
export interface SuiClientLike {
  getObject(input: {
    id: string;
    options: { showContent: true };
  }): Promise<unknown>;
  waitForTransaction(input: {
    digest: string;
    timeout?: number;
  }): Promise<unknown>;
}

/**
 * Read the current package IDs out of each Wormhole state object.
 * On Sui, package upgrades produce a new package ID; the state's
 * `upgrade_cap.fields.package` is the canonical pointer to the
 * currently active version.
 */
export async function getSuiPackageIds(
  client: Pick<SuiClientLike, "getObject">
): Promise<SuiPackageIds> {
  const [coreState, tokenBridgeState] = await Promise.all([
    client.getObject({
      id: WORMHOLE_SUI_CORE_STATE,
      options: { showContent: true },
    }),
    client.getObject({
      id: WORMHOLE_SUI_TOKEN_BRIDGE_STATE,
      options: { showContent: true },
    }),
  ]);

  const extract = (response: unknown, label: string): string => {
    const data = (response as { data?: { content?: unknown } } | undefined)
      ?.data;
    const content = data?.content as
      | {
          dataType?: string;
          fields?: { upgrade_cap?: { fields?: { package?: string } } };
        }
      | undefined;
    if (content?.dataType !== "moveObject") {
      throw new SuiRedeemError(
        "rpc_error",
        `Could not read ${label} state object (got dataType=${
          content?.dataType ?? "undefined"
        })`
      );
    }
    const pkg = content.fields?.upgrade_cap?.fields?.package;
    if (typeof pkg !== "string" || !pkg.startsWith("0x")) {
      throw new SuiRedeemError(
        "rpc_error",
        `Could not read current ${label} package id from state object`
      );
    }
    return pkg;
  };

  return {
    corePackageId: extract(coreState, "core bridge"),
    tokenBridgePackageId: extract(tokenBridgeState, "token bridge"),
  };
}

/**
 * Normalize a Sui 32-byte hex string to a `0x`-prefixed lowercase form,
 * removing any leading zeros that Wormholescan sometimes strips.
 */
export function normalizeSuiAddress(hex: string): string {
  const stripped = hex.toLowerCase().replace(/^0x/, "");
  const padded = stripped.padStart(64, "0");
  return `0x${padded}`;
}

/**
 * Resolve the Sui Move CoinType for a Wormhole token (chain + 32-byte
 * address). Currently only known native mappings are supported; for
 * anything else we throw `unsupported_token` so the UI can fall back
 * to the generic Wormholescan-link panel.
 */
export function getCoinTypeForSuiVAA(
  tokenChain: number,
  tokenAddressHex: string
): string {
  const normalized = normalizeSuiAddress(tokenAddressHex);
  const coinType = KNOWN_SUI_COIN_TYPES[normalized];
  if (coinType) return coinType;

  throw new SuiRedeemError(
    "unsupported_token",
    `This widget can natively redeem SUI but not the token at ${normalized} (chain ${tokenChain}). Use Wormholescan / Portal Bridge for other tokens.`
  );
}

/** Decode a base64-encoded VAA into raw bytes. */
export function decodeBase64Vaa(vaaBase64: string): Uint8Array {
  return Uint8Array.from(atob(vaaBase64), (c) => c.charCodeAt(0));
}

/**
 * Build the Sui `Transaction` that completes a Wormhole token-bridge
 * transfer. This mirrors `redeemOnSui` from the v1 Wormhole SDK
 * (`@certusone/wormhole-sdk`) but uses the v2 `@mysten/sui` builder.
 */
export async function buildSuiRedeemTransaction({
  vaaBase64,
  coinType,
  packageIds,
}: {
  vaaBase64: string;
  coinType: string;
  packageIds: SuiPackageIds;
}): Promise<import("@mysten/sui/transactions").Transaction> {
  const { Transaction } = await import("@mysten/sui/transactions");
  const tx = new Transaction();
  const vaaBytes = decodeBase64Vaa(vaaBase64);

  const [verifiedVaa] = tx.moveCall({
    target: `${packageIds.corePackageId}::vaa::parse_and_verify`,
    arguments: [
      tx.object(WORMHOLE_SUI_CORE_STATE),
      tx.pure.vector("u8", vaaBytes),
      tx.object(SUI_CLOCK_OBJECT_ID),
    ],
  });

  const [tokenBridgeMessage] = tx.moveCall({
    target: `${packageIds.tokenBridgePackageId}::vaa::verify_only_once`,
    arguments: [tx.object(WORMHOLE_SUI_TOKEN_BRIDGE_STATE), verifiedVaa],
  });

  const [relayerReceipt] = tx.moveCall({
    target: `${packageIds.tokenBridgePackageId}::complete_transfer::authorize_transfer`,
    arguments: [tx.object(WORMHOLE_SUI_TOKEN_BRIDGE_STATE), tokenBridgeMessage],
    typeArguments: [coinType],
  });

  const [coins] = tx.moveCall({
    target: `${packageIds.tokenBridgePackageId}::complete_transfer::redeem_relayer_payout`,
    arguments: [relayerReceipt],
    typeArguments: [coinType],
  });

  tx.moveCall({
    target: `${packageIds.tokenBridgePackageId}::coin_utils::return_nonzero`,
    arguments: [coins],
    typeArguments: [coinType],
  });

  return tx;
}

export interface SlushConnection {
  wallet: WalletWithRequiredFeatures;
  address: string;
}

/**
 * Locate the Slush wallet (formerly "Sui Wallet") and request a
 * connection. Throws `slush_not_installed` if the user has no
 * compatible Sui wallet registered via Wallet Standard.
 */
export async function connectSlush(): Promise<SlushConnection> {
  if (typeof window === "undefined") {
    throw new SuiRedeemError(
      "slush_not_installed",
      "Slush wallet detection is only available in the browser."
    );
  }

  const walletsApi = getWallets();
  const allWallets = walletsApi.get();
  const slush = allWallets.find((w) => SLUSH_WALLET_NAMES.has(w.name)) as
    | WalletWithRequiredFeatures
    | undefined;

  if (!slush) {
    throw new SuiRedeemError(
      "slush_not_installed",
      "Slush wallet was not detected. Install the Slush extension and refresh."
    );
  }

  const connectFeature = slush.features["standard:connect"];
  if (!connectFeature) {
    throw new SuiRedeemError(
      "slush_not_installed",
      "Slush wallet is missing the standard:connect feature."
    );
  }

  try {
    await connectFeature.connect();
  } catch (err) {
    throw new SuiRedeemError(
      "wallet_rejected",
      err instanceof Error ? err.message : "Slush rejected the connection."
    );
  }

  const account = slush.accounts[0];
  if (!account) {
    throw new SuiRedeemError(
      "wallet_rejected",
      "Slush returned no accounts. Unlock the wallet and try again."
    );
  }

  return { wallet: slush, address: account.address };
}

/**
 * End-to-end Sui redeem against Slush. Caller is expected to have
 * already verified the connected wallet address matches the VAA
 * recipient (we do it here too as a defensive check).
 *
 * Returns the Sui transaction digest on success.
 */
export async function executeSuiRedeem({
  vaaBase64,
  recipient,
  tokenChain,
  tokenAddressHex,
  slush,
  suiClient,
}: {
  vaaBase64: string;
  recipient: string;
  tokenChain: number;
  tokenAddressHex: string;
  slush: SlushConnection;
  suiClient?: SuiClientLike;
}): Promise<string> {
  const normalizedRecipient = normalizeSuiAddress(recipient);
  const normalizedSlush = normalizeSuiAddress(slush.address);
  if (normalizedRecipient !== normalizedSlush) {
    throw new SuiRedeemError(
      "wallet_mismatch",
      `Connected Slush account (${normalizedSlush}) is not the VAA recipient (${normalizedRecipient}). Redemption credits the recipient regardless, but Slush will refuse to pay gas for a stranger's claim. Switch accounts in Slush.`
    );
  }

  const coinType = getCoinTypeForSuiVAA(tokenChain, tokenAddressHex);

  // Lazy-load the Sui client only when we actually redeem.
  let client: SuiClientLike;
  if (suiClient) {
    client = suiClient;
  } else {
    const { SuiClient } = await import("@mysten/sui/client");
    client = new SuiClient({ url: SUI_RPC }) as SuiClientLike;
  }

  const packageIds = await getSuiPackageIds(client);
  const tx = await buildSuiRedeemTransaction({
    vaaBase64,
    coinType,
    packageIds,
  });
  tx.setSender(slush.address);

  const { signAndExecuteTransaction } = await import("@mysten/wallet-standard");

  let digest: string;
  try {
    const result = await signAndExecuteTransaction(slush.wallet, {
      transaction: tx,
      account: slush.wallet.accounts.find((a) => a.address === slush.address)!,
      chain: SUI_MAINNET_CHAIN,
    });
    digest = result.digest;
  } catch (err) {
    throw new SuiRedeemError(
      "wallet_rejected",
      err instanceof Error ? err.message : "Slush rejected the signature."
    );
  }

  try {
    await client.waitForTransaction({ digest, timeout: 60_000 });
  } catch {
    // Confirmation failure isn't necessarily fatal — the digest is
    // already on-chain at this point. Surface it but don't error.
  }

  return digest;
}

export const __testables = {
  SLUSH_WALLET_NAMES,
};
