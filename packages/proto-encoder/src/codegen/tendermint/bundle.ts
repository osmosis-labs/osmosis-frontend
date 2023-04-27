//@ts-nocheck
/* eslint-disable */
import * as _50 from "./abci/types";
import * as _51 from "./crypto/keys";
import * as _52 from "./crypto/proof";
import * as _53 from "./libs/bits/types";
import * as _54 from "./p2p/types";
import * as _55 from "./types/block";
import * as _56 from "./types/evidence";
import * as _57 from "./types/params";
import * as _58 from "./types/types";
import * as _59 from "./types/validator";
import * as _60 from "./version/types";
export namespace tendermint {
  export const abci = {
    ..._50,
  };
  export const crypto = {
    ..._51,
    ..._52,
  };
  export namespace libs {
    export const bits = {
      ..._53,
    };
  }
  export const p2p = {
    ..._54,
  };
  export const types = {
    ..._55,
    ..._56,
    ..._57,
    ..._58,
    ..._59,
  };
  export const version = {
    ..._60,
  };
}
