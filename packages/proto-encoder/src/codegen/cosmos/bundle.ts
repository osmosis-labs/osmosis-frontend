import * as _121 from "../proofs";
import * as _122 from "./auth/v1beta1/auth";
import * as _123 from "./auth/v1beta1/genesis";
import * as _124 from "./auth/v1beta1/query";
import * as _125 from "./authz/v1beta1/authz";
import * as _126 from "./authz/v1beta1/event";
import * as _127 from "./authz/v1beta1/genesis";
import * as _128 from "./authz/v1beta1/query";
import * as _129 from "./authz/v1beta1/tx";
import * as _224 from "./authz/v1beta1/tx.amino";
import * as _231 from "./authz/v1beta1/tx.registry";
import * as _130 from "./bank/v1beta1/authz";
import * as _131 from "./bank/v1beta1/bank";
import * as _132 from "./bank/v1beta1/genesis";
import * as _133 from "./bank/v1beta1/query";
import * as _134 from "./bank/v1beta1/tx";
import * as _225 from "./bank/v1beta1/tx.amino";
import * as _232 from "./bank/v1beta1/tx.registry";
import * as _135 from "./base/abci/v1beta1/abci";
import * as _136 from "./base/query/v1beta1/pagination";
import * as _137 from "./base/reflection/v2alpha1/reflection";
import * as _138 from "./base/v1beta1/coin";
import * as _139 from "./crypto/ed25519/keys";
import * as _140 from "./crypto/hd/v1/hd";
import * as _141 from "./crypto/keyring/v1/record";
import * as _142 from "./crypto/multisig/keys";
import * as _143 from "./crypto/secp256k1/keys";
import * as _144 from "./crypto/secp256r1/keys";
import * as _145 from "./distribution/v1beta1/distribution";
import * as _146 from "./distribution/v1beta1/genesis";
import * as _147 from "./distribution/v1beta1/query";
import * as _148 from "./distribution/v1beta1/tx";
import * as _226 from "./distribution/v1beta1/tx.amino";
import * as _233 from "./distribution/v1beta1/tx.registry";
import * as _149 from "./gov/v1/genesis";
import * as _150 from "./gov/v1/gov";
import * as _151 from "./gov/v1/query";
import * as _152 from "./gov/v1/tx";
import * as _227 from "./gov/v1/tx.amino";
import * as _234 from "./gov/v1/tx.registry";
import * as _153 from "./gov/v1beta1/genesis";
import * as _154 from "./gov/v1beta1/gov";
import * as _155 from "./gov/v1beta1/query";
import * as _156 from "./gov/v1beta1/tx";
import * as _228 from "./gov/v1beta1/tx.amino";
import * as _235 from "./gov/v1beta1/tx.registry";
import * as _120 from "./ics23/v1/proofs";
import * as _157 from "./staking/v1beta1/authz";
import * as _158 from "./staking/v1beta1/genesis";
import * as _159 from "./staking/v1beta1/query";
import * as _160 from "./staking/v1beta1/staking";
import * as _161 from "./staking/v1beta1/tx";
import * as _229 from "./staking/v1beta1/tx.amino";
import * as _236 from "./staking/v1beta1/tx.registry";
import * as _162 from "./tx/signing/v1beta1/signing";
import * as _163 from "./tx/v1beta1/service";
import * as _164 from "./tx/v1beta1/tx";
import * as _165 from "./upgrade/v1beta1/query";
import * as _166 from "./upgrade/v1beta1/tx";
import * as _230 from "./upgrade/v1beta1/tx.amino";
import * as _237 from "./upgrade/v1beta1/tx.registry";
import * as _167 from "./upgrade/v1beta1/upgrade";
export namespace cosmos {
  export namespace ics23 {
    export const v1 = {
      ..._120,
      ..._121,
    };
  }
  export namespace auth {
    export const v1beta1 = {
      ..._122,
      ..._123,
      ..._124,
    };
  }
  export namespace authz {
    export const v1beta1 = {
      ..._125,
      ..._126,
      ..._127,
      ..._128,
      ..._129,
      ..._224,
      ..._231,
    };
  }
  export namespace bank {
    export const v1beta1 = {
      ..._130,
      ..._131,
      ..._132,
      ..._133,
      ..._134,
      ..._225,
      ..._232,
    };
  }
  export namespace base {
    export namespace abci {
      export const v1beta1 = {
        ..._135,
      };
    }
    export namespace query {
      export const v1beta1 = {
        ..._136,
      };
    }
    export namespace reflection {
      export const v2alpha1 = {
        ..._137,
      };
    }
    export const v1beta1 = {
      ..._138,
    };
  }
  export namespace crypto {
    export const ed25519 = {
      ..._139,
    };
    export namespace hd {
      export const v1 = {
        ..._140,
      };
    }
    export namespace keyring {
      export const v1 = {
        ..._141,
      };
    }
    export const multisig = {
      ..._142,
    };
    export const secp256k1 = {
      ..._143,
    };
    export const secp256r1 = {
      ..._144,
    };
  }
  export namespace distribution {
    export const v1beta1 = {
      ..._145,
      ..._146,
      ..._147,
      ..._148,
      ..._226,
      ..._233,
    };
  }
  export namespace gov {
    export const v1 = {
      ..._149,
      ..._150,
      ..._151,
      ..._152,
      ..._227,
      ..._234,
    };
    export const v1beta1 = {
      ..._153,
      ..._154,
      ..._155,
      ..._156,
      ..._228,
      ..._235,
    };
  }
  export namespace staking {
    export const v1beta1 = {
      ..._157,
      ..._158,
      ..._159,
      ..._160,
      ..._161,
      ..._229,
      ..._236,
    };
  }
  export namespace tx {
    export namespace signing {
      export const v1beta1 = {
        ..._162,
      };
    }
    export const v1beta1 = {
      ..._163,
      ..._164,
    };
  }
  export namespace upgrade {
    export const v1beta1 = {
      ..._165,
      ..._166,
      ..._167,
      ..._230,
      ..._237,
    };
  }
}
