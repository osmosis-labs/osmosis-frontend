//@ts-nocheck
import * as _86 from "./crypto/keys";
import * as _87 from "./crypto/proof";
import * as _88 from "./types/block";
import * as _89 from "./types/evidence";
import * as _90 from "./types/params";
import * as _91 from "./types/types";
import * as _92 from "./types/validator";
import * as _93 from "./version/types";
export namespace tendermint {
  export const crypto = {
    ..._86,
    ..._87,
  };
  export const types = {
    ..._88,
    ..._89,
    ..._90,
    ..._91,
    ..._92,
  };
  export const version = {
    ..._93,
  };
}
