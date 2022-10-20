import Image from "next/image";
import { FunctionComponent, useState } from "react";
import classNames from "classnames";
import { CoinPretty, Dec, PricePretty, RatePretty } from "@keplr-wallet/unit";
import { BondableDuration } from "@osmosis-labs/stores";
import { FallbackImg } from "../assets";
import { NewButton } from "../buttons";

export const BondCard: FunctionComponent<
  BondableDuration & {
    onUnbond: () => void;
    onGoSuperfluid: () => void;
    splashImageSrc?: string;
  }
> = ({
  duration,
  userShares,
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

  return (
    <div className="relative flex flex-col gap-[115px] overflow-hidden w-fit h-[380px] max-w-[348px] rounded-2xl bg-osmoverse-800 border-2 border-osmoverse-600 p-8">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-4 place-content-between">
          <div className="flex flex-col gap-3">
            <span className="subtitle1 text-osmoverse-100">
              {duration.humanize()} unbonding
            </span>
            <div className="flex flex-col text-osmoverse-100">
              <h3>
                {userShares
                  .hideDenom(true)
                  .trim(true)
                  .maxDecimals(3)
                  .toString()}
              </h3>
              <span>shares</span>
            </div>
            {userShares.toDec().gt(new Dec(0)) && (
              <button
                className="flex items-center gap-1 text-wosmongton-200"
                onClick={onUnbond}
              >
                Unbond
                <Image
                  alt="unbond"
                  src="/icons/arrow-right.svg"
                  height={24}
                  width={24}
                />
              </button>
            )}
          </div>
          {splashImageSrc && (
            <Image alt="splash" src={splashImageSrc} height={90} width={90} />
          )}
        </div>
        {superfluid &&
          userShares.toDec().gt(new Dec(0)) &&
          !superfluid.delegated &&
          !superfluid.undelegating && (
            <NewButton
              className="py-1.5 text-transparent bg-clip-text bg-superfluid border-superfluid"
              mode="tertiary"
              size="sm"
              onClick={onGoSuperfluid}
            >
              Earn {superfluid.apr.maxDecimals(0).toString()} more. Go
              superfluid
            </NewButton>
          )}
      </div>
      <div
        className={classNames(
          "absolute w-full h-full top-0 left-1/2 -translate-x-1/2 bg-osmoverse-1000 transition-opacity duration-300",
          drawerUp ? "opacity-70" : "opacity-0 -z-10"
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
  return (
    <div
      className={classNames(
        "absolute w-full h-[320px] -bottom-[226px] left-1/2 -translate-x-1/2 flex flex-col transition-all duration-300 ease-inOutBack z-50",
        {
          "-translate-y-[210px] bg-osmoverse-700 rounded-t-[18px]": drawerUp,
        }
      )}
    >
      <div
        className={classNames(
          "flex items-end place-content-between transition-all py-4 px-8",
          {
            "border-b border-osmoverse-600": drawerUp,
          }
        )}
      >
        <div className="flex flex-col">
          <span className="subtitle1 text-osmoverse-200">Incentives</span>
          <div className="flex items-center gap-4">
            <h5
              className={classNames(
                superfluid ? "text-superfluid" : "text-bullish"
              )}
            >
              {aggregateApr.maxDecimals(0).toString()} APR
            </h5>
            <div
              className={classNames(
                "flex items-center gap-1 transition-opacity duration-300",
                drawerUp ? "opacity-0" : "opacity-100"
              )}
            >
              {incentivesBreakdown
                .map((breakdown) => ({
                  denom: breakdown.dailyPoolReward.denom,
                  coinImageUrl: breakdown.dailyPoolReward.currency.coinImageUrl,
                }))
                .filter(({ coinImageUrl }) => coinImageUrl !== undefined)
                .map(({ denom, coinImageUrl }, index) => (
                  <div key={denom}>
                    {index === 2 && incentivesBreakdown.length > 3 ? (
                      <span className="caption text-osmoverse-400">
                        +{incentivesBreakdown.length - 2}
                      </span>
                    ) : index < 2 ? (
                      <Image
                        alt="incentive icon"
                        src={coinImageUrl!}
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
            "flex items-center cursor-pointer transition-transform",
            {
              "-translate-y-[28px]": drawerUp,
            }
          )}
          onClick={toggleDetailsVisible}
        >
          <span className="caption text-osmoverse-400">Details</span>
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
        className={classNames("flex flex-col gap-1.5 h-full", {
          "bg-osmoverse-700": drawerUp,
        })}
      >
        <div className="flex flex-col h-[180px] gap-5 py-6 px-8 overflow-y-auto">
          {incentivesBreakdown.map((breakdown, index) => (
            <div className="flex flex-col gap-5" key={index}>
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
          Rewards distributed to all liquidity providers
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
}) => (
  <div className="flex flex-col gap-2">
    <div className="flex items-start place-content-between">
      <div className="flex items-center gap-2">
        <h6 className="text-transparent bg-clip-text bg-superfluid">
          +{apr.maxDecimals(0).toString()}
        </h6>
        <FallbackImg
          className="rounded-full"
          alt="validator icon"
          src={validatorLogoUrl ?? "/icons/superfluid-osmo.svg"}
          fallbackSrc="/icons/profile.svg"
          height={24}
          width={24}
        />
      </div>
      {delegated || undelegating ? (
        <span>{validatorMoniker}</span>
      ) : (
        <span>Superfluid Staking</span>
      )}
    </div>
    {(delegated || undelegating) && (
      <div className="flex flex-col text-right ml-auto">
        <div className="flex flex-col gap-[2px] bg-osmoverse-800 rounded-md py-2 px-4">
          <span className="caption">
            {delegated
              ? `~${delegated.trim(true).toString()}`
              : undelegating
              ? `~${undelegating.trim(true).toString()}`
              : null}
            <span className="text-osmoverse-400">
              {delegated ? " delegated" : undelegating ? " undelegating" : ""}
            </span>
          </span>
          {commission && (
            <span className="caption">
              {commission.toString()}{" "}
              <span className="text-osmoverse-400">commission</span>
            </span>
          )}
        </div>
      </div>
    )}
  </div>
);

const IncentiveBreakdownRow: FunctionComponent<
  BondableDuration["incentivesBreakdown"][0]
> = ({ dailyPoolReward, apr, numDaysRemaining }) => (
  <div className="flex items-start place-content-between">
    <div className="flex items-center gap-2">
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
      <span>{dailyPoolReward.maxDecimals(0).toString()} / day</span>
      {numDaysRemaining && (
        <span className="caption text-osmoverse-400">{numDaysRemaining}</span>
      )}
    </div>
  </div>
);

const SwapFeeBreakdownRow: FunctionComponent<{
  swapFeeApr: RatePretty;
  swapFeeDailyReward: PricePretty;
}> = ({ swapFeeApr, swapFeeDailyReward }) => (
  <div className="flex items-start place-content-between">
    <div className="flex items-center gap-2">
      <h6 className="text-osmoverse-200">
        +{swapFeeApr.maxDecimals(0).toString()}
      </h6>
    </div>
    <div className="flex flex-col text-right">
      <span>{swapFeeDailyReward.maxDecimals(0).toString()} / day</span>
      <span className="caption text-osmoverse-400">
        from{" "}
        <a
          rel="noreferrer"
          target="_blank"
          href="https://docs.osmosis.zone/overview/getting-started/#swap-fees"
        >
          <u>swap fees</u>
        </a>{" "}
        (7d avg)
      </span>
    </div>
  </div>
);
