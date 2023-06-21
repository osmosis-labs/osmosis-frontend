//@ts-nocheck
import { GeneratedType, Registry } from "@cosmjs/proto-signing";

import { MsgCreateBalancerPool } from "./tx";
export const registry: ReadonlyArray<[string, GeneratedType]> = [
  [
    "/osmosis.gamm.poolmodels.balancer.v1beta1.MsgCreateBalancerPool",
    MsgCreateBalancerPool,
  ],
];
export const load = (protoRegistry: Registry) => {
  registry.forEach(([typeUrl, mod]) => {
    protoRegistry.register(typeUrl, mod);
  });
};
export const MessageComposer = {
  encoded: {
    createBalancerPool(value: MsgCreateBalancerPool) {
      return {
        typeUrl:
          "/osmosis.gamm.poolmodels.balancer.v1beta1.MsgCreateBalancerPool",
        value: MsgCreateBalancerPool.encode(value).finish(),
      };
    },
  },
  withTypeUrl: {
    createBalancerPool(value: MsgCreateBalancerPool) {
      return {
        typeUrl:
          "/osmosis.gamm.poolmodels.balancer.v1beta1.MsgCreateBalancerPool",
        value,
      };
    },
  },
  fromPartial: {
    createBalancerPool(value: MsgCreateBalancerPool) {
      return {
        typeUrl:
          "/osmosis.gamm.poolmodels.balancer.v1beta1.MsgCreateBalancerPool",
        value: MsgCreateBalancerPool.fromPartial(value),
      };
    },
  },
};
