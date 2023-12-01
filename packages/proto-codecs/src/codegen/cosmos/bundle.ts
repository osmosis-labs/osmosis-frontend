//@ts-nocheck
import * as _54 from "./auth/v1beta1/auth";
import * as _55 from "./auth/v1beta1/genesis";
import * as _56 from "./bank/v1beta1/authz";
import * as _57 from "./bank/v1beta1/bank";
import * as _58 from "./bank/v1beta1/genesis";
import * as _59 from "./bank/v1beta1/tx";
import * as _110 from "./bank/v1beta1/tx.amino";
import * as _113 from "./bank/v1beta1/tx.registry";
import * as _60 from "./base/query/v1beta1/pagination";
import * as _61 from "./base/v1beta1/coin";
import * as _62 from "./staking/v1beta1/authz";
import * as _63 from "./staking/v1beta1/genesis";
import * as _64 from "./staking/v1beta1/staking";
import * as _65 from "./staking/v1beta1/tx";
import * as _111 from "./staking/v1beta1/tx.amino";
import * as _114 from "./staking/v1beta1/tx.registry";
import * as _66 from "./upgrade/v1beta1/tx";
import * as _112 from "./upgrade/v1beta1/tx.amino";
import * as _115 from "./upgrade/v1beta1/tx.registry";
import * as _67 from "./upgrade/v1beta1/upgrade";
export namespace cosmos {
  export namespace auth {
    export const v1beta1 = {
      ..._54,
      ..._55,
    };
  }
  export namespace bank {
    export const v1beta1 = {
      ..._56,
      ..._57,
      ..._58,
      ..._59,
      ..._110,
      ..._113,
    };
  }
  export namespace base {
    export namespace query {
      export const v1beta1 = {
        ..._60,
      };
    }
    export const v1beta1 = {
      ..._61,
    };
  }
  export namespace staking {
    export const v1beta1 = {
      ..._62,
      ..._63,
      ..._64,
      ..._65,
      ..._111,
      ..._114,
    };
  }
  export namespace upgrade {
    export const v1beta1 = {
      ..._66,
      ..._67,
      ..._112,
      ..._115,
    };
  }
}
