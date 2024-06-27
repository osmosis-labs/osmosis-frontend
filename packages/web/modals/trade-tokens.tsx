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
    useOtherCurrencies?: boolean;
    page: EventPage;
  } & ModalBaseProps
> = ({
  sendTokenDenom,
  outTokenDenom,
  forceSwapInPoolId,
  useOtherCurrencies,
  page,
  ...modalProps
}) => {
  const { showModalBase, accountActionButton, walletConnected } =
    useConnectWalletModalRedirect({}, modalProps.onRequestClose);

  return (
    <ModalBase
      {...modalProps}
      isOpen={showModalBase && modalProps.isOpen}
      hideCloseButton
      className="!w-fit !p-0"
    >
      <SwapTool
        fixedWidth
        useQueryParams={false}
        useOtherCurrencies={useOtherCurrencies}
        onRequestModalClose={modalProps.onRequestClose}
        swapButton={!walletConnected ? accountActionButton : undefined}
        initialSendTokenDenom={sendTokenDenom}
        initialOutTokenDenom={outTokenDenom}
        forceSwapInPoolId={forceSwapInPoolId}
        page={page}
      />
    </ModalBase>
  );
};
