//@ts-nocheck
import * as _79 from "./crypto/keys";
import * as _80 from "./crypto/proof";
import * as _81 from "./types/block";
import * as _82 from "./types/evidence";
import * as _83 from "./types/params";
import * as _84 from "./types/types";
import * as _85 from "./types/validator";
import * as _86 from "./version/types";
export namespace tendermint {
  export const crypto = {
    ..._79,
    ..._80,
  };
  export const types = {
    ..._81,
    ..._82,
    ..._83,
    ..._84,
    ..._85,
  };
  export const version = {
    ..._86,
  };
}
