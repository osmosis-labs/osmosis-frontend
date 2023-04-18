import { ObservableAddLiquidityConfig } from "@osmosis-labs/stores";
import { observer } from "mobx-react-lite";
import { FunctionComponent } from "react";
import { useTranslation } from "react-multi-lang";

import { AddConcLiquidity } from "../components/complex/add-conc-liquidity";
import { tError } from "../components/localization";
import { useAddLiquidityConfig, useConnectWalletModalRedirect } from "../hooks";
import { useStore } from "../stores";
// import { AddLiquidity } from "../components/complex/add-liquidity";
import { ModalBase, ModalBaseProps } from "./base";

export const AddLiquidityModal: FunctionComponent<
  {
    poolId: string;
    onAddLiquidity?: (
      result: Promise<void>,
      config: ObservableAddLiquidityConfig
    ) => void;
  } & ModalBaseProps
> = observer((props) => {
  const { poolId } = props;
  const { chainStore, accountStore, queriesStore, priceStore } = useStore();
  const t = useTranslation();

  const { chainId } = chainStore.osmosis;
  const account = accountStore.getAccount(chainId);
  const isSendingMsg = account.txTypeInProgress !== "";

  const { config, addLiquidity } = useAddLiquidityConfig(
    chainStore,
    chainId,
    poolId,
    queriesStore
  );

  const { showModalBase, accountActionButton } = useConnectWalletModalRedirect(
    {
      disabled: config.error !== undefined || isSendingMsg,
      onClick: () => {
        const addLiquidityResult = addLiquidity().finally(() =>
          props.onRequestClose()
        );
        props.onAddLiquidity?.(addLiquidityResult, config);
      },
      children: config.error
        ? t(...tError(config.error))
        : t("addLiquidity.title"),
    },
    props.onRequestClose
  );

  return (
    <ModalBase
      // title={t("addLiquidity.title")}
      {...props}
      isOpen={props.isOpen && showModalBase}
      hideCloseButton
      className="!max-w-[57.5rem]"
    >
      <AddConcLiquidity
        addLiquidityConfig={config}
        actionButton={accountActionButton}
        getFiatValue={(coin) => priceStore.calculatePrice(coin)}
        onRequestClose={props.onRequestClose}
      />
    </ModalBase>
  );
});
