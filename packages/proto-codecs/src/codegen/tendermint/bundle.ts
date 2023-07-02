//@ts-nocheck
import * as _80 from "./crypto/keys";
import * as _81 from "./crypto/proof";
import * as _82 from "./types/block";
import * as _83 from "./types/evidence";
import * as _84 from "./types/params";
import * as _85 from "./types/types";
import * as _86 from "./types/validator";
import * as _87 from "./version/types";
export namespace tendermint {
  export const crypto = {
    ..._80,
    ..._81,
  };
  export const types = {
    ..._82,
    ..._83,
    ..._84,
    ..._85,
    ..._86,
  };
  export const version = {
    ..._87,
  };
}
