//@ts-nocheck
import * as _70 from "./crypto/keys";
import * as _71 from "./crypto/proof";
import * as _72 from "./types/block";
import * as _73 from "./types/evidence";
import * as _74 from "./types/params";
import * as _75 from "./types/types";
import * as _76 from "./types/validator";
import * as _77 from "./version/types";
export namespace tendermint {
  export const crypto = {
    ..._70,
    ..._71,
  };
  export const types = {
    ..._72,
    ..._73,
    ..._74,
    ..._75,
    ..._76,
  };
  export const version = {
    ..._77,
  };
}
