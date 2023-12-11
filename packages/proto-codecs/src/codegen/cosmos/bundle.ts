//@ts-nocheck
import * as _51 from "./auth/v1beta1/auth";
import * as _52 from "./auth/v1beta1/genesis";
import * as _53 from "./bank/v1beta1/authz";
import * as _54 from "./bank/v1beta1/bank";
import * as _55 from "./bank/v1beta1/genesis";
import * as _56 from "./bank/v1beta1/tx";
import * as _105 from "./bank/v1beta1/tx.amino";
import * as _108 from "./bank/v1beta1/tx.registry";
import * as _57 from "./base/query/v1beta1/pagination";
import * as _58 from "./base/v1beta1/coin";
import * as _59 from "./staking/v1beta1/authz";
import * as _60 from "./staking/v1beta1/genesis";
import * as _61 from "./staking/v1beta1/staking";
import * as _62 from "./staking/v1beta1/tx";
import * as _106 from "./staking/v1beta1/tx.amino";
import * as _109 from "./staking/v1beta1/tx.registry";
import * as _63 from "./upgrade/v1beta1/tx";
import * as _107 from "./upgrade/v1beta1/tx.amino";
import * as _110 from "./upgrade/v1beta1/tx.registry";
import * as _64 from "./upgrade/v1beta1/upgrade";
export namespace cosmos {
  export namespace auth {
    export const v1beta1 = {
      ..._51,
      ..._52,
    };
  }
  export namespace bank {
    export const v1beta1 = {
      ..._53,
      ..._54,
      ..._55,
      ..._56,
      ..._105,
      ..._108,
    };
  }
  export namespace base {
    export namespace query {
      export const v1beta1 = {
        ..._57,
      };
    }
    export const v1beta1 = {
      ..._58,
    };
  }
  export namespace staking {
    export const v1beta1 = {
      ..._59,
      ..._60,
      ..._61,
      ..._62,
      ..._106,
      ..._109,
    };
  }
  export namespace upgrade {
    export const v1beta1 = {
      ..._63,
      ..._64,
      ..._107,
      ..._110,
    };
  }
}
