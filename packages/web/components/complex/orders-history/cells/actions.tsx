import { CellContext } from "@tanstack/react-table";

import { DisplayableLimitOrder } from "~/hooks/limit-orders/use-orderbook";

export function ActionsCell({}: CellContext<DisplayableLimitOrder, unknown>) {
  return (
    <div className="flex w-full justify-end">
      <button className="flex h-8 items-center justify-center rounded-5xl bg-osmoverse-825 px-3 transition-colors hover:bg-osmoverse-700">
        <span className="body2 text-wosmongton-200">Claim and close</span>
      </button>
    </div>
  );
}
