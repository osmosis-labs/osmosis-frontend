import type {
  MsgAddToConcentratedLiquiditySuperfluidPosition,
  MsgCreateFullRangePositionAndSuperfluidDelegate,
  MsgLockAndSuperfluidDelegate,
  MsgSuperfluidDelegate,
  MsgSuperfluidUnbondLock,
  MsgSuperfluidUndelegate,
} from "@osmosis-labs/proto-codecs/build/codegen/osmosis/superfluid/tx";

import { getOsmosisCodec } from "../../codec";

export async function makeSuperfluidDelegateMsg({
  sender,
  lockId,
  valAddr,
}: MsgSuperfluidDelegate) {
  const osmosis = await getOsmosisCodec();
  return osmosis.superfluid.MessageComposer.withTypeUrl.superfluidDelegate({
    sender,
    lockId,
    valAddr,
  });
}

export async function makeLockAndSuperfluidDelegateMsg({
  sender,
  coins,
  valAddr,
}: MsgLockAndSuperfluidDelegate) {
  const osmosis = await getOsmosisCodec();
  return osmosis.superfluid.MessageComposer.withTypeUrl.lockAndSuperfluidDelegate(
    {
      sender,
      coins,
      valAddr,
    }
  );
}

export async function makeSuperfluidUndelegateMsg({
  sender,
  lockId,
}: MsgSuperfluidUndelegate) {
  const osmosis = await getOsmosisCodec();
  return osmosis.superfluid.MessageComposer.withTypeUrl.superfluidUndelegate({
    sender,
    lockId,
  });
}

export async function makeSuperfluidUnbondLockMsg({
  sender,
  lockId,
}: MsgSuperfluidUnbondLock) {
  const osmosis = await getOsmosisCodec();
  return osmosis.superfluid.MessageComposer.withTypeUrl.superfluidUnbondLock({
    sender,
    lockId,
  });
}

export async function makeCreateFullRangePositionAndSuperfluidDelegateMsg({
  poolId,
  sender,
  valAddr,
  coins,
}: MsgCreateFullRangePositionAndSuperfluidDelegate) {
  const osmosis = await getOsmosisCodec();
  return osmosis.superfluid.MessageComposer.withTypeUrl.createFullRangePositionAndSuperfluidDelegate(
    {
      poolId,
      sender,
      valAddr,
      coins,
    }
  );
}

export async function makeAddToConcentratedLiquiditySuperfluidPositionMsg({
  positionId,
  sender,
  tokenDesired0,
  tokenDesired1,
}: MsgAddToConcentratedLiquiditySuperfluidPosition) {
  const osmosis = await getOsmosisCodec();
  return osmosis.superfluid.MessageComposer.withTypeUrl.addToConcentratedLiquiditySuperfluidPosition(
    {
      positionId,
      sender,
      tokenDesired0,
      tokenDesired1,
    }
  );
}
