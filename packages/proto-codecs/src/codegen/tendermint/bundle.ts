//@ts-nocheck
import * as _76 from "./crypto/keys";
import * as _77 from "./crypto/proof";
import * as _78 from "./types/block";
import * as _79 from "./types/evidence";
import * as _80 from "./types/params";
import * as _81 from "./types/types";
import * as _82 from "./types/validator";
import * as _83 from "./version/types";
export namespace tendermint {
  export const crypto = {
    ..._76,
    ..._77,
  };
  export const types = {
    ..._78,
    ..._79,
    ..._80,
    ..._81,
    ..._82,
  };
  export const version = {
    ..._83,
  };
}
