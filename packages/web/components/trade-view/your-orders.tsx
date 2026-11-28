import { FunctionComponent } from "react";

import { OrderHistory } from "~/components/complex/orders-history";
import { useTranslation } from "~/hooks";

/**
 * The connected wallet's orders on one orderbook. A thin wrapper around the
 * shared {@link OrderHistory}: passing `orderbookAddress` scopes the list to
 * this book, lifts in the Buy/Sell filter, and self-hosts the detail modal.
 */
export const OrderbookYourOrders: FunctionComponent<{
  contractAddress: string;
}> = ({ contractAddress }) => {
  const { t } = useTranslation();

  return (
    <div className="rounded-3xl border border-osmoverse-700 p-6">
      <OrderHistory
        orderbookAddress={contractAddress}
        title={t("pool.orderbookPool.yourOrders")}
      />
    </div>
  );
};
