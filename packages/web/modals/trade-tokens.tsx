import { ObservableQueryPool } from "@osmosis-labs/stores";
import { FunctionComponent } from "react";

import { useConnectWalletModalRedirect } from "~/hooks";

import { SwapTool } from "../components/swap-tool";
import { ModalBase, ModalBaseProps } from "./base";

interface Props extends ModalBaseProps {
  pools: ObservableQueryPool[];
}

export const TradeTokens: FunctionComponent<Props> = (props) => {
  const { showModalBase, accountActionButton, walletConnected } =
    useConnectWalletModalRedirect({}, props.onRequestClose);

  return (
    <ModalBase
      {...props}
      isOpen={showModalBase && props.isOpen}
      hideCloseButton
      className="!w-fit !p-0"
    >
      <SwapTool
        pools={props.pools}
        isInModal
        onRequestModalClose={props.onRequestClose}
        swapButton={!walletConnected ? accountActionButton : undefined}
      />
    </ModalBase>
  );
};
