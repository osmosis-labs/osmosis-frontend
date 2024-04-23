//@ts-nocheck
import * as _14 from "./accum/v1beta1/accum";
import * as _15 from "./concentratedliquidity/params";
import * as _91 from "./concentratedliquidity/poolmodel/concentrated/v1beta1/tx.amino";
import * as _101 from "./concentratedliquidity/poolmodel/concentrated/v1beta1/tx.registry";
import * as _92 from "./concentratedliquidity/v1beta1/tx.amino";
import * as _102 from "./concentratedliquidity/v1beta1/tx.registry";
import * as _16 from "./cosmwasmpool/v1beta1/genesis";
import * as _17 from "./cosmwasmpool/v1beta1/gov";
import * as _18 from "./cosmwasmpool/v1beta1/model/instantiate_msg";
import * as _19 from "./cosmwasmpool/v1beta1/model/module_query_msg";
import * as _20 from "./cosmwasmpool/v1beta1/model/module_sudo_msg";
import * as _22 from "./cosmwasmpool/v1beta1/model/pool";
import * as _21 from "./cosmwasmpool/v1beta1/model/pool_query_msg";
import * as _23 from "./cosmwasmpool/v1beta1/model/transmuter_msgs";
import * as _24 from "./cosmwasmpool/v1beta1/model/tx";
import * as _25 from "./cosmwasmpool/v1beta1/params";
import * as _26 from "./cosmwasmpool/v1beta1/tx";
import * as _27 from "./gamm/poolmodels/balancer/v1beta1/tx";
import * as _93 from "./gamm/poolmodels/balancer/v1beta1/tx.amino";
import * as _103 from "./gamm/poolmodels/balancer/v1beta1/tx.registry";
import * as _28 from "./gamm/poolmodels/stableswap/v1beta1/stableswap_pool";
import * as _29 from "./gamm/poolmodels/stableswap/v1beta1/tx";
import * as _94 from "./gamm/poolmodels/stableswap/v1beta1/tx.amino";
import * as _104 from "./gamm/poolmodels/stableswap/v1beta1/tx.registry";
import * as _30 from "./gamm/v1beta1/balancerPool";
import * as _31 from "./gamm/v1beta1/genesis";
import * as _32 from "./gamm/v1beta1/gov";
import * as _33 from "./gamm/v1beta1/shared";
import * as _34 from "./gamm/v1beta1/tx";
import * as _95 from "./gamm/v1beta1/tx.amino";
import * as _105 from "./gamm/v1beta1/tx.registry";
import * as _35 from "./lockup/genesis";
import * as _36 from "./lockup/lock";
import * as _37 from "./lockup/params";
import * as _38 from "./lockup/tx";
import * as _96 from "./lockup/tx.amino";
import * as _106 from "./lockup/tx.registry";
import * as _39 from "./poolmanager/v1beta1/genesis";
import * as _40 from "./poolmanager/v1beta1/gov";
import * as _41 from "./poolmanager/v1beta1/module_route";
import * as _42 from "./poolmanager/v1beta1/swap_route";
import * as _43 from "./poolmanager/v1beta1/tracked_volume";
import * as _44 from "./poolmanager/v1beta1/tx";
import * as _97 from "./poolmanager/v1beta1/tx.amino";
import * as _107 from "./poolmanager/v1beta1/tx.registry";
import * as _45 from "./smartaccount/v1beta1/genesis";
import * as _46 from "./smartaccount/v1beta1/models";
import * as _47 from "./smartaccount/v1beta1/params";
import * as _48 from "./smartaccount/v1beta1/tx";
import * as _98 from "./smartaccount/v1beta1/tx.amino";
import * as _108 from "./smartaccount/v1beta1/tx.registry";
import * as _49 from "./superfluid/genesis";
import * as _50 from "./superfluid/params";
import * as _51 from "./superfluid/superfluid";
import * as _52 from "./superfluid/tx";
import * as _99 from "./superfluid/tx.amino";
import * as _109 from "./superfluid/tx.registry";
import * as _53 from "./valsetpref/v1beta1/state";
import * as _54 from "./valsetpref/v1beta1/tx";
import * as _100 from "./valsetpref/v1beta1/tx.amino";
import * as _110 from "./valsetpref/v1beta1/tx.registry";
export namespace osmosis {
  export namespace accum {
    export const v1beta1 = {
      ..._14,
    };
  }
  export const concentratedliquidity = {
    ..._15,
    poolmodel: {
      concentrated: {
        v1beta1: {
          ..._91,
          ..._101,
        },
      },
    },
    v1beta1: {
      ..._92,
      ..._102,
    },
  };
  export namespace cosmwasmpool {
    export const v1beta1 = {
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
      ..._26,
    };
  }
  export namespace gamm {
    export namespace poolmodels {
      export namespace balancer {
        export const v1beta1 = {
          ..._27,
          ..._93,
          ..._103,
        };
      }
      export namespace stableswap {
        export const v1beta1 = {
          ..._28,
          ..._29,
          ..._94,
          ..._104,
        };
      }
    }
    export const v1beta1 = {
      ..._30,
      ..._31,
      ..._32,
      ..._33,
      ..._34,
      ..._95,
      ..._105,
    };
  }
  export const lockup = {
    ..._35,
    ..._36,
    ..._37,
    ..._38,
    ..._96,
    ..._106,
  };
  export namespace poolmanager {
    export const v1beta1 = {
      ..._39,
      ..._40,
      ..._41,
      ..._42,
      ..._43,
      ..._44,
      ..._97,
      ..._107,
    };
  }
  export namespace smartaccount {
    export const v1beta1 = {
      ..._45,
      ..._46,
      ..._47,
      ..._48,
      ..._98,
      ..._108,
    };
  }
  export const superfluid = {
    ..._49,
    ..._50,
    ..._51,
    ..._52,
    ..._99,
    ..._109,
  };
  export namespace valsetpref {
    export const v1beta1 = {
      ..._53,
      ..._54,
      ..._100,
      ..._110,
    };
  }
}
