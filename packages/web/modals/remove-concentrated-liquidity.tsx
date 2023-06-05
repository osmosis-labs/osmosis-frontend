import { CoinPretty, Dec, PricePretty } from "@keplr-wallet/unit";
import { ConcentratedLiquidityPool } from "@osmosis-labs/pools";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import React, { FunctionComponent, ReactNode } from "react";
import { useTranslation } from "react-multi-lang";

import { Icon } from "~/components/assets";
import IconButton from "~/components/buttons/icon-button";
import { MyPositionStatus } from "~/components/cards/my-position/status";
import { Slider } from "~/components/control";
import { tError } from "~/components/localization";
import { useConnectWalletModalRedirect } from "~/hooks";
import { useRemoveConcentratedLiquidityConfig } from "~/hooks/ui-config/use-remove-concentrated-liquidity-config";
import { useStore } from "~/stores";

import { ModalBase, ModalBaseProps } from "./base";

export const RemoveConcentratedLiquidityModal: FunctionComponent<
  {
    poolId: string;
    positionIds: string[];
    baseAmount: CoinPretty;
    quoteAmount: CoinPretty;
    lowerPrice: Dec;
    upperPrice: Dec;
    passive: boolean;
  } & ModalBaseProps
> = observer((props) => {
  const { lowerPrice, upperPrice, poolId, baseAmount, quoteAmount } = props;

  const t = useTranslation();
  const {
    chainStore,
    accountStore,
    derivedDataStore,
    queriesStore,
    priceStore,
  } = useStore();

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
      disabled: config.error !== undefined || isSendingMsg,
      onClick: () => {
        return removeLiquidity().finally(() => props.onRequestClose());
      },
      children: config.error
        ? t(...tError(config.error))
        : t("clPositions.removeLiquidity"),
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

  const fiatBase =
    baseCurrency &&
    priceStore.calculatePrice(
      new CoinPretty(
        baseCurrency,
        baseAmount.mul(new Dec(10 ** baseCurrency.coinDecimals))
      )
    );

  const fiatQuote =
    quoteCurrency &&
    priceStore.calculatePrice(
      new CoinPretty(
        quoteCurrency,
        quoteAmount.mul(new Dec(10 ** quoteCurrency.coinDecimals))
      )
    );

  const fiatCurrency =
    priceStore.supportedVsCurrencies[priceStore.defaultVsCurrency];

  const totalFiat =
    fiatCurrency &&
    fiatBase &&
    fiatQuote &&
    new PricePretty(fiatCurrency, fiatBase.add(fiatQuote)).mul(
      new Dec(config.percentage)
    );

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
          {baseCurrency && <AssetAmount amount={baseAmount} />}
          {quoteCurrency && <AssetAmount amount={quoteAmount} />}
        </div>
      </div>
      <div className="flex w-full flex-col items-center gap-9">
        <h2>
          {fiatCurrency?.symbol}
          {totalFiat?.toDec().toString(2) ?? "0"}
        </h2>
        <div className="flex w-full flex-col items-center gap-6">
          <Slider
            className="w-[360px]"
            inputClassName="!w-[360px]"
            currentValue={Math.round(config.percentage * 100)}
            onInput={(value) => {
              config.setPercentage(Number((value / 100).toFixed(2)));
            }}
            min={0}
            max={100}
            step={1}
            useSuperchargedGradient
          />
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
              {t("components.MAX")}
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
            <AssetAmount
              className="!text-body2 !font-body2"
              amount={baseAmount.mul(new Dec(config.percentage))}
            />
          )}
          {quoteCurrency && (
            <AssetAmount
              className="!text-body2 !font-body2"
              amount={quoteAmount.mul(new Dec(config.percentage))}
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

export const AssetAmount: FunctionComponent<{
  amount: CoinPretty;
  className?: string;
}> = (props) => (
  <div
    className={classNames(
      "flex flex-row items-center gap-2 text-subtitle1 font-subtitle1",
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
    <span>{props.amount.trim(true).toString()}</span>
  </div>
);
