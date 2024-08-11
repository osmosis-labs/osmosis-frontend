import { osmosis } from "@osmosis-labs/proto-codecs";
import {
  MsgExitPool,
  MsgJoinPool,
  MsgJoinSwapExternAmountIn,
} from "@osmosis-labs/proto-codecs/build/codegen/osmosis/gamm/v1beta1/tx";

export function makeJoinPoolMsg({
  poolId,
  sender,
  shareOutAmount,
  tokenInMaxs,
}: MsgJoinPool) {
  return osmosis.gamm.v1beta1.MessageComposer.withTypeUrl.joinPool({
    poolId,
    sender,
    shareOutAmount,
    tokenInMaxs,
  });
}

export function makeJoinSwapExternAmountInMsg({
  poolId,
  sender,
  tokenIn,
  shareOutMinAmount,
}: MsgJoinSwapExternAmountIn) {
  return osmosis.gamm.v1beta1.MessageComposer.withTypeUrl.joinSwapExternAmountIn(
    {
      poolId,
      sender,
      tokenIn,
      shareOutMinAmount,
    }
  );
}

export function makeExitPoolMsg({
  poolId,
  sender,
  shareInAmount,
  tokenOutMins,
}: MsgExitPool) {
  return osmosis.gamm.v1beta1.MessageComposer.withTypeUrl.exitPool({
    poolId,
    sender,
    shareInAmount,
    tokenOutMins,
  });
}
