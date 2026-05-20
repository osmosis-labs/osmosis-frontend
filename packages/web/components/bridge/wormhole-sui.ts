/**
 * Native Sui redemption for Wormhole token-bridge transfers.
 *
 * We do this in-app rather than redirecting because the obvious external
 * destinations (Wormholescan, Portal Bridge) do not support an Osmosis
 * source hash or the Wormchain intermediary lookup — the user would be
 * left holding a copyable VAA with no UI to consume it.
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
 * Wallet integration speaks the Sui Wallet Standard protocol directly
 * (`@mysten/wallet-standard`) so we don't ship a dApp-kit dependency.
 * Supported wallets are Slush (formerly "Sui Wallet") and Phantom
 * (whose multi-chain build registers as a Sui wallet via Wallet
 * Standard); both register via Wallet Standard.
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

export type SuiWalletId = "slush" | "phantom";

/**
 * Allowlisted Wallet Standard descriptors. We allowlist by `wallet.name`
 * and render one connect button per detected wallet rather than
 * auto-connecting to anything advertised on the page: a malicious
 * extension could otherwise register a Wallet Standard wallet with a
 * misleading name and get silently selected.
 *
 * Order matters: we render connect buttons in this order, with Slush
 * first because it is the Mysten-native Sui wallet. Phantom is supported
 * as a secondary option for users who already have it installed for
 * Solana.
 *
 * Each descriptor lists every `wallet.name` we accept. Slush has shipped
 * under multiple names during its rebrand; Phantom only registers as
 * "Phantom".
 */
export interface SuiWalletDescriptor {
  id: SuiWalletId;
  displayName: string;
  walletNames: ReadonlySet<string>;
  downloadUrl: string;
}

export const SUI_WALLET_REGISTRY: readonly SuiWalletDescriptor[] = [
  {
    id: "slush",
    displayName: "Slush",
    walletNames: new Set(["Slush", "Slush — A Sui wallet", "Sui Wallet"]),
    downloadUrl: "https://slush.app/",
  },
  {
    id: "phantom",
    displayName: "Phantom",
    walletNames: new Set(["Phantom"]),
    downloadUrl: "https://phantom.app/",
  },
];

const SUI_WALLET_BY_ID: Record<SuiWalletId, SuiWalletDescriptor> =
  SUI_WALLET_REGISTRY.reduce((acc, descriptor) => {
    acc[descriptor.id] = descriptor;
    return acc;
  }, {} as Record<SuiWalletId, SuiWalletDescriptor>);

type SuiRedeemErrorCode =
  | "wallet_not_installed"
  | "no_sui_account"
  | "unsupported_token"
  | "wallet_mismatch"
  | "wallet_rejected"
  | "rpc_error";

export class SuiRedeemError extends Error {
  /** Stable error code so the UI can branch without string-matching. */
  readonly code: SuiRedeemErrorCode;

  constructor(code: SuiRedeemErrorCode, message: string) {
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

export interface SuiWalletConnection {
  id: SuiWalletId;
  displayName: string;
  wallet: WalletWithRequiredFeatures;
  address: string;
}

export interface AvailableSuiWallet {
  id: SuiWalletId;
  displayName: string;
  wallet: WalletWithRequiredFeatures;
}

/**
 * The single Wallet Standard feature we actually invoke from this
 * module (via `signAndExecuteTransaction` in `@mysten/wallet-standard`).
 * A registration that doesn't advertise this isn't a Sui wallet for
 * our purposes — relevant when a multi-chain wallet like Phantom
 * registers a Solana-only entry under the same `wallet.name`.
 */
const SUI_SIGN_FEATURE = "sui:signAndExecuteTransaction" as const;

function isSuiCapableWallet(wallet: {
  features: Record<string, unknown>;
}): boolean {
  return SUI_SIGN_FEATURE in wallet.features;
}

/** Sui addresses are unambiguously 32-byte `0x`-prefixed hex strings. */
function isSuiHexAddress(address: string): boolean {
  return /^0x[0-9a-f]{64}$/i.test(address);
}

function findWalletByDescriptor(
  wallets: readonly { name: string; features?: Record<string, unknown> }[],
  descriptor: SuiWalletDescriptor
): WalletWithRequiredFeatures | undefined {
  return wallets.find(
    (w) =>
      descriptor.walletNames.has(w.name) &&
      isSuiCapableWallet({ features: w.features ?? {} })
  ) as WalletWithRequiredFeatures | undefined;
}

/**
 * Snapshot the currently registered Sui wallets that match our
 * allowlist, in registry order (Slush first, Phantom second). Useful
 * for rendering a one-button-per-wallet picker. Returns an empty
 * array in non-browser environments so SSR doesn't blow up.
 */
export function listAvailableSuiWallets(): AvailableSuiWallet[] {
  if (typeof window === "undefined") return [];
  const walletsApi = getWallets();
  const allWallets = walletsApi.get();
  const result: AvailableSuiWallet[] = [];
  for (const descriptor of SUI_WALLET_REGISTRY) {
    const wallet = findWalletByDescriptor(allWallets, descriptor);
    if (wallet) {
      result.push({
        id: descriptor.id,
        displayName: descriptor.displayName,
        wallet,
      });
    }
  }
  return result;
}

/**
 * Subscribe to Wallet Standard register/unregister events so the UI
 * picks up wallets that load after the widget mounts. Returns an
 * unsubscribe function. The callback fires once immediately with the
 * current snapshot so callers don't have to also poll separately.
 */
export function subscribeToAvailableSuiWallets(
  callback: (wallets: AvailableSuiWallet[]) => void
): () => void {
  if (typeof window === "undefined") return () => {};
  const walletsApi = getWallets();
  const notify = () => callback(listAvailableSuiWallets());
  const unsubRegister = walletsApi.on("register", notify);
  const unsubUnregister = walletsApi.on("unregister", notify);
  notify();
  return () => {
    unsubRegister();
    unsubUnregister();
  };
}

/**
 * Locate the requested Sui wallet via Wallet Standard and request a
 * connection. Throws `wallet_not_installed` if no compatible wallet
 * is registered for the given id, or `no_sui_account` if the wallet
 * connected but has no Sui-mainnet accounts to choose from.
 *
 * `preferredAddress` (typically the VAA recipient) lets us pick the
 * account that will actually be authorised to pay gas without forcing
 * a wallet-side switch when the user has multiple Sui accounts.
 */
export async function connectSuiWallet(
  walletId: SuiWalletId,
  preferredAddress?: string
): Promise<SuiWalletConnection> {
  if (typeof window === "undefined") {
    throw new SuiRedeemError(
      "wallet_not_installed",
      "Sui wallet detection is only available in the browser."
    );
  }

  const descriptor = SUI_WALLET_BY_ID[walletId];
  if (!descriptor) {
    throw new SuiRedeemError(
      "wallet_not_installed",
      `Unknown Sui wallet id: ${walletId}`
    );
  }

  const walletsApi = getWallets();
  const allWallets = walletsApi.get();
  const wallet = findWalletByDescriptor(allWallets, descriptor);

  if (!wallet) {
    throw new SuiRedeemError(
      "wallet_not_installed",
      `${descriptor.displayName} wallet was not detected. Install the ${descriptor.displayName} extension and refresh.`
    );
  }

  const connectFeature = wallet.features["standard:connect"];
  if (!connectFeature) {
    throw new SuiRedeemError(
      "wallet_not_installed",
      `${descriptor.displayName} wallet is missing the standard:connect feature.`
    );
  }

  try {
    await connectFeature.connect();
  } catch (err) {
    throw new SuiRedeemError(
      "wallet_rejected",
      err instanceof Error
        ? err.message
        : `${descriptor.displayName} rejected the connection.`
    );
  }

  if (wallet.accounts.length === 0) {
    throw new SuiRedeemError(
      "wallet_rejected",
      `${descriptor.displayName} returned no accounts. Unlock the wallet and try again.`
    );
  }

  // Multi-chain wallets (notably Phantom) put their Solana / BTC / EVM
  // accounts into the same Wallet Standard `accounts` array as Sui ones,
  // and may list a non-Sui account at index 0. Picking that blindly and
  // feeding it through `normalizeSuiAddress` produces a malformed
  // "0x00…<base58-blob>" address and a confusing mismatch error.
  //
  // We accept an account either if it advertises `sui:mainnet` in its
  // `chains` tag (Slush's canonical behaviour) OR if the address itself
  // is a 32-byte `0x`-prefixed hex string. Phantom doesn't populate the
  // per-account `chains` array for its Sui account in some builds, but
  // its Sui address is still the unambiguous discriminator: Solana
  // (base58), Bitcoin (bech32) and Ethereum (20-byte hex) addresses
  // never match the 64-hex-char Sui shape. See live repro tx
  // D70648F68D1DC6A8E663D3A0841A7037D9D786AEE755F89735ACD04E5F576562.
  const suiAccounts = wallet.accounts.filter(
    (a) => a.chains.includes(SUI_MAINNET_CHAIN) || isSuiHexAddress(a.address)
  );
  if (suiAccounts.length === 0) {
    throw new SuiRedeemError(
      "no_sui_account",
      `${descriptor.displayName} is connected but does not expose a Sui mainnet account. Create or enable one in ${descriptor.displayName} and try again.`
    );
  }

  // Prefer the account that matches the VAA recipient, so users with
  // multiple Sui accounts don't have to manually switch in the wallet
  // before the redeem succeeds.
  const normalizedPreferred = preferredAddress
    ? normalizeSuiAddress(preferredAddress)
    : null;
  const chosen =
    (normalizedPreferred
      ? suiAccounts.find(
          (a) => normalizeSuiAddress(a.address) === normalizedPreferred
        )
      : undefined) ?? suiAccounts[0];

  return {
    id: descriptor.id,
    displayName: descriptor.displayName,
    wallet,
    address: chosen.address,
  };
}

/**
 * End-to-end Sui redeem against a Wallet-Standard-compliant wallet
 * (Slush or Phantom). Caller is expected to have already verified the
 * connected wallet address matches the VAA recipient (we do it here
 * too as a defensive check).
 *
 * Returns the Sui transaction digest on success.
 */
export async function executeSuiRedeem({
  vaaBase64,
  recipient,
  tokenChain,
  tokenAddressHex,
  connection,
  suiClient,
}: {
  vaaBase64: string;
  recipient: string;
  tokenChain: number;
  tokenAddressHex: string;
  connection: SuiWalletConnection;
  suiClient?: SuiClientLike;
}): Promise<string> {
  const normalizedRecipient = normalizeSuiAddress(recipient);
  const normalizedSender = normalizeSuiAddress(connection.address);
  if (normalizedRecipient !== normalizedSender) {
    throw new SuiRedeemError(
      "wallet_mismatch",
      `Connected ${connection.displayName} account (${normalizedSender}) is not the VAA recipient (${normalizedRecipient}). Redemption credits the recipient regardless, but ${connection.displayName} will refuse to pay gas for a stranger's claim. Switch accounts in your wallet.`
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
  tx.setSender(connection.address);

  const { signAndExecuteTransaction } = await import("@mysten/wallet-standard");

  // The wallet may have switched accounts (or locked entirely) between
  // `connectSuiWallet()` and now, so re-resolve the account before
  // signing instead of trusting the cached one with a non-null
  // assertion.
  const account = connection.wallet.accounts.find(
    (a) => a.address === connection.address
  );
  if (!account) {
    throw new SuiRedeemError(
      "wallet_rejected",
      `The connected ${connection.displayName} account is no longer available. Reconnect and try again.`
    );
  }
  // Defense-in-depth: even though we filter at connect time, a
  // multi-chain wallet could have swapped its `accounts` array since
  // then. Mirror the same accept-either-chain-tag-or-Sui-hex-shape
  // logic; signing on a non-Sui account would surface a confusing
  // wallet-side error.
  if (
    !account.chains.includes(SUI_MAINNET_CHAIN) &&
    !isSuiHexAddress(account.address)
  ) {
    throw new SuiRedeemError(
      "no_sui_account",
      `The connected ${connection.displayName} account no longer looks like a Sui account. Reconnect with a Sui account in ${connection.displayName} and try again.`
    );
  }

  let digest: string;
  try {
    const result = await signAndExecuteTransaction(connection.wallet, {
      transaction: tx,
      account,
      chain: SUI_MAINNET_CHAIN,
    });
    digest = result.digest;
  } catch (err) {
    throw new SuiRedeemError(
      "wallet_rejected",
      err instanceof Error
        ? err.message
        : `${connection.displayName} rejected the signature.`
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
