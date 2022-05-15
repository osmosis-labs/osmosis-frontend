import { FunctionComponent } from "react";
import { ModalBase, ModalBaseProps } from "./base";
import { TradeClipboard } from "../components/trade-clipboard";
import { Pool } from "@osmosis-labs/pools";

interface Props extends ModalBaseProps {
  pools: Pool[];
}

export const TradeTokens: FunctionComponent<Props> = (props) => {
  return (
    <ModalBase {...props}>
      <TradeClipboard
        containerClassName="w-full border-none !p-0 mt-4 md:mt-0"
        pools={props.pools}
        isInModal
      />
    </ModalBase>
  );
};
