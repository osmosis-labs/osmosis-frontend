//@ts-nocheck
import * as _72 from "./crypto/keys";
import * as _73 from "./crypto/proof";
import * as _74 from "./types/block";
import * as _75 from "./types/evidence";
import * as _76 from "./types/params";
import * as _77 from "./types/types";
import * as _78 from "./types/validator";
import * as _79 from "./version/types";
export namespace tendermint {
  export const crypto = {
    ..._72,
    ..._73,
  };
  export const types = {
    ..._74,
    ..._75,
    ..._76,
    ..._77,
    ..._78,
  };
  export const version = {
    ..._79,
  };
}
