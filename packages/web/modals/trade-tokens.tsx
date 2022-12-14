import { FunctionComponent } from "react";
import { ModalBase, ModalBaseProps } from "./base";
import { TradeClipboard } from "../components/trade-clipboard";
import { Pool } from "@osmosis-labs/pools";

interface Props extends ModalBaseProps {
  pools: Pool[];
}

export const TradeTokens: FunctionComponent<Props> = (props) => {
  return (
    <ModalBase {...props} hideCloseButton className="!p-0 !w-fit">
      <TradeClipboard
        pools={props.pools}
        isInModal
        onRequestModalClose={props.onRequestClose}
      />
    </ModalBase>
  );
};
