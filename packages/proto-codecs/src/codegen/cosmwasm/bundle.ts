//@ts-nocheck
import * as _8 from "./wasm/v1/authz";
import * as _9 from "./wasm/v1/genesis";
import * as _10 from "./wasm/v1/ibc";
import * as _11 from "./wasm/v1/proposal_legacy";
import * as _12 from "./wasm/v1/tx";
import * as _89 from "./wasm/v1/tx.amino";
import * as _90 from "./wasm/v1/tx.registry";
import * as _13 from "./wasm/v1/types";
export namespace cosmwasm {
  export namespace wasm {
    export const v1 = {
      ..._8,
      ..._9,
      ..._10,
      ..._11,
      ..._12,
      ..._13,
      ..._89,
      ..._90,
    };
  }
}
