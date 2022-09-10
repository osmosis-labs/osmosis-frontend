import { PoolParams } from "./stableswap_pool";
import { Coin } from "../../../../cosmos/base/v1beta1/coin";
import { GeneratedType, Registry } from "@cosmjs/proto-signing";
import { MsgCreateStableswapPool, MsgStableSwapAdjustScalingFactors } from "./tx";
export const registry: ReadonlyArray<[string, GeneratedType]> = [["/osmosis.gamm.poolmodels.stableswap.v1beta1.MsgCreateStableswapPool", MsgCreateStableswapPool], ["/osmosis.gamm.poolmodels.stableswap.v1beta1.MsgStableSwapAdjustScalingFactors", MsgStableSwapAdjustScalingFactors]];
export const load = (protoRegistry: Registry) => {
  registry.forEach(([typeUrl, mod]) => {
    protoRegistry.register(typeUrl, mod);
  });
};
export const MessageComposer = {
  encoded: {
    createStableswapPool(value: MsgCreateStableswapPool) {
      return {
        typeUrl: "/osmosis.gamm.poolmodels.stableswap.v1beta1.MsgCreateStableswapPool",
        value: MsgCreateStableswapPool.encode(value).finish()
      };
    },

    stableSwapAdjustScalingFactors(value: MsgStableSwapAdjustScalingFactors) {
      return {
        typeUrl: "/osmosis.gamm.poolmodels.stableswap.v1beta1.MsgStableSwapAdjustScalingFactors",
        value: MsgStableSwapAdjustScalingFactors.encode(value).finish()
      };
    }

  },
  withTypeUrl: {
    createStableswapPool(value: MsgCreateStableswapPool) {
      return {
        typeUrl: "/osmosis.gamm.poolmodels.stableswap.v1beta1.MsgCreateStableswapPool",
        value
      };
    },

    stableSwapAdjustScalingFactors(value: MsgStableSwapAdjustScalingFactors) {
      return {
        typeUrl: "/osmosis.gamm.poolmodels.stableswap.v1beta1.MsgStableSwapAdjustScalingFactors",
        value
      };
    }

  },
  toJSON: {
    createStableswapPool(value: MsgCreateStableswapPool) {
      return {
        typeUrl: "/osmosis.gamm.poolmodels.stableswap.v1beta1.MsgCreateStableswapPool",
        value: MsgCreateStableswapPool.toJSON(value)
      };
    },

    stableSwapAdjustScalingFactors(value: MsgStableSwapAdjustScalingFactors) {
      return {
        typeUrl: "/osmosis.gamm.poolmodels.stableswap.v1beta1.MsgStableSwapAdjustScalingFactors",
        value: MsgStableSwapAdjustScalingFactors.toJSON(value)
      };
    }

  },
  fromJSON: {
    createStableswapPool(value: any) {
      return {
        typeUrl: "/osmosis.gamm.poolmodels.stableswap.v1beta1.MsgCreateStableswapPool",
        value: MsgCreateStableswapPool.fromJSON(value)
      };
    },

    stableSwapAdjustScalingFactors(value: any) {
      return {
        typeUrl: "/osmosis.gamm.poolmodels.stableswap.v1beta1.MsgStableSwapAdjustScalingFactors",
        value: MsgStableSwapAdjustScalingFactors.fromJSON(value)
      };
    }

  },
  fromPartial: {
    createStableswapPool(value: MsgCreateStableswapPool) {
      return {
        typeUrl: "/osmosis.gamm.poolmodels.stableswap.v1beta1.MsgCreateStableswapPool",
        value: MsgCreateStableswapPool.fromPartial(value)
      };
    },

    stableSwapAdjustScalingFactors(value: MsgStableSwapAdjustScalingFactors) {
      return {
        typeUrl: "/osmosis.gamm.poolmodels.stableswap.v1beta1.MsgStableSwapAdjustScalingFactors",
        value: MsgStableSwapAdjustScalingFactors.fromPartial(value)
      };
    }

  }
};