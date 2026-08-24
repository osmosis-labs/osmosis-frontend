import { OrderbookPoolCodeIds } from "@osmosis-labs/server";
import { getOsmosisCodec } from "@osmosis-labs/tx";
import { useCallback, useState } from "react";

import { useTranslation } from "~/hooks/language";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

/** Whether orderbook creation is supported in the current environment (code ID must be known). */
const IS_ORDERBOOK_CREATION_SUPPORTED =
  OrderbookPoolCodeIds.length > 0 && OrderbookPoolCodeIds[0] !== "?";

/**
 * Pairs whose orderbook was created onchain but may not yet be reflected in
 * the canonical pools list (the sidecar ingests per block, so the list can lag
 * the delivered tx; if the post-create refresh loses that race, the stale list
 * can sit in the server LRU for up to its 1h TTL). Consumers that reset UI
 * state, or offer creation, when a pair looks orderbook-less must consult this
 * so they don't undo the user's selection or invite a duplicate paid creation
 * tx during that window. Module-level on purpose: the creation entry points
 * (Limit tab, Pay With / Receive dropdown) live in different component
 * subtrees. Persisted to localStorage so a page reload inside the stale-cache
 * window cannot re-offer creation; entries expire per-status and are cleared
 * early once the canonical list reflects the pair.
 */
const JUST_CREATED_STORAGE_KEY = "just-created-orderbooks";
/** Matches the server orderbook-pools LRU TTL. */
const CREATED_TTL_MS = 1000 * 60 * 60;
/**
 * A live pre-broadcast attempt re-stamps its mark on a heartbeat (signing
 * waits on the human, so the wallet prompt can stay open indefinitely), so a
 * pending mark older than this belongs to an attempt that stopped
 * heartbeating (e.g. tab closed mid-signing) and expires rather than blocking
 * the pair.
 */
const PENDING_TTL_MS = 1000 * 60 * 2;
/** Must be comfortably shorter than PENDING_TTL_MS. */
const PENDING_HEARTBEAT_MS = 1000 * 45;
/**
 * A broadcast-accepted tx normally delivers within a block, but when tx
 * tracing fails delivery is unknown, so the mark outlives any plausible
 * inclusion window before re-arming creation. The pre-broadcast fresh
 * existence check backstops the expiry: by then a landed tx is visible to it.
 */
const BROADCASTED_TTL_MS = 1000 * 60 * 10;

type JustCreatedStatus = "pending" | "broadcasted" | "created";
type JustCreatedEntry = { t: number; s: JustCreatedStatus };

const TTL_BY_STATUS: Record<JustCreatedStatus, number> = {
  pending: PENDING_TTL_MS,
  broadcasted: BROADCASTED_TTL_MS,
  created: CREATED_TTL_MS,
};

// Denoms themselves contain "/" (ibc/..., factory/...), so a joined string is
// ambiguous across pairs; encode the tuple instead. Sorted, because a single
// orderbook serves both orientations of a pair (verifyOrderbookCreation
// matches base and quote swapped), so the reversed orientation must hit the
// same registry entry.
const orderbookPairKey = (baseDenom: string, quoteDenom: string) =>
  JSON.stringify([baseDenom, quoteDenom].sort());

/**
 * In-memory mirror of the persisted registry: when localStorage is
 * unavailable (privacy mode, quota), duplicate protection degrades to
 * session-only instead of disappearing entirely.
 */
let inMemoryJustCreated: Record<string, JustCreatedEntry> = {};

/** @internal Test-only: the in-memory mirror is module state and would
 *  otherwise leak between spec cases. */
export function __resetJustCreatedOrderbooksForTesting() {
  inMemoryJustCreated = {};
}

function isLiveEntry(value: unknown, now: number): value is JustCreatedEntry {
  const entry = value as Partial<JustCreatedEntry> | null;
  if (
    !entry ||
    typeof entry.t !== "number" ||
    (entry.s !== "pending" &&
      entry.s !== "broadcasted" &&
      entry.s !== "created")
  )
    return false;
  return now - entry.t < TTL_BY_STATUS[entry.s];
}

function readJustCreatedOrderbooks(): Record<string, JustCreatedEntry> {
  const now = Date.now();
  let stored: Record<string, unknown> = {};
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(JUST_CREATED_STORAGE_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : {};
      if (parsed && typeof parsed === "object")
        stored = parsed as Record<string, unknown>;
    } catch {
      // Fall through to the in-memory mirror alone.
    }
  }
  const merged: Record<string, JustCreatedEntry> = {};
  for (const [key, value] of [
    ...Object.entries(stored),
    ...Object.entries(inMemoryJustCreated),
  ]) {
    if (!isLiveEntry(value, now)) continue;
    const existing = merged[key];
    // The mirror and storage can disagree (e.g. a write that only reached the
    // mirror); the newer stamp is the truth.
    if (!existing || value.t >= existing.t) merged[key] = value;
  }
  return merged;
}

function writeJustCreatedOrderbooks(entries: Record<string, JustCreatedEntry>) {
  inMemoryJustCreated = entries;
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      JUST_CREATED_STORAGE_KEY,
      JSON.stringify(entries)
    );
  } catch {
    // Quota/privacy-mode failures degrade to the in-memory mirror above:
    // session-only protection, no cross-reload persistence.
  }
}

export function wasOrderbookJustCreated(baseDenom: string, quoteDenom: string) {
  return orderbookPairKey(baseDenom, quoteDenom) in readJustCreatedOrderbooks();
}

function getJustCreatedStatus(
  baseDenom: string,
  quoteDenom: string
): JustCreatedStatus | undefined {
  return readJustCreatedOrderbooks()[orderbookPairKey(baseDenom, quoteDenom)]
    ?.s;
}

function markOrderbookJustCreated(
  baseDenom: string,
  quoteDenom: string,
  status: JustCreatedStatus
) {
  const entries = readJustCreatedOrderbooks();
  entries[orderbookPairKey(baseDenom, quoteDenom)] = {
    t: Date.now(),
    s: status,
  };
  writeJustCreatedOrderbooks(entries);
}

/** Call once the canonical pools list reflects the pair, to re-arm resets. */
export function clearJustCreatedOrderbook(
  baseDenom: string,
  quoteDenom: string
) {
  const entries = readJustCreatedOrderbooks();
  const key = orderbookPairKey(baseDenom, quoteDenom);
  if (key in entries) {
    delete entries[key];
    writeJustCreatedOrderbooks(entries);
  }
}

/**
 * Hook to create a new orderbook pool for a given base/quote denom pair.
 * Sends a MsgCreateCosmWasmPool with the canonical orderbook code ID.
 * After success, invalidates the canonical orderbook pools cache so the
 * new orderbook is reflected in the UI without requiring a page reload.
 */
export function useCreateOrderbook({
  baseDenom,
  quoteDenom,
}: {
  baseDenom: string;
  quoteDenom: string;
}) {
  const { accountStore } = useStore();
  const { t } = useTranslation();
  const apiUtils = api.useUtils();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const account = accountStore.getWallet(accountStore.osmosisChainId);

  const refreshOrderbookCaches = useCallback(async () => {
    // The fresh verify bypasses AND repopulates the server-side
    // orderbook-pools LRU (cachified forceFresh writes the fresh value back,
    // at a short TTL so a still-stale capture can't poison the shared cache
    // for the full window), so it must complete before any client refetches
    // or they would re-cache the pre-creation pool list. The sidecar ingests
    // per block, so the first fresh read can itself still see the
    // pre-creation list; retry briefly until the pair is reflected.
    let orderbookExists = false;
    for (let attempt = 0; attempt < 3; attempt++) {
      const verification =
        await apiUtils.edge.orderbooks.verifyOrderbookCreation.fetch({
          baseDenom,
          quoteDenom,
          fresh: true,
        });
      orderbookExists = verification.orderbookExists;
      if (orderbookExists) break;
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
    // Refetch client caches against the now-fresh server cache: the pools
    // list, and every mounted verifyOrderbookCreation consumer. The consumers
    // query without `fresh`, which is a different react-query key than the
    // imperative fetch above populated, so they need the procedure-level
    // invalidation to pick up the created orderbook.
    await Promise.all([
      apiUtils.edge.orderbooks.getPools.invalidate(),
      apiUtils.edge.orderbooks.verifyOrderbookCreation.invalidate(),
    ]);
    return orderbookExists;
  }, [apiUtils, baseDenom, quoteDenom]);

  const createOrderbook = useCallback(async () => {
    // Precondition violations throw rather than silently resolving: callers
    // treat a resolved createOrderbook as success (close the modal, activate
    // the limit tab), which must never happen when nothing was broadcast.
    // They also surface the generic error so the modal never sits open with
    // a cleared spinner and no explanation.
    if (!account?.address) {
      setError(t("errors.uhOhSomethingWentWrong"));
      throw new Error("Cannot create an orderbook without a connected wallet");
    }
    if (!baseDenom || !quoteDenom) {
      setError(t("errors.uhOhSomethingWentWrong"));
      throw new Error("Cannot create an orderbook without a base/quote pair");
    }
    if (!IS_ORDERBOOK_CREATION_SUPPORTED) {
      setError(t("errors.uhOhSomethingWentWrong"));
      throw new Error(
        "Orderbook creation is not supported in this environment (no code id configured)"
      );
    }

    // The registry holds the pair: either a delivered creation whose caches
    // are still catching up, or an in-flight broadcast (this tab or another).
    // Broadcasting again would create a duplicate pool and charge another
    // creation fee, so a re-confirm becomes a cache-refresh retry instead.
    const justCreatedStatus = getJustCreatedStatus(baseDenom, quoteDenom);
    if (justCreatedStatus) {
      setIsCreating(true);
      setError(undefined);
      try {
        const exists = await refreshOrderbookCaches();
        // A delivered ("created") mark proves the pool exists onchain, so the
        // refresh-only confirm is a success even if the sidecar still lags.
        // A "pending" or "broadcasted" mark proves nothing was delivered yet:
        // reporting success would close the modal on a pool that may never
        // exist (e.g. the marking tab closed mid-signing). Reject instead;
        // those marks self-expire, after which a re-confirm broadcasts.
        if (justCreatedStatus !== "created" && !exists) {
          throw new Error(t("errors.uhOhSomethingWentWrong"));
        }
      } catch (e) {
        const message =
          e instanceof Error ? e.message : t("errors.uhOhSomethingWentWrong");
        setError(message);
        throw e;
      } finally {
        setIsCreating(false);
      }
      return;
    }

    setIsCreating(true);
    setError(undefined);

    // Mark the pair before any await so an overlapping confirm (double click,
    // second tab) hits the just-created gate instead of broadcasting a second
    // paid creation while this one is in flight. Upgraded to "broadcasted" on
    // CheckTx acceptance and "created" on delivery; rolled back below only
    // when the attempt provably did not and can no longer land.
    markOrderbookJustCreated(baseDenom, quoteDenom, "pending");
    // Signing waits on the human, so the wallet prompt can outlive any fixed
    // pending TTL; keep the mark alive while this attempt is genuinely still
    // in flight. Only re-stamps "pending" so it can never downgrade a
    // "broadcasted"/"created" upgrade from the callbacks below.
    const pendingHeartbeat = setInterval(() => {
      if (getJustCreatedStatus(baseDenom, quoteDenom) === "pending") {
        markOrderbookJustCreated(baseDenom, quoteDenom, "pending");
      }
    }, PENDING_HEARTBEAT_MS);

    let broadcastAccepted = false;
    let deliveredCode: number | undefined;
    let deliveredLog: string | undefined;

    try {
      // Fail-closed fresh existence check immediately before signing: the UI
      // entry points gate on the regular (LRU-cached, up to 1h stale)
      // verification, so a pair created by another user since that cache was
      // populated would otherwise still broadcast a duplicate paid creation.
      // This cannot make creation atomic (nothing onchain enforces pair
      // uniqueness), but it closes every race wider than one block.
      const preflight =
        await apiUtils.edge.orderbooks.verifyOrderbookCreation.fetch({
          baseDenom,
          quoteDenom,
          fresh: true,
        });
      if (!preflight.endpointFunctional) {
        throw new Error(t("errors.uhOhSomethingWentWrong"));
      }
      if (preflight.orderbookExists) {
        // Someone else already created this pair: the goal state is reached
        // without broadcasting. Mark it so UI gates hold through cache lag,
        // refresh consumers, and resolve as success.
        markOrderbookJustCreated(baseDenom, quoteDenom, "created");
        await Promise.all([
          apiUtils.edge.orderbooks.getPools.invalidate(),
          apiUtils.edge.orderbooks.verifyOrderbookCreation.invalidate(),
        ]);
        return;
      }

      const osmosis = await getOsmosisCodec();

      const instantiateMsgBytes = new TextEncoder().encode(
        JSON.stringify({
          base_denom: baseDenom,
          quote_denom: quoteDenom,
        })
      );

      const msg = {
        typeUrl: "/osmosis.cosmwasmpool.v1beta1.MsgCreateCosmWasmPool",
        value: osmosis.cosmwasmpool.v1beta1.MsgCreateCosmWasmPool.fromPartial({
          codeId: BigInt(OrderbookPoolCodeIds[0]),
          instantiateMsg: instantiateMsgBytes,
          sender: account.address,
        }),
      };

      await accountStore.signAndBroadcast(
        accountStore.osmosisChainId,
        "createOrderbook",
        [msg],
        undefined,
        undefined,
        undefined,
        {
          onBroadcasted: () => {
            // CheckTx accepted: the tx is in the mempool and may land even if
            // everything after this point (tracing, refetches) fails, so from
            // here the mark must survive a rejection of the overall flow.
            broadcastAccepted = true;
            markOrderbookJustCreated(baseDenom, quoteDenom, "broadcasted");
          },
          onFulfill: async (tx) => {
            deliveredCode = tx.code;
            deliveredLog = tx.rawLog;
            if (!tx.code) {
              // Delivery is final: upgrade the in-flight mark so re-confirms
              // and reloads treat the pair as provably created.
              markOrderbookJustCreated(baseDenom, quoteDenom, "created");
              // The refresh is best-effort: the creation itself succeeded, so a
              // refetch failure must not reject the flow (callers would show an
              // error and leave the confirm re-armed for a duplicate paid tx).
              try {
                await refreshOrderbookCaches();
              } catch (refreshError) {
                console.error(
                  "Orderbook cache refresh failed after creation; caches will heal on their normal cadence",
                  refreshError
                );
              }
            }
          },
        }
      );
      // signAndBroadcast throws on broadcast (CheckTx) rejection but resolves
      // on a delivered-but-failed tx (non-zero code), so surface that here or
      // callers would treat the failed creation as success.
      if (deliveredCode) {
        throw new Error(deliveredLog || t("errors.uhOhSomethingWentWrong"));
      }
    } catch (e) {
      if (deliveredCode) {
        // Delivery is known and failed: no pool exists, so release the pair
        // for a retry.
        clearJustCreatedOrderbook(baseDenom, quoteDenom);
      } else if (broadcastAccepted) {
        // Accepted but delivery unknown (tx tracing failed): the tx can still
        // land, so the mark must NOT be released or a retry could broadcast a
        // duplicate paid creation. Reconcile against the chain first; if the
        // pool is already visible, the creation in fact succeeded.
        try {
          const exists = await refreshOrderbookCaches();
          if (exists) {
            markOrderbookJustCreated(baseDenom, quoteDenom, "created");
            return;
          }
        } catch {
          // Keep the "broadcasted" mark; it self-expires well after any
          // plausible inclusion window.
        }
      } else if (getJustCreatedStatus(baseDenom, quoteDenom) === "pending") {
        // Nothing was accepted by the chain (sign rejection or CheckTx
        // failure): roll back the in-flight mark so the pair can be retried.
        // Only a still-pending mark is rolled back; a "created" entry proves
        // some attempt (possibly another tab's) already delivered a pool and
        // must keep its duplicate-creation protection.
        clearJustCreatedOrderbook(baseDenom, quoteDenom);
      }
      console.error("Error creating orderbook pool", e);
      const message =
        e instanceof Error ? e.message : t("errors.uhOhSomethingWentWrong");
      setError(message);
      throw e;
    } finally {
      clearInterval(pendingHeartbeat);
      setIsCreating(false);
    }
  }, [
    account?.address,
    baseDenom,
    quoteDenom,
    accountStore,
    apiUtils,
    refreshOrderbookCaches,
    t,
  ]);

  return {
    createOrderbook,
    isCreating,
    error,
    canCreate:
      IS_ORDERBOOK_CREATION_SUPPORTED &&
      !!account?.address &&
      !!baseDenom &&
      !!quoteDenom,
  };
}
