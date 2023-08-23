import { CosmosQueries, IQueriesStore } from "@keplr-wallet/stores";
import { CoinPretty, Dec, PricePretty, RatePretty } from "@keplr-wallet/unit";
import { makeObservable } from "mobx";
import { IPriceStore } from "src/price";

import {
  AccountStore,
  CosmosAccount,
  CosmwasmAccount,
  OsmosisAccount,
} from "../account";
import { DerivedDataStore } from "../derived-data";
import { OsmosisQueries } from "../queries";
import { QueriesExternalStore } from "../queries-external";

type SuggestedConvertToStakeAssets = {
  poolId: string;
  totalValue: PricePretty;
  userPoolAssets: CoinPretty[];
  currentApr: RatePretty;
  convertToStake: () => Promise<void>;
};

/** Aggregates user balancer and CL positions that are available to be staked, preferably for a higher APR.
 *  Then, provides async callbacks for converting that stake.
 */
export class UserConvertToStakeConfig {
  /** For each user owned pool, this provides a breakdown of shares or CL positions
   *  that are of lesser returns than the staking inflationary returns.
   *
   *  Further, it provides a callback for converting those assets to stake via the
   *  given account store.
   */
  get suggestedConvertibleAssetsPerPool(): SuggestedConvertToStakeAssets[] {
    const ownedSharePoolIds =
      this.osmosisQueries.queryGammPoolShare.getOwnPools(this.accountAddress);
    const ownedClPoolIds = this.ownedClPositions.positions.reduce(
      (acc, pos) => {
        if (pos.poolId) acc.push(pos.poolId);
        return acc;
      },
      [] as string[]
    );

    const conversions: SuggestedConvertToStakeAssets[] = [];

    // calculate conversions for user's share pools
    ownedSharePoolIds.forEach((sharePoolId) => {
      const { sharePoolDetail, superfluidPoolDetail, poolBonding } =
        this.derivedDataStore.getForPool(sharePoolId);

      const totalValue =
        sharePoolDetail.userStats?.totalShareValue ??
        new PricePretty(this.fiatCurrency, 0);
      const userPoolAssets = sharePoolDetail.userPoolAssets.map(
        ({ asset }) => asset
      );

      const currentApr =
        poolBonding.highestBondDuration?.aggregateApr ??
        superfluidPoolDetail.superfluidApr.add(sharePoolDetail.swapFeeApr);

      conversions.push({
        poolId: sharePoolId,
        totalValue,
        userPoolAssets,
        currentApr,
        convertToStake: async () => Promise.reject(),
      });
    });

    // calculate conversions for user's CL pools
    ownedClPoolIds.forEach((clPoolId) => {
      const queryAccountsPositions =
        this.osmosisQueries.queryAccountsPositions.get(this.accountAddress);

      const poolPositions = queryAccountsPositions.positionsInPool(clPoolId);

      // get ROIs of each position and then average
      const positionRois = poolPositions
        .map((pos) => {
          if (pos.quoteAsset && pos.baseAsset && pos.totalClaimableRewards) {
            // get ROI of this position, given historical position data
            const positionRoi =
              this.queriesExternalStore.queryPositionsPerformaceMetrics
                .get(pos.id)
                ?.calculateReturnOnInvestment(
                  [pos.baseAsset, pos.quoteAsset],
                  pos.totalClaimableRewards
                );

            return positionRoi;
          }
        })
        .filter((roi): roi is RatePretty => roi !== undefined);
      const avgRoi = positionRois
        .reduce<RatePretty>((acc, roi) => acc.add(roi), new RatePretty(0))
        .quo(new Dec(positionRois.length));

      const positionsAssets =
        queryAccountsPositions.totalPositionsAssetsInPool(clPoolId);

      const totalPositionsValue = positionsAssets.reduce(
        (sum, positionAssets) => {
          return sum.add(
            this.priceStore.calculatePrice(positionAssets) ??
              new PricePretty(this.fiatCurrency, 0)
          );
        },
        new PricePretty(this.fiatCurrency, 0)
      );

      conversions.push({
        poolId: clPoolId,
        totalValue: totalPositionsValue,
        userPoolAssets: positionsAssets,
        currentApr: avgRoi,
        convertToStake: async () => Promise.reject(),
      });
    });

    return conversions;
  }

  protected get ownedClPositions() {
    return this.osmosisQueries.queryAccountsPositions.get(this.accountAddress);
  }

  protected get ownedSharePoolShares(): {
    availableShares?: CoinPretty;
    bondedShares?: CoinPretty;
    apr: RatePretty;
  }[] {
    const userSharePoolIds = this.osmosisQueries.queryGammPoolShare.getOwnPools(
      this.accountAddress
    );

    return userSharePoolIds.map((poolId) => {
      const { sharePoolDetail, superfluidPoolDetail, poolBonding } =
        this.derivedDataStore.getForPool(poolId);

      const availableShares = sharePoolDetail.userAvailableShares;
      const bondedShares = sharePoolDetail.userBondedShares;

      const apr =
        poolBonding.highestBondDuration?.aggregateApr ??
        superfluidPoolDetail.superfluidApr.add(sharePoolDetail.swapFeeApr);

      return {
        availableShares: availableShares.toDec().isPositive()
          ? availableShares
          : undefined,
        bondedShares: bondedShares.toDec().isPositive()
          ? bondedShares
          : undefined,
        apr,
      };
    });
  }

  protected get stakeApr() {
    return this.cosmosQueries.queryInflation.inflation;
  }

  protected get osmosisQueries() {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.queriesStore.get(this.osmosisChainId).osmosis!;
  }

  protected get cosmosQueries() {
    return this.queriesStore.get(this.osmosisChainId).cosmos;
  }

  protected get osmosisAccount() {
    return this.accountStore.getWallet(this.osmosisChainId)?.osmosis;
  }

  protected get accountAddress() {
    return this.accountStore.getWallet(this.osmosisChainId)?.address ?? "";
  }

  protected get fiatCurrency() {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.priceStore.getFiatCurrency(this.priceStore.defaultVsCurrency)!;
  }

  constructor(
    protected readonly osmosisChainId: string,
    protected readonly queriesStore: IQueriesStore<
      CosmosQueries & OsmosisQueries
    >,
    protected readonly queriesExternalStore: QueriesExternalStore,
    protected readonly accountStore: AccountStore<
      [OsmosisAccount, CosmosAccount, CosmwasmAccount]
    >,
    protected readonly derivedDataStore: DerivedDataStore,
    protected readonly priceStore: IPriceStore
  ) {
    makeObservable(this);
  }
}
