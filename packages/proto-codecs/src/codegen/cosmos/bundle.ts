//@ts-nocheck
import * as _57 from "./auth/v1beta1/auth";
import * as _58 from "./auth/v1beta1/genesis";
import * as _59 from "./bank/v1beta1/authz";
import * as _60 from "./bank/v1beta1/bank";
import * as _61 from "./bank/v1beta1/genesis";
import * as _62 from "./bank/v1beta1/tx";
import * as _113 from "./bank/v1beta1/tx.amino";
import * as _116 from "./bank/v1beta1/tx.registry";
import * as _63 from "./base/query/v1beta1/pagination";
import * as _64 from "./base/v1beta1/coin";
import * as _65 from "./staking/v1beta1/authz";
import * as _66 from "./staking/v1beta1/genesis";
import * as _67 from "./staking/v1beta1/staking";
import * as _68 from "./staking/v1beta1/tx";
import * as _114 from "./staking/v1beta1/tx.amino";
import * as _117 from "./staking/v1beta1/tx.registry";
import * as _69 from "./upgrade/v1beta1/tx";
import * as _115 from "./upgrade/v1beta1/tx.amino";
import * as _118 from "./upgrade/v1beta1/tx.registry";
import * as _70 from "./upgrade/v1beta1/upgrade";
export namespace cosmos {
  export namespace auth {
    export const v1beta1 = {
      ..._57,
      ..._58,
    };
  }
  export namespace bank {
    export const v1beta1 = {
      ..._59,
      ..._60,
      ..._61,
      ..._62,
      ..._113,
      ..._116,
    };
  }
  export namespace base {
    export namespace query {
      export const v1beta1 = {
        ..._63,
      };
    }
    export const v1beta1 = {
      ..._64,
    };
  }
  export namespace staking {
    export const v1beta1 = {
      ..._65,
      ..._66,
      ..._67,
      ..._68,
      ..._114,
      ..._117,
    };
  }
  export namespace upgrade {
    export const v1beta1 = {
      ..._69,
      ..._70,
      ..._115,
      ..._118,
    };
  }
}
