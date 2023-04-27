//@ts-nocheck
/* eslint-disable */
import * as _63 from "./applications/fee/v1/ack";
import * as _64 from "./applications/fee/v1/fee";
import * as _65 from "./applications/fee/v1/genesis";
import * as _66 from "./applications/fee/v1/metadata";
import * as _67 from "./applications/fee/v1/query";
import * as _68 from "./applications/fee/v1/tx";
import * as _69 from "./applications/interchain_accounts/controller/v1/controller";
import * as _70 from "./applications/interchain_accounts/controller/v1/query";
import * as _71 from "./applications/interchain_accounts/controller/v1/tx";
import * as _72 from "./applications/interchain_accounts/genesis/v1/genesis";
import * as _73 from "./applications/interchain_accounts/host/v1/host";
import * as _74 from "./applications/interchain_accounts/host/v1/query";
import * as _75 from "./applications/interchain_accounts/v1/account";
import * as _76 from "./applications/interchain_accounts/v1/metadata";
import * as _77 from "./applications/interchain_accounts/v1/packet";
import * as _78 from "./applications/transfer/v1/authz";
import * as _79 from "./applications/transfer/v1/genesis";
import * as _80 from "./applications/transfer/v1/query";
import * as _81 from "./applications/transfer/v1/transfer";
import * as _82 from "./applications/transfer/v1/tx";
import * as _83 from "./applications/transfer/v2/packet";
import * as _84 from "./core/channel/v1/channel";
import * as _85 from "./core/channel/v1/genesis";
import * as _86 from "./core/channel/v1/query";
import * as _87 from "./core/channel/v1/tx";
import * as _88 from "./core/client/v1/client";
import * as _89 from "./core/client/v1/genesis";
import * as _90 from "./core/client/v1/query";
import * as _91 from "./core/client/v1/tx";
import * as _92 from "./core/commitment/v1/commitment";
import * as _93 from "./core/connection/v1/connection";
import * as _94 from "./core/connection/v1/genesis";
import * as _95 from "./core/connection/v1/query";
import * as _96 from "./core/connection/v1/tx";
import * as _97 from "./lightclients/localhost/v2/localhost";
import * as _98 from "./lightclients/solomachine/v2/solomachine";
import * as _99 from "./lightclients/solomachine/v3/solomachine";
import * as _100 from "./lightclients/tendermint/v1/tendermint";
import * as _203 from "./applications/fee/v1/tx.amino";
import * as _204 from "./applications/interchain_accounts/controller/v1/tx.amino";
import * as _205 from "./applications/transfer/v1/tx.amino";
import * as _206 from "./core/channel/v1/tx.amino";
import * as _207 from "./core/client/v1/tx.amino";
import * as _208 from "./core/connection/v1/tx.amino";
import * as _209 from "./applications/fee/v1/tx.registry";
import * as _210 from "./applications/interchain_accounts/controller/v1/tx.registry";
import * as _211 from "./applications/transfer/v1/tx.registry";
import * as _212 from "./core/channel/v1/tx.registry";
import * as _213 from "./core/client/v1/tx.registry";
import * as _214 from "./core/connection/v1/tx.registry";
export namespace ibc {
  export namespace applications {
    export namespace fee {
      export const v1 = {
        ..._63,
        ..._64,
        ..._65,
        ..._66,
        ..._67,
        ..._68,
        ..._203,
        ..._209,
      };
    }
    export namespace interchain_accounts {
      export namespace controller {
        export const v1 = {
          ..._69,
          ..._70,
          ..._71,
          ..._204,
          ..._210,
        };
      }
      export namespace genesis {
        export const v1 = {
          ..._72,
        };
      }
      export namespace host {
        export const v1 = {
          ..._73,
          ..._74,
        };
      }
      export const v1 = {
        ..._75,
        ..._76,
        ..._77,
      };
    }
    export namespace transfer {
      export const v1 = {
        ..._78,
        ..._79,
        ..._80,
        ..._81,
        ..._82,
        ..._205,
        ..._211,
      };
      export const v2 = {
        ..._83,
      };
    }
  }
  export namespace core {
    export namespace channel {
      export const v1 = {
        ..._84,
        ..._85,
        ..._86,
        ..._87,
        ..._206,
        ..._212,
      };
    }
    export namespace client {
      export const v1 = {
        ..._88,
        ..._89,
        ..._90,
        ..._91,
        ..._207,
        ..._213,
      };
    }
    export namespace commitment {
      export const v1 = {
        ..._92,
      };
    }
    export namespace connection {
      export const v1 = {
        ..._93,
        ..._94,
        ..._95,
        ..._96,
        ..._208,
        ..._214,
      };
    }
  }
  export namespace lightclients {
    export namespace localhost {
      export const v2 = {
        ..._97,
      };
    }
    export namespace solomachine {
      export const v2 = {
        ..._98,
      };
      export const v3 = {
        ..._99,
      };
    }
    export namespace tendermint {
      export const v1 = {
        ..._100,
      };
    }
  }
}
