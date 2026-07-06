import type {
  MsgAddToGauge,
  MsgCreateGauge,
} from "@osmosis-labs/proto-codecs/build/codegen/osmosis/incentives/tx";

import { getOsmosisCodec } from "../../codec";

export async function makeCreateGaugeMsg({
  isPerpetual,
  owner,
  distributeTo,
  coins,
  startTime,
  numEpochsPaidOver,
  poolId,
}: MsgCreateGauge) {
  const osmosis = await getOsmosisCodec();
  return osmosis.incentives.MessageComposer.withTypeUrl.createGauge({
    isPerpetual,
    owner,
    distributeTo,
    coins,
    startTime,
    numEpochsPaidOver,
    poolId,
  });
}

export async function makeAddToGaugeMsg({
  owner,
  gaugeId,
  rewards,
}: MsgAddToGauge) {
  const osmosis = await getOsmosisCodec();
  return osmosis.incentives.MessageComposer.withTypeUrl.addToGauge({
    owner,
    gaugeId,
    rewards,
  });
}
