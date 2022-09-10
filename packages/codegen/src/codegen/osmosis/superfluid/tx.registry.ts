import { Coin } from "../../cosmos/base/v1beta1/coin";
import { GeneratedType, Registry } from "@cosmjs/proto-signing";
import { MsgSuperfluidDelegate, MsgSuperfluidUndelegate, MsgSuperfluidUnbondLock, MsgLockAndSuperfluidDelegate, MsgUnPoolWhitelistedPool } from "./tx";
export const registry: ReadonlyArray<[string, GeneratedType]> = [["/osmosis.superfluid.MsgSuperfluidDelegate", MsgSuperfluidDelegate], ["/osmosis.superfluid.MsgSuperfluidUndelegate", MsgSuperfluidUndelegate], ["/osmosis.superfluid.MsgSuperfluidUnbondLock", MsgSuperfluidUnbondLock], ["/osmosis.superfluid.MsgLockAndSuperfluidDelegate", MsgLockAndSuperfluidDelegate], ["/osmosis.superfluid.MsgUnPoolWhitelistedPool", MsgUnPoolWhitelistedPool]];
export const load = (protoRegistry: Registry) => {
  registry.forEach(([typeUrl, mod]) => {
    protoRegistry.register(typeUrl, mod);
  });
};
export const MessageComposer = {
  encoded: {
    superfluidDelegate(value: MsgSuperfluidDelegate) {
      return {
        typeUrl: "/osmosis.superfluid.MsgSuperfluidDelegate",
        value: MsgSuperfluidDelegate.encode(value).finish()
      };
    },

    superfluidUndelegate(value: MsgSuperfluidUndelegate) {
      return {
        typeUrl: "/osmosis.superfluid.MsgSuperfluidUndelegate",
        value: MsgSuperfluidUndelegate.encode(value).finish()
      };
    },

    superfluidUnbondLock(value: MsgSuperfluidUnbondLock) {
      return {
        typeUrl: "/osmosis.superfluid.MsgSuperfluidUnbondLock",
        value: MsgSuperfluidUnbondLock.encode(value).finish()
      };
    },

    lockAndSuperfluidDelegate(value: MsgLockAndSuperfluidDelegate) {
      return {
        typeUrl: "/osmosis.superfluid.MsgLockAndSuperfluidDelegate",
        value: MsgLockAndSuperfluidDelegate.encode(value).finish()
      };
    },

    unPoolWhitelistedPool(value: MsgUnPoolWhitelistedPool) {
      return {
        typeUrl: "/osmosis.superfluid.MsgUnPoolWhitelistedPool",
        value: MsgUnPoolWhitelistedPool.encode(value).finish()
      };
    }

  },
  withTypeUrl: {
    superfluidDelegate(value: MsgSuperfluidDelegate) {
      return {
        typeUrl: "/osmosis.superfluid.MsgSuperfluidDelegate",
        value
      };
    },

    superfluidUndelegate(value: MsgSuperfluidUndelegate) {
      return {
        typeUrl: "/osmosis.superfluid.MsgSuperfluidUndelegate",
        value
      };
    },

    superfluidUnbondLock(value: MsgSuperfluidUnbondLock) {
      return {
        typeUrl: "/osmosis.superfluid.MsgSuperfluidUnbondLock",
        value
      };
    },

    lockAndSuperfluidDelegate(value: MsgLockAndSuperfluidDelegate) {
      return {
        typeUrl: "/osmosis.superfluid.MsgLockAndSuperfluidDelegate",
        value
      };
    },

    unPoolWhitelistedPool(value: MsgUnPoolWhitelistedPool) {
      return {
        typeUrl: "/osmosis.superfluid.MsgUnPoolWhitelistedPool",
        value
      };
    }

  },
  toJSON: {
    superfluidDelegate(value: MsgSuperfluidDelegate) {
      return {
        typeUrl: "/osmosis.superfluid.MsgSuperfluidDelegate",
        value: MsgSuperfluidDelegate.toJSON(value)
      };
    },

    superfluidUndelegate(value: MsgSuperfluidUndelegate) {
      return {
        typeUrl: "/osmosis.superfluid.MsgSuperfluidUndelegate",
        value: MsgSuperfluidUndelegate.toJSON(value)
      };
    },

    superfluidUnbondLock(value: MsgSuperfluidUnbondLock) {
      return {
        typeUrl: "/osmosis.superfluid.MsgSuperfluidUnbondLock",
        value: MsgSuperfluidUnbondLock.toJSON(value)
      };
    },

    lockAndSuperfluidDelegate(value: MsgLockAndSuperfluidDelegate) {
      return {
        typeUrl: "/osmosis.superfluid.MsgLockAndSuperfluidDelegate",
        value: MsgLockAndSuperfluidDelegate.toJSON(value)
      };
    },

    unPoolWhitelistedPool(value: MsgUnPoolWhitelistedPool) {
      return {
        typeUrl: "/osmosis.superfluid.MsgUnPoolWhitelistedPool",
        value: MsgUnPoolWhitelistedPool.toJSON(value)
      };
    }

  },
  fromJSON: {
    superfluidDelegate(value: any) {
      return {
        typeUrl: "/osmosis.superfluid.MsgSuperfluidDelegate",
        value: MsgSuperfluidDelegate.fromJSON(value)
      };
    },

    superfluidUndelegate(value: any) {
      return {
        typeUrl: "/osmosis.superfluid.MsgSuperfluidUndelegate",
        value: MsgSuperfluidUndelegate.fromJSON(value)
      };
    },

    superfluidUnbondLock(value: any) {
      return {
        typeUrl: "/osmosis.superfluid.MsgSuperfluidUnbondLock",
        value: MsgSuperfluidUnbondLock.fromJSON(value)
      };
    },

    lockAndSuperfluidDelegate(value: any) {
      return {
        typeUrl: "/osmosis.superfluid.MsgLockAndSuperfluidDelegate",
        value: MsgLockAndSuperfluidDelegate.fromJSON(value)
      };
    },

    unPoolWhitelistedPool(value: any) {
      return {
        typeUrl: "/osmosis.superfluid.MsgUnPoolWhitelistedPool",
        value: MsgUnPoolWhitelistedPool.fromJSON(value)
      };
    }

  },
  fromPartial: {
    superfluidDelegate(value: MsgSuperfluidDelegate) {
      return {
        typeUrl: "/osmosis.superfluid.MsgSuperfluidDelegate",
        value: MsgSuperfluidDelegate.fromPartial(value)
      };
    },

    superfluidUndelegate(value: MsgSuperfluidUndelegate) {
      return {
        typeUrl: "/osmosis.superfluid.MsgSuperfluidUndelegate",
        value: MsgSuperfluidUndelegate.fromPartial(value)
      };
    },

    superfluidUnbondLock(value: MsgSuperfluidUnbondLock) {
      return {
        typeUrl: "/osmosis.superfluid.MsgSuperfluidUnbondLock",
        value: MsgSuperfluidUnbondLock.fromPartial(value)
      };
    },

    lockAndSuperfluidDelegate(value: MsgLockAndSuperfluidDelegate) {
      return {
        typeUrl: "/osmosis.superfluid.MsgLockAndSuperfluidDelegate",
        value: MsgLockAndSuperfluidDelegate.fromPartial(value)
      };
    },

    unPoolWhitelistedPool(value: MsgUnPoolWhitelistedPool) {
      return {
        typeUrl: "/osmosis.superfluid.MsgUnPoolWhitelistedPool",
        value: MsgUnPoolWhitelistedPool.fromPartial(value)
      };
    }

  }
};