import {
  MsgExitPool,
  MsgJoinPool,
  MsgJoinSwapExternAmountIn,
} from "@osmosis-labs/proto-codecs/build/codegen/osmosis/gamm/v1beta1/tx";

import { getOsmosisCodec } from "../../codec";

export async function makeJoinPoolMsg({
  poolId,
  sender,
  shareOutAmount,
  tokenInMaxs,
}: MsgJoinPool) {
  const osmosis = await getOsmosisCodec();
  return osmosis.gamm.v1beta1.MessageComposer.withTypeUrl.joinPool({
    poolId,
    sender,
    shareOutAmount,
    tokenInMaxs,
  });
}

makeJoinPoolMsg.shareCoinDecimals = 18;

export async function makeJoinSwapExternAmountInMsg({
  poolId,
  sender,
  tokenIn,
  shareOutMinAmount,
}: MsgJoinSwapExternAmountIn) {
  const osmosis = await getOsmosisCodec();
  return osmosis.gamm.v1beta1.MessageComposer.withTypeUrl.joinSwapExternAmountIn(
    {
      poolId,
      sender,
      tokenIn,
      shareOutMinAmount,
    }
  );
}

makeJoinSwapExternAmountInMsg.shareCoinDecimals = 18;

export async function makeExitPoolMsg({
  poolId,
  sender,
  shareInAmount,
  tokenOutMins,
}: MsgExitPool) {
  const osmosis = await getOsmosisCodec();
  return osmosis.gamm.v1beta1.MessageComposer.withTypeUrl.exitPool({
    poolId,
    sender,
    shareInAmount,
    tokenOutMins,
  });
}

makeExitPoolMsg.shareCoinDecimals = 18 as const;
