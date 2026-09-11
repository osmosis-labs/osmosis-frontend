import type { UserPosition } from "@osmosis-labs/server";
import { CoinPretty, Dec, Int } from "@osmosis-labs/unit";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/router";
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
    return { base, noble, isInformative: amounts.isInformative };
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
  const { chainStore, accountStore } = useStore();
  const { chainId } = chainStore.osmosis;
  const account = accountStore.getWallet(chainId);
  const apiUtils = api.useUtils();

  /* For a full-range or ultra-wide position the range-edge maxima are
     astronomical noise, so the risk figure shown is the wallet's own balance
     of each denom instead: the draw cannot exceed what the wallet holds at
     execution (bank-enforced), and a user needs a number to size their risk,
     not a phrase. The figure is explicitly labeled as the CURRENT balance:
     it polls on the same cadence as the pools, the row placeholders and the
     confirm is held until it has loaded (an unloaded balance must never read
     as a zero cap with a live action), and the one thing it cannot promise
     against - funds the user deposits in the final seconds becoming
     drawable - is covered by the notice's "never more than it holds", which
     is the execution-time truth. */
  const needsBalanceBound =
    maxWalletDraw !== undefined && !maxWalletDraw.isInformative;
  const { data: walletBalances } = api.local.balances.getUserBalances.useQuery(
    { bech32Address: account?.address ?? "" },
    {
      enabled: Boolean(account?.address) && needsBalanceBound,
      refetchInterval: 15_000,
    }
  );
  const balancesReady = !needsBalanceBound || walletBalances !== undefined;
  const balanceCoin = (currency: CoinPretty["currency"]) =>
    new CoinPretty(
      currency,
      walletBalances?.find((bal) => bal.denom === currency.coinMinimalDenom)
        ?.amount ?? "0"
    );

  const [isMigrating, setIsMigrating] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const router = useRouter();

  /* Post-migration routing: stay wherever the user is, except when they are
     looking at the source pool's own page and this was their last position
     in it - an emptied pool page is a dead end, so return to the pools page
     and its positions/pools sections. Checked against a fresh positions
     fetch rather than inferred, and any failure to decide simply stays put:
     navigation is a convenience and must never read as a migration error. */
  const routeAwayIfPoolEmptied = useCallback(async () => {
    if (router.pathname !== "/pool/[id]" || router.query.id !== poolId) return;
    const address = account?.address;
    if (!address) return;
    try {
      const positions =
        await apiUtils.local.concentratedLiquidity.getUserPositions.fetch(
          { userOsmoAddress: address, forPoolId: poolId },
          { staleTime: 0 }
        );
      if (Array.isArray(positions) && positions.length === 0)
        // Awaited so a rejected navigation lands in this catch instead of
        // escaping as an unhandled rejection.
        await router.push("/pools");
    } catch {
      // Stay put.
    }
  }, [router, poolId, account?.address, apiUtils]);

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
            void routeAwayIfPoolEmptied();
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
    routeAwayIfPoolEmptied,
  ]);

  const { showModalBase, accountActionButton } = useConnectWalletModalRedirect(
    {
      disabled:
        isMigrating ||
        Boolean(account?.txTypeInProgress) ||
        // Held while the divergence sits outside the allowance, the polled
        // pool data is mid-refetch, or the balances backing the disclosed
        // draw cap have not loaded; all three resolve on their own and the
        // stat block shows which one the user is looking at.
        !isEligible ||
        isPoolDataRefetching ||
        !balancesReady,
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
              {/* Range-edge maxima, deliberately NOT clamped to a wallet
                  balance: a polled balance is only ever a snapshot, and
                  funds arriving after it would let the transaction cover a
                  larger shortfall than a clamped figure promised. The two
                  bounds that hold without trust are these maxima (the sized
                  spends cannot exceed them at any price) and, worded in the
                  risk notice, that the draw can never exceed what the wallet
                  actually holds at execution - the bank module enforces that
                  one. Joined with a localized "or", never a slash - a slash
                  reads as a pool pair, and only one side can fall short in a
                  given move. Rendered by a formatter that can only round
                  this cap up, never truncate or shrink it down. */}
              <span className="subtitle1 text-white-full">
                {maxWalletDraw.isInformative
                  ? t("clPositions.migrateMaxWalletDrawValue", {
                      base: formatWalletDrawCap(maxWalletDraw.base, 6),
                      noble: formatWalletDrawCap(maxWalletDraw.noble, 2),
                    })
                  : // A full-range or ultra-wide position makes the edge
                  // maxima astronomical noise; show the wallet's current
                  // balances instead - the bank-enforced cap, quantified.
                  balancesReady && walletBalances
                  ? t("clPositions.migrateMaxWalletDrawWideRange", {
                      base: formatWalletDrawCap(
                        balanceCoin(maxWalletDraw.base.currency),
                        6
                      ),
                      noble: formatWalletDrawCap(
                        balanceCoin(maxWalletDraw.noble.currency),
                        2
                      ),
                    })
                  : "..."}
              </span>
            </div>
          )}
        </div>

        {accountActionButton}
      </div>
    </ModalBase>
  );
});
