import { createColumnHelper } from "@tanstack/react-table";

import { Order } from "~/components/complex/orders-history";

const columnHelper = createColumnHelper<Order>();

export const tableColumns = [
  columnHelper.display({
    id: "order",
    header: () => {
      return <small className="body2">Order</small>;
    },
  }),
  columnHelper.display({
    id: "price",
    header: () => {
      return <small className="body2">Price</small>;
    },
  }),
  columnHelper.display({
    id: "orderPlaced",
    header: () => {
      return <small className="body2">Order Placed</small>;
    },
  }),
  columnHelper.display({
    id: "status",
    header: () => {
      return <small className="body2">Status</small>;
    },
  }),
  columnHelper.display({
    id: "status",
  }),
];
