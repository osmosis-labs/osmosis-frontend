import { Dec } from "@keplr-wallet/unit";
import { ConcentratedLiquidityPool } from "@osmosis-labs/pools";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, ReactNode } from "react";
import { useTranslation } from "react-multi-lang";

import { Icon } from "~/components/assets";
import IconButton from "~/components/buttons/icon-button";
import MyPositionStatus from "~/components/my-position-card/position-status";
import { useConnectWalletModalRedirect } from "~/hooks";
import { useRemoveConcentratedLiquidityConfig } from "~/hooks/ui-config/use-remove-concentrated-liquidity-config";
import { useStore } from "~/stores";

import { ModalBase, ModalBaseProps } from "./base";

export const RemoveConcentratedLiquidityModal: FunctionComponent<
  {
    poolId: string;
    positionIds: string[];
    baseAmount: Dec;
    quoteAmount: Dec;
    lowerPrice: Dec;
    upperPrice: Dec;
    passive: boolean;
  } & ModalBaseProps
> = observer((props) => {
  const { lowerPrice, upperPrice, poolId, baseAmount, quoteAmount } = props;

  const t = useTranslation();
  const { chainStore, accountStore, derivedDataStore, queriesStore } =
    useStore();

  const { chainId } = chainStore.osmosis;
  const account = accountStore.getAccount(chainId);
  const isSendingMsg = account.txTypeInProgress !== "";

  const { config, removeLiquidity } = useRemoveConcentratedLiquidityConfig(
    chainStore,
    chainId,
    poolId,
    queriesStore
  );

  const { showModalBase, accountActionButton } = useConnectWalletModalRedirect(
    {
      disabled: isSendingMsg,
      onClick: () => {
        return removeLiquidity().finally(() => props.onRequestClose());
      },
      children: t("clPositions.removeLiquidity"),
    },
    props.onRequestClose
  );

  const { poolDetail } = derivedDataStore.getForPool(poolId as string);
  const pool = poolDetail?.pool;
  const clPool = poolDetail?.pool?.pool as ConcentratedLiquidityPool;
  const isConcLiq = pool?.type === "concentrated";
  const currentSqrtPrice = isConcLiq && clPool.currentSqrtPrice;
  const currentPrice = currentSqrtPrice
    ? currentSqrtPrice.mul(currentSqrtPrice)
    : new Dec(0);

  const baseCurrency = chainStore
    .getChain(chainId)
    .findCurrency(clPool.poolAssetDenoms[0]);
  const quoteCurrency = chainStore
    .getChain(chainId)
    .findCurrency(clPool.poolAssetDenoms[1]);

  return (
    <ModalBase
      {...props}
      isOpen={props.isOpen && showModalBase}
      hideCloseButton
      className="!max-w-[500px]"
    >
      <div className="align-center relative mb-8 flex flex-row">
        <div className="absolute left-0 flex h-full items-center text-sm" />
        <h6 className="flex-1 text-center">
          {t("clPositions.removeLiquidity")}
        </h6>
        <div className="absolute right-0">
          <IconButton
            aria-label="Close"
            mode="unstyled"
            size="unstyled"
            className="!p-0"
            icon={
              <Icon
                id="close-thin"
                className="text-wosmongton-400 hover:text-wosmongton-100"
                height={24}
                width={24}
              />
            }
            onClick={props.onRequestClose}
          />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex flex-row items-center justify-between">
          <div className="pl-4 text-subtitle1 font-subtitle1">
            {t("clPositions.yourPosition")}
          </div>
          <MyPositionStatus
            currentPrice={currentPrice}
            lowerPrice={lowerPrice}
            upperPrice={upperPrice}
            negative
          />
        </div>
        <div className="mb-8 flex flex-row justify-between rounded-[12px] bg-osmoverse-700 py-3 px-5 text-osmoverse-100">
          {baseCurrency && (
            <AssetAmountGroup
              amount={baseAmount}
              coinImageUrl={baseCurrency.coinImageUrl}
              coinMinimalDenom={baseCurrency.coinMinimalDenom}
              coinDenom={baseCurrency.coinDenom}
            />
          )}
          {quoteCurrency && (
            <AssetAmountGroup
              amount={quoteAmount}
              coinImageUrl={quoteCurrency.coinImageUrl}
              coinMinimalDenom={quoteCurrency.coinMinimalDenom}
              coinDenom={quoteCurrency.coinDenom}
            />
          )}
        </div>
      </div>
      <div className="flex w-full flex-col items-center gap-9">
        <h2>$17,365</h2>
        <div className="flex w-full flex-col items-center gap-6">
          <div className="relative flex w-[360px] flex-row items-center justify-center">
            <div className="h-2 w-[360px] rounded-[6px] bg-osmoverse-700" />
            <div
              className={classNames(
                "absolute h-6 w-6 cursor-pointer rounded-full bg-osmoverse-100"
              )}
              style={{ left: `${config.percentage * 360 - 12}px` }}
              draggable
            />
          </div>
          <div className="flex w-full flex-row gap-2 px-5">
            <PresetPercentageButton onClick={() => config.setPercentage(0.25)}>
              25%
            </PresetPercentageButton>
            <PresetPercentageButton onClick={() => config.setPercentage(0.5)}>
              50%
            </PresetPercentageButton>
            <PresetPercentageButton onClick={() => config.setPercentage(0.75)}>
              75%
            </PresetPercentageButton>
            <PresetPercentageButton onClick={() => config.setPercentage(1)}>
              MAX
            </PresetPercentageButton>
          </div>
        </div>
      </div>
      <div className="mt-8 flex flex-col gap-3 py-3">
        <div className="pl-4 text-subtitle1 font-subtitle1">
          {t("clPositions.pendingRewards")}
        </div>
        <div className="flex flex-row justify-between gap-3 rounded-[12px] border-[1.5px]  border-osmoverse-700 px-5 py-3">
          {baseCurrency && (
            <AssetAmountGroup
              className="!text-body2 !font-body2"
              amount={baseAmount.mul(new Dec(config.percentage))}
              coinImageUrl={baseCurrency.coinImageUrl}
              coinMinimalDenom={baseCurrency.coinMinimalDenom}
              coinDenom={baseCurrency.coinDenom}
            />
          )}
          {quoteCurrency && (
            <AssetAmountGroup
              className="!text-body2 !font-body2"
              amount={quoteAmount.mul(new Dec(config.percentage))}
              coinImageUrl={quoteCurrency.coinImageUrl}
              coinMinimalDenom={quoteCurrency.coinMinimalDenom}
              coinDenom={quoteCurrency.coinDenom}
            />
          )}
        </div>
      </div>
      {accountActionButton}
    </ModalBase>
  );
});

function PresetPercentageButton(props: {
  children: ReactNode;
  selected?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={classNames(
        "flex flex-1 cursor-pointer flex-row items-center justify-center",
        "rounded-[8px] bg-osmoverse-700 px-5 py-2 text-h6 font-h6 hover:bg-osmoverse-600",
        "whitespace-nowrap",
        {
          "!bg-osmoverse-600": props.selected,
        }
      )}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
}

function AssetAmountGroup(props: {
  coinImageUrl?: string;
  coinMinimalDenom?: string;
  coinDenom: string;
  amount: Dec;
  className?: string;
}) {
  return (
    <div
      className={classNames(
        "flex flex-row items-center gap-2 text-subtitle1 font-subtitle1",
        props.className
      )}
    >
      <img className="h-[1.5rem] w-[1.5rem]" src={props.coinImageUrl} />
      <span>
        {props.amount.toString(
          props.coinMinimalDenom ? 2 : Number(props.coinMinimalDenom)
        )}
      </span>
      <span>{props.coinDenom}</span>
    </div>
  );
}
