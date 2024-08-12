import { MsgCreateBalancerPool } from "@osmosis-labs/proto-codecs/build/codegen/osmosis/gamm/poolmodels/balancer/v1beta1/tx";

import { getOsmosisCodec } from "../../codec";

export async function makeCreateBalancerPoolMsg({
  futurePoolGovernor,
  poolAssets,
  sender,
  poolParams,
}: MsgCreateBalancerPool) {
  const osmosis = await getOsmosisCodec();
  return osmosis.gamm.poolmodels.balancer.v1beta1.MessageComposer.withTypeUrl.createBalancerPool(
    {
      futurePoolGovernor,
      poolAssets,
      sender,
      poolParams,
    }
  );
}
