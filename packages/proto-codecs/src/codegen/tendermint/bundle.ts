//@ts-nocheck
import * as _71 from "./crypto/keys";
import * as _72 from "./crypto/proof";
import * as _73 from "./types/block";
import * as _74 from "./types/evidence";
import * as _75 from "./types/params";
import * as _76 from "./types/types";
import * as _77 from "./types/validator";
import * as _78 from "./version/types";
export namespace tendermint {
  export const crypto = {
    ..._71,
    ..._72,
  };
  export const types = {
    ..._73,
    ..._74,
    ..._75,
    ..._76,
    ..._77,
  };
  export const version = {
    ..._78,
  };
}
