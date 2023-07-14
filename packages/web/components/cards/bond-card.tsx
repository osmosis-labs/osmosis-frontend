import { CoinPretty, Dec, PricePretty, RatePretty } from "@keplr-wallet/unit";
import { BondDuration } from "@osmosis-labs/stores";
import classNames from "classnames";
import moment from "dayjs";
import { Duration } from "dayjs/plugin/duration";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import {
  ButtonHTMLAttributes,
  FunctionComponent,
  useMemo,
  useState,
} from "react";
import { useTranslation } from "react-multi-lang";
import { useMeasure } from "react-use";

import { useAmplitudeAnalytics } from "~/hooks";
import { useStore } from "~/stores";

import { EventName } from "../../config";
import { formatPretty } from "../../utils/formatter";
import { FallbackImg, Icon } from "../assets";
import { RightArrowIcon } from "../assets/right-arrow-icon";
import { UnlockIcon } from "../assets/unlock-icon";
import { Tooltip } from "../tooltip";

export const BondCard: FunctionComponent<
  BondDuration & {
    onUnbond: () => void;
    onGoSuperfluid: () => void;
    onToggleDetails?: (nextValue: boolean) => void;
    splashImageSrc?: string;
  }
> = ({
  duration,
  bondable,
  userShares,
  userLockedShareValue,
  userUnlockingShares,
  aggregateApr,
  swapFeeApr,
  swapFeeDailyReward,
  superfluid,
  incentivesBreakdown,
  onUnbond,
  onGoSuperfluid,
  splashImageSrc,
  onToggleDetails,
}) => {
  const [drawerUp, setDrawerUp] = useState(false);
  const t = useTranslation();

  const showGoSuperfluid =
    superfluid &&
    userShares.toDec().gt(new Dec(0)) &&
    !superfluid.delegated &&
    !superfluid.undelegating;
  const showUnbond = userShares.toDec().gt(new Dec(0));

  // useful for calculating the height of the card
  const hasThreeButtons = showUnbond && showGoSuperfluid && userUnlockingShares;

  return (
    <div
      className={classNames(
        "relative flex w-full min-w-[280px] flex-col gap-[115px] overflow-hidden rounded-2xl border-2 border-osmoverse-600 bg-osmoverse-800 p-7 md:p-[10px]",
        {
          "h-[380px]": !hasThreeButtons,
          "h-[420px] md:h-[400px]": hasThreeButtons,
        }
      )}
    >
      <div
        className={classNames("flex flex-col place-content-between gap-2", {
          "h-[264px] md:h-[280px]": !hasThreeButtons,
          "h-[304px] md:h-[280px]": hasThreeButtons,
        })}
      >
        <div className="flex place-content-between items-start gap-4">
          <div className="z-10 flex max-w-[60%] flex-col gap-5 overflow-visible">
            <span className="subtitle1 text-osmoverse-100">
              {t(
                duration.asDays() > 1
                  ? "pool.amountDaysUnbonding_plural"
                  : "pool.amountDaysUnbonding",
                {
                  numDays: duration.asDays().toString(),
                }
              )}
            </span>
            <div className="flex grow flex-col text-osmoverse-100">
              <h4 className="text-osmoverse-100">
                {userLockedShareValue.toString()}
              </h4>
              <span className="subtitle1 text-osmoverse-300">
                {t("pool.sharesAmount", {
                  shares: userShares
                    .hideDenom(true)
                    .trim(true)
                    .maxDecimals(3)
                    .toString(),
                })}
              </span>
            </div>
          </div>
          {splashImageSrc && (
            <div className="h-fit w-fit shrink-0">
              <Image alt="splash" src={splashImageSrc} height={90} width={90} />
            </div>
          )}
        </div>

        {userUnlockingShares && (
          <div className="flex w-fit flex-wrap items-center gap-1 rounded-lg bg-osmoverse-900 p-3 md:p-1.5">
            <span className="text-subtitle1 font-subtitle1">
              ~
              {t("pool.sharesAmount", {
                shares: userUnlockingShares.shares
                  .hideDenom(true)
                  .trim(true)
                  .maxDecimals(6)
                  .toString(),
              })}
            </span>
            <span className="flex items-center gap-1 text-subtitle1 font-subtitle1 text-osmoverse-400">
              {userUnlockingShares.endTime ? (
                <>
                  {t("pool.sharesAvailableIn")}
                  <span className="text-white-full">
                    {moment(userUnlockingShares.endTime).fromNow(true)}
                  </span>
                </>
              ) : (
                <>{t("pool.unbonding")}</>
              )}
            </span>
          </div>
        )}
        {showUnbond && <UnbondButton onClick={onUnbond} />}
        {showGoSuperfluid && (
          <button
            className="w-fit rounded-lg bg-superfluid p-[2px]"
            onClick={onGoSuperfluid}
          >
            <div className="w-full rounded-[6px] bg-osmoverse-800 p-3 md:p-2">
              <span className="text-superfluid-gradient">
                {t("pool.superfluidEarnMore", {
                  rate: superfluid.apr.maxDecimals(0).toString(),
                })}
              </span>
            </div>
          </button>
        )}
      </div>
      <div
        className={classNames(
          "absolute top-0 left-1/2 h-full w-full -translate-x-1/2 bg-osmoverse-1000 transition-opacity duration-300",
          drawerUp ? "z-20 opacity-70" : "-z-10 opacity-0"
        )}
        onClick={() => setDrawerUp(false)}
      />

      {bondable && (
        <Drawer
          duration={duration}
          aggregateApr={aggregateApr}
          userShares={userShares}
          swapFeeApr={swapFeeApr}
          swapFeeDailyReward={swapFeeDailyReward}
          incentivesBreakdown={incentivesBreakdown}
          superfluid={superfluid}
          drawerUp={drawerUp}
          toggleDetailsVisible={() => {
            const nextValue = !drawerUp;
            onToggleDetails?.(nextValue);
            setDrawerUp(nextValue);
          }}
          onGoSuperfluid={onGoSuperfluid}
        />
      )}
    </div>
  );
};

const Drawer: FunctionComponent<{
  duration: Duration;
  aggregateApr: RatePretty;
  swapFeeApr: RatePretty;
  swapFeeDailyReward: PricePretty;
  userShares: CoinPretty;
  incentivesBreakdown: BondDuration["incentivesBreakdown"];
  superfluid: BondDuration["superfluid"];
  drawerUp: boolean;
  toggleDetailsVisible: () => void;
  onGoSuperfluid: () => void;
}> = observer(
  ({
    duration,
    aggregateApr,
    swapFeeApr,
    swapFeeDailyReward,
    incentivesBreakdown,
    superfluid,
    drawerUp,
    toggleDetailsVisible,
  }) => {
    const {
      queriesStore,
      chainStore: {
        osmosis: { chainId },
      },
    } = useStore();
    const uniqueCoinImages = useMemo(() => {
      const imgSrcDenomMap = new Map<string, string>();
      incentivesBreakdown.forEach((breakdown) => {
        const currency = breakdown.dailyPoolReward.currency;
        if (currency.coinImageUrl) {
          imgSrcDenomMap.set(currency.coinDenom, currency.coinImageUrl);
        }
      });
      return Array.from(imgSrcDenomMap.values());
    }, [incentivesBreakdown]);
    const t = useTranslation();

    const queriesCosmos = queriesStore.get(chainId).cosmos;
    const inflation = queriesCosmos.queryInflation;

    /**
     * If pool APR is 5 times bigger than staking APR, warn user
     * that pool may be subject to inflation
     */
    const isAPRTooHigh = aggregateApr
      .toDec()
      .gt(inflation.inflation.toDec().quo(new Dec(100)).mul(new Dec(5)));

    return (
      <div
        className={classNames(
          "absolute -bottom-[234px] left-1/2 z-40 flex h-[320px] w-full -translate-x-1/2 flex-col transition-all duration-300 ease-inOutBack",
          {
            "-translate-y-[220px] rounded-t-[18px] bg-osmoverse-700": drawerUp,
          }
        )}
      >
        <div
          className={classNames(
            "flex place-content-between items-end py-4 px-7 transition-all md:px-[10px]",
            {
              "border-b border-osmoverse-600": drawerUp,
            }
          )}
        >
          <div className="flex flex-col">
            {/* Only display warning when APR is too high */}
            {isAPRTooHigh ? (
              <Tooltip content={t("highPoolInflationWarning")}>
                <span className="subtitle1 flex items-center gap-1.5 text-osmoverse-200">
                  {t("pool.incentives")}{" "}
                  <Icon
                    id="alert-triangle"
                    className="h-4 w-4 text-osmoverse-400"
                  />
                </span>
              </Tooltip>
            ) : (
              <span className="subtitle1 text-osmoverse-200">
                {t("pool.incentives")}
              </span>
            )}
            <div className="flex items-center gap-1.5">
              <h5
                className={classNames(
                  "whitespace-nowrap",
                  superfluid ? "text-superfluid-gradient" : "text-bullish-400"
                )}
              >
                {formatPretty(aggregateApr.maxDecimals(0))} {t("pool.APR")}
              </h5>
              <div
                className={classNames(
                  "flex items-center gap-1 transition-opacity duration-300",
                  drawerUp ? "opacity-0" : "opacity-100"
                )}
              >
                {uniqueCoinImages.map((coinImageUrl, index) => (
                  <div key={index}>
                    {index === 2 && incentivesBreakdown.length > 3 ? (
                      <span className="caption text-osmoverse-400">
                        +{incentivesBreakdown.length - 2}
                      </span>
                    ) : index < 2 ? (
                      <Image
                        alt="incentive icon"
                        src={coinImageUrl}
                        height={24}
                        width={24}
                      />
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button
            className={classNames(
              "flex cursor-pointer items-center transition-transform",
              {
                "-translate-y-[28px]": drawerUp,
              }
            )}
            onClick={toggleDetailsVisible}
          >
            <span className="caption text-osmoverse-400 xs:hidden">
              {t("pool.details")}
            </span>
            <div
              className={classNames("flex items-center transition-transform", {
                "rotate-180": drawerUp,
              })}
            >
              <Icon
                id="chevron-up"
                className="mx-[7.5px] my-[7.5px] text-osmoverse-400"
                height={14}
                width={14}
              />
            </div>
          </button>
        </div>
        <div
          className={classNames("flex h-full flex-col gap-1.5", {
            "bg-osmoverse-700": drawerUp,
          })}
        >
          <div className="flex h-[180px] flex-col gap-5 overflow-y-auto py-6 px-8 md:px-[10px]">
            {superfluid &&
              superfluid.duration.asMilliseconds() ===
                duration.asMilliseconds() && (
                <SuperfluidBreakdownRow {...superfluid} />
              )}
            {incentivesBreakdown.map((breakdown, index) => (
              <IncentiveBreakdownRow key={index} {...breakdown} />
            ))}
            <SwapFeeBreakdownRow
              swapFeeApr={swapFeeApr}
              swapFeeDailyReward={swapFeeDailyReward}
            />
          </div>
          <span className="caption text-center text-osmoverse-400">
            {t("pool.rewardDistribution")}
          </span>
        </div>
      </div>
    );
  }
);

const SuperfluidBreakdownRow: FunctionComponent<BondDuration["superfluid"]> = (
  props
) => {
  const t = useTranslation();

  if (!props) {
    return null;
  }

  const {
    apr,
    commission,
    delegated,
    undelegating,
    validatorMoniker,
    validatorLogoUrl,
  } = props;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex place-content-between items-start text-right">
        <div className="flex items-center gap-2">
          <span className="subtitle1 text-superfluid-gradient bg-clip-text text-transparent">
            +{apr.maxDecimals(0).toString()}
          </span>
          <FallbackImg
            className="rounded-full"
            alt="validator icon"
            src={validatorLogoUrl ?? "/icons/superfluid-osmo.svg"}
            fallbacksrc="/icons/profile.svg"
            height={20}
            width={20}
          />
        </div>
        <span className="text-osmoverse-100">
          {(delegated || undelegating) && validatorMoniker
            ? validatorMoniker
            : t("pool.superfluidStaking")}
        </span>
      </div>
      {(delegated || undelegating) && (
        <div className="ml-auto flex flex-col text-right">
          <div className="flex flex-col gap-[2px] rounded-md bg-osmoverse-800 py-2 px-4">
            <span className="caption">
              {delegated
                ? `~${delegated.trim(true).maxDecimals(7).toString()}`
                : undelegating
                ? `~${undelegating.trim(true).maxDecimals(7).toString()}`
                : null}
              <span className="text-osmoverse-400">
                {delegated
                  ? ` ${t("pool.delegated")}`
                  : undelegating
                  ? ` ${t("pool.undelegating")}`
                  : ""}
              </span>
            </span>
            {commission && (
              <span className="caption">
                {commission.toString()}{" "}
                <span className="text-osmoverse-400">
                  {t("pool.commission")}
                </span>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const IncentiveBreakdownRow: FunctionComponent<
  BondDuration["incentivesBreakdown"][0]
> = ({ dailyPoolReward, apr, numDaysRemaining }) => {
  const t = useTranslation();
  return (
    <div className="flex place-content-between items-start">
      <div className="flex shrink-0 items-center gap-2">
        <span className="subtitle1 text-white">
          +{apr.maxDecimals(0).toString()}
        </span>
        {dailyPoolReward.currency.coinImageUrl && (
          <Image
            alt="token icon"
            src={dailyPoolReward.currency.coinImageUrl}
            height={20}
            width={20}
          />
        )}
      </div>
      <div className="flex flex-col text-right">
        <span className="text-osmoverse-100">
          {t("pool.dailyEarnAmount", {
            amount: formatPretty(dailyPoolReward),
          })}
        </span>
        {numDaysRemaining && (
          <span className="caption text-osmoverse-400">
            {t("pool.numDaysRemaining", {
              numDays: numDaysRemaining.toString(),
            })}
          </span>
        )}
      </div>
    </div>
  );
};

const SwapFeeBreakdownRow: FunctionComponent<{
  swapFeeApr: RatePretty;
  swapFeeDailyReward: PricePretty;
}> = ({ swapFeeApr, swapFeeDailyReward }) => {
  const t = useTranslation();
  const { logEvent } = useAmplitudeAnalytics();
  return (
    <div className="flex place-content-between items-start">
      <div className="flex items-center gap-2">
        <span className="subtitle1 text-white">
          +{swapFeeApr.maxDecimals(0).toString()}
        </span>
      </div>
      <div className="flex flex-col text-right">
        <span className="text-osmoverse-100">
          {t("pool.dailyEarnAmount", {
            amount: formatPretty(swapFeeDailyReward),
          })}
        </span>
        <span className="caption text-osmoverse-400">
          {`${t("pool.from")} `}
          <a
            rel="noreferrer"
            target="_blank"
            onClick={() => {
              logEvent([
                EventName.PoolDetail.CardDetail.swapFeesLinkOutClicked,
              ]);
            }}
            href="https://docs.osmosis.zone/overview/getting-started/#swap-fees"
          >
            <u>{t("pool.swapFees")}</u>
          </a>{" "}
          {t("pool.7davg")}
        </span>
      </div>
    </div>
  );
};

const UnbondButton: FunctionComponent<
  ButtonHTMLAttributes<HTMLButtonElement>
> = (props) => {
  const t = useTranslation();
  const [leftContentRef, { width: leftContentWidth }] =
    useMeasure<HTMLSpanElement>();

  return (
    <button
      {...props}
      className="group overflow-hidden rounded-lg border-2 border-wosmongton-300 transition-all duration-300 ease-inOutBack hover:border-rust-300"
      style={{
        width:
          (leftContentWidth ?? 87) +
          12 + // padding
          15, // gap
      }}
    >
      <div className="flex transform items-center gap-[10px] self-start px-[12px] py-1.5 text-base font-button text-wosmongton-200 duration-300 ease-inOutBack group-hover:-translate-x-[30px] group-hover:text-rust-300">
        <span
          ref={leftContentRef}
          className="flex flex-shrink-0 items-center gap-[10px]"
        >
          <UnlockIcon />
          <span>{t("pool.unbond")}</span>
        </span>
        <RightArrowIcon classes={{ container: "flex-shrink-0" }} />
      </div>
    </button>
  );
};
