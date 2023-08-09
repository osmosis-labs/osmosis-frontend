//@ts-nocheck
import * as _54 from "./auth/v1beta1/auth";
import * as _55 from "./auth/v1beta1/genesis";
import * as _56 from "./auth/v1beta1/query";
import * as _57 from "./bank/v1beta1/authz";
import * as _58 from "./bank/v1beta1/bank";
import * as _59 from "./bank/v1beta1/genesis";
import * as _60 from "./bank/v1beta1/query";
import * as _61 from "./bank/v1beta1/tx";
import * as _110 from "./bank/v1beta1/tx.amino";
import * as _113 from "./bank/v1beta1/tx.registry";
import * as _62 from "./base/query/v1beta1/pagination";
import * as _63 from "./base/v1beta1/coin";
import * as _64 from "./staking/v1beta1/authz";
import * as _65 from "./staking/v1beta1/genesis";
import * as _66 from "./staking/v1beta1/query";
import * as _67 from "./staking/v1beta1/staking";
import * as _68 from "./staking/v1beta1/tx";
import * as _111 from "./staking/v1beta1/tx.amino";
import * as _114 from "./staking/v1beta1/tx.registry";
import * as _69 from "./upgrade/v1beta1/query";
import * as _70 from "./upgrade/v1beta1/tx";
import * as _112 from "./upgrade/v1beta1/tx.amino";
import * as _115 from "./upgrade/v1beta1/tx.registry";
import * as _71 from "./upgrade/v1beta1/upgrade";
export namespace cosmos {
  export namespace auth {
    export const v1beta1 = {
      ..._54,
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
      ..._61,
      ..._110,
      ..._113,
    };
  }
  export namespace base {
    export namespace query {
      export const v1beta1 = {
        ..._62,
      };
    }
    export const v1beta1 = {
      ..._63,
    };
  }
  export namespace staking {
    export const v1beta1 = {
      ..._64,
      ..._65,
      ..._66,
      ..._67,
      ..._68,
      ..._111,
      ..._114,
    };
  }
  export namespace upgrade {
    export const v1beta1 = {
      ..._69,
      ..._70,
      ..._71,
      ..._112,
      ..._115,
    };
  }
}
