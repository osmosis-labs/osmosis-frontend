import { CellContext } from "@tanstack/react-table";
import { observer } from "mobx-react-lite";
import { useCallback, useState } from "react";

import { DisplayableLimitOrder } from "~/hooks/limit-orders/use-orderbook";
import { useStore } from "~/stores";

export function ActionsCell({
  row,
}: CellContext<
  DisplayableLimitOrder & { refetch: () => Promise<any> },
  unknown
>) {
  const component = (() => {
    switch (row.original.status) {
      case "open":
        return <CancelButton order={row.original} />;
      case "partiallyFilled":
        // TODO: swap to cancel button for partially filled but entirely claimed orders
        return <ClaimAndCloseButton order={row.original} />;
      case "filled":
        return (
          <span className="text-body-1 text-osmoverse-300">Claimable</span>
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
  }: {
    order: DisplayableLimitOrder & { refetch: () => Promise<any> };
  }) => {
    const { accountStore } = useStore();
    const account = accountStore.getWallet(accountStore.osmosisChainId);

    const claimAndClose = useCallback(async () => {
      if (!account) return;
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
        await account.cosmwasm.sendMultiExecuteContractMsg(
          "executeWasm",
          msgs,
          undefined
        );
      } catch (error) {
        console.error(error);
      }
    }, [account, order]);

    return (
      <button
        className="flex h-8 items-center justify-center rounded-5xl bg-osmoverse-825 px-3 transition-colors hover:bg-osmoverse-700"
        onClick={claimAndClose}
      >
        <span className="body2 text-wosmongton-200">Claim and close</span>
      </button>
    );
  }
);

const CancelButton = observer(
  ({
    order,
  }: {
    order: DisplayableLimitOrder & { refetch: () => Promise<any> };
  }) => {
    const { accountStore } = useStore();
    const account = accountStore.getWallet(accountStore.osmosisChainId);
    const [cancelling, setCancelling] = useState(false);

    const cancel = useCallback(async () => {
      if (!account) return;
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
        await order.refetch();
      } catch (error) {
        console.error(error);
      } finally {
        setCancelling(false);
      }
    }, [account, order]);

    return (
      <button
        className="flex h-8 items-center justify-center rounded-5xl bg-osmoverse-825 px-3 transition-colors hover:bg-osmoverse-700 disabled:opacity-50"
        onClick={cancel}
        disabled={cancelling}
      >
        <span className="body2 text-wosmongton-200">Cancel</span>
      </button>
    );
  }
);
