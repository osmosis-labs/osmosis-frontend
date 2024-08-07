import { MappedLimitOrder } from "@osmosis-labs/server";
import { observer } from "mobx-react-lite";
import { useCallback, useState } from "react";

import { Spinner } from "~/components/loaders";
import { t } from "~/hooks";
import { useStore } from "~/stores";

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

const ClaimAndCloseButton = observer(
  ({
    order,
    refetch,
  }: {
    order: MappedLimitOrder;
    refetch: () => Promise<any>;
  }) => {
    const { accountStore } = useStore();
    const account = accountStore.getWallet(accountStore.osmosisChainId);
    const [claiming, setClaiming] = useState(false);

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
        await account.cosmwasm.sendMultiExecuteContractMsg(
          "executeWasm",
          msgs,
          undefined
        );
        await refetch();
      } catch (error) {
        console.error(error);
        setClaiming(false);
      }
    }, [account, order, refetch]);

    return (
      <button
        className="flex h-8 items-center justify-center rounded-5xl bg-osmoverse-825 px-3 transition-colors hover:bg-osmoverse-700 disabled:opacity-50"
        onClick={claimAndClose}
        disabled={claiming}
      >
        <span className="body2 flex items-center text-wosmongton-200">
          {claiming && <Spinner className="mr-2 h-2 w-2" />}
          {t("limitOrders.claimAndClose")}
        </span>
      </button>
    );
  }
);

const CancelButton = observer(
  ({
    order,
    refetch,
  }: {
    order: MappedLimitOrder;
    refetch: () => Promise<any>;
  }) => {
    const { accountStore } = useStore();
    const account = accountStore.getWallet(accountStore.osmosisChainId);
    const [cancelling, setCancelling] = useState(false);

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
        await account.cosmwasm.sendMultiExecuteContractMsg(
          "executeWasm",
          [claimMsg],
          undefined
        );
        await refetch();
      } catch (error) {
        console.error(error);
        setCancelling(false);
      }
    }, [account, order, refetch]);

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
  }
);
