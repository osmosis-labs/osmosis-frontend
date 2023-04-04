import { RoutablePool } from "@osmosis-labs/pools";
import { FunctionComponent } from "react";

import { TradeClipboard } from "../components/trade-clipboard";
import { ModalBase, ModalBaseProps } from "./base";

interface Props extends ModalBaseProps {
  pools: RoutablePool[];
}

export const TradeTokens: FunctionComponent<Props> = (props) => {
  return (
    <ModalBase {...props} hideCloseButton className="!w-fit !p-0">
      <TradeClipboard
        pools={props.pools}
        isInModal
        onRequestModalClose={props.onRequestClose}
      />
    </ModalBase>
  );
};
