import { osmosis } from "@osmosis-labs/proto-codecs";
import {
  MsgDelegateToValidatorSet,
  MsgSetValidatorSetPreference,
  MsgUndelegateFromRebalancedValidatorSet,
  MsgUndelegateFromValidatorSet,
  MsgWithdrawDelegationRewards,
} from "@osmosis-labs/proto-codecs/build/codegen/osmosis/valsetpref/v1beta1/tx";

export function makeUndelegateFromValidatorSetMsg({
  delegator,
  coin,
}: MsgUndelegateFromValidatorSet) {
  return osmosis.valsetpref.v1beta1.MessageComposer.withTypeUrl.undelegateFromValidatorSet(
    {
      delegator,
      coin,
    }
  );
}

export function makeDelegateToValidatorSetMsg({
  delegator,
  coin,
}: MsgDelegateToValidatorSet) {
  return osmosis.valsetpref.v1beta1.MessageComposer.withTypeUrl.delegateToValidatorSet(
    {
      delegator,
      coin,
    }
  );
}

export function makeWithdrawDelegationRewardsMsg({
  delegator,
}: MsgWithdrawDelegationRewards) {
  return osmosis.valsetpref.v1beta1.MessageComposer.withTypeUrl.withdrawDelegationRewards(
    {
      delegator,
    }
  );
}

export function makeSetValidatorSetPreferenceMsg({
  delegator,
  preferences,
}: MsgSetValidatorSetPreference) {
  return osmosis.valsetpref.v1beta1.MessageComposer.withTypeUrl.setValidatorSetPreference(
    {
      delegator,
      preferences,
    }
  );
}

export function makeUndelegateFromRebalancedValidatorSetMsg({
  delegator,
  coin,
}: MsgUndelegateFromRebalancedValidatorSet) {
  return osmosis.valsetpref.v1beta1.MessageComposer.withTypeUrl.undelegateFromRebalancedValidatorSet(
    {
      delegator,
      coin,
    }
  );
}
