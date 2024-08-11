import { osmosis } from "@osmosis-labs/proto-codecs";
import { MsgCreateConcentratedPool } from "@osmosis-labs/proto-codecs/build/codegen/osmosis/concentratedliquidity/poolmodel/concentrated/v1beta1/tx";
import {
  MsgAddToPosition,
  MsgCollectIncentives,
  MsgCollectSpreadRewards,
  MsgCreatePosition,
  MsgWithdrawPosition,
} from "@osmosis-labs/proto-codecs/build/codegen/osmosis/concentratedliquidity/v1beta1/tx";

export function makeCreateConcentratedPoolMsg({
  denom0,
  denom1,
  sender,
  spreadFactor,
  tickSpacing,
}: MsgCreateConcentratedPool) {
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

export function makeCreatePositionMsg({
  poolId,
  sender,
  lowerTick,
  upperTick,
  tokensProvided,
  tokenMinAmount0,
  tokenMinAmount1,
}: MsgCreatePosition) {
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

export function makeCollectSpreadRewardsMsg({
  positionIds,
  sender,
}: MsgCollectSpreadRewards) {
  return osmosis.concentratedliquidity.v1beta1.MessageComposer.withTypeUrl.collectSpreadRewards(
    {
      positionIds,
      sender,
    }
  );
}

export function makeCollectIncentivesMsg({
  positionIds,
  sender,
}: MsgCollectIncentives) {
  return osmosis.concentratedliquidity.v1beta1.MessageComposer.withTypeUrl.collectIncentives(
    {
      positionIds,
      sender,
    }
  );
}

export function makeWithdrawPositionMsg({
  positionId,
  sender,
  liquidityAmount,
}: MsgWithdrawPosition) {
  return osmosis.concentratedliquidity.v1beta1.MessageComposer.withTypeUrl.withdrawPosition(
    {
      positionId,
      sender,
      liquidityAmount,
    }
  );
}

export function makeAddToPositionMsg({
  positionId,
  sender,
  amount0,
  amount1,
  tokenMinAmount0,
  tokenMinAmount1,
}: MsgAddToPosition) {
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
