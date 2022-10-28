import { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { ObservableRemoveLiquidityConfig } from "@osmosis-labs/stores";
import { useStore } from "../stores";
import {
  useConnectWalletModalRedirect,
  useRemoveLiquidityConfig,
} from "../hooks";
import { RemoveLiquidity } from "../components/complex/remove-liquidity";
import { ModalBase, ModalBaseProps } from "./base";
import { useTranslation } from "react-multi-lang";

export const RemoveLiquidityModal: FunctionComponent<
  {
    poolId: string;
    onRemoveLiquidity?: (
      result: Promise<void>,
      config: ObservableRemoveLiquidityConfig
    ) => void;
  } & ModalBaseProps
> = observer((props) => {
  const { poolId } = props;
  const { chainStore, accountStore, queriesStore } = useStore();
  const t = useTranslation();

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
      className: "mt-3",
      disabled: config.error !== undefined || isSendingMsg,
      onClick: () =>
        props.onRemoveLiquidity?.(
          removeLiquidity().finally(() => props.onRequestClose()),
          config
        ),
      children: config.error
        ? config.error.message
        : t("pool.manageLiquidity.tabRemoveLiquidity"),
    },
    props.onRequestClose
  );

  return (
    <ModalBase
      title={t("pool.manageLiquidity.modalTitleRemove", { poolId })}
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
