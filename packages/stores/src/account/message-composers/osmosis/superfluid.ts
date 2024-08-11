import { osmosis } from "@osmosis-labs/proto-codecs";
import {
  MsgAddToConcentratedLiquiditySuperfluidPosition,
  MsgCreateFullRangePositionAndSuperfluidDelegate,
  MsgLockAndSuperfluidDelegate,
  MsgSuperfluidDelegate,
  MsgSuperfluidUnbondLock,
  MsgSuperfluidUndelegate,
} from "@osmosis-labs/proto-codecs/build/codegen/osmosis/superfluid/tx";

export function makeSuperfluidDelegateMsg({
  sender,
  lockId,
  valAddr,
}: MsgSuperfluidDelegate) {
  return osmosis.superfluid.MessageComposer.withTypeUrl.superfluidDelegate({
    sender,
    lockId,
    valAddr,
  });
}

export function makeLockAndSuperfluidDelegateMsg({
  sender,
  coins,
  valAddr,
}: MsgLockAndSuperfluidDelegate) {
  return osmosis.superfluid.MessageComposer.withTypeUrl.lockAndSuperfluidDelegate(
    {
      sender,
      coins,
      valAddr,
    }
  );
}

export function makeSuperfluidUndelegateMsg({
  sender,
  lockId,
}: MsgSuperfluidUndelegate) {
  return osmosis.superfluid.MessageComposer.withTypeUrl.superfluidUndelegate({
    sender,
    lockId,
  });
}

export function makeSuperfluidUnbondLockMsg({
  sender,
  lockId,
}: MsgSuperfluidUnbondLock) {
  return osmosis.superfluid.MessageComposer.withTypeUrl.superfluidUnbondLock({
    sender,
    lockId,
  });
}

export function makeCreateFullRangePositionAndSuperfluidDelegateMsg({
  poolId,
  sender,
  valAddr,
  coins,
}: MsgCreateFullRangePositionAndSuperfluidDelegate) {
  return osmosis.superfluid.MessageComposer.withTypeUrl.createFullRangePositionAndSuperfluidDelegate(
    {
      poolId,
      sender,
      valAddr,
      coins,
    }
  );
}

export function makeAddToConcentratedLiquiditySuperfluidPositionMsg({
  positionId,
  sender,
  tokenDesired0,
  tokenDesired1,
}: MsgAddToConcentratedLiquiditySuperfluidPosition) {
  return osmosis.superfluid.MessageComposer.withTypeUrl.addToConcentratedLiquiditySuperfluidPosition(
    {
      positionId,
      sender,
      tokenDesired0,
      tokenDesired1,
    }
  );
}
