import { MappedLimitOrder } from "@osmosis-labs/server";
import { prepareMultiExecuteContractMsg } from "@osmosis-labs/tx";
import { useCallback, useEffect, useState } from "react";

import { Spinner } from "~/components/loaders";
import { t } from "~/hooks";
import { useWallet } from "~/hooks/use-wallet";

export function ActionsCell({
  order,
  refetch,
}: {
  order: MappedLimitOrder;
  refetch: () => Promise<any>;
}) {
  const component = (() => {
    switch (order.status) {
      case "open":
        return <CancelButton order={order} refetch={refetch} />;
      case "partiallyFilled":
        // TODO: swap to cancel button for partially filled but entirely claimed orders
        return <ClaimAndCloseButton order={order} refetch={refetch} />;
      case "filled":
        return (
          <span className="text-body-1 text-osmoverse-300">
            {t("limitOrders.claimable")}
          </span>
        );
      default:
        return null;
    }
  })();
  return <div className="flex w-full justify-end">{component}</div>;
}

const ClaimAndCloseButton = ({
  order,
  refetch,
}: {
  order: MappedLimitOrder;
  refetch: () => Promise<any>;
}) => {
  const { wallet: account, signAndBroadcast, transactionContext } = useWallet();
  const [claiming, setClaiming] = useState(false);

  /**
   * As virtualizer uses the row index to render/derender row elements,
   * we need to reset the claiming state when the order_id changes.
   *
   * Otherwise, the claiming state will be stuck to the previous order_id,
   * and the button will be disabled even when the order_id has changed.
   */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional state reset/sync on input change; deriving it during render would change behavior
    setClaiming(false);
  }, [order.order_id]);

  const claimAndClose = useCallback(async () => {
    if (!account) {
      console.error(
        "Attempted to claim and close orders without wallet connected"
      );
      return;
    }
    const { tick_id, order_id, orderbookAddress } = order;
    const claimMsg = {
      msg: {
        claim_limit: { order_id, tick_id },
      },
      contractAddress: orderbookAddress,
      funds: [],
    };
    const cancelMsg = {
      msg: { cancel_limit: { order_id, tick_id } },
      contractAddress: orderbookAddress,
      funds: [],
    };
    const msgs = [];
    if (order.percentFilled > order.percentClaimed) {
      msgs.push(claimMsg);
    }

    msgs.push(cancelMsg);

    try {
      setClaiming(true);
      await prepareMultiExecuteContractMsg(
        transactionContext,
        "executeWasm",
        msgs,
        undefined
      ).then((prepared) => signAndBroadcast(...prepared));
      await refetch();
    } catch (error) {
      console.error(error);
      /**
       * This row will eventually become a past order unless the transaction
       * errors. To avoid the button becoming enabled again we only setClaiming
       * to false when the transaction errors.
       */
      setClaiming(false);
    }
  }, [account, order, refetch, signAndBroadcast, transactionContext]);

  return (
    <button
      className="flex h-8 items-center justify-center rounded-5xl bg-osmoverse-825 px-3 transition-colors hover:bg-osmoverse-700 disabled:opacity-50"
      onClick={claimAndClose}
      disabled={claiming}
    >
      <span className="body2 flex items-center text-wosmongton-200">
        {claiming && <Spinner className="mr-2 h-2 w-2" />}
        {order.percentFilled > order.percentClaimed
          ? t("limitOrders.claimAndClose")
          : t("limitOrders.close")}
      </span>
    </button>
  );
};

const CancelButton = ({
  order,
  refetch,
}: {
  order: MappedLimitOrder;
  refetch: () => Promise<any>;
}) => {
  const { wallet: account, signAndBroadcast, transactionContext } = useWallet();
  const [cancelling, setCancelling] = useState(false);

  /**
   * As virtualizer uses the row index to render/derender row elements,
   * we need to reset the cancelling state when the order_id changes.
   *
   * Otherwise, the cancelling state will be stuck to the previous order_id,
   * and the button will be disabled even when the order_id has changed.
   */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional state reset/sync on input change; deriving it during render would change behavior
    setCancelling(false);
  }, [order.order_id]);

  const cancel = useCallback(async () => {
    if (!account) {
      console.error("Attempted to cancel orders without wallet connected");
      return;
    }
    const { tick_id, order_id, orderbookAddress } = order;
    const claimMsg = {
      msg: {
        cancel_limit: { order_id, tick_id },
      },
      contractAddress: orderbookAddress,
      funds: [],
    };

    try {
      setCancelling(true);
      await prepareMultiExecuteContractMsg(
        transactionContext,
        "executeWasm",
        [claimMsg],
        undefined
      ).then((prepared) => signAndBroadcast(...prepared));
      await refetch();
    } catch (error) {
      console.error(error);
      /**
       * This row will eventually become a past order unless the transaction
       * errors. To avoid the button becoming enabled again we only setCancelling
       * to false when the transaction errors.
       */
      setCancelling(false);
    }
  }, [account, order, refetch, signAndBroadcast, transactionContext]);

  return (
    <button
      className="flex h-8 items-center justify-center rounded-5xl bg-osmoverse-825 px-3 transition-colors hover:bg-osmoverse-700 disabled:opacity-50"
      onClick={cancel}
      disabled={cancelling}
    >
      <span className="body2 flex items-center whitespace-nowrap text-wosmongton-200">
        {cancelling && <Spinner className="mr-2 h-2 w-2" />}
        {t("limitOrders.cancel")}
      </span>
    </button>
  );
};
