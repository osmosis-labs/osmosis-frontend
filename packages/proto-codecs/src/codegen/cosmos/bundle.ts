//@ts-nocheck
import * as _50 from "./auth/v1beta1/auth";
import * as _51 from "./auth/v1beta1/genesis";
import * as _52 from "./bank/v1beta1/authz";
import * as _53 from "./bank/v1beta1/bank";
import * as _54 from "./bank/v1beta1/genesis";
import * as _55 from "./bank/v1beta1/tx";
import * as _104 from "./bank/v1beta1/tx.amino";
import * as _107 from "./bank/v1beta1/tx.registry";
import * as _56 from "./base/query/v1beta1/pagination";
import * as _57 from "./base/v1beta1/coin";
import * as _58 from "./staking/v1beta1/authz";
import * as _59 from "./staking/v1beta1/genesis";
import * as _60 from "./staking/v1beta1/staking";
import * as _61 from "./staking/v1beta1/tx";
import * as _105 from "./staking/v1beta1/tx.amino";
import * as _108 from "./staking/v1beta1/tx.registry";
import * as _62 from "./upgrade/v1beta1/tx";
import * as _106 from "./upgrade/v1beta1/tx.amino";
import * as _109 from "./upgrade/v1beta1/tx.registry";
import * as _63 from "./upgrade/v1beta1/upgrade";
export namespace cosmos {
  export namespace auth {
    export const v1beta1 = {
      ..._50,
      ..._51,
    };
  }
  export namespace bank {
    export const v1beta1 = {
      ..._52,
      ..._53,
      ..._54,
      ..._55,
      ..._104,
      ..._107,
    };
  }
  export namespace base {
    export namespace query {
      export const v1beta1 = {
        ..._56,
      };
    }
    export const v1beta1 = {
      ..._57,
    };
  }
  export namespace staking {
    export const v1beta1 = {
      ..._58,
      ..._59,
      ..._60,
      ..._61,
      ..._105,
      ..._108,
    };
  }
  export namespace upgrade {
    export const v1beta1 = {
      ..._62,
      ..._63,
      ..._106,
      ..._109,
    };
  }
}
