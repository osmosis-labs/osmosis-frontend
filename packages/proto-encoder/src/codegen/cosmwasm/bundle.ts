//@ts-nocheck
/* eslint-disable */
import * as _101 from "./wasm/v1/authz";
import * as _102 from "./wasm/v1/genesis";
import * as _103 from "./wasm/v1/ibc";
import * as _104 from "./wasm/v1/proposal";
import * as _105 from "./wasm/v1/query";
import * as _106 from "./wasm/v1/tx";
import * as _107 from "./wasm/v1/types";
import * as _215 from "./wasm/v1/tx.amino";
import * as _216 from "./wasm/v1/tx.registry";
export namespace cosmwasm {
  export namespace wasm {
    export const v1 = {
      ..._101,
      ..._102,
      ..._103,
      ..._104,
      ..._105,
      ..._106,
      ..._107,
      ..._215,
      ..._216,
    };
  }
}
