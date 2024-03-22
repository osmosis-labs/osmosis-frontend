//@ts-nocheck
import * as _55 from "./auth/v1beta1/auth";
import * as _56 from "./auth/v1beta1/genesis";
import * as _57 from "./bank/v1beta1/authz";
import * as _58 from "./bank/v1beta1/bank";
import * as _59 from "./bank/v1beta1/genesis";
import * as _60 from "./bank/v1beta1/tx";
import * as _111 from "./bank/v1beta1/tx.amino";
import * as _114 from "./bank/v1beta1/tx.registry";
import * as _61 from "./base/query/v1beta1/pagination";
import * as _62 from "./base/v1beta1/coin";
import * as _63 from "./staking/v1beta1/authz";
import * as _64 from "./staking/v1beta1/genesis";
import * as _65 from "./staking/v1beta1/staking";
import * as _66 from "./staking/v1beta1/tx";
import * as _112 from "./staking/v1beta1/tx.amino";
import * as _115 from "./staking/v1beta1/tx.registry";
import * as _67 from "./upgrade/v1beta1/tx";
import * as _113 from "./upgrade/v1beta1/tx.amino";
import * as _116 from "./upgrade/v1beta1/tx.registry";
import * as _68 from "./upgrade/v1beta1/upgrade";
export namespace cosmos {
  export namespace auth {
    export const v1beta1 = {
      ..._55,
      ..._56,
    };
  }
  export namespace bank {
    export const v1beta1 = {
      ..._57,
      ..._58,
      ..._59,
      ..._60,
      ..._111,
      ..._114,
    };
  }
  export namespace base {
    export namespace query {
      export const v1beta1 = {
        ..._61,
      };
    }
    export const v1beta1 = {
      ..._62,
    };
  }
  export namespace staking {
    export const v1beta1 = {
      ..._63,
      ..._64,
      ..._65,
      ..._66,
      ..._112,
      ..._115,
    };
  }
  export namespace upgrade {
    export const v1beta1 = {
      ..._67,
      ..._68,
      ..._113,
      ..._116,
    };
  }
}
