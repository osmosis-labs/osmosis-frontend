//@ts-nocheck
/* eslint-disable */
import * as _108 from "./accum/v1beta1/accum";
import * as _109 from "./concentrated-liquidity/params";
import * as _110 from "./cosmwasmpool/v1beta1/genesis";
import * as _111 from "./cosmwasmpool/v1beta1/model/pool";
import * as _112 from "./cosmwasmpool/v1beta1/model/tx";
import * as _113 from "./cosmwasmpool/v1beta1/query";
import * as _114 from "./cosmwasmpool/v1beta1/tx";
import * as _115 from "./downtime-detector/v1beta1/downtime_duration";
import * as _116 from "./downtime-detector/v1beta1/genesis";
import * as _117 from "./downtime-detector/v1beta1/query";
import * as _118 from "./epochs/genesis";
import * as _119 from "./epochs/query";
import * as _120 from "./gamm/pool-models/balancer/balancerPool";
import * as _121 from "./gamm/v1beta1/genesis";
import * as _122 from "./gamm/v1beta1/gov";
import * as _123 from "./gamm/v1beta1/query";
import * as _124 from "./gamm/v1beta1/tx";
import * as _125 from "./gamm/pool-models/balancer/tx/tx";
import * as _126 from "./gamm/pool-models/stableswap/stableswap_pool";
import * as _127 from "./gamm/pool-models/stableswap/tx";
import * as _128 from "./gamm/v2/query";
import * as _129 from "./ibc-rate-limit/v1beta1/genesis";
import * as _130 from "./ibc-rate-limit/v1beta1/params";
import * as _131 from "./ibc-rate-limit/v1beta1/query";
import * as _132 from "./incentives/gauge";
import * as _133 from "./incentives/genesis";
import * as _134 from "./incentives/params";
import * as _135 from "./incentives/query";
import * as _136 from "./incentives/tx";
import * as _137 from "./lockup/genesis";
import * as _138 from "./lockup/lock";
import * as _139 from "./lockup/params";
import * as _140 from "./lockup/query";
import * as _141 from "./lockup/tx";
import * as _142 from "./mint/v1beta1/genesis";
import * as _143 from "./mint/v1beta1/mint";
import * as _144 from "./mint/v1beta1/query";
import * as _145 from "./pool-incentives/v1beta1/genesis";
import * as _146 from "./pool-incentives/v1beta1/gov";
import * as _147 from "./pool-incentives/v1beta1/incentives";
import * as _148 from "./pool-incentives/v1beta1/query";
import * as _149 from "./poolmanager/v1beta1/genesis";
import * as _150 from "./poolmanager/v1beta1/module_route";
import * as _151 from "./poolmanager/v1beta1/query";
import * as _152 from "./poolmanager/v1beta1/swap_route";
import * as _153 from "./poolmanager/v1beta1/tx";
import * as _154 from "./protorev/v1beta1/genesis";
import * as _155 from "./protorev/v1beta1/gov";
import * as _156 from "./protorev/v1beta1/params";
import * as _157 from "./protorev/v1beta1/protorev";
import * as _158 from "./protorev/v1beta1/query";
import * as _159 from "./protorev/v1beta1/tx";
import * as _160 from "./sumtree/v1beta1/tree";
import * as _161 from "./superfluid/genesis";
import * as _162 from "./superfluid/params";
import * as _163 from "./superfluid/query";
import * as _164 from "./superfluid/superfluid";
import * as _165 from "./superfluid/tx";
import * as _166 from "./tokenfactory/v1beta1/authorityMetadata";
import * as _167 from "./tokenfactory/v1beta1/genesis";
import * as _168 from "./tokenfactory/v1beta1/params";
import * as _169 from "./tokenfactory/v1beta1/query";
import * as _170 from "./tokenfactory/v1beta1/tx";
import * as _171 from "./twap/v1beta1/genesis";
import * as _172 from "./twap/v1beta1/query";
import * as _173 from "./twap/v1beta1/twap_record";
import * as _174 from "./txfees/v1beta1/feetoken";
import * as _175 from "./txfees/v1beta1/genesis";
import * as _176 from "./txfees/v1beta1/gov";
import * as _177 from "./txfees/v1beta1/query";
import * as _178 from "./valset-pref/v1beta1/query";
import * as _179 from "./valset-pref/v1beta1/state";
import * as _180 from "./valset-pref/v1beta1/tx";
import * as _218 from "./gamm/pool-models/balancer/tx/tx.amino";
import * as _219 from "./gamm/pool-models/stableswap/tx.amino";
import * as _220 from "./gamm/v1beta1/tx.amino";
import * as _221 from "./incentives/tx.amino";
import * as _222 from "./lockup/tx.amino";
import * as _223 from "./poolmanager/v1beta1/tx.amino";
import * as _224 from "./protorev/v1beta1/tx.amino";
import * as _225 from "./superfluid/tx.amino";
import * as _226 from "./tokenfactory/v1beta1/tx.amino";
import * as _227 from "./valset-pref/v1beta1/tx.amino";
import * as _229 from "./gamm/pool-models/balancer/tx/tx.registry";
import * as _230 from "./gamm/pool-models/stableswap/tx.registry";
import * as _231 from "./gamm/v1beta1/tx.registry";
import * as _232 from "./incentives/tx.registry";
import * as _233 from "./lockup/tx.registry";
import * as _234 from "./poolmanager/v1beta1/tx.registry";
import * as _235 from "./protorev/v1beta1/tx.registry";
import * as _236 from "./superfluid/tx.registry";
import * as _237 from "./tokenfactory/v1beta1/tx.registry";
import * as _238 from "./valset-pref/v1beta1/tx.registry";
export namespace osmosis {
  export namespace accum {
    export const v1beta1 = {
      ..._108,
    };
  }
  export const concentratedliquidity = {
    ..._109,
  };
  export namespace cosmwasmpool {
    export const v1beta1 = {
      ..._110,
      ..._111,
      ..._112,
      ..._113,
      ..._114,
    };
  }
  export namespace downtimedetector {
    export const v1beta1 = {
      ..._115,
      ..._116,
      ..._117,
    };
  }
  export namespace epochs {
    export const v1beta1 = {
      ..._118,
      ..._119,
    };
  }
  export namespace gamm {
    export const v1beta1 = {
      ..._120,
      ..._121,
      ..._122,
      ..._123,
      ..._124,
      ..._220,
      ..._231,
    };
    export namespace poolmodels {
      export namespace balancer {
        export const v1beta1 = {
          ..._125,
          ..._218,
          ..._229,
        };
      }
      export namespace stableswap {
        export const v1beta1 = {
          ..._126,
          ..._127,
          ..._219,
          ..._230,
        };
      }
    }
    export const v2 = {
      ..._128,
    };
  }
  export namespace ibcratelimit {
    export const v1beta1 = {
      ..._129,
      ..._130,
      ..._131,
    };
  }
  export const incentives = {
    ..._132,
    ..._133,
    ..._134,
    ..._135,
    ..._136,
    ..._221,
    ..._232,
  };
  export const lockup = {
    ..._137,
    ..._138,
    ..._139,
    ..._140,
    ..._141,
    ..._222,
    ..._233,
  };
  export namespace mint {
    export const v1beta1 = {
      ..._142,
      ..._143,
      ..._144,
    };
  }
  export namespace poolincentives {
    export const v1beta1 = {
      ..._145,
      ..._146,
      ..._147,
      ..._148,
    };
  }
  export namespace poolmanager {
    export const v1beta1 = {
      ..._149,
      ..._150,
      ..._151,
      ..._152,
      ..._153,
      ..._223,
      ..._234,
    };
  }
  export namespace protorev {
    export const v1beta1 = {
      ..._154,
      ..._155,
      ..._156,
      ..._157,
      ..._158,
      ..._159,
      ..._224,
      ..._235,
    };
  }
  export namespace store {
    export const v1beta1 = {
      ..._160,
    };
  }
  export const superfluid = {
    ..._161,
    ..._162,
    ..._163,
    ..._164,
    ..._165,
    ..._225,
    ..._236,
  };
  export namespace tokenfactory {
    export const v1beta1 = {
      ..._166,
      ..._167,
      ..._168,
      ..._169,
      ..._170,
      ..._226,
      ..._237,
    };
  }
  export namespace twap {
    export const v1beta1 = {
      ..._171,
      ..._172,
      ..._173,
    };
  }
  export namespace txfees {
    export const v1beta1 = {
      ..._174,
      ..._175,
      ..._176,
      ..._177,
    };
  }
  export namespace valsetpref {
    export const v1beta1 = {
      ..._178,
      ..._179,
      ..._180,
      ..._227,
      ..._238,
    };
  }
}
