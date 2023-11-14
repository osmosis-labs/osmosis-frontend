//@ts-nocheck
import * as _64 from "./auth/v1beta1/auth";
import * as _65 from "./auth/v1beta1/genesis";
import * as _66 from "./bank/v1beta1/authz";
import * as _67 from "./bank/v1beta1/bank";
import * as _68 from "./bank/v1beta1/genesis";
import * as _69 from "./bank/v1beta1/tx";
import * as _120 from "./bank/v1beta1/tx.amino";
import * as _123 from "./bank/v1beta1/tx.registry";
import * as _70 from "./base/query/v1beta1/pagination";
import * as _71 from "./base/v1beta1/coin";
import * as _72 from "./staking/v1beta1/authz";
import * as _73 from "./staking/v1beta1/genesis";
import * as _74 from "./staking/v1beta1/staking";
import * as _75 from "./staking/v1beta1/tx";
import * as _121 from "./staking/v1beta1/tx.amino";
import * as _124 from "./staking/v1beta1/tx.registry";
import * as _76 from "./upgrade/v1beta1/tx";
import * as _122 from "./upgrade/v1beta1/tx.amino";
import * as _125 from "./upgrade/v1beta1/tx.registry";
import * as _77 from "./upgrade/v1beta1/upgrade";
export namespace cosmos {
  export namespace auth {
    export const v1beta1 = {
      ..._64,
      ..._65,
    };
  }
  export namespace bank {
    export const v1beta1 = {
      ..._66,
      ..._67,
      ..._68,
      ..._69,
      ..._120,
      ..._123,
    };
  }
  export namespace base {
    export namespace query {
      export const v1beta1 = {
        ..._70,
      };
    }
    export const v1beta1 = {
      ..._71,
    };
  }
  export namespace staking {
    export const v1beta1 = {
      ..._72,
      ..._73,
      ..._74,
      ..._75,
      ..._121,
      ..._124,
    };
  }
  export namespace upgrade {
    export const v1beta1 = {
      ..._76,
      ..._77,
      ..._122,
      ..._125,
    };
  }
}
