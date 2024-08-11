import { osmosis } from "@osmosis-labs/proto-codecs";
import {
  MsgBeginUnlocking,
  MsgLockTokens,
} from "@osmosis-labs/proto-codecs/build/codegen/osmosis/lockup/tx";

export function makeLockTokensMsg({ owner, coins, duration }: MsgLockTokens) {
  return osmosis.lockup.MessageComposer.withTypeUrl.lockTokens({
    owner,
    coins,
    duration,
  });
}

export function makeBeginUnlockingMsg({ owner, ID, coins }: MsgBeginUnlocking) {
  return osmosis.lockup.MessageComposer.withTypeUrl.beginUnlocking({
    owner,
    ID,
    coins,
  });
}
