import { osmosis } from "@osmosis-labs/proto-codecs";
import { MsgCreateStableswapPool } from "@osmosis-labs/proto-codecs/build/codegen/osmosis/gamm/poolmodels/stableswap/v1beta1/tx";

export function makeCreateStableswapPoolMsg({
  sender,
  poolParams,
  initialPoolLiquidity,
  scalingFactors,
  scalingFactorController,
  futurePoolGovernor,
}: MsgCreateStableswapPool) {
  return osmosis.gamm.poolmodels.stableswap.v1beta1.MessageComposer.withTypeUrl.createStableswapPool(
    {
      sender,
      poolParams,
      initialPoolLiquidity,
      scalingFactors,
      scalingFactorController,
      futurePoolGovernor,
    }
  );
}
