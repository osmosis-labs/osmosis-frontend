import type {
  ConcentratedHolding,
  ForcedMigrationHolding,
  OrderHolding,
  ShareHolding,
} from "@osmosis-labs/server";
import {
  prepareBeginUnlockingMsg,
  prepareBeginUnlockingMsgOrSuperfluidUnbondLockMsgIfSyntheticLock,
  prepareExitPoolWithMinimumsMsg,
  prepareGuardedWithdrawPositionMsg,
  prepareMultiExecuteContractMsg,
} from "@osmosis-labs/tx";
import { CoinPretty, Dec } from "@osmosis-labs/unit";
import { getAssetFromAssetList, shorten } from "@osmosis-labs/utils";
import classNames from "classnames";
import { FunctionComponent, ReactNode, useState } from "react";

import { Icon, PoolAssetsIcon, PoolAssetsName } from "~/components/assets";
import { Button } from "~/components/ui/button";
import { EntityImage } from "~/components/ui/entity-image";
import { AssetLists } from "~/config/generated/asset-lists";
import {
  USDC_ALLOYED_DENOM,
  USDC_NOBLE_DENOM,
} from "~/config/position-migration";
import { useTranslation } from "~/hooks";
import {
  getLcdClient,
  usePositionMigrationForPosition,
} from "~/hooks/use-position-migration-for-position";
import { useWallet } from "~/hooks/use-wallet";
import {
  ForcedMigration,
  getShareExitTokenOutMins,
  isWithdrawWithinTolerance,
} from "~/utils/forced-migrations";
import { formatPretty } from "~/utils/formatter";
import { getLogoURIs } from "~/utils/logo-uri";
import { ChainPositionResponse } from "~/utils/position-migrations";
import { api } from "~/utils/trpc";

const getListedAsset = (denom: string) =>
  getAssetFromAssetList({ coinMinimalDenom: denom, assetLists: AssetLists });

/** Display amount for a raw coin, formatted as in the position cards;
 *  unlisted denoms show the raw amount. */
export function formatHoldingCoin(denom: string, amount: string): string {
  const asset = getListedAsset(denom);
  if (!asset) return `${amount} ${shorten(denom)}`;
  return formatPretty(new CoinPretty(asset.currency, amount), {
    maxDecimals: 6,
  });
}

/** Thrown by the pre-broadcast check when a CL position no longer pays out
 *  within tolerance; shown to the user instead of a generic failure. */
class PositionMovedError extends Error {}

/**
 * One pool position, lock or limit order holding a forced migration's old
 * asset, with the action that frees it. Freed funds land in the bank, where
 * the popup's convert row picks them up, so converting is always a second,
 * exact-amount step.
 */
export const ForcedMigrationPositionRow: FunctionComponent<{
  holding: ForcedMigrationHolding;
  migration: ForcedMigration;
  /** Undefined hides the withdraw and migrate actions (invalid CMS value). */
  tolerancePercent: number | undefined;
  onMigrate: (holding: ConcentratedHolding) => void;
  /** Rendered under the row when its unlock would end after the deadline. */
  lateUnlockNote?: string;
  deadlineText?: string;
}> = ({
  holding,
  migration,
  tolerancePercent,
  onMigrate,
  lateUnlockNote,
  deadlineText,
}) => {
  const { t } = useTranslation();

  const oldDenom =
    holding.kind === "order"
      ? migration.fromDenoms.find(
          (denom) => denom === holding.inDenom || denom === holding.outDenom
        )
      : holding.coins.find(({ denom }) => migration.fromDenoms.includes(denom))
          ?.denom;
  const oldAmountText = oldDenom
    ? formatHoldingCoin(oldDenom, holding.oldDenomAmount)
    : undefined;

  const unlockEndsAfterDeadline = getUnlockEndsAfterDeadline(
    holding,
    migration.deadline
  );

  return (
    <div className="flex flex-col gap-2 border-b border-osmoverse-700 py-3 last:border-b-0">
      {holding.kind === "order" ? (
        <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-stretch">
          <div className="flex min-w-0 items-center gap-3">
            <OrderPairIcon holding={holding} />
            <div className="flex min-w-0 flex-col gap-1">
              <span className="subtitle1 text-osmoverse-100">
                {getOrderLabel(holding, t)}
              </span>
              {oldAmountText && (
                <span className="body2 text-osmoverse-300">
                  {oldAmountText}
                </span>
              )}
            </div>
          </div>
          <OrderAction holding={holding} />
        </div>
      ) : holding.kind === "cl" &&
        holding.state === "available" &&
        tolerancePercent !== undefined &&
        oldDenom ? (
        <MigratablePoolRow
          holding={holding}
          migration={migration}
          oldDenom={oldDenom}
          tolerancePercent={tolerancePercent}
          onMigrate={onMigrate}
        />
      ) : (
        <PoolRowLayout
          holding={holding}
          actions={
            <PoolHoldingAction
              holding={holding}
              migration={migration}
              oldDenom={oldDenom}
              tolerancePercent={tolerancePercent}
            />
          }
        />
      )}
      {unlockEndsAfterDeadline && deadlineText && (
        <p className="caption text-rust-300">
          {t("forcedMigration.unlockEndsAfterDeadline", {
            deadline: deadlineText,
          })}
          {lateUnlockNote ? ` ${lateUnlockNote}` : ""}
        </p>
      )}
    </div>
  );
};

function getUnlockEndsAfterDeadline(
  holding: ForcedMigrationHolding,
  deadline: string | undefined
): boolean {
  if (!deadline || holding.kind === "order") return false;
  const deadlineMs = new Date(deadline).getTime();
  if (holding.state === "unlocking")
    return Boolean(
      holding.unlockEndTime &&
      new Date(holding.unlockEndTime).getTime() > deadlineMs
    );
  if (holding.state === "locked" || holding.state === "superfluidStaked")
    return (
      holding.unlockDurationSeconds !== undefined &&
      Date.now() + holding.unlockDurationSeconds * 1000 > deadlineMs
    );
  return false;
}

/** "Buy ATOM" / "Sell ATOM", as in the portfolio's open orders. */
function getOrderLabel(
  holding: OrderHolding,
  t: ReturnType<typeof useTranslation>["t"]
): string {
  const base = getListedAsset(holding.baseDenom)?.symbol;
  return `${t(
    holding.direction === "bid" ? "portfolio.buy" : "portfolio.sell"
  )} ${base ?? shorten(holding.baseDenom)}`;
}

/** Base asset logo with the quote's set into its corner, as on the
 *  create-orderbook modal. */
const OrderPairIcon: FunctionComponent<{ holding: OrderHolding }> = ({
  holding,
}) => {
  const [base, quote] = [holding.baseDenom, holding.quoteDenom].map((denom) => {
    const asset = getListedAsset(denom);
    return {
      symbol: asset?.symbol ?? shorten(denom),
      logoURIs: getLogoURIs(asset?.currency.coinImageUrl),
    };
  });
  return (
    <div className="relative h-10 w-10 shrink-0">
      <EntityImage
        logoURIs={base.logoURIs}
        name={base.symbol}
        symbol={base.symbol}
        width={40}
        height={40}
        className="rounded-full"
      />
      <div className="absolute -bottom-1 -right-1 h-5 w-5 overflow-hidden rounded-full border-2 border-osmoverse-800">
        <EntityImage
          logoURIs={quote.logoURIs}
          name={quote.symbol}
          symbol={quote.symbol}
          width={20}
          height={20}
          className="rounded-full"
        />
      </div>
    </div>
  );
};

function getHoldingStateText(
  holding: ShareHolding | ConcentratedHolding,
  t: ReturnType<typeof useTranslation>["t"],
  language: string
): string | undefined {
  switch (holding.state) {
    case "locked":
      return holding.kind === "share" &&
        holding.locks.some((l) => l.isSynthetic)
        ? t("forcedMigration.superfluidStaked")
        : t("forcedMigration.bonded");
    case "superfluidStaked":
      return t("forcedMigration.superfluidStaked");
    case "unlocking":
      return holding.unlockEndTime
        ? t("forcedMigration.unlockingUntil", {
            date: formatUnlockDate(holding.unlockEndTime, language),
          })
        : t("forcedMigration.unlocking");
    default:
      return undefined;
  }
}

/** Unlock end in the user's language and time zone. */
function formatUnlockDate(isoDate: string, language: string): string {
  const date = new Date(isoDate);
  try {
    return new Intl.DateTimeFormat(language, { dateStyle: "medium" }).format(
      date
    );
  } catch {
    return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date);
  }
}

/**
 * A pool holding's logos and pair, then its pool number and lock state, then
 * the amount of each asset. With `migrateTo`, the destination pool is shown
 * the same way on the right and the actions move to a line below.
 */
const PoolRowLayout: FunctionComponent<{
  holding: ShareHolding | ConcentratedHolding;
  actions: ReactNode;
  migrateTo?: { poolId: string; coins: { denom: string; amount: string }[] };
}> = ({ holding, actions, migrateTo }) => {
  const { t, language } = useTranslation();
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-stretch">
        <PoolSummary
          poolId={holding.poolId}
          coins={holding.coins}
          detail={getHoldingStateText(holding, t, language)}
          // Side by side, the two pools split the width evenly.
          className={migrateTo ? "flex-1 basis-0" : undefined}
        />
        {migrateTo ? (
          <>
            <Icon
              id="arrow-right"
              height={20}
              width={20}
              className="shrink-0 text-osmoverse-400 sm:rotate-90 sm:self-center"
            />
            <PoolSummary
              poolId={migrateTo.poolId}
              coins={migrateTo.coins}
              isEstimate
              alignRight
              className="flex-1 basis-0"
            />
          </>
        ) : (
          actions
        )}
      </div>
      {migrateTo && (
        <div className="flex justify-end gap-2 sm:flex-col">{actions}</div>
      )}
    </div>
  );
};

const PoolSummary: FunctionComponent<{
  poolId: string;
  coins: { denom: string; amount: string }[];
  detail?: string;
  /** The amounts are an upper bound on what the holding becomes. */
  isEstimate?: boolean;
  alignRight?: boolean;
  className?: string;
}> = ({
  poolId,
  coins,
  detail,
  isEstimate = false,
  alignRight = false,
  className,
}) => {
  const { t } = useTranslation();
  const assets = coins.map(({ denom }) => {
    const asset = getListedAsset(denom);
    return {
      coinDenom: asset?.symbol ?? shorten(denom),
      coinMinimalDenom: denom,
      coinImageUrl: asset?.currency.coinImageUrl,
    };
  });
  const amounts = coins.filter(({ amount }) => new Dec(amount).isPositive());
  return (
    <div
      className={classNames(
        "flex min-w-0 flex-col gap-1",
        alignRight && "items-end text-right sm:items-start sm:text-left",
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <PoolAssetsIcon size="sm" className="shrink-0" assets={assets} />
        <PoolAssetsName
          size="sm"
          className="truncate text-osmoverse-100"
          assetDenoms={assets.map(({ coinDenom, coinMinimalDenom }) => ({
            symbol: coinDenom,
            minDenom: coinMinimalDenom,
          }))}
          withAssetInfoLink={false}
        />
      </div>
      <span className="body2 flex flex-wrap items-center gap-x-1.5 text-osmoverse-300">
        <span>{t("forcedMigration.poolPosition", { poolId })}</span>
        <PoolTypeAndSpread poolId={poolId} />
        {detail && <span>· {detail}</span>}
      </span>
      {amounts.length > 0 && (
        <span className="body2 flex flex-wrap gap-x-3 text-osmoverse-300">
          {amounts.map(({ denom, amount }) => (
            <span key={denom} className="whitespace-nowrap">
              {isEstimate && "≤ "}
              {formatHoldingCoin(denom, amount)}
            </span>
          ))}
        </span>
      )}
    </div>
  );
};

/** Pool type icon and spread factor, coloured as in the pools table. */
const PoolTypeAndSpread: FunctionComponent<{ poolId: string }> = ({
  poolId,
}) => {
  const { data: pool } = api.local.pools.getPool.useQuery({ poolId });
  if (!pool) return null;
  return (
    <span
      className={classNames("flex items-center gap-1", {
        "text-ion-400": pool.type === "concentrated",
        "text-bullish-300": pool.type === "stable",
      })}
    >
      {pool.type === "weighted" && (
        <Icon id="weighted-pool" width={16} height={16} />
      )}
      {pool.type === "stable" && (
        <Icon id="stable-pool" width={16} height={16} />
      )}
      {pool.type === "concentrated" && (
        <Icon id="concentrated-pool" width={16} height={16} />
      )}
      {pool.spreadFactor.toString()}
    </span>
  );
};

/** The action for a pool holding with no migration on offer. */
const PoolHoldingAction: FunctionComponent<{
  holding: ShareHolding | ConcentratedHolding;
  migration: ForcedMigration;
  oldDenom: string | undefined;
  tolerancePercent: number | undefined;
}> = ({ holding, migration, oldDenom, tolerancePercent }) => {
  if (holding.state === "unlocking") return null;
  if (holding.state === "locked" || holding.state === "superfluidStaked")
    return <UnlockAction holding={holding} />;
  if (tolerancePercent === undefined || !oldDenom) return null;
  return (
    <WithdrawAction
      holding={holding}
      migration={migration}
      oldDenom={oldDenom}
      tolerancePercent={tolerancePercent}
    />
  );
};

/**
 * A withdrawable CL position. When fe-content pairs its pool with a
 * destination, the destination is shown beside it with Migrate and Withdraw
 * below; otherwise it lays out like any other pool row.
 */
const MigratablePoolRow: FunctionComponent<{
  holding: ConcentratedHolding;
  migration: ForcedMigration;
  oldDenom: string;
  tolerancePercent: number;
  onMigrate: (holding: ConcentratedHolding) => void;
}> = ({ holding, migration, oldDenom, tolerancePercent, onMigrate }) => {
  const forcedMigration = useForcedPositionMigration(holding, tolerancePercent);
  const toPoolId = forcedMigration.mappedMigration?.toPoolId.toString();

  const withdraw = (
    <WithdrawAction
      holding={holding}
      migration={migration}
      oldDenom={oldDenom}
      tolerancePercent={tolerancePercent}
    />
  );

  if (!toPoolId) return <PoolRowLayout holding={holding} actions={withdraw} />;

  return (
    <PoolRowLayout
      holding={holding}
      migrateTo={{
        poolId: toPoolId,
        // The migration converts USDC.noble to USDC 1:1 (same decimals) and
        // re-deposits in the same range, sized just under what the withdraw
        // pays out. At the destination's price the deposit can take less of
        // one side, which stays in the wallet, so these are upper bounds.
        coins: holding.coins.map(({ denom, amount }) => ({
          denom: denom === USDC_NOBLE_DENOM ? USDC_ALLOYED_DENOM : denom,
          amount,
        })),
      }}
      actions={
        <>
          <MigrateAction
            holding={holding}
            forcedMigration={forcedMigration}
            onMigrate={onMigrate}
          />
          {withdraw}
        </>
      }
    />
  );
};

/** Runs one signed action with a loading flag and a user-facing error. */
function useHoldingTx() {
  const { t } = useTranslation();
  const { wallet, txTypeInProgress, signAndBroadcast, transactionContext } =
    useWallet();
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const run = async (
    build: (
      ctx: typeof transactionContext
    ) => Promise<Parameters<typeof signAndBroadcast>>
  ) => {
    if (!wallet) return;
    setError(undefined);
    setIsRunning(true);
    try {
      await signAndBroadcast(...(await build(transactionContext)));
    } catch (e) {
      console.error("Forced migration position action failed", e);
      if (e instanceof PositionMovedError)
        setError(t("forcedMigration.positionMoved"));
    } finally {
      setIsRunning(false);
    }
  };

  return {
    run,
    isRunning,
    isDisabled: !wallet || Boolean(txTypeInProgress) || isRunning,
    error,
  };
}

const ActionButton: FunctionComponent<{
  label: string;
  onClick: () => void;
  isLoading: boolean;
  disabled: boolean;
  variant?: "default" | "outline";
  error?: string;
}> = ({ label, onClick, isLoading, disabled, variant = "default", error }) => (
  <div className="flex flex-col items-end gap-1 sm:items-stretch">
    <Button
      size="md"
      variant={variant}
      className="!h-10 !w-fit sm:!w-full"
      onClick={onClick}
      disabled={disabled}
      isLoading={isLoading}
    >
      {label}
    </Button>
    {error && <span className="caption text-rust-300">{error}</span>}
  </div>
);

/** Withdraws a position whole. Blocked when the old asset it frees has no
 *  conversion route, so nothing is withdrawn that can't then be converted. */
const WithdrawAction: FunctionComponent<{
  holding: ShareHolding | ConcentratedHolding;
  migration: ForcedMigration;
  oldDenom: string;
  tolerancePercent: number;
}> = ({ holding, migration, oldDenom, tolerancePercent }) => {
  const { t } = useTranslation();
  const { run, isRunning, isDisabled, error } = useHoldingTx();

  // A quote only shows a route exists; the bank row's fee simulation is what
  // catches a conversion the pool would reject, once the funds are out.
  const { data: quote, isError: isQuoteError } =
    api.local.quoteRouter.routeTokenOutGivenIn.useQuery(
      {
        tokenInDenom: oldDenom,
        tokenInAmount: holding.oldDenomAmount,
        tokenOutDenom: migration.toDenom,
      },
      { refetchOnWindowFocus: false }
    );
  const canConvert = Boolean(quote) && !isQuoteError;

  const withdraw = () =>
    run(async (context) => {
      if (holding.kind === "share") {
        // Minimums come from the amounts shown here, so the chain enforces
        // exactly the worst case the user saw.
        const tokenOutMins = getShareExitTokenOutMins({
          expectedCoins: holding.coins,
          tolerancePercent,
          oldDenoms: migration.fromDenoms,
        });
        return prepareExitPoolWithMinimumsMsg(
          context,
          holding.poolId,
          holding.shares,
          tokenOutMins
        );
      }
      return prepareGuardedWithdrawPositionMsg(
        context,
        holding.positionId,
        holding.liquidity,
        async () => {
          const fresh = await fetchChainPositionCoins(holding.positionId);
          if (
            !fresh ||
            !isWithdrawWithinTolerance({
              previewCoins: holding.coins,
              freshCoins: fresh,
              tolerancePercent,
            })
          )
            throw new PositionMovedError();
        }
      );
    });

  return (
    <div className="flex flex-col items-end gap-1 sm:items-stretch">
      <ActionButton
        label={t("forcedMigration.withdraw")}
        onClick={withdraw}
        isLoading={isRunning}
        disabled={isDisabled || !canConvert}
        variant="outline"
        error={error}
      />
      {isQuoteError && (
        <span className="caption text-right text-osmoverse-400 sm:text-left">
          {t("forcedMigration.conversionUnavailable")}
        </span>
      )}
    </div>
  );
};

/** The position-migration eligibility for a CL row, with the forced
 *  migration's flat tolerance in place of the size-tiered one. Shared by the
 *  row's button and the migrate modal it opens. */
export const useForcedPositionMigration = (
  holding: ConcentratedHolding,
  tolerancePercent: number
) => {
  const [asset0, asset1] = holding.coins;
  return usePositionMigrationForPosition({
    poolId: holding.poolId,
    positionId: holding.positionId,
    // A flat tolerance doesn't depend on size.
    positionValueUsd: 0,
    positionAmounts: {
      amount0: asset0?.amount ?? "0",
      amount1: asset1?.amount ?? "0",
    },
    positionTicks: {
      lowerTick: holding.lowerTick,
      upperTick: holding.upperTick,
    },
    // Rows are only `available` once the holdings query has read the lock
    // state from chain; the modal re-reads it before signing.
    lockStateKnown: holding.state === "available",
    isUnbonding: false,
    isSuperfluidStaked: false,
    isSuperfluidUnstaking: false,
    maxDivergencePercentOverride: tolerancePercent,
  });
};

/** Offered only for pools the fe-content position-migration map pairs with a
 *  destination pool. Ineligible positions (out of range, or a price gap over
 *  the tolerance) show the button disabled, with withdraw beside it. */
const MigrateAction: FunctionComponent<{
  holding: ConcentratedHolding;
  forcedMigration: ReturnType<typeof useForcedPositionMigration>;
  onMigrate: (holding: ConcentratedHolding) => void;
}> = ({
  holding,
  forcedMigration: { eligibility, isPoolDataRefetching },
  onMigrate,
}) => {
  const { t } = useTranslation();
  const { txTypeInProgress } = useWallet();
  const isEligible = Boolean(eligibility?.isEligible);
  return (
    <ActionButton
      label={t("forcedMigration.migratePosition")}
      onClick={() => onMigrate(holding)}
      isLoading={!eligibility}
      disabled={
        !isEligible || isPoolDataRefetching || Boolean(txTypeInProgress)
      }
      error={
        eligibility && !isEligible
          ? t("forcedMigration.migrateUnavailable")
          : undefined
      }
    />
  );
};

const UnlockAction: FunctionComponent<{
  holding: ShareHolding | ConcentratedHolding;
}> = ({ holding }) => {
  const { t } = useTranslation();
  const { run, isRunning, isDisabled } = useHoldingTx();

  const unlock = () =>
    run(async (context) => {
      if (holding.kind === "cl") {
        if (!holding.lockId) throw new Error("No superfluid lock id");
        return prepareBeginUnlockingMsgOrSuperfluidUnbondLockMsgIfSyntheticLock(
          context,
          [{ lockId: holding.lockId, isSynthetic: true }]
        );
      }
      if (holding.locks.some(({ isSynthetic }) => isSynthetic))
        return prepareBeginUnlockingMsgOrSuperfluidUnbondLockMsgIfSyntheticLock(
          context,
          holding.locks
        );
      // Ten locks per tx keeps it under the block gas limit, as the pool
      // page does; the rest stay listed for another click.
      return prepareBeginUnlockingMsg(
        context,
        holding.locks.slice(0, 10).map(({ lockId }) => lockId)
      );
    });

  return (
    <ActionButton
      label={t("forcedMigration.unlock")}
      onClick={unlock}
      isLoading={isRunning}
      disabled={isDisabled}
    />
  );
};

const OrderAction: FunctionComponent<{ holding: OrderHolding }> = ({
  holding,
}) => {
  const { t } = useTranslation();
  const { run, isRunning, isDisabled } = useHoldingTx();

  const percentFilled = new Dec(holding.percentFilled);
  const hasUnclaimed = percentFilled.gt(new Dec(holding.percentClaimed));
  const isFullyFilled = percentFilled.gte(new Dec(1));

  const label = isFullyFilled
    ? t("forcedMigration.claim")
    : hasUnclaimed
      ? t("forcedMigration.claimAndCancel")
      : t("forcedMigration.cancelOrder");

  const act = () =>
    run((context) => {
      const target = {
        order_id: holding.orderId,
        tick_id: holding.tickId,
      };
      const msgs = [
        ...(hasUnclaimed ? [{ claim_limit: target }] : []),
        ...(isFullyFilled ? [] : [{ cancel_limit: target }]),
      ].map((msg) => ({
        msg,
        contractAddress: holding.orderbookAddress,
        funds: [],
      }));
      return prepareMultiExecuteContractMsg(context, "executeWasm", msgs);
    });

  return (
    <ActionButton
      label={label}
      onClick={act}
      isLoading={isRunning}
      disabled={isDisabled}
    />
  );
};

/** Reads a CL position's current amounts from the chain, uncached, for the
 *  withdraw guard. Undefined on any failure, which the guard treats as a
 *  refusal. */
async function fetchChainPositionCoins(
  positionId: string
): Promise<{ denom: string; amount: string }[] | undefined> {
  const client = getLcdClient();
  if (!client) return undefined;
  try {
    const { position } = await client.fetch<ChainPositionResponse>(
      `/osmosis/concentratedliquidity/v1beta1/position_by_id?position_id=${positionId}`,
      { cache: "no-store" }
    );
    const coins = [position?.asset0, position?.asset1].flatMap((coin) =>
      coin?.denom && coin.amount !== undefined
        ? [{ denom: coin.denom, amount: coin.amount }]
        : []
    );
    return coins.length > 0 ? coins : undefined;
  } catch {
    return undefined;
  }
}
