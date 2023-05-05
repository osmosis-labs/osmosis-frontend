//@ts-nocheck
import * as _17 from "./accum/v1beta1/accum";
import * as _18 from "./concentrated-liquidity/params";
import * as _19 from "./cosmwasmpool/v1beta1/genesis";
import * as _20 from "./cosmwasmpool/v1beta1/model/pool";
import * as _21 from "./cosmwasmpool/v1beta1/model/tx";
import * as _22 from "./cosmwasmpool/v1beta1/query";
import * as _23 from "./cosmwasmpool/v1beta1/tx";
import * as _24 from "./gamm/pool-models/balancer/balancerPool";
import * as _29 from "./gamm/pool-models/balancer/tx/tx";
import * as _88 from "./gamm/pool-models/balancer/tx/tx.amino";
import * as _95 from "./gamm/pool-models/balancer/tx/tx.registry";
import * as _30 from "./gamm/pool-models/stableswap/stableswap_pool";
import * as _31 from "./gamm/pool-models/stableswap/tx";
import * as _89 from "./gamm/pool-models/stableswap/tx.amino";
import * as _96 from "./gamm/pool-models/stableswap/tx.registry";
import * as _25 from "./gamm/v1beta1/genesis";
import * as _26 from "./gamm/v1beta1/gov";
import * as _27 from "./gamm/v1beta1/query";
import * as _28 from "./gamm/v1beta1/tx";
import * as _90 from "./gamm/v1beta1/tx.amino";
import * as _97 from "./gamm/v1beta1/tx.registry";
import * as _32 from "./lockup/genesis";
import * as _33 from "./lockup/lock";
import * as _34 from "./lockup/params";
import * as _35 from "./lockup/query";
import * as _36 from "./lockup/tx";
import * as _91 from "./lockup/tx.amino";
import * as _98 from "./lockup/tx.registry";
import * as _37 from "./poolmanager/v1beta1/genesis";
import * as _38 from "./poolmanager/v1beta1/module_route";
import * as _39 from "./poolmanager/v1beta1/query";
import * as _40 from "./poolmanager/v1beta1/swap_route";
import * as _41 from "./poolmanager/v1beta1/tx";
import * as _92 from "./poolmanager/v1beta1/tx.amino";
import * as _99 from "./poolmanager/v1beta1/tx.registry";
import * as _42 from "./superfluid/genesis";
import * as _43 from "./superfluid/params";
import * as _44 from "./superfluid/query";
import * as _45 from "./superfluid/superfluid";
import * as _46 from "./superfluid/tx";
import * as _93 from "./superfluid/tx.amino";
import * as _100 from "./superfluid/tx.registry";
export namespace osmosis {
  export namespace accum {
    export const v1beta1 = {
      ..._17,
    };
  }
  export const concentratedliquidity = {
    ..._18,
  };
  export namespace cosmwasmpool {
    export const v1beta1 = {
      ..._19,
      ..._20,
      ..._21,
      ..._22,
      ..._23,
    };
  }
  export namespace gamm {
    export const v1beta1 = {
      ..._24,
      ..._25,
      ..._26,
      ..._27,
      ..._28,
      ..._90,
      ..._97,
    };
    export namespace poolmodels {
      export namespace balancer {
        export const v1beta1 = {
          ..._29,
          ..._88,
          ..._95,
        };
      }
      export namespace stableswap {
        export const v1beta1 = {
          ..._30,
          ..._31,
          ..._89,
          ..._96,
        };
      }
    }
  }
  export const lockup = {
    ..._32,
    ..._33,
    ..._34,
    ..._35,
    ..._36,
    ..._91,
    ..._98,
  };
  export namespace poolmanager {
    export const v1beta1 = {
      ..._37,
      ..._38,
      ..._39,
      ..._40,
      ..._41,
      ..._92,
      ..._99,
    };
  }
  export const superfluid = {
    ..._42,
    ..._43,
    ..._44,
    ..._45,
    ..._46,
    ..._93,
    ..._100,
  };
}
