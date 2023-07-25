import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { ConcentratedLiquidityPool } from "@osmosis-labs/pools";
import { ObservableQueryLiquidityPositionById } from "@osmosis-labs/stores";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import React, { FunctionComponent, ReactNode } from "react";
import { useTranslation } from "react-multi-lang";

import { MyPositionStatus } from "~/components/cards/my-position/status";
import { Slider } from "~/components/control";
import { tError } from "~/components/localization";
import { useConnectWalletModalRedirect } from "~/hooks";
import { useRemoveConcentratedLiquidityConfig } from "~/hooks/ui-config/use-remove-concentrated-liquidity-config";
import { ModalBase, ModalBaseProps } from "~/modals/base";
import { useStore } from "~/stores";

export const RemoveConcentratedLiquidityModal: FunctionComponent<
  {
    poolId: string;
    position: ObservableQueryLiquidityPositionById;
  } & ModalBaseProps
> = observer((props) => {
  const {
    lowerPrices,
    upperPrices,
    baseAsset: positionBaseAsset,
    quoteAsset: positionQuoteAsset,
  } = props.position;

  const t = useTranslation();
  const { chainStore, accountStore, queriesStore, priceStore } = useStore();

  const { chainId } = chainStore.osmosis;
  const account = accountStore.getWallet(chainId);
  const isSendingMsg = account?.txTypeInProgress !== "";

  const osmosisQueries = queriesStore.get(chainStore.osmosis.chainId).osmosis!;

  const { config, removeLiquidity } = useRemoveConcentratedLiquidityConfig(
    chainStore,
    chainId,
    props.poolId,
    props.position.id
  );

  const { showModalBase, accountActionButton } = useConnectWalletModalRedirect(
    {
      disabled: config.error !== undefined || isSendingMsg,
      onClick: () => {
        return removeLiquidity()
          .catch(console.error)
          .finally(() => props.onRequestClose());
      },
      children: config.error
        ? t(...tError(config.error))
        : t("clPositions.removeLiquidity"),
    },
    props.onRequestClose
  );

  const baseAsset = config.effectiveLiquidityAmounts?.base;
  const quoteAsset = config.effectiveLiquidityAmounts?.quote;

  const queryPool = osmosisQueries.queryPools.getPool(props.poolId);
  const clPool =
    queryPool?.pool && queryPool.pool instanceof ConcentratedLiquidityPool
      ? queryPool.pool
      : undefined;
  const currentSqrtPrice = clPool ? clPool.currentSqrtPrice : undefined;
  const currentPrice = currentSqrtPrice
    ? queryPool?.concentratedLiquidityPoolInfo?.currentPrice ?? new Dec(0)
    : new Dec(0);

  const baseAssetValue = baseAsset
    ? priceStore.calculatePrice(baseAsset)
    : undefined;

  const quoteAssetValue = quoteAsset
    ? priceStore.calculatePrice(quoteAsset)
    : undefined;

  const fiatCurrency =
    priceStore.supportedVsCurrencies[priceStore.defaultVsCurrency];

  const totalFiat =
    baseAssetValue && quoteAssetValue
      ? baseAssetValue.add(quoteAssetValue)
      : undefined;

  return (
    <ModalBase
      {...props}
      isOpen={props.isOpen && showModalBase}
      className="!max-w-[500px]"
      title={t("clPositions.removeLiquidity")}
    >
      <div className="pt-8">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="pl-4 text-subtitle1 font-subtitle1 xs:pl-0">
              {t("clPositions.yourPosition")}
            </div>
            {lowerPrices && upperPrices && (
              <MyPositionStatus
                currentPrice={currentPrice}
                lowerPrice={lowerPrices.price}
                upperPrice={upperPrices.price}
                negative
                className="xs:px-0"
              />
            )}
          </div>
          <div className="mb-8 flex justify-between rounded-[12px] bg-osmoverse-700 py-3 px-5 text-osmoverse-100 xs:flex-wrap xs:gap-y-2 xs:px-3">
            {positionBaseAsset && <AssetAmount amount={positionBaseAsset} />}
            {positionQuoteAsset && <AssetAmount amount={positionQuoteAsset} />}
          </div>
        </div>
      </div>
      <div className="flex w-full flex-col items-center gap-9">
        <h2>
          {fiatCurrency?.symbol}
          {totalFiat?.toDec().toString(2) ?? "0"}
        </h2>
        <div className="flex w-full flex-col items-center gap-6">
          <Slider
            className="w-[360px] xs:!w-[280px]"
            inputClassName="!w-[360px] xs:!w-[280px]"
            currentValue={Math.round(config.percentage * 100)}
            onInput={(value) => {
              config.setPercentage(Number((value / 100).toFixed(2)));
            }}
            min={0}
            max={100}
            step={1}
            useSuperchargedGradient
          />
          <div className="flex w-full gap-2 px-5">
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
              {t("components.MAX")}
            </PresetPercentageButton>
          </div>
        </div>
        <div className="mt-8 flex w-full flex-col gap-3 py-3">
          <div className="pl-4 text-subtitle1 font-subtitle1 xl:pl-1">
            {t("clPositions.pendingRewards")}
          </div>
          <div className="flex justify-between gap-3 rounded-[12px] border-[1.5px]  border-osmoverse-700 px-5 py-3 xs:flex-wrap xs:gap-y-2 xs:px-3">
            {baseAsset && (
              <AssetAmount
                className="!text-body2 !font-body2"
                amount={baseAsset}
              />
            )}
            {quoteAsset && (
              <AssetAmount
                className="!text-body2 !font-body2"
                amount={quoteAsset}
              />
            )}
          </div>
        </div>
        {accountActionButton}
      </div>
    </ModalBase>
  );
});

const PresetPercentageButton: FunctionComponent<{
  children: ReactNode;
  selected?: boolean;
  onClick: () => void;
}> = ({ selected, children, onClick }) => {
  return (
    <button
      className={classNames(
        "flex flex-1 cursor-pointer items-center justify-center",
        "rounded-[8px] bg-osmoverse-700 px-5 py-2 text-h6 font-h6 text-wosmongton-100 hover:bg-osmoverse-600 xs:px-3 xs:text-subtitle1",
        "whitespace-nowrap",
        {
          "!bg-osmoverse-600": selected,
        }
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export const AssetAmount: FunctionComponent<{
  amount: CoinPretty;
  className?: string;
}> = (props) => (
  <div
    className={classNames(
      "flex items-center gap-2 text-subtitle1 font-subtitle1 xs:text-body2",
      props.className
    )}
  >
    {props.amount.currency.coinImageUrl && (
      <Image
        alt="coin image"
        src={props.amount.currency.coinImageUrl}
        height={24}
        width={24}
      />
    )}
    <span>{props.amount.trim(true).maxDecimals(8).toString()}</span>
  </div>
);
