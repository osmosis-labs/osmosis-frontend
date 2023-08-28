//@ts-nocheck
import * as _7 from "./wasm/v1/authz";
import * as _8 from "./wasm/v1/genesis";
import * as _9 from "./wasm/v1/ibc";
import * as _10 from "./wasm/v1/proposal";
import * as _11 from "./wasm/v1/tx";
import * as _82 from "./wasm/v1/tx.amino";
import * as _83 from "./wasm/v1/tx.registry";
import * as _12 from "./wasm/v1/types";
export namespace cosmwasm {
  export namespace wasm {
    export const v1 = {
      ..._7,
      ..._8,
      ..._9,
      ..._10,
      ..._11,
      ..._12,
      ..._82,
      ..._83,
    };
  }
}
