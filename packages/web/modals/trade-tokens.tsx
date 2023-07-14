import { ObservableQueryPool } from "@osmosis-labs/stores";
import { FunctionComponent } from "react";

import { SwapTool } from "~/components/swap-tool";
import { useConnectWalletModalRedirect } from "~/hooks";

import { ModalBase, ModalBaseProps } from "~/modals/base";

export const TradeTokens: FunctionComponent<
  {
    memoedPools: ObservableQueryPool[];
  } & ModalBaseProps
> = (props) => {
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
        pools={props.memoedPools}
        isInModal
        onRequestModalClose={props.onRequestClose}
        swapButton={!walletConnected ? accountActionButton : undefined}
      />
    </ModalBase>
  );
};
