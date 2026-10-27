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
import { FunctionComponent, useState } from "react";

import { Button } from "~/components/ui/button";
import { AssetLists } from "~/config/generated/asset-lists";
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
import { ChainPositionResponse } from "~/utils/position-migrations";
import { api } from "~/utils/trpc";

/** Display amount for a raw coin; unlisted denoms show the raw amount. */
export function formatHoldingCoin(denom: string, amount: string): string {
  const asset = getAssetFromAssetList({
    coinMinimalDenom: denom,
    assetLists: AssetLists,
  });
  if (!asset) return `${amount} ${shorten(denom)}`;
  return new CoinPretty(asset.currency, amount)
    .trim(true)
    .maxDecimals(6)
    .toString();
}

const keepAfterTolerance = (amount: string, tolerancePercent: number) =>
  new Dec(amount)
    .mul(new Dec(1).sub(new Dec(tolerancePercent).quo(new Dec(100))))
    .truncate()
    .toString();

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
      <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-stretch">
        <div className="flex min-w-0 flex-col">
          <span className="subtitle1 text-osmoverse-100">
            {getHoldingLabel(holding, t)}
          </span>
          <span className="body2 text-osmoverse-300">
            {[oldAmountText, getHoldingStateText(holding, t)]
              .filter(Boolean)
              .join(" · ")}
          </span>
        </div>
        <HoldingAction
          holding={holding}
          migration={migration}
          oldDenom={oldDenom}
          tolerancePercent={tolerancePercent}
          onMigrate={onMigrate}
        />
      </div>
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

function getHoldingLabel(
  holding: ForcedMigrationHolding,
  t: ReturnType<typeof useTranslation>["t"]
): string {
  if (holding.kind === "order") {
    const symbol = (denom: string) =>
      getAssetFromAssetList({ coinMinimalDenom: denom, assetLists: AssetLists })
        ?.symbol ?? shorten(denom);
    return t("forcedMigration.limitOrder", {
      pair: `${symbol(holding.inDenom)} → ${symbol(holding.outDenom)}`,
    });
  }
  return t("forcedMigration.poolPosition", { poolId: holding.poolId });
}

function getHoldingStateText(
  holding: ForcedMigrationHolding,
  t: ReturnType<typeof useTranslation>["t"]
): string | undefined {
  if (holding.kind === "order") return undefined;
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
            date: new Date(holding.unlockEndTime).toLocaleDateString(),
          })
        : t("forcedMigration.unlocking");
    default:
      return undefined;
  }
}

const HoldingAction: FunctionComponent<{
  holding: ForcedMigrationHolding;
  migration: ForcedMigration;
  oldDenom: string | undefined;
  tolerancePercent: number | undefined;
  onMigrate: (holding: ConcentratedHolding) => void;
}> = ({ holding, migration, oldDenom, tolerancePercent, onMigrate }) => {
  if (holding.kind === "order") return <OrderAction holding={holding} />;
  if (holding.state === "unlocking") return null;
  if (holding.state === "locked" || holding.state === "superfluidStaked")
    return <UnlockAction holding={holding} />;
  if (tolerancePercent === undefined || !oldDenom) return null;
  return (
    <div className="flex items-center gap-2 sm:flex-col sm:items-stretch">
      {holding.kind === "cl" && (
        <MigrateAction
          holding={holding}
          tolerancePercent={tolerancePercent}
          onMigrate={onMigrate}
        />
      )}
      <WithdrawAction
        holding={holding}
        migration={migration}
        oldDenom={oldDenom}
        tolerancePercent={tolerancePercent}
      />
    </div>
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

  const minimums = holding.coins
    .map(({ denom, amount }) => ({
      denom,
      amount: keepAfterTolerance(amount, tolerancePercent),
    }))
    .filter(({ amount }) => new Dec(amount).isPositive());

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
      <span className="caption text-right text-osmoverse-400 sm:text-left">
        {isQuoteError
          ? t("forcedMigration.conversionUnavailable")
          : t("forcedMigration.atLeast", {
              amounts: minimums
                .map(({ denom, amount }) => formatHoldingCoin(denom, amount))
                .join(" + "),
            })}
      </span>
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
  tolerancePercent: number;
  onMigrate: (holding: ConcentratedHolding) => void;
}> = ({ holding, tolerancePercent, onMigrate }) => {
  const { t } = useTranslation();
  const { txTypeInProgress } = useWallet();
  const { mappedMigration, eligibility, isPoolDataRefetching } =
    useForcedPositionMigration(holding, tolerancePercent);
  if (!mappedMigration) return null;
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
