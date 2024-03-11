import { ObservableAddLiquidityConfig } from "@osmosis-labs/stores";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { FunctionComponent } from "react";

import { AddConcLiquidity } from "~/components/complex/add-conc-liquidity";
import { AddLiquidity } from "~/components/complex/add-liquidity";
import { tError } from "~/components/localization";
import { useTranslation } from "~/hooks";
import {
  useAddConcentratedLiquidityConfig,
  useAddLiquidityConfig,
  useConnectWalletModalRedirect,
} from "~/hooks";
import { ModalBase, ModalBaseProps } from "~/modals/base";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

import { SuperfluidValidatorModal } from "./superfluid-validator";

export const AddLiquidityModal: FunctionComponent<
  {
    poolId: string;
    onAddLiquidity?: (result: Promise<void>) => void;
  } & ModalBaseProps
> = observer((props) => {
  const { poolId } = props;
  const { chainStore, accountStore, queriesStore } = useStore();
  const { t } = useTranslation();

  const { chainId } = chainStore.osmosis;
  const account = accountStore.getWallet(chainId);
  const isSendingMsg = account?.txTypeInProgress !== "";

  const { config: addLiquidityConfig, addLiquidity } = useAddLiquidityConfig(
    chainStore,
    chainId,
    poolId,
    queriesStore
  );

  const [showSuperfluidValidatorModal, setShowSuperfluidValidatorModal] =
    useState(false);

  const { config: addConliqConfig, addLiquidity: addConLiquidity } =
    useAddConcentratedLiquidityConfig(chainStore, chainId, poolId);

  // initialize pool data stores once root pool store is loaded
  const { data: pool } = api.edge.pools.getPool.useQuery({ poolId });

  const config =
    pool?.type === "concentrated" ? addConliqConfig : addLiquidityConfig;

  const { showModalBase, accountActionButton } = useConnectWalletModalRedirect(
    {
      disabled: config.error !== undefined || isSendingMsg,
      onClick: () => {
        // New CL position: move to next step if superfluid validator selection is needed
        if (
          pool?.type === "concentrated" &&
          addConliqConfig.shouldBeSuperfluidStaked
        ) {
          setShowSuperfluidValidatorModal(true);
          return;
        }

        const addLiquidityPromise =
          pool?.type === "concentrated" ? addConLiquidity() : addLiquidity();
        const addLiquidityResult = addLiquidityPromise.then(() =>
          props.onRequestClose()
        );

        if (pool?.type !== "concentrated" && props.onAddLiquidity) {
          props.onAddLiquidity(addLiquidityResult);
        }
      },
      children: config.error
        ? t(...tError(config.error))
        : pool?.type === "concentrated" &&
          addConliqConfig.shouldBeSuperfluidStaked
        ? t("addConcentratedLiquidity.buttonCreateAndStake")
        : t("addLiquidity.title"),
    },
    props.onRequestClose
  );

  // add concentrated liquidity
  if (pool?.type === "concentrated") {
    return (
      <>
        {showSuperfluidValidatorModal &&
          addConliqConfig.shouldBeSuperfluidStaked && (
            <SuperfluidValidatorModal
              isOpen={true}
              onRequestClose={() => setShowSuperfluidValidatorModal(false)}
              onSelectValidator={(address) =>
                addConLiquidity(address).then(() => props.onRequestClose())
              }
              ctaLabel={t("addConcentratedLiquidity.buttonCreateAndStake")}
            />
          )}
        <ModalBase
          {...props}
          isOpen={
            props.isOpen && showModalBase && !showSuperfluidValidatorModal
          }
          hideCloseButton
          className="max-h-[98vh] !max-w-[57.5rem] overflow-auto"
        >
          <AddConcLiquidity
            addLiquidityConfig={addConliqConfig}
            actionButton={accountActionButton}
            onRequestClose={props.onRequestClose}
          />
        </ModalBase>
      </>
    );
  }

  // add share pool liquidity
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
      />
    </ModalBase>
  );
});
