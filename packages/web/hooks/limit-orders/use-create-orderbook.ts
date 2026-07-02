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
 * Pairs whose orderbook was created onchain this session but may not yet be
 * reflected in the canonical pools list (the sidecar ingests per block, so the
 * list can lag the delivered tx by a few seconds). Consumers that reset UI
 * state when a pair looks orderbook-less must consult this so they don't undo
 * the user's selection during that window. Module-level on purpose: the
 * creation entry points (Limit tab, Pay With / Receive dropdown) live in
 * different component subtrees.
 */
const justCreatedOrderbooks = new Set<string>();
const orderbookPairKey = (baseDenom: string, quoteDenom: string) =>
  `${baseDenom}/${quoteDenom}`;

export function wasOrderbookJustCreated(baseDenom: string, quoteDenom: string) {
  return justCreatedOrderbooks.has(orderbookPairKey(baseDenom, quoteDenom));
}

/** Call once the canonical pools list reflects the pair, to re-arm resets. */
export function clearJustCreatedOrderbook(
  baseDenom: string,
  quoteDenom: string
) {
  justCreatedOrderbooks.delete(orderbookPairKey(baseDenom, quoteDenom));
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

  const createOrderbook = useCallback(async () => {
    if (!account?.address) return;
    if (!baseDenom || !quoteDenom) return;
    if (!IS_ORDERBOOK_CREATION_SUPPORTED) return;

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
            justCreatedOrderbooks.add(orderbookPairKey(baseDenom, quoteDenom));
            // Order matters: the fresh verify bypasses AND repopulates the
            // server-side orderbook-pools LRU (cachified forceFresh writes the
            // fresh value back), so it must complete before any client
            // refetches or they would re-cache the pre-creation pool list.
            await apiUtils.edge.orderbooks.verifyOrderbookCreation.fetch({
              baseDenom,
              quoteDenom,
              fresh: true,
            });
            // Refetch client caches against the now-fresh server cache: the
            // pools list, and every mounted verifyOrderbookCreation consumer.
            // The consumers query without `fresh`, which is a different
            // react-query key than the imperative fetch above populated, so
            // they need the procedure-level invalidation to pick up the
            // created orderbook.
            await Promise.all([
              apiUtils.edge.orderbooks.getPools.invalidate(),
              apiUtils.edge.orderbooks.verifyOrderbookCreation.invalidate(),
            ]);
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
  }, [account?.address, baseDenom, quoteDenom, accountStore, apiUtils, t]);

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
