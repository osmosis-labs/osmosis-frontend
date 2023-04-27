//@ts-nocheck
/* eslint-disable */
import { GeneratedType, Registry } from "@cosmjs/proto-signing";
import {
  MsgCreateBalancerPool,
  MsgMigrateSharesToFullRangeConcentratedPosition,
} from "./tx";
export const registry: ReadonlyArray<[string, GeneratedType]> = [
  [
    "/osmosis.gamm.poolmodels.balancer.v1beta1.MsgCreateBalancerPool",
    MsgCreateBalancerPool,
  ],
  [
    "/osmosis.gamm.poolmodels.balancer.v1beta1.MsgMigrateSharesToFullRangeConcentratedPosition",
    MsgMigrateSharesToFullRangeConcentratedPosition,
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
    migrateSharesToFullRangeConcentratedPosition(
      value: MsgMigrateSharesToFullRangeConcentratedPosition
    ) {
      return {
        typeUrl:
          "/osmosis.gamm.poolmodels.balancer.v1beta1.MsgMigrateSharesToFullRangeConcentratedPosition",
        value:
          MsgMigrateSharesToFullRangeConcentratedPosition.encode(
            value
          ).finish(),
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
    migrateSharesToFullRangeConcentratedPosition(
      value: MsgMigrateSharesToFullRangeConcentratedPosition
    ) {
      return {
        typeUrl:
          "/osmosis.gamm.poolmodels.balancer.v1beta1.MsgMigrateSharesToFullRangeConcentratedPosition",
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
    migrateSharesToFullRangeConcentratedPosition(
      value: MsgMigrateSharesToFullRangeConcentratedPosition
    ) {
      return {
        typeUrl:
          "/osmosis.gamm.poolmodels.balancer.v1beta1.MsgMigrateSharesToFullRangeConcentratedPosition",
        value:
          MsgMigrateSharesToFullRangeConcentratedPosition.fromPartial(value),
      };
    },
  },
};
