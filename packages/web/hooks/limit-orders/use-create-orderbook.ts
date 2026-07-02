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
const JUST_CREATED_TTL_MS = 1000 * 60 * 60;

// Denoms themselves contain "/" (ibc/..., factory/...), so a joined string is
// ambiguous across pairs; encode the tuple instead.
const orderbookPairKey = (baseDenom: string, quoteDenom: string) =>
  JSON.stringify([baseDenom, quoteDenom]);

function readJustCreatedOrderbooks(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(JUST_CREATED_STORAGE_KEY);
    const entries: unknown = raw ? JSON.parse(raw) : {};
    if (!entries || typeof entries !== "object") return {};
    const now = Date.now();
    return Object.fromEntries(
      Object.entries(entries as Record<string, unknown>).filter(
        (entry): entry is [string, number] =>
          typeof entry[1] === "number" && now - entry[1] < JUST_CREATED_TTL_MS
      )
    );
  } catch {
    return {};
  }
}

function writeJustCreatedOrderbooks(entries: Record<string, number>) {
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

function markOrderbookJustCreated(baseDenom: string, quoteDenom: string) {
  const entries = readJustCreatedOrderbooks();
  entries[orderbookPairKey(baseDenom, quoteDenom)] = Date.now();
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
    for (let attempt = 0; attempt < 3; attempt++) {
      const verification =
        await apiUtils.edge.orderbooks.verifyOrderbookCreation.fetch({
          baseDenom,
          quoteDenom,
          fresh: true,
        });
      if (verification.orderbookExists) break;
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
  }, [apiUtils, baseDenom, quoteDenom]);

  const createOrderbook = useCallback(async () => {
    if (!account?.address) return;
    if (!baseDenom || !quoteDenom) return;
    if (!IS_ORDERBOOK_CREATION_SUPPORTED) return;

    // The pair was already created onchain (this session or within the server
    // cache TTL, persisted across reloads). Broadcasting again would create a
    // duplicate pool and charge another creation fee, so a re-confirm becomes
    // a cache-refresh retry instead.
    if (wasOrderbookJustCreated(baseDenom, quoteDenom)) {
      setIsCreating(true);
      setError(undefined);
      try {
        await refreshOrderbookCaches();
      } finally {
        setIsCreating(false);
      }
      return;
    }

    setIsCreating(true);
    setError(undefined);

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
            // Mark BEFORE the refresh: from this point the pool exists
            // onchain, so no path may broadcast the pair again.
            markOrderbookJustCreated(baseDenom, quoteDenom);
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
