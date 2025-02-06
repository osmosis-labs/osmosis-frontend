import type {
  MsgDelegateToValidatorSet,
  MsgSetValidatorSetPreference,
  MsgUndelegateFromRebalancedValidatorSet,
  MsgUndelegateFromValidatorSet,
  MsgWithdrawDelegationRewards,
} from "@osmosis-labs/proto-codecs/build/codegen/osmosis/valsetpref/v1beta1/tx";

import { getOsmosisCodec } from "../../codec";

export async function makeUndelegateFromValidatorSetMsg({
  delegator,
  coin,
}: MsgUndelegateFromValidatorSet) {
  const osmosis = await getOsmosisCodec();
  return osmosis.valsetpref.v1beta1.MessageComposer.withTypeUrl.undelegateFromValidatorSet(
    {
      delegator,
      coin,
    }
  );
}

export async function makeDelegateToValidatorSetMsg({
  delegator,
  coin,
}: MsgDelegateToValidatorSet) {
  const osmosis = await getOsmosisCodec();
  return osmosis.valsetpref.v1beta1.MessageComposer.withTypeUrl.delegateToValidatorSet(
    {
      delegator,
      coin,
    }
  );
}

makeDelegateToValidatorSetMsg.gas = 500_000 as const;

export async function makeWithdrawDelegationRewardsMsg({
  delegator,
}: MsgWithdrawDelegationRewards) {
  const osmosis = await getOsmosisCodec();
  return osmosis.valsetpref.v1beta1.MessageComposer.withTypeUrl.withdrawDelegationRewards(
    {
      delegator,
    }
  );
}

export async function makeSetValidatorSetPreferenceMsg({
  delegator,
  preferences,
}: MsgSetValidatorSetPreference) {
  const osmosis = await getOsmosisCodec();
  return osmosis.valsetpref.v1beta1.MessageComposer.withTypeUrl.setValidatorSetPreference(
    {
      delegator,
      preferences,
    }
  );
}

export async function makeUndelegateFromRebalancedValidatorSetMsg({
  delegator,
  coin,
}: MsgUndelegateFromRebalancedValidatorSet) {
  const osmosis = await getOsmosisCodec();
  return osmosis.valsetpref.v1beta1.MessageComposer.withTypeUrl.undelegateFromRebalancedValidatorSet(
    {
      delegator,
      coin,
    }
  );
}
