import { CoinPretty, PricePretty } from "@keplr-wallet/unit";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import React, { FunctionComponent, ReactNode } from "react";

import { MyPositionStatus } from "~/components/cards/my-position/status";
import SkeletonLoader from "~/components/loaders/skeleton-loader";
import { tError } from "~/components/localization";
import { Slider } from "~/components/ui/slider";
import { useTranslation } from "~/hooks";
import { useConnectWalletModalRedirect } from "~/hooks";
import { useCoinPrice } from "~/hooks/queries/assets/use-coin-price";
import { useRemoveConcentratedLiquidityConfig } from "~/hooks/ui-config/use-remove-concentrated-liquidity-config";
import { ModalBase, ModalBaseProps } from "~/modals/base";
import { DEFAULT_VS_CURRENCY } from "~/server/queries/complex/assets/config";
import type {
  ClPositionDetails,
  PositionHistoricalPerformance,
  UserPosition,
} from "~/server/queries/complex/concentrated-liquidity";
import { useStore } from "~/stores";
import { formatPretty } from "~/utils/formatter";

export const RemoveConcentratedLiquidityModal: FunctionComponent<
  {
    poolId: string;
    position: UserPosition;
    status: ClPositionDetails["status"];
    claimableRewardCoins: PositionHistoricalPerformance["claimableRewardCoins"];
  } & ModalBaseProps
> = observer((props) => {
  const {
    poolId,
    status,
    claimableRewardCoins,
    position: {
      currentCoins: [positionBaseAsset, positionQuoteAsset],
    },
  } = props;

  const { t } = useTranslation();
  const { chainStore, accountStore } = useStore();

  const { chainId } = chainStore.osmosis;
  const account = accountStore.getWallet(chainId);
  const isSendingMsg = account?.txTypeInProgress !== "";

  const { config, removeLiquidity } = useRemoveConcentratedLiquidityConfig(
    chainStore,
    chainId,
    poolId,
    props.position
  );

  const baseAsset = config.effectiveLiquidityAmounts?.base;
  const quoteAsset = config.effectiveLiquidityAmounts?.quote;

  const { price: baseAssetPrice, isLoading: isLoadingBaseAssetPrice } =
    useCoinPrice(baseAsset);
  const { price: quoteAssetPrice, isLoading: isLoadingQuoteAssetPrice } =
    useCoinPrice(quoteAsset);

  const baseAssetValue =
    baseAssetPrice && baseAsset
      ? new PricePretty(
          DEFAULT_VS_CURRENCY,
          baseAsset.toDec().mul(baseAssetPrice.toDec())
        )
      : undefined;
  const quoteAssetValue =
    quoteAssetPrice && quoteAsset
      ? new PricePretty(
          DEFAULT_VS_CURRENCY,
          quoteAsset.toDec().mul(quoteAssetPrice.toDec())
        )
      : undefined;

  const { showModalBase, accountActionButton } = useConnectWalletModalRedirect(
    {
      disabled: config.error !== undefined || isSendingMsg,
      onClick: () =>
        removeLiquidity()
          .then(() => props.onRequestClose())
          .catch(console.error),
      children: config.error
        ? t(...tError(config.error))
        : t("clPositions.removeLiquidity"),
    },
    props.onRequestClose
  );

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
            <MyPositionStatus className="xs:px-0" status={status} negative />
          </div>
          <div className="mb-8 flex justify-between rounded-xl bg-osmoverse-700 py-3 px-5 text-osmoverse-100 xs:flex-wrap xs:gap-y-2 xs:px-3">
            <AssetAmount amount={positionBaseAsset} />
            <AssetAmount amount={positionQuoteAsset} />
          </div>
        </div>
      </div>
      <div className="flex w-full flex-col items-center gap-9">
        <SkeletonLoader
          isLoaded={!isLoadingBaseAssetPrice || !isLoadingQuoteAssetPrice}
        >
          <h2>
            {DEFAULT_VS_CURRENCY.symbol}
            {totalFiat?.toDec().toString(2) ?? "0.00"}
          </h2>
        </SkeletonLoader>
        <div className="flex w-full flex-col items-center gap-6">
          <Slider
            variant="secondary"
            value={[Math.round(config.percentage * 100)]}
            onValueChange={(value: number[]) => {
              config.setPercentage(Number((value[0] / 100).toFixed(2)));
            }}
            min={0}
            max={100}
            step={1}
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
        {(claimableRewardCoins?.length ?? 0) > 0 && (
          <div className="mt-8 flex w-full flex-col gap-3 py-3">
            <div className="pl-4 text-subtitle1 font-subtitle1 xl:pl-1">
              {t("clPositions.pendingRewards")}
            </div>
            <div className="flex flex-wrap justify-between gap-3 rounded-xl border-[1.5px]  border-osmoverse-700 px-5 py-3 xs:flex-wrap xs:gap-y-2 xs:px-3">
              {claimableRewardCoins?.map((coin) => (
                <AssetAmount
                  key={coin.currency.coinMinimalDenom}
                  className="!text-body2 !font-body2"
                  amount={coin}
                />
              ))}
            </div>
          </div>
        )}
        {accountActionButton}
      </div>
    </ModalBase>
  );
});

const PresetPercentageButton: FunctionComponent<{
  children: ReactNode;
  selected?: boolean;
  onClick: () => void;
  disabled?: boolean;
}> = ({ selected, children, onClick, disabled }) => {
  return (
    <button
      className={classNames(
        "flex flex-1 cursor-pointer items-center justify-center",
        "rounded-lg bg-osmoverse-700 px-5 py-2 text-h6 font-h6 text-wosmongton-100 hover:bg-osmoverse-600 xs:px-3 xs:text-subtitle1",
        "whitespace-nowrap",
        {
          "!bg-osmoverse-600": selected,
        }
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export const AssetAmount: FunctionComponent<{
  amount: CoinPretty;
  className?: string;
}> = ({ amount, className }) => (
  <div
    className={classNames(
      "flex shrink-0 items-center gap-2 text-subtitle1 font-subtitle1 xs:text-body2",
      className
    )}
  >
    {amount.currency.coinImageUrl && (
      <Image
        alt="coin image"
        src={amount.currency.coinImageUrl}
        height={24}
        width={24}
      />
    )}
    <span>{formatPretty(amount, { maxDecimals: 2 })}</span>
  </div>
);
