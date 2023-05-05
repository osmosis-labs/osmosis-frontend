//@ts-nocheck
import * as _47 from "./auth/v1beta1/auth";
import * as _48 from "./auth/v1beta1/genesis";
import * as _49 from "./auth/v1beta1/query";
import * as _50 from "./bank/v1beta1/authz";
import * as _51 from "./bank/v1beta1/bank";
import * as _52 from "./bank/v1beta1/genesis";
import * as _53 from "./bank/v1beta1/query";
import * as _54 from "./bank/v1beta1/tx";
import * as _101 from "./bank/v1beta1/tx.amino";
import * as _104 from "./bank/v1beta1/tx.registry";
import * as _55 from "./base/query/v1beta1/pagination";
import * as _56 from "./base/v1beta1/coin";
import * as _57 from "./staking/v1beta1/authz";
import * as _58 from "./staking/v1beta1/genesis";
import * as _59 from "./staking/v1beta1/query";
import * as _60 from "./staking/v1beta1/staking";
import * as _61 from "./staking/v1beta1/tx";
import * as _102 from "./staking/v1beta1/tx.amino";
import * as _105 from "./staking/v1beta1/tx.registry";
import * as _62 from "./upgrade/v1beta1/query";
import * as _63 from "./upgrade/v1beta1/tx";
import * as _103 from "./upgrade/v1beta1/tx.amino";
import * as _106 from "./upgrade/v1beta1/tx.registry";
import * as _64 from "./upgrade/v1beta1/upgrade";
export namespace cosmos {
  export namespace auth {
    export const v1beta1 = {
      ..._47,
      ..._48,
      ..._49,
    };
  }
  export namespace bank {
    export const v1beta1 = {
      ..._50,
      ..._51,
      ..._52,
      ..._53,
      ..._54,
      ..._101,
      ..._104,
    };
  }
  export namespace base {
    export namespace query {
      export const v1beta1 = {
        ..._55,
      };
    }
    export const v1beta1 = {
      ..._56,
    };
  }
  export namespace staking {
    export const v1beta1 = {
      ..._57,
      ..._58,
      ..._59,
      ..._60,
      ..._61,
      ..._102,
      ..._105,
    };
  }
  export namespace upgrade {
    export const v1beta1 = {
      ..._62,
      ..._63,
      ..._64,
      ..._103,
      ..._106,
    };
  }
}
