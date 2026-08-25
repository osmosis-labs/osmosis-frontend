import { OrderbookPoolCodeIds } from "@osmosis-labs/server";
import { AccountStoreNoBroadcastErrorEvent } from "@osmosis-labs/stores";
import { getOsmosisCodec } from "@osmosis-labs/tx";
import { useCallback, useState } from "react";

import { useTranslation } from "~/hooks/language";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

/** Whether orderbook creation is supported in the current environment (code ID must be known). */
const IS_ORDERBOOK_CREATION_SUPPORTED =
  OrderbookPoolCodeIds.length > 0 && OrderbookPoolCodeIds[0] !== "?";

/**
 * Registry of pairs whose orderbook was created onchain but may not yet be
 * reflected in the canonical pools list (the sidecar ingests per block, so
 * the list can lag the delivered tx; if the post-create refresh loses that
 * race, the stale list can sit in the server LRU for up to its 1h TTL).
 * Consumers that reset UI state, or offer creation, when a pair looks
 * orderbook-less must consult this so they don't undo the user's selection or
 * invite a duplicate paid creation tx during that window. Module-level on
 * purpose: the creation entry points (Limit tab, Pay With / Receive dropdown)
 * live in different component subtrees. Persisted to localStorage so a page
 * reload inside the stale-cache window cannot re-offer creation; entries
 * expire per-status and are cleared early once the canonical list reflects
 * the pair.
 *
 * One storage key PER PAIR: concurrent attempts for different pairs must not
 * share a read-modify-write over one aggregated map, or the later write drops
 * the other pair's entry (the Web Lock serializing attempts is per pair, so
 * cross-pair concurrency is allowed).
 */
const JUST_CREATED_KEY_PREFIX = "just-created-orderbook:";
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
 * Broadcasted entries never expire at read time and are never released on
 * elapsed time: an accepted tx's validity is block-height based, direct
 * signing encodes no timeout height at all, and a chain halt can stall
 * heights indefinitely, so no wall-clock interval proves the tx can no longer
 * land. An entry is released only by proof from the node's tx endpoint — the
 * tx delivered (settle as success) or delivered-and-failed (release for a
 * fresh attempt). The residual cost is deliberate: a broadcast-accepted tx
 * that vanishes without ever being indexed keeps its pair uncreatable from
 * this browser, which only wastes a retry opportunity, never a second fee.
 */
const BROADCASTED_RETENTION_MS = Number.POSITIVE_INFINITY;

type JustCreatedStatus = "pending" | "broadcasted" | "created";
type JustCreatedEntry = {
  t: number;
  s: JustCreatedStatus;
  /** Attempt owner id: only the attempt that wrote a pending/broadcasted
   *  entry may roll it back or restamp it, so a failed concurrent attempt can
   *  never strip or take over another attempt's protection. */
  o?: string;
  /** Tx hash (hex) once broadcast-accepted; reconciled against the node
   *  before the pair is ever released for another attempt. */
  h?: string;
};

const TTL_BY_STATUS: Record<JustCreatedStatus, number> = {
  pending: PENDING_TTL_MS,
  broadcasted: BROADCASTED_RETENTION_MS,
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

const storageKeyFor = (pairKey: string) =>
  `${JUST_CREATED_KEY_PREFIX}${pairKey}`;

/**
 * In-memory mirror of the persisted registry (keyed by pair key): when
 * localStorage is unavailable (privacy mode, quota), duplicate protection
 * degrades to session-only instead of disappearing entirely.
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

function readJustCreatedEntry(pairKey: string): JustCreatedEntry | undefined {
  const now = Date.now();
  let stored: unknown;
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(storageKeyFor(pairKey));
      stored = raw ? JSON.parse(raw) : undefined;
    } catch {
      // Fall through to the in-memory mirror alone.
    }
  }
  // The mirror and storage can disagree (e.g. a write that only reached the
  // mirror, or another tab's write this tab's mirror never saw). The stronger
  // status is the truth — statuses only ever upgrade, and timestamps can
  // collide within a millisecond — with the newer stamp as tie-break.
  const candidates = [stored, inMemoryJustCreated[pairKey]].filter(
    (value): value is JustCreatedEntry => isLiveEntry(value, now)
  );
  if (candidates.length === 0) return undefined;
  return candidates.reduce((a, b) => {
    if (STATUS_RANK[b.s] !== STATUS_RANK[a.s]) {
      return STATUS_RANK[b.s] > STATUS_RANK[a.s] ? b : a;
    }
    return b.t >= a.t ? b : a;
  });
}

function writeJustCreatedEntry(
  pairKey: string,
  entry: JustCreatedEntry | undefined
) {
  if (entry) inMemoryJustCreated[pairKey] = entry;
  else delete inMemoryJustCreated[pairKey];
  if (typeof window === "undefined") return;
  try {
    if (entry) {
      window.localStorage.setItem(
        storageKeyFor(pairKey),
        JSON.stringify(entry)
      );
    } else {
      window.localStorage.removeItem(storageKeyFor(pairKey));
    }
  } catch {
    // Quota/privacy-mode failures degrade to the in-memory mirror above:
    // session-only protection, no cross-reload persistence.
  }
}

export function wasOrderbookJustCreated(baseDenom: string, quoteDenom: string) {
  return !!readJustCreatedEntry(orderbookPairKey(baseDenom, quoteDenom));
}

function markOrderbookJustCreated(
  baseDenom: string,
  quoteDenom: string,
  status: JustCreatedStatus,
  opts?: { owner?: string; txHash?: string }
) {
  const pairKey = orderbookPairKey(baseDenom, quoteDenom);
  const existing = readJustCreatedEntry(pairKey);
  // Ownership is monotonic across attempts: a write may replace a foreign
  // entry only by strictly upgrading it. This blocks both downgrades (a
  // "pending" over a concurrent attempt's "created") and equal-rank takeovers
  // (a second attempt's "broadcasted" replacing another owner's "broadcasted"
  // and its tx hash, then deleting it on its own failure).
  if (
    existing &&
    existing.o !== opts?.owner &&
    STATUS_RANK[existing.s] >= STATUS_RANK[status]
  ) {
    return;
  }
  writeJustCreatedEntry(pairKey, {
    t: Date.now(),
    s: status,
    ...(opts?.owner ? { o: opts.owner } : {}),
    ...(opts?.txHash ? { h: opts.txHash } : {}),
  });
}

/** Roll back an in-flight mark, but only the one this attempt owns: a failed
 *  attempt must never strip a concurrent attempt's (stronger) protection. */
function clearJustCreatedOrderbookIfOwned(
  baseDenom: string,
  quoteDenom: string,
  owner: string
) {
  const pairKey = orderbookPairKey(baseDenom, quoteDenom);
  const entry = readJustCreatedEntry(pairKey);
  if (entry && entry.o === owner && entry.s !== "created") {
    writeJustCreatedEntry(pairKey, undefined);
  }
}

/** Call once the canonical pools list reflects the pair, to re-arm resets. */
export function clearJustCreatedOrderbook(
  baseDenom: string,
  quoteDenom: string
) {
  writeJustCreatedEntry(orderbookPairKey(baseDenom, quoteDenom), undefined);
}

/**
 * Serialize an attempt per pair across tabs via the Web Locks API where
 * available (all evergreen browsers). Check-then-mark on the registry is not
 * atomic across tabs, so without this two tabs could both observe an absent
 * pair and both broadcast. `ifAvailable` fails fast: a second confirm while
 * another tab holds the lock (e.g. sitting on its wallet prompt) errors
 * instead of queueing a duplicate behind it. Falls back to the registry-only
 * protection (owner-scoped, monotonic marks) when the API is missing.
 */
async function withPairCreationLock<T>(
  pairKey: string,
  lockUnavailableMessage: string,
  fn: () => Promise<T>
): Promise<T> {
  const locks = typeof navigator !== "undefined" ? navigator.locks : undefined;
  if (!locks) return fn();
  return locks.request(
    `create-orderbook:${pairKey}`,
    { ifAvailable: true },
    async (lock) => {
      if (!lock) {
        // Surfaced directly in the confirm modal, so it must be localized.
        throw new Error(lockUnavailableMessage);
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

  /**
   * Delivery outcome of a broadcast-accepted tx, from the node's tx endpoint
   * (authoritative for delivery, unlike the SQS-derived pool list which can
   * lag indexing). "unknown" covers both not-yet-indexed and lookup failure —
   * the safe direction, since callers keep the pair's protection.
   */
  const fetchBroadcastedTxOutcome = useCallback(
    async (txHash: string): Promise<"delivered" | "failed" | "unknown"> => {
      try {
        const res =
          await apiUtils.edge.orderbooks.getCreateOrderbookTxStatus.fetch({
            txHash,
          });
        if (res.status === "delivered") return "delivered";
        if (res.status === "failed") return "failed";
        return "unknown";
      } catch {
        return "unknown";
      }
    },
    [apiUtils]
  );

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

    const broadcastCreation = async () => {
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
      // genuinely still in flight. Only re-stamps this attempt's own
      // "pending" so it can never downgrade or take over another entry.
      const pendingHeartbeat = setInterval(() => {
        const entry = readJustCreatedEntry(
          orderbookPairKey(baseDenom, quoteDenom)
        );
        if (entry?.s === "pending" && entry.o === attemptOwner) {
          markOrderbookJustCreated(baseDenom, quoteDenom, "pending", {
            owner: attemptOwner,
          });
        }
      }, PENDING_HEARTBEAT_MS);

      let broadcastAccepted = false;
      let broadcastedTxHash: string | undefined;
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
          // reached, so abort the broadcast and settle as success. The
          // no-broadcast event class skips the account store's global
          // onBroadcastFailed handlers, so the user does not see a spurious
          // failed-transaction toast for an intentional abort.
          existsDiscoveredPreBroadcast = true;
          throw new AccountStoreNoBroadcastErrorEvent(
            "Orderbook already exists for this pair"
          );
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
              // The wallet approval window is unbounded and the endpoint
              // probe adds seconds more, so the early check can be
              // arbitrarily stale. This callback runs immediately before the
              // broadcast POST (nothing else awaits between them); a throw
              // here discards the signed tx without broadcasting it.
              await assertPairStillAbsent();
            },
            onBroadcasted: (txHash) => {
              // CheckTx accepted: the tx is in the mempool and may land even
              // if everything after this point (tracing, refetches) fails, so
              // from here the mark must survive a rejection of the overall
              // flow. The hash is persisted so any later confirm can
              // reconcile delivery against the node before the pair is
              // released.
              broadcastAccepted = true;
              broadcastedTxHash = Buffer.from(txHash).toString("hex");
              markOrderbookJustCreated(baseDenom, quoteDenom, "broadcasted", {
                owner: attemptOwner,
                txHash: broadcastedTxHash,
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
          // broadcast a duplicate paid creation. Reconcile by tx hash against
          // the node first (authoritative for delivery), then fall back to
          // the SQS pool list.
          const outcome = broadcastedTxHash
            ? await fetchBroadcastedTxOutcome(broadcastedTxHash)
            : "unknown";
          if (outcome === "delivered") {
            markOrderbookJustCreated(baseDenom, quoteDenom, "created", {
              owner: attemptOwner,
            });
            try {
              await refreshOrderbookCaches();
            } catch {
              // Best-effort; caches heal on their normal cadence.
            }
            return;
          }
          if (outcome === "failed") {
            clearJustCreatedOrderbookIfOwned(
              baseDenom,
              quoteDenom,
              attemptOwner
            );
          } else {
            try {
              const exists = await refreshOrderbookCaches();
              if (exists) {
                markOrderbookJustCreated(baseDenom, quoteDenom, "created", {
                  owner: attemptOwner,
                });
                return;
              }
            } catch {
              // Keep the "broadcasted" mark: delivery is unproven, and later
              // confirms reconcile the persisted hash before releasing it.
            }
          }
        } else {
          // Nothing was accepted by the chain (verification fail-closed,
          // sign rejection, or CheckTx failure): roll back this attempt's
          // in-flight mark so the pair can be retried. Owner-scoped, so a
          // concurrent attempt's protection is never stripped.
          clearJustCreatedOrderbookIfOwned(baseDenom, quoteDenom, attemptOwner);
        }
        console.error("Error creating orderbook pool", e);
        throw e;
      } finally {
        clearInterval(pendingHeartbeat);
      }
    };

    const runAttempt = async () => {
      setIsCreating(true);
      setError(undefined);
      try {
        let entry = readJustCreatedEntry(
          orderbookPairKey(baseDenom, quoteDenom)
        );

        // A broadcast-accepted attempt whose delivery was never observed:
        // reconcile by tx hash against the node before deciding anything.
        // Broadcasted marks are released ONLY on proof: no timeout height is
        // signed into these txs, so no amount of elapsed time or an
        // authoritative not-found proves the tx can never land, and lookup
        // failures prove nothing at all. Everything short of proof keeps the
        // pair protected.
        if (entry?.s === "broadcasted") {
          const outcome = entry.h
            ? await fetchBroadcastedTxOutcome(entry.h)
            : "unknown";
          if (outcome === "delivered") {
            await settleAsAlreadyCreated();
            return;
          }
          if (outcome === "failed") {
            // Delivered with a non-zero code: provably no pool was created.
            // Release the pair and continue into a fresh creation attempt.
            clearJustCreatedOrderbook(baseDenom, quoteDenom);
            entry = undefined;
          }
        }

        // The registry holds the pair: either a delivered creation whose
        // caches are still catching up, or an in-flight/unproven broadcast
        // (this tab or another). Broadcasting again would create a duplicate
        // pool and charge another creation fee, so a re-confirm becomes a
        // cache-refresh retry instead.
        if (entry) {
          const exists = await refreshOrderbookCaches();
          // A delivered ("created") mark proves the pool exists onchain, so
          // the refresh-only confirm is a success even if the sidecar still
          // lags. A "pending" or "broadcasted" mark proves nothing was
          // delivered yet: reporting success would close the modal on a pool
          // that may never exist (e.g. the marking tab closed mid-signing).
          // Reject instead; those marks self-expire, after which a re-confirm
          // broadcasts.
          if (entry.s !== "created" && !exists) {
            throw new Error(t("errors.uhOhSomethingWentWrong"));
          }
          return;
        }

        await broadcastCreation();
      } catch (e) {
        const message =
          e instanceof Error ? e.message : t("errors.uhOhSomethingWentWrong");
        setError(message);
        throw e;
      } finally {
        setIsCreating(false);
      }
    };

    // Serialize the whole attempt (gate check through broadcast) per pair
    // across tabs; see withPairCreationLock.
    try {
      return await withPairCreationLock(
        orderbookPairKey(baseDenom, quoteDenom),
        t("limitOrders.creationInProgress"),
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
    fetchBroadcastedTxOutcome,
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
