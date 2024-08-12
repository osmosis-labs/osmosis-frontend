import type { MsgCreateStableswapPool } from "@osmosis-labs/proto-codecs/build/codegen/osmosis/gamm/poolmodels/stableswap/v1beta1/tx";

import { getOsmosisCodec } from "../../codec";

export async function makeCreateStableswapPoolMsg({
  sender,
  poolParams,
  initialPoolLiquidity,
  scalingFactors,
  scalingFactorController,
  futurePoolGovernor,
}: MsgCreateStableswapPool) {
  const osmosis = await getOsmosisCodec();
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
