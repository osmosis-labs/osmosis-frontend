//@ts-nocheck
import * as _51 from "./auth/v1beta1/auth";
import * as _52 from "./auth/v1beta1/genesis";
import * as _53 from "./auth/v1beta1/query";
import * as _54 from "./bank/v1beta1/authz";
import * as _55 from "./bank/v1beta1/bank";
import * as _56 from "./bank/v1beta1/genesis";
import * as _57 from "./bank/v1beta1/query";
import * as _58 from "./bank/v1beta1/tx";
import * as _105 from "./bank/v1beta1/tx.amino";
import * as _108 from "./bank/v1beta1/tx.registry";
import * as _59 from "./base/query/v1beta1/pagination";
import * as _60 from "./base/v1beta1/coin";
import * as _61 from "./staking/v1beta1/authz";
import * as _62 from "./staking/v1beta1/genesis";
import * as _63 from "./staking/v1beta1/query";
import * as _64 from "./staking/v1beta1/staking";
import * as _65 from "./staking/v1beta1/tx";
import * as _106 from "./staking/v1beta1/tx.amino";
import * as _109 from "./staking/v1beta1/tx.registry";
import * as _66 from "./upgrade/v1beta1/query";
import * as _67 from "./upgrade/v1beta1/tx";
import * as _107 from "./upgrade/v1beta1/tx.amino";
import * as _110 from "./upgrade/v1beta1/tx.registry";
import * as _68 from "./upgrade/v1beta1/upgrade";
export namespace cosmos {
  export namespace auth {
    export const v1beta1 = {
      ..._51,
      ..._52,
      ..._53,
    };
  }
  export namespace bank {
    export const v1beta1 = {
      ..._54,
      ..._55,
      ..._56,
      ..._57,
      ..._58,
      ..._105,
      ..._108,
    };
  }
  export namespace base {
    export namespace query {
      export const v1beta1 = {
        ..._59,
      };
    }
    export const v1beta1 = {
      ..._60,
    };
  }
  export namespace staking {
    export const v1beta1 = {
      ..._61,
      ..._62,
      ..._63,
      ..._64,
      ..._65,
      ..._106,
      ..._109,
    };
  }
  export namespace upgrade {
    export const v1beta1 = {
      ..._66,
      ..._67,
      ..._68,
      ..._107,
      ..._110,
    };
  }
}
