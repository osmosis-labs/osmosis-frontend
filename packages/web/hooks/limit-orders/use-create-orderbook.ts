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
 * inclusion window before re-arming creation. The entry carries the tx hash
 * for reconciliation/debugging, and the fail-closed existence checks (before
 * the wallet prompt AND after approval, immediately before broadcast)
 * backstop the expiry: a landed tx is visible to them by then.
 */
const BROADCASTED_TTL_MS = 1000 * 60 * 10;

type JustCreatedStatus = "pending" | "broadcasted" | "created";
type JustCreatedEntry = {
  t: number;
  s: JustCreatedStatus;
  /** Attempt owner id: only the attempt that wrote a pending/broadcasted
   *  entry may roll it back, so a failed concurrent attempt can never strip
   *  another attempt's protection. */
  o?: string;
  /** Tx hash (hex) once broadcast-accepted, for reconciliation/debugging. */
  h?: string;
};

const TTL_BY_STATUS: Record<JustCreatedStatus, number> = {
  pending: PENDING_TTL_MS,
  broadcasted: BROADCASTED_TTL_MS,
  created: CREATED_TTL_MS,
};

/** created > broadcasted > pending: transitions must be monotonic across
 *  attempts, so a weaker write can never downgrade a stronger entry. */
const STATUS_RANK: Record<JustCreatedStatus, number> = {
  pending: 0,
  broadcasted: 1,
  created: 2,
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
  status: JustCreatedStatus,
  opts?: { owner?: string; txHash?: string }
) {
  const entries = readJustCreatedOrderbooks();
  const key = orderbookPairKey(baseDenom, quoteDenom);
  const existing = entries[key];
  // Monotonic across attempts: never downgrade another attempt's stronger
  // entry (e.g. a concurrent attempt's "created" must not be overwritten by
  // this attempt's "pending"). An attempt may freely re-stamp its own entry
  // (heartbeat) and anyone may upgrade.
  if (
    existing &&
    STATUS_RANK[existing.s] > STATUS_RANK[status] &&
    existing.o !== opts?.owner
  ) {
    return;
  }
  entries[key] = {
    t: Date.now(),
    s: status,
    ...(opts?.owner ? { o: opts.owner } : {}),
    ...(opts?.txHash ? { h: opts.txHash } : {}),
  };
  writeJustCreatedOrderbooks(entries);
}

/** Roll back an in-flight mark, but only the one this attempt owns: a failed
 *  attempt must never strip a concurrent attempt's (stronger) protection. */
function clearJustCreatedOrderbookIfOwned(
  baseDenom: string,
  quoteDenom: string,
  owner: string
) {
  const entries = readJustCreatedOrderbooks();
  const key = orderbookPairKey(baseDenom, quoteDenom);
  const entry = entries[key];
  if (entry && entry.o === owner && entry.s !== "created") {
    delete entries[key];
    writeJustCreatedOrderbooks(entries);
  }
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
 * Serialize an attempt per pair across tabs via the Web Locks API where
 * available (all evergreen browsers). Check-then-mark on the registry is not
 * atomic across tabs, so without this two tabs could both observe an absent
 * pair and both broadcast. `ifAvailable` fails fast: a second confirm while
 * another tab holds the lock (e.g. sitting on its wallet prompt) errors
 * instead of queueing a duplicate behind it. Falls back to the registry-only
 * protection when the API is missing.
 */
async function withPairCreationLock<T>(
  pairKey: string,
  fn: () => Promise<T>
): Promise<T> {
  const locks = typeof navigator !== "undefined" ? navigator.locks : undefined;
  if (!locks) return fn();
  return locks.request(
    `create-orderbook:${pairKey}`,
    { ifAvailable: true },
    async (lock) => {
      if (!lock) {
        throw new Error(
          "An orderbook creation for this pair is already in progress in another tab"
        );
      }
      return fn();
    }
  );
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

  /** Marks the pair created (someone's tx delivered a pool), refreshes
   *  consumers, and lets the flow resolve as success. */
  const settleAsAlreadyCreated = useCallback(async () => {
    markOrderbookJustCreated(baseDenom, quoteDenom, "created");
    await Promise.all([
      apiUtils.edge.orderbooks.getPools.invalidate(),
      apiUtils.edge.orderbooks.verifyOrderbookCreation.invalidate(),
    ]);
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

    const runAttempt = async () => {
      // The registry holds the pair: either a delivered creation whose caches
      // are still catching up, or an in-flight broadcast (this tab or
      // another). Broadcasting again would create a duplicate pool and charge
      // another creation fee, so a re-confirm becomes a cache-refresh retry
      // instead.
      const justCreatedStatus = getJustCreatedStatus(baseDenom, quoteDenom);
      if (justCreatedStatus) {
        setIsCreating(true);
        setError(undefined);
        try {
          const exists = await refreshOrderbookCaches();
          // A delivered ("created") mark proves the pool exists onchain, so
          // the refresh-only confirm is a success even if the sidecar still
          // lags. A "pending" or "broadcasted" mark proves nothing was
          // delivered yet: reporting success would close the modal on a pool
          // that may never exist (e.g. the marking tab closed mid-signing).
          // Reject instead; those marks self-expire, after which a re-confirm
          // broadcasts.
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

      // This attempt's identity in the registry: only the owner may roll its
      // in-flight mark back, so a failed concurrent attempt can never strip
      // protection written by a different (possibly successful) attempt.
      const attemptOwner = `${Date.now().toString(36)}-${Math.random()
        .toString(36)
        .slice(2)}`;

      // Mark the pair before any await so an overlapping confirm (double
      // click, second tab without Web Locks) hits the just-created gate
      // instead of broadcasting a second paid creation while this one is in
      // flight. Upgraded to "broadcasted" on CheckTx acceptance and "created"
      // on delivery; rolled back below only when the attempt provably did not
      // and can no longer land.
      markOrderbookJustCreated(baseDenom, quoteDenom, "pending", {
        owner: attemptOwner,
      });
      // Signing waits on the human, so the wallet prompt can outlive any
      // fixed pending TTL; keep the mark alive while this attempt is
      // genuinely still in flight. Only re-stamps "pending" so it can never
      // downgrade a "broadcasted"/"created" upgrade from the callbacks below.
      const pendingHeartbeat = setInterval(() => {
        if (getJustCreatedStatus(baseDenom, quoteDenom) === "pending") {
          markOrderbookJustCreated(baseDenom, quoteDenom, "pending", {
            owner: attemptOwner,
          });
        }
      }, PENDING_HEARTBEAT_MS);

      let broadcastAccepted = false;
      let existsDiscoveredPreBroadcast = false;
      let deliveredCode: number | undefined;
      let deliveredLog: string | undefined;

      // Fail-closed fresh existence check, run before the wallet prompt and
      // again in onSign after approval. Cannot make creation atomic (nothing
      // onchain enforces pair uniqueness), but bounds the race to roughly a
      // block of sidecar lag.
      const assertPairStillAbsent = async () => {
        const verification =
          await apiUtils.edge.orderbooks.verifyOrderbookCreation.fetch({
            baseDenom,
            quoteDenom,
            fresh: true,
          });
        if (!verification.endpointFunctional) {
          throw new Error(t("errors.uhOhSomethingWentWrong"));
        }
        if (verification.orderbookExists) {
          // Someone else already created this pair: the goal state is
          // reached, so abort the broadcast and settle as success.
          existsDiscoveredPreBroadcast = true;
          throw new Error("Orderbook already exists for this pair");
        }
      };

      try {
        // Early check: avoids pointlessly prompting the wallet when the UI's
        // (LRU-cached, up to 1h stale) gating missed a recent creation.
        await assertPairStillAbsent();

        const osmosis = await getOsmosisCodec();

        const instantiateMsgBytes = new TextEncoder().encode(
          JSON.stringify({
            base_denom: baseDenom,
            quote_denom: quoteDenom,
          })
        );

        const msg = {
          typeUrl: "/osmosis.cosmwasmpool.v1beta1.MsgCreateCosmWasmPool",
          value: osmosis.cosmwasmpool.v1beta1.MsgCreateCosmWasmPool.fromPartial(
            {
              codeId: BigInt(OrderbookPoolCodeIds[0]),
              instantiateMsg: instantiateMsgBytes,
              sender: account.address,
            }
          ),
        };

        await accountStore.signAndBroadcast(
          accountStore.osmosisChainId,
          "createOrderbook",
          [msg],
          undefined,
          undefined,
          undefined,
          {
            onSign: async () => {
              // The wallet approval window is unbounded, so the early check
              // can be arbitrarily stale by the time the user approves.
              // Re-verify after approval, immediately before broadcast; a
              // throw here discards the signed tx without broadcasting it.
              await assertPairStillAbsent();
            },
            onBroadcasted: (txHash) => {
              // CheckTx accepted: the tx is in the mempool and may land even
              // if everything after this point (tracing, refetches) fails, so
              // from here the mark must survive a rejection of the overall
              // flow. The hash is persisted for reconciliation/debugging.
              broadcastAccepted = true;
              markOrderbookJustCreated(baseDenom, quoteDenom, "broadcasted", {
                owner: attemptOwner,
                txHash: Buffer.from(txHash).toString("hex"),
              });
            },
            onFulfill: async (tx) => {
              deliveredCode = tx.code;
              deliveredLog = tx.rawLog;
              if (!tx.code) {
                // Delivery is final: upgrade the in-flight mark so re-confirms
                // and reloads treat the pair as provably created.
                markOrderbookJustCreated(baseDenom, quoteDenom, "created", {
                  owner: attemptOwner,
                });
                // The refresh is best-effort: the creation itself succeeded,
                // so a refetch failure must not reject the flow (callers
                // would show an error and leave the confirm re-armed for a
                // duplicate paid tx).
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
        // signAndBroadcast throws on broadcast (CheckTx) rejection but
        // resolves on a delivered-but-failed tx (non-zero code), so surface
        // that here or callers would treat the failed creation as success.
        if (deliveredCode) {
          throw new Error(deliveredLog || t("errors.uhOhSomethingWentWrong"));
        }
      } catch (e) {
        if (existsDiscoveredPreBroadcast) {
          // The pair exists onchain (created by someone else while this
          // attempt was underway): the goal state is reached without
          // spending a creation fee, so settle as success.
          await settleAsAlreadyCreated();
          return;
        }
        if (deliveredCode) {
          // Delivery is known and failed: this attempt created no pool, so
          // release the pair for a retry. Owner-scoped: a concurrent
          // attempt's stronger entry (e.g. its delivered "created") stays.
          clearJustCreatedOrderbookIfOwned(baseDenom, quoteDenom, attemptOwner);
        } else if (broadcastAccepted) {
          // Accepted but delivery unknown (tx tracing failed): the tx can
          // still land, so the mark must NOT be released or a retry could
          // broadcast a duplicate paid creation. Reconcile against the chain
          // first; if the pool is already visible, the creation in fact
          // succeeded.
          try {
            const exists = await refreshOrderbookCaches();
            if (exists) {
              markOrderbookJustCreated(baseDenom, quoteDenom, "created", {
                owner: attemptOwner,
              });
              return;
            }
          } catch {
            // Keep the "broadcasted" mark; it self-expires well after any
            // plausible inclusion window, and the pre-broadcast checks of a
            // later attempt backstop the expiry.
          }
        } else {
          // Nothing was accepted by the chain (verification fail-closed,
          // sign rejection, or CheckTx failure): roll back this attempt's
          // in-flight mark so the pair can be retried. Owner-scoped, so a
          // concurrent attempt's protection is never stripped.
          clearJustCreatedOrderbookIfOwned(baseDenom, quoteDenom, attemptOwner);
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
    };

    // Serialize the whole attempt (gate check through broadcast) per pair
    // across tabs; see withPairCreationLock.
    try {
      return await withPairCreationLock(
        orderbookPairKey(baseDenom, quoteDenom),
        runAttempt
      );
    } catch (e) {
      // Errors thrown before runAttempt starts (lock unavailable) still need
      // to surface in the modal; runAttempt sets its own messages.
      const message =
        e instanceof Error ? e.message : t("errors.uhOhSomethingWentWrong");
      setError((current) => current ?? message);
      throw e;
    }
  }, [
    account?.address,
    baseDenom,
    quoteDenom,
    accountStore,
    apiUtils,
    refreshOrderbookCaches,
    settleAsAlreadyCreated,
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
