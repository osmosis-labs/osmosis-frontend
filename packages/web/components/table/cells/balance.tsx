import { FunctionComponent } from "react";

import { DesktopOnlyPrivateText } from "~/components/privacy";
import { AssetCell as Cell } from "~/components/table/cells/types";

export const BalanceCell: FunctionComponent<Partial<Cell>> = ({
  amount,
  fiatValue,
}) =>
  amount ? (
    <div className="right flex flex-col">
      <span className="body1 text-white-high">
        <DesktopOnlyPrivateText text={amount} />
      </span>
      {fiatValue && (
        <span className="body2 text-osmoverse-400">
          <DesktopOnlyPrivateText text={fiatValue} />
        </span>
      )}
    </div>
  ) : null;
