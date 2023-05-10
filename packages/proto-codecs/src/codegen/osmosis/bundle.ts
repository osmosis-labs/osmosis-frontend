//@ts-nocheck
import * as _16 from "./accum/v1beta1/accum";
import * as _17 from "./concentrated-liquidity/params";
import * as _18 from "./cosmwasmpool/v1beta1/genesis";
import * as _19 from "./cosmwasmpool/v1beta1/model/pool";
import * as _20 from "./cosmwasmpool/v1beta1/model/tx";
import * as _21 from "./cosmwasmpool/v1beta1/query";
import * as _22 from "./cosmwasmpool/v1beta1/tx";
import * as _23 from "./gamm/pool-models/balancer/balancerPool";
import * as _28 from "./gamm/pool-models/balancer/tx/tx";
import * as _87 from "./gamm/pool-models/balancer/tx/tx.amino";
import * as _94 from "./gamm/pool-models/balancer/tx/tx.registry";
import * as _29 from "./gamm/pool-models/stableswap/stableswap_pool";
import * as _30 from "./gamm/pool-models/stableswap/tx";
import * as _88 from "./gamm/pool-models/stableswap/tx.amino";
import * as _95 from "./gamm/pool-models/stableswap/tx.registry";
import * as _24 from "./gamm/v1beta1/genesis";
import * as _25 from "./gamm/v1beta1/gov";
import * as _26 from "./gamm/v1beta1/query";
import * as _27 from "./gamm/v1beta1/tx";
import * as _89 from "./gamm/v1beta1/tx.amino";
import * as _96 from "./gamm/v1beta1/tx.registry";
import * as _31 from "./lockup/genesis";
import * as _32 from "./lockup/lock";
import * as _33 from "./lockup/params";
import * as _34 from "./lockup/query";
import * as _35 from "./lockup/tx";
import * as _90 from "./lockup/tx.amino";
import * as _97 from "./lockup/tx.registry";
import * as _36 from "./poolmanager/v1beta1/genesis";
import * as _37 from "./poolmanager/v1beta1/module_route";
import * as _38 from "./poolmanager/v1beta1/query";
import * as _39 from "./poolmanager/v1beta1/swap_route";
import * as _40 from "./poolmanager/v1beta1/tx";
import * as _91 from "./poolmanager/v1beta1/tx.amino";
import * as _98 from "./poolmanager/v1beta1/tx.registry";
import * as _41 from "./superfluid/genesis";
import * as _42 from "./superfluid/params";
import * as _43 from "./superfluid/query";
import * as _44 from "./superfluid/superfluid";
import * as _45 from "./superfluid/tx";
import * as _92 from "./superfluid/tx.amino";
import * as _99 from "./superfluid/tx.registry";
export namespace osmosis {
  export namespace accum {
    export const v1beta1 = {
      ..._16,
    };
  }
  export const concentratedliquidity = {
    ..._17,
  };
  export namespace cosmwasmpool {
    export const v1beta1 = {
      ..._18,
      ..._19,
      ..._20,
      ..._21,
      ..._22,
    };
  }
  export namespace gamm {
    export const v1beta1 = {
      ..._23,
      ..._24,
      ..._25,
      ..._26,
      ..._27,
      ..._89,
      ..._96,
    };
    export namespace poolmodels {
      export namespace balancer {
        export const v1beta1 = {
          ..._28,
          ..._87,
          ..._94,
        };
      }
      export namespace stableswap {
        export const v1beta1 = {
          ..._29,
          ..._30,
          ..._88,
          ..._95,
        };
      }
    }
  }
  export const lockup = {
    ..._31,
    ..._32,
    ..._33,
    ..._34,
    ..._35,
    ..._90,
    ..._97,
  };
  export namespace poolmanager {
    export const v1beta1 = {
      ..._36,
      ..._37,
      ..._38,
      ..._39,
      ..._40,
      ..._91,
      ..._98,
    };
  }
  export const superfluid = {
    ..._41,
    ..._42,
    ..._43,
    ..._44,
    ..._45,
    ..._92,
    ..._99,
  };
}
