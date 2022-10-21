import { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../stores";
import { useConnectWalletModalRedirect, useAddLiquidityConfig } from "../hooks";
import { AddLiquidity } from "../components/complex/add-liquidity";
import { ModalBase, ModalBaseProps } from "./base";
import { useTranslation } from "react-multi-lang";

export const AddLiquidityModal: FunctionComponent<
  {
    poolId: string;
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
      className: "h-14 md:w-full md:px-1 w-96 mt-3 mx-auto",
      size: "lg",
      loading: isSendingMsg,
      disabled: config.error !== undefined || isSendingMsg,
      onClick: () => addLiquidity().finally(() => props.onRequestClose()),
      children: t("pool.manageLiquidity.tabAddLiquidity"),
    },
    props.onRequestClose
  );

  return (
    <ModalBase
      title={t("pool.manageLiquidity.modalTitleAdd", { poolId })}
      {...props}
      isOpen={props.isOpen && showModalBase}
    >
      <AddLiquidity
        className="pt-4"
        addLiquidityConfig={config}
        actionButton={accountActionButton}
        getFiatValue={(coin) => priceStore.calculatePrice(coin)}
      />
    </ModalBase>
  );
});
