import { CoinPretty, Dec, DecUtils, PricePretty } from "@keplr-wallet/unit";
import {
  ObservableAddConcentratedLiquidityConfig,
  ObservableQueryPool,
  QuasarVault,
} from "@osmosis-labs/stores";
import classNames from "classnames";
import debounce from "debounce";
import { observer } from "mobx-react-lite";
import dynamic from "next/dynamic";
import Image from "next/image";
import React, {
  FunctionComponent,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Icon, PoolAssetsIcon, PoolAssetsName } from "~/components/assets";
import { Button } from "~/components/buttons";
import { ChartButton } from "~/components/buttons";
import IconButton from "~/components/buttons/icon-button";
import {
  ChartUnavailable,
  PriceChartHeader,
} from "~/components/chart/token-pair-historical";
import { DepositAmountGroup } from "~/components/cl-deposit-input-group";
import { Pill } from "~/components/indicators/pill";
import { InputBox } from "~/components/input";
import Spinner from "~/components/spinner";
import { CustomClasses } from "~/components/types";
import { EventName } from "~/config";
import { useTranslation } from "~/hooks";
import { useAmplitudeAnalytics } from "~/hooks";
import { useHistoricalAndLiquidityData } from "~/hooks/ui-config/use-historical-and-depth-data";
import { useStore } from "~/stores";
import { ObservableHistoricalAndLiquidityData } from "~/stores/derived-data";
import { formatPretty } from "~/utils/formatter";

import { CheckBox } from "../control";
import { Tooltip } from "../tooltip";

const ConcentratedLiquidityDepthChart = dynamic(
  () => import("~/components/chart/concentrated-liquidity-depth"),
  { ssr: false }
);
const TokenPairHistoricalChart = dynamic(
  () => import("~/components/chart/token-pair-historical"),
  { ssr: false }
);

export const AddConcLiquidity: FunctionComponent<
  {
    addLiquidityConfig: ObservableAddConcentratedLiquidityConfig;
    actionButton: ReactNode;
    getFiatValue?: (coin: CoinPretty) => PricePretty | undefined;
    onRequestClose: () => void;
  } & CustomClasses
> = observer(
  ({
    className,
    addLiquidityConfig,
    actionButton,
    getFiatValue,
    onRequestClose,
  }) => {
    const { poolId } = addLiquidityConfig;
    const {
      queriesStore,
      chainStore: {
        osmosis: { chainId },
      },
      queriesExternalStore,
    } = useStore();

    const { queryQuasarVaults } = queriesExternalStore;
    const { vaults: quasarVaults } = queryQuasarVaults.get(poolId);

    // initialize pool data stores once root pool store is loaded
    const pool = queriesStore.get(chainId).osmosis!.queryPools.getPool(poolId);

    return (
      <div
        className={classNames(
          "flex flex-col",
          addLiquidityConfig.modalView === "overview" ? "gap-8" : "gap-5",
          className
        )}
      >
        {(() => {
          switch (addLiquidityConfig.modalView) {
            case "overview":
              return (
                <Overview
                  pool={pool}
                  quasarVaults={quasarVaults}
                  addLiquidityConfig={addLiquidityConfig}
                  onRequestClose={onRequestClose}
                />
              );
            case "add_manual":
              return (
                <AddConcLiqView
                  getFiatValue={getFiatValue}
                  pool={pool}
                  addLiquidityConfig={addLiquidityConfig}
                  actionButton={actionButton}
                />
              );
            case "add_managed":
              return (
                <AddConcLiqManaged
                  quasarVaults={quasarVaults}
                  addLiquidityConfig={addLiquidityConfig}
                />
              );
          }
        })()}
      </div>
    );
  }
);

const Overview: FunctionComponent<
  {
    pool?: ObservableQueryPool;
    quasarVaults: QuasarVault[];
    addLiquidityConfig: ObservableAddConcentratedLiquidityConfig;
    onRequestClose: () => void;
  } & CustomClasses
> = observer(({ addLiquidityConfig, quasarVaults, pool, onRequestClose }) => {
  const { priceStore, queriesExternalStore, derivedDataStore } = useStore();
  const { t } = useTranslation();
  const [selected, selectView] =
    useState<typeof addLiquidityConfig.modalView>("add_manual");
  const queryPoolFeeMetrics = queriesExternalStore.queryPoolFeeMetrics;

  const superfluidPoolDetail = derivedDataStore.superfluidPoolDetails.get(
    addLiquidityConfig.poolId
  );

  const hasProvidersVaults = quasarVaults.length;

  return (
    <>
      <div className="align-center relative flex flex-row">
        <div className="absolute left-0 flex h-full items-center text-sm" />
        <h6 className="flex-1 text-center">
          {t("addConcentratedLiquidity.step1Title")}
        </h6>
        <div className="absolute right-0">
          <IconButton
            aria-label="Close"
            mode="unstyled"
            size="unstyled"
            className="!p-0"
            icon={
              <Icon
                id="close"
                className="text-osmoverse-400 hover:text-white-full"
                width={32}
                height={32}
              />
            }
            onClick={onRequestClose}
          />
        </div>
      </div>
      <div className="flex rounded-[1rem] bg-osmoverse-700/[.3] px-[28px] py-4 md:flex-col md:items-center md:gap-2 xs:items-start">
        <div className="flex flex-1 flex-col gap-1">
          <div className="flex flex-nowrap items-center gap-2">
            {pool && (
              <>
                <PoolAssetsIcon
                  assets={pool.poolAssets.map(
                    (asset: { amount: CoinPretty }) => ({
                      coinDenom: asset.amount.denom,
                      coinImageUrl: asset.amount.currency.coinImageUrl,
                    })
                  )}
                  size="sm"
                />
                <PoolAssetsName
                  size="md"
                  className="max-w-xs truncate"
                  assetDenoms={pool.poolAssets.map(
                    (asset: { amount: CoinPretty }) => asset.amount.denom
                  )}
                />
              </>
            )}
          </div>
          {superfluidPoolDetail?.isSuperfluid && (
            <span className="body2 text-superfluid-gradient">
              {t("pool.superfluidEnabled")}
            </span>
          )}
        </div>
        <div className="flex items-center gap-10 xs:flex-wrap xs:gap-y-4 xs:gap-x-6">
          <div className="gap-[3px]">
            <span className="body2 text-osmoverse-400">
              {t("pool.24hrTradingVolume")}
            </span>
            <h6 className="text-osmoverse-100">
              {queryPoolFeeMetrics
                .getPoolFeesMetrics(addLiquidityConfig.poolId, priceStore)
                .volume24h.toString()}
            </h6>
          </div>
          <div className="gap-[3px]">
            <span className="body2 text-osmoverse-400">
              {t("pool.liquidity")}
            </span>
            <h6 className="text-osmoverse-100">
              {pool?.computeTotalValueLocked(priceStore).toString()}
            </h6>
          </div>
          <div className="gap-[3px]">
            <span className="body2 text-osmoverse-400">
              {t("pool.spreadFactor")}
            </span>
            <h6 className="text-osmoverse-100">{pool?.swapFee.toString()}</h6>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <div className="flex justify-center gap-[12px] xs:flex-col">
          <div>
            {hasProvidersVaults ? (
              <StrategySelector
                title={t("addConcentratedLiquidity.managed")}
                description={t("addConcentratedLiquidity.managedDescription")}
                selected={selected === "add_managed"}
                onClick={() => selectView("add_managed")}
                imgSrc={`${process.env.NEXT_PUBLIC_BASEPATH}/images/cl-pool-providers.png`}
                isNew
              />
            ) : (
              <StrategySelector
                title={t("addConcentratedLiquidity.managed")}
                description={t("addConcentratedLiquidity.managedDescription")}
                selected={selected === "add_managed"}
                imgSrc={`${process.env.NEXT_PUBLIC_BASEPATH}/images/cl-managed-pick-strategy.png`}
              />
            )}
          </div>
          <div>
            <StrategySelector
              title={t("addConcentratedLiquidity.manual")}
              description={t("addConcentratedLiquidity.manualDescription")}
              selected={selected === "add_manual"}
              onClick={() => selectView("add_manual")}
              imgSrc={`${process.env.NEXT_PUBLIC_BASEPATH}/images/cl-manual-pick-strategy.png`}
            />
          </div>
        </div>
      </div>
      <div className="flex w-full items-center justify-center">
        <Button
          className="w-[25rem]"
          onClick={() => {
            addLiquidityConfig.setModalView(selected);
          }}
        >
          {t("pools.createPool.buttonNext")}
        </Button>
      </div>
    </>
  );
});

const StrategySelector: FunctionComponent<{
  title: string;
  description: string;
  selected: boolean;
  onClick?: () => void;
  imgSrc: string;
  isNew?: boolean;
}> = (props) => {
  const { selected, onClick, title, description, imgSrc, isNew } = props;
  const { t } = useTranslation();
  return (
    <div
      className={classNames(
        "flex flex-1 flex-col items-center justify-center gap-4 rounded-[20px] bg-osmoverse-700/[.6] p-[2px]",
        {
          "bg-supercharged": selected,
          "cursor-pointer hover:bg-supercharged": onClick,
        }
      )}
      onClick={onClick}
    >
      <div
        className={classNames(
          "flex h-full w-full flex-col items-center justify-center gap-[20px] rounded-[19px] py-8 px-4",
          {
            "bg-osmoverse-700": Boolean(onClick),
          }
        )}
      >
        <div className="flex items-center justify-center gap-2 text-h6 font-h6">
          {title}
          {isNew && (
            <Pill>
              <span className="button py-[4px]">{t("new")}</span>
            </Pill>
          )}
        </div>
        <Image
          alt={title}
          src={imgSrc}
          width={354}
          height={180}
          className="rounded-[1rem]"
        />
        <div className="body2 text-center text-osmoverse-200">
          {description}
        </div>
      </div>
    </div>
  );
};

const AddConcLiqView: FunctionComponent<
  {
    pool?: ObservableQueryPool;
    addLiquidityConfig: ObservableAddConcentratedLiquidityConfig;
    actionButton: ReactNode;
    getFiatValue?: (coin: CoinPretty) => PricePretty | undefined;
  } & CustomClasses
> = observer(({ addLiquidityConfig, actionButton, getFiatValue, pool }) => {
  const {
    poolId,
    rangeWithCurrencyDecimals,
    fullRange,
    baseDepositAmountIn,
    quoteDepositAmountIn,
    baseDepositOnly,
    quoteDepositOnly,
    depositPercentages,
    currentPriceWithDecimals,
    shouldBeSuperfluidStaked,
    tickRange,
    error: addLiqError,
    setElectSuperfluidStaking,
    setModalView,
    setMaxRange,
    setMinRange,
    setAnchorAsset,
    setBaseDepositAmountMax,
    setQuoteDepositAmountMax,
  } = addLiquidityConfig;

  const { t } = useTranslation();
  const highSpotPriceInputRef = useRef<HTMLInputElement>(null);

  const { chainStore, derivedDataStore, queriesExternalStore } = useStore();
  const { chainId } = chainStore.osmosis;
  const chartConfig = useHistoricalAndLiquidityData(chainId, poolId);

  const superfluidPoolDetail =
    derivedDataStore.superfluidPoolDetails.get(poolId);

  const { yRange, xRange, depthChartData } = chartConfig;

  const sfStakingDisabled = !fullRange || Boolean(addLiqError);

  const queryCurrentRangeApr = fullRange
    ? queriesExternalStore.queryPriceRangeAprs.get(poolId)
    : queriesExternalStore.queryPriceRangeAprs.get(
        poolId,
        tickRange[0],
        tickRange[1]
      );
  // sync the price range of the add liq config and the chart config
  // sync the initial hover price
  // TODO: this is a code smell. the chart config should observe the add liq config
  //        this may be acieved by using an interface
  useEffect(() => {
    chartConfig.setPriceRange(rangeWithCurrencyDecimals);
  }, [chartConfig, rangeWithCurrencyDecimals]);

  return (
    <>
      <div className="align-center relative flex flex-row xs:items-center xs:gap-4">
        <button
          className="absolute left-0 flex h-full cursor-pointer items-center xs:static"
          onClick={() => setModalView("overview")}
        >
          <Image
            alt="left"
            src={`${process.env.NEXT_PUBLIC_BASEPATH}/icons/arrow-left.svg`}
            width={24}
            height={24}
          />
          <span className="body2 pl-1 text-osmoverse-100">
            {t("addConcentratedLiquidity.back")}
          </span>
        </button>
        <h6 className="mx-auto whitespace-nowrap">
          {t("addConcentratedLiquidity.step2Title")}
        </h6>
        <span className="caption absolute right-0 flex h-full items-center text-osmoverse-200 md:hidden">
          {t("addConcentratedLiquidity.priceShownIn", {
            base: baseDepositAmountIn.sendCurrency.coinDenom,
            quote: quoteDepositAmountIn.sendCurrency.coinDenom,
          })}
        </span>
      </div>
      <div className="flex flex-col">
        <span className="subtitle1 px-4 pb-3">
          {t("addConcentratedLiquidity.priceRange")}
        </span>
        <div className="flex w-full gap-1">
          <div className="flex h-[20.1875rem] flex-grow flex-col gap-[20px] rounded-l-2xl bg-osmoverse-700 py-7 pl-6 md:hidden">
            {chartConfig.queryTokenPairPrice.isFetching ? (
              <Spinner className="m-auto" />
            ) : chartConfig.historicalChartUnavailable ? (
              <ChartUnavailable />
            ) : (
              <>
                <ChartHeader
                  chartConfig={chartConfig}
                  addLiquidityConfig={addLiquidityConfig}
                />
                <Chart
                  chartConfig={chartConfig}
                  addLiquidityConfig={addLiquidityConfig}
                />
              </>
            )}
          </div>
          <div className="relative flex h-[20.1875rem] w-96 rounded-r-2xl bg-osmoverse-700 md:rounded-l-2xl">
            <div className="flex flex-1 flex-col">
              <div className="mt-7 mr-6 mb-8 flex h-6 justify-end gap-1 xs:ml-4">
                <ChartButton
                  alt="refresh"
                  icon="refresh-ccw"
                  selected={false}
                  onClick={() => chartConfig.resetZoom()}
                />
                <ChartButton
                  alt="zoom out"
                  icon="zoom-out"
                  selected={false}
                  onClick={chartConfig.zoomOut}
                />
                <ChartButton
                  alt="zoom in"
                  icon="zoom-in"
                  selected={false}
                  onClick={chartConfig.zoomIn}
                />
              </div>
              <ConcentratedLiquidityDepthChart
                min={Number(rangeWithCurrencyDecimals[0].toString())}
                max={Number(rangeWithCurrencyDecimals[1].toString())}
                yRange={yRange}
                xRange={xRange}
                data={depthChartData}
                annotationDatum={useMemo(
                  () => ({
                    price: Number(currentPriceWithDecimals.toString()),
                    depth: chartConfig.xRange[1],
                  }),
                  [chartConfig.xRange, currentPriceWithDecimals]
                )}
                // eslint-disable-next-line react-hooks/exhaustive-deps
                onMoveMax={useCallback(
                  debounce((num: number) => setMaxRange(num.toString()), 250),
                  []
                )}
                // eslint-disable-next-line react-hooks/exhaustive-deps
                onMoveMin={useCallback(
                  debounce((num: number) => setMinRange(num.toString()), 250),
                  []
                )}
                onSubmitMin={useCallback(
                  (val: number) => {
                    setMinRange(val.toString());
                  },
                  [setMinRange]
                )}
                onSubmitMax={useCallback(
                  (val: number) => {
                    setMaxRange(val.toString());
                  },
                  [setMaxRange]
                )}
                offset={{ top: 0, right: 36, bottom: 24 + 28, left: 0 }}
                horizontal
                fullRange={fullRange}
              />
              {queryCurrentRangeApr.apr && (
                <div className="absolute right-8 top-5 flex select-none flex-col text-right">
                  <div className="flex items-center justify-end gap-1">
                    <span className="text-osmoverse-300">
                      {t("addConcentratedLiquidity.estimated")}
                    </span>
                    <Tooltip
                      content={
                        <span>
                          {t("addConcentratedLiquidity.estimatedInfo")}
                        </span>
                      }
                    >
                      <Icon id="info" height={15} width={15} />
                    </Tooltip>
                  </div>
                  {queryCurrentRangeApr.isFetching ? (
                    <Spinner className="m-auto mt-1.5" />
                  ) : (
                    <h5 className="text-osmoverse-100">
                      {queryCurrentRangeApr.apr.maxDecimals(1).toString() ?? ""}{" "}
                      {t("pool.APR")}
                    </h5>
                  )}
                </div>
              )}
            </div>
            <div className="flex flex-col items-center justify-center gap-4 pr-8 sm:pr-3">
              <PriceInputBox
                label={t("addConcentratedLiquidity.high")}
                forPriceIndex={1}
                addConcLiquidityConfig={addLiquidityConfig}
                inputRef={highSpotPriceInputRef}
              />
              <PriceInputBox
                label={t("addConcentratedLiquidity.low")}
                forPriceIndex={0}
                addConcLiquidityConfig={addLiquidityConfig}
              />
            </div>
          </div>
        </div>
      </div>
      <StrategySelectorGroup
        addLiquidityConfig={addLiquidityConfig}
        highSpotPriceInputRef={highSpotPriceInputRef}
      />
      <section className="flex flex-col">
        <div className="subtitle1 flex place-content-between items-baseline px-4 pb-3">
          {t("addConcentratedLiquidity.amountToDeposit")}
          {superfluidPoolDetail.isSuperfluid && (
            <CheckBox
              borderStyles="border-superfluid"
              backgroundStyles="bg-superfluid"
              isOn={shouldBeSuperfluidStaked}
              onToggle={() => {
                setElectSuperfluidStaking(!shouldBeSuperfluidStaked);
              }}
              disabled={sfStakingDisabled}
            >
              <div
                className={classNames("flex flex-col gap-1", {
                  "opacity-30": sfStakingDisabled,
                })}
              >
                <h6 className="md:text-subtitle1 md:font-subtitle1">
                  {t("lockToken.superfluidStake")}{" "}
                  {superfluidPoolDetail.superfluidApr.toDec().isPositive()
                    ? `(+${superfluidPoolDetail.superfluidApr.maxDecimals(
                        0
                      )} APR)`
                    : undefined}
                </h6>
                <span className="caption text-osmoverse-300">
                  {t("lockToken.bondingRequirement", {
                    numDays: superfluidPoolDetail.unstakingDuration
                      .asDays()
                      .toString(),
                  })}
                </span>
              </div>
            </CheckBox>
          )}
        </div>
        <div className="flex justify-center gap-3 md:flex-col">
          <DepositAmountGroup
            getFiatValue={getFiatValue}
            currency={pool?.poolAssets[0]?.amount.currency}
            className="md:!px-4 md:!py-4"
            priceInputClass=" md:!w-full"
            onUpdate={useCallback(
              (amount) => {
                setAnchorAsset("base");
                baseDepositAmountIn.setAmount(amount.toString());
              },
              [baseDepositAmountIn, setAnchorAsset]
            )}
            onMax={setBaseDepositAmountMax}
            currentValue={baseDepositAmountIn.amount}
            outOfRange={quoteDepositOnly}
            percentage={depositPercentages[0]}
          />
          <DepositAmountGroup
            getFiatValue={getFiatValue}
            currency={pool?.poolAssets[1]?.amount.currency}
            className="md:!px-4 md:!py-4"
            priceInputClass=" md:!w-full"
            onUpdate={useCallback(
              (amount) => {
                setAnchorAsset("quote");
                quoteDepositAmountIn.setAmount(amount.toString());
              },
              [quoteDepositAmountIn, setAnchorAsset]
            )}
            onMax={setQuoteDepositAmountMax}
            currentValue={quoteDepositAmountIn.amount}
            outOfRange={baseDepositOnly}
            percentage={depositPercentages[1]}
          />
        </div>
      </section>
      {actionButton}
    </>
  );
});

const AddConcLiqManaged: FunctionComponent<
  {
    addLiquidityConfig: ObservableAddConcentratedLiquidityConfig;
    quasarVaults: QuasarVault[];
  } & CustomClasses
> = observer(({ quasarVaults, addLiquidityConfig }) => {
  const { setModalView } = addLiquidityConfig;
  const { t } = useTranslation();
  const { priceStore } = useStore();

  const fiat = priceStore.getFiatCurrency(priceStore.defaultVsCurrency);

  if (!fiat) throw new Error("Could not find fiat currency from price store.");

  return (
    <>
      <div className="align-center relative flex flex-row xs:items-center xs:gap-4">
        <button
          className="absolute left-0 flex h-full cursor-pointer items-center xs:static"
          onClick={() => setModalView("overview")}
        >
          <Image
            alt="left"
            src={`${process.env.NEXT_PUBLIC_BASEPATH}/icons/arrow-left.svg`}
            width={24}
            height={24}
          />
          <span className="body2 pl-1 text-osmoverse-100">
            {t("addConcentratedLiquidity.back")}
          </span>
        </button>
        <h6 className="mx-auto whitespace-nowrap">
          {t("addConcentratedLiquidity.step2TitleManaged")}
        </h6>
      </div>
      <div className="flex flex-col gap-3">
        {quasarVaults.map((vault) => {
          return (
            <a
              key={vault.slug}
              href={`https://app.quasar.fi/vault/${vault.slug}`}
              target="_blank"
              rel="noreferrer"
            >
              <div className="grid cursor-pointer grid-cols-4 items-center rounded-[1rem] border border-transparent bg-osmoverse-700 p-3 transition-all hover:border-wosmongton-200 ">
                <div className="col-span-3 flex items-center gap-4">
                  <Image
                    alt="quasar-provider"
                    src={`${process.env.NEXT_PUBLIC_BASEPATH}/tokens/quasar.png`}
                    width={80}
                    height={80}
                    className="h-[80px]"
                  />
                  <div>
                    <Image
                      alt="quasar-provider"
                      src={`${process.env.NEXT_PUBLIC_BASEPATH}/logos/quasar.svg`}
                      width={80}
                      height={30}
                      className="mb-1.5 h-[30px]"
                    />
                    <p className="text-lg">{vault.name}</p>
                  </div>
                </div>
                <div className="col-span-1 flex gap-6">
                  <div className="flex flex-col">
                    <p className="text-sm text-osmoverse-200">TVL</p>
                    <p className="text-lg">
                      {formatPretty(
                        new PricePretty(fiat, vault.tvl.usd)
                      ).toString()}
                    </p>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-sm text-osmoverse-200">Est. APR</p>
                    <p className="text-lg">~ {(vault.apy * 100).toFixed(0)}%</p>
                  </div>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </>
  );
});

/**
 * Create a nested component to prevent unnecessary re-renders whenever the hover price changes.
 */
const ChartHeader: FunctionComponent<{
  chartConfig: ObservableHistoricalAndLiquidityData;

  addLiquidityConfig: ObservableAddConcentratedLiquidityConfig;
}> = observer(({ addLiquidityConfig, chartConfig }) => {
  const { baseDepositAmountIn, quoteDepositAmountIn } = addLiquidityConfig;
  const { historicalRange, setHistoricalRange, hoverPrice, priceDecimal } =
    chartConfig;

  return (
    <PriceChartHeader
      historicalRange={historicalRange}
      setHistoricalRange={setHistoricalRange}
      baseDenom={baseDepositAmountIn.sendCurrency.coinDenom}
      quoteDenom={quoteDepositAmountIn.sendCurrency.coinDenom}
      hoverPrice={hoverPrice}
      decimal={priceDecimal}
    />
  );
});

/**
 * Create a nested component to prevent unnecessary re-renders whenever the hover price changes.
 */
const Chart: FunctionComponent<{
  chartConfig: ObservableHistoricalAndLiquidityData;
  addLiquidityConfig: ObservableAddConcentratedLiquidityConfig;
}> = observer(({ addLiquidityConfig, chartConfig }) => {
  const { fullRange, rangeWithCurrencyDecimals } = addLiquidityConfig;
  const { yRange, historicalChartData, lastChartData, setHoverPrice } =
    chartConfig;

  return (
    <TokenPairHistoricalChart
      data={historicalChartData}
      annotations={
        fullRange
          ? [new Dec(yRange[0] * 1.05), new Dec(yRange[1] * 0.95)]
          : rangeWithCurrencyDecimals
      }
      domain={yRange}
      onPointerHover={setHoverPrice}
      onPointerOut={
        lastChartData ? () => setHoverPrice(lastChartData.close) : undefined
      }
    />
  );
});

const StrategySelectorGroup: FunctionComponent<
  {
    addLiquidityConfig: ObservableAddConcentratedLiquidityConfig;
    highSpotPriceInputRef: React.MutableRefObject<HTMLInputElement | null>;
  } & CustomClasses
> = observer((props) => {
  const { t } = useTranslation();
  const { currentStrategy } = props.addLiquidityConfig;

  let descriptionText = t(
    "addConcentratedLiquidity.volatilityCustomDescription"
  );

  if (currentStrategy === "passive") {
    descriptionText = t(
      "addConcentratedLiquidity.volatilityPassiveDescription"
    );
  } else if (currentStrategy === "aggressive") {
    descriptionText = t(
      "addConcentratedLiquidity.volatilityAggressiveDescription"
    );
  } else if (currentStrategy === "moderate") {
    descriptionText = t(
      "addConcentratedLiquidity.volatilityModerateDescription"
    );
  }

  return (
    <section className="flex flex-row justify-between gap-y-4 1.5md:flex-col">
      <div className="mx-4 flex flex-col gap-2">
        <span className="subtitle1">
          {t("addConcentratedLiquidity.selectVolatilityRange")}
        </span>
        <span className="caption text-osmoverse-200">{descriptionText}</span>
      </div>
      <div className="flex gap-2 1.5md:pl-4 sm:flex-col sm:pl-0">
        <PresetStrategyCard
          type={null}
          src={`${process.env.NEXT_PUBLIC_BASEPATH}/images/custom-vial.svg`}
          addLiquidityConfig={props.addLiquidityConfig}
          label="Custom"
          className="sm:order-4 sm:w-full"
          highSpotPriceInputRef={props.highSpotPriceInputRef}
        />
        <div className="flex gap-2 xs:flex-wrap">
          <PresetStrategyCard
            type="passive"
            src={`${process.env.NEXT_PUBLIC_BASEPATH}/images/small-vial.svg`}
            addLiquidityConfig={props.addLiquidityConfig}
            label="Passive"
            className="sm:flex-1"
          />
          <PresetStrategyCard
            type="moderate"
            src={`${process.env.NEXT_PUBLIC_BASEPATH}/images/medium-vial.svg`}
            addLiquidityConfig={props.addLiquidityConfig}
            label="Moderate"
            className="sm:flex-1"
          />
          <PresetStrategyCard
            type="aggressive"
            src={`${process.env.NEXT_PUBLIC_BASEPATH}/images/large-vial.svg`}
            addLiquidityConfig={props.addLiquidityConfig}
            label="Aggressive"
            className="sm:flex-1"
          />
        </div>
      </div>
    </section>
  );
});

const PresetStrategyCard: FunctionComponent<
  {
    type: null | "passive" | "moderate" | "aggressive";
    src: string;
    addLiquidityConfig: ObservableAddConcentratedLiquidityConfig;
    label: string;
    width?: number;
    height?: number;
    highSpotPriceInputRef?: React.MutableRefObject<HTMLInputElement | null>;
  } & CustomClasses
> = observer(
  ({
    type,
    src,
    width,
    height,
    label,
    addLiquidityConfig,
    className,
    highSpotPriceInputRef,
  }) => {
    const {
      currentStrategy,
      setFullRange,
      aggressivePriceRange,
      moderatePriceRange,
      initialCustomPriceRange,
      baseDepositAmountIn,
      quoteDepositAmountIn,
      setMinRange,
      setMaxRange,
    } = addLiquidityConfig;
    const { logEvent } = useAmplitudeAnalytics();

    /** Disabled of aggressive price range is the same.
     *  This can happen with pools with pegged currencies with very concentrated liq. */
    const disabled =
      "moderate" === type &&
      aggressivePriceRange[0].equals(moderatePriceRange[0]) &&
      aggressivePriceRange[1].equals(moderatePriceRange[1]);

    const isSelected = type === currentStrategy;

    const updateInputAndRangeMinMax = useCallback(
      (min: Dec, max: Dec) => {
        // moderate and aggressive needs to account for currency decimals
        const multiplicationQuoteOverBase = DecUtils.getTenExponentN(
          (baseDepositAmountIn.sendCurrency.coinDecimals ?? 0) -
            (quoteDepositAmountIn.sendCurrency.coinDecimals ?? 0)
        );

        setMinRange(min.mul(multiplicationQuoteOverBase).toString());
        setMaxRange(max.mul(multiplicationQuoteOverBase).toString());
      },
      [setMinRange, setMaxRange, baseDepositAmountIn, quoteDepositAmountIn]
    );

    const onClick = () => {
      if (type !== null)
        logEvent([
          EventName.ConcentratedLiquidity.strategyPicked,
          {
            strategy: type,
          },
        ]);
      switch (type) {
        case "passive":
          setFullRange(true);
          return;
        case "moderate":
          updateInputAndRangeMinMax(
            moderatePriceRange[0],
            moderatePriceRange[1]
          );
          return;
        case "aggressive":
          updateInputAndRangeMinMax(
            aggressivePriceRange[0],
            aggressivePriceRange[1]
          );
          return;
        case null: // custom
          updateInputAndRangeMinMax(
            initialCustomPriceRange[0],
            initialCustomPriceRange[1]
          );
          highSpotPriceInputRef?.current?.focus();
          return;
      }
    };

    // not an option
    if (disabled) return null;

    return (
      <div
        className={classNames(
          "flex w-[114px] cursor-pointer items-center justify-center gap-2 rounded-2xl p-[2px] hover:bg-supercharged",
          {
            "bg-supercharged": isSelected,
            "cursor-not-allowed opacity-30": disabled,
          },
          className
        )}
        onClick={onClick}
      >
        <div className="flex h-full w-full flex-col rounded-2xlinset bg-osmoverse-700 p-3">
          <div
            className={classNames(
              "mx-auto mb-1.5 transform transition-transform",
              {
                "scale-110": isSelected,
              }
            )}
          >
            <Image
              alt="volatility-selection"
              src={src}
              width={width || 60}
              height={height || 60}
              className={!height ? "h-[60px]" : ""}
            />
          </div>
          <span
            className={classNames("body2 text-center", {
              "text-osmoverse-200": !isSelected,
            })}
          >
            {label}
          </span>
        </div>
      </div>
    );
  }
);

const PriceInputBox: FunctionComponent<{
  label: string;
  forPriceIndex: 0 | 1;
  addConcLiquidityConfig: ObservableAddConcentratedLiquidityConfig;
  inputRef?: React.MutableRefObject<HTMLInputElement | null>;
}> = observer(({ label, forPriceIndex, addConcLiquidityConfig, inputRef }) => {
  const [isFocused, setIsFocused] = useState(false);

  const isFullRange =
    forPriceIndex === 1 && addConcLiquidityConfig.fullRange && !isFocused;

  /** to allow decimals, display the raw string value while typing
   otherwise, display the nearest tick rounded price.
    All values have currency decimals adjusted for display. */
  const currentValue = isFocused
    ? addConcLiquidityConfig.rangeRaw[forPriceIndex]
    : formatPretty(
        addConcLiquidityConfig.rangeWithCurrencyDecimals[forPriceIndex],
        {
          maxDecimals: 8,
        }
      );

  return (
    <div className="flex w-full max-w-[9.75rem] flex-col items-end overflow-clip rounded-xl bg-osmoverse-800 px-2 focus-within:bg-osmoverse-900">
      <span className="caption px-2 pt-2 text-osmoverse-400">{label}</span>
      {isFullRange ? (
        <div className="flex h-[41px] items-center px-2">
          <Image
            alt="infinity"
            src={`${process.env.NEXT_PUBLIC_BASEPATH}/icons/infinity.svg`}
            width={16}
            height={16}
          />
        </div>
      ) : (
        <InputBox
          className="border-0 bg-transparent text-subtitle1 leading-tight"
          type="number"
          rightEntry
          inputRef={inputRef}
          autoFocus={
            forPriceIndex === 1 &&
            !isFullRange &&
            addConcLiquidityConfig.currentStrategy === null
          }
          currentValue={currentValue}
          onFocus={() => setIsFocused(true)}
          onInput={(val) =>
            forPriceIndex === 0
              ? addConcLiquidityConfig.setMinRange(val)
              : addConcLiquidityConfig.setMaxRange(val)
          }
          onBlur={() => setIsFocused(false)}
        />
      )}
    </div>
  );
});
