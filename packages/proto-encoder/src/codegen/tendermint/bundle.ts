//@ts-nocheck
import * as _177 from "./abci/types";
import * as _178 from "./crypto/keys";
import * as _179 from "./crypto/proof";
import * as _180 from "./libs/bits/types";
import * as _181 from "./p2p/types";
import * as _182 from "./types/block";
import * as _183 from "./types/evidence";
import * as _184 from "./types/params";
import * as _185 from "./types/types";
import * as _186 from "./types/validator";
import * as _187 from "./version/types";
export namespace tendermint {
  export const abci = {
    ..._177,
  };
  export const crypto = {
    ..._178,
    ..._179,
  };
  export namespace libs {
    export const bits = {
      ..._180,
    };
  }
  export const p2p = {
    ..._181,
  };
  export const types = {
    ..._182,
    ..._183,
    ..._184,
    ..._185,
    ..._186,
  };
  export const version = {
    ..._187,
  };
}
