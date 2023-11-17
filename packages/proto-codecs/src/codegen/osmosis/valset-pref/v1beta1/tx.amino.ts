//@ts-nocheck
import {
  MsgDelegateBondedTokens,
  MsgDelegateToValidatorSet,
  MsgRedelegateValidatorSet,
  MsgSetValidatorSetPreference,
  MsgUndelegateFromValidatorSet,
  MsgWithdrawDelegationRewards,
} from "./tx";
export const AminoConverter = {
  "/osmosis.valsetpref.v1beta1.MsgSetValidatorSetPreference": {
    aminoType: "osmosis/MsgSetValidatorSetPreference",
    toAmino: MsgSetValidatorSetPreference.toAmino,
    fromAmino: MsgSetValidatorSetPreference.fromAmino,
  },
  "/osmosis.valsetpref.v1beta1.MsgDelegateToValidatorSet": {
    aminoType: "osmosis/MsgDelegateToValidatorSet",
    toAmino: MsgDelegateToValidatorSet.toAmino,
    fromAmino: MsgDelegateToValidatorSet.fromAmino,
  },
  "/osmosis.valsetpref.v1beta1.MsgUndelegateFromValidatorSet": {
    aminoType: "osmosis/MsgUndelegateFromValidatorSet",
    toAmino: MsgUndelegateFromValidatorSet.toAmino,
    fromAmino: MsgUndelegateFromValidatorSet.fromAmino,
  },
  "/osmosis.valsetpref.v1beta1.MsgRedelegateValidatorSet": {
    aminoType: "osmosis/MsgRedelegateValidatorSet",
    toAmino: MsgRedelegateValidatorSet.toAmino,
    fromAmino: MsgRedelegateValidatorSet.fromAmino,
  },
  "/osmosis.valsetpref.v1beta1.MsgWithdrawDelegationRewards": {
    aminoType: "osmosis/MsgWithdrawDelegationRewards",
    toAmino: MsgWithdrawDelegationRewards.toAmino,
    fromAmino: MsgWithdrawDelegationRewards.fromAmino,
  },
  "/osmosis.valsetpref.v1beta1.MsgDelegateBondedTokens": {
    aminoType: "osmosis/valsetpref/delegate-bonded-tokens",
    toAmino: MsgDelegateBondedTokens.toAmino,
    fromAmino: MsgDelegateBondedTokens.fromAmino,
  },
};
