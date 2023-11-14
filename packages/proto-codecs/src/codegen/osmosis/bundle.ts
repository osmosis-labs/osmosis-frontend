//@ts-nocheck
import * as _16 from "./accum/v1beta1/accum";
import * as _17 from "./authenticator/genesis";
import * as _18 from "./authenticator/models";
import * as _19 from "./authenticator/params";
import * as _20 from "./authenticator/query";
import * as _21 from "./authenticator/tx";
import * as _100 from "./authenticator/tx.amino";
import * as _110 from "./authenticator/tx.registry";
import * as _22 from "./concentrated-liquidity/params";
import * as _101 from "./concentrated-liquidity/pool-model/concentrated/tx.amino";
import * as _111 from "./concentrated-liquidity/pool-model/concentrated/tx.registry";
import * as _102 from "./concentrated-liquidity/tx.amino";
import * as _112 from "./concentrated-liquidity/tx.registry";
import * as _23 from "./cosmwasmpool/v1beta1/genesis";
import * as _24 from "./cosmwasmpool/v1beta1/gov";
import * as _25 from "./cosmwasmpool/v1beta1/model/instantiate_msg";
import * as _26 from "./cosmwasmpool/v1beta1/model/module_query_msg";
import * as _27 from "./cosmwasmpool/v1beta1/model/module_sudo_msg";
import * as _29 from "./cosmwasmpool/v1beta1/model/pool";
import * as _28 from "./cosmwasmpool/v1beta1/model/pool_query_msg";
import * as _30 from "./cosmwasmpool/v1beta1/model/transmuter_msgs";
import * as _31 from "./cosmwasmpool/v1beta1/model/tx";
import * as _32 from "./cosmwasmpool/v1beta1/params";
import * as _33 from "./cosmwasmpool/v1beta1/query";
import * as _34 from "./cosmwasmpool/v1beta1/tx";
import * as _35 from "./gamm/pool-models/balancer/balancerPool";
import * as _41 from "./gamm/pool-models/balancer/tx/tx";
import * as _103 from "./gamm/pool-models/balancer/tx/tx.amino";
import * as _113 from "./gamm/pool-models/balancer/tx/tx.registry";
import * as _42 from "./gamm/pool-models/stableswap/stableswap_pool";
import * as _43 from "./gamm/pool-models/stableswap/tx";
import * as _104 from "./gamm/pool-models/stableswap/tx.amino";
import * as _114 from "./gamm/pool-models/stableswap/tx.registry";
import * as _36 from "./gamm/v1beta1/genesis";
import * as _37 from "./gamm/v1beta1/gov";
import * as _38 from "./gamm/v1beta1/query";
import * as _39 from "./gamm/v1beta1/shared";
import * as _40 from "./gamm/v1beta1/tx";
import * as _105 from "./gamm/v1beta1/tx.amino";
import * as _115 from "./gamm/v1beta1/tx.registry";
import * as _44 from "./lockup/genesis";
import * as _45 from "./lockup/lock";
import * as _46 from "./lockup/params";
import * as _47 from "./lockup/query";
import * as _48 from "./lockup/tx";
import * as _106 from "./lockup/tx.amino";
import * as _116 from "./lockup/tx.registry";
import * as _49 from "./poolmanager/v1beta1/genesis";
import * as _50 from "./poolmanager/v1beta1/gov";
import * as _51 from "./poolmanager/v1beta1/module_route";
import * as _52 from "./poolmanager/v1beta1/query";
import * as _53 from "./poolmanager/v1beta1/swap_route";
import * as _54 from "./poolmanager/v1beta1/tracked_volume";
import * as _55 from "./poolmanager/v1beta1/tx";
import * as _107 from "./poolmanager/v1beta1/tx.amino";
import * as _117 from "./poolmanager/v1beta1/tx.registry";
import * as _56 from "./superfluid/genesis";
import * as _57 from "./superfluid/params";
import * as _58 from "./superfluid/query";
import * as _59 from "./superfluid/superfluid";
import * as _60 from "./superfluid/tx";
import * as _108 from "./superfluid/tx.amino";
import * as _118 from "./superfluid/tx.registry";
import * as _61 from "./valset-pref/v1beta1/query";
import * as _62 from "./valset-pref/v1beta1/state";
import * as _63 from "./valset-pref/v1beta1/tx";
import * as _109 from "./valset-pref/v1beta1/tx.amino";
import * as _119 from "./valset-pref/v1beta1/tx.registry";
export namespace osmosis {
  export namespace accum {
    export const v1beta1 = {
      ..._16,
    };
  }
  export const authenticator = {
    ..._17,
    ..._18,
    ..._19,
    ..._20,
    ..._21,
    ..._100,
    ..._110,
  };
  export const concentratedliquidity = {
    ..._22,
    poolmodel: {
      concentrated: {
        v1beta1: {
          ..._101,
          ..._111,
        },
      },
    },
    v1beta1: {
      ..._102,
      ..._112,
    },
  };
  export namespace cosmwasmpool {
    export const v1beta1 = {
      ..._23,
      ..._24,
      ..._25,
      ..._26,
      ..._27,
      ..._28,
      ..._29,
      ..._30,
      ..._31,
      ..._32,
      ..._33,
      ..._34,
    };
  }
  export namespace gamm {
    export const v1beta1 = {
      ..._35,
      ..._36,
      ..._37,
      ..._38,
      ..._39,
      ..._40,
      ..._105,
      ..._115,
    };
    export namespace poolmodels {
      export namespace balancer {
        export const v1beta1 = {
          ..._41,
          ..._103,
          ..._113,
        };
      }
      export namespace stableswap {
        export const v1beta1 = {
          ..._42,
          ..._43,
          ..._104,
          ..._114,
        };
      }
    }
  }
  export const lockup = {
    ..._44,
    ..._45,
    ..._46,
    ..._47,
    ..._48,
    ..._106,
    ..._116,
  };
  export namespace poolmanager {
    export const v1beta1 = {
      ..._49,
      ..._50,
      ..._51,
      ..._52,
      ..._53,
      ..._54,
      ..._55,
      ..._107,
      ..._117,
    };
  }
  export const superfluid = {
    ..._56,
    ..._57,
    ..._58,
    ..._59,
    ..._60,
    ..._108,
    ..._118,
  };
  export namespace valsetpref {
    export const v1beta1 = {
      ..._61,
      ..._62,
      ..._63,
      ..._109,
      ..._119,
    };
  }
}
