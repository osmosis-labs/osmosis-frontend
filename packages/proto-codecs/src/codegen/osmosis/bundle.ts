//@ts-nocheck
import * as _16 from "./accum/v1beta1/accum";
import * as _91 from "./concentrated-liquidity/pool-models/concentrated/tx.amino";
import * as _99 from "./concentrated-liquidity/pool-models/concentrated/tx.registry";
import * as _17 from "./concentrated-liquidity/v1beta1/params";
import * as _92 from "./concentrated-liquidity/v1beta1/tx.amino";
import * as _100 from "./concentrated-liquidity/v1beta1/tx.registry";
import * as _18 from "./cosmwasmpool/v1beta1/genesis";
import * as _19 from "./cosmwasmpool/v1beta1/model/instantiate_msg";
import * as _20 from "./cosmwasmpool/v1beta1/model/module_query_msg";
import * as _21 from "./cosmwasmpool/v1beta1/model/module_sudo_msg";
import * as _23 from "./cosmwasmpool/v1beta1/model/pool";
import * as _22 from "./cosmwasmpool/v1beta1/model/pool_query_msg";
import * as _24 from "./cosmwasmpool/v1beta1/model/transmuter_msgs";
import * as _25 from "./cosmwasmpool/v1beta1/model/tx";
import * as _26 from "./cosmwasmpool/v1beta1/query";
import * as _27 from "./cosmwasmpool/v1beta1/tx";
import * as _28 from "./gamm/pool-models/balancer/balancerPool";
import * as _33 from "./gamm/pool-models/balancer/tx/tx";
import * as _93 from "./gamm/pool-models/balancer/tx/tx.amino";
import * as _101 from "./gamm/pool-models/balancer/tx/tx.registry";
import * as _34 from "./gamm/pool-models/stableswap/stableswap_pool";
import * as _35 from "./gamm/pool-models/stableswap/tx";
import * as _94 from "./gamm/pool-models/stableswap/tx.amino";
import * as _102 from "./gamm/pool-models/stableswap/tx.registry";
import * as _29 from "./gamm/v1beta1/genesis";
import * as _30 from "./gamm/v1beta1/gov";
import * as _31 from "./gamm/v1beta1/query";
import * as _32 from "./gamm/v1beta1/tx";
import * as _95 from "./gamm/v1beta1/tx.amino";
import * as _103 from "./gamm/v1beta1/tx.registry";
import * as _36 from "./lockup/genesis";
import * as _37 from "./lockup/lock";
import * as _38 from "./lockup/params";
import * as _39 from "./lockup/query";
import * as _40 from "./lockup/tx";
import * as _96 from "./lockup/tx.amino";
import * as _104 from "./lockup/tx.registry";
import * as _41 from "./poolmanager/v1beta1/genesis";
import * as _42 from "./poolmanager/v1beta1/module_route";
import * as _43 from "./poolmanager/v1beta1/query";
import * as _44 from "./poolmanager/v1beta1/swap_route";
import * as _45 from "./poolmanager/v1beta1/tx";
import * as _97 from "./poolmanager/v1beta1/tx.amino";
import * as _105 from "./poolmanager/v1beta1/tx.registry";
import * as _46 from "./superfluid/genesis";
import * as _47 from "./superfluid/params";
import * as _48 from "./superfluid/query";
import * as _49 from "./superfluid/superfluid";
import * as _50 from "./superfluid/tx";
import * as _98 from "./superfluid/tx.amino";
import * as _106 from "./superfluid/tx.registry";
export namespace osmosis {
  export namespace accum {
    export const v1beta1 = {
      ..._16,
    };
  }
  export const concentratedliquidity = {
    ..._17,
    poolmodels: {
      concentrated: {
        v1beta1: {
          ..._91,
          ..._99,
        },
      },
    },
    v1beta1: {
      ..._92,
      ..._100,
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
    };
  }
  export namespace gamm {
    export const v1beta1 = {
      ..._28,
      ..._29,
      ..._30,
      ..._31,
      ..._32,
      ..._95,
      ..._103,
    };
    export namespace poolmodels {
      export namespace balancer {
        export const v1beta1 = {
          ..._33,
          ..._93,
          ..._101,
        };
      }
      export namespace stableswap {
        export const v1beta1 = {
          ..._34,
          ..._35,
          ..._94,
          ..._102,
        };
      }
    }
  }
  export const lockup = {
    ..._36,
    ..._37,
    ..._38,
    ..._39,
    ..._40,
    ..._96,
    ..._104,
  };
  export namespace poolmanager {
    export const v1beta1 = {
      ..._41,
      ..._42,
      ..._43,
      ..._44,
      ..._45,
      ..._97,
      ..._105,
    };
  }
  export const superfluid = {
    ..._46,
    ..._47,
    ..._48,
    ..._49,
    ..._50,
    ..._98,
    ..._106,
  };
}
