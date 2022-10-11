import { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../stores";
import {
  useConnectWalletModalRedirect,
  useRemoveLiquidityConfig,
} from "../hooks";
import { RemoveLiquidity } from "../components/complex/remove-liquidity";
import { ModalBase, ModalBaseProps } from "./base";

export const RemoveLiquidityModal: FunctionComponent<
  {
    poolId: string;
  } & ModalBaseProps
> = observer((props) => {
  const { poolId } = props;
  const { chainStore, accountStore, queriesStore } = useStore();

  const { chainId } = chainStore.osmosis;
  const account = accountStore.getAccount(chainId);
  const isSendingMsg = account.txTypeInProgress !== "";

  const { config, removeLiquidity } = useRemoveLiquidityConfig(
    chainStore,
    chainId,
    poolId,
    queriesStore
  );

  const { showModalBase, accountActionButton } = useConnectWalletModalRedirect(
    {
      className: "h-14 md:w-full md:px-1 w-96 mt-3 mx-auto",
      size: "lg",
      loading: isSendingMsg,
      disabled: config.error !== undefined || isSendingMsg,
      onClick: () => removeLiquidity().finally(() => props.onRequestClose()),
      children: "Remove Liquidity",
    },
    props.onRequestClose
  );

  return (
    <ModalBase
      title={`Remove Liquidity from Pool #${poolId}`}
      {...props}
      isOpen={props.isOpen && showModalBase}
    >
      <RemoveLiquidity
        className="pt-4"
        removeLiquidityConfig={config}
        actionButton={accountActionButton}
      />
    </ModalBase>
  );
});
