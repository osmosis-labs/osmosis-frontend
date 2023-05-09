//@ts-nocheck
import * as _0 from "./applications/transfer/v1/authz";
import * as _1 from "./applications/transfer/v1/genesis";
import * as _2 from "./applications/transfer/v1/query";
import * as _3 from "./applications/transfer/v1/transfer";
import * as _4 from "./applications/transfer/v1/tx";
import * as _81 from "./applications/transfer/v1/tx.amino";
import * as _83 from "./applications/transfer/v1/tx.registry";
import * as _5 from "./applications/transfer/v2/packet";
import * as _6 from "./core/client/v1/client";
import * as _7 from "./core/client/v1/genesis";
import * as _8 from "./core/client/v1/query";
import * as _9 from "./core/client/v1/tx";
import * as _82 from "./core/client/v1/tx.amino";
import * as _84 from "./core/client/v1/tx.registry";
export namespace ibc {
  export namespace applications {
    export namespace transfer {
      export const v1 = {
        ..._0,
        ..._1,
        ..._2,
        ..._3,
        ..._4,
        ..._81,
        ..._83,
      };
      export const v2 = {
        ..._5,
      };
    }
  }
  export namespace core {
    export namespace client {
      export const v1 = {
        ..._6,
        ..._7,
        ..._8,
        ..._9,
        ..._82,
        ..._84,
      };
    }
  }
}
