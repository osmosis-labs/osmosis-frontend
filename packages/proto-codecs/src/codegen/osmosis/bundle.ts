//@ts-nocheck
import * as _16 from "./accum/v1beta1/accum";
import * as _17 from "./concentrated-liquidity/params";
import * as _93 from "./concentrated-liquidity/pool-model/concentrated/tx.amino";
import * as _101 from "./concentrated-liquidity/pool-model/concentrated/tx.registry";
import * as _94 from "./concentrated-liquidity/tx.amino";
import * as _102 from "./concentrated-liquidity/tx.registry";
import * as _18 from "./cosmwasmpool/v1beta1/genesis";
import * as _19 from "./cosmwasmpool/v1beta1/gov";
import * as _20 from "./cosmwasmpool/v1beta1/model/instantiate_msg";
import * as _21 from "./cosmwasmpool/v1beta1/model/module_query_msg";
import * as _22 from "./cosmwasmpool/v1beta1/model/module_sudo_msg";
import * as _24 from "./cosmwasmpool/v1beta1/model/pool";
import * as _23 from "./cosmwasmpool/v1beta1/model/pool_query_msg";
import * as _25 from "./cosmwasmpool/v1beta1/model/transmuter_msgs";
import * as _26 from "./cosmwasmpool/v1beta1/model/tx";
import * as _27 from "./cosmwasmpool/v1beta1/params";
import * as _28 from "./cosmwasmpool/v1beta1/query";
import * as _29 from "./cosmwasmpool/v1beta1/tx";
import * as _30 from "./gamm/pool-models/balancer/balancerPool";
import * as _35 from "./gamm/pool-models/balancer/tx/tx";
import * as _95 from "./gamm/pool-models/balancer/tx/tx.amino";
import * as _103 from "./gamm/pool-models/balancer/tx/tx.registry";
import * as _36 from "./gamm/pool-models/stableswap/stableswap_pool";
import * as _37 from "./gamm/pool-models/stableswap/tx";
import * as _96 from "./gamm/pool-models/stableswap/tx.amino";
import * as _104 from "./gamm/pool-models/stableswap/tx.registry";
import * as _31 from "./gamm/v1beta1/genesis";
import * as _32 from "./gamm/v1beta1/gov";
import * as _33 from "./gamm/v1beta1/query";
import * as _34 from "./gamm/v1beta1/tx";
import * as _97 from "./gamm/v1beta1/tx.amino";
import * as _105 from "./gamm/v1beta1/tx.registry";
import * as _38 from "./lockup/genesis";
import * as _39 from "./lockup/lock";
import * as _40 from "./lockup/params";
import * as _41 from "./lockup/query";
import * as _42 from "./lockup/tx";
import * as _98 from "./lockup/tx.amino";
import * as _106 from "./lockup/tx.registry";
import * as _43 from "./poolmanager/v1beta1/genesis";
import * as _44 from "./poolmanager/v1beta1/module_route";
import * as _45 from "./poolmanager/v1beta1/query";
import * as _46 from "./poolmanager/v1beta1/swap_route";
import * as _47 from "./poolmanager/v1beta1/tx";
import * as _99 from "./poolmanager/v1beta1/tx.amino";
import * as _107 from "./poolmanager/v1beta1/tx.registry";
import * as _48 from "./superfluid/genesis";
import * as _49 from "./superfluid/params";
import * as _50 from "./superfluid/query";
import * as _51 from "./superfluid/superfluid";
import * as _52 from "./superfluid/tx";
import * as _100 from "./superfluid/tx.amino";
import * as _108 from "./superfluid/tx.registry";
export namespace osmosis {
  export namespace accum {
    export const v1beta1 = {
      ..._16,
    };
  }
  export const concentratedliquidity = {
    ..._17,
    poolmodel: {
      concentrated: {
        v1beta1: {
          ..._93,
          ..._101,
        },
      },
    },
    v1beta1: {
      ..._94,
      ..._102,
    },
  };
  export namespace cosmwasmpool {
    export const v1beta1 = {
      ..._18,
      ..._19,
      ..._20,
      ..._21,
      ..._22,
      ..._23,
      ..._24,
      ..._25,
      ..._26,
      ..._27,
      ..._28,
      ..._29,
    };
  }
  export namespace gamm {
    export const v1beta1 = {
      ..._30,
      ..._31,
      ..._32,
      ..._33,
      ..._34,
      ..._97,
      ..._105,
    };
    export namespace poolmodels {
      export namespace balancer {
        export const v1beta1 = {
          ..._35,
          ..._95,
          ..._103,
        };
      }
      export namespace stableswap {
        export const v1beta1 = {
          ..._36,
          ..._37,
          ..._96,
          ..._104,
        };
      }
    }
  }
  export const lockup = {
    ..._38,
    ..._39,
    ..._40,
    ..._41,
    ..._42,
    ..._98,
    ..._106,
  };
  export namespace poolmanager {
    export const v1beta1 = {
      ..._43,
      ..._44,
      ..._45,
      ..._46,
      ..._47,
      ..._99,
      ..._107,
    };
  }
  export const superfluid = {
    ..._48,
    ..._49,
    ..._50,
    ..._51,
    ..._52,
    ..._100,
    ..._108,
  };
}
