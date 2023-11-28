import { ObservableRemoveLiquidityConfig } from "@osmosis-labs/stores";
import { observer } from "mobx-react-lite";
import { FunctionComponent } from "react";

import { RemoveLiquidity } from "~/components/complex/remove-liquidity";
import { tError } from "~/components/localization";
import { useTranslation } from "~/hooks";
import {
  useConnectWalletModalRedirect,
  useRemoveLiquidityConfig,
} from "~/hooks";
import { ModalBase, ModalBaseProps } from "~/modals/base";
import { useStore } from "~/stores";

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
  const { t } = useTranslation();

  const { chainId } = chainStore.osmosis;
  const account = accountStore.getWallet(chainId);
  const isSendingMsg = account?.txTypeInProgress !== "";

  const { config, removeLiquidity } = useRemoveLiquidityConfig(
    chainStore,
    chainId,
    poolId,
    queriesStore
  );

  const { showModalBase, accountActionButton } = useConnectWalletModalRedirect(
    {
      disabled: config.error !== undefined || isSendingMsg,
      onClick: () => {
        const removeLiquidityResult = removeLiquidity().finally(() =>
          props.onRequestClose()
        );
        props.onRemoveLiquidity?.(removeLiquidityResult, config);
      },
      children: config.error
        ? t(...tError(config.error))
        : t("removeLiquidity.title"),
    },
    props.onRequestClose
  );

  return (
    <ModalBase
      title={t("removeLiquidity.title")}
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
