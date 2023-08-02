//@ts-nocheck
import * as _46 from "./auth/v1beta1/auth";
import * as _47 from "./auth/v1beta1/genesis";
import * as _48 from "./bank/v1beta1/authz";
import * as _49 from "./bank/v1beta1/bank";
import * as _50 from "./bank/v1beta1/genesis";
import * as _51 from "./bank/v1beta1/tx";
import * as _98 from "./bank/v1beta1/tx.amino";
import * as _101 from "./bank/v1beta1/tx.registry";
import * as _52 from "./base/query/v1beta1/pagination";
import * as _53 from "./base/v1beta1/coin";
import * as _54 from "./staking/v1beta1/authz";
import * as _55 from "./staking/v1beta1/genesis";
import * as _56 from "./staking/v1beta1/staking";
import * as _57 from "./staking/v1beta1/tx";
import * as _99 from "./staking/v1beta1/tx.amino";
import * as _102 from "./staking/v1beta1/tx.registry";
import * as _58 from "./upgrade/v1beta1/tx";
import * as _100 from "./upgrade/v1beta1/tx.amino";
import * as _103 from "./upgrade/v1beta1/tx.registry";
import * as _59 from "./upgrade/v1beta1/upgrade";
export namespace cosmos {
  export namespace auth {
    export const v1beta1 = {
      ..._46,
      ..._47,
    };
  }
  export namespace bank {
    export const v1beta1 = {
      ..._48,
      ..._49,
      ..._50,
      ..._51,
      ..._98,
      ..._101,
    };
  }
  export namespace base {
    export namespace query {
      export const v1beta1 = {
        ..._52,
      };
    }
    export const v1beta1 = {
      ..._53,
    };
  }
  export namespace staking {
    export const v1beta1 = {
      ..._54,
      ..._55,
      ..._56,
      ..._57,
      ..._99,
      ..._102,
    };
  }
  export namespace upgrade {
    export const v1beta1 = {
      ..._58,
      ..._59,
      ..._100,
      ..._103,
    };
  }
}
