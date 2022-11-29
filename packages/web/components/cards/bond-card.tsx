import Image from "next/image";
import { FunctionComponent, useState, useMemo } from "react";
import classNames from "classnames";
import moment from "dayjs";
import { CoinPretty, Dec, PricePretty, RatePretty } from "@keplr-wallet/unit";
import { BondableDuration } from "@osmosis-labs/stores";
import { FallbackImg } from "../assets";
import { ArrowButton } from "../buttons";
import { useTranslation } from "react-multi-lang";

export const BondCard: FunctionComponent<
  BondableDuration & {
    onUnbond: () => void;
    onGoSuperfluid: () => void;
    splashImageSrc?: string;
  }
> = ({
  duration,
  userShares,
  userShareValue,
  userUnlockingShares,
  aggregateApr,
  swapFeeApr,
  swapFeeDailyReward,
  superfluid,
  incentivesBreakdown,
  onUnbond,
  onGoSuperfluid,
  splashImageSrc,
}) => {
  const [drawerUp, setDrawerUp] = useState(false);
  const t = useTranslation();

  return (
    <div className="relative flex h-[380px] w-full min-w-[280px] flex-col gap-[115px] overflow-hidden rounded-2xl border-2 border-osmoverse-600 bg-osmoverse-800 p-7 md:p-[10px]">
      <div className="flex h-[260px] flex-col place-content-between gap-2">
        <div className="flex place-content-between items-start gap-4">
          <div className="z-10 flex max-w-[60%] flex-col gap-3 overflow-visible">
            <span className="subtitle1 text-osmoverse-100">
              {t("pool.amountDaysUnbonding", {
                numDays: duration.asDays().toString(),
              })}
            </span>
            <div className="flex grow flex-col text-osmoverse-100">
              <h4 className="text-osmoverse-100">
                {userShareValue.toString()}
              </h4>
              <h6 className={"text-osmoverse-300"}>
                {t("pool.sharesAmount", {
                  shares: userShares
                    .hideDenom(true)
                    .trim(true)
                    .maxDecimals(3)
                    .toString(),
                })}
              </h6>
            </div>
            {userShares.toDec().gt(new Dec(0)) && (
              <ArrowButton onClick={onUnbond}>{t("pool.unbond")}</ArrowButton>
            )}
          </div>
          {splashImageSrc && (
            <div className="h-fit w-fit shrink-0">
              <Image alt="splash" src={splashImageSrc} height={90} width={90} />
            </div>
          )}
        </div>
        {userUnlockingShares && (
          <div className="flex w-fit flex-wrap items-center gap-1 rounded-lg bg-osmoverse-900 p-3 md:p-1.5">
            <h6 className="lg:text-subtitle1 lg:font-subtitle1">
              ~
              {t("pool.sharesAmount", {
                shares: userUnlockingShares.shares
                  .hideDenom(true)
                  .trim(true)
                  .maxDecimals(6)
                  .toString(),
              })}
            </h6>
            <h6 className="flex items-center gap-1 text-osmoverse-400 lg:text-subtitle1 lg:font-subtitle1">
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
            </h6>
          </div>
        )}
        {superfluid &&
          userShares.toDec().gt(new Dec(0)) &&
          !superfluid.delegated &&
          !superfluid.undelegating && (
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
      <Drawer
        aggregateApr={aggregateApr}
        userShares={userShares}
        swapFeeApr={swapFeeApr}
        swapFeeDailyReward={swapFeeDailyReward}
        incentivesBreakdown={incentivesBreakdown}
        superfluid={superfluid}
        drawerUp={drawerUp}
        toggleDetailsVisible={() => setDrawerUp(!drawerUp)}
        onGoSuperfluid={onGoSuperfluid}
      />
    </div>
  );
};

const Drawer: FunctionComponent<{
  aggregateApr: RatePretty;
  swapFeeApr: RatePretty;
  swapFeeDailyReward: PricePretty;
  userShares: CoinPretty;
  incentivesBreakdown: BondableDuration["incentivesBreakdown"];
  superfluid: BondableDuration["superfluid"];
  drawerUp: boolean;
  toggleDetailsVisible: () => void;
  onGoSuperfluid: () => void;
}> = ({
  aggregateApr,
  swapFeeApr,
  swapFeeDailyReward,
  incentivesBreakdown,
  superfluid,
  drawerUp,
  toggleDetailsVisible,
}) => {
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
          <span className="subtitle1 text-osmoverse-200">
            {t("pool.incentives")}
          </span>
          <div className="flex items-center gap-2 md:gap-1.5">
            <h5
              className={classNames(
                superfluid ? "text-superfluid-gradient" : "text-bullish-400"
              )}
            >
              {aggregateApr.maxDecimals(0).toString()} {t("pool.APR")}
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
            <Image
              alt="details"
              src="/icons/chevron-up-osmoverse-400.svg"
              height={30}
              width={30}
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
          {incentivesBreakdown.map((breakdown, index) => (
            <div className="flex flex-col gap-5 xs:text-subtitle2" key={index}>
              {index === 0 && superfluid && (
                <SuperfluidBreakdownRow {...superfluid} />
              )}
              <IncentiveBreakdownRow {...breakdown} />
              {index === incentivesBreakdown.length - 1 && (
                <SwapFeeBreakdownRow
                  swapFeeApr={swapFeeApr}
                  swapFeeDailyReward={swapFeeDailyReward}
                />
              )}
            </div>
          ))}
        </div>
        <span className="caption text-center text-osmoverse-400">
          {t("pool.rewardDistribution")}
        </span>
      </div>
    </div>
  );
};

const SuperfluidBreakdownRow: FunctionComponent<
  BondableDuration["superfluid"]
> = ({
  apr,
  commission,
  delegated,
  undelegating,
  validatorMoniker,
  validatorLogoUrl,
}) => {
  const t = useTranslation();
  return (
    <div className="flex flex-col gap-2">
      <div className="flex place-content-between items-start text-right">
        <div className="flex items-center gap-2">
          <h6 className="text-superfluid-gradient bg-clip-text text-transparent">
            +{apr.maxDecimals(0).toString()}
          </h6>
          <FallbackImg
            className="rounded-full"
            alt="validator icon"
            src={validatorLogoUrl ?? "/icons/superfluid-osmo.svg"}
            fallbacksrc="/icons/profile.svg"
            height={24}
            width={24}
          />
        </div>
        <span>
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
  BondableDuration["incentivesBreakdown"][0]
> = ({ dailyPoolReward, apr, numDaysRemaining }) => {
  const t = useTranslation();
  return (
    <div className="flex place-content-between items-start">
      <div className="flex shrink-0 items-center gap-2">
        <h6 className="text-osmoverse-200">+{apr.maxDecimals(0).toString()}</h6>
        {dailyPoolReward.currency.coinImageUrl && (
          <Image
            alt="token icon"
            src={dailyPoolReward.currency.coinImageUrl}
            height={24}
            width={24}
          />
        )}
      </div>
      <div className="flex flex-col text-right">
        <span>
          {t("pool.dailyEarnAmount", {
            amount: dailyPoolReward.maxDecimals(0).toString(),
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
  return (
    <div className="flex place-content-between items-start">
      <div className="flex items-center gap-2">
        <h6 className="text-osmoverse-200">
          +{swapFeeApr.maxDecimals(0).toString()}
        </h6>
      </div>
      <div className="flex flex-col text-right">
        <span>
          {t("pool.dailyEarnAmount", {
            amount: swapFeeDailyReward.maxDecimals(0).toString(),
          })}
        </span>
        <span className="caption text-osmoverse-400">
          {`${t("pool.from")} `}
          <a
            rel="noreferrer"
            target="_blank"
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
