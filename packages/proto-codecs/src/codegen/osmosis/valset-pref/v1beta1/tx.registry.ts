//@ts-nocheck
import { GeneratedType, Registry } from "@cosmjs/proto-signing";

import {
  MsgDelegateBondedTokens,
  MsgDelegateToValidatorSet,
  MsgRedelegateValidatorSet,
  MsgSetValidatorSetPreference,
  MsgUndelegateFromValidatorSet,
  MsgWithdrawDelegationRewards,
} from "./tx";
export const registry: ReadonlyArray<[string, GeneratedType]> = [
  [
    "/osmosis.valsetpref.v1beta1.MsgSetValidatorSetPreference",
    MsgSetValidatorSetPreference,
  ],
  [
    "/osmosis.valsetpref.v1beta1.MsgDelegateToValidatorSet",
    MsgDelegateToValidatorSet,
  ],
  [
    "/osmosis.valsetpref.v1beta1.MsgUndelegateFromValidatorSet",
    MsgUndelegateFromValidatorSet,
  ],
  [
    "/osmosis.valsetpref.v1beta1.MsgRedelegateValidatorSet",
    MsgRedelegateValidatorSet,
  ],
  [
    "/osmosis.valsetpref.v1beta1.MsgWithdrawDelegationRewards",
    MsgWithdrawDelegationRewards,
  ],
  [
    "/osmosis.valsetpref.v1beta1.MsgDelegateBondedTokens",
    MsgDelegateBondedTokens,
  ],
];
export const load = (protoRegistry: Registry) => {
  registry.forEach(([typeUrl, mod]) => {
    protoRegistry.register(typeUrl, mod);
  });
};
export const MessageComposer = {
  encoded: {
    setValidatorSetPreference(value: MsgSetValidatorSetPreference) {
      return {
        typeUrl: "/osmosis.valsetpref.v1beta1.MsgSetValidatorSetPreference",
        value: MsgSetValidatorSetPreference.encode(value).finish(),
      };
    },
    delegateToValidatorSet(value: MsgDelegateToValidatorSet) {
      return {
        typeUrl: "/osmosis.valsetpref.v1beta1.MsgDelegateToValidatorSet",
        value: MsgDelegateToValidatorSet.encode(value).finish(),
      };
    },
    undelegateFromValidatorSet(value: MsgUndelegateFromValidatorSet) {
      return {
        typeUrl: "/osmosis.valsetpref.v1beta1.MsgUndelegateFromValidatorSet",
        value: MsgUndelegateFromValidatorSet.encode(value).finish(),
      };
    },
    redelegateValidatorSet(value: MsgRedelegateValidatorSet) {
      return {
        typeUrl: "/osmosis.valsetpref.v1beta1.MsgRedelegateValidatorSet",
        value: MsgRedelegateValidatorSet.encode(value).finish(),
      };
    },
    withdrawDelegationRewards(value: MsgWithdrawDelegationRewards) {
      return {
        typeUrl: "/osmosis.valsetpref.v1beta1.MsgWithdrawDelegationRewards",
        value: MsgWithdrawDelegationRewards.encode(value).finish(),
      };
    },
    delegateBondedTokens(value: MsgDelegateBondedTokens) {
      return {
        typeUrl: "/osmosis.valsetpref.v1beta1.MsgDelegateBondedTokens",
        value: MsgDelegateBondedTokens.encode(value).finish(),
      };
    },
  },
  withTypeUrl: {
    setValidatorSetPreference(value: MsgSetValidatorSetPreference) {
      return {
        typeUrl: "/osmosis.valsetpref.v1beta1.MsgSetValidatorSetPreference",
        value,
      };
    },
    delegateToValidatorSet(value: MsgDelegateToValidatorSet) {
      return {
        typeUrl: "/osmosis.valsetpref.v1beta1.MsgDelegateToValidatorSet",
        value,
      };
    },
    undelegateFromValidatorSet(value: MsgUndelegateFromValidatorSet) {
      return {
        typeUrl: "/osmosis.valsetpref.v1beta1.MsgUndelegateFromValidatorSet",
        value,
      };
    },
    redelegateValidatorSet(value: MsgRedelegateValidatorSet) {
      return {
        typeUrl: "/osmosis.valsetpref.v1beta1.MsgRedelegateValidatorSet",
        value,
      };
    },
    withdrawDelegationRewards(value: MsgWithdrawDelegationRewards) {
      return {
        typeUrl: "/osmosis.valsetpref.v1beta1.MsgWithdrawDelegationRewards",
        value,
      };
    },
    delegateBondedTokens(value: MsgDelegateBondedTokens) {
      return {
        typeUrl: "/osmosis.valsetpref.v1beta1.MsgDelegateBondedTokens",
        value,
      };
    },
  },
  fromPartial: {
    setValidatorSetPreference(value: MsgSetValidatorSetPreference) {
      return {
        typeUrl: "/osmosis.valsetpref.v1beta1.MsgSetValidatorSetPreference",
        value: MsgSetValidatorSetPreference.fromPartial(value),
      };
    },
    delegateToValidatorSet(value: MsgDelegateToValidatorSet) {
      return {
        typeUrl: "/osmosis.valsetpref.v1beta1.MsgDelegateToValidatorSet",
        value: MsgDelegateToValidatorSet.fromPartial(value),
      };
    },
    undelegateFromValidatorSet(value: MsgUndelegateFromValidatorSet) {
      return {
        typeUrl: "/osmosis.valsetpref.v1beta1.MsgUndelegateFromValidatorSet",
        value: MsgUndelegateFromValidatorSet.fromPartial(value),
      };
    },
    redelegateValidatorSet(value: MsgRedelegateValidatorSet) {
      return {
        typeUrl: "/osmosis.valsetpref.v1beta1.MsgRedelegateValidatorSet",
        value: MsgRedelegateValidatorSet.fromPartial(value),
      };
    },
    withdrawDelegationRewards(value: MsgWithdrawDelegationRewards) {
      return {
        typeUrl: "/osmosis.valsetpref.v1beta1.MsgWithdrawDelegationRewards",
        value: MsgWithdrawDelegationRewards.fromPartial(value),
      };
    },
    delegateBondedTokens(value: MsgDelegateBondedTokens) {
      return {
        typeUrl: "/osmosis.valsetpref.v1beta1.MsgDelegateBondedTokens",
        value: MsgDelegateBondedTokens.fromPartial(value),
      };
    },
  },
};
