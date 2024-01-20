import { Dec, DecUtils, Int, IntPretty } from "@keplr-wallet/unit";
import { getChainStakeTokenSourceDenom } from "@osmosis-labs/utils";

import { ChainList } from "~/config/generated/chain-list";
import { getDistributionParams } from "~/server/queries/complex/cosmos";
import {
  getEpoch,
  getEpochProvisions,
} from "~/server/queries/complex/osmosis/epochs";
import { getOsmosisMintParams } from "~/server/queries/complex/osmosis/osmosis-params";
import {
  queryInflation,
  queryStakingPool,
  querySupplyTotal,
} from "~/server/queries/cosmos";

export async function getChainInflation({ chainId }: { chainId: string }) {
  // XXX: Hard coded part for the iris hub and sifchain.
  // TODO: Remove this part.

  let dec: Dec | undefined;

  const stakeTokenSourceDenom = getChainStakeTokenSourceDenom({
    chainId,
    chainList: ChainList,
  });

  if (!stakeTokenSourceDenom) {
    return new IntPretty(new Int(0)).ready(false);
  }

  const [chainTotalSupply, stakingPool, distributionParams] = await Promise.all(
    [
      querySupplyTotal({ denom: stakeTokenSourceDenom }),
      queryStakingPool({ chainId }),
      getDistributionParams({ chainId }),
    ]
  );

  try {
    if (chainId.startsWith("osmosis")) {
      /*
    XXX: Temporary and unfinished implementation for the osmosis staking APY.
        Osmosis has different minting method.
        It mints the fixed token per epoch with deduction feature on the range of epoch.
        And, it actually doesn't mint the token, it has the locked token that will be inflated.
        So, currently, using the result of `supply total` to calculate the APY is actually not valid
        because it included the locked token that is not yet inflated.
        So, for now, just assume that the curreny supply is 100,000,000.
    */

      const { epochIdentifier, distributionProportions } =
        await getOsmosisMintParams();
      if (epochIdentifier) {
        const epochDuration = (await getEpoch({ identifier: epochIdentifier }))
          ?.duration;

        if (epochDuration) {
          const epochProvision = await getEpochProvisions();

          if (epochProvision && chainTotalSupply) {
            const mintingEpochProvision = new Dec(
              epochProvision
                .toDec()
                .mul(distributionProportions.staking)
                .truncate()
                .toString()
            );
            const yearMintingProvision = mintingEpochProvision.mul(
              new Dec(((365 * 24 * 3600) / epochDuration).toString())
            );
            const total = DecUtils.getPrecisionDec(8);
            dec = yearMintingProvision
              .quo(total)
              .mul(DecUtils.getPrecisionDec(2));
          }
        }
      }
    } else {
      const { inflation } = await queryInflation();
      dec = new Dec(inflation ?? "0").mul(DecUtils.getPrecisionDec(2));
    }

    if (!dec || dec.equals(new Dec(0))) {
      return new IntPretty(new Int(0)).ready(false);
    }

    if (stakingPool && chainTotalSupply) {
      const bondedToken = new Dec(stakingPool.pool.bonded_tokens);

      const totalStr = (() => {
        if (chainId.startsWith("osmosis")) {
          // For osmosis, for now, just assume that the current supply is 100,000,000 with 6 decimals.
          return DecUtils.getPrecisionDec(8 + 6).toString();
        }

        return chainTotalSupply!.amount.amount;
      })();
      const total = new Dec(totalStr);
      if (total.gt(new Dec(0))) {
        // staking APR is calculated as:
        //   new_coins_per_year = inflation_pct * total_supply * (1 - community_pool_tax)
        //   apr = new_coins_per_year / total_bonded_tokens

        const ratio = bondedToken.quo(total);
        dec = dec
          .mul(new Dec(1).sub(distributionParams.communityTax.toDec()))
          .quo(ratio);
        // TODO: Rounding?
      }
    }

    return new IntPretty(dec);
  } catch (e) {
    console.error(e);
    // XXX: There have been reported errors regarding Sifchain.
    // However, I wasn’t able to reproduce the error so exact cause haven’t been identified.
    // For now, use try-catch on suspect parts to resolve the issue. Will be on a lookout for a more permanent solution in the future.

    return new IntPretty(new Int(0)).ready(false);
  }
}
