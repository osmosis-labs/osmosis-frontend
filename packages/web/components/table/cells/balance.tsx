import { FunctionComponent } from "react";
import { AssetCell as Cell } from "./types";

export const BalanceCell: FunctionComponent<Partial<Cell>> = ({
  amount,
  fiatValue,
}) =>
  amount ? (
    <div className="right flex flex-col">
      <span className="body1 text-white-high">{amount}</span>
      {fiatValue && (
        <span className="body2 text-osmoverse-400">{fiatValue}</span>
      )}
    </div>
  ) : null;
