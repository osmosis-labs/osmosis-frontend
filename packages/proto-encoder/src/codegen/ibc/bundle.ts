import * as _2 from "./applications/fee/v1/ack";
import * as _3 from "./applications/fee/v1/fee";
import * as _4 from "./applications/fee/v1/genesis";
import * as _5 from "./applications/fee/v1/metadata";
import * as _6 from "./applications/fee/v1/query";
import * as _7 from "./applications/fee/v1/tx";
import * as _8 from "./applications/interchain_accounts/controller/v1/controller";
import * as _9 from "./applications/interchain_accounts/controller/v1/query";
import * as _10 from "./applications/interchain_accounts/controller/v1/tx";
import * as _11 from "./applications/interchain_accounts/genesis/v1/genesis";
import * as _12 from "./applications/interchain_accounts/host/v1/host";
import * as _13 from "./applications/interchain_accounts/host/v1/query";
import * as _14 from "./applications/interchain_accounts/v1/account";
import * as _15 from "./applications/interchain_accounts/v1/metadata";
import * as _16 from "./applications/interchain_accounts/v1/packet";
import * as _17 from "./applications/transfer/v1/authz";
import * as _18 from "./applications/transfer/v1/genesis";
import * as _19 from "./applications/transfer/v1/query";
import * as _20 from "./applications/transfer/v1/transfer";
import * as _21 from "./applications/transfer/v1/tx";
import * as _22 from "./applications/transfer/v2/packet";
import * as _23 from "./core/channel/v1/channel";
import * as _24 from "./core/channel/v1/genesis";
import * as _25 from "./core/channel/v1/query";
import * as _26 from "./core/channel/v1/tx";
import * as _27 from "./core/client/v1/client";
import * as _28 from "./core/client/v1/genesis";
import * as _29 from "./core/client/v1/query";
import * as _30 from "./core/client/v1/tx";
import * as _31 from "./core/commitment/v1/commitment";
import * as _32 from "./core/connection/v1/connection";
import * as _33 from "./core/connection/v1/genesis";
import * as _34 from "./core/connection/v1/query";
import * as _35 from "./core/connection/v1/tx";
import * as _36 from "./lightclients/localhost/v2/localhost";
import * as _37 from "./lightclients/solomachine/v2/solomachine";
import * as _38 from "./lightclients/solomachine/v3/solomachine";
import * as _39 from "./lightclients/tendermint/v1/tendermint";
import * as _188 from "./applications/fee/v1/tx.amino";
import * as _189 from "./applications/interchain_accounts/controller/v1/tx.amino";
import * as _190 from "./applications/transfer/v1/tx.amino";
import * as _191 from "./core/channel/v1/tx.amino";
import * as _192 from "./core/client/v1/tx.amino";
import * as _193 from "./core/connection/v1/tx.amino";
import * as _194 from "./applications/fee/v1/tx.registry";
import * as _195 from "./applications/interchain_accounts/controller/v1/tx.registry";
import * as _196 from "./applications/transfer/v1/tx.registry";
import * as _197 from "./core/channel/v1/tx.registry";
import * as _198 from "./core/client/v1/tx.registry";
import * as _199 from "./core/connection/v1/tx.registry";
export namespace ibc {
  export namespace applications {
    export namespace fee {
      export const v1 = {
        ..._2,
        ..._3,
        ..._4,
        ..._5,
        ..._6,
        ..._7,
        ..._188,
        ..._194,
      };
    }
    export namespace interchain_accounts {
      export namespace controller {
        export const v1 = {
          ..._8,
          ..._9,
          ..._10,
          ..._189,
          ..._195,
        };
      }
      export namespace genesis {
        export const v1 = {
          ..._11,
        };
      }
      export namespace host {
        export const v1 = {
          ..._12,
          ..._13,
        };
      }
      export const v1 = {
        ..._14,
        ..._15,
        ..._16,
      };
    }
    export namespace transfer {
      export const v1 = {
        ..._17,
        ..._18,
        ..._19,
        ..._20,
        ..._21,
        ..._190,
        ..._196,
      };
      export const v2 = {
        ..._22,
      };
    }
  }
  export namespace core {
    export namespace channel {
      export const v1 = {
        ..._23,
        ..._24,
        ..._25,
        ..._26,
        ..._191,
        ..._197,
      };
    }
    export namespace client {
      export const v1 = {
        ..._27,
        ..._28,
        ..._29,
        ..._30,
        ..._192,
        ..._198,
      };
    }
    export namespace commitment {
      export const v1 = {
        ..._31,
      };
    }
    export namespace connection {
      export const v1 = {
        ..._32,
        ..._33,
        ..._34,
        ..._35,
        ..._193,
        ..._199,
      };
    }
  }
  export namespace lightclients {
    export namespace localhost {
      export const v2 = {
        ..._36,
      };
    }
    export namespace solomachine {
      export const v2 = {
        ..._37,
      };
      export const v3 = {
        ..._38,
      };
    }
    export namespace tendermint {
      export const v1 = {
        ..._39,
      };
    }
  }
}
