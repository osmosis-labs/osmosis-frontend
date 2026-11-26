import { getAssetFromAssetList } from "@osmosis-labs/utils";
import Link from "next/link";
import { FunctionComponent, useMemo } from "react";

import { USDC_BASE_DENOM } from "~/components/place-limit-tool/defaults";
import { Button } from "~/components/ui/button";
import { ClientAssetLists as AssetLists } from "~/config/generated/client-asset-lists";
import { useTranslation } from "~/hooks";
import { findOrderbookByDenoms } from "~/hooks/limit-orders/use-orderbook";
import { useOrderbookCreationFlow } from "~/hooks/limit-orders/use-orderbook-creation-flow";
import { CreateOrderbookModal } from "~/modals/create-orderbook";
import { api } from "~/utils/trpc";

/**
 * Shown in place of the Buy/Sell widget on an orderbook pool page whose quote
 * is no longer offered for new orders. Placing against this pair would
 * silently switch the quote to allUSDC, so the widget is not rendered; the
 * book and the user's orders stay on the page so existing orders can still
 * be claimed and cancelled. Points to this base's allUSDC book, or offers to
 * create one.
 */
export const RetiredQuoteNotice: FunctionComponent<{
  baseDenom: string;
  quoteDenom: string;
}> = ({ baseDenom, quoteDenom }) => {
  const { t } = useTranslation();
  const apiUtils = api.useUtils();
  const { data: orderbooks, isLoading } =
    api.edge.orderbooks.getPools.useQuery();
  const sibling = useMemo(
    () => findOrderbookByDenoms(orderbooks ?? [], baseDenom, USDC_BASE_DENOM),
    [orderbooks, baseDenom]
  );

  const [baseAsset, quoteAsset, usdcAsset] = useMemo(
    () =>
      [baseDenom, quoteDenom, USDC_BASE_DENOM].map((denom) =>
        getAssetFromAssetList({
          assetLists: AssetLists,
          coinMinimalDenom: denom,
        })
      ),
    [baseDenom, quoteDenom]
  );
  const baseSymbol = baseAsset?.symbol ?? baseDenom;
  const usdcSymbol = usdcAsset?.symbol ?? "USDC";

  const creationFlow = useOrderbookCreationFlow({
    baseDenom,
    quoteDenom: USDC_BASE_DENOM,
    onCreated: () => apiUtils.edge.orderbooks.getPools.invalidate(),
  });

  return (
    <div className="flex flex-col gap-4 py-2">
      <p className="body2 text-osmoverse-300">
        {t("pool.orderbookPool.retiredQuoteDesc", {
          quote: quoteAsset?.symbol ?? quoteDenom,
        })}
      </p>
      {sibling ? (
        <Button asChild variant="default">
          <Link href={`/pool/${sibling.poolId}`}>
            {t("pool.orderbookPool.retiredQuoteGoTo", {
              pair: `${baseSymbol}/${usdcSymbol}`,
            })}
          </Link>
        </Button>
      ) : (
        <Button
          variant="default"
          disabled={isLoading}
          onClick={creationFlow.open}
        >
          {t("pool.orderbookPool.retiredQuoteCreate", {
            pair: `${baseSymbol}/${usdcSymbol}`,
          })}
        </Button>
      )}
      <CreateOrderbookModal
        {...creationFlow.modalProps}
        baseDenom={baseDenom}
        baseSymbol={baseSymbol}
        quoteDenom={USDC_BASE_DENOM}
        quoteSymbol={usdcSymbol}
        baseCoinImageUrl={baseAsset?.currency.coinImageUrl}
        quoteCoinImageUrl={usdcAsset?.currency.coinImageUrl}
      />
    </div>
  );
};
