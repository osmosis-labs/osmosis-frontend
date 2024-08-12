import { MsgCreateConcentratedPool } from "@osmosis-labs/proto-codecs/build/codegen/osmosis/concentratedliquidity/poolmodel/concentrated/v1beta1/tx";
import {
  MsgAddToPosition,
  MsgCollectIncentives,
  MsgCollectSpreadRewards,
  MsgCreatePosition,
  MsgWithdrawPosition,
} from "@osmosis-labs/proto-codecs/build/codegen/osmosis/concentratedliquidity/v1beta1/tx";

import { getOsmosisCodec } from "../../codec";

export async function makeCreateConcentratedPoolMsg({
  denom0,
  denom1,
  sender,
  spreadFactor,
  tickSpacing,
}: MsgCreateConcentratedPool) {
  const osmosis = await getOsmosisCodec();
  return osmosis.concentratedliquidity.poolmodel.concentrated.v1beta1.MessageComposer.withTypeUrl.createConcentratedPool(
    {
      denom0,
      denom1,
      sender,
      spreadFactor,
      tickSpacing,
    }
  );
}

export async function makeCreatePositionMsg({
  poolId,
  sender,
  lowerTick,
  upperTick,
  tokensProvided,
  tokenMinAmount0,
  tokenMinAmount1,
}: MsgCreatePosition) {
  const osmosis = await getOsmosisCodec();
  return osmosis.concentratedliquidity.v1beta1.MessageComposer.withTypeUrl.createPosition(
    {
      poolId,
      sender,
      lowerTick,
      upperTick,
      tokensProvided,
      tokenMinAmount0,
      tokenMinAmount1,
    }
  );
}

makeCreatePositionMsg.gas = 3_000_000 as const;

export async function makeCollectSpreadRewardsMsg({
  positionIds,
  sender,
}: MsgCollectSpreadRewards) {
  const osmosis = await getOsmosisCodec();
  return osmosis.concentratedliquidity.v1beta1.MessageComposer.withTypeUrl.collectSpreadRewards(
    {
      positionIds,
      sender,
    }
  );
}

export async function makeCollectIncentivesMsg({
  positionIds,
  sender,
}: MsgCollectIncentives) {
  const osmosis = await getOsmosisCodec();
  return osmosis.concentratedliquidity.v1beta1.MessageComposer.withTypeUrl.collectIncentives(
    {
      positionIds,
      sender,
    }
  );
}

export async function makeWithdrawPositionMsg({
  positionId,
  sender,
  liquidityAmount,
}: MsgWithdrawPosition) {
  const osmosis = await getOsmosisCodec();
  return osmosis.concentratedliquidity.v1beta1.MessageComposer.withTypeUrl.withdrawPosition(
    {
      positionId,
      sender,
      liquidityAmount,
    }
  );
}

export async function makeAddToPositionMsg({
  positionId,
  sender,
  amount0,
  amount1,
  tokenMinAmount0,
  tokenMinAmount1,
}: MsgAddToPosition) {
  const osmosis = await getOsmosisCodec();
  return osmosis.concentratedliquidity.v1beta1.MessageComposer.withTypeUrl.addToPosition(
    {
      positionId,
      sender,
      amount0,
      amount1,
      tokenMinAmount0,
      tokenMinAmount1,
    }
  );
}
