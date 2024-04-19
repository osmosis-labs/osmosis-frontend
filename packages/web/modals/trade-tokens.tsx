import { FunctionComponent } from "react";

import { SwapTool } from "~/components/swap-tool";
import { EventPage } from "~/config";
import { useConnectWalletModalRedirect } from "~/hooks";
import { ModalBase, ModalBaseProps } from "~/modals/base";

export const TradeTokens: FunctionComponent<
  {
    sendTokenDenom?: string;
    outTokenDenom?: string;
    forceSwapInPoolId?: string;
    page: EventPage;
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
        isInModal
        onRequestModalClose={props.onRequestClose}
        swapButton={!walletConnected ? accountActionButton : undefined}
        initialSendTokenDenom={props.sendTokenDenom}
        initialOutTokenDenom={props.outTokenDenom}
        forceSwapInPoolId={props.forceSwapInPoolId}
        page={props.page}
      />
    </ModalBase>
  );
};
