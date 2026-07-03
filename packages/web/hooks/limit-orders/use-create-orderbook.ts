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
 * window cannot re-offer creation; entries expire with the server cache TTL
 * and are cleared early once the canonical list reflects the pair.
 */
const JUST_CREATED_STORAGE_KEY = "just-created-orderbooks";
/** Matches the server orderbook-pools LRU TTL. */
const CREATED_TTL_MS = 1000 * 60 * 60;
/**
 * A pending (pre-broadcast) mark older than this cannot belong to a live
 * broadcast (sign + broadcast + delivery completes in well under this), so it
 * is a leftover from an interrupted attempt (e.g. tab closed mid-signing) and
 * expires quickly rather than blocking the pair for the full created TTL.
 */
const PENDING_TTL_MS = 1000 * 60 * 2;

type JustCreatedStatus = "pending" | "created";
type JustCreatedEntry = { t: number; s: JustCreatedStatus };

// Denoms themselves contain "/" (ibc/..., factory/...), so a joined string is
// ambiguous across pairs; encode the tuple instead. Sorted, because a single
// orderbook serves both orientations of a pair (verifyOrderbookCreation
// matches base and quote swapped), so the reversed orientation must hit the
// same registry entry.
const orderbookPairKey = (baseDenom: string, quoteDenom: string) =>
  JSON.stringify([baseDenom, quoteDenom].sort());

function readJustCreatedOrderbooks(): Record<string, JustCreatedEntry> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(JUST_CREATED_STORAGE_KEY);
    const entries: unknown = raw ? JSON.parse(raw) : {};
    if (!entries || typeof entries !== "object") return {};
    const now = Date.now();
    return Object.fromEntries(
      Object.entries(entries as Record<string, unknown>).filter(
        (entry): entry is [string, JustCreatedEntry] => {
          const value = entry[1] as Partial<JustCreatedEntry> | null;
          if (
            !value ||
            typeof value.t !== "number" ||
            (value.s !== "pending" && value.s !== "created")
          )
            return false;
          const ttl = value.s === "pending" ? PENDING_TTL_MS : CREATED_TTL_MS;
          return now - value.t < ttl;
        }
      )
    );
  } catch {
    return {};
  }
}

function writeJustCreatedOrderbooks(entries: Record<string, JustCreatedEntry>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      JUST_CREATED_STORAGE_KEY,
      JSON.stringify(entries)
    );
  } catch {
    // Quota/privacy-mode failures degrade to session-only protection.
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
    // orderbook-pools LRU (cachified forceFresh writes the fresh value back),
    // so it must complete before any client refetches or they would re-cache
    // the pre-creation pool list. The sidecar ingests per block, so the first
    // fresh read can itself still see the pre-creation list; retry briefly
    // until the pair is reflected rather than re-caching a stale list for
    // another TTL window.
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
    if (!account?.address)
      throw new Error("Cannot create an orderbook without a connected wallet");
    if (!baseDenom || !quoteDenom)
      throw new Error("Cannot create an orderbook without a base/quote pair");
    if (!IS_ORDERBOOK_CREATION_SUPPORTED)
      throw new Error(
        "Orderbook creation is not supported in this environment (no code id configured)"
      );

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
        // A "pending" mark proves nothing was delivered yet: reporting
        // success would close the modal on a pool that may never exist (e.g.
        // the marking tab closed mid-signing). Reject instead; the pending
        // mark self-expires quickly, after which a re-confirm broadcasts.
        if (justCreatedStatus === "pending" && !exists) {
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

    // Mark the pair before broadcasting so an overlapping confirm (double
    // click, second tab) hits the just-created gate instead of broadcasting a
    // second paid creation while this one is in flight. Upgraded to "created"
    // on delivery; rolled back on any failure below.
    markOrderbookJustCreated(baseDenom, quoteDenom, "pending");

    try {
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

      let deliveredCode: number | undefined;
      let deliveredLog: string | undefined;
      await accountStore.signAndBroadcast(
        accountStore.osmosisChainId,
        "createOrderbook",
        [msg],
        undefined,
        undefined,
        undefined,
        async (tx) => {
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
        }
      );
      // signAndBroadcast throws on broadcast (CheckTx) rejection but resolves
      // on a delivered-but-failed tx (non-zero code), so surface that here or
      // callers would treat the failed creation as success.
      if (deliveredCode) {
        throw new Error(deliveredLog || t("errors.uhOhSomethingWentWrong"));
      }
    } catch (e) {
      // The creation did not land (sign rejection, CheckTx failure, or a
      // delivered tx with a non-zero code): roll back the in-flight mark so
      // the pair can be retried. Only a still-pending mark is rolled back; a
      // "created" entry proves some attempt (possibly another tab's) already
      // delivered a pool and must keep its duplicate-creation protection.
      if (getJustCreatedStatus(baseDenom, quoteDenom) === "pending") {
        clearJustCreatedOrderbook(baseDenom, quoteDenom);
      }
      console.error("Error creating orderbook pool", e);
      const message =
        e instanceof Error ? e.message : t("errors.uhOhSomethingWentWrong");
      setError(message);
      throw e;
    } finally {
      setIsCreating(false);
    }
  }, [
    account?.address,
    baseDenom,
    quoteDenom,
    accountStore,
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
