import {
  MsgBeginUnlocking,
  MsgLockTokens,
} from "@osmosis-labs/proto-codecs/build/codegen/osmosis/lockup/tx";

import { getOsmosisCodec } from "../../codec";

export async function makeLockTokensMsg({
  owner,
  coins,
  duration,
}: MsgLockTokens) {
  const osmosis = await getOsmosisCodec();
  return osmosis.lockup.MessageComposer.withTypeUrl.lockTokens({
    owner,
    coins,
    duration,
  });
}

export async function makeBeginUnlockingMsg({
  owner,
  ID,
  coins,
}: MsgBeginUnlocking) {
  const osmosis = await getOsmosisCodec();
  return osmosis.lockup.MessageComposer.withTypeUrl.beginUnlocking({
    owner,
    ID,
    coins,
  });
}
