//@ts-nocheck
import * as _40 from "./wasm/v1/authz";
import * as _41 from "./wasm/v1/genesis";
import * as _42 from "./wasm/v1/ibc";
import * as _43 from "./wasm/v1/proposal";
import * as _44 from "./wasm/v1/query";
import * as _45 from "./wasm/v1/tx";
import * as _200 from "./wasm/v1/tx.amino";
import * as _201 from "./wasm/v1/tx.registry";
import * as _46 from "./wasm/v1/types";
export namespace cosmwasm {
  export namespace wasm {
    export const v1 = {
      ..._40,
      ..._41,
      ..._42,
      ..._43,
      ..._44,
      ..._45,
      ..._46,
      ..._200,
      ..._201,
    };
  }
}
