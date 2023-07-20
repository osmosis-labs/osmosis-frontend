import { CoinPretty } from "@keplr-wallet/unit";
import { ConcentratedLiquidityPool } from "@osmosis-labs/pools";
import { ObservableAddLiquidityConfig } from "@osmosis-labs/stores";
import { observer } from "mobx-react-lite";
import { FunctionComponent, useCallback } from "react";
import { useTranslation } from "react-multi-lang";

import {
  useAddConcentratedLiquidityConfig,
  useAddLiquidityConfig,
  useConnectWalletModalRedirect,
} from "~/hooks";

import { AddConcLiquidity } from "../components/complex/add-conc-liquidity";
import { AddLiquidity } from "../components/complex/add-liquidity";
import { tError } from "../components/localization";
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
  const { chainStore, accountStore, queriesStore, priceStore } = useStore();
  const t = useTranslation();

  const { chainId } = chainStore.osmosis;
  const account = accountStore.getWallet(chainId);
  const isSendingMsg = account?.txTypeInProgress !== "";

  const osmosisQueries = queriesStore.get(chainStore.osmosis.chainId).osmosis!;

  const { config: addLiquidityConfig, addLiquidity } = useAddLiquidityConfig(
    chainStore,
    chainId,
    poolId,
    queriesStore
  );

  const { config: addConliqConfig, addLiquidity: addConLiquidity } =
    useAddConcentratedLiquidityConfig(chainStore, chainId, poolId);

  // initialize pool data stores once root pool store is loaded
  const queryPool = osmosisQueries.queryPools.getPool(poolId);
  const clPool =
    queryPool?.pool && queryPool.pool instanceof ConcentratedLiquidityPool
      ? queryPool.pool
      : undefined;
  const config = clPool ? addConliqConfig : addLiquidityConfig;

  const { showModalBase, accountActionButton } = useConnectWalletModalRedirect(
    {
      disabled: config.error !== undefined || isSendingMsg,
      onClick: () => {
        const addLiquidityPromise = Boolean(clPool)
          ? addConLiquidity()
          : addLiquidity();
        const addLiquidityResult = addLiquidityPromise.finally(() =>
          props.onRequestClose()
        );

        if (!Boolean(clPool)) {
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

  if (Boolean(clPool)) {
    return (
      <ModalBase
        {...props}
        isOpen={props.isOpen && showModalBase}
        hideCloseButton
        className="max-h-[98vh] !max-w-[57.5rem] overflow-auto"
      >
        <AddConcLiquidity
          addLiquidityConfig={addConliqConfig}
          actionButton={accountActionButton}
          getFiatValue={useCallback(
            (coin: CoinPretty) => priceStore.calculatePrice(coin),
            [priceStore]
          )}
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
