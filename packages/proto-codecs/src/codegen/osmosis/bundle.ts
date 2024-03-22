//@ts-nocheck
import * as _14 from "./accum/v1beta1/accum";
import * as _15 from "./authenticator/genesis";
import * as _16 from "./authenticator/models";
import * as _17 from "./authenticator/params";
import * as _18 from "./authenticator/tx";
import * as _91 from "./authenticator/tx.amino";
import * as _101 from "./authenticator/tx.registry";
import * as _19 from "./concentratedliquidity/params";
import * as _92 from "./concentratedliquidity/poolmodel/concentrated/v1beta1/tx.amino";
import * as _102 from "./concentratedliquidity/poolmodel/concentrated/v1beta1/tx.registry";
import * as _93 from "./concentratedliquidity/v1beta1/tx.amino";
import * as _103 from "./concentratedliquidity/v1beta1/tx.registry";
import * as _20 from "./cosmwasmpool/v1beta1/genesis";
import * as _21 from "./cosmwasmpool/v1beta1/gov";
import * as _22 from "./cosmwasmpool/v1beta1/model/instantiate_msg";
import * as _23 from "./cosmwasmpool/v1beta1/model/module_query_msg";
import * as _24 from "./cosmwasmpool/v1beta1/model/module_sudo_msg";
import * as _26 from "./cosmwasmpool/v1beta1/model/pool";
import * as _25 from "./cosmwasmpool/v1beta1/model/pool_query_msg";
import * as _27 from "./cosmwasmpool/v1beta1/model/transmuter_msgs";
import * as _28 from "./cosmwasmpool/v1beta1/model/tx";
import * as _29 from "./cosmwasmpool/v1beta1/params";
import * as _30 from "./cosmwasmpool/v1beta1/tx";
import * as _31 from "./gamm/poolmodels/balancer/v1beta1/tx";
import * as _94 from "./gamm/poolmodels/balancer/v1beta1/tx.amino";
import * as _104 from "./gamm/poolmodels/balancer/v1beta1/tx.registry";
import * as _32 from "./gamm/poolmodels/stableswap/v1beta1/stableswap_pool";
import * as _33 from "./gamm/poolmodels/stableswap/v1beta1/tx";
import * as _95 from "./gamm/poolmodels/stableswap/v1beta1/tx.amino";
import * as _105 from "./gamm/poolmodels/stableswap/v1beta1/tx.registry";
import * as _34 from "./gamm/v1beta1/balancerPool";
import * as _35 from "./gamm/v1beta1/genesis";
import * as _36 from "./gamm/v1beta1/gov";
import * as _37 from "./gamm/v1beta1/shared";
import * as _38 from "./gamm/v1beta1/tx";
import * as _96 from "./gamm/v1beta1/tx.amino";
import * as _106 from "./gamm/v1beta1/tx.registry";
import * as _39 from "./lockup/genesis";
import * as _40 from "./lockup/lock";
import * as _41 from "./lockup/params";
import * as _42 from "./lockup/tx";
import * as _97 from "./lockup/tx.amino";
import * as _107 from "./lockup/tx.registry";
import * as _43 from "./poolmanager/v1beta1/genesis";
import * as _44 from "./poolmanager/v1beta1/gov";
import * as _45 from "./poolmanager/v1beta1/module_route";
import * as _46 from "./poolmanager/v1beta1/swap_route";
import * as _47 from "./poolmanager/v1beta1/tracked_volume";
import * as _48 from "./poolmanager/v1beta1/tx";
import * as _98 from "./poolmanager/v1beta1/tx.amino";
import * as _108 from "./poolmanager/v1beta1/tx.registry";
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
  export const authenticator = {
    ..._15,
    ..._16,
    ..._17,
    ..._18,
    ..._91,
    ..._101,
  };
  export const concentratedliquidity = {
    ..._19,
    poolmodel: {
      concentrated: {
        v1beta1: {
          ..._92,
          ..._102,
        },
      },
    },
    v1beta1: {
      ..._93,
      ..._103,
    },
  };
  export namespace cosmwasmpool {
    export const v1beta1 = {
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
      ..._30,
    };
  }
  export namespace gamm {
    export namespace poolmodels {
      export namespace balancer {
        export const v1beta1 = {
          ..._31,
          ..._94,
          ..._104,
        };
      }
      export namespace stableswap {
        export const v1beta1 = {
          ..._32,
          ..._33,
          ..._95,
          ..._105,
        };
      }
    }
    export const v1beta1 = {
      ..._34,
      ..._35,
      ..._36,
      ..._37,
      ..._38,
      ..._96,
      ..._106,
    };
  }
  export const lockup = {
    ..._39,
    ..._40,
    ..._41,
    ..._42,
    ..._97,
    ..._107,
  };
  export namespace poolmanager {
    export const v1beta1 = {
      ..._43,
      ..._44,
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
