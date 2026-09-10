import type { UserPosition } from "@osmosis-labs/server";
import { CoinPretty, Dec, Int } from "@osmosis-labs/unit";
import { observer } from "mobx-react-lite";
import { FunctionComponent, useCallback, useMemo, useState } from "react";

import { Icon, PoolAssetsIcon } from "~/components/assets";
import type { PoolAssetInfo } from "~/components/assets/types";
import {
  USDC_ALLOYED_DENOM,
  USDC_CANONICAL_SYMBOL,
  USDC_NOBLE_DENOM,
  USDC_TRANSMUTER_POOL_ID,
} from "~/config/position-migration";
import { useConnectWalletModalRedirect, useTranslation } from "~/hooks";
import { ModalBase, ModalBaseProps } from "~/modals/base";
import { useStore } from "~/stores";
import {
  formatWalletDrawCap,
  getRangeMaxWithdrawAmounts,
  MigrationEligibility,
} from "~/utils/position-migrations";
import { api } from "~/utils/trpc";

/**
 * Moves a concentrated liquidity position to an equivalent pool, keeping the
 * same price range.
 *
 * The withdraw and the create share one transaction, so if the create cannot
 * be filled on acceptable terms the whole thing reverts and the original
 * position is left untouched. Whatever does not fit the new position's ratio
 * at the destination price is returned to the wallet rather than swapped.
 */
export const MigrateConcentratedPositionModal: FunctionComponent<
  {
    position: UserPosition;
    toPoolId: string;
    minAmountTolerance: number;
    /** Live price difference between the pools when the modal opened. */
    divergencePercent: Dec;
    /** The size-tier tolerance this position was judged against. */
    appliedTolerancePercent: number;
    /**
     * Live eligibility as the polled pool data sees it. The modal stays
     * mounted when this flips false mid-flow (only the divergence can drift;
     * anything structural unmounts it upstream), so the confirm is held
     * instead of the modal vanishing under the user.
     */
    isEligible: boolean;
    /**
     * True while the polled pool data is mid-refetch: the numbers shown are
     * about to change, so the confirm is held until they settle.
     */
    isPoolDataRefetching: boolean;
    /**
     * Re-runs the full eligibility check against freshly fetched pool state.
     * Called at confirm time: the render-time eligibility can be minutes old,
     * and the simulations that size the transaction would otherwise accept
     * whatever the pools have drifted to as their baseline.
     */
    revalidate: () => Promise<MigrationEligibility | undefined>;
  } & ModalBaseProps
> = observer((props) => {
  const {
    position,
    toPoolId,
    minAmountTolerance,
    divergencePercent,
    appliedTolerancePercent,
    isEligible,
    isPoolDataRefetching,
    revalidate,
  } = props;

  const currentDivergence = divergencePercent.toString(3);
  const {
    id: positionId,
    poolId,
    currentCoins,
    position: { position: rawPosition, asset0, asset1 },
  } = position;

  // Name the movement in pair symbols: the source side as the assetlist
  // renders it (USDC.noble), the destination as the canonical USDC, the same
  // presentation the variant-to-alloy converter uses.
  const nobleCoin = currentCoins?.find(
    (coin) => coin.currency.coinMinimalDenom === USDC_NOBLE_DENOM
  );
  const baseCoin = currentCoins?.find(
    (coin) => coin.currency.coinMinimalDenom !== USDC_NOBLE_DENOM
  );
  const baseSymbol = baseCoin?.currency.coinDenom ?? "";
  const fromUsdcSymbol = nobleCoin?.currency.coinDenom ?? "USDC.noble";

  /* The disclosed maximum wallet draw. A snapshot of the position's current
     composition would understate it - both pools can move together without
     tripping the divergence gate, and the transaction is sized from a fresh
     simulation taken later - so this uses the range-edge maxima instead:
     amounts a full withdrawal can never exceed at any price, and therefore a
     true ceiling on the sized spends. */
  const maxWalletDraw = useMemo(() => {
    const amounts = getRangeMaxWithdrawAmounts({
      liquidity: rawPosition.liquidity,
      lowerTick: new Int(rawPosition.lower_tick),
      upperTick: new Int(rawPosition.upper_tick),
    });
    if (!amounts) return undefined;
    const currencyFor = (denom: string) =>
      currentCoins?.find((coin) => coin.currency.coinMinimalDenom === denom)
        ?.currency;
    const sides = [
      { currency: currencyFor(asset0.denom), amount: amounts.maxAmount0 },
      { currency: currencyFor(asset1.denom), amount: amounts.maxAmount1 },
    ];
    if (sides.some((side) => !side.currency)) return undefined;
    const coins = sides.map(
      (side) => new CoinPretty(side.currency!, side.amount)
    );
    const noble = coins.find(
      (coin) => coin.currency.coinMinimalDenom === USDC_NOBLE_DENOM
    );
    const base = coins.find(
      (coin) => coin.currency.coinMinimalDenom !== USDC_NOBLE_DENOM
    );
    if (!noble || !base) return undefined;
    return { base, noble };
  }, [
    rawPosition.liquidity,
    rawPosition.lower_tick,
    rawPosition.upper_tick,
    asset0.denom,
    asset1.denom,
    currentCoins,
  ]);

  const { data: toPoolData } = api.local.pools.getPool.useQuery({
    poolId: toPoolId,
  });
  const toCoin = (predicate: (denom: string) => boolean) =>
    toPoolData?.reserveCoins.find((coin) =>
      predicate(coin.currency.coinMinimalDenom)
    )?.currency;
  const toUsdcCurrency = toCoin((d) => d === USDC_ALLOYED_DENOM);
  const toBaseCurrency = toCoin((d) => d !== USDC_ALLOYED_DENOM);

  const asIcon = (c?: {
    coinDenom: string;
    coinMinimalDenom: string;
    coinImageUrl?: string;
  }) =>
    c
      ? {
          coinDenom: c.coinDenom,
          coinMinimalDenom: c.coinMinimalDenom,
          coinImageUrl: c.coinImageUrl,
        }
      : undefined;
  const fromAssets = [
    asIcon(baseCoin?.currency),
    asIcon(nobleCoin?.currency),
  ].filter(Boolean) as PoolAssetInfo[];
  const toAssets = [asIcon(toBaseCurrency), asIcon(toUsdcCurrency)].filter(
    Boolean
  ) as PoolAssetInfo[];

  const { t } = useTranslation();
  const { chainStore, accountStore, queriesStore } = useStore();
  const { chainId } = chainStore.osmosis;
  const account = accountStore.getWallet(chainId);
  const apiUtils = api.useUtils();

  /* The draw on pre-existing funds is further capped by what the wallet
     holds right now: a shortfall the balance cannot cover reverts the whole
     transaction rather than drawing it, so the honest disclosure is the
     smaller of the range-edge maximum and the current balance. Reactive
     under observer, so the row tracks the wallet; a balance that grows
     mid-flow raises the true cap with it. The gas token's side includes the
     gas reserve - the bank module does not fence it. */
  const walletBalances = account?.address
    ? queriesStore
        .get(chainId)
        .queryBalances.getQueryBech32Address(account.address)
    : undefined;
  const clampToBalance = (cap: CoinPretty) => {
    const balance = walletBalances?.getBalanceFromCurrency(cap.currency);
    if (!balance) return cap;
    return new Int(balance.toCoin().amount).lt(new Int(cap.toCoin().amount))
      ? balance
      : cap;
  };

  const [isMigrating, setIsMigrating] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const migrate = useCallback(async () => {
    if (!account) return;

    setIsMigrating(true);
    setError(undefined);

    try {
      /* The eligibility that opened this modal is stale by now. Re-check
         against uncached chain state before doing anything else: without
         this, the sizing simulations would just accept the drifted state as
         their baseline. The same check runs once more inside the send, right
         before the transaction is signed, because the simulations themselves
         take seconds. */
      const fresh = await revalidate();
      if (!fresh?.isEligible) {
        setError(t("clPositions.migrateRevalidationFailed"));
        return;
      }

      await account.osmosis.sendMigrateConcentratedLiquidityPositionMsg(
        positionId,
        toPoolId,
        new Int(rawPosition.lower_tick),
        new Int(rawPosition.upper_tick),
        minAmountTolerance,
        {
          fromDenom: USDC_NOBLE_DENOM,
          toDenom: USDC_ALLOYED_DENOM,
          transmuterPoolId: USDC_TRANSMUTER_POOL_ID,
        },
        async () => {
          const finalCheck = await revalidate();
          if (!finalCheck?.isEligible)
            throw new Error(t("clPositions.migrateRevalidationFailed"));
        },
        undefined,
        (tx) => {
          if (!tx.code) {
            // Both pools' tick data and the user's position list change.
            apiUtils.local.concentratedLiquidity.invalidate();
            props.onRequestClose();
          }
        }
      );
    } catch (e) {
      // Surfaced rather than only logged: a refusal here is the safety
      // mechanism working, and the user needs to know the position was not
      // moved.
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsMigrating(false);
    }
  }, [
    account,
    revalidate,
    t,
    positionId,
    toPoolId,
    rawPosition.lower_tick,
    rawPosition.upper_tick,
    minAmountTolerance,
    apiUtils,
    props,
  ]);

  const { showModalBase, accountActionButton } = useConnectWalletModalRedirect(
    {
      disabled:
        isMigrating ||
        Boolean(account?.txTypeInProgress) ||
        // Held while the divergence sits outside the allowance or the polled
        // pool data is mid-refetch; both states resolve on their own and the
        // stat block explains which one the user is looking at.
        !isEligible ||
        isPoolDataRefetching,
      onClick: migrate,
      children: t("clPositions.migrateLiquidity"),
    },
    props.onRequestClose
  );

  return (
    <ModalBase
      {...props}
      isOpen={props.isOpen && showModalBase}
      title={t("clPositions.migrateLiquidity")}
    >
      <div className="flex flex-col gap-6 pt-8">
        {fromAssets.length === 2 && toAssets.length === 2 && (
          <div className="flex items-center justify-center gap-3">
            <div className="flex items-center gap-2">
              <PoolAssetsIcon size="sm" assets={fromAssets} />
              <span className="subtitle1 text-osmoverse-100">
                {baseSymbol}/{fromUsdcSymbol}
              </span>
            </div>
            <Icon id="arrow-right" height={20} width={20} />
            <div className="flex items-center gap-2">
              <PoolAssetsIcon size="sm" assets={toAssets} />
              <span className="subtitle1 text-osmoverse-100">
                {baseSymbol}/{USDC_CANONICAL_SYMBOL}
              </span>
            </div>
          </div>
        )}
        <div className="flex flex-col gap-3">
          <span className="body2 text-osmoverse-200">
            {t("clPositions.migrateDescription", {
              baseSymbol,
              fromUsdcSymbol,
              toUsdcSymbol: USDC_CANONICAL_SYMBOL,
              fromPoolId: poolId,
              toPoolId,
            })}
          </span>
          <span className="caption text-osmoverse-300">
            {t("clPositions.migrateReason")}
          </span>
          <span className="caption text-osmoverse-300">
            {t("clPositions.migrateDustNotice")}
          </span>
          <span className="caption text-osmoverse-300">
            {t("clPositions.migrateIncentivesNotice")}
          </span>
          <span className="caption text-osmoverse-300">
            {t("clPositions.migrateRiskNotice")}
          </span>
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-2xl bg-osmoverse-900 px-4 py-3">
            <Icon id="alert-circle" height={16} width={16} />
            <span className="caption text-rust-300">{error}</span>
          </div>
        )}

        <div className="flex flex-col gap-2 rounded-2xl bg-osmoverse-900 px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="body2 text-osmoverse-300">
              {t("clPositions.migrateCurrentDifference")}
            </span>
            <span
              className={
                isEligible
                  ? "subtitle1 text-white-full"
                  : "subtitle1 text-rust-300"
              }
            >
              {currentDivergence}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="body2 text-osmoverse-300">
              {t("clPositions.migrateAllowedDifference")}
            </span>
            <span className="subtitle1 text-white-full">
              {appliedTolerancePercent}%
            </span>
          </div>
          {maxWalletDraw && (
            <div className="flex items-center justify-between">
              <span className="body2 text-osmoverse-300">
                {t("clPositions.migrateMaxWalletDraw")}
              </span>
              {/* Range-edge maxima clamped to current balances, not the
                  position's composition: the risk notice points here instead
                  of calling the draw small. Joined with a localized "or",
                  never a slash - a slash reads as a pool pair, and only one
                  side can fall short in a given move. Rendered by a
                  formatter that can only round this cap up, never truncate
                  or shrink it down. */}
              <span className="subtitle1 text-white-full">
                {t("clPositions.migrateMaxWalletDrawValue", {
                  base: formatWalletDrawCap(
                    clampToBalance(maxWalletDraw.base),
                    6
                  ),
                  noble: formatWalletDrawCap(
                    clampToBalance(maxWalletDraw.noble),
                    2
                  ),
                })}
              </span>
            </div>
          )}
        </div>

        {accountActionButton}
      </div>
    </ModalBase>
  );
});
