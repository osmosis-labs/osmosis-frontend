//@ts-nocheck
import * as _14 from "./accum/v1beta1/accum";
import * as _15 from "./concentratedliquidity/params";
import * as _93 from "./concentratedliquidity/poolmodel/concentrated/v1beta1/tx.amino";
import * as _103 from "./concentratedliquidity/poolmodel/concentrated/v1beta1/tx.registry";
import * as _94 from "./concentratedliquidity/v1beta1/tx.amino";
import * as _104 from "./concentratedliquidity/v1beta1/tx.registry";
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
import * as _95 from "./gamm/poolmodels/balancer/v1beta1/tx.amino";
import * as _105 from "./gamm/poolmodels/balancer/v1beta1/tx.registry";
import * as _28 from "./gamm/poolmodels/stableswap/v1beta1/stableswap_pool";
import * as _29 from "./gamm/poolmodels/stableswap/v1beta1/tx";
import * as _96 from "./gamm/poolmodels/stableswap/v1beta1/tx.amino";
import * as _106 from "./gamm/poolmodels/stableswap/v1beta1/tx.registry";
import * as _30 from "./gamm/v1beta1/balancerPool";
import * as _31 from "./gamm/v1beta1/genesis";
import * as _32 from "./gamm/v1beta1/gov";
import * as _33 from "./gamm/v1beta1/params";
import * as _34 from "./gamm/v1beta1/shared";
import * as _35 from "./gamm/v1beta1/tx";
import * as _97 from "./gamm/v1beta1/tx.amino";
import * as _107 from "./gamm/v1beta1/tx.registry";
import * as _36 from "./lockup/genesis";
import * as _37 from "./lockup/lock";
import * as _38 from "./lockup/params";
import * as _39 from "./lockup/tx";
import * as _98 from "./lockup/tx.amino";
import * as _108 from "./lockup/tx.registry";
import * as _40 from "./poolmanager/v1beta1/genesis";
import * as _41 from "./poolmanager/v1beta1/gov";
import * as _42 from "./poolmanager/v1beta1/module_route";
import * as _43 from "./poolmanager/v1beta1/swap_route";
import * as _44 from "./poolmanager/v1beta1/taker_fee_share";
import * as _45 from "./poolmanager/v1beta1/tracked_volume";
import * as _46 from "./poolmanager/v1beta1/tx";
import * as _99 from "./poolmanager/v1beta1/tx.amino";
import * as _109 from "./poolmanager/v1beta1/tx.registry";
import * as _47 from "./smartaccount/v1beta1/genesis";
import * as _48 from "./smartaccount/v1beta1/models";
import * as _49 from "./smartaccount/v1beta1/params";
import * as _50 from "./smartaccount/v1beta1/tx";
import * as _100 from "./smartaccount/v1beta1/tx.amino";
import * as _110 from "./smartaccount/v1beta1/tx.registry";
import * as _51 from "./superfluid/genesis";
import * as _52 from "./superfluid/params";
import * as _53 from "./superfluid/superfluid";
import * as _54 from "./superfluid/tx";
import * as _101 from "./superfluid/tx.amino";
import * as _111 from "./superfluid/tx.registry";
import * as _55 from "./valsetpref/v1beta1/state";
import * as _56 from "./valsetpref/v1beta1/tx";
import * as _102 from "./valsetpref/v1beta1/tx.amino";
import * as _112 from "./valsetpref/v1beta1/tx.registry";
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
          ..._93,
          ..._103,
        },
      },
    },
    v1beta1: {
      ..._94,
      ..._104,
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
          ..._95,
          ..._105,
        };
      }
      export namespace stableswap {
        export const v1beta1 = {
          ..._28,
          ..._29,
          ..._96,
          ..._106,
        };
      }
    }
    export const v1beta1 = {
      ..._30,
      ..._31,
      ..._32,
      ..._33,
      ..._34,
      ..._35,
      ..._97,
      ..._107,
    };
  }
  export const lockup = {
    ..._36,
    ..._37,
    ..._38,
    ..._39,
    ..._98,
    ..._108,
  };
  export namespace poolmanager {
    export const v1beta1 = {
      ..._40,
      ..._41,
      ..._42,
      ..._43,
      ..._44,
      ..._45,
      ..._46,
      ..._99,
      ..._109,
    };
  }
  export namespace smartaccount {
    export const v1beta1 = {
      ..._47,
      ..._48,
      ..._49,
      ..._50,
      ..._100,
      ..._110,
    };
  }
  export const superfluid = {
    ..._51,
    ..._52,
    ..._53,
    ..._54,
    ..._101,
    ..._111,
  };
  export namespace valsetpref {
    export const v1beta1 = {
      ..._55,
      ..._56,
      ..._102,
      ..._112,
    };
  }
}
