//@ts-nocheck
import * as _13 from "./accum/v1beta1/accum";
import * as _14 from "./concentrated-liquidity/params";
import * as _85 from "./concentrated-liquidity/pool-model/concentrated/tx.amino";
import * as _94 from "./concentrated-liquidity/pool-model/concentrated/tx.registry";
import * as _86 from "./concentrated-liquidity/tx.amino";
import * as _95 from "./concentrated-liquidity/tx.registry";
import * as _15 from "./cosmwasmpool/v1beta1/genesis";
import * as _16 from "./cosmwasmpool/v1beta1/gov";
import * as _17 from "./cosmwasmpool/v1beta1/model/instantiate_msg";
import * as _18 from "./cosmwasmpool/v1beta1/model/module_query_msg";
import * as _19 from "./cosmwasmpool/v1beta1/model/module_sudo_msg";
import * as _21 from "./cosmwasmpool/v1beta1/model/pool";
import * as _20 from "./cosmwasmpool/v1beta1/model/pool_query_msg";
import * as _22 from "./cosmwasmpool/v1beta1/model/transmuter_msgs";
import * as _23 from "./cosmwasmpool/v1beta1/model/tx";
import * as _24 from "./cosmwasmpool/v1beta1/params";
import * as _25 from "./cosmwasmpool/v1beta1/tx";
import * as _26 from "./gamm/pool-models/balancer/balancerPool";
import * as _31 from "./gamm/pool-models/balancer/tx/tx";
import * as _87 from "./gamm/pool-models/balancer/tx/tx.amino";
import * as _96 from "./gamm/pool-models/balancer/tx/tx.registry";
import * as _32 from "./gamm/pool-models/stableswap/stableswap_pool";
import * as _33 from "./gamm/pool-models/stableswap/tx";
import * as _88 from "./gamm/pool-models/stableswap/tx.amino";
import * as _97 from "./gamm/pool-models/stableswap/tx.registry";
import * as _27 from "./gamm/v1beta1/genesis";
import * as _28 from "./gamm/v1beta1/gov";
import * as _29 from "./gamm/v1beta1/shared";
import * as _30 from "./gamm/v1beta1/tx";
import * as _89 from "./gamm/v1beta1/tx.amino";
import * as _98 from "./gamm/v1beta1/tx.registry";
import * as _34 from "./lockup/genesis";
import * as _35 from "./lockup/lock";
import * as _36 from "./lockup/params";
import * as _37 from "./lockup/tx";
import * as _90 from "./lockup/tx.amino";
import * as _99 from "./lockup/tx.registry";
import * as _38 from "./poolmanager/v1beta1/genesis";
import * as _39 from "./poolmanager/v1beta1/module_route";
import * as _40 from "./poolmanager/v1beta1/swap_route";
import * as _41 from "./poolmanager/v1beta1/tracked_volume";
import * as _42 from "./poolmanager/v1beta1/tx";
import * as _91 from "./poolmanager/v1beta1/tx.amino";
import * as _100 from "./poolmanager/v1beta1/tx.registry";
import * as _43 from "./superfluid/genesis";
import * as _44 from "./superfluid/params";
import * as _45 from "./superfluid/superfluid";
import * as _46 from "./superfluid/tx";
import * as _92 from "./superfluid/tx.amino";
import * as _101 from "./superfluid/tx.registry";
import * as _47 from "./valset-pref/v1beta1/state";
import * as _48 from "./valset-pref/v1beta1/tx";
import * as _93 from "./valset-pref/v1beta1/tx.amino";
import * as _102 from "./valset-pref/v1beta1/tx.registry";
export namespace osmosis {
  export namespace accum {
    export const v1beta1 = {
      ..._13,
    };
  }
  export const concentratedliquidity = {
    ..._14,
    poolmodel: {
      concentrated: {
        v1beta1: {
          ..._85,
          ..._94,
        },
      },
    },
    v1beta1: {
      ..._86,
      ..._95,
    },
  };
  export namespace cosmwasmpool {
    export const v1beta1 = {
      ..._15,
      ..._16,
      ..._17,
      ..._18,
      ..._19,
      ..._20,
      ..._21,
      ..._22,
      ..._23,
      ..._24,
      ..._25,
    };
  }
  export namespace gamm {
    export const v1beta1 = {
      ..._26,
      ..._27,
      ..._28,
      ..._29,
      ..._30,
      ..._89,
      ..._98,
    };
    export namespace poolmodels {
      export namespace balancer {
        export const v1beta1 = {
          ..._31,
          ..._87,
          ..._96,
        };
      }
      export namespace stableswap {
        export const v1beta1 = {
          ..._32,
          ..._33,
          ..._88,
          ..._97,
        };
      }
    }
  }
  export const lockup = {
    ..._34,
    ..._35,
    ..._36,
    ..._37,
    ..._90,
    ..._99,
  };
  export namespace poolmanager {
    export const v1beta1 = {
      ..._38,
      ..._39,
      ..._40,
      ..._41,
      ..._42,
      ..._91,
      ..._100,
    };
  }
  export const superfluid = {
    ..._43,
    ..._44,
    ..._45,
    ..._46,
    ..._92,
    ..._101,
  };
  export namespace valsetpref {
    export const v1beta1 = {
      ..._47,
      ..._48,
      ..._93,
      ..._102,
    };
  }
}
