import { FunctionComponent } from "react";

import { Icon } from "~/components/assets";
import { AltSwapTool } from "~/components/swap-tool/alt";
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
      className="!w-fit max-w-[512px] overflow-x-hidden !bg-osmoverse-850 !py-0 !px-0"
    >
      <div className="flex items-center justify-between p-4">
        <span className="px-4 text-h6">Swap</span>
        <div
          className="flex rounded-full bg-osmoverse-800 p-3 text-wosmongton-200 transition hover:cursor-pointer hover:bg-osmoverse-alpha-800/[.54] hover:text-white-full"
          onClick={modalProps.onRequestClose}
        >
          <Icon id="close" width={24} height={24} />
        </div>
      </div>
      <div className="px-8 pt-0 pb-7">
        <AltSwapTool
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
      </div>
    </ModalBase>
  );
};
