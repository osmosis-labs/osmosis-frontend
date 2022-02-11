import { FunctionComponent } from "react";
import { Cell } from "./types";

export const BalanceCell: FunctionComponent<Partial<Cell>> = ({
  amount,
  fiatValue,
}) =>
  amount ? (
    <div className="flex flex-col right">
      <span className="text-body1 text-white-high">{amount}</span>
      {fiatValue && (
        <span className="text-body2 text-iconDefault">{fiatValue}</span>
      )}
    </div>
  ) : null;
