import { osmosis } from "@osmosis-labs/proto-codecs";
import { MsgCreateBalancerPool } from "@osmosis-labs/proto-codecs/build/codegen/osmosis/gamm/poolmodels/balancer/v1beta1/tx";

export function makeCreateBalancerPoolMsg({
  futurePoolGovernor,
  poolAssets,
  sender,
  poolParams,
}: MsgCreateBalancerPool) {
  return osmosis.gamm.poolmodels.balancer.v1beta1.MessageComposer.withTypeUrl.createBalancerPool(
    {
      futurePoolGovernor,
      poolAssets,
      sender,
      poolParams,
    }
  );
}
