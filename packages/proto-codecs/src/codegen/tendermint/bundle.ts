//@ts-nocheck
import * as _68 from "./crypto/keys";
import * as _69 from "./crypto/proof";
import * as _70 from "./types/block";
import * as _71 from "./types/evidence";
import * as _72 from "./types/params";
import * as _73 from "./types/types";
import * as _74 from "./types/validator";
import * as _75 from "./version/types";
export namespace tendermint {
  export const crypto = {
    ..._68,
    ..._69,
  };
  export const types = {
    ..._70,
    ..._71,
    ..._72,
    ..._73,
    ..._74,
  };
  export const version = {
    ..._75,
  };
}
