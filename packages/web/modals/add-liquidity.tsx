import {
  ObservableAddConcentratedLiquidityConfig,
  ObservableAddLiquidityConfig,
} from "@osmosis-labs/stores";
import { observer } from "mobx-react-lite";
import { FunctionComponent } from "react";
import { useTranslation } from "react-multi-lang";

import { AddConcLiquidity } from "../components/complex/add-conc-liquidity";
import { AddLiquidity } from "../components/complex/add-liquidity";
import { tError } from "../components/localization";
import {
  useAddConcentratedLiquidityConfig,
  useAddLiquidityConfig,
  useConnectWalletModalRedirect,
} from "../hooks";
import { useStore } from "../stores";
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
  const {
    chainStore,
    accountStore,
    queriesStore,
    priceStore,
    derivedDataStore,
  } = useStore();
  const t = useTranslation();

  const { chainId } = chainStore.osmosis;
  const account = accountStore.getAccount(chainId);
  const isSendingMsg = account.txTypeInProgress !== "";

  const { config: addLiquidityConfig, addLiquidity } = useAddLiquidityConfig(
    chainStore,
    chainId,
    poolId,
    queriesStore
  );

  const { config: addConliqConfig, addLiquidity: addConLiquidity } =
    useAddConcentratedLiquidityConfig(
      chainStore,
      chainId,
      poolId,
      queriesStore
    );

  // initialize pool data stores once root pool store is loaded
  const { poolDetail } = derivedDataStore.getForPool(poolId as string);
  const pool = poolDetail?.pool?.pool;
  const isConcLiq = pool?.type === "concentrated";
  const config = isConcLiq ? addConliqConfig : addLiquidityConfig;

  const { showModalBase, accountActionButton } = useConnectWalletModalRedirect(
    {
      disabled: config.error !== undefined || isSendingMsg,
      onClick: () => {
        const addLiquidityPromise = isConcLiq
          ? addConLiquidity()
          : addLiquidity();
        const addLiquidityResult = addLiquidityPromise.finally(() =>
          props.onRequestClose()
        );

        if (!isConcLiq) {
          props.onAddLiquidity?.(
            addLiquidityResult,
            config as ObservableAddLiquidityConfig
          );
        }
      },
      children: config.error
        ? t(...tError(config.error))
        : t("addLiquidity.title"),
    },
    props.onRequestClose
  );

  if (isConcLiq) {
    return (
      <ModalBase
        {...props}
        isOpen={props.isOpen && showModalBase}
        hideCloseButton
        className="!max-w-[57.5rem]"
      >
        <AddConcLiquidity
          addLiquidityConfig={
            addConliqConfig as ObservableAddConcentratedLiquidityConfig
          }
          actionButton={accountActionButton}
          getFiatValue={(coin) => priceStore.calculatePrice(coin)}
          onRequestClose={props.onRequestClose}
        />
      </ModalBase>
    );
  }

  return (
    <ModalBase
      title={t("addLiquidity.title")}
      {...props}
      isOpen={props.isOpen && showModalBase}
    >
      <AddLiquidity
        className="pt-4"
        addLiquidityConfig={config as ObservableAddLiquidityConfig}
        actionButton={accountActionButton}
        getFiatValue={(coin) => priceStore.calculatePrice(coin)}
      />
    </ModalBase>
  );
});
