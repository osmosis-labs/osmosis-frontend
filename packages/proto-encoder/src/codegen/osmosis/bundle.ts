import * as _47 from "./accum/v1beta1/accum";
import * as _48 from "./concentrated-liquidity/params";
import * as _49 from "./cosmwasmpool/v1beta1/genesis";
import * as _50 from "./cosmwasmpool/v1beta1/model/pool";
import * as _51 from "./cosmwasmpool/v1beta1/model/tx";
import * as _52 from "./cosmwasmpool/v1beta1/query";
import * as _53 from "./cosmwasmpool/v1beta1/tx";
import * as _54 from "./downtime-detector/v1beta1/downtime_duration";
import * as _55 from "./downtime-detector/v1beta1/genesis";
import * as _56 from "./downtime-detector/v1beta1/query";
import * as _57 from "./epochs/genesis";
import * as _58 from "./epochs/query";
import * as _59 from "./gamm/pool-models/balancer/balancerPool";
import * as _60 from "./gamm/v1beta1/genesis";
import * as _61 from "./gamm/v1beta1/gov";
import * as _62 from "./gamm/v1beta1/query";
import * as _63 from "./gamm/v1beta1/tx";
import * as _64 from "./gamm/pool-models/balancer/tx/tx";
import * as _65 from "./gamm/pool-models/stableswap/stableswap_pool";
import * as _66 from "./gamm/pool-models/stableswap/tx";
import * as _67 from "./gamm/v2/query";
import * as _68 from "./ibc-rate-limit/v1beta1/genesis";
import * as _69 from "./ibc-rate-limit/v1beta1/params";
import * as _70 from "./ibc-rate-limit/v1beta1/query";
import * as _71 from "./incentives/gauge";
import * as _72 from "./incentives/genesis";
import * as _73 from "./incentives/params";
import * as _74 from "./incentives/query";
import * as _75 from "./incentives/tx";
import * as _76 from "./lockup/genesis";
import * as _77 from "./lockup/lock";
import * as _78 from "./lockup/params";
import * as _79 from "./lockup/query";
import * as _80 from "./lockup/tx";
import * as _81 from "./mint/v1beta1/genesis";
import * as _82 from "./mint/v1beta1/mint";
import * as _83 from "./mint/v1beta1/query";
import * as _84 from "./pool-incentives/v1beta1/genesis";
import * as _85 from "./pool-incentives/v1beta1/gov";
import * as _86 from "./pool-incentives/v1beta1/incentives";
import * as _87 from "./pool-incentives/v1beta1/query";
import * as _88 from "./poolmanager/v1beta1/genesis";
import * as _89 from "./poolmanager/v1beta1/module_route";
import * as _90 from "./poolmanager/v1beta1/query";
import * as _91 from "./poolmanager/v1beta1/swap_route";
import * as _92 from "./poolmanager/v1beta1/tx";
import * as _93 from "./protorev/v1beta1/genesis";
import * as _94 from "./protorev/v1beta1/gov";
import * as _95 from "./protorev/v1beta1/params";
import * as _96 from "./protorev/v1beta1/protorev";
import * as _97 from "./protorev/v1beta1/query";
import * as _98 from "./protorev/v1beta1/tx";
import * as _99 from "./sumtree/v1beta1/tree";
import * as _100 from "./superfluid/genesis";
import * as _101 from "./superfluid/params";
import * as _102 from "./superfluid/query";
import * as _103 from "./superfluid/superfluid";
import * as _104 from "./superfluid/tx";
import * as _105 from "./tokenfactory/v1beta1/authorityMetadata";
import * as _106 from "./tokenfactory/v1beta1/genesis";
import * as _107 from "./tokenfactory/v1beta1/params";
import * as _108 from "./tokenfactory/v1beta1/query";
import * as _109 from "./tokenfactory/v1beta1/tx";
import * as _110 from "./twap/v1beta1/genesis";
import * as _111 from "./twap/v1beta1/query";
import * as _112 from "./twap/v1beta1/twap_record";
import * as _113 from "./txfees/v1beta1/feetoken";
import * as _114 from "./txfees/v1beta1/genesis";
import * as _115 from "./txfees/v1beta1/gov";
import * as _116 from "./txfees/v1beta1/query";
import * as _117 from "./valset-pref/v1beta1/query";
import * as _118 from "./valset-pref/v1beta1/state";
import * as _119 from "./valset-pref/v1beta1/tx";
import * as _203 from "./gamm/pool-models/balancer/tx/tx.amino";
import * as _204 from "./gamm/pool-models/stableswap/tx.amino";
import * as _205 from "./gamm/v1beta1/tx.amino";
import * as _206 from "./incentives/tx.amino";
import * as _207 from "./lockup/tx.amino";
import * as _208 from "./poolmanager/v1beta1/tx.amino";
import * as _209 from "./protorev/v1beta1/tx.amino";
import * as _210 from "./superfluid/tx.amino";
import * as _211 from "./tokenfactory/v1beta1/tx.amino";
import * as _212 from "./valset-pref/v1beta1/tx.amino";
import * as _214 from "./gamm/pool-models/balancer/tx/tx.registry";
import * as _215 from "./gamm/pool-models/stableswap/tx.registry";
import * as _216 from "./gamm/v1beta1/tx.registry";
import * as _217 from "./incentives/tx.registry";
import * as _218 from "./lockup/tx.registry";
import * as _219 from "./poolmanager/v1beta1/tx.registry";
import * as _220 from "./protorev/v1beta1/tx.registry";
import * as _221 from "./superfluid/tx.registry";
import * as _222 from "./tokenfactory/v1beta1/tx.registry";
import * as _223 from "./valset-pref/v1beta1/tx.registry";
export namespace osmosis {
  export namespace accum {
    export const v1beta1 = {
      ..._47,
    };
  }
  export const concentratedliquidity = {
    ..._48,
  };
  export namespace cosmwasmpool {
    export const v1beta1 = {
      ..._49,
      ..._50,
      ..._51,
      ..._52,
      ..._53,
    };
  }
  export namespace downtimedetector {
    export const v1beta1 = {
      ..._54,
      ..._55,
      ..._56,
    };
  }
  export namespace epochs {
    export const v1beta1 = {
      ..._57,
      ..._58,
    };
  }
  export namespace gamm {
    export const v1beta1 = {
      ..._59,
      ..._60,
      ..._61,
      ..._62,
      ..._63,
      ..._205,
      ..._216,
    };
    export namespace poolmodels {
      export namespace balancer {
        export const v1beta1 = {
          ..._64,
          ..._203,
          ..._214,
        };
      }
      export namespace stableswap {
        export const v1beta1 = {
          ..._65,
          ..._66,
          ..._204,
          ..._215,
        };
      }
    }
    export const v2 = {
      ..._67,
    };
  }
  export namespace ibcratelimit {
    export const v1beta1 = {
      ..._68,
      ..._69,
      ..._70,
    };
  }
  export const incentives = {
    ..._71,
    ..._72,
    ..._73,
    ..._74,
    ..._75,
    ..._206,
    ..._217,
  };
  export const lockup = {
    ..._76,
    ..._77,
    ..._78,
    ..._79,
    ..._80,
    ..._207,
    ..._218,
  };
  export namespace mint {
    export const v1beta1 = {
      ..._81,
      ..._82,
      ..._83,
    };
  }
  export namespace poolincentives {
    export const v1beta1 = {
      ..._84,
      ..._85,
      ..._86,
      ..._87,
    };
  }
  export namespace poolmanager {
    export const v1beta1 = {
      ..._88,
      ..._89,
      ..._90,
      ..._91,
      ..._92,
      ..._208,
      ..._219,
    };
  }
  export namespace protorev {
    export const v1beta1 = {
      ..._93,
      ..._94,
      ..._95,
      ..._96,
      ..._97,
      ..._98,
      ..._209,
      ..._220,
    };
  }
  export namespace store {
    export const v1beta1 = {
      ..._99,
    };
  }
  export const superfluid = {
    ..._100,
    ..._101,
    ..._102,
    ..._103,
    ..._104,
    ..._210,
    ..._221,
  };
  export namespace tokenfactory {
    export const v1beta1 = {
      ..._105,
      ..._106,
      ..._107,
      ..._108,
      ..._109,
      ..._211,
      ..._222,
    };
  }
  export namespace twap {
    export const v1beta1 = {
      ..._110,
      ..._111,
      ..._112,
    };
  }
  export namespace txfees {
    export const v1beta1 = {
      ..._113,
      ..._114,
      ..._115,
      ..._116,
    };
  }
  export namespace valsetpref {
    export const v1beta1 = {
      ..._117,
      ..._118,
      ..._119,
      ..._212,
      ..._223,
    };
  }
}
